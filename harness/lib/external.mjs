import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {execFileSync as defaultExec} from 'node:child_process';
import {join, resolve} from 'node:path';
import {slugify} from './config.mjs';
import {createSSH} from './ssh.mjs';
import {discoverHostingerWebsite, setupProjectSsh} from './ssh-setup.mjs';
import {
  parseTemplateContent,
  resolveNavigationOwnership,
  resolveTemplateHierarchy,
  routeCapabilities,
  summarizeBlockTemplates,
} from './shape-diagnosis.mjs';

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
  const allNavigationRefs = [
    ...fseTemplates.flatMap(template => template.navigationRefs ?? []),
    ...fseTemplateParts.flatMap(template => template.navigationRefs ?? []),
  ];
  const hasBlockNavigation = allNavigationRefs.length > 0
    || fseTemplates.some(template => template.inlineNavigationBlocks > 0)
    || fseTemplateParts.some(template => template.inlineNavigationBlocks > 0);
  const hasBlockRendering = isBlockTheme || fseTemplates.length > 0 || fseTemplateParts.length > 0;
  let navigation = 'unknown';
  if (hasBlockRendering) {
    if (hasAssignedClassicMenu && hasBlockNavigation) navigation = 'mixed';
    else if (hasBlockNavigation) navigation = 'block-navigation';
  } else if (hasAssignedClassicMenu && hasBlockNavigation) navigation = 'mixed';
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
    hasBlockNavigationPosts: navigationPosts.length > 0,
    usedBlockNavigationIds: [...new Set(allNavigationRefs)],
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

function normalizeRequestedRoutes(value) {
  const routes = String(value ?? '')
    .split(',')
    .map(route => route.trim())
    .filter(Boolean);
  if (routes.length === 0) throw new Error('--routes requires at least one path, for example: /,/about/');
  if (routes.length > 20) throw new Error('--routes accepts at most 20 paths per inspection');
  for (const route of routes) {
    if (!route.startsWith('/') || route.startsWith('//')) throw new Error(`Invalid route ${route}: use an absolute site path without protocol/host`);
  }
  return routes;
}

function collectCoreRoutes(wp) {
  const php = `echo wp_json_encode((function(){
    $routes = array();
    $showOnFront = get_option('show_on_front');
    $frontId = (int) get_option('page_on_front');
    $routes[] = array('route' => home_url('/'), 'queryType' => 'posts' === $showOnFront ? 'home' : 'front-page', 'detail' => 'show_on_front=' . $showOnFront);
    $pages = get_posts(array('post_type' => 'page', 'post_status' => 'publish', 'post__not_in' => $frontId ? array($frontId) : array(), 'numberposts' => 1, 'no_found_rows' => true));
    if ($pages) $routes[] = array('route' => get_permalink($pages[0]), 'queryType' => 'page', 'postType' => 'page', 'id' => (int) $pages[0]->ID, 'slug' => $pages[0]->post_name);
    $posts = get_posts(array('post_type' => 'post', 'post_status' => 'publish', 'numberposts' => 1, 'no_found_rows' => true));
    if ($posts) $routes[] = array('route' => get_permalink($posts[0]), 'queryType' => 'post', 'postType' => 'post', 'id' => (int) $posts[0]->ID, 'slug' => $posts[0]->post_name);
    foreach (get_post_types(array('public' => true, '_builtin' => false), 'objects') as $postType) {
      if ($postType->has_archive) {
        $routes[] = array('route' => get_post_type_archive_link($postType->name), 'queryType' => 'cpt-archive', 'postType' => $postType->name);
      }
      $custom = get_posts(array('post_type' => $postType->name, 'post_status' => 'publish', 'numberposts' => 1, 'no_found_rows' => true));
      if ($custom) $routes[] = array('route' => get_permalink($custom[0]), 'queryType' => 'cpt-single', 'postType' => $postType->name, 'id' => (int) $custom[0]->ID, 'slug' => $custom[0]->post_name);
      if (count($routes) >= 7) break;
    }
    $terms = get_terms(array('taxonomy' => 'category', 'hide_empty' => true, 'number' => 1));
    if (!is_wp_error($terms) && $terms) $routes[] = array('route' => get_term_link($terms[0]), 'queryType' => 'category', 'taxonomy' => 'category', 'id' => (int) $terms[0]->term_id, 'slug' => $terms[0]->slug);
    $routes[] = array('route' => home_url('/?s=wp-builder-shape-diagnosis'), 'queryType' => 'search');
    $routes[] = array('route' => home_url('/wp-builder-shape-diagnosis-404/'), 'queryType' => '404');
    return array_slice($routes, 0, 10);
  })());`;
  return safeJson(wp(['eval', php]), []);
}

