import {fetchPage} from './verify.mjs';

const MODULES = ['sitemap', 'rich-snippet', 'acf', 'redirections', '404-monitor'];

const PHP = `<?php
if (!defined('ABSPATH')) exit('CLI only');
if (!defined('RANK_MATH_VERSION')) throw new RuntimeException('Rank Math must be active');
if (defined('RANK_MATH_PRO_VERSION')) throw new RuntimeException('Rank Math Pro is not the approved free baseline');
$argsFile = isset($args[0]) ? $args[0] : '';
if (!$argsFile || !file_exists($argsFile)) throw new RuntimeException('Rank Math config file is required');
$config = json_decode(file_get_contents($argsFile), true);
if (!is_array($config)) throw new RuntimeException('Invalid Rank Math config');

// The setup screen offers "Skip account connection"; this is its supported CLI equivalent.
update_option('rank_math_registration_skip', true);
update_option('rank_math_mode', 'advanced');
update_option('rank_math_is_configured', true);
update_option('rank_math_modules', $config['modules']);
if (class_exists('\\RankMath\\Installer')) \\RankMath\\Installer::create_tables($config['modules']);

$titles = get_option('rank-math-options-titles', []);
$titles = array_merge($titles, [
  'title_separator' => '-',
  'twitter_card_type' => 'summary_large_image',
  'knowledgegraph_type' => 'company',
  'knowledgegraph_name' => $config['organization'],
  'website_name' => $config['organization'],
  'local_business_type' => 'Organization',
  'noindex_search' => 'on',
  'noindex_archive_subpages' => 'off',
  'author_add_meta_box' => 'on',
  'author_custom_robots' => 'on',
  'author_robots' => ['noindex'],
  'pt_attachment_add_meta_box' => 'on',
  'pt_attachment_description' => '%excerpt%',
  'pt_attachment_custom_robots' => 'on',
  'pt_attachment_robots' => ['noindex'],
  'pt_attachment_default_rich_snippet' => 'off',
]);
foreach ($config['postTypes'] as $type) {
  $name = $type['name'];
  $titles['pt_' . $name . '_add_meta_box'] = $type['metaBox'] ? 'on' : 'off';
  $titles['pt_' . $name . '_description'] = '%excerpt%';
  $titles['pt_' . $name . '_custom_robots'] = 'on';
  $titles['pt_' . $name . '_robots'] = in_array($name, $config['noindex'], true) ? ['noindex'] : ['index'];
  $titles['pt_' . $name . '_default_rich_snippet'] = $type['richSnippet'];
}
foreach ($config['taxonomies'] as $taxonomy) {
  $name = $taxonomy['name'];
  $titles['tax_' . $name . '_add_meta_box'] = $taxonomy['metaBox'] ? 'on' : 'off';
  $titles['tax_' . $name . '_description'] = '%term_description%';
  $titles['tax_' . $name . '_custom_robots'] = 'on';
  $titles['tax_' . $name . '_robots'] = in_array($name, $config['noindex'], true) ? ['noindex'] : ['index'];
}
update_option('rank-math-options-titles', $titles);

$sitemap = get_option('rank-math-options-sitemap', []);
$sitemap['items_per_page'] = 200;
$sitemap['include_images'] = 'on';
$sitemap['include_featured_image'] = 'off';
$sitemap['html_sitemap'] = 'on';
$sitemap['html_sitemap_display'] = 'shortcode';
$sitemap['html_sitemap_sort'] = 'published';
$sitemap['html_sitemap_seo_titles'] = 'titles';
$sitemap['authors_sitemap'] = 'off';
$sitemap['pt_attachment_sitemap'] = 'off';
foreach ($config['postTypes'] as $type) $sitemap['pt_' . $type['name'] . '_sitemap'] = $type['sitemap'] ? 'on' : 'off';
foreach ($config['taxonomies'] as $taxonomy) $sitemap['tax_' . $taxonomy['name'] . '_sitemap'] = $taxonomy['sitemap'] ? 'on' : 'off';
update_option('rank-math-options-sitemap', $sitemap);

$known = array_values(array_unique(array_merge(
  get_post_types(['public' => true], 'names'),
  array_map(static function ($type) { return $type['name']; }, $config['postTypes']),
  ['post', 'page', 'attachment']
)));
update_option('rank_math_known_post_types', $known);
flush_rewrite_rules();
echo wp_json_encode([
  'provider' => 'rank-math-free',
  'version' => RANK_MATH_VERSION,
  'pro' => defined('RANK_MATH_PRO_VERSION'),
  'modules' => get_option('rank_math_modules'),
  'registrationSkip' => (bool) get_option('rank_math_registration_skip'),
  'configured' => (bool) get_option('rank_math_is_configured'),
  'sitemap' => get_option('rank-math-options-sitemap'),
  'titles' => get_option('rank-math-options-titles'),
  'knownPostTypes' => $known,
]);
`;

