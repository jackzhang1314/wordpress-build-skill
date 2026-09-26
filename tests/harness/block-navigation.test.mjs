import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, readFile, readdir, rm, writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {readFileSync} from 'node:fs';
import {applyBlockNavigation, planBlockNavigation} from '../../harness/lib/block-navigation.mjs';
import {buildNavigationPostContent, parseNavigationPostContent} from '../../harness/lib/shape-diagnosis.mjs';
import {commandMap} from '../../harness/lib/command-map.mjs';

function hash(value) {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

const partContent = '<!-- wp:navigation {"ref":279} /-->';
const selectedContent = '<!-- wp:template-part {"slug":"header","theme":"factory"} /--><main>Body</main>';
const flatNavigation = '<!-- wp:navigation-link {"label":"Home","url":"https://site.test/","kind":"custom"} /-->\n';

function remoteInventory({
  navigationContent = flatNavigation,
  selectedTemplateContent = selectedContent,
  headerContent = partContent,
} = {}) {
  return {
    marker: 'wordpress-builder-block-navigation/1',
    siteUrl: 'https://site.test',
    theme: 'factory',
    templates: [{
      id: 'factory//front-page', slug: 'front-page', title: 'Front Page', source: 'custom', wp_id: 281,
      content: selectedTemplateContent,
    }],
    parts: [{
      id: 'factory//header', slug: 'header', title: 'Header', area: 'header', source: 'custom', wp_id: 280,
      content: headerContent,
    }],
    navigationPosts: [{
      id: 279, slug: 'main', title: 'Main', status: 'publish',
      content: navigationContent, modified: '2026-09-27T00:00:00+00:00',
    }],
  };
}

function makeSite(startingInventory) {
  const inventory = JSON.parse(JSON.stringify(startingInventory));
  const files = new Map();
  const ssh = {
    run(command, options = {}) {
      const match = /^cat > (\S+)$/.exec(command);
      if (!match) return '';
      files.set(match[1], options.input?.toString('utf8') ?? '');
      return '';
    },
    wp(args) {
      const text = args.join(' ');
      if (text.includes('wordpress-builder-block-navigation/1')) return JSON.stringify(inventory);
      if (text.includes('eval-file')) {
        const payload = JSON.parse(files.get(args[2]));
        const post = inventory.navigationPosts.find(item => item.id === payload.id);
        if (!post) throw new Error('navigation-not-found');
        if (payload.beforeHash && hash(post.content) !== payload.beforeHash) throw new Error('navigation-drift');
        post.content = payload.content;
        post.modified = 'now';
        return JSON.stringify({id: post.id, hash: hash(post.content)});
      }
      if (text.includes('cache flush')) return '';
      throw new Error(`unexpected wp call: ${text}`);
    },
  };
  const fetchImpl = async target => {
    const url = new URL(target);
    if (url.searchParams.has('_wp-find-template')) {
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({
          success: true,
          data: inventory.templates[0],
        }),
      };
    }
    const navigation = inventory.navigationPosts[0]?.content ?? '';
    return {
      ok: true,
      status: 200,
      text: async () => `<html>${navigation}</html>`,
    };
  };
  return {inventory, files, ssh, fetchImpl};
}

async function makeEnvironment(options = {}) {
  const root = await mkdtemp(join(tmpdir(), 'block-nav-'));
  await writeFile(join(root, 'links.json'), JSON.stringify({
    links: [
      {label: 'Home', path: '/'},
      {label: 'Products', path: '/products/'},
    ],
  }));
  const remote = makeSite(remoteInventory(options));
  return {
    root,
    remote,
    site: {root, project: {mode: 'external'}, ssh: remote.ssh},
    cleanup: () => rm(root, {recursive: true, force: true}),
  };
}

