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

function navigationRefs(content) {
  return [...String(content || '').matchAll(/wp:navigation-ref[^}]*"ref":\s*(\d+)/g)]
    .map(match => Number(match[1]))
    .filter(Number.isInteger);
}

function inferWordPressShape({
  themeInfo,
  menus,
  pageTemplates,
  fseTemplates,
  fseTemplateParts,
  navigationPosts,
}) {
  const isBlockTheme = themeInfo?.is_block_theme === true;
  const hasAssignedClassicMenu = menus.some(menu => (menu.locations ?? []).length > 0);
  const hasBlockNavigation = navigationPosts.length > 0;
  let navigation = 'unknown';
  if (hasAssignedClassicMenu && hasBlockNavigation) navigation = 'mixed';
  else if (hasAssignedClassicMenu) navigation = 'classic-menu';
  else if (hasBlockNavigation) navigation = 'block-navigation';

  const classicTemplates = Object.keys(pageTemplates || {});
  const fseTemplateCount = fseTemplates.length + fseTemplateParts.length;
  let pageTemplatesMode;
  if (classicTemplates.length && (isBlockTheme || fseTemplateCount)) pageTemplatesMode = 'mixed';
  else if (isBlockTheme || fseTemplateCount) pageTemplatesMode = 'fse';
  else if (classicTemplates.length) pageTemplatesMode = 'classic';
  else pageTemplatesMode = 'none';

  const themeType = isBlockTheme && classicTemplates.length ? 'hybrid' : isBlockTheme ? 'block' : 'classic';

  return {
    themeType,
    navigation,
    pageTemplates: pageTemplatesMode,
    hasAssignedClassicMenu,
    hasBlockNavigation,
  };
}

function isBlockTheme(themeInfo) {
  return themeInfo?.is_block_theme === true;
}

function detectAuthoringSystems({themeInfo, plugins, pageTemplates, fseTemplates, fseTemplateParts}) {
  const pluginSlugs = new Set(plugins.map(plugin => plugin.toLowerCase()));
  const themeSlug = String(themeInfo?.slug ?? '').toLowerCase();
  const systems = [];
  const classicTemplates = Object.keys(pageTemplates || {}).length > 0;
  const fse = fseTemplates.length > 0 || fseTemplateParts.length > 0;

  if (classicTemplates) systems.push('classic-php');
  if (isBlockTheme(themeInfo) || fse) systems.push('block-fse');
  if (pluginSlugs.has('elementor') || pluginSlugs.has('elementor-pro') || themeSlug === 'elementor' || themeSlug === 'hello-elementor') systems.push('elementor');
  if (themeSlug === 'divi' || pluginSlugs.has('divi') || pluginSlugs.has('divi-builder')) systems.push('divi');
  if (pluginSlugs.has('bb-plugin') || pluginSlugs.has('beaver-builder-lite-version')) systems.push('beaver-builder');
  if (pluginSlugs.has('js_composer')) systems.push('wpbakery');
  if (themeSlug === 'bricks' || pluginSlugs.has('bricks')) systems.push('bricks');
  if (pluginSlugs.has('oxygen')) systems.push('oxygen');

  return systems;
}

