import {createHash} from 'node:crypto';
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {shellQuote} from './ssh.mjs';

const PLAN_VERSION = 1;
const ALLOWED_TYPES = ['builder_project', 'builder_service'];
const ALLOWED_TEMPLATES = ['builder-templates/canvas.php', 'builder-templates/landing.php'];
const ALLOWED_FIELDS = [
  'wbc_subtitle',
  'wbc_summary',
  'wbc_cta_label',
  'wbc_cta_url',
  'wbc_benefits',
  'wbc_specifications',
  'wbc_faq',
  'wbc_form_shortcode',
  'wbc_secondary_cta_label',
  'wbc_secondary_cta_url',
];
const URL_FIELDS = ['wbc_cta_url', 'wbc_secondary_cta_url'];
const ALLOWED_STATUSES = ['publish'];

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

function normalizeFields(inputFields, previousFields = {}) {
  const unknownFields = Object.keys(inputFields ?? {}).filter(name => !ALLOWED_FIELDS.includes(name));
  if (unknownFields.length) throw new Error(`unsupported Builder page field(s): ${unknownFields.join(', ')}`);
  const fields = {};
  for (const name of ALLOWED_FIELDS) {
    if (Object.hasOwn(inputFields ?? {}, name)) fields[name] = inputFields[name] === null ? null : String(inputFields[name]);
    else fields[name] = previousFields[name] === undefined || previousFields[name] === null ? null : String(previousFields[name]);
  }
  const formShortcode = fields.wbc_form_shortcode;
  if (formShortcode && !/^\[fluentform\s+id=["']?[0-9]+["']?\]$/.test(String(formShortcode))) {
    throw new Error('wbc_form_shortcode must be a single Fluent Forms id shortcode, for example [fluentform id="3"]');
  }
  for (const name of URL_FIELDS) {
    if (typeof fields[name] === 'string' && fields[name]) {
      try {
        const url = new URL(fields[name]);
        if (!['http:', 'https:'].includes(url.protocol)) throw new Error('invalid protocol');
      } catch {
        throw new Error(`${name} must be a full http(s) URL`);
      }
    }
  }
  return fields;
}

function desiredState(input, current) {
  const type = String(input.type ?? 'builder_project');
  const template = String(input.template ?? 'builder-templates/landing.php');
  const status = String(input.status ?? 'publish');
  if (!ALLOWED_TYPES.includes(type)) throw new Error(`builder page type must be one of: ${ALLOWED_TYPES.join(', ')}`);
  if (!ALLOWED_TEMPLATES.includes(template)) throw new Error(`builder page template must be one of: ${ALLOWED_TEMPLATES.join(', ')}`);
  if (!ALLOWED_STATUSES.includes(status)) throw new Error(`builder page status must be one of: ${ALLOWED_STATUSES.join(', ')}`);
  const title = String(input.title ?? '').trim();
  const slug = String(input.slug ?? '');
  const content = String(input.content ?? '');
  if (!title || title.length > 150) throw new Error('builder page requires a 1-150 character title');
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) throw new Error('builder page slug must be lowercase kebab-case');
  if (!content.trim()) throw new Error('builder page content cannot be empty');
  return {
    type,
    title,
    slug,
    status,
    template,
    excerpt: String(input.excerpt ?? ''),
    content,
    fields: normalizeFields(input.fields, current?.fields),
  };
}

function normalizeVerifyText(input, state) {
  const values = Array.isArray(input?.verifyText) ? input.verifyText.map(String) : [];
  if (values.length === 0 || values.length > 5) throw new Error('builder page requires 1-5 verifyText values');
  if (values.some(value => !value.trim() || value.length > 200)) throw new Error('verifyText values must be 1-200 characters');
  const renderedSource = [
    state.title,
    state.content,
    ...Object.values(state.fields).filter(Boolean),
  ].join('\n');
  if (!values.every(value => renderedSource.includes(value))) throw new Error('every verifyText value must occur in title, content, or Builder fields');
  return values;
}

const PREFLIGHT_PHP = `echo wp_json_encode(array(
  'marker' => 'wordpress-builder-page/1',
  'siteUrl' => home_url('/'),
  'builderCore' => function_exists('wordpress_builder_core_template_path'),
  'types' => array_values(array_filter(['builder_project', 'builder_service'], static function ($type) { return post_type_exists($type); })),
  'templates' => array_keys(wp_get_theme()->get_page_templates(null, $p['type'] ?? 'builder_project')),
  'current' => $post,
));
`;

function remoteState(post) {
  if (!post) return {exists: false};
  return {
    exists: true,
    id: Number(post.ID),
    title: String(post.post_title ?? ''),
    slug: String(post.post_name ?? ''),
    status: String(post.post_status ?? ''),
    excerpt: String(post.post_excerpt ?? ''),
    content: String(post.post_content ?? ''),
    template: String(post.template ?? ''),
    fields: ALLOWED_FIELDS.reduce((fields, name) => {
      fields[name] = post.fields?.[name] === undefined || post.fields?.[name] === null ? null : String(post.fields[name]);
      return fields;
    }, {}),
  };
}

function collectPreflight(ssh, type, slug) {
  const php = `$p = array('type' => ${JSON.stringify(type)}, 'slug' => ${JSON.stringify(slug)});
$post = get_page_by_path($p['slug'], OBJECT, [$p['type']]);
if ($post instanceof WP_Post) {
  $post->template = get_page_template_slug($post->ID);
  $post->fields = array();
  foreach (${JSON.stringify(ALLOWED_FIELDS)} as $name) {
    $value = get_post_meta($post->ID, $name, true);
    $post->fields[$name] = $value === '' ? null : $value;
  }
}
${PREFLIGHT_PHP}`;
  const value = safeJson(ssh.wp(['eval', php]), null);
  if (value?.marker !== 'wordpress-builder-page/1') throw new Error('WordPress Builder page preflight failed');
  if (!value.builderCore) throw new Error('WordPress Builder Core is not active; run `builder install` first');
  if (!value.types.includes(type)) throw new Error(`WordPress Builder Core CPT ${type} is not registered`);
  return {
    siteUrl: String(value.siteUrl ?? ''),
    templates: Array.isArray(value.templates) ? value.templates.map(String) : [],
    current: remoteState(value.current),
  };
}

function stateHash(state) {
  return sha256(JSON.stringify(state));
}

function planPath(root, planId) {
  return join(root, '.wordpress-builder', 'builder-page-plans', `${planId}.json`);
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

const FIELD_NAMES_JSON = JSON.stringify(ALLOWED_FIELDS);

const ACTION_PHP = `<?php
if (!defined('ABSPATH')) exit('CLI only');
$p = json_decode(file_get_contents($args[0]), true);
$names = ${FIELD_NAMES_JSON};
$read = static function (int $id) use ($names): array {
  $post = get_post($id);
  if (!$post) return array();
  $fields = array();
  foreach ($names as $name) {
    $value = get_post_meta($id, $name, true);
    $fields[$name] = $value === '' ? null : $value;
  }
  return array(
    'id' => (int) $post->ID,
    'title' => (string) $post->post_title,
    'slug' => (string) $post->post_name,
    'status' => (string) $post->post_status,
    'excerpt' => (string) $post->post_excerpt,
    'content' => (string) $post->post_content,
    'template' => (string) get_page_template_slug($id),
    'fields' => $fields,
    'url' => (string) get_permalink($id),
  );
};
$desired = $p['desired'];
if ($p['mode'] === 'delete') {
  $post = get_post((int) $p['id']);
  if (!$post || $post->post_type !== $desired['type']) { fwrite(STDERR, 'builder-post-not-found'); exit(1); }
  if (!wp_delete_post((int) $p['id'], true)) { fwrite(STDERR, 'builder-delete-failed'); exit(1); }
  echo wp_json_encode(array('deleted' => true));
  exit;
}
$payload = array(
  'post_type' => $desired['type'],
  'post_title' => $desired['title'],
  'post_name' => $desired['slug'],
  'post_status' => $desired['status'],
  'post_excerpt' => $desired['excerpt'],
  'post_content' => $desired['content'],
);
if (!empty($p['id'])) $payload['ID'] = (int) $p['id'];
$id = wp_insert_post($payload, true);
if (is_wp_error($id)) { fwrite(STDERR, $id->get_error_message()); exit(1); }
$id = (int) $id;
update_post_meta($id, '_wp_page_template', $desired['template']);
foreach ($names as $name) {
  if ($desired['fields'][$name] === null) delete_post_meta($id, $name);
  else update_post_meta($id, $name, $desired['fields'][$name]);
}
$result = $read($id);
if (empty($result) || $result['template'] !== $desired['template']) { fwrite(STDERR, 'builder-readback-failed'); exit(1); }
echo wp_json_encode($result);
`;

function assertNoThirdPartyBuilderData(input) {
  const keys = [...Object.keys(input ?? {}), ...Object.keys(input?.fields ?? {})];
  if (keys.some(key => key.startsWith('_elementor_') || key.startsWith('_et_pb_') || key.startsWith('bricks_'))) {
    throw new Error('third-party page-builder data is not allowed in Builder-managed page input');
  }
}

export async function planBuilderPage(site, args, logger = () => {}) {
  const file = argValue(args, '--file');
  if (!file) throw new Error('usage: builder page plan --file <builder-page.json>');
  const path = resolve(site.root, file);
  if (!existsSync(path)) throw new Error(`builder page input not found: ${path}`);
  const input = safeJson(readFileSync(path, 'utf8'), null);
  if (!input) throw new Error(`builder page input is not valid JSON: ${path}`);
  assertNoThirdPartyBuilderData(input);
  const type = String(input.type ?? 'builder_project');
  const slug = String(input.slug ?? '');
  const preflight = collectPreflight(site.ssh, type, slug);
  if (!preflight.templates.includes(String(input.template ?? 'builder-templates/landing.php'))) {
    throw new Error('selected WordPress Builder template is not exposed for this CPT');
  }
  const desired = desiredState(input, preflight.current.exists ? preflight.current : undefined);
  const verifyText = normalizeVerifyText(input, desired);
  const plan = {
    version: PLAN_VERSION,
    createdAt: new Date().toISOString(),
    siteUrl: preflight.siteUrl,
    prior: preflight.current,
    priorHash: stateHash(preflight.current),
    desired,
    desiredHash: stateHash({...desired, exists: true, id: preflight.current.id ?? null, url: null}),
    verifyText,
  };
  const planId = sha256(JSON.stringify(plan));
  const outputPath = planPath(site.root, planId);
  mkdirSync(join(outputPath, '..'), {recursive: true});
  writeJson(outputPath, plan);
  const result = {
    planId,
    planPath: outputPath,
    action: preflight.current.exists ? 'update' : 'create',
    type,
    slug,
    template: desired.template,
    verifyText,
  };
  logger(`  OK  Builder page plan ${planId}`);
  logger(`      ${result.action} ${type}:${slug} with ${desired.template}`);
  return result;
}

function currentMatchesPlan(current, plan) {
  if (stateHash(current) !== plan.priorHash) {
    throw new Error('Manual edit conflict: Builder-managed target changed after planning; regenerate the plan');
  }
}

async function verifyFrontend(plan, url, fetchImpl) {
  const target = new URL(`?_wp-builder-page=${Date.now()}-${Math.random().toString(16).slice(2, 8)}`, url);
  const response = await fetchImpl(target, {
    headers: {accept: 'text/html'},
    redirect: 'follow',
    signal: globalThis.AbortSignal?.timeout(30000),
  });
  const html = await response.text();
  if (!response.ok) throw new Error(`live Builder page verification failed with HTTP ${response.status}`);
  const missing = plan.verifyText.filter(value => !html.includes(value));
  if (missing.length) throw new Error(`live Builder page verification missing text: ${missing.join(', ')}`);
  return {status: response.status, verifiedText: plan.verifyText};
}

function writeSnapshot(root, data) {
  const dir = join(root, '.backups', 'external-writes');
  mkdirSync(dir, {recursive: true});
  const id = `${new Date().toISOString().replace(/[:.]/g, '-')}-builder-page`;
  const path = join(dir, `${id}.json`);
  writeJson(path, {id, createdAt: new Date().toISOString(), ...data});
  return {id, path};
}

function actionPayload(plan, mode) {
  return {
    mode,
    id: plan.prior.exists ? plan.prior.id : null,
    desired: mode === 'rollback' ? {
      ...plan.prior,
      fields: plan.prior.fields ?? {},
    } : plan.desired,
  };
}

function readbackMatches(result, plan) {
  return result.title === plan.desired.title
    && result.slug === plan.desired.slug
    && result.status === plan.desired.status
    && result.excerpt === plan.desired.excerpt
    && result.content === plan.desired.content
    && result.template === plan.desired.template
    && JSON.stringify(result.fields) === JSON.stringify(plan.desired.fields);
}

export async function applyBuilderPage(site, args, logger = () => {}, {fetchImpl = globalThis.fetch} = {}) {
  const planId = argValue(args, '--plan');
  if (!/^[a-f0-9]{64}$/.test(String(planId ?? ''))) throw new Error('usage: builder page apply --plan <plan-id>');
  const path = planPath(site.root, planId);
  if (!existsSync(path)) throw new Error(`Builder page plan not found: ${path}`);
  const plan = safeJson(readFileSync(path, 'utf8'), null);
  if (!plan || sha256(JSON.stringify(plan)) !== planId) throw new Error('Builder page plan hash mismatch');
  if (plan.version !== PLAN_VERSION) throw new Error(`unsupported Builder page plan version: ${plan.version}`);

  const preflight = collectPreflight(site.ssh, plan.desired.type, plan.desired.slug);
  if (preflight.siteUrl !== plan.siteUrl) throw new Error('site URL changed since the Builder page plan; regenerate the plan');
  const alreadyApplied = preflight.current.exists
    && preflight.current.title === plan.desired.title
    && preflight.current.slug === plan.desired.slug
    && preflight.current.status === plan.desired.status
    && preflight.current.excerpt === plan.desired.excerpt
    && preflight.current.content === plan.desired.content
    && preflight.current.template === plan.desired.template
    && JSON.stringify(preflight.current.fields) === JSON.stringify(plan.desired.fields);
  if (alreadyApplied) {
    const url = site.ssh.wp(['post', 'url', String(preflight.current.id)]).trim();
    const frontend = await verifyFrontend(plan, url, fetchImpl);
    return {action: 'noop', planId, id: preflight.current.id, url, frontend};
  }
  currentMatchesPlan(preflight.current, plan);

  const snapshot = writeSnapshot(site.root, {
    kind: 'builder-page',
    planId,
    prior: plan.prior,
    desired: plan.desired,
  });
  let result;
  try {
    result = stageAndRun(site.ssh, `builder-page-${planId.slice(0, 12)}`, [
      {name: 'action.php', content: ACTION_PHP},
      {name: 'payload.json', content: JSON.stringify(actionPayload(plan, 'write'))},
    ]);
    if (!readbackMatches(result, plan) || !result.url) throw new Error('Builder page readback failed');
    site.ssh.wp(['cache', 'flush']);
    const frontend = await verifyFrontend(plan, result.url, fetchImpl);
    const receipt = {
      planId,
      appliedAt: new Date().toISOString(),
      action: plan.prior.exists ? 'update' : 'create',
      id: result.id,
      url: result.url,
      snapshot,
      frontend,
    };
    writeJson(join(path, '..', `${planId}-receipt.json`), receipt);
    logger(`  OK  Builder page ${receipt.action}: ${plan.desired.type}:${plan.desired.slug}; live text verified`);
    return receipt;
  } catch (error) {
    const rollbackMode = plan.prior.exists ? 'write' : 'delete';
    const rollback = stageAndRun(site.ssh, `builder-page-rollback-${planId.slice(0, 12)}`, [
      {name: 'action.php', content: ACTION_PHP},
      {name: 'payload.json', content: JSON.stringify(actionPayload(plan, rollbackMode === 'delete' ? 'delete' : 'rollback'))},
    ]);
    if (rollbackMode === 'delete') {
      if (rollback.deleted !== true) throw new Error(`CRITICAL: ${error.message}; rollback did not delete the new Builder page`, {cause: error});
    } else {
      const expected = plan.prior;
      if (rollback.title !== expected.title || rollback.content !== expected.content || rollback.template !== expected.template) {
        throw new Error(`CRITICAL: ${error.message}; Builder page rollback readback failed`, {cause: error});
      }
    }
    throw new Error(`${error.message}; automatic rollback restored ${plan.desired.type}:${plan.desired.slug}`, {cause: error});
  }
}
