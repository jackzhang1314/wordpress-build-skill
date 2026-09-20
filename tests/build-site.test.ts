import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { z } from 'zod';
import { WordPressClient } from '../src/client.js';
import { Journal } from '../src/journal.js';
import { buildSite, sitePlanSchema } from '../src/build-site.js';
import { applyPageEdit, planPageEdit } from '../src/edit-page.js';
import { pageVersion, readPage, type Page } from '../src/pages.js';

test('drafts work without settings permission; publication and later edits resume correctly', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wp-build-'));
  try {
    const saved = new Map<number, Page>();
    let nextId = 1, writes = 0;
    let settingsReadable = false;
    let settings = { title: 'Old', description: '', show_on_front: 'posts', page_on_front: 0, page_for_posts: 0 };
    const json = (value: unknown) => new Response(JSON.stringify(value));
    const client = new WordPressClient({ site: 'https://example.com', username: 'admin', password: 'fixture' }, async (input, options) => {
      const url = new URL(input instanceof Request ? input.url : input);
      const path = url.pathname.replace('/wp-json', '');
      const method = options?.method ?? 'GET';
      if (path === '/wp/v2/users/me') return json({ id: 1 });
      if (path === '/wp/v2/block-types') return json(['paragraph', 'buttons', 'button'].map(name => ({ name: 'core/' + name })));
      if (path === '/wp/v2/themes') return json([{ stylesheet: 'fixture', is_block_theme: true }]);
      if (path === '/wp/v2/types') return json({ page: { rest_base: 'pages' } });
      if (method === 'OPTIONS') return json({ schema: { properties: Object.fromEntries(['title', 'description', 'show_on_front', 'page_on_front'].map(key => [key, { readonly: false }])) } });
      if (path === '/wp/v2/settings') {
        if (!settingsReadable) return new Response(JSON.stringify({ code: 'rest_forbidden' }), { status: 403 });
        if (method === 'POST') { writes++; settings = { ...settings, ...z.object({ title: z.string(), description: z.string(), show_on_front: z.string(), page_on_front: z.number() }).parse(JSON.parse(String(options?.body))) }; }
        return json(settings);
      }
      if (path.startsWith('/wp/v2/pages')) {
        let id = Number(path.split('/').at(-1));
        if (method === 'POST') {
          writes++;
          const body = z.object({ title: z.string().optional(), content: z.string().optional(), slug: z.string().optional(), status: z.string().optional() }).parse(JSON.parse(String(options?.body)));
          if (!id) id = nextId++;
          const before = saved.get(id);
          saved.set(id, { id, type: 'page', status: body.status ?? before?.status ?? 'draft', slug: body.slug ?? before?.slug ?? '', title: { raw: body.title ?? before?.title.raw ?? '' }, content: { raw: body.content ?? before?.content.raw ?? '' }, link: `https://example.com/?page_id=${id}`, template: '', parent: 0, featured_media: 0, modified_gmt: String(writes) });
        }
        if (id) {
          const value = saved.get(id);
          if (!value) throw new Error('Unexpected missing fixture page');
          return json({ ...value, link: settings.page_on_front === id ? 'https://example.com/' : value.link });
        }
        return json([...saved.values()].filter(page => page.slug === url.searchParams.get('slug')));
      }
      throw new Error(`Unexpected fixture route ${path}`);
    });
    const plan = sitePlanSchema.parse({ title: 'Fixture', description: '', sourceFiles: ['fixture.md'], home: 'home', pages: [
      { key: 'home', title: 'Home', slug: 'home', blocks: [{ type: 'paragraph', text: 'Welcome' }, { type: 'button', text: 'Contact', url: 'page:contact' }] },
      { key: 'contact', title: 'Contact', slug: 'contact', blocks: [{ type: 'paragraph', text: 'Contact information' }] },
    ] });
    const journal = new Journal(dir, client.identity);
    await buildSite(client, journal, plan, 'draft');
    assert.equal(saved.size, 2);
    const draftWrites = writes;
    await buildSite(client, new Journal(dir, client.identity), plan, 'draft');
    assert.equal(writes, draftWrites);
    settingsReadable = true;
    const published = await buildSite(client, journal, plan, 'publish');
    assert.equal(published.pages[0]?.url, 'https://example.com/');
    const publishedWrites = writes;
    await buildSite(client, journal, plan, 'publish');
    assert.equal(writes, publishedWrites);

    const before = await readPage(client, 2);
    const edit = await planPageEdit(client, journal, { id: 2, expectedVersion: pageVersion(before), blocks: [{ type: 'paragraph', text: 'Revised after visual review.' }] });
    await applyPageEdit(client, journal, edit.planId);
    const afterEditWrites = writes;
    await buildSite(client, journal, plan, 'publish');
    await applyPageEdit(client, journal, edit.planId);
    assert.equal(writes, afterEditWrites);
    assert.ok((await readPage(client, 2)).content.raw.includes('Revised after visual review.'));
    const altered = saved.get(2);
    assert.ok(altered);
    saved.set(2, { ...altered, content: { raw: 'Manual change' } });
    await assert.rejects(buildSite(client, journal, plan, 'publish'), /changed since the receipt/);
    assert.equal(writes, afterEditWrites);
  } finally { await rm(dir, { recursive: true, force: true }); }
});
