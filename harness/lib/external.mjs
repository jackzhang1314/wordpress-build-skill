import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {execFileSync as defaultExec} from 'node:child_process';
import {join, resolve} from 'node:path';
import {slugify} from './config.mjs';
import {createSSH} from './ssh.mjs';
import {discoverHostingerWebsite, setupProjectSsh} from './ssh-setup.mjs';

function safeJson(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

/**
 * Create a remote-only project for a site that already exists on Hostinger.
 * External projects intentionally have no local theme/plugin source: code deployment
 * is blocked so the Harness can never overwrite the customer's live implementation.
 */
export async function adoptExternalSite({
  name, projectsRoot, domain, order, git = true,
}, {
  exec = defaultExec,
  setup = setupProjectSsh,
  discover = discoverHostingerWebsite,
  openUrl,
  logger = () => {},
  setupArgs = [],
} = {}) {
  const slug = slugify(name);
  if (!slug || slug !== name) throw new Error('Project name must already be kebab-case (a-z, 0-9, hyphen).');
  if (!domain) throw new Error('Adopting a site requires --domain');
  const root = resolve(projectsRoot, slug);
  if (existsSync(root)) throw new Error(`Project already exists: ${root}`);

  let website;
  try {
    website = discover(domain);
  } catch (error) {
    if (!order) logger(`  WARN  Hostinger website discovery failed: ${error.message}`);
  }
  const hostingerUser = website?.username;
  const orderId = order ?? website?.order_id;

  mkdirSync(root, {recursive: true});
  mkdirSync(join(root, 'content'), {recursive: true});
  const project = {
    title: name,
    slug,
    mode: 'external',
    sourceProfile: 'custom',
    type: 'wordpress-existing',
    domain,
    theme: 'unknown',
    plugin: 'external',
    livePages: ['/'],
    contentMarkers: [],
    contentCounts: [],
    requiredPlugins: [],
    disabledPlugins: [],
    media: {sources: []},
    seed: {enabled: false, script: 'scripts/seed.php', data: 'content/site-data.json'},
    paths: {theme: 'theme', plugin: 'plugin', content: 'content'},
  };
  if (hostingerUser || orderId) {
    project.hostinger = {};
    if (hostingerUser) project.hostinger.user = hostingerUser;
    if (orderId) project.hostinger.order = Number(orderId);
  }
  writeJson(join(root, 'project.json'), project);
  writeJson(join(root, 'content/site-data.json'), {terms: [], pages: []});
  writeFileSync(join(root, '.gitignore'), [
    '.backups/', '.deploy-staging/', '.wordpress-builder/', '.DS_Store', 'node_modules/',
    '*.log', '*.env', '!*.example.env', '.seed-state.json', '.content-state.json', '.deploy-state.json',
  ].join('\n') + '\n');

  const setupReport = await setup(root, project, ['--account-key', ...setupArgs], {
    exec,
    openUrl,
    logger,
  });
  if (!setupReport.pass) {
    return {root, setupReport, pass: false, next: setupReport.next};
  }

  const updated = JSON.parse(readFileSync(join(root, 'project.json'), 'utf8'));
  const ssh = createSSH(updated, {execFile: exec});
  const cli = args => ssh.wp(args).trim();
  const siteUrl = cli(['option', 'get', 'siteurl']);
  const blogname = cli(['option', 'get', 'blogname']);
  const wpVersion = cli(['core', 'version']);
  const activeTheme = cli(['theme', 'list', '--status=active', '--field=name']);
  const plugins = JSON.parse(cli(['plugin', 'list', '--format=json'])).map(plugin => plugin.name);
  const timezone = cli(['option', 'get', 'timezone_string']);
  const shape = await inspectRemoteWordPress(updated, {exec});
  updated.title = blogname || name;
  updated.theme = activeTheme;
  updated.remote = {
    siteUrl, wpVersion, activeTheme, plugins,
    themeType: shape.themeType,
    navigation: shape.navigation,
    pageTemplates: shape.pageTemplates,
    publicPostTypes: shape.publicPostTypes,
    publicTaxonomies: shape.publicTaxonomies,
    menus: shape.menus,
    forms: shape.forms,
    counts: shape.counts,
    inspectedAt: new Date().toISOString(),
  };
  if (timezone) updated.timezone = timezone;
  writeJson(join(root, 'project.json'), updated);

  if (git) exec('git', ['init', '-b', 'main'], {
    cwd: root, encoding: 'utf8', timeout: 30000, stdio: ['pipe', 'pipe', 'pipe'],
  });
  return {
    pass: true, root, setupReport,
    remote: updated.remote,
    next: 'Use edit-page, post push, nav add/remove, template assign, backup and status. `deploy` is blocked in external mode.',
  };
}

function parseCount(value) {
  const count = Number(String(value || '').trim());
  return Number.isFinite(count) && count >= 0 ? count : 0;
}

function normalizeMenus(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map(row => ({
    id: Number(row.term_id ?? row.ID ?? row.id ?? 0),
    name: String(row.name ?? row.title ?? ''),
    slug: String(row.slug ?? ''),
    locations: Array.isArray(row.locations) ? row.locations.map(String) : [],
  })).filter(menu => menu.slug);
}

function inferWordPressShape({themeInfo, menus, pageTemplates, navigationPostCount}) {
  const isBlockTheme = themeInfo?.is_block_theme === true;
  const hasAssignedClassicMenu = menus.some(menu => (menu.locations ?? []).length > 0);
  const hasBlockNavigation = Number(navigationPostCount) > 0;
  let navigation = 'unknown';
  if (hasAssignedClassicMenu && hasBlockNavigation) navigation = 'mixed';
  else if (hasAssignedClassicMenu) navigation = 'classic-menu';
  else if (hasBlockNavigation) navigation = 'block-navigation';

  const classicTemplates = Object.keys(pageTemplates || {});
  let pageTemplatesMode;
  if (isBlockTheme && classicTemplates.length) pageTemplatesMode = 'mixed';
  else if (isBlockTheme) pageTemplatesMode = 'fse';
  else if (classicTemplates.length) pageTemplatesMode = 'classic';
  else pageTemplatesMode = 'none';

  return {
    themeType: isBlockTheme ? 'block' : 'classic',
    navigation,
    pageTemplates: pageTemplatesMode,
  };
}

/** Read-only WordPress inspection used to route content/design operations by real site shape. */
export async function inspectRemoteWordPress(project, {exec = defaultExec} = {}) {
  const ssh = createSSH(project, {execFile: exec});
  const wp = args => ssh.wp(args).trim();
  const themeRows = safeJson(wp(['theme', 'list', '--status=active', '--format=json']), []);
  const themeInfo = Array.isArray(themeRows) ? themeRows[0] : {};
  const pluginRows = safeJson(wp(['plugin', 'list', '--format=json']), []);
  const plugins = Array.isArray(pluginRows) ? pluginRows.map(plugin => String(plugin.name)) : [];
  const menus = normalizeMenus(safeJson(wp(['menu', 'list', '--fields=term_id,name,slug,locations', '--format=json']), []));
  const navigationPostCount = parseCount(wp(['post', 'list', '--post_type=wp_navigation', '--post_status=publish', '--format=count']));
  const pageTemplates = safeJson(wp(['eval', 'echo wp_json_encode(wp_get_theme()->get_page_templates());']), {});
  const postTypeRows = safeJson(wp(['post-type', 'list', '--public=1', '--format=json']), []);
  const taxonomyRows = safeJson(wp(['taxonomy', 'list', '--public=1', '--format=json']), []);
  const shape = inferWordPressShape({themeInfo, menus, pageTemplates, navigationPostCount});
  const fluentform = plugins.includes('fluentform');
  return {
    wordpressVersion: wp(['core', 'version']),
    activeTheme: themeInfo?.name || '',
    plugins,
    ...shape,
    publicPostTypes: Array.isArray(postTypeRows) ? postTypeRows.map(row => String(row.name)) : [],
    publicTaxonomies: Array.isArray(taxonomyRows) ? taxonomyRows.map(row => String(row.name)) : [],
    menus,
    pageTemplates: shape.pageTemplates,
    classicPageTemplates: pageTemplates,
    forms: {fluentform},
    counts: {
      pages: parseCount(wp(['post', 'list', '--post_type=page', '--post_status=publish', '--format=count'])),
      posts: parseCount(wp(['post', 'list', '--post_type=post', '--post_status=publish', '--format=count'])),
      media: parseCount(wp(['post', 'list', '--post_type=attachment', '--post_status=any', '--format=count'])),
      blockNavigationPosts: navigationPostCount,
    },
    inspectedAt: new Date().toISOString(),
  };
}

/** Safety checks for remote-only projects. These never assume Starter files or content types. */
export async function auditExternalSite({ssh, base}, {fetchImpl = globalThis.fetch} = {}) {
  const checks = [];
  let wpVersion = '';
  try {
    wpVersion = ssh.wp(['core', 'version']).trim();
    checks.push({name: 'wp-cli', pass: Boolean(wpVersion), detail: wpVersion});
  } catch (error) {
    checks.push({name: 'wp-cli', pass: false, detail: error.message});
  }

  let activeTheme = '';
  let plugins = [];
  try {
    activeTheme = ssh.wp(['theme', 'list', '--status=active', '--field=name']).trim();
    plugins = JSON.parse(ssh.wp(['plugin', 'list', '--format=json'])).map(plugin => plugin.name);
    checks.push(
      {name: 'active-theme', pass: Boolean(activeTheme), detail: activeTheme},
      {name: 'plugins', pass: Array.isArray(plugins), detail: plugins.join(', ')},
    );
  } catch (error) {
    checks.push({name: 'remote-inventory', pass: false, detail: error.message});
  }

  let httpCode = 0;
  try {
    const response = await fetchImpl(base);
    httpCode = response.status;
    checks.push({name: 'homepage', pass: response.ok, detail: `HTTP ${response.status}`});
  } catch (error) {
    checks.push({name: 'homepage', pass: false, detail: error.message});
  }

  return {
    pass: checks.every(check => check.pass),
    mode: 'external',
    wpVersion, activeTheme, plugins, httpCode,
    gates: [{name: 'external-site', checks}],
  };
}