function routeDescriptor(route, coreRoutes = [], showOnFront = 'posts') {
  const known = coreRoutes.find(item => item.route === route);
  if (known) return known;
  let url;
  try {
    url = new URL(route, 'https://shape.invalid');
  } catch {
    return {route, queryType: 'unknown'};
  }
  if (url.searchParams.has('s')) return {route, queryType: 'search'};
  if (url.pathname === '/' && !url.search) {
    return {route, queryType: showOnFront === 'page' ? 'front-page' : 'home'};
  }
  return {route, queryType: 'unknown'};
}

async function fetchSelectedTemplate(route, base, fetchImpl) {
  const target = new URL(route, base);
  target.searchParams.set('_wp-find-template', '1');
  target.searchParams.set('_wp-builder-inspect', `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`);
  const response = await fetchImpl(target, {
    headers: {accept: 'application/json'},
    redirect: 'follow',
    signal: globalThis.AbortSignal?.timeout(30000),
  });
  const text = await response.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    payload = null;
  }
  return {
    ok: response.ok && payload?.success === true && Boolean(payload.data),
    status: response.status,
    finalUrl: response.url || target.toString(),
    payload,
  };
}

async function diagnoseRoutes({
  descriptors,
  mode,
  siteUrl,
  hasFseTemplates,
  fseTemplates,
  fseTemplateParts,
  classicMenus,
  renderingSystem,
  pageTemplates,
  showOnFront,
  fetchImpl,
}) {
  const routes = [];
  for (const descriptor of descriptors) {
    const hierarchy = resolveTemplateHierarchy({
      queryType: descriptor.queryType,
      postType: descriptor.postType,
      taxonomy: descriptor.taxonomy,
      slug: descriptor.slug,
      id: descriptor.id,
      assignedTemplate: descriptor.assignedTemplate,
      showOnFront,
    }, fseTemplates);
    const base = {
      route: descriptor.route,
      queryType: descriptor.queryType,
      hierarchy,
      request: null,
      fseTemplate: null,
      templateParts: [],
      navigation: null,
      capabilities: null,
      confidence: 'low',
      problems: [],
    };
    if (!hasFseTemplates) {
      const navigation = resolveNavigationOwnership({classicMenus, renderingSystem});
      base.navigation = navigation;
      base.capabilities = routeCapabilities({navigation, fseSelected: false, sitePageTemplates: pageTemplates, renderingSystem});
      base.confidence = navigation.confidence;
      routes.push(base);
      continue;
    }

    try {
      const response = await fetchSelectedTemplate(descriptor.route, siteUrl, fetchImpl);
      base.request = {ok: response.ok, status: response.status};
      if (!response.ok || !response.payload?.data) {
        base.problems.push(response.payload?.message ? String(response.payload.message) : 'WordPress did not return a selected block template');
        base.navigation = resolveNavigationOwnership({classicMenus, renderingSystem});
        base.capabilities = routeCapabilities({navigation: base.navigation, fseSelected: false, sitePageTemplates: pageTemplates, renderingSystem});
        routes.push(base);
        continue;
      }
      const [selected] = summarizeBlockTemplates([response.payload.data]);
      selected.status = 'selected';
      const navigation = resolveNavigationOwnership({
        selectedTemplate: selected,
        templateParts: fseTemplateParts,
        classicMenus,
        renderingSystem,
      });
      base.fseTemplate = selected;
      base.templateParts = navigation.selectedParts ?? [];
      base.navigation = navigation;
      base.capabilities = routeCapabilities({navigation, fseSelected: true, sitePageTemplates: pageTemplates, renderingSystem});
      base.confidence = navigation.confidence;
      routes.push(base);
    } catch (error) {
      base.request = {ok: false, status: 0};
      base.problems.push(error.message);
      base.navigation = resolveNavigationOwnership({classicMenus, renderingSystem});
      base.capabilities = routeCapabilities({navigation: base.navigation, fseSelected: false, sitePageTemplates: pageTemplates, renderingSystem});
      routes.push(base);
    }
  }
  return {
    mode,
    routes,
    fetchedAt: new Date().toISOString(),
  };
}