function normalizePostType(value, index) {
  const name = String(value?.name ?? value ?? '').trim();
  if (!/^[a-z0-9_-]+$/.test(name)) throw new Error(`Invalid SEO post type at index ${index}: ${name}`);
  return {name, sitemap: value?.sitemap !== false, metaBox: value?.metaBox !== false, richSnippet: value?.richSnippet || 'off'};
}

export function rankMathConfig(project) {
  const seo = project.seo ?? {};
  const derived = (project.contentCounts ?? [])
    .map(item => item.postType)
    .filter(name => !['attachment', 'it_rfq'].includes(name) && !name.endsWith('_rfq'));
  const postTypes = (seo.postTypes?.length ? seo.postTypes : ['post', 'page', ...derived]).map(normalizePostType);
  const taxonomies = (seo.taxonomies ?? []).map(normalizePostType);
  const names = postTypes.map(type => type.name);
  for (const required of ['post', 'page']) {
    if (!names.includes(required)) postTypes.push(normalizePostType(required));
  }
  return {
    organization: seo.organization || project.title,
    modules: MODULES,
    postTypes,
    taxonomies,
    noindex: seo.noindex ?? [],
  };
}

export function rankMathSitemapPaths(project) {
  const config = rankMathConfig(project);
  const leaves = [
    ...config.postTypes.filter(type => type.sitemap).map(type => `/${type.name}-sitemap.xml`),
    ...config.taxonomies.filter(taxonomy => taxonomy.sitemap).map(taxonomy => `/${taxonomy.name}-sitemap.xml`),
  ];
  return [...new Set(['/sitemap_index.xml', ...leaves])];
}

function parseState(output) {
  const start = output.indexOf('{');
  const end = output.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error(`Rank Math did not return state: ${output.slice(0, 500)}`);
  return JSON.parse(output.slice(start, end + 1));
}

export async function configureRankMath(project, ssh, {logger = () => {}} = {}) {
  const staging = `/tmp/${project.slug}-rank-math`;
  ssh.run(`rm -rf ${staging} && mkdir -p ${staging}`);
  ssh.run(`cat > ${staging}/config.json`, {input: Buffer.from(JSON.stringify(rankMathConfig(project)))});
  ssh.run(`cat > ${staging}/configure.php`, {input: Buffer.from(PHP)});
  const output = ssh.wp(['eval-file', `${staging}/configure.php`, `${staging}/config.json`]);
  const state = parseState(output);
  const errors = [];
  if (state.pro) errors.push('Rank Math Pro is active');
  if (state.registrationSkip !== true) errors.push('account connection was not skipped');
  if (state.configured !== true) errors.push('Rank Math is not configured');
  for (const module of MODULES) if (!state.modules?.includes(module)) errors.push(`module missing: ${module}`);
  if (errors.length) throw new Error(`Rank Math configuration failed: ${errors.join(', ')}`);
  ssh.wp(['rewrite', 'flush']);
  ssh.wp(['cache', 'flush']);
  logger(`  OK  Rank Math Free ${state.version} configured (${state.modules.join(', ')})`);
  return state;
}

export async function verifyRankMath(project, ssh, {fetchImpl = fetch, logger = () => {}} = {}) {
  const state = parseState(ssh.wp(['eval', [
    'echo wp_json_encode([',
    "'version'=>RANK_MATH_VERSION,'pro'=>defined('RANK_MATH_PRO_VERSION'),",
    "'modules'=>get_option('rank_math_modules'),",
    "'registrationSkip'=>(bool)get_option('rank_math_registration_skip'),",
    "'configured'=>(bool)get_option('rank_math_is_configured'),",
    "'frontend'=>isset(rank_math()->frontend),",
    "'sitemapOption'=>get_option('rank-math-options-sitemap'),",
    ']);',
  ].join(' ')]));
  const sitemapChecks = [];
  for (const path of rankMathSitemapPaths(project)) {
    try {
      const {response, html} = await fetchPage(`https://${project.domain}`, path, {fetchImpl});
      const isXml = response.status === 200 && /<\?xml|<sitemapindex|<urlset/i.test(html.slice(0, 500));
      sitemapChecks.push({path, status: response.status, isXml, pass: isXml});
    } catch (error) {
      sitemapChecks.push({path, status: 0, isXml: false, pass: false, detail: error.message});
    }
  }
  const sitemap = {pass: sitemapChecks.every(item => item.pass), results: sitemapChecks};
  const pass = !state.pro && state.registrationSkip && state.configured && state.frontend && sitemap.pass;
  const result = {pass, state, sitemap};
  if (!pass) throw new Error(`Rank Math verification failed: ${JSON.stringify(result)}`);
  logger('  OK  Rank Math frontend and XML sitemap verified');
  return result;
}