function inferRenderingSystem({authoringSystems, navigation, pageTemplates}) {
  const builderSystems = authoringSystems.filter(system => !['classic-php', 'block-fse'].includes(system));
  const hasBlock = authoringSystems.includes('block-fse');
  const hasClassic = authoringSystems.includes('classic-php');
  if (builderSystems.length) {
    return {
      renderingSystem: hasBlock || hasClassic ? 'hybrid' : 'page-builder',
      pageBuilder: builderSystems[0],
    };
  }
  if (hasBlock && hasClassic) {
    return {renderingSystem: 'hybrid', pageBuilder: null};
  }
  if (hasBlock) return {renderingSystem: 'block-fse', pageBuilder: null};
  if (hasClassic || pageTemplates === 'classic') return {renderingSystem: 'classic-php', pageBuilder: null};
  return {
    renderingSystem: navigation === 'unknown' ? 'unknown' : 'classic-php',
    pageBuilder: null,
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
  const navigationRows = safeJson(wp([
    'post', 'list', '--post_type=wp_navigation', '--post_status=publish',
    '--fields=ID,post_name,post_title,post_status,post_content', '--format=json',
  ]), []);
  const navigationPosts = (Array.isArray(navigationRows) ? navigationRows : []).map(post => ({
    id: Number(post.ID),
    slug: String(post.post_name ?? ''),
    title: String(post.post_title ?? ''),
    status: String(post.post_status ?? ''),
    navigationRefs: navigationRefs(post.post_content),
  }));
  const pageTemplates = safeJson(wp(['eval', 'echo wp_json_encode(wp_get_theme()->get_page_templates());']), {});
  const fseTemplates = safeJson(wp([
    'eval', 'echo wp_json_encode(get_block_templates([], "wp_template"));',
  ]), []).map(template => ({
    id: String(template.id ?? ''),
    slug: String(template.slug ?? ''),
    title: String(template.title?.rendered ?? template.title ?? ''),
    source: String(template.source ?? 'theme'),
    hasReusableContent: Boolean(template.wp_id),
  }));
  const fseTemplateParts = safeJson(wp([
    'eval', 'echo wp_json_encode(get_block_templates([], "wp_template_part"));',
  ]), []).map(template => ({
    id: String(template.id ?? ''),
    slug: String(template.slug ?? ''),
    title: String(template.title?.rendered ?? template.title ?? ''),
    area: String(template.area ?? ''),
    source: String(template.source ?? 'theme'),
    hasReusableContent: Boolean(template.wp_id),
  }));
  const postTypeRows = safeJson(wp(['post-type', 'list', '--public=1', '--format=json']), []);
  const taxonomyRows = safeJson(wp(['taxonomy', 'list', '--public=1', '--format=json']), []);
  const authoringSystems = detectAuthoringSystems({
    themeInfo,
    plugins,
    pageTemplates,
    fseTemplates,
    fseTemplateParts,
  });
  const shape = inferWordPressShape({
    themeInfo,
    authoringSystems,
    menus,
    pageTemplates,
    fseTemplates,
    fseTemplateParts,
    navigationPosts,
  });
  const rendering = inferRenderingSystem({
    authoringSystems,
    navigation: shape.navigation,
    pageTemplates: shape.pageTemplates,
  });
  const classicMenus = [];
  for (const menu of menus) {
    const items = safeJson(wp([
      'menu', 'item', 'list', menu.slug, '--fields=db_id,title,menu_item_parent,url', '--format=json',
    ]), []).map(item => ({
      id: Number(item.db_id ?? item.database_id ?? 0),
      title: String(item.title ?? ''),
      parent: Number(item.menu_item_parent ?? 0),
      url: String(item.url ?? ''),
    }));
    classicMenus.push({...menu, items});
  }
  const fluentform = plugins.includes('fluentform');
  return {
    wordpressVersion: wp(['core', 'version']),
    activeTheme: themeInfo?.name || '',
    plugins,
    ...shape,
    renderingSystem: rendering.renderingSystem,
    authoringSystems,
    pageBuilder: rendering.pageBuilder,
    publicPostTypes: Array.isArray(postTypeRows) ? postTypeRows.map(row => String(row.name)) : [],
    publicTaxonomies: Array.isArray(taxonomyRows) ? taxonomyRows.map(row => String(row.name)) : [],
    classicMenus: classicMenus.filter(menu => menu.items.length > 0),
    navigationPosts,
    fseTemplates,
    fseTemplateParts,
    capabilities: {
      classicMenuWrite: shape.navigation === 'classic-menu' || shape.navigation === 'mixed',
      blockNavigationRead: shape.navigation === 'block-navigation' || shape.navigation === 'mixed',
      classicPageTemplateAssign: shape.pageTemplates === 'classic' || shape.pageTemplates === 'mixed',
      fseTemplateInspection: shape.themeType === 'block' || shape.themeType === 'hybrid' || fseTemplates.length > 0 || fseTemplateParts.length > 0,
    },
    pageTemplates: shape.pageTemplates,
    classicPageTemplates: pageTemplates,
    forms: {fluentform},
    counts: {
      pages: parseCount(wp(['post', 'list', '--post_type=page', '--post_status=publish', '--format=count'])),
      posts: parseCount(wp(['post', 'list', '--post_type=post', '--post_status=publish', '--format=count'])),
      media: parseCount(wp(['post', 'list', '--post_type=attachment', '--post_status=any', '--format=count'])),
      blockNavigationPosts: navigationPosts.length,
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
