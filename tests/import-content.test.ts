import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { z } from 'zod';
import { WordPressClient } from '../src/client.js';
import { Journal } from '../src/journal.js';
import { applyImport, importInput, importRows, planImport } from '../src/import-content.js';

const input = importInput.parse({ file: 'fixture.csv', type: 'product', keyColumn: 'SKU', titleColumn: 'Name', excerptColumn: 'Description', fields: [{ column: 'Material', group: 'acf', key: 'material' }] });

test('CSV imports preserve quoted commas, newlines and leading zeros, with order-independent stable slugs', () => {
  const source = '\uFEFFSKU,Name,Material,Description\r\n001,"Valve, small",Steel,"Line one\nLine two"\r\n002,"Valve ""large""",Brass,Example\r\n';
  const rows = importRows(Buffer.from(source), input);
  assert.deepEqual(rows.keys, ['001', '002']);
  assert.equal(rows.inputs[0]?.title, 'Valve, small');
  assert.equal(rows.inputs[0]?.excerpt, 'Line one\nLine two');
  assert.equal(rows.inputs[1]?.title, 'Valve "large"');
  assert.deepEqual(rows.inputs[0]?.acf, { material: 'Steel' });
  const reordered = importRows(Buffer.from('SKU,Name,Material,Description\n002,Changed,Brass,Example\n001,Changed,Steel,Example\n'), input);
  assert.equal(reordered.inputs[0]?.slug, rows.inputs[1]?.slug);
  assert.equal(reordered.inputs[1]?.slug, rows.inputs[0]?.slug);
  assert.equal(rows.inputs[0]?.status, undefined);
});

test('CSV imports reject ambiguous headers, stable keys, missing columns and oversized batches before planning writes', () => {
  for (const source of ['SKU,Name,Material,Name\n1,A,B,C', 'SKU,Name,Description\n1,A,B', 'SKU,Name,Material,Description\n1,A,B,C\n1,D,E,F', 'SKU,Name,Material,Description\n1,A,B', 'SKU,Name,Material,Description\n1,"A,B,C']) assert.throws(() => importRows(Buffer.from(source), input));
  const rows = Array.from({ length: 21 }, (_, index) => `${index},Name,Material,Description`).join('\n');
  assert.throws(() => importRows(Buffer.from('SKU,Name,Material,Description\n' + rows), input), /1–20/);
  assert.throws(() => importRows(new Uint8Array(1_048_577), input), /1 MiB/);
  assert.equal(importInput.safeParse({ ...input, fields: [...input.fields, { column: 'Material', group: 'meta', key: 'material' }] }).success, false);
});

test('batch resumes after second-record readback failure without duplicate POSTs; changed source is refused', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wp-import-'));
  try {
    const file = join(dir, 'source.csv');
    const source = 'SKU,Name,Material,Description\n001,One,Steel,First\n002,Two,Brass,Second\n';
    await writeFile(file, source);
    const text = { type: 'object', properties: { raw: { type: 'string' } } };
    const properties = { title: text, excerpt: text, status: { type: 'string' }, slug: { type: 'string' }, acf: { type: 'object', properties: { material: { type: 'string', required: true } } } };
    const records = new Map<number, Record<string, unknown>>();
    let writes = 0, failSecondReadback = true;
    const client = new WordPressClient({ site: 'https://example.com', username: 'admin', password: 'fixture' }, async (request, init) => {
      const url = new URL(request instanceof Request ? request.url : request);
      const json = (value: unknown) => new Response(JSON.stringify(value));
      if (url.pathname.endsWith('/types/product')) return json({ slug: 'product', rest_namespace: 'wp/v2', rest_base: 'products', viewable: true, supports: { title: true, editor: true } });
      if (init?.method === 'OPTIONS') return json({ schema: { properties }, endpoints: [{ methods: ['POST'], args: properties }] });
      if (!url.pathname.includes('/wp/v2/products')) throw new Error('Unexpected test endpoint');
      if (init?.method === 'POST') {
        writes++;
        const patch = z.record(z.string(), z.unknown()).parse(JSON.parse(String(init.body)));
        const value = { ...patch, id: writes, type: 'product', link: `https://example.com/products/${writes}`, modified_gmt: 'same-second', title: { raw: patch.title }, excerpt: { raw: patch.excerpt } };
        records.set(writes, value);
        return json(value);
      }
      const id = Number(url.pathname.split('/').at(-1));
      if (id === 2 && failSecondReadback) { failSecondReadback = false; throw new Error('Lost second readback'); }
      return json(id ? records.get(id) : [...records.values()].filter(value => value.slug === url.searchParams.get('slug')));
    });
    const journal = new Journal(dir, client.identity);
    const plan = await planImport(client, journal, { ...input, file });
    assert.equal(writes, 0);
    await writeFile(file, source.replace('Steel', 'Changed'));
    await assert.rejects(applyImport(client, journal, plan.planId), /CSV changed/);
    assert.equal(writes, 0);
    await writeFile(file, source);
    await assert.rejects(applyImport(client, journal, plan.planId), /Lost second readback/);
    assert.equal(writes, 2);
    const resumed = await applyImport(client, journal, plan.planId);
    assert.deepEqual(resumed.records.map(record => record.id), [1, 2]);
    assert.equal(writes, 2);
    await applyImport(client, journal, plan.planId);
    assert.equal(writes, 2);
  } finally { await rm(dir, { recursive: true, force: true }); }
});