export function saveRemoteRouteShapes(projectRoot, project, inventory) {
  if (!inventory.routeShapes) return project.remote;
  const path = project._projectFile ?? join(projectRoot, 'project.json');
  const current = JSON.parse(readFileSync(path, 'utf8'));
  current.remote = {
    ...current.remote,
    siteUrl: inventory.siteUrl,
    wpVersion: inventory.wordpressVersion,
    activeTheme: inventory.activeTheme,
    plugins: inventory.plugins,
    themeType: inventory.themeType,
    renderingSystem: inventory.renderingSystem,
    authoringSystems: inventory.authoringSystems,
    pageBuilder: inventory.pageBuilder,
    navigation: inventory.navigation,
    pageTemplates: inventory.pageTemplates,
    publicPostTypes: inventory.publicPostTypes,
    publicTaxonomies: inventory.publicTaxonomies,
    menus: inventory.classicMenus.map(menu => ({
      id: menu.id, name: menu.name, slug: menu.slug, locations: menu.locations,
    })),
    forms: inventory.forms,
    counts: inventory.counts,
    routeShapes: inventory.routeShapes,
    inspectedAt: inventory.inspectedAt,
  };
  writeJson(path, current);
  return current.remote;
}

function collectInventoryInOneRequest(wp) {
  const php = `if (!function_exists('get_plugins')) require ABSPATH . 'wp-admin/includes/plugin.php';
  echo wp_json_encode(array(
    'marker' => 'wordpress-builder-inspection/1',
    'siteUrl' => (string) get_option('siteurl'),
    'wpVersion' => (string) get_bloginfo('version'),
    'showOnFront' => (string) get_option('show_on_front', 'posts'),
    'theme' => array(
      'name' => wp_get_theme()->get('Name'),
      'slug' => get_stylesheet(),
      'is_block_theme' => method_exists(wp_get_theme(), 'is_block_theme') && wp_get_theme()->is_block_theme(),
    ),
    'plugins' => array_values(array_unique(array_map(static function ($file) {
      if (!str_contains($file, '/')) return (string) pathinfo($file, PATHINFO_FILENAME);
      return preg_match('#^[^/]+#', $file, $matches) ? $matches[0] : $file;
    }, array_keys(function_exists('get_plugins') ? get_plugins() : array())))),
    'menus' => array_values(array_map(static function ($menu) {
      $locations = array();
      foreach ((array) get_theme_mod('nav_menu_locations', array()) as $location => $termId) {
        if ((int) $termId === (int) $menu->term_id) $locations[] = (string) $location;
      }
      return array(
        'term_id' => (int) $menu->term_id,
        'name' => (string) $menu->name,
        'slug' => (string) $menu->slug,
        'locations' => $locations,
        'items' => array_map(static function ($item) {
          return array(
            'db_id' => (int) $item->db_id,
            'title' => (string) $item->title,
            'menu_item_parent' => (int) $item->menu_item_parent,
            'url' => (string) $item->url,
          );
        }, (array) wp_get_nav_menu_items($menu)),
      );
    }, (array) wp_get_nav_menus())),
    'navigationPosts' => array_map(static function ($post) {
      return array(
        'ID' => (int) $post->ID,
        'post_name' => (string) $post->post_name,
        'post_title' => (string) $post->post_title,
        'post_status' => (string) $post->post_status,
        'post_content' => (string) $post->post_content,
      );
    }, get_posts(array('post_type' => 'wp_navigation', 'post_status' => 'publish', 'numberposts' => -1, 'no_found_rows' => true))),
    'pageTemplates' => wp_get_theme()->get_page_templates(),
    'fseTemplates' => get_block_templates(array(), 'wp_template'),
    'fseTemplateParts' => get_block_templates(array(), 'wp_template_part'),
    'postTypes' => array_values(get_post_types(array('public' => true), 'names')),
    'taxonomies' => array_values(get_taxonomies(array('public' => true), 'names')),
    'counts' => array(
      'pages' => (int) wp_count_posts('page')->publish,
      'posts' => (int) wp_count_posts('post')->publish,
      'media' => (int) wp_count_posts('attachment')->inherit,
      'blockNavigationPosts' => (int) wp_count_posts('wp_navigation')->publish,
    ),
  ));`;
  let output;
  try {
    output = wp(['eval', php]);
  } catch {
    return null;
  }
  const value = safeJson(output, null);
  return value?.marker === 'wordpress-builder-inspection/1' ? value : null;
}

