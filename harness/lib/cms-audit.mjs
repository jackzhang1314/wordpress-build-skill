
const CMS_AUDIT_PHP = `<?php
if (!defined('ABSPATH')) exit('CLI only');
$public_types = get_post_types(['public' => true], 'objects');
$post_types = [];
foreach ($public_types as $type) {
  $post_types[$type->name] = [
    'public' => (bool) $type->public,
    'rest' => (bool) $type->show_in_rest,
    'archive' => (bool) $type->has_archive,
    'hierarchical' => (bool) $type->hierarchical,
    'labels' => $type->labels,
    'supports' => array_keys(get_all_post_type_supports($type->name)),
    'taxonomies' => get_object_taxonomies($type->name),
  ];
}
$taxonomies = [];
foreach (get_taxonomies(['public' => true], 'objects') as $taxonomy) {
  $taxonomies[$taxonomy->name] = [
    'public' => (bool) $taxonomy->public,
    'rest' => (bool) $taxonomy->show_in_rest,
    'hierarchical' => (bool) $taxonomy->hierarchical,
    'labels' => $taxonomy->labels,
    'object_type' => array_values($taxonomy->object_type ?? []),
  ];
}
$acf_groups = [];
foreach (acf_get_field_groups() as $group) {
  $fields = [];
  foreach (acf_get_fields($group['key']) as $field) {
    $fields[] = [
      'name' => (string) $field['name'],
      'key' => (string) $field['key'],
      'label' => (string) $field['label'],
      'type' => (string) $field['type'],
      'required' => (bool) ($field['required'] ?? false),
      'instructions' => (string) ($field['instructions'] ?? ''),
      'rest' => (bool) ($field['show_in_rest'] ?? false),
    ];
  }
  $locations = [];
  foreach ($group['location'] ?? [] as $and) {
    $locations[] = array_map(static fn($condition) => [
      'param' => (string) $condition['param'],
      'operator' => (string) $condition['operator'],
      'value' => (string) $condition['value'],
    ], $and);
  }
  $acf_groups[] = [
    'key' => (string) $group['key'],
    'title' => (string) $group['title'],
    'active' => (bool) ($group['active'] ?? true),
    'locations' => $locations,
    'fields' => $fields,
  ];
}
$posts = [];
foreach (get_post_types(['public' => true]) as $type) {
  if (in_array($type, ['attachment', 'revision', 'nav_menu_item', 'custom_css', 'customize_changeset', 'oembed_cache', 'user_request', 'wp_block', 'wp_template', 'wp_template_part', 'wp_global_styles', 'wp_navigation'], true)) continue;
  $objects = get_posts(['post_type' => $type, 'post_status' => 'publish,draft,pending,private,future', 'numberposts' => 300]);
  foreach ($objects as $object) {
    $meta = get_post_meta($object->ID);
    $values = [];
    foreach ($meta as $key => $value) {
      if (str_starts_with((string) $key, '_')) continue;
      $values[$key] = count($value) === 1 ? maybe_unserialize($value[0]) : array_map('maybe_unserialize', $value);
    }
    $posts[$type][] = ['id' => (int) $object->ID, 'slug' => $object->post_name, 'title' => $object->post_title, 'status' => $object->post_status, 'values' => $values];
  }
}
$terms = [];
foreach (get_taxonomies(['public' => true]) as $taxonomy) {
  $objects = get_terms(['taxonomy' => $taxonomy, 'hide_empty' => false, 'number' => 200]);
  if (is_wp_error($objects)) continue;
  foreach ($objects as $term) {
    $meta = get_term_meta($term->term_id);
    $values = [];
    foreach ($meta as $key => $value) {
      if (str_starts_with((string) $key, '_')) continue;
      $values[$key] = count($value) === 1 ? maybe_unserialize($value[0]) : array_map('maybe_unserialize', $value);
    }
    $terms[] = ['taxonomy' => $taxonomy, 'id' => (int) $term->term_id, 'slug' => $term->slug, 'name' => $term->name, 'values' => $values];
  }
}
$options = [];
foreach (acf_get_field_groups() as $group) {
  foreach ($group['location'] ?? [] as $and) {
    foreach ($and as $condition) {
      if (($condition['param'] ?? '') !== 'options_page') continue;
      $slug = (string) $condition['value'];
      $fields = acf_get_fields($group['key']);
      $values = [];
      foreach ($fields as $field) {
        $value = function_exists('get_field') ? get_field($field['name'], 'option') : get_option($field['name']);
        $values[$field['name']] = $value;
      }
      $options[$slug][] = ['group' => $group['key'], 'fields' => $fields, 'values' => $values];
    }
  }
}
$pages = [];
foreach (get_pages(['post_status' => 'publish,draft,private', 'number' => 300]) as $page) {
  $pages[] = [
    'id' => (int) $page->ID,
    'slug' => $page->post_name,
    'title' => $page->post_title,
    'status' => $page->post_status,
    'template' => (string) get_page_template_slug($page),
    'is_front' => (int) get_option('page_on_front') === (int) $page->ID,
    'is_posts_page' => (int) get_option('page_for_posts') === (int) $page->ID,
  ];
}
echo wp_json_encode([
  'postTypes' => $post_types,
  'taxonomies' => $taxonomies,
  'groups' => $acf_groups,
  'posts' => $posts,
  'terms' => $terms,
  'options' => $options,
  'pages' => $pages,
  'settings' => [
    'pageOnFront' => (int) get_option('page_on_front'),
    'pageForPosts' => (int) get_option('page_for_posts'),
    'showOnFront' => (string) get_option('show_on_front'),
  ],
], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
`;