test('canonical command map exposes the two-phase block navigation workflow safely', () => {
  const plan = commandMap.find(item => item.command === 'nav block plan');
  const apply = commandMap.find(item => item.command === 'nav block apply');
  assert.equal(plan.projectMode, 'source-or-external');
  assert.equal(plan.risk, 'local-plan-write');
  assert.equal(apply.projectMode, 'source-or-external');
  assert.equal(apply.risk, 'remote-write-with-rollback');
  const cli = readFileSync('harness/cli.mjs', 'utf8');
  assert.equal(cli.includes('planBlockNavigation'), true);
  assert.equal(cli.includes('applyBlockNavigation'), true);
});

test('flat navigation post content is parseable and rebuildable', () => {
  const content = '<!-- wp:navigation-link {"label":"Home","url":"https://site.test/","kind":"custom"} /-->\n';
  const parsed = parseNavigationPostContent(content);
  assert.equal(parsed.supported, true);
  assert.deepEqual(parsed.links, [{label: 'Home', url: 'https://site.test/'}]);
  assert.equal(buildNavigationPostContent([{label: 'Home', url: 'https://site.test/'}]), content);
});

test('navigation plans refuse unsupported submenu content', () => {
  const parsed = parseNavigationPostContent('<!-- wp:navigation-submenu {"label":"Parent"} /-->');
  assert.equal(parsed.supported, false);
  assert.equal(parsed.unsupportedBlocks[0].type, 'navigation-submenu');
});

test('navigation plans refuse locked or metadata-bound links', () => {
  const parsed = parseNavigationPostContent(
    '<!-- wp:navigation-link {"label":"Home","url":"https://site.test/","lock":{"remove":true}} /-->',
  );
  assert.equal(parsed.supported, false);
  assert.equal(parsed.unsupportedBlocks[0].reason, 'locked-or-bound');
});

test('block navigation plan records route ownership and impact without a remote write', async () => {
  const env = await makeEnvironment();
  try {
    const result = await planBlockNavigation(env.site, ['--route', '/', '--file', 'links.json'], undefined, {
      fetchImpl: env.remote.fetchImpl,
    });
    assert.equal(result.navigationId, 279);
    assert.equal(result.owner, 'template-part:header');
    assert.deepEqual(result.impact.templateParts.map(part => part.slug), ['header']);
    const plan = JSON.parse(await readFile(result.planPath, 'utf8'));
    assert.equal(plan.selectedTemplate.slug, 'front-page');
    assert.equal(plan.selectedTemplate.source, 'custom');
    assert.equal(plan.navigation.beforeHash, hash(flatNavigation));
    assert.equal(plan.navigation.afterContent.includes('Products'), true);
    assert.equal(env.remote.inventory.navigationPosts[0].content, flatNavigation);
  } finally {
    await env.cleanup();
  }
});

test('block navigation apply updates, verifies frontend and preserves the immutable plan', async () => {
  const env = await makeEnvironment();
  try {
    const plan = await planBlockNavigation(env.site, ['--route', '/', '--file', 'links.json'], undefined, {
      fetchImpl: env.remote.fetchImpl,
    });
    const rawPlan = await readFile(plan.planPath, 'utf8');
    const result = await applyBlockNavigation(env.site, ['--plan', plan.planId], undefined, {
      fetchImpl: env.remote.fetchImpl,
    });
    assert.equal(result.action, 'update');
    assert.deepEqual(result.frontend.verifiedLabels, ['Home', 'Products']);
    assert.equal(await readFile(plan.planPath, 'utf8'), rawPlan);
    assert.equal(existsSync(join(plan.planPath, '..', `${plan.planId}-receipt.json`)), true);
    assert.equal(env.remote.inventory.navigationPosts[0].content.includes('Products'), true);
    const snapshots = await readdir(join(env.root, '.backups/external-writes'));
    assert.equal(snapshots.length, 1);
  } finally {
    await env.cleanup();
  }
});