/** Read-only WordPress inspection used to route content/design operations by real site shape. */
export async function inspectRemoteWordPress(project, {
  exec = defaultExec, routes: requestedRoutes, routeSet, fetchImpl = globalThis.fetch,
} = {}) {
  const ssh = createSSH(project, {execFile: exec});
  const wp = args => ssh.wp(args).trim();
  const modernInventory = collectInventoryInOneRequest(wp);
  let themeInfo;
  let plugins;
  let menus;
  let navigationPosts;
  let pageTemplates;
  let fseTemplates;
  let fseTemplateParts;
  let postTypeRows;
  let taxonomyRows;
  let classicMenus;
  let siteUrl;
  let wordpressVersion;
  let showOnFront;
  let counts;
  if (modernInventory) {
    themeInfo = modernInventory.theme;
    plugins = modernInventory.plugins;
    menus = normalizeMenus(modernInventory.menus);
    navigationPosts = modernInventory.navigationPosts.map(post => ({
      id: Number(post.ID),
      slug: String(post.post_name ?? ''),
      title: String(post.post_title ?? ''),
      status: String(post.post_status ?? ''),
      ...parseTemplateContent(post.post_content),
    }));
    pageTemplates = modernInventory.pageTemplates;
    fseTemplates = modernInventory.fseTemplates;
    fseTemplateParts = modernInventory.fseTemplateParts;
    postTypeRows = modernInventory.postTypes.map(name => ({name}));
    taxonomyRows = modernInventory.taxonomies.map(name => ({name}));
    classicMenus = menus.map(menu => ({
      ...menu,
      items: modernInventory.menus
        .find(item => item.term_id === menu.id)?.items
        .map(item => ({
          id: Number(item.db_id ?? item.database_id ?? 0),
          title: String(item.title ?? ''),
          parent: Number(item.menu_item_parent ?? 0),
          url: String(item.url ?? ''),
        })) ?? [],
    }));
    siteUrl = modernInventory.siteUrl;
    wordpressVersion = modernInventory.wpVersion;
    showOnFront = modernInventory.showOnFront || 'posts';
    counts = modernInventory.counts;
  } else {
    const themeRows = safeJson(wp(['theme', 'list', '--status=active', '--format=json']), []);
    themeInfo = Array.isArray(themeRows) ? themeRows[0] : {};
    const pluginRows = safeJson(wp(['plugin', 'list', '--format=json']), []);
    plugins = Array.isArray(pluginRows) ? pluginRows.map(plugin => String(plugin.name)) : [];
    menus = normalizeMenus(safeJson(wp(['menu', 'list', '--fields=term_id,name,slug,locations', '--format=json']), []));
    const navigationRows = safeJson(wp([
      'post', 'list', '--post_type=wp_navigation', '--post_status=publish',
      '--fields=ID,post_name,post_title,post_status,post_content', '--format=json',
    ]), []);
    navigationPosts = (Array.isArray(navigationRows) ? navigationRows : []).map(post => ({
      id: Number(post.ID),
      slug: String(post.post_name ?? ''),
      title: String(post.post_title ?? ''),
      status: String(post.post_status ?? ''),
      ...parseTemplateContent(post.post_content),
    }));
    pageTemplates = safeJson(wp(['eval', 'echo wp_json_encode(wp_get_theme()->get_page_templates());']), {});
    fseTemplates = safeJson(wp([
      'eval', 'echo wp_json_encode(get_block_templates([], "wp_template"));',
    ]), []);
    fseTemplateParts = safeJson(wp([
      'eval', 'echo wp_json_encode(get_block_templates([], "wp_template_part"));',
    ]), []);
    postTypeRows = safeJson(wp(['post-type', 'list', '--public=1', '--format=json']), []);
    taxonomyRows = safeJson(wp(['taxonomy', 'list', '--public=1', '--format=json']), []);
  }
  const summarizedFseTemplates = summarizeBlockTemplates(fseTemplates, 'wp_template');
  const summarizedFseParts = summarizeBlockTemplates(fseTemplateParts, 'wp_template_part');
  const authoringSystems = detectAuthoringSystems({
    themeInfo,
    plugins,
    pageTemplates,
    fseTemplates: summarizedFseTemplates,
    fseTemplateParts: summarizedFseParts,
  });
  const shape = inferWordPressShape({
    themeInfo,
    authoringSystems,
    menus,
    pageTemplates,
    fseTemplates: summarizedFseTemplates,
    fseTemplateParts: summarizedFseParts,
    navigationPosts,
  });
  const rendering = inferRenderingSystem({
    authoringSystems,
    navigation: shape.navigation,
    pageTemplates: shape.pageTemplates,
  });
  const fluentform = plugins.includes('fluentform');
  if (!modernInventory) {
    classicMenus = [];
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
    siteUrl = wp(['option', 'get', 'siteurl']);
    wordpressVersion = wp(['core', 'version']);
    showOnFront = wp(['option', 'get', 'show_on_front']) || 'posts';
    counts = {
      pages: parseCount(wp(['post', 'list', '--post_type=page', '--post_status=publish', '--format=count'])),
      posts: parseCount(wp(['post', 'list', '--post_type=post', '--post_status=publish', '--format=count'])),
      media: parseCount(wp(['post', 'list', '--post_type=attachment', '--post_status=any', '--format=count'])),
      blockNavigationPosts: navigationPosts.length,
    };
  }
  let routeShapes;
  if (requestedRoutes !== undefined || routeSet !== undefined) {
    let descriptors;
    let mode;
    if (routeSet !== undefined) {
      if (routeSet !== 'core') throw new Error('unsupported --route-set; only core is available');
      if (requestedRoutes !== undefined) throw new Error('use either --routes or --route-set, not both');
      descriptors = collectCoreRoutes(wp);
      mode = 'core';
    } else {
      descriptors = normalizeRequestedRoutes(requestedRoutes).map(route => routeDescriptor(route, [], showOnFront));
      mode = 'explicit';
    }
    routeShapes = await diagnoseRoutes({
      descriptors,
      mode,
      siteUrl,
      hasFseTemplates: summarizedFseTemplates.length > 0 || summarizedFseParts.length > 0,
      fseTemplates: summarizedFseTemplates,
      fseTemplateParts: summarizedFseParts,
      classicMenus: classicMenus.filter(menu => menu.items.length > 0),
      renderingSystem: rendering.renderingSystem,
      pageTemplates: shape.pageTemplates,
      showOnFront,
      fetchImpl,
    });
  }
  return {
    siteUrl,
    wordpressVersion,
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
    fseTemplates: summarizedFseTemplates,
    fseTemplateParts: summarizedFseParts,
    ...(routeShapes ? {routeShapes} : {}),
    capabilities: {
      classicMenuWrite: shape.navigation === 'classic-menu' && rendering.renderingSystem !== 'block-fse',
      blockNavigationRead: shape.navigation === 'block-navigation' || shape.navigation === 'mixed',
      classicPageTemplateAssign: shape.pageTemplates === 'classic'
        || (shape.pageTemplates === 'mixed' && !authoringSystems.includes('block-fse')),
      fseTemplateInspection: shape.themeType === 'block' || shape.themeType === 'hybrid' || fseTemplates.length > 0 || fseTemplateParts.length > 0,
    },
    pageTemplates: shape.pageTemplates,
    classicPageTemplates: pageTemplates,
    forms: {fluentform},
    counts,
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
