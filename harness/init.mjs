import {cpSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {dirname} from 'node:path';
import {slugify} from './lib/config.mjs';

const moduleDir = dirname(fileURLToPath(import.meta.url));
const referenceDir = resolve(moduleDir, '../.agents/skills/wordpress-builder/assets/php-reference');

function copyDir(from, to) {
  mkdirSync(to, {recursive: true});
  cpSync(from, to, {recursive: true});
}

function replaceRecursive(root, replacements) {
  for (const entry of readdirSync(root, {withFileTypes: true})) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) replaceRecursive(path, replacements);
    else if (/\.(php|css|js|json|md)$/.test(entry.name)) {
      const content = readFileSync(path, 'utf8');
      const replaced = Object.entries(replacements).reduce((text, [from, to]) => text.replaceAll(from, to), content);
      writeFileSync(path, replaced);
    }
  }
}

export function initProject({name, projectsRoot, git = true, reference = referenceDir}) {
  const slug = slugify(name);
  if (!slug || slug !== name) throw new Error('Project name must already be kebab-case (a-z, 0-9, hyphen).');
  const root = resolve(projectsRoot, slug);
  if (existsSync(root)) throw new Error(`Project already exists: ${root}`);
  if (!existsSync(join(reference, 'theme/functions.php')) || !existsSync(join(reference, 'plugin/site-model.php'))) {
    throw new Error(`PHP reference template not found: ${reference}`);
  }

  mkdirSync(join(root, 'content'), {recursive: true});
  mkdirSync(join(root, 'docs', 'acceptance'), {recursive: true});
  mkdirSync(join(root, 'docs', 'process'), {recursive: true});
  mkdirSync(join(root, 'docs', 'research'), {recursive: true});
  mkdirSync(join(root, 'docs', 'media', 'products'), {recursive: true});
  mkdirSync(join(root, '.wordpress-builder'), {recursive: true});

  const themeSlug = `${slug}-theme`;
  const pluginSlug = `${slug}-model`;
  copyDir(join(reference, 'theme'), join(root, 'theme'));
  rmSync(join(root, 'theme/theme.json'), {force: true});
  copyDir(join(reference, 'plugin'), join(root, 'plugin'));
  replaceRecursive(join(root, 'theme'), {'New Site Reference': name, 'new-site': slug, site_product: `${slug}_product`, 'New Site': name});
  replaceRecursive(join(root, 'plugin'), {'New Site Content Model': `${name} Content Model`, 'new-site': slug, site_product: `${slug}_product`});
  renameSync(join(root, 'theme/single-site_product.php'), join(root, 'theme', `single-${slug}_product.php`));
  const oldPlugin = join(root, 'plugin', 'site-model.php');
  const newPlugin = join(root, 'plugin', `${pluginSlug}.php`);
  if (existsSync(oldPlugin)) {
    const php = readFileSync(oldPlugin, 'utf8').replace('site-model.php', `${pluginSlug}.php`);
    writeFileSync(newPlugin, php);
    rmSync(oldPlugin);
  }

  writeFileSync(join(root, '.gitignore'), [
    '.backups/', '.deploy-staging/', '.wordpress-builder/', '.DS_Store', 'node_modules/', '*.log', '*.env', '!*.example.env',
  ].join('\n') + '\n');
  writeFileSync(join(root, 'project.json'), JSON.stringify({
    title: name,
    slug,
    type: 'wordpress-b2b',
    domain: '',
    theme: themeSlug,
    plugin: pluginSlug,
    livePages: ['/', '/products/'],
    contentMarkers: [],
    contentCounts: [{label: 'Products', postType: `${slug}_product`}],
    requiredPlugins: ['advanced-custom-fields', 'seo-by-rank-math'],
    disabledPlugins: [],
    ssh: undefined,
    hostinger: undefined,
    media: {sources: [{name: 'products', path: 'docs/media/products'}]},
    seed: {enabled: false, script: 'scripts/seed.php', data: 'content/site-data.json'},
    paths: {theme: 'theme', plugin: 'plugin', content: 'content'},
  }, null, 2));
  writeFileSync(join(root, 'content/site-data.json'), JSON.stringify({terms: [], products: [], guides: [], pages: {}}, null, 2));
  writeFileSync(join(root, 'AGENTS.md'), `# ${name}\n\nClassic PHP theme + ACF project.\n\n- Presentation lives in \`theme/\`; business models and ACF fields live in \`plugin/\`.\n- Fill \`project.json\` before deploy. Never commit credentials.\n- Run the central harness \`check\` before deploy and verify the original public URL after deploy.\n`);
  writeFileSync(join(root, 'docs/brief.md'), `# ${name} brief\n\n- Business goal:\n- Buyers:\n- Primary conversion:\n- Facts and evidence:\n- Brand assets:\n`);
  if (git) execFileSync('git', ['init', '-b', 'main'], {cwd: root, stdio: 'pipe'});
  return root;
}
