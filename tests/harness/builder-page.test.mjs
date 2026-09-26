import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, readFile, readdir, rm, writeFile} from 'node:fs/promises';
import {existsSync, readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {applyBuilderPage, planBuilderPage} from '../../harness/lib/builder-page.mjs';
import {commandMap} from '../../harness/lib/command-map.mjs';

const input = {
  type: 'builder_project',
  title: 'Custom Excavator Solutions',
  slug: 'custom-excavator-solutions',
  status: 'publish',
  template: 'builder-templates/landing.php',
  excerpt: 'Custom attachments',
  content: '<section><h2>Factory capability</h2><p>Buckets and couplers.</p></section>',
  fields: {
    wbc_subtitle: 'OEM attachments',
    wbc_summary: 'Custom buckets for export buyers.',
    wbc_cta_label: 'Request a quote',
    wbc_cta_url: 'https://site.test/contact/',
    wbc_benefits: 'OEM compatibility | Matched to mainstream 20-ton excavator models.\nExport documentation | Commercial invoice, packing list and inspection report included.',
    wbc_specifications: 'Minimum order | One 20-foot container\nProduction time | 25 working days after deposit',
    wbc_faq: 'Can you customize bucket width? | Yes, send the machine model and target working condition.\nDo you provide inspection reports? | Yes, a pre-shipment inspection report is included.',
    wbc_form_shortcode: '[fluentform id="3"]',
    wbc_secondary_cta_label: 'Send requirements',
    wbc_secondary_cta_url: 'https://site.test/contact/',
  },
  verifyText: ['Custom Excavator Solutions', 'Factory capability', 'Matched to mainstream 20-ton excavator models'],
};

function emptyBuilderFields() {
  return {
    wbc_subtitle: null,
    wbc_summary: null,
    wbc_cta_label: null,
    wbc_cta_url: null,
    wbc_benefits: null,
    wbc_specifications: null,
    wbc_faq: null,
    wbc_form_shortcode: null,
    wbc_secondary_cta_label: null,
    wbc_secondary_cta_url: null,
  };
}

function makeSite(existing = null) {
  const state = {post: existing && JSON.parse(JSON.stringify(existing)), nextId: existing?.id ?? 0};
  const files = new Map();
  const ssh = {
    run(command, options = {}) {
      const match = /^cat > (\S+)$/.exec(command);
      if (match) files.set(match[1], options.input?.toString('utf8') ?? '');
      return '';
    },
    wp(args) {
      const text = args.join(' ');
      if (text.includes('wordpress-builder-page/1')) {
        return JSON.stringify({
          marker: 'wordpress-builder-page/1',
          siteUrl: 'https://site.test/',
          builderCore: true,
          types: ['builder_project', 'builder_service'],
          templates: ['builder-templates/canvas.php', 'builder-templates/landing.php'],
          current: state.post ? {
            ID: state.post.id,
            post_title: state.post.title,
            post_name: state.post.slug,
            post_status: state.post.status,
            post_excerpt: state.post.excerpt,
            post_content: state.post.content,
            template: state.post.template,
            fields: state.post.fields,
          } : null,
        });
      }
      if (text.includes('eval-file')) {
        const payload = JSON.parse(files.get(args[2]));
        if (payload.mode === 'delete') {
          if (!state.post || state.post.slug !== payload.desired.slug) throw new Error('builder-post-not-found');
          state.post = null;
          return JSON.stringify({deleted: true});
        }
        const desired = payload.desired;
        if (!state.post) state.post = {id: ++state.nextId, url: `https://site.test/builder-projects/${desired.slug}/`};
        Object.assign(state.post, desired);
        state.post.fields = desired.fields;
        return JSON.stringify(state.post);
      }
      if (text.includes('post url')) return `${state.post?.url ?? ''}\n`;
      if (text.includes('cache flush')) return '';
      throw new Error(`unexpected wp call: ${text}`);
    },
  };
  const fetchImpl = async target => {
    const url = new URL(target);
    if (url.searchParams.has('_wp-builder-page')) {
      const post = state.post;
      return {
        ok: Boolean(post),
        status: post ? 200 : 404,
        text: async () => post ? `<html>${post.title}${post.content}${Object.values(post.fields ?? {}).join('')}</html>` : '<html>missing</html>',
      };
    }
    throw new Error(`unexpected fetch: ${target}`);
  };
  return {state, ssh, fetchImpl};
}

async function makeEnvironment(existing = null) {
  const root = await mkdtemp(join(tmpdir(), 'builder-page-'));
  await writeFile(join(root, 'page.json'), JSON.stringify(input, null, 2));
  const remote = makeSite(existing);
  return {
    root,
    remote,
    site: {root, project: {mode: 'external'}, ssh: remote.ssh},
    cleanup: () => rm(root, {recursive: true, force: true}),
  };
}

test('builder page plans are local-only and capture prior/desired state', async () => {
  const env = await makeEnvironment();
  try {
    const result = await planBuilderPage(env.site, ['--file', 'page.json'], undefined, {});
    assert.equal(result.action, 'create');
    assert.equal(result.type, 'builder_project');
    assert.equal(result.slug, input.slug);
    const plan = JSON.parse(await readFile(result.planPath, 'utf8'));
    assert.deepEqual(plan.prior, {exists: false});
    assert.equal(plan.desired.template, 'builder-templates/landing.php');
    assert.equal(plan.desired.fields.wbc_cta_label, 'Request a quote');
    assert.deepEqual(plan.verifyText, input.verifyText);
    assert.equal(env.remote.state.post, null);
  } finally {
    await env.cleanup();
  }
});

test('builder page apply creates post, template binding and editable fields', async () => {
  const env = await makeEnvironment();
  try {
    const plan = await planBuilderPage(env.site, ['--file', 'page.json']);
    const rawPlan = await readFile(plan.planPath, 'utf8');
    const result = await applyBuilderPage(env.site, ['--plan', plan.planId], undefined, {
      fetchImpl: env.remote.fetchImpl,
    });
    assert.equal(result.action, 'create');
    assert.equal(result.url, 'https://site.test/builder-projects/custom-excavator-solutions/');
    assert.deepEqual(result.frontend.verifiedText, input.verifyText);
    assert.equal(env.remote.state.post.template, input.template);
    assert.equal(env.remote.state.post.fields.wbc_subtitle, input.fields.wbc_subtitle);
    assert.equal(await readFile(plan.planPath, 'utf8'), rawPlan);
    assert.equal(existsSync(join(plan.planPath, '..', `${plan.planId}-receipt.json`)), true);
    assert.equal((await readdir(join(env.root, '.backups/external-writes'))).length, 1);
    const noop = await applyBuilderPage(env.site, ['--plan', plan.planId], undefined, {
      fetchImpl: env.remote.fetchImpl,
    });
    assert.equal(noop.action, 'noop');
    assert.deepEqual(noop.frontend.verifiedText, input.verifyText);
  } finally {
    await env.cleanup();
  }
});

test('failed live verification deletes a newly created Builder page', async () => {
  const env = await makeEnvironment();
  try {
    const plan = await planBuilderPage(env.site, ['--file', 'page.json'], undefined, {});
    const failingFetch = async () => ({ok: true, status: 200, text: async () => '<html>stale</html>'});
    await assert.rejects(
      applyBuilderPage(env.site, ['--plan', plan.planId], undefined, {fetchImpl: failingFetch}),
      /missing text.*automatic rollback restored/s,
    );
    assert.equal(env.remote.state.post, null);
  } finally {
    await env.cleanup();
  }
});

test('failed live verification restores an existing Builder page', async () => {
  const existing = {
    exists: true,
    id: 12,
    title: 'Old Title',
    slug: input.slug,
    status: 'publish',
    excerpt: 'Old excerpt',
    content: '<p>Old content</p>',
    template: 'builder-templates/canvas.php',
    fields: emptyBuilderFields(),
    url: `https://site.test/builder-projects/${input.slug}/`,
  };
  const env = await makeEnvironment(existing);
  try {
    const plan = await planBuilderPage(env.site, ['--file', 'page.json'], undefined, {});
    assert.equal(plan.action, 'update');
    const failingFetch = async () => ({ok: true, status: 200, text: async () => '<html>stale</html>'});
    await assert.rejects(
      applyBuilderPage(env.site, ['--plan', plan.planId], undefined, {fetchImpl: failingFetch}),
      /missing text.*automatic rollback restored/s,
    );
    assert.equal(env.remote.state.post.title, 'Old Title');
    assert.equal(env.remote.state.post.content, '<p>Old content</p>');
    assert.equal(env.remote.state.post.template, 'builder-templates/canvas.php');
    assert.deepEqual(env.remote.state.post.fields, existing.fields);
  } finally {
    await env.cleanup();
  }
});

test('apply refuses target drift after planning', async () => {
  const env = await makeEnvironment();
  try {
    const plan = await planBuilderPage(env.site, ['--file', 'page.json'], undefined, {});
    env.remote.state.post = {
      id: 44,
      title: 'Client Edit',
      slug: input.slug,
      status: 'publish',
      excerpt: '',
      content: '<p>Client content</p>',
      template: 'builder-templates/canvas.php',
      fields: emptyBuilderFields(),
      url: `https://site.test/builder-projects/${input.slug}/`,
    };
    await assert.rejects(
      applyBuilderPage(env.site, ['--plan', plan.planId], undefined, {fetchImpl: env.remote.fetchImpl}),
      /Manual edit conflict/,
    );
    assert.equal(env.remote.state.post.title, 'Client Edit');
  } finally {
    await env.cleanup();
  }
});

test('third-party editor payloads are rejected before planning', async () => {
  const env = await makeEnvironment();
  try {
    await writeFile(join(env.root, 'elementor.json'), JSON.stringify({...input, fields: {...input.fields, _elementor_data: '{}'}}));
    await assert.rejects(
      planBuilderPage(env.site, ['--file', 'elementor.json'], undefined, {}),
      /third-party page-builder data/,
    );
  } finally {
    await env.cleanup();
  }
});

test('unknown ACF field names are rejected instead of silently ignored', async () => {
  const env = await makeEnvironment();
  try {
    await writeFile(join(env.root, 'unknown-field.json'), JSON.stringify({
      ...input,
      fields: {...input.fields, custom_theme_field: 'value'},
    }));
    await assert.rejects(
      planBuilderPage(env.site, ['--file', 'unknown-field.json'], undefined, {}),
      /unsupported Builder page field/,
    );
  } finally {
    await env.cleanup();
  }
});

test('Fluent Forms shortcode field accepts only one numeric id', async () => {
  const env = await makeEnvironment();
  try {
    await writeFile(join(env.root, 'invalid-form.json'), JSON.stringify({
      ...input,
      fields: {...input.fields, wbc_form_shortcode: '[fluentform category="contact"]'},
    }));
    await assert.rejects(
      planBuilderPage(env.site, ['--file', 'invalid-form.json'], undefined, {}),
      /single Fluent Forms id shortcode/,
    );
  } finally {
    await env.cleanup();
  }
});
test('canonical command map exposes the Builder-managed page workflow', () => {
  const plan = commandMap.find(item => item.command === 'builder page plan');
  const apply = commandMap.find(item => item.command === 'builder page apply');
  assert.equal(plan.projectMode, 'source-or-external');
  assert.equal(plan.risk, 'local-plan-write');
  assert.equal(apply.projectMode, 'source-or-external');
  assert.equal(apply.risk, 'remote-write-with-rollback');
  const cli = readFileSync('harness/cli.mjs', 'utf8');
  assert.equal(cli.includes('planBuilderPage'), true);
  assert.equal(cli.includes('applyBuilderPage'), true);
});
