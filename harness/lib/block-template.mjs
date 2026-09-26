import {createHash} from 'node:crypto';
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {shellQuote} from './ssh.mjs';
import {
  fullContentHash,
  patchBlockTemplateContent,
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

const INVENTORY_PHP = `echo wp_json_encode(array(
  'marker' => 'wordpress-builder-block-templates/1',
  'siteUrl' => (string) get_option('siteurl'),
  'theme' => get_stylesheet(),
  'templates' => get_block_templates(array(), 'wp_template'),
  'parts' => get_block_templates(array(), 'wp_template_part'),
));`;

function collectInventory(ssh) {
  const value = safeJson(ssh.wp(['eval', INVENTORY_PHP]), null);
  if (value?.marker !== 'wordpress-builder-block-templates/1') throw new Error('remote block template inventory failed');
  return {
    siteUrl: String(value.siteUrl ?? ''),
    theme: String(value.theme ?? ''),
    rawTemplates: Array.isArray(value.templates) ? value.templates : [],
    rawParts: Array.isArray(value.parts) ? value.parts : [],
    templates: summarizeBlockTemplates(value.templates, 'wp_template'),
    parts: summarizeBlockTemplates(value.parts, 'wp_template_part'),
  };
}

function normalizeRoute(route) {
  const value = String(route ?? '');
  if (!value.startsWith('/') || value.startsWith('//')) throw new Error('block template patching requires an absolute site path such as / or /about/');
  return value;
}

async function probeRoute({route, siteUrl, fetchImpl, nonce}) {
  const target = new URL(normalizeRoute(route), siteUrl);
  target.searchParams.set('_wp-find-template', '1');
  target.searchParams.set('_wp-builder-template', nonce);
  const response = await fetchImpl(target, {
    headers: {accept: 'application/json'},
    redirect: 'follow',
    signal: globalThis.AbortSignal?.timeout(30000),
  });
  const payload = safeJson(await response.text(), null);
  if (!response.ok || payload?.success !== true || !payload.data) {
    throw new Error(`WordPress route probe failed with HTTP ${response.status}; cannot prove template ownership`);
  }
  const [selected] = summarizeBlockTemplates([payload.data], 'wp_template');
  selected.status = 'selected';
  return selected;
}

function compactProbeTemplate(template) {
  return {
    id: template.id,
    slug: template.slug,
    source: template.source,
    contentHash: template.contentHash,
    templateParts: template.templateParts,
    navigationRefs: template.navigationRefs,
    inlineNavigationBlocks: template.inlineNavigationBlocks,
    invalidBlockAttributes: template.invalidBlockAttributes,
  };
}

function selectedPartsFor({selectedTemplate, inventory}) {
  return (selectedTemplate.templateParts ?? []).map(reference => {
    const part = inventory.parts.find(item => item.slug === reference.slug
      && (!reference.theme || item.id.startsWith(`${reference.theme}//`)));
    if (!part) return {...reference, status: 'missing', confidence: 'low'};
    return {
      id: part.id,
      slug: part.slug,
      wpId: part.wpId,
      area: part.area,
      source: part.source,
      status: 'selected',
      contentHash: part.contentHash,
      navigationRefs: part.navigationRefs,
      inlineNavigationBlocks: part.inlineNavigationBlocks,
      invalidBlockAttributes: part.invalidBlockAttributes,
      confidence: 'high',
    };
  });
}

function assertHighConfidenceRoute(selectedTemplate, inventory) {
  const ownership = resolveNavigationOwnership({
    selectedTemplate,
    templateParts: inventory.parts,
    classicMenus: [],
    renderingSystem: 'block-fse',
  });
  if (selectedTemplate.invalidBlockAttributes > 0 || ownership.selectedParts.some(part => part.status === 'missing')) {
    throw new Error('selected route template has missing parts or invalid markup; refuse template patch');
  }
  return ownership;
}

function rawTemplate(rows, summary) {
  return rows.find(item => String(item.id ?? '') === summary.id && String(item.source ?? 'theme') === summary.source);
}

function targetFor({args, inventory, selectedTemplate}) {
  const partSlug = argValue(args, '--part');
  const templateSlug = argValue(args, '--template');
  if (Boolean(partSlug) === Boolean(templateSlug)) {
    throw new Error('use exactly one target selector: --part <slug> or --template <slug>');
  }
  assertHighConfidenceRoute(selectedTemplate, inventory);
  if (partSlug !== undefined) {
    const selected = selectedPartsFor({selectedTemplate, inventory}).filter(part => part.slug === partSlug);
    if (selected.length === 0) throw new Error(`part ${partSlug} is not selected by this route`);
    if (selected.length > 1) throw new Error(`part ${partSlug} is ambiguous on this route`);
    const summary = selected[0];
    const raw = rawTemplate(inventory.rawParts, summary);
    if (!raw) throw new Error(`selected part ${partSlug} is missing from template inventory`);
    return {
      kind: 'wp_template_part',
      slug: summary.slug,
      id: summary.id,
      source: summary.source,
      wpId: summary.wpId,
      area: summary.area || 'uncategorized',
      beforeContent: String(raw.content ?? ''),
      selectedSummary: summary,
    };
  }
  if (selectedTemplate.slug !== templateSlug) {
    throw new Error(`template ${templateSlug} is not selected by this route; selected template is ${selectedTemplate.slug}`);
  }
  const raw = rawTemplate(inventory.rawTemplates, selectedTemplate);
  if (!raw) throw new Error(`selected template ${templateSlug} is missing from template inventory`);
  return {
    kind: 'wp_template',
    slug: selectedTemplate.slug,
    id: selectedTemplate.id,
    source: selectedTemplate.source,
    wpId: selectedTemplate.wpId,
    area: '',
    beforeContent: String(raw.content ?? ''),
    selectedSummary: selectedTemplate,
  };
}

function parsePatchInput(raw, replacement) {
  const input = safeJson(raw, null);
  const find = String(input?.find ?? '');
  const replace = String(input?.replace ?? '');
  const verifyText = Array.isArray(input?.verifyText) ? input.verifyText.map(String) : [];
  if (verifyText.length === 0 || verifyText.length > 5) throw new Error('template patch requires 1-5 verifyText values');
  if (verifyText.some(value => !value.trim() || value.length > 200)) throw new Error('verifyText values must be 1-200 characters');
  if (!verifyText.every(value => replacement.includes(value))) throw new Error('every verifyText value must occur in replace');
  return {find, replace, verifyText};
}

function planPath(root, planId) {
  return join(root, '.wordpress-builder', 'block-template-plans', `${planId}.json`);
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
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

const ACTION_PHP = `<?php
if (!defined('ABSPATH')) exit('CLI only');
$p = json_decode(file_get_contents($args[0]), true);
$type = $p['type'];
$slug = $p['slug'];
$theme = $p['theme'];
$content = $p['content'];
$readback = function (int $postId) use ($type, $slug): array {
  $post = get_post($postId);
  if (!$post || $post->post_type !== $type || $post->post_name !== $slug) return array();
  return array('wpId' => (int) $post->ID, 'source' => 'custom', 'hash' => hash('sha256', (string) $post->post_content));
};
if ($p['mode'] === 'create') {
  $existing = get_posts(array('post_type' => $type, 'post_status' => 'publish', 'name' => $slug, 'numberposts' => 1));
  if ($existing) { fwrite(STDERR, 'custom-override-already-exists'); exit(1); }
  $postId = wp_insert_post(array(
    'post_type' => $type,
    'post_status' => 'publish',
    'post_name' => $slug,
    'post_title' => $p['title'],
    'post_content' => $content,
  ), true);
  if (is_wp_error($postId)) { fwrite(STDERR, $postId->get_error_message()); exit(1); }
  wp_set_object_terms((int) $postId, $theme, 'wp_theme');
  if ($type === 'wp_template_part') wp_set_object_terms((int) $postId, $p['area'], 'wp_template_part_area');
  $result = $readback((int) $postId);
  if (empty($result) || $result['hash'] !== hash('sha256', $content)) {
    wp_delete_post((int) $postId, true);
    fwrite(STDERR, 'create-readback-failed');
    exit(1);
  }
  echo wp_json_encode($result);
  exit;
}
$postId = (int) $p['wpId'];
$post = get_post($postId);
if (!$post || $post->post_type !== $type || $post->post_name !== $slug) { fwrite(STDERR, 'override-not-found'); exit(1); }
if ($p['mode'] === 'delete') {
  $deleted = wp_delete_post($postId, true);
  if (!$deleted) { fwrite(STDERR, 'delete-failed'); exit(1); }
  $remaining = get_posts(array('post_type' => $type, 'post_status' => 'publish', 'name' => $slug, 'numberposts' => 1));
  if ($remaining) { fwrite(STDERR, 'delete-readback-failed'); exit(1); }
  echo wp_json_encode(array('deleted' => true));
  exit;
}
if (hash('sha256', (string) $post->post_content) !== $p['beforeHash']) { fwrite(STDERR, 'override-drift'); exit(1); }
$result = wp_update_post(array('ID' => $postId, 'post_content' => $content), true);
if (is_wp_error($result)) { fwrite(STDERR, $result->get_error_message()); exit(1); }
$readbackResult = $readback((int) $result);
if (empty($readbackResult) || $readbackResult['hash'] !== hash('sha256', $content)) { fwrite(STDERR, 'update-readback-failed'); exit(1); }
echo wp_json_encode($readbackResult);
`;

function writePayload(plan, mode, content = plan.target.afterContent) {
  return {
    mode,
    type: plan.target.kind,
    slug: plan.target.slug,
    theme: plan.theme,
    area: plan.target.area || 'uncategorized',
    title: plan.target.slug,
    wpId: plan.target.wpId,
    beforeHash: plan.target.beforeHash,
    content,
  };
}

function assertSameRoute(plan, inventory, selectedTemplate, currentTarget) {
  if (inventory.siteUrl !== plan.siteUrl || inventory.theme !== plan.theme) {
    throw new Error('site URL or active theme changed since the block template plan; regenerate the plan');
  }
  if (selectedTemplate.id !== plan.selectedTemplate.id || selectedTemplate.slug !== plan.selectedTemplate.slug) {
    throw new Error('the selected route template changed since the block template plan; regenerate the plan');
  }
  if (plan.target.kind === 'wp_template_part') {
    const part = selectedPartsFor({selectedTemplate, inventory}).find(item => item.slug === plan.target.slug);
    if (!part || part.status !== 'selected' || part.source !== plan.target.source) {
      throw new Error('the selected template part ownership changed since the block template plan; regenerate the plan');
    }
    if (fullContentHash(currentTarget.beforeContent) !== plan.target.beforeHash) {
      throw new Error('Manual edit conflict: target template part changed since the plan');
    }
  } else if (selectedTemplate.source !== plan.target.source || fullContentHash(currentTarget.beforeContent) !== plan.target.beforeHash) {
    throw new Error('Manual edit conflict: target route template changed since the plan');
  }
}

function assertRouteReferenceForOverride(plan, inventory, selectedTemplate) {
  if (plan.target.kind === 'wp_template_part') {
    const part = selectedPartsFor({selectedTemplate, inventory}).find(item => item.slug === plan.target.slug);
    if (!part || part.status !== 'selected' || part.source !== plan.target.nextSource) {
      throw new Error('the selected route no longer owns the planned custom template part');
    }
    return;
  }
  if (selectedTemplate.id !== plan.selectedTemplate.id
    || selectedTemplate.slug !== plan.target.slug
    || selectedTemplate.source !== plan.target.nextSource) {
    throw new Error('the selected route no longer owns the planned custom template');
  }
}

function currentTargetFor(plan, inventory) {
  const rows = plan.target.kind === 'wp_template_part' ? inventory.rawParts : inventory.rawTemplates;
  return rows.find(item => String(item.id ?? '') === plan.target.id && String(item.source ?? 'theme') === plan.target.source);
}

function currentOverrideFor(plan, inventory) {
  const rows = plan.target.kind === 'wp_template_part' ? inventory.rawParts : inventory.rawTemplates;
  const expectedId = `${plan.theme}//${plan.target.slug}`;
  return rows.find(item => String(item.id ?? '') === expectedId && String(item.source ?? '') === 'custom');
}

async function verifyFrontend(plan, fetchImpl) {
  const target = new URL(plan.route, plan.siteUrl);
  target.searchParams.set('_wp-builder-template-verify', `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`);
  const response = await fetchImpl(target, {
    headers: {accept: 'text/html'},
    redirect: 'follow',
    signal: globalThis.AbortSignal?.timeout(30000),
  });
  const html = await response.text();
  if (!response.ok) throw new Error(`live template verification failed with HTTP ${response.status}`);
  const missing = plan.patch.verifyText.filter(value => !html.includes(value));
  if (missing.length) throw new Error(`live template verification missing text: ${missing.join(', ')}`);
  return {status: response.status, verifiedText: plan.patch.verifyText};
}

function writeSnapshot(root, data) {
  const dir = join(root, '.backups', 'external-writes');
  mkdirSync(dir, {recursive: true});
  const id = `${new Date().toISOString().replace(/[:.]/g, '-')}-block-template-patch`;
  const path = join(dir, `${id}.json`);
  const manifest = {id, createdAt: new Date().toISOString(), ...data};
  writeJson(path, manifest);
  return {id, path};
}

export async function planBlockTemplate(site, args, logger = () => {}, {fetchImpl = globalThis.fetch} = {}) {
  const route = normalizeRoute(argValue(args, '--route'));
  const file = argValue(args, '--file');
  if (!route || !file) throw new Error('usage: block-template plan --route </path/> (--part <slug>|--template <slug>) --file <patch.json>');
  const inputPath = resolve(site.root, file);
  if (!existsSync(inputPath)) throw new Error(`block template patch not found: ${inputPath}`);
  const input = safeJson(readFileSync(inputPath, 'utf8'), null);
  if (!input) throw new Error(`block template patch is not valid JSON: ${inputPath}`);
  const preliminary = parsePatchInput(JSON.stringify({
    find: input?.find,
    replace: input?.replace,
    verifyText: input?.verifyText,
  }), String(input?.replace ?? ''));

  const inventory = collectInventory(site.ssh);
  if (!inventory.siteUrl) throw new Error('remote site URL is empty');
  const selectedTemplate = await probeRoute({route, siteUrl: inventory.siteUrl, fetchImpl, nonce: `plan-${Date.now()}`});
  const target = targetFor({args, inventory, selectedTemplate});
  const patch = patchBlockTemplateContent(target.beforeContent, preliminary.find, preliminary.replace);
  const nextSource = 'custom';
  const plan = {
    version: PLAN_VERSION,
    createdAt: new Date().toISOString(),
    siteUrl: inventory.siteUrl,
    route,
    theme: inventory.theme,
    selectedTemplate: compactProbeTemplate(selectedTemplate),
    selectedParts: selectedPartsFor({selectedTemplate, inventory}),
    target: {
      kind: target.kind,
      slug: target.slug,
      id: target.id,
      source: target.source,
      nextSource,
      wpId: target.wpId,
      area: target.area,
      action: target.source === 'custom' ? 'update' : 'create',
      beforeContent: target.beforeContent,
      beforeHash: patch.beforeHash,
      afterContent: patch.content,
      afterHash: patch.afterHash,
    },
    patch: {
      find: preliminary.find,
      replace: preliminary.replace,
      verifyText: preliminary.verifyText,
    },
  };
  const planId = sha256(JSON.stringify(plan));
  const path = planPath(site.root, planId);
  mkdirSync(join(path, '..'), {recursive: true});
  writeJson(path, plan);
  const result = {
    planId,
    planPath: path,
    route,
    target: {kind: target.kind, slug: target.slug, source: target.source, nextSource, action: plan.target.action},
    owner: target.kind === 'wp_template_part' ? `template-part:${target.slug}` : `template:${target.slug}`,
    beforeHash: patch.beforeHash,
    afterHash: patch.afterHash,
    verifyText: preliminary.verifyText,
  };
  logger(`  OK  block template plan ${planId}`);
  logger(`      ${result.owner}: ${target.source} -> custom; verify ${preliminary.verifyText.join(', ')}`);
  return result;
}

function rollbackAction(plan, created) {
  if (!created) {
    const payload = writePayload(plan, 'update', plan.target.beforeContent);
    payload.beforeHash = plan.target.afterHash;
    return {
      mode: 'update',
      payload,
      expectedHash: plan.target.beforeHash,
    };
  }
  return {
    mode: 'delete',
    payload: writePayload(plan, 'delete'),
    expectedHash: null,
  };
}

export async function applyBlockTemplate(site, args, logger = () => {}, {fetchImpl = globalThis.fetch} = {}) {
  const planId = argValue(args, '--plan');
  if (!/^[a-f0-9]{64}$/.test(String(planId ?? ''))) throw new Error('usage: block-template apply --plan <plan-id>');
  const path = planPath(site.root, planId);
  if (!existsSync(path)) throw new Error(`block template plan not found: ${path}`);
  const plan = safeJson(readFileSync(path, 'utf8'), null);
  if (!plan || sha256(JSON.stringify(plan)) !== planId) throw new Error('block template plan hash mismatch');
  if (plan.version !== PLAN_VERSION) throw new Error(`unsupported block template plan version: ${plan.version}`);

  const inventory = collectInventory(site.ssh);
  const selectedTemplate = await probeRoute({route: plan.route, siteUrl: inventory.siteUrl, fetchImpl, nonce: `apply-${Date.now()}`});
  const currentTarget = currentTargetFor(plan, inventory);
  const currentOverride = currentOverrideFor(plan, inventory);
  if (!currentTarget && !currentOverride) throw new Error('planned template target is missing or its source changed; regenerate the plan');
  if (currentTarget) {
    const beforeHash = fullContentHash(String(currentTarget.content ?? ''));
    if (beforeHash === plan.target.afterHash) {
      assertRouteReferenceForOverride(plan, inventory, selectedTemplate);
      const frontend = await verifyFrontend(plan, fetchImpl);
      return {action: 'noop', planId, target: {...plan.target, beforeContent: undefined, afterContent: undefined}, frontend};
    }
    assertSameRoute(plan, inventory, selectedTemplate, {beforeContent: String(currentTarget.content ?? '')});
  } else if (currentOverride) {
    if (fullContentHash(String(currentOverride.content ?? '')) !== plan.target.afterHash) {
      throw new Error('Manual edit conflict: a custom override changed since the block template plan');
    }
    assertRouteReferenceForOverride(plan, inventory, selectedTemplate);
    const frontend = await verifyFrontend(plan, fetchImpl);
    return {action: 'noop', planId, target: {...plan.target, source: 'custom', beforeContent: undefined, afterContent: undefined}, frontend};
  }

  const created = plan.target.action === 'create';
  const snapshot = writeSnapshot(site.root, {
    kind: 'block-template-patch',
    planId,
    route: plan.route,
    target: {
      kind: plan.target.kind,
      slug: plan.target.slug,
      source: plan.target.source,
      nextSource: plan.target.nextSource,
      beforeContent: plan.target.beforeContent,
      beforeHash: plan.target.beforeHash,
      afterContent: plan.target.afterContent,
      afterHash: plan.target.afterHash,
    },
  });
  let frontend;
  let createdWpId = null;
  try {
    const actionMode = created ? 'create' : 'update';
    const result = stageAndRun(site.ssh, `block-template-${planId.slice(0, 12)}`, [
      {name: 'action.php', content: ACTION_PHP},
      {name: 'payload.json', content: JSON.stringify(writePayload(plan, actionMode))},
    ]);
    if (result.hash !== plan.target.afterHash) throw new Error('block template readback failed after update');
    createdWpId = result.wpId ?? null;
    site.ssh.wp(['cache', 'flush']);
    frontend = await verifyFrontend(plan, fetchImpl);
  } catch (error) {
    let rollbackWpId = createdWpId;
    if (created && !rollbackWpId) {
      const failedInventory = collectInventory(site.ssh);
      rollbackWpId = currentOverrideFor(plan, failedInventory)?.wp_id ?? null;
    }
    const rollback = rollbackAction(plan, created);
    if (created) rollback.payload.wpId = rollbackWpId;
    const rollbackResult = stageAndRun(site.ssh, `block-template-rollback-${planId.slice(0, 12)}`, [
      {name: 'action.php', content: ACTION_PHP},
      {name: 'payload.json', content: JSON.stringify(rollback.payload)},
    ]);
    if (rollback.mode === 'delete') {
      if (rollbackResult.deleted !== true) throw new Error(`CRITICAL: ${error.message}; rollback did not delete the created override`, {cause: error});
    } else if (rollbackResult.hash !== rollback.expectedHash) {
      throw new Error(`CRITICAL: ${error.message}; rollback readback failed`, {cause: error});
    }
    throw new Error(`${error.message}; automatic rollback restored ${plan.target.kind} ${plan.target.slug}`, {cause: error});
  }

  const receipt = {
    planId,
    appliedAt: new Date().toISOString(),
    action: 'update',
    target: {kind: plan.target.kind, slug: plan.target.slug, source: plan.target.nextSource},
    snapshot,
    frontend,
  };
  writeJson(join(path, '..', `${planId}-receipt.json`), receipt);
  logger(`  OK  block template updated: ${plan.target.kind} ${plan.target.slug}; live text verified`);
  return receipt;
}
