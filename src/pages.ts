import { z } from 'zod';
import { WordPressClient, hash } from './client.js';
import { Journal } from './journal.js';
import { serializeWpBlocks, walkWpBlocks, type WpBlocks, type WpNode } from './blocks.js';
import { discoverContentModel, fieldDefinitions, type ContentModel } from './content-model.js';

export const pageSchema = z.object({
  id: z.number().int().positive(), type: z.literal('page'), status: z.string(), slug: z.string(), link: z.url(), modified_gmt: z.string(),
  title: z.object({ raw: z.string() }), content: z.object({ raw: z.string() }),
  template: z.string(), parent: z.number(), featured_media: z.number(),
});
export type Page = z.infer<typeof pageSchema>;
export const pageStateSchema = z.object({ initial: pageSchema, linked: pageSchema.optional(), published: pageSchema.optional() });
export function pageVersion(page: Page): string {
  // Setting a static homepage changes its permalink without editing the page.
  const { link, ...editable } = page;
  void link;
  return hash(editable);
}

export async function readPage(client: WordPressClient, id: number): Promise<Page> {
  const page = pageSchema.parse(await client.request(`/wp/v2/pages/${z.number().int().positive().parse(id)}?context=edit`));
  if (page.id !== id || new URL(page.link).origin !== new URL(client.site).origin) throw new Error('Unexpected page identity or origin.');
  return page;
}

export function resolvePageLinks(blocks: WpBlocks, pages: ReadonlyMap<string, Page>, omitUnresolved = false): WpBlocks {
  const visit = (node: WpNode): WpNode[] => {
    if (node.type === 'button' && node.url.startsWith('page:')) {
      const page = pages.get(node.url.slice(5));
      if (!page) { if (omitUnresolved) return []; throw new Error(`Missing page link ${node.url}`); }
      return [{ ...node, url: page.link }];
    }
    if (node.type === 'section') {
      const children = node.children.flatMap(visit);
      return children.length ? [{ ...node, children }] : [];
    }
    if (node.type === 'columns') {
      const columns = node.columns.map(column => ({ ...column, children: column.children.flatMap(visit) }));
      // A draft-only column can temporarily use an empty paragraph; final linking replaces it.
      return [{ ...node, columns: columns.map(column => ({ ...column, children: column.children.length ? column.children : [{ type: 'paragraph' as const, text: 'Navigation pending.' }] })) }];
    }
    return [node];
  };
  return blocks.flatMap(visit);
}

export async function compile(client: WordPressClient, blocks: WpBlocks, context?: ContentModel): Promise<string> {
  const media = new Map<number, string>();
  const catalogs = new Set<string>();
  let model = context;
  for (const node of walkWpBlocks(blocks)) {
    if (node.type === 'form') throw new Error('Forms require a verified plugin adapter; this runtime has not implemented one yet.');
    if (node.type === 'catalog' && !catalogs.has(node.postType)) {
      await discoverContentModel(client, node.postType);
      catalogs.add(node.postType);
    }
    if (node.type === 'meta') {
      model ??= await discoverContentModel(client, 'page');
      const field = fieldDefinitions(model, 'meta')[node.key];
      if (!field || field.type !== 'string') throw new Error(`Binding ${node.key} requires a REST-exposed string meta field on ${model.type}.`);
    }
    if (node.type === 'image' && !media.has(node.mediaId)) {
      const record = z.object({ id: z.number(), source_url: z.url(), media_type: z.literal('image') }).parse(await client.request(`/wp/v2/media/${node.mediaId}?context=edit`));
      if (record.id !== node.mediaId) throw new Error('Media ID mismatch.');
      media.set(record.id, record.source_url);
    }
  }
  return serializeWpBlocks(blocks, media);
}

export async function createPage(client: WordPressClient, journal: Journal, key: string, input: { title: string; slug: string; content: string; template?: string }): Promise<Page> {
  const body = { ...input, status: 'draft' };
  return journal.mutate(key, body, pageSchema, async () => {
    const matches = z.array(z.object({ id: z.number() })).parse(await client.request(`/wp/v2/pages?context=edit&status=any&slug=${encodeURIComponent(input.slug)}&per_page=100`));
    if (matches.length) throw new Error(`Page slug ${input.slug} already exists. Read its actual ID and explicitly plan an update.`);
  }, () => client.request('/wp/v2/pages', 'POST', body), async raw => {
    const response = pageSchema.parse(raw);
    const after = await readPage(client, response.id);
    if (after.title.raw !== input.title || after.content.raw !== input.content || after.slug !== input.slug || after.status !== 'draft' || (input.template !== undefined && after.template !== input.template)) throw new Error('Page create readback mismatch; inspect saved response.');
    return after;
  });
}

export async function updatePage(client: WordPressClient, journal: Journal, key: string, before: Page, patch: { content?: string; title?: string; status?: 'draft' | 'publish' }): Promise<Page> {
  // Keep the immutable before-snapshot hash in operation identity, including for old receipts.
  const intent = { id: before.id, version: hash(before), patch };
  return journal.mutate(key, intent, pageSchema, async () => {
    if (pageVersion(await readPage(client, before.id)) !== pageVersion(before)) throw new Error(`Page ${before.id} changed since planning; read and merge the current content.`);
  }, () => client.request(`/wp/v2/pages/${before.id}`, 'POST', patch), async () => {
    const after = await readPage(client, before.id);
    if (after.content.raw !== (patch.content ?? before.content.raw) || after.title.raw !== (patch.title ?? before.title.raw) || after.status !== (patch.status ?? before.status) || after.template !== before.template || after.parent !== before.parent || after.featured_media !== before.featured_media) throw new Error('Page update readback mismatch; inspect remote state.');
    return after;
  });
}
