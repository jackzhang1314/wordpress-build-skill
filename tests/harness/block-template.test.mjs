import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, readFile, readdir, rm, writeFile} from 'node:fs/promises';
import {existsSync, readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {applyBlockTemplate, planBlockTemplate} from '../../harness/lib/block-template.mjs';
import {
  fullContentHash,
  patchBlockTemplateContent,
  validateBlockMarkup,
} from '../../harness/lib/shape-diagnosis.mjs';
import {commandMap} from '../../harness/lib/command-map.mjs';

function hash(value) {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

const customHeaderContent = '<!-- wp:paragraph --><p>Old factory header</p><!-- /wp:paragraph -->';
const selectedContent = '<!-- wp:template-part {"slug":"header","theme":"factory"} /--><main>Body</main>';

function inventory({partSource = 'custom', partContent = customHeaderContent} = {}) {
  return {
    marker: 'wordpress-builder-block-templates/1',
    siteUrl: 'https://site.test',
    theme: 'factory',
    templates: [{
      id: 'factory//front-page', slug: 'front-page', title: 'Front Page', source: 'custom', wp_id: 81,
      content: selectedContent,
    }],
    parts: [{
      id: `factory//header`, slug: 'header', title: 'Header', area: 'header', source: partSource,
      wp_id: partSource === 'custom' ? 82 : null, content: partContent,
    }],
  };
}

function makeSite(startingInventory) {
  const value = JSON.parse(JSON.stringify(startingInventory));
  const files = new Map();
  const nextId = [90];
  const rows = mode => mode === 'wp_template' ? value.templates : value.parts;
  const ssh = {
    run(command, options = {}) {
      const match = /^cat > (\S+)$/.exec(command);
      if (match) files.set(match[1], options.input?.toString('utf8') ?? '');
      return '';
    },
    wp(args) {
      const text = args.join(' ');
      if (text.includes('wordpress-builder-block-templates/1')) return JSON.stringify(value);
      if (text.includes('eval-file')) {
        const payload = JSON.parse(files.get(args[2]));
        const list = rows(payload.type);
        if (payload.mode === 'create') {
          if (list.some(item => item.slug === payload.slug && item.source === 'custom')) throw new Error('custom-override-already-exists');
          const id = nextId[0]++;
          list.push({
            id: `factory//${payload.slug}`, slug: payload.slug, title: payload.slug, area: payload.area,
            source: 'custom', wp_id: id, content: payload.content,
          });
          return JSON.stringify({wpId: id, source: 'custom', hash: hash(payload.content)});
        }
        const current = list.find(item => item.wp_id === payload.wpId && item.source === 'custom');
        if (!current) throw new Error('override-not-found');
        if (payload.mode === 'delete') {
          const index = list.indexOf(current);
          list.splice(index, 1);
          return JSON.stringify({deleted: true});
        }
        if (hash(current.content) !== payload.beforeHash) throw new Error('override-drift');
        current.content = payload.content;
        return JSON.stringify({wpId: current.wp_id, source: 'custom', hash: hash(current.content)});
      }
      if (text.includes('cache flush')) return '';
      throw new Error(`unexpected wp call: ${text}`);
    },
  };
  const fetchImpl = async target => {
    const url = new URL(target);
    if (url.searchParams.has('_wp-find-template')) {
      return {ok: true, status: 200, text: async () => JSON.stringify({success: true, data: value.templates[0]})};
    }
    const part = value.parts.find(item => item.slug === 'header' && item.source === 'custom') ?? value.parts[0];
    return {ok: true, status: 200, text: async () => `<html>${part.content}</html>`};
  };
  return {value, files, ssh, fetchImpl};
}

async function makeEnvironment(options = {}) {
  const root = await mkdtemp(join(tmpdir(), 'block-template-'));
  await writeFile(join(root, 'patch.json'), JSON.stringify({
    find: '<p>Old factory header</p>',
    replace: '<p>New factory header</p>',
    verifyText: ['New factory header'],
  }));
  const remote = makeSite(inventory(options));
  return {
    root,
    remote,
    site: {root, project: {mode: 'external'}, ssh: remote.ssh},
    cleanup: () => rm(root, {recursive: true, force: true}),
  };
}

test('block markup validation accepts paired and self-closing blocks', () => {
  assert.deepEqual(validateBlockMarkup('<!-- wp:group --><!-- wp:site-title /--><!-- /wp:group -->'), {valid: true, reason: 'ok'});
  assert.equal(validateBlockMarkup('<!-- wp:group --><main>x</main>').reason, 'unclosed-block:group');
  assert.equal(validateBlockMarkup('<!-- /wp:group -->').reason, 'unexpected-close:group');
  assert.equal(validateBlockMarkup('<p>no blocks</p>').reason, 'no-block-markup');
});

test('template patches require one unique match and produce hashes', () => {
  const result = patchBlockTemplateContent(
    '<!-- wp:paragraph --><p>Old</p><!-- /wp:paragraph -->',
    '<p>Old</p>',
    '<p>New</p>',
  );
  assert.equal(result.beforeHash, fullContentHash('<!-- wp:paragraph --><p>Old</p><!-- /wp:paragraph -->'));
  assert.equal(result.afterHash, fullContentHash(result.content));
  assert.throws(() => patchBlockTemplateContent('x x', 'x', 'y'), /must be unique/);
});

test('block-template plan targets a selected custom part without writing remotely', async () => {
  const env = await makeEnvironment();
  try {
    const result = await planBlockTemplate(env.site, ['--route', '/', '--part', 'header', '--file', 'patch.json'], undefined, {
      fetchImpl: env.remote.fetchImpl,
    });
    assert.equal(result.target.kind, 'wp_template_part');
    assert.equal(result.target.slug, 'header');
    assert.equal(result.target.source, 'custom');
    assert.equal(result.target.action, 'update');
    assert.equal(result.owner, 'template-part:header');
    const plan = JSON.parse(await readFile(result.planPath, 'utf8'));
    assert.equal(plan.target.beforeHash, hash(customHeaderContent));
    assert.equal(plan.target.afterContent.includes('New factory header'), true);
    assert.equal(env.remote.value.parts[0].content, customHeaderContent);
  } finally {
    await env.cleanup();
  }
});

test('block-template apply updates a custom part and verifies the live route', async () => {
  const env = await makeEnvironment();
  try {
    const plan = await planBlockTemplate(env.site, ['--route', '/', '--part', 'header', '--file', 'patch.json'], undefined, {
      fetchImpl: env.remote.fetchImpl,
    });
    const rawPlan = await readFile(plan.planPath, 'utf8');
    const result = await applyBlockTemplate(env.site, ['--plan', plan.planId], undefined, {
      fetchImpl: env.remote.fetchImpl,
    });
    assert.equal(result.action, 'update');
    assert.deepEqual(result.frontend.verifiedText, ['New factory header']);
    assert.equal(await readFile(plan.planPath, 'utf8'), rawPlan);
    assert.equal(existsSync(join(plan.planPath, '..', `${plan.planId}-receipt.json`)), true);
    assert.equal(env.remote.value.parts[0].content.includes('New factory header'), true);
    assert.equal((await readdir(join(env.root, '.backups/external-writes'))).length, 1);
  } finally {
    await env.cleanup();
  }
});

test('custom part live verification failure restores the previous content', async () => {
  const env = await makeEnvironment();
  try {
    const plan = await planBlockTemplate(env.site, ['--route', '/', '--part', 'header', '--file', 'patch.json'], undefined, {
      fetchImpl: env.remote.fetchImpl,
    });
    const failingFetch = async target => {
      const url = new URL(target);
      if (url.searchParams.has('_wp-find-template')) return env.remote.fetchImpl(target);
      return {ok: true, status: 200, text: async () => '<html>stale</html>'};
    };
    await assert.rejects(
      applyBlockTemplate(env.site, ['--plan', plan.planId], undefined, {fetchImpl: failingFetch}),
      /missing text.*automatic rollback restored/s,
    );
    assert.equal(env.remote.value.parts[0].content, customHeaderContent);
  } finally {
    await env.cleanup();
  }
});

test('reapplying a completed plan is a verified no-op unless route ownership drifts', async () => {
  const env = await makeEnvironment();
  try {
    const plan = await planBlockTemplate(env.site, ['--route', '/', '--part', 'header', '--file', 'patch.json'], undefined, {
      fetchImpl: env.remote.fetchImpl,
    });
    await applyBlockTemplate(env.site, ['--plan', plan.planId], undefined, {fetchImpl: env.remote.fetchImpl});
    const noop = await applyBlockTemplate(env.site, ['--plan', plan.planId], undefined, {fetchImpl: env.remote.fetchImpl});
    assert.equal(noop.action, 'noop');
    assert.deepEqual(noop.frontend.verifiedText, ['New factory header']);

    env.remote.value.templates[0].content = '<main>No selected part</main>';
    await assert.rejects(
      applyBlockTemplate(env.site, ['--plan', plan.planId], undefined, {fetchImpl: env.remote.fetchImpl}),
      /selected route no longer owns/,
    );
  } finally {
    await env.cleanup();
  }
});

test('theme source creates a custom override and rollback deletes it', async () => {
  const env = await makeEnvironment({partSource: 'theme'});
  try {
    const plan = await planBlockTemplate(env.site, ['--route', '/', '--part', 'header', '--file', 'patch.json'], undefined, {
      fetchImpl: env.remote.fetchImpl,
    });
    assert.equal(plan.target.action, 'create');
    const failingFetch = async target => {
      const url = new URL(target);
      if (url.searchParams.has('_wp-find-template')) return env.remote.fetchImpl(target);
      return {ok: true, status: 200, text: async () => '<html>stale</html>'};
    };
    await assert.rejects(
      applyBlockTemplate(env.site, ['--plan', plan.planId], undefined, {fetchImpl: failingFetch}),
      /missing text.*automatic rollback restored/s,
    );
    assert.deepEqual(
      env.remote.value.parts.filter(part => part.source === 'custom').map(part => part.slug),
      [],
    );
    assert.equal(env.remote.value.parts[0].source, 'theme');
  } finally {
    await env.cleanup();
  }
});

test('plans refuse a part that is not selected by the route', async () => {
  const env = await makeEnvironment();
  try {
    await assert.rejects(
      planBlockTemplate(env.site, ['--route', '/', '--part', 'footer', '--file', 'patch.json'], undefined, {
        fetchImpl: env.remote.fetchImpl,
      }),
      /is not selected by this route/,
    );
  } finally {
    await env.cleanup();
  }
});

test('apply refuses target drift after planning', async () => {
  const env = await makeEnvironment();
  try {
    const plan = await planBlockTemplate(env.site, ['--route', '/', '--part', 'header', '--file', 'patch.json'], undefined, {
      fetchImpl: env.remote.fetchImpl,
    });
    env.remote.value.parts[0].content = '<!-- wp:paragraph --><p>Client edit</p><!-- /wp:paragraph -->';
    await assert.rejects(
      applyBlockTemplate(env.site, ['--plan', plan.planId], undefined, {fetchImpl: env.remote.fetchImpl}),
      /Manual edit conflict/,
    );
  } finally {
    await env.cleanup();
  }
});

test('canonical command map exposes the two-phase block template workflow', () => {
  const plan = commandMap.find(item => item.command === 'block-template plan');
  const apply = commandMap.find(item => item.command === 'block-template apply');
  assert.equal(plan.projectMode, 'source-or-external');
  assert.equal(plan.risk, 'local-plan-write');
  assert.equal(apply.projectMode, 'source-or-external');
  assert.equal(apply.risk, 'remote-write-with-rollback');
  const cli = readFileSync('harness/cli.mjs', 'utf8');
  assert.equal(cli.includes('planBlockTemplate'), true);
  assert.equal(cli.includes('applyBlockTemplate'), true);
});
