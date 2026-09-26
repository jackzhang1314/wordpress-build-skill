import {createHash} from 'node:crypto';
import {existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {basename, extname, join, resolve} from 'node:path';
import {shellQuote} from './ssh.mjs';
import {projectFile} from './config.mjs';

export function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

export function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

export function safeName(value) {
  return String(value).replace(/[^A-Za-z0-9._-]/g, '-');
}

function readRemoteFileTree(ssh, command, options, logger, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return ssh.run(command, options);
    } catch (error) {
      lastError = error;
      // A fresh Hostinger install can keep writing plugin files after its website is listed.
      if (!/file changed as we read it/i.test(error.message) || attempt === attempts) break;
      logger(`  WARN  remote files changed during backup; retrying (${attempt + 1}/${attempts})`);
    }
  }
  throw lastError;
}

export function backupProject(projectRoot, project, ssh, logger = () => {}) {
  const backupDir = join(projectRoot, '.backups', timestamp());
  mkdirSync(backupDir, {recursive: true});
  const wpPath = shellQuote(project.ssh.wpPath);
  const files = readRemoteFileTree(
    ssh,
    `tar -cf - -C ${wpPath}/wp-content themes plugins`,
    {encoding: 'buffer', timeout: 300000, maxBuffer: 512 * 1024 * 1024},
    logger,
  );
  writeFileSync(join(backupDir, 'themes-plugins.tar'), files);
  const wpConfig = shellQuote(project.ssh.wpPath);
  const dumpCommand = [
    `WP=${wpConfig}`,
    'DB_NAME=$(wp config get DB_NAME --path=$WP)',
    'DB_USER=$(wp config get DB_USER --path=$WP)',
    'DB_PASSWORD=$(wp config get DB_PASSWORD --path=$WP)',
    'DB_HOST=$(wp config get DB_HOST --path=$WP)',
    'MYSQL_PWD="$DB_PASSWORD" mysqldump --host=$DB_HOST --user=$DB_USER --single-transaction --quick --no-tablespaces $DB_NAME | gzip',
  ].join('; ');
  const database = ssh.run(dumpCommand, {encoding: 'buffer', timeout: 300000, maxBuffer: 512 * 1024 * 1024});
  writeFileSync(join(backupDir, 'database.sql.gz'), database);
  const manifest = {
    id: basename(backupDir),
    createdAt: new Date().toISOString(),
    domain: project.domain,
    files: {size: files.length, sha256: sha256(files)},
    database: {size: database.length, sha256: sha256(database)},
  };
  writeFileSync(join(backupDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  logger(`  ✅ Backup ${manifest.id} (files ${files.length} bytes, DB ${database.length} bytes)`);
  return {backupDir, manifest};
}

export function restoreFiles(project, ssh, backupDir, logger = () => {}) {
  const archive = join(backupDir, 'themes-plugins.tar');
  if (!existsSync(archive)) throw new Error(`Backup archive not found: ${archive}`);
  const input = readFileSync(archive);
  ssh.run('mkdir -p ' + shellQuote(project.ssh.wpPath + '/wp-content'));
  ssh.run(`tar -xf - -C ${shellQuote(project.ssh.wpPath + '/wp-content')}`, {input, encoding: 'buffer', maxBuffer: 512 * 1024 * 1024});
  ssh.wp(['cache', 'flush']);
  ssh.wp(['rewrite', 'flush']);
  logger('  ✅ Theme/plugin rollback restored');
}

export async function syncCode(projectRoot, project, ssh, logger = () => {}) {
  const themePath = projectFile(projectRoot, project.paths.theme);
  const pluginPath = projectFile(projectRoot, project.paths.plugin);
  if (!existsSync(themePath) || !existsSync(pluginPath)) throw new Error('theme/ and plugin/ directories are required');
  ssh.run(`mkdir -p ${shellQuote(project.ssh.wpPath + '/wp-content/themes/' + project.theme)}`);
  ssh.run(`mkdir -p ${shellQuote(project.ssh.wpPath + '/wp-content/plugins/' + project.plugin)}`);
  ssh.rsync(themePath, `${project.ssh.wpPath}/wp-content/themes/${project.theme}`, {delete: true});
  ssh.rsync(pluginPath, `${project.ssh.wpPath}/wp-content/plugins/${project.plugin}`, {delete: true});
  ssh.run([
    `if [ -f ${shellQuote(`${project.ssh.wpPath}/wp-content/themes/${project.theme}/mu-plugins/smtp.php`)} ]; then`,
    `mkdir -p ${shellQuote(`${project.ssh.wpPath}/wp-content/mu-plugins`)}`,
    `cp ${shellQuote(`${project.ssh.wpPath}/wp-content/themes/${project.theme}/mu-plugins/smtp.php`)} ${shellQuote(`${project.ssh.wpPath}/wp-content/mu-plugins/starter-smtp.php`)}`,
    'fi',
  ].join(' '));
  ssh.wp(['theme', 'activate', project.theme]);
  ssh.wp(['plugin', 'activate', project.plugin]);
  ssh.wp(['rewrite', 'flush']);
  logger('  ✅ Theme/plugin synced and activated');
}

export function configureWordPress(project, ssh, logger = () => {}) {
  if (!project.ssh) throw new Error('SSH configuration is required to configure WordPress');
  ssh.wp(['option', 'update', 'blogname', project.title]);
  ssh.wp(['option', 'update', 'blogdescription', project.description || '']);
  if (project.timezone) {
    ssh.wp(['option', 'update', 'timezone_string', project.timezone]);
  }
  ssh.wp(['option', 'update', 'permalink_structure', '/%postname%/']);
  ssh.wp(['option', 'update', 'default_comment_status', 'closed']);
  ssh.wp(['option', 'update', 'default_ping_status', 'closed']);
  ssh.wp(['rewrite', 'flush']);
  ssh.wp(['cache', 'flush']);
  logger('  OK  WordPress core options configured');
  return {pass: true};
}

export async function syncRemotePlugins(project, ssh, logger = () => {}) {
  const installed = JSON.parse(ssh.wp(['plugin', 'list', '--format=json']));
  const find = name => installed.find(plugin => plugin.name === name);
  for (const name of project.requiredPlugins) {
    const plugin = find(name);
    if (!plugin) ssh.wp(['plugin', 'install', name, '--activate']);
    else if (plugin.status !== 'active') ssh.wp(['plugin', 'activate', name]);
  }
  for (const name of project.disabledPlugins) {
    const plugin = find(name);
    if (plugin?.status === 'active') ssh.wp(['plugin', 'deactivate', name]);
  }
  logger(`  ✅ Plugins ready (${project.requiredPlugins.join(', ')})`);
}

export async function installBuilderCore(projectRoot, project, ssh, {
  sourceDir,
  backup = true,
  withAcf = true,
  logger = () => {},
} = {}) {
  if (!sourceDir) throw new Error('WordPress Builder Core sourceDir is required');
  if (!existsSync(join(sourceDir, 'wordpress-builder-core.php'))) {
    throw new Error(`WordPress Builder Core source not found: ${sourceDir}`);
  }

  let backupResult;
  if (backup) {
    backupResult = backupProject(projectRoot, project, ssh, logger);
  }

  const installed = JSON.parse(ssh.wp(['plugin', 'list', '--format=json']));
  const acf = installed.find(plugin => plugin.name === 'advanced-custom-fields');
  if (!acf) {
    if (withAcf) ssh.wp(['plugin', 'install', 'advanced-custom-fields', '--activate']);
  } else if (acf.status !== 'active') {
    ssh.wp(['plugin', 'activate', 'advanced-custom-fields']);
  }

  const remotePath = `${project.ssh.wpPath}/wp-content/plugins/wordpress-builder-core`;
  ssh.rsync(sourceDir, remotePath, {delete: true});
  ssh.wp(['plugin', 'activate', 'wordpress-builder-core']);
  ssh.wp(['rewrite', 'flush']);

  const registered = JSON.parse(ssh.wp(['post-type', 'list', '--format=json']));
  if (!Array.isArray(registered) || !registered.some(item => item.name === 'builder_project')) {
    throw new Error('WordPress Builder Core verification failed: builder_project is not registered');
  }

  logger('  ✅ WordPress Builder Core installed and activated');
  return {
    pass: true,
    plugin: 'wordpress-builder-core',
    acfInstalled: withAcf,
    backup: backupResult?.manifest,
  };
}

export async function importMedia(projectRoot, project, ssh, {force = false, logger = () => {}} = {}) {
  const mapPath = join(projectRoot, 'content', 'media-map.json');
  const hasMap = existsSync(mapPath);
  if (hasMap && !force) {
    logger('  ✅ Media map already exists');
    return JSON.parse(readFileSync(mapPath, 'utf8'));
  }
  // --with-media refreshes missing entries; existing keys are never re-imported (no duplicate attachments).
  const map = hasMap ? JSON.parse(readFileSync(mapPath, 'utf8')) : {};
  const staging = `/tmp/${project.slug}-media`;
  ssh.run(`rm -rf ${shellQuote(staging)} && mkdir -p ${shellQuote(staging)}`);
  const extensions = /\.(jpe?g|png|webp|gif|pdf)$/i;
  for (const source of project.media.sources) {
    const local = projectFile(projectRoot, source.path);
    if (!existsSync(local)) throw new Error(`Media source not found: ${local}`);
    ssh.rsync(local, staging + '/' + source.name);
    for (const file of readdirSync(local).filter(file => extensions.test(file)).sort()) {
      const key = basename(file, extname(file));
      if (map[key]) {
        logger(`    ${key}: already imported (${map[key]})`);
        continue;
      }
      const output = ssh.wp(['media', 'import', `${staging}/${source.name}/${safeName(file)}`, '--title=' + key, '--porcelain']).trim();
      const id = Number(output.split('\n').pop());
      if (!Number.isInteger(id) || id <= 0) throw new Error(`Media import failed for ${file}: ${output}`);
      map[key] = id;
      logger(`    ${key}: ${id}`);
    }
  }
  mkdirSync(join(projectRoot, 'content'), {recursive: true});
  writeFileSync(mapPath, JSON.stringify(map, null, 2) + '\n');
  logger(`  ✅ Imported ${Object.keys(map).length} media items`);
  return map;
}

export async function seedContent(projectRoot, project, ssh, logger = () => {}, {rebuildNav = true} = {}) {
  if (!project.seed.enabled) throw new Error('Seed is disabled in project.json');
  const script = projectFile(projectRoot, project.seed.script);
  const data = projectFile(projectRoot, project.seed.data);
  const mediaMap = join(projectRoot, 'content', 'media-map.json');
  for (const file of [script, data, mediaMap]) if (!existsSync(file)) throw new Error(`Content seed input missing: ${file}`);
  const staging = `/tmp/${project.slug}-seed`;
  ssh.run(`rm -rf ${shellQuote(staging)} && mkdir -p ${shellQuote(staging)}`);
  // Transfer each file through an atomic tar stream without exposing project paths.
  const files = [
    {path: script, name: 'seed.php'},
    {path: data, name: 'site-data.json'},
    {path: mediaMap, name: 'media-map.json'},
  ];
  // Use a temporary manifest created by tar itself; filenames are quoted individually.
    const tarFile = join(projectRoot, '.deploy-staging', 'seed-files.txt');
  mkdirSync(join(projectRoot, '.deploy-staging'), {recursive: true});
  writeFileSync(tarFile, files.map(file => `${relativeSafe(projectRoot, file.path)}\n`).join(''));
  const {execFileSync} = await import('node:child_process');
  const tar = execFileSync('tar', ['-cf', '-', '-C', projectRoot, '--files-from', tarFile], {encoding: 'buffer', maxBuffer: 64 * 1024 * 1024});
  ssh.run(`tar -xf - -C ${shellQuote(staging)}`, {input: tar, encoding: 'buffer', maxBuffer: 64 * 1024 * 1024});
  ssh.run([
    `mv ${shellQuote(staging + '/scripts/seed.php')} ${shellQuote(staging + '/seed.php')}`,
    `mv ${shellQuote(staging + '/content/site-data.json')} ${shellQuote(staging + '/site-data.json')}`,
    `mv ${shellQuote(staging + '/content/media-map.json')} ${shellQuote(staging + '/media-map.json')}`,
  ].join(' && '));
  const navPolicy = rebuildNav ? 'true' : 'false';
  const output = ssh.wp(['eval-file', `${staging}/seed.php`, `${staging}/media-map.json`, `${staging}/site-data.json`, navPolicy]);
  logger(output.trim());
  ssh.wp(['cache', 'flush']);
  ssh.wp(['rewrite', 'flush']);
  writeFileSync(join(projectRoot, '.seed-state.json'), JSON.stringify({seededAt: new Date().toISOString()}, null, 2));
  logger('  ✅ Content seed complete');
}

function relativeSafe(root, path) {
  return resolve(path).startsWith(resolve(root)) ? resolve(path).slice(resolve(root).length + 1) : basename(path);
}

export function clearHostingerCache(project, {execFile} = {}) {
  if (!project.hostinger?.user) return {pass: false, detail: 'Hostinger user not configured'};
  try {
    execFile('hostinger', ['hosting', 'cache', 'clear-website', project.hostinger.user, project.domain, '--format', 'json'], {
      encoding: 'utf8', timeout: 30000, maxBuffer: 1024 * 1024, stdio: ['pipe', 'pipe', 'pipe'],
    });
    return {pass: true, detail: 'cleared'};
  } catch (error) {
    return {pass: false, detail: error.message};
  }
}

export function cleanupTemp(root) {
  rmSync(root, {recursive: true, force: true});
}
