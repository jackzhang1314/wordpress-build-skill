import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { z } from 'zod';
import { WordPressClient } from '../src/client.js';
import { Journal } from '../src/journal.js';
import { pageSchema, pageVersion, updatePage } from '../src/pages.js';
import { replaceNavigation } from '../src/navigation.js';
import { serializeWpBlocks, wpBlocksSchema } from '../src/blocks.js';
import { sitePlanSchema } from '../src/build-site.js';

const config = { site: 'https://example.com/subdir', username: 'editor', password: 'fixture-secret' };
const reply = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } });

test('REST routing preserves subdirectories and rejects destination changes', () => {
  const client = new WordPressClient(config);
  assert.equal(client.url('/wp/v2/pages?context=edit').href, 'https://example.com/subdir/wp-json/wp/v2/pages?context=edit');
  assert.throws(() => client.url('/../users'));
  assert.throws(() => client.url('//evil.example/test'));
  assert.throws(() => client.url('/wp/v2/pages?rest_route=/wp/v2/users'));
  assert.throws(() => new WordPressClient({ ...config, restRoot: 'https://evil.example/wp-json' }));
  assert.throws(() => new WordPressClient({ ...config, site: 'https://user:password@example.com' }));
});

test('query-style REST roots work and HTTP requires an explicit loopback lab', () => {
  const client = new WordPressClient({ ...config, restRoot: 'https://example.com/subdir/?rest_route=/' });
  assert.equal(client.url('/wp/v2/pages?per_page=10').searchParams.get('rest_route'), '/wp/v2/pages');
  assert.equal(client.url('/wp/v2/pages?per_page=10').searchParams.get('per_page'), '10');
  assert.throws(() => new WordPressClient({ ...config, site: 'http://example.com', allowLocalHttp: true }));
  assert.throws(() => new WordPressClient({ ...config, site: 'http://127.0.0.1:9462' }));
  assert.equal(new WordPressClient({ ...config, site: 'http://127.0.0.1:9462', allowLocalHttp: true }).site, 'http://127.0.0.1:9462');
});

test('authenticated requests reject redirects and do not expose server error bodies', async () => {
  const client = new WordPressClient(config, async (_url, options) => {
    assert.equal(options?.redirect, 'error');
    assert.equal(new Headers(options?.headers).get('Authorization'), `Basic ${Buffer.from('editor:fixture-secret').toString('base64')}`);
    return reply({ code: 'rest_forbidden', message: 'fixture-secret' }, 403);
  });
  await assert.rejects(client.request('/wp/v2/pages'), error => error instanceof Error && error.message.includes('403') && !error.message.includes('fixture-secret'));
});