test('failed frontend verification automatically restores the previous navigation', async () => {
  const env = await makeEnvironment();
  try {
    const plan = await planBlockNavigation(env.site, ['--route', '/', '--file', 'links.json'], undefined, {
      fetchImpl: env.remote.fetchImpl,
    });
    const failingFetch = async target => {
      const url = new URL(target);
      if (url.searchParams.has('_wp-find-template')) return env.remote.fetchImpl(target);
      return {ok: true, status: 200, text: async () => '<html>stale header</html>'};
    };
    await assert.rejects(
      applyBlockNavigation(env.site, ['--plan', plan.planId], undefined, {fetchImpl: failingFetch}),
      /missing labels.*automatic rollback restored/s,
    );
    assert.equal(env.remote.inventory.navigationPosts[0].content, flatNavigation);
  } finally {
    await env.cleanup();
  }
});

test('failed post-update readback also enters the rollback path', async () => {
  const env = await makeEnvironment();
  try {
    const plan = await planBlockNavigation(env.site, ['--route', '/', '--file', 'links.json'], undefined, {
      fetchImpl: env.remote.fetchImpl,
    });
    const originalWp = env.remote.ssh.wp.bind(env.remote.ssh);
    env.remote.ssh.wp = args => {
      const text = args.join(' ');
      if (text.includes('eval-file') && text.includes('/update.php')) {
        return JSON.stringify({id: plan.navigationId, hash: 'readback-mismatch'});
      }
      return originalWp(args);
    };
    await assert.rejects(
      applyBlockNavigation(env.site, ['--plan', plan.planId], undefined, {fetchImpl: env.remote.fetchImpl}),
      /readback failed.*automatic rollback restored/s,
    );
    assert.equal(env.remote.inventory.navigationPosts[0].content, flatNavigation);
  } finally {
    await env.cleanup();
  }
});

test('apply refuses manual navigation drift', async () => {
  const env = await makeEnvironment();
  try {
    const plan = await planBlockNavigation(env.site, ['--route', '/', '--file', 'links.json'], undefined, {
      fetchImpl: env.remote.fetchImpl,
    });
    env.remote.inventory.navigationPosts[0].content = '<!-- wp:navigation-link {"label":"Client Edit","url":"https://site.test/","kind":"custom"} /-->\n';
    await assert.rejects(
      applyBlockNavigation(env.site, ['--plan', plan.planId], undefined, {fetchImpl: env.remote.fetchImpl}),
      /Manual edit conflict/,
    );
  } finally {
    await env.cleanup();
  }
});

test('apply refuses a changed route template owner', async () => {
  const env = await makeEnvironment();
  try {
    const plan = await planBlockNavigation(env.site, ['--route', '/', '--file', 'links.json'], undefined, {
      fetchImpl: env.remote.fetchImpl,
    });
    env.remote.inventory.templates[0].content = '<main>No header part</main>';
    await assert.rejects(
      applyBlockNavigation(env.site, ['--plan', plan.planId], undefined, {fetchImpl: env.remote.fetchImpl}),
      /selected route template changed/,
    );
    assert.equal(env.remote.inventory.navigationPosts[0].content, flatNavigation);
  } finally {
    await env.cleanup();
  }
});

test('plans cannot target an unreferenced navigation post', async () => {
  const env = await makeEnvironment();
  try {
    await assert.rejects(
      planBlockNavigation(env.site, ['--route', '/', '--file', 'links.json', '--navigation', '280'], undefined, {
        fetchImpl: env.remote.fetchImpl,
      }),
      /is not used by this route/,
    );
  } finally {
    await env.cleanup();
  }
});

test('inline navigation without a wp_navigation ref is not pretending to be editable', async () => {
  const env = await makeEnvironment({
    selectedTemplateContent: '<!-- wp:navigation -->inline<!-- /wp:navigation -->',
    headerContent: '<!-- wp:site-title /-->',
  });
  try {
    await assert.rejects(
      planBlockNavigation(env.site, ['--route', '/', '--file', 'links.json'], undefined, {
        fetchImpl: env.remote.fetchImpl,
      }),
      /inline Navigation block without a wp_navigation ref/,
    );
  } finally {
    await env.cleanup();
  }
});
