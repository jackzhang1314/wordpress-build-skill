import {createHash} from 'node:crypto';
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {shellQuote} from './ssh.mjs';
import {
  buildNavigationPostContent,
  parseNavigationPostContent,
  resolveNavigationOwnership,
  summarizeBlockTemplates,
} from './shape-diagnosis.mjs';

const PLAN_VERSION = 1;

function sha256(value) {
  return createHash('sha256').update(String(value ?? ''), 'utf8').digest('hex');
}

function safeJson(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function argValue(args, name, fallback = undefined) {
  const index = args.indexOf(name);
  return index >= 0 && index + 1 < args.length ? args[index + 1] : fallback;
}

export function firstPositional(args) {
  return args.filter(item => !item.startsWith('--'))[0];
}

function compactTemplate(template) {
  return {
    id: template.id,
    slug: template.slug,
    source: template.source,
    wpId: template.wpId,
    contentHash: template.contentHash,
    templateParts: template.templateParts,
    navigationRefs: template.navigationRefs,
    inlineNavigationBlocks: template.inlineNavigationBlocks,
    invalidBlockAttributes: template.invalidBlockAttributes,
  };
}

function selectedPartsWithHash(selectedParts, allParts) {
  return selectedParts.map(part => {
    if (part.status !== 'selected') return part;
    const inventoryPart = allParts.find(item => item.slug === part.slug && item.source === part.source);
    return {...part, contentHash: inventoryPart?.contentHash ?? null};
  });
}

const INVENTORY_PHP = `echo wp_json_encode(array(
  'marker' => 'wordpress-builder-block-navigation/1',
  'siteUrl' => (string) get_option('siteurl'),
  'theme' => get_stylesheet(),
  'templates' => get_block_templates(array(), 'wp_template'),
  'parts' => get_block_templates(array(), 'wp_template_part'),
  'navigationPosts' => array_map(static function ($post) {
    return array(
      'id' => (int) $post->ID,
      'slug' => (string) $post->post_name,
      'title' => (string) $post->post_title,
      'status' => (string) $post->post_status,
      'content' => (string) $post->post_content,
      'modified' => (string) $post->post_modified_gmt,
    );
  }, get_posts(array('post_type' => 'wp_navigation', 'post_status' => 'publish', 'numberposts' => -1, 'no_found_rows' => true))),
));`;

function collectInventory(ssh) {
  const value = safeJson(ssh.wp(['eval', INVENTORY_PHP]), null);
  if (value?.marker !== 'wordpress-builder-block-navigation/1') throw new Error('remote block navigation inventory failed');
  return {
    siteUrl: String(value.siteUrl ?? ''),
    theme: String(value.theme ?? ''),
    templates: summarizeBlockTemplates(value.templates, 'wp_template'),
    parts: summarizeBlockTemplates(value.parts, 'wp_template_part'),
    navigationPosts: (Array.isArray(value.navigationPosts) ? value.navigationPosts : []).map(post => ({
      id: Number(post.id),
      slug: String(post.slug ?? ''),
      title: String(post.title ?? ''),
      status: String(post.status ?? ''),
      content: String(post.content ?? ''),
      contentHash: sha256(post.content ?? ''),
      modified: String(post.modified ?? ''),
    })),
  };
}

function normalizeRoute(route) {
  const value = String(route ?? '');
  if (!value.startsWith('/') || value.startsWith('//')) throw new Error('block navigation requires an absolute site path such as / or /about/');
  return value;
}

async function probeRoute({route, siteUrl, fetchImpl, nonce}) {
  const target = new URL(normalizeRoute(route), siteUrl);
  target.searchParams.set('_wp-find-template', '1');
  target.searchParams.set('_wp-builder-nav', nonce);
  const response = await fetchImpl(target, {
    headers: {accept: 'application/json'},
    redirect: 'follow',
    signal: globalThis.AbortSignal?.timeout(30000),
  });
  const text = await response.text();
  const payload = safeJson(text, null);
  if (!response.ok || payload?.success !== true || !payload.data) {
    throw new Error(`WordPress route probe failed with HTTP ${response.status}; cannot prove navigation ownership`);
  }
  const [selected] = summarizeBlockTemplates([payload.data], 'wp_template');
  selected.status = 'selected';
  return selected;
}

function routeOwnership(inventory, selectedTemplate) {
  return resolveNavigationOwnership({
    selectedTemplate,
    templateParts: inventory.parts,
    classicMenus: [],
    renderingSystem: 'block-fse',
  });
}

function chooseNavigationTarget({ownership, explicitId, navigationPosts}) {
  const candidateIds = [...new Set(ownership.navigationRefs.map(reference => reference.id))];
  if (candidateIds.length === 0) {
    throw new Error(ownership.inlineNavigationBlocks > 0 || ownership.owners.length > 0
      ? 'this route uses an inline Navigation block without a wp_navigation ref; template-part editing is required'
      : 'this route does not reference a wp_navigation post');
  }
  let targetId;
  if (explicitId !== undefined) {
    targetId = Number(explicitId);
    if (!candidateIds.includes(targetId)) {
      throw new Error(`wp_navigation ${targetId} is not used by this route; candidates: ${candidateIds.join(', ')}`);
    }
  } else if (candidateIds.length === 1) {
    targetId = candidateIds[0];
  } else {
    throw new Error(`this route references multiple wp_navigation posts (${candidateIds.join(', ')}); pass --navigation <id>`);
  }
  const post = navigationPosts.find(item => item.id === targetId);
  if (!post) throw new Error(`wp_navigation ${targetId} is referenced by the route but is missing from publish inventory`);
  return post;
}

function normalizeLinks(input, siteUrl) {
  const rows = Array.isArray(input?.links) ? input.links : null;
  if (!rows || rows.length === 0 || rows.length > 20) throw new Error('block navigation input must contain 1-20 links');
  return rows.map(row => {
    const label = String(row?.label ?? '').trim();
    const path = String(row?.path ?? '');
    const hasControlCharacter = [...label].some(character => character.charCodeAt(0) < 32);
    if (!label || label.length > 100 || hasControlCharacter) throw new Error('each navigation link needs a 1-100 character label');
    normalizeRoute(path);
    let url;
    try {
      url = new URL(path, siteUrl).toString();
    } catch (error) {
      throw new Error(`invalid navigation path: ${path}`, {cause: error});
    }
    return {label, path, url};
  });
}

function planPath(root, planId) {
  return join(root, '.wordpress-builder', 'block-nav-plans', `${planId}.json`);
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function impactFor(inventory, navigationId) {
  return {
    templates: inventory.templates
      .filter(template => template.navigationRefs.includes(navigationId))
      .map(template => ({slug: template.slug, source: template.source, id: template.id})),
    templateParts: inventory.parts
      .filter(part => part.navigationRefs.includes(navigationId))
      .map(part => ({slug: part.slug, source: part.source, id: part.id, area: part.area})),
  };
}

function stageAndRun(ssh, tag, files) {
  const dir = `/tmp/${tag}`;
  ssh.run(`mkdir -p ${shellQuote(dir)}`);
  for (const file of files) {
    ssh.run(`cat > ${shellQuote(`${dir}/${file.name}`)}`, {input: Buffer.from(file.content, 'utf8')});
  }
  const output = ssh.wp(['eval-file', `${dir}/${files[0].name}`, ...files.slice(1).map(file => `${dir}/${file.name}`)]);
  return JSON.parse(output.slice(output.indexOf('{')));
}

const UPDATE_PHP = `<?php
if (!defined('ABSPATH')) exit('CLI only');
$p = json_decode(file_get_contents($args[0]), true);
$post = get_post((int) $p['id']);
if (!$post || $post->post_type !== 'wp_navigation') { fwrite(STDERR, 'navigation-not-found'); exit(1); }
if (hash('sha256', (string) $post->post_content) !== $p['beforeHash']) { fwrite(STDERR, 'navigation-drift'); exit(1); }
$result = wp_update_post(['ID' => $post->ID, 'post_content' => $p['content']], true);
if (is_wp_error($result)) { fwrite(STDERR, $result->get_error_message()); exit(1); }
$current = get_post((int) $result);
echo wp_json_encode(['id' => (int) $result, 'hash' => hash('sha256', (string) $current->post_content)]);
`;

const ROLLBACK_PHP = `<?php
if (!defined('ABSPATH')) exit('CLI only');
$p = json_decode(file_get_contents($args[0]), true);
$post = get_post((int) $p['id']);
if (!$post || $post->post_type !== 'wp_navigation') { fwrite(STDERR, 'navigation-not-found'); exit(1); }
$result = wp_update_post(['ID' => $post->ID, 'post_content' => $p['content']], true);
if (is_wp_error($result)) { fwrite(STDERR, $result->get_error_message()); exit(1); }
$current = get_post((int) $result);
echo wp_json_encode(['id' => (int) $result, 'hash' => hash('sha256', (string) $current->post_content)]);
`;

function assertSameRoute(plan, inventory, selectedTemplate, currentNavigation) {
  if (inventory.siteUrl !== plan.siteUrl || inventory.theme !== plan.theme) {
    throw new Error('site URL or active theme changed since the block navigation plan; regenerate the plan');
  }
  const ownership = routeOwnership(inventory, selectedTemplate);
  if (ownership.confidence !== 'high') throw new Error('current navigation ownership is not high confidence; regenerate the plan');
  const expected = compactTemplate(plan.selectedTemplate);
  const actual = compactTemplate(selectedTemplate);
  if (JSON.stringify(expected) !== JSON.stringify(actual)) {
    throw new Error('the selected route template changed since the block navigation plan; regenerate the plan');
  }
  const currentParts = selectedPartsWithHash(ownership.selectedParts, inventory.parts);
  if (JSON.stringify(currentParts) !== JSON.stringify(plan.selectedParts)) {
    throw new Error('the selected template parts changed since the block navigation plan; regenerate the plan');
  }
  if (!ownership.wpNavigationIds.includes(plan.navigation.id)) {
    throw new Error('the selected route no longer references the planned wp_navigation post');
  }
  if (currentNavigation.contentHash !== plan.navigation.beforeHash && currentNavigation.contentHash !== plan.navigation.afterHash) {
    throw new Error('Manual edit conflict: wp_navigation changed since the block navigation plan; regenerate the plan');
  }
}

async function verifyFrontend(plan, fetchImpl) {
  const target = new URL(plan.route, plan.siteUrl);
  target.searchParams.set('_wp-builder-nav-verify', `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`);
  const response = await fetchImpl(target, {
    headers: {accept: 'text/html'},
    redirect: 'follow',
    signal: globalThis.AbortSignal?.timeout(30000),
  });
  const html = await response.text();
  if (!response.ok) throw new Error(`live navigation verification failed with HTTP ${response.status}`);
  const missing = plan.links.filter(link => !html.includes(link.label)).map(link => link.label);
  if (missing.length) throw new Error(`live navigation verification missing labels: ${missing.join(', ')}`);
  return {status: response.status, verifiedLabels: plan.links.map(link => link.label)};
}

function writeSnapshot(root, data) {
  const dir = join(root, '.backups', 'external-writes');
  mkdirSync(dir, {recursive: true});
  const id = `${new Date().toISOString().replace(/[:.]/g, '-')}-block-nav-update`;
  const path = join(dir, `${id}.json`);
  const manifest = {id, createdAt: new Date().toISOString(), ...data};
  writeJson(path, manifest);
  return {id, path};
}

export async function planBlockNavigation(site, args, logger = () => {}, {fetchImpl = globalThis.fetch} = {}) {
  const route = normalizeRoute(argValue(args, '--route'));
  const file = argValue(args, '--file');
  const explicitNavigation = argValue(args, '--navigation');
  if (!route || !file) throw new Error('usage: nav block plan --route </path/> --file <links.json> [--navigation <id>]');
  const inputPath = resolve(site.root, file);
  if (!existsSync(inputPath)) throw new Error(`block navigation input not found: ${inputPath}`);
  const input = safeJson(readFileSync(inputPath, 'utf8'), null);

  const inventory = collectInventory(site.ssh);
  if (!inventory.siteUrl) throw new Error('remote site URL is empty');
  const links = normalizeLinks(input, inventory.siteUrl);
  const selectedTemplate = await probeRoute({
    route,
    siteUrl: inventory.siteUrl,
    fetchImpl,
    nonce: `plan-${Date.now()}`,
  });
  const ownership = routeOwnership(inventory, selectedTemplate);
  if (ownership.confidence !== 'high') throw new Error('cannot plan a block navigation write without high-confidence route ownership');
  const navigation = chooseNavigationTarget({
    ownership,
    explicitId: explicitNavigation,
    navigationPosts: inventory.navigationPosts,
  });
  const before = parseNavigationPostContent(navigation.content);
  if (!before.supported) {
    const reasons = before.unsupportedBlocks.map(item => `${item.type}:${item.reason}`).join(', ');
    throw new Error(`wp_navigation ${navigation.id} is not a supported flat navigation-link list (${reasons})`);
  }
  const afterContent = buildNavigationPostContent(links);
  const selectedParts = selectedPartsWithHash(ownership.selectedParts, inventory.parts);
  const plan = {
    version: PLAN_VERSION,
    createdAt: new Date().toISOString(),
    siteUrl: inventory.siteUrl,
    route,
    theme: inventory.theme,
    selectedTemplate: compactTemplate(selectedTemplate),
    selectedParts,
    navigation: {
      id: navigation.id,
      slug: navigation.slug,
      title: navigation.title,
      beforeContent: navigation.content,
      beforeHash: navigation.contentHash,
      afterContent,
      afterHash: sha256(afterContent),
    },
    links,
    impact: impactFor(inventory, navigation.id),
  };
  const planId = sha256(JSON.stringify(plan));
  const path = planPath(site.root, planId);
  mkdirSync(join(path, '..'), {recursive: true});
  writeJson(path, plan);
  const result = {
    planId,
    planPath: path,
    route,
    navigationId: navigation.id,
    owner: ownership.navigationRefs.find(reference => reference.id === navigation.id)?.owner ?? null,
    beforeLinks: before.links,
    afterLinks: links,
    impact: plan.impact,
  };
  logger(`  OK  block navigation plan ${planId}`);
  logger(`      route ${route} -> ${result.owner ?? `wp_navigation:${navigation.id}`}`);
  return result;
}

export async function applyBlockNavigation(site, args, logger = () => {}, {fetchImpl = globalThis.fetch} = {}) {
  const planId = argValue(args, '--plan');
  if (!/^[a-f0-9]{64}$/.test(String(planId ?? ''))) throw new Error('usage: nav block apply --plan <plan-id>');
  const path = planPath(site.root, planId);
  if (!existsSync(path)) throw new Error(`block navigation plan not found: ${path}`);
  const plan = safeJson(readFileSync(path, 'utf8'), null);
  if (!plan || sha256(JSON.stringify(plan)) !== planId) throw new Error('block navigation plan hash mismatch');
  if (plan.version !== PLAN_VERSION) throw new Error(`unsupported block navigation plan version: ${plan.version}`);

  const inventory = collectInventory(site.ssh);
  const selectedTemplate = await probeRoute({
    route: plan.route,
    siteUrl: inventory.siteUrl,
    fetchImpl,
    nonce: `apply-${Date.now()}`,
  });
  const currentNavigation = inventory.navigationPosts.find(item => item.id === plan.navigation.id);
  if (!currentNavigation) throw new Error(`planned wp_navigation ${plan.navigation.id} is missing`);
  assertSameRoute(plan, inventory, selectedTemplate, currentNavigation);
  if (currentNavigation.contentHash === plan.navigation.afterHash) {
    const frontend = await verifyFrontend(plan, fetchImpl);
    return {action: 'noop', planId, navigationId: plan.navigation.id, frontend};
  }

  const snapshot = writeSnapshot(site.root, {
    kind: 'block-nav-update',
    planId,
    route: plan.route,
    navigation: {
      id: plan.navigation.id,
      beforeContent: plan.navigation.beforeContent,
      beforeHash: plan.navigation.beforeHash,
      afterContent: plan.navigation.afterContent,
      afterHash: plan.navigation.afterHash,
    },
  });
  let frontend;
  try {
    const update = stageAndRun(site.ssh, `block-nav-${planId.slice(0, 12)}`, [
      {name: 'update.php', content: UPDATE_PHP},
      {
        name: 'payload.json',
        content: JSON.stringify({
          id: plan.navigation.id,
          beforeHash: plan.navigation.beforeHash,
          content: plan.navigation.afterContent,
        }),
      },
    ]);
    if (update.hash !== plan.navigation.afterHash) throw new Error('block navigation readback failed after update');
    site.ssh.wp(['cache', 'flush']);
    frontend = await verifyFrontend(plan, fetchImpl);
  } catch (error) {
    const rollback = stageAndRun(site.ssh, `block-nav-rollback-${planId.slice(0, 12)}`, [
      {name: 'rollback.php', content: ROLLBACK_PHP},
      {
        name: 'payload.json',
        content: JSON.stringify({
          id: plan.navigation.id,
          content: plan.navigation.beforeContent,
        }),
      },
    ]);
    if (rollback.hash !== plan.navigation.beforeHash) {
      throw new Error(`CRITICAL: ${error.message}; automatic rollback readback also failed`, {cause: error});
    }
    throw new Error(`${error.message}; automatic rollback restored wp_navigation ${plan.navigation.id}`, {cause: error});
  }

  const receipt = {
    planId,
    appliedAt: new Date().toISOString(),
    action: 'update',
    navigationId: plan.navigation.id,
    snapshot,
    frontend,
  };
  writeJson(join(path, '..', `${planId}-receipt.json`), receipt);
  logger(`  OK  block navigation updated: wp_navigation ${plan.navigation.id}; live labels verified`);
  return receipt;
}
