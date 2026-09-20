import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { z } from 'zod';
import { WordPressClient } from '../src/client.js';
import { Journal } from '../src/journal.js';
import { applyContent, contentInput, planContent } from '../src/content.js';
import { contentVersion, discoverContentModel, normalizeWpSchema, readContent, wpProperties } from '../src/content-model.js';
import { compile } from '../src/pages.js';

test('WordPress required booleans are normalized while nested requirements and limits remain enforced', () => {
  const schema = z.fromJSONSchema(normalizeWpSchema({ type: 'object', required: false, properties: { model: { type: ['string', 'null'], required: true, maxLength: 3 }, optional: { type: 'string', required: false } } }));
  assert.equal(schema.safeParse({ model: 'ABC' }).success, true);
  assert.equal(schema.safeParse({}).success, false);
  assert.equal(schema.safeParse({ model: 'long' }).success, false);
  assert.equal(schema.safeParse({ model: 2 }).success, false);
  assert.deepEqual(wpProperties([]), {});
  assert.throws(() => wpProperties([{ unexpected: 'field' }]));
  assert.deepEqual(normalizeWpSchema({ type: 'object', properties: [] }).properties, {});
});

test('CMS field update preserves unknown blocks and unrequested fields; stale plans and duplicate slugs do not write', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wp-content-'));
  try {
    const text = { type: 'object', properties: { raw: { type: 'string' } } };
    const field = { type: 'string', maxLength: 20, required: false };
    const properties = { id: { type: 'integer', readonly: true }, type: { type: 'string', readonly: true }, title: text, content: text, excerpt: text, status: { type: 'string', enum: ['draft', 'publish'] }, slug: { type: 'string' }, template: { type: 'string' }, featured_media: { type: 'integer' }, meta: { type: 'object', properties: { material: field, keep: field, readonly: { ...field, readonly: true } } }, acf: { type: 'object', properties: { material: { ...field, type: ['string', 'null'] }, keep: field } } };
    let writes = 0, readbackFail = false;
    const records = new Map<number, Record<string, unknown>>([[7, { id: 7, type: 'product', link: 'https://example.com/products/7', modified_gmt: 'same-second', title: { raw: 'Valve' }, content: { raw: '<!-- wp:vendor/special /-->' }, excerpt: { raw: 'Original' }, status: 'draft', slug: 'valve', template: 'custom', featured_media: 12, meta: { material: 'Steel', keep: 'Keep' }, acf: { material: 'Steel', keep: 'Keep' } }]]);
    const client = new WordPressClient({ site: 'https://example.com', username: 'admin', password: 'fixture' }, async (input, init) => {
      const url = new URL(input instanceof Request ? input.url : input);
      const path = url.pathname.replace('/wp-json', '');
      const json = (value: unknown) => new Response(JSON.stringify(value));
      if (path === '/wp/v2/types/product') return json({ slug: 'product', rest_namespace: 'wp/v2', rest_base: 'products', viewable: true, supports: { title: true, editor: [{ notes: true }] } });
      if (path === '/wp/v2/block-types') return json([{ name: 'core/paragraph' }]);
      if (init?.method === 'OPTIONS') return json({ schema: { properties }, endpoints: [{ methods: ['POST'], args: properties }] });
      if (!path.startsWith('/wp/v2/products')) throw new Error('Unexpected route');
      let id = Number(path.split('/').at(-1));
      if (init?.method === 'POST') {
        writes++;
        const patch = z.record(z.string(), z.unknown()).parse(JSON.parse(String(init.body)));
        if (!id) { id = 8; records.set(id, { id, type: 'product', link: 'https://example.com/products/8', modified_gmt: 'same-second', title: { raw: '' }, content: { raw: '' }, excerpt: { raw: '' }, template: '', featured_media: 0, meta: { material: '', keep: '' }, acf: { material: '', keep: '' } }); }
        const item = records.get(id);
        assert.ok(item);
        for (const [key, value] of Object.entries(patch)) {
          if (key === 'acf' || key === 'meta') {
            const fields = z.record(z.string(), z.unknown()).parse(value);
            for (const group of ['meta', 'acf']) item[group] = { ...z.record(z.string(), z.unknown()).parse(item[group]), ...fields };
          } else item[key] = ['title', 'content', 'excerpt'].includes(key) ? { raw: value } : value;
        }
        return json(item);
      }
      if (id && readbackFail) { readbackFail = false; throw new Error('Temporary readback failure'); }
      return json(id ? records.get(id) : [...records.values()].filter(record => record.slug === url.searchParams.get('slug')));
    });
    const journal = new Journal(dir, client.identity);
    const model = await discoverContentModel(client, 'product');
    const original = await readContent(client, model, 7);
    const edit = await planContent(client, journal, { type: 'product', id: 7, expectedVersion: contentVersion(original), acf: { material: 'Brass' } });
    const result = await applyContent(client, journal, edit.planId);
    assert.equal(result.values.content, '<!-- wp:vendor/special /-->');
    assert.equal(result.values.template, 'custom');
    assert.equal(result.values.featured_media, 12);
    assert.deepEqual(result.values.acf, { material: 'Brass', keep: 'Keep' });
    await applyContent(client, journal, edit.planId);
    assert.equal(writes, 1);
    await assert.rejects(planContent(client, journal, { type: 'product', title: 'Duplicate', slug: 'valve' }), /already exists/);
    await assert.rejects(planContent(client, journal, { type: 'product', id: 7, expectedVersion: result.version, acf: { invented: 'No' } }), /not explicitly writable/);
    await assert.rejects(planContent(client, journal, { type: 'product', id: 7, expectedVersion: result.version, meta: { readonly: 'No' } }), /not explicitly writable/);
    await assert.rejects(planContent(client, journal, { type: 'product', id: 7, expectedVersion: result.version, acf: { material: 'x'.repeat(21) } }));
    await assert.rejects(compile(client, [{ type: 'meta', key: 'invented', fallback: 'Unknown' }], model), /REST-exposed/);
    const bound = await compile(client, [{ type: 'meta', key: 'material', fallback: '<unknown>' }], model);
    assert.ok(bound.includes('core/post-meta'));
    assert.ok(bound.includes('&lt;unknown&gt;'));
    const stale = await planContent(client, journal, { type: 'product', id: 7, expectedVersion: result.version, status: 'publish' });
    const current = records.get(7);
    assert.ok(current);
    current.content = { raw: 'Manual change in same second' };
    await assert.rejects(applyContent(client, journal, stale.planId), /changed since planning/);
    assert.equal(writes, 1);
    assert.equal(contentInput.safeParse({ type: 'product', title: 'No', slug: 'no', status: 'publish' }).success, false);
    const create = await planContent(client, journal, { type: 'product', title: 'New', slug: 'new', acf: { material: 'Steel' } });
    readbackFail = true;
    await assert.rejects(applyContent(client, journal, create.planId), /Temporary readback/);
    assert.equal(writes, 2);
    const resumed = await applyContent(client, journal, create.planId);
    assert.equal(resumed.id, 8);
    assert.equal(writes, 2);
  } finally { await rm(dir, { recursive: true, force: true }); }
});