test('journal resumes known responses after failed verification without repeating a write', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wp-journal-'));
  try {
    let writes = 0;
    const journal = new Journal(dir, 'site');
    const schema = z.object({ id: z.number() });
    const send = async () => { writes++; return { id: 19 }; };
    await assert.rejects(journal.lock(() => journal.mutate('create', { title: 'A' }, schema, async () => {}, send, async () => { throw new Error('Readback unavailable'); })));
    const recovered = await new Journal(dir, 'site').lock(() => new Journal(dir, 'site').mutate('create', { title: 'A' }, schema, async () => { throw new Error('Must not prepare again'); }, send, async response => schema.parse(response)));
    assert.equal(recovered.id, 19);
    assert.equal(writes, 1);
    await assert.rejects(journal.lock(() => journal.mutate('create', { title: 'B' }, schema, async () => {}, send, async response => schema.parse(response))), /different input/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('unknown writes remain blocked across process state reloads', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wp-unknown-'));
  try {
    let writes = 0;
    const send = async () => { writes++; throw new Error('Socket closed after server may have committed'); };
    const run = () => { const journal = new Journal(dir, 'site'); return journal.lock(() => journal.mutate('create', {}, z.unknown(), async () => {}, send, async value => value)); };
    await assert.rejects(run(), /Socket closed/);
    await assert.rejects(run(), /Unknown result/);
    assert.equal(writes, 1);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('task lock excludes concurrent writers and releases after an error', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wp-lock-'));
  try {
    const a = new Journal(dir, 'site');
    await assert.rejects(a.lock(async () => {
      await assert.rejects(new Journal(dir, 'site').lock(async () => 1), /locked/);
      throw new Error('Stopped');
    }), /Stopped/);
    assert.equal(await a.lock(async () => 2), 2);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

const sample = pageSchema.parse({ id: 10, type: 'page', status: 'draft', slug: 'existing', link: 'https://example.com/subdir/?page_id=10', modified_gmt: '2026-09-08T01:00:00', title: { raw: 'Existing' }, content: { raw: '<!-- wp:custom/widget {"id":1} /-->' }, template: '', parent: 0, featured_media: 0 });

test('publish only sends status and preserves unsupported existing block content', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wp-publish-'));
  try {
    let current = structuredClone(sample);
    const bodies: unknown[] = [];
    const client = new WordPressClient(config, async (_url, options) => {
      if (options?.method === 'POST') {
        const body: unknown = JSON.parse(String(options.body));
        bodies.push(body);
        current = { ...current, status: 'publish' };
      }
      return reply(current);
    });
    const journal = new Journal(dir, client.identity);
    const after = await journal.lock(() => updatePage(client, journal, 'publish', sample, { status: 'publish' }));
    assert.deepEqual(bodies, [{ status: 'publish' }]);
    assert.equal(after.content.raw, sample.content.raw);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('same-second manual changes are detected by content fingerprint before POST', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wp-conflict-'));
  try {
    let writes = 0;
    const changed = { ...sample, content: { raw: 'Human edit' } };
    assert.notEqual(pageVersion(sample), pageVersion(changed));
    const client = new WordPressClient(config, async (_url, options) => { if (options?.method === 'POST') writes++; return reply(changed); });
    const journal = new Journal(dir, client.identity);
    await assert.rejects(journal.lock(() => updatePage(client, journal, 'edit', sample, { content: 'AI edit' })), /changed since planning/);
    assert.equal(writes, 0);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('homepage canonical URL changes are not mistaken for manual content edits', () => {
  assert.equal(pageVersion(sample), pageVersion({ ...sample, link: 'https://example.com/subdir/' }));
  assert.notEqual(pageVersion(sample), pageVersion({ ...sample, slug: 'new-slug' }));
});

test('navigation preserves surrounding bytes and refuses ambiguous or complex fragments', () => {
  const fragment = '<!-- wp:navigation {"overlayMenu":"mobile"} /-->';
  const source = 'Existing logo\n' + fragment + '\nUnrelated footer';
  const result = replaceNavigation(source, fragment, [{ pageId: 1, label: 'A & B', url: 'https://example.com/page' }]);
  assert.ok(result.content.startsWith('Existing logo\n'));
  assert.ok(result.content.endsWith('\nUnrelated footer'));
  assert.ok(result.content.includes('"overlayMenu":"mobile"'));
  assert.throws(() => replaceNavigation(fragment + fragment, fragment, []));
  const complex = '<!-- wp:navigation --><!-- wp:navigation-submenu /--><!-- /wp:navigation -->';
  assert.throws(() => replaceNavigation(complex, complex, []));
});

test('block compiler escapes injected markup and rejects unresolved links and uneven columns', () => {
  const blocks = wpBlocksSchema.parse([{ type: 'paragraph', text: '<script>alert(1)</script>' }]);
  assert.ok(serializeWpBlocks(blocks, new Map()).includes('&lt;script&gt;'));
  assert.throws(() => serializeWpBlocks(wpBlocksSchema.parse([{ type: 'button', text: 'Contact', url: 'page:contact' }]), new Map()), /Resolve page/);
  assert.throws(() => wpBlocksSchema.parse([{ type: 'columns', columns: [{ width: 20, children: blocks }, { width: 90, children: blocks }] }]));
});

test('block compiler inlines registered patterns and rejects unknown names', () => {
  const blocks = wpBlocksSchema.parse([
    { type: 'paragraph', text: 'Before' },
    { type: 'pattern', name: 'terralift-ui/hero-industrial' },
  ]);
  const registry = new Map([['terralift-ui/hero-industrial', '<!-- wp:group {"className":"tl-hero"} /-->']]);
  const output = serializeWpBlocks(blocks, new Map(), registry);
  assert.ok(output.includes('tl-hero'));
  assert.throws(
    () => serializeWpBlocks(wpBlocksSchema.parse([{ type: 'pattern', name: 'terralift-ui/missing' }]), new Map(), registry),
    /注册区块样式 terralift-ui\/missing/,
  );
  assert.throws(() => wpBlocksSchema.parse([{ type: 'pattern', name: 'Bad Name' }]));
});

test('site plan rejects duplicated keys and unresolved internal page references', () => {
  const page = { key: 'home', title: 'Home', slug: 'home', blocks: [{ type: 'paragraph', text: 'Hello' }] };
  const plan = { title: 'Lab', description: '', sourceFiles: ['company.md'], home: 'home', pages: [page] };
  assert.ok(sitePlanSchema.safeParse(plan).success);
  assert.equal(sitePlanSchema.safeParse({ ...plan, pages: [page, page] }).success, false);
  assert.equal(sitePlanSchema.safeParse({ ...plan, pages: [{ ...page, blocks: [{ type: 'button', text: 'Contact', url: 'page:missing' }] }] }).success, false);
});