export function cmsAuditPhp() {
  return CMS_AUDIT_PHP;
}

export async function collectCmsAudit(site) {
  const dir = '/tmp/starter-cms-audit';
  site.ssh.run(`rm -rf ${dir} && mkdir -p ${dir}`);
  site.ssh.run(`cat > ${dir}/audit.php`, {input: Buffer.from(CMS_AUDIT_PHP, 'utf8')});
  const output = site.ssh.wp(['eval-file', `${dir}/audit.php`]);
  const start = output.indexOf('{');
  if (start < 0) throw new Error('CMS audit did not return JSON');
  return JSON.parse(output.slice(start));
}

function groupMatchesLocation(group, param, value) {
  return (group.locations ?? []).some(or => or.some(condition => condition.param === param && condition.operator === '==' && condition.value === value));
}

export function auditCmsModel(remote, project = {}) {
  const problems = [];
  const checks = [];
  const expectedTypes = (project.contentCounts ?? []).filter(item => item.kind !== 'term' && !['post', 'page'].includes(item.postType));
  const expectedTaxonomies = (project.contentCounts ?? []).filter(item => item.kind === 'term');

  for (const item of expectedTypes) {
    const type = remote.postTypes?.[item.postType];
    if (!type) {
      problems.push({kind: 'post_type', name: item.postType, issue: 'registered custom post type is missing'});
      continue;
    }
    if (!type.public) problems.push({kind: 'post_type', name: item.postType, issue: 'post type is not public'});
    if (!type.rest) problems.push({kind: 'post_type', name: item.postType, issue: 'REST access is disabled'});
    const supports = type.supports ?? [];
    for (const support of ['title', 'editor', 'excerpt', 'thumbnail', 'revisions', 'custom-fields']) {
      if (!supports.includes(support)) problems.push({kind: 'post_type', name: item.postType, issue: `missing support: ${support}`});
    }
    for (const label of ['name', 'singular_name', 'menu_name', 'all_items', 'edit_item', 'add_new_item', 'search_items']) {
      if (!type.labels?.[label]) problems.push({kind: 'post_type', name: item.postType, issue: `missing admin label: ${label}`});
    }
    checks.push({name: `post-type:${item.postType}`, pass: true});
  }

  for (const item of expectedTaxonomies) {
    const taxonomy = remote.taxonomies?.[item.postType];
    if (!taxonomy) {
      problems.push({kind: 'taxonomy', name: item.postType, issue: 'registered taxonomy is missing'});
      continue;
    }
    if (!taxonomy.public) problems.push({kind: 'taxonomy', name: item.postType, issue: 'taxonomy is not public'});
    if (!taxonomy.rest) problems.push({kind: 'taxonomy', name: item.postType, issue: 'REST access is disabled'});
    for (const label of ['name', 'singular_name', 'menu_name', 'all_items', 'edit_item', 'add_new_item']) {
      if (!taxonomy.labels?.[label]) problems.push({kind: 'taxonomy', name: item.postType, issue: `missing admin label: ${label}`});
    }
    checks.push({name: `taxonomy:${item.postType}`, pass: true});
  }

  const groups = remote.groups ?? [];
  for (const group of groups) {
    if (!group.active) problems.push({kind: 'field_group', name: group.key, issue: 'field group is inactive'});
    if (!group.locations?.length) problems.push({kind: 'field_group', name: group.key, issue: 'field group has no edit location'});
    if (!group.fields?.length) problems.push({kind: 'field_group', name: group.key, issue: 'field group has no fields'});
    for (const field of group.fields ?? []) {
      if (field.type === 'tab') {
        if (!field.label) problems.push({kind: 'field', name: field.name, issue: 'tab has no label'});
        continue;
      }
      if (!field.rest) problems.push({kind: 'field', name: field.name, issue: 'REST access is disabled'});
      if (!field.label) problems.push({kind: 'field', name: field.name, issue: 'admin label is empty'});
      if (!field.instructions) problems.push({kind: 'field', name: field.name, issue: 'admin instructions are empty'});
      if (!field.type) problems.push({kind: 'field', name: field.name, issue: 'field type is empty'});
    }
    checks.push({name: `field-group:${group.key}`, pass: true, fields: group.fields?.length ?? 0});
  }

  const postTypes = Object.entries(remote.postTypes ?? {}).filter(([name]) => !['post', 'page', 'attachment', 'revision', 'nav_menu_item', 'custom_css', 'customize_changeset', 'oembed_cache', 'user_request', 'wp_block', 'wp_template', 'wp_template_part', 'wp_global_styles', 'wp_navigation'].includes(name));
  for (const [name] of postTypes) {
    const definitions = new Set(groups.flatMap(group => (group.fields ?? []).filter(field => field.type !== 'tab').map(field => field.name)));
    for (const post of remote.posts?.[name] ?? []) {
      for (const key of Object.keys(post.values ?? {})) {
        if (key.startsWith('rank_math')) continue;
        if (!definitions.has(key)) problems.push({kind: 'stored_meta', name, post: post.slug, field: key, issue: 'stored value has no editable ACF definition'});
      }
    }
  }

  for (const term of remote.terms ?? []) {
    const definitions = new Set(groups.flatMap(group => groupMatchesLocation(group, 'taxonomy', term.taxonomy) ? (group.fields ?? []).filter(field => field.type !== 'tab').map(field => field.name) : []));
    for (const key of Object.keys(term.values ?? {})) {
      if (!definitions.has(key)) problems.push({kind: 'stored_term_meta', name: term.taxonomy, term: term.slug, field: key, issue: 'stored term value has no editable ACF definition'});
    }
  }

  const pageOnFront = remote.settings?.pageOnFront ?? 0;
  const pageForPosts = remote.settings?.pageForPosts ?? 0;
  if (remote.settings?.showOnFront === 'page' && (!pageOnFront || !pageForPosts)) {
    problems.push({kind: 'settings', name: 'page_assignment', issue: 'static front page or posts page is not assigned'});
  }
  for (const page of remote.pages ?? []) {
    if (page.template && page.template !== 'default' && !page.template.startsWith('page-templates/')) {
      problems.push({kind: 'page_template', name: page.slug, field: page.template, issue: 'page uses a slug-bound or unexpected template'});
    }
  }

  checks.push({name: 'settings', pass: problems.every(problem => problem.kind !== 'settings'), front: pageOnFront, posts: pageForPosts});
  checks.push({name: 'stored-values', pass: !problems.some(problem => ['stored_meta', 'stored_term_meta'].includes(problem.kind)), checked: (remote.terms ?? []).length});
  return {pass: problems.length === 0, checks, problems};
}
