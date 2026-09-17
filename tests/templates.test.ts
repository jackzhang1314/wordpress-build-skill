import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { z } from 'zod';
import { WordPressClient } from '../src/client.js';
import { Journal } from '../src/journal.js';
import { applySingleTemplate, planSingleTemplate, singleTemplateInput, templateSchema, templateVersion } from '../src/templates.js';

test('dedicated template leaves ordinary single and parts intact; retries only readback and stale dependencies prevent writes', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wp-template-'));
  try {
    const original = templateSchema.parse({ id: 'theme//single', theme: 'theme', slug: 'single', type: 'wp_template', source: 'theme', title: { raw: 'Posts' }, content: { raw: '<!-- wp:post-author-name /--><!-- wp:post-content /-->' }, description: 'Ordinary posts', status: 'publish', wp_id: 0, modified: null });
    const templates = new Map<string, z.infer<typeof templateSchema>>([[original.id, original]]);
    let theme = 'theme', writes = 0, failReadback = false;
    let header = '<!-- wp:site-title /-->';
    const footer = '<!-- wp:paragraph --><p>Existing footer</p><!-- /wp:paragraph -->';
    const client = new WordPressClient({ site: 'https://example.com', username: 'admin', password: 'fixture' }, async (request, init) => {
      const url = new URL(request instanceof Request ? request.url : request);
      const path = url.pathname.replace('/wp-json', '');
      const json = (value: unknown) => new Response(JSON.stringify(value));
      if (path === '/wp/v2/themes') return json([{ stylesheet: theme, is_block_theme: true }]);
      if (path === '/wp/v2/types/product') return json({ slug: 'product', rest_namespace: 'wp/v2', rest_base: 'products', viewable: true, supports: { title: true, editor: true } });
      if (init?.method === 'OPTIONS') return json({ schema: { properties: {} }, endpoints: [{ methods: ['POST'], args: Object.fromEntries(['slug', 'theme', 'content', 'title', 'description'].map(key => [key, { type: 'string' }])) }] });
      if (path.startsWith('/wp/v2/template-parts/')) {
        const area = path.endsWith('header') ? 'header' : 'footer';
        return json({ id: `theme//${area}`, slug: area, theme: 'theme', area, content: { raw: area === 'header' ? header : footer } });
      }
      if (path === '/wp/v2/block-types') return json(['template-part', 'group', 'post-title', 'post-featured-image', 'post-content'].map(name => ({ name: 'core/' + name })));
      if (path === '/wp/v2/templates/lookup') return json(original);
      if (path.startsWith('/wp/v2/templates')) {
        if (init?.method === 'POST') {
          writes++;
          const patch = z.object({ slug: z.string().optional(), theme: z.string().optional(), title: z.string(), description: z.string(), content: z.string() }).strict().parse(JSON.parse(String(init.body)));
          const id = patch.slug ? `${patch.theme}//${patch.slug}` : path.slice('/wp/v2/templates/'.length);
          assert.equal(id, 'theme//single-product');
          const record = templateSchema.parse({ ...original, id, slug: 'single-product', source: 'custom', wp_id: 123, modified: 'same-second', title: { raw: patch.title }, description: patch.description, content: { raw: patch.content } });
          templates.set(id, record);
          failReadback = true;
          return json(record);
        }
        const id = path.slice('/wp/v2/templates/'.length);
        if (id === 'theme//single-product' && failReadback) { failReadback = false; throw new Error('Readback connection failed'); }
        return templates.has(id) ? json(templates.get(id)) : new Response(JSON.stringify({ code: 'rest_template_not_found' }), { status: 404 });
      }
      throw new Error('Unexpected template test route ' + path);
    });
    const input = singleTemplateInput.parse({ postType: 'product', title: 'Products', header: 'theme//header', footer: 'theme//footer' });
    const journal = new Journal(dir, client.identity);
    const plan = await planSingleTemplate(client, journal, input);
    assert.equal(writes, 0);
    assert.ok(plan.after.includes('post-content'));
    assert.equal(plan.after.includes('post-author-name'), false);
    theme = 'another';
    await assert.rejects(applySingleTemplate(client, journal, plan.planId), /theme changed/);
    assert.equal(writes, 0);
    theme = 'theme';
    header = 'Human changed the header';
    await assert.rejects(applySingleTemplate(client, journal, plan.planId), /dependencies changed/);
    assert.equal(writes, 0);
    header = '<!-- wp:site-title /-->';
    await assert.rejects(applySingleTemplate(client, journal, plan.planId), /Readback connection failed/);
    assert.equal(writes, 1);
    const result = await applySingleTemplate(client, journal, plan.planId);
    assert.equal(result.wpId, 123);
    await applySingleTemplate(client, journal, plan.planId);
    assert.equal(writes, 1);
    assert.deepEqual(templates.get(original.id), original);
    assert.equal(header, '<!-- wp:site-title /-->');
    assert.equal(footer, '<!-- wp:paragraph --><p>Existing footer</p><!-- /wp:paragraph -->');
    await assert.rejects(planSingleTemplate(client, journal, input), /expectedVersion/);
    const current = templates.get(result.id);
    assert.ok(current);
    const update = await planSingleTemplate(client, journal, { ...input, expectedVersion: templateVersion(current), title: 'Updated products' });
    templates.set(current.id, { ...current, content: { raw: 'Manual template edit in same second' } });
    await assert.rejects(applySingleTemplate(client, journal, update.planId), /changed or appeared/);
    assert.equal(writes, 1);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('single-template adapter does not accept general post/page hierarchy changes or arbitrary code', () => {
  const input = { postType: 'product', title: 'Product', header: 'theme//header', footer: 'theme//footer' };
  assert.equal(singleTemplateInput.safeParse({ ...input, postType: 'post' }).success, false);
  assert.equal(singleTemplateInput.safeParse({ ...input, content: '<script>invalid</script>' }).success, false);
  assert.equal(singleTemplateInput.safeParse({ ...input, header: 'https://elsewhere/header' }).success, false);
});
