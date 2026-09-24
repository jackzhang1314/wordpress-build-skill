import {createHash} from 'node:crypto';
import {existsSync, readFileSync, writeFileSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {projectFile} from './config.mjs';
import {shellQuote} from './ssh.mjs';

const STATE_FILE = '.content-state.json';

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

export function argValue(args, name, fallback = undefined) {
  const index = args.indexOf(name);
  return index >= 0 && index + 1 < args.length ? args[index + 1] : fallback;
}

export function hasFlag(args, name) {
  return args.includes(name);
}

export function firstPositional(args) {
  return args.filter(item => !item.startsWith('--'))[0];
}

function readState(root) {
  try {
    return JSON.parse(readFileSync(join(root, STATE_FILE), 'utf8'));
  } catch {
    return {};
  }
}

function writeState(root, state) {
  writeFileSync(join(root, STATE_FILE), JSON.stringify(state, null, 2) + '\n');
}

function stateKey(postType, slug) {
  return `${postType}:${slug}`;
}

export async function fetchFingerprint(ssh, postType, slug) {
  const output = ssh.wp(['post', 'list', '--post_type=' + postType, '--name=' + slug,
    // "any" excludes drafts (exclude_from_search), so enumerate the statuses we manage.
    '--post_status=publish,draft,pending,private,future',
    '--fields=ID,post_status,post_content,post_modified_gmt', '--format=json']);
  const rows = JSON.parse(output);
  const post = Array.isArray(rows) ? rows[0] : undefined;
  if (!post) return {exists: false};
  return {
    exists: true,
    id: Number(post.ID),
    status: post.post_status,
    hash: sha256(String(post.post_content ?? '')),
    modified: post.post_modified_gmt,
  };
}

/**
 * Drift policy: a remote change we did not push must never be silently overwritten.
 * - identical content: no-op, (re)record state
 * - hash equals our last pushed state: clean push
 * - anything else: refuse unless options.adoptRemote
 */
function checkDrift(state, key, remote, localHash, {adoptRemote = false} = {}) {
  if (remote.hash === localHash) return {action: 'noop'};
  const known = state[key]?.hash;
  if (known !== remote.hash && !adoptRemote) {
    const hint = known ? 'was modified after our last push' : 'was never adopted by harness';
    return {action: 'conflict', detail: `remote ${key} ${hint}; rerun with --adopt-remote to overwrite`};
  }
  return {action: 'push'};
}

async function stageAndRun(ssh, projectRoot, tag, files, readback) {
  const dir = `/tmp/${tag}-maintenance`;
  ssh.run(`rm -rf ${shellQuote(dir)} && mkdir -p ${shellQuote(dir)}`);
  for (const file of files) {
    ssh.run(`cat > ${shellQuote(dir + '/' + file.name)}`, {input: Buffer.from(file.content, 'utf8')});
  }
  const output = ssh.wp(['eval-file', `${dir}/${files[0].name}`, ...files.slice(1).map(file => `${dir}/${file.name}`)]);
  const parsed = JSON.parse(output.slice(output.indexOf('{')));
  if (readback) await readback(parsed);
  return parsed;
}

const UPDATE_POST_PHP = `<?php
if (!defined('ABSPATH')) exit('CLI only');
$p = json_decode(file_get_contents($args[0]), true);
$post = get_page_by_path($p['slug'], OBJECT, [$p['type']]);
if (!$post && $p['mode'] !== 'create') { fwrite(STDERR, 'post-not-found'); exit(1); }
if (!$post) {
  $id = wp_insert_post([
    'post_type' => $p['type'], 'post_status' => $p['status'] ?? 'publish', 'post_name' => $p['slug'],
    'post_title' => $p['title'], 'post_content' => $p['content'], 'post_excerpt' => $p['excerpt'] ?? '',
  ], true);
} else {
  $payload = ['ID' => $post->ID, 'post_content' => $p['content']];
  if (!empty($p['title'])) $payload['post_title'] = $p['title'];
  if (array_key_exists('excerpt', $p)) $payload['post_excerpt'] = $p['excerpt'];
  $id = wp_update_post($payload, true);
}
if (is_wp_error($id)) { fwrite(STDERR, $id->get_error_message()); exit(1); }
echo wp_json_encode(['id' => (int) $id]);
`;

async function pushContent({root, ssh}, {postType, slug, title, content, excerpt, mode, status}, {adoptRemote = false} = {}) {
  const localHash = sha256(content);
  const remote = await fetchFingerprint(ssh, postType, slug);
  const key = stateKey(postType, slug);
  const state = readState(root);
  const drift = checkDrift(state, key, remote, localHash, {adoptRemote});
  if (drift.action === 'conflict') {
    throw new Error(`Manual edit conflict: ${drift.detail}`);
  }
  let id = remote.id;
  if (drift.action === 'push') {
    if (mode === 'create-only' && remote.exists) {
      throw new Error(`post ${postType}:${slug} already exists; edit-page is for updates`);
    }
    const result = await stageAndRun(ssh, root, slug.replace(/[^a-z0-9-]/gi, '-'), [
      {name: 'update.php', content: UPDATE_POST_PHP},
      {name: 'payload.json', content: JSON.stringify({slug, type: postType, title, content, excerpt, status, mode})},
    ]);
    id = result.id;
    const verified = await fetchFingerprint(ssh, postType, slug);
    if (!verified.exists || verified.hash !== localHash) {
      throw new Error(`readback failed after pushing ${postType}:${slug}`);
    }
  }
  state[key] = {hash: remote.hash === localHash ? localHash : localHash, id, pushedAt: new Date().toISOString()};
  writeState(root, state);
  return {id, action: drift.action};
}

export async function editPage(site, args, logger = () => {}) {
  const slug = firstPositional(args);
  const file = argValue(args, '--file');
  const postType = argValue(args, '--post-type', 'page');
  if (!slug || !file) throw new Error('usage: harness edit-page <slug> --file <content.html> [--post-type page] [--adopt-remote]');
  const path = resolve(projectFile(site.root, file));
  if (!existsSync(path)) throw new Error(`content file not found: ${path}`);
  const result = await pushContent(site, {
    postType, slug, content: readFileSync(path, 'utf8'), mode: 'update',
  }, {adoptRemote: hasFlag(args, '--adopt-remote')});
  logger(`  ${result.action === 'noop' ? 'OK  no changes' : 'OK  updated'} ${postType}:${slug} (id ${result.id})`);
  return result;
}

export async function pushPost(site, args, logger = () => {}) {
  const file = firstPositional(args);
  if (!file) throw new Error('usage: harness post push <article.json> [--adopt-remote]');
  const path = resolve(projectFile(site.root, file));
  if (!existsSync(path)) throw new Error(`article file not found: ${path}`);
  const payload = JSON.parse(readFileSync(path, 'utf8'));
  if (!payload.title || !payload.slug || !payload.content) {
    throw new Error('article JSON requires title, slug and content');
  }
  const result = await pushContent(site, {
    postType: payload.type ?? 'post',
    slug: payload.slug,
    title: payload.title,
    excerpt: payload.excerpt ?? '',
    content: payload.content,
    status: payload.status ?? 'publish',
    mode: 'create',
  }, {adoptRemote: hasFlag(args, '--adopt-remote')});
  logger(`  ${result.action === 'noop' ? 'OK  no changes' : 'OK  pushed'} ${payload.type ?? 'post'}:${payload.slug} (id ${result.id})`);
  return result;
}

async function listMenuItems(ssh, menuSlug) {
  const items = JSON.parse(ssh.wp(['menu', 'item', 'list', menuSlug, '--format=json']));
  return items.map(item => ({id: Number(item.db_id ?? item.database_id), title: String(item.title ?? '')}));
}

const NAV_ADD_PHP = `<?php
if (!defined('ABSPATH')) exit('CLI only');
$p = json_decode(file_get_contents($args[0]), true);
$menu = wp_get_nav_menu_object($p['menu']);
if (!$menu) { fwrite(STDERR, 'menu-not-found'); exit(1); }
$parentId = 0;
if (!empty($p['parent'])) {
  foreach (wp_get_nav_menu_items($menu->term_id) ?: [] as $item) {
    if (trim($item->title) === $p['parent']) { $parentId = (int) $item->ID; break; }
  }
  if (!$parentId) { fwrite(STDERR, 'parent-not-found'); exit(1); }
}
$id = wp_update_nav_menu_item($menu->term_id, 0, [
  'menu-item-title' => $p['label'], 'menu-item-status' => 'publish',
  'menu-item-type' => 'custom', 'menu-item-object' => 'custom', 'menu-item-url' => $p['url'],
  'menu-item-position' => (int) ($p['position'] ?? 0),
  'menu-item-parent-id' => $parentId,
]);
if (is_wp_error($id)) { fwrite(STDERR, $id->get_error_message()); exit(1); }
echo wp_json_encode(['id' => (int) $id, 'parent' => $parentId]);
`;

const NAV_REMOVE_PHP = `<?php
if (!defined('ABSPATH')) exit('CLI only');
$p = json_decode(file_get_contents($args[0]), true);
$menu = wp_get_nav_menu_object($p['menu']);
if (!$menu) { fwrite(STDERR, 'menu-not-found'); exit(1); }
$removed = 0;
foreach (wp_get_nav_menu_items($menu->term_id) ?: [] as $item) {
  if (trim($item->title) === $p['label']) { wp_delete_post($item->ID, true); $removed++; }
}
echo wp_json_encode(['removed' => $removed]);
`;

export async function navAdd(site, args, logger = () => {}) {
  const label = firstPositional(args);
  const url = argValue(args, '--url');
  const menu = argValue(args, '--menu', 'primary');
  const parent = argValue(args, '--parent');
  if (!label || !url) throw new Error('usage: harness nav add <label> --url <path> [--menu primary] [--parent <item-label>]');
  const result = await stageAndRun(site.ssh, site.root, 'nav-add', [
    {name: 'nav.php', content: NAV_ADD_PHP},
    {name: 'payload.json', content: JSON.stringify({menu, label, url, position: argValue(args, '--position'), parent})},
  ]);
  const items = await listMenuItems(site.ssh, menu);
  if (!items.some(item => item.title === label)) throw new Error(`readback failed: ${label} missing after add`);
  if (parent && !result.parent) throw new Error(`readback failed: ${label} not nested under "${parent}"`);
  logger(`  OK  nav item added: ${label} -> ${url}${parent ? ` (child of ${parent})` : ''} (id ${result.id})`);
  return result;
}

export async function navRemove(site, args, logger = () => {}) {
  const label = firstPositional(args);
  const menu = argValue(args, '--menu', 'primary');
  if (!label) throw new Error('usage: harness nav remove <label> [--menu primary]');
  const result = await stageAndRun(site.ssh, site.root, 'nav-remove', [
    {name: 'nav.php', content: NAV_REMOVE_PHP},
    {name: 'payload.json', content: JSON.stringify({menu, label})},
  ]);
  const items = await listMenuItems(site.ssh, menu);
  if (items.some(item => item.title === label)) throw new Error(`readback failed: ${label} still present`);
  logger(`  OK  nav items removed: ${result.removed} (${label})`);
  return result;
}

const TEMPLATE_PHP = `<?php
if (!defined('ABSPATH')) exit('CLI only');
$p = json_decode(file_get_contents($args[0]), true);
$post = get_page_by_path($p['slug'], OBJECT, ['page']);
if (!$post) { fwrite(STDERR, 'post-not-found'); exit(1); }
update_post_meta($post->ID, '_wp_page_template', $p['template']);
echo wp_json_encode(['id' => (int) $post->ID, 'template' => get_page_template_slug($post->ID)]);
`;

export async function assignTemplate(site, args, logger = () => {}) {
  const slug = firstPositional(args);
  const template = argValue(args, '--template');
  if (!slug || !template) throw new Error('usage: harness template assign <slug> --template <file.php>');
  if (!/^(?:[a-z0-9_-]+|page-templates\/[a-z0-9_-]+)\.php$/.test(template)) {
    throw new Error(`invalid template name: ${template}`);
  }
  const themeDir = projectFile(site.root, site.project.paths.theme);
  const templatePath = join(themeDir, template);
  if (!existsSync(templatePath)) {
    throw new Error(`template not found in theme: ${template} (deploy the theme first)`);
  }
  const source = readFileSync(templatePath, 'utf8');
  if (!/Template\s*Name:/.test(source)) throw new Error(`${template} is missing the "Template Name:" header`);
  if (!/the_content\s*\(/.test(source)) {
    throw new Error(`${template} does not render the editable body (the_content) and must not be assigned`);
  }
  const result = await stageAndRun(site.ssh, site.root, 'template', [
    {name: 'template.php', content: TEMPLATE_PHP},
    {name: 'payload.json', content: JSON.stringify({slug, template})},
  ]);
  const remote = site.ssh.wp(['post', 'meta', 'get', String(result.id), '_wp_page_template']).trim();
  if (remote !== template) throw new Error(`readback failed: meta is ${remote}`);
  logger(`  OK  template assigned: ${slug} -> ${template}`);
  return result;
}

const FIELDS_AUDIT_PHP = `<?php
if (!defined('ABSPATH')) exit('CLI only');
$config = json_decode(file_get_contents($args[0]), true);
$known_types = acf_get_field_types();
$problems = []; $checked = 0;
foreach ($config['types'] as $type) {
  $names = [];
  foreach (acf_get_field_groups(['post_type' => $type]) as $group) {
    foreach (acf_get_fields($group['key']) as $field) {
      $names[$field['name']] = $field['type'];
    }
  }
  foreach (get_posts(['post_type' => $type, 'post_status' => 'any', 'numberposts' => -1]) as $post) {
    foreach (get_post_meta($post->ID) as $meta_key => $ignored) {
      if ($meta_key[0] === '_' || str_starts_with($meta_key, 'rank_math')) continue;
      $checked++;
      if (isset($names[$meta_key])) continue;
      $problems[] = ['post' => $post->post_name, 'type' => $type, 'field' => $meta_key, 'issue' => 'stored value has no admin-editable field definition'];
    }
    $checked++;
    foreach ($names as $name => $field_type) {
      if (!isset($known_types[$field_type])) {
        $problems[] = ['post' => $post->post_name, 'type' => $type, 'field' => $name, 'fieldType' => $field_type, 'issue' => 'field type not available in the installed ACF edition'];
      }
    }
  }
}
echo wp_json_encode(['checked' => $checked, 'problems' => $problems]);
`;

export async function auditFields(site, args, logger = console.log) {
  const registered = new Set(site.ssh.wp(['post-type', 'list', '--field=name']).split('\n').map(line => line.trim()));
  const types = ['page', 'post', ...(site.project.contentCounts ?? []).map(item => item.postType).filter(postType => registered.has(postType))];
  const dir = `/tmp/fields-audit-${Date.now()}`;
  site.ssh.run(`rm -rf ${shellQuote(dir)} && mkdir -p ${shellQuote(dir)}`);
  site.ssh.run(`cat > ${shellQuote(dir + '/audit.php')}`, {input: Buffer.from(FIELDS_AUDIT_PHP, 'utf8')});
  site.ssh.run(`cat > ${shellQuote(dir + '/config.json')}`, {input: Buffer.from(JSON.stringify({types}), 'utf8')});
  const output = site.ssh.wp(['eval-file', `${dir}/audit.php`, `${dir}/config.json`]);
  const report = JSON.parse(output.slice(output.indexOf('{')));
  const pass = report.problems.length === 0;
  if (!pass) {
    for (const problem of report.problems.slice(0, 20)) {
      logger(`    FAIL ${problem.type}:${problem.post} field "${problem.field}" — ${problem.issue}`);
    }
  } else {
    logger(`  OK  field audit: ${report.checked} meta/field pairs, every stored value is admin-editable`);
  }
  return {...report, pass};
}
