import { z } from 'zod';
import { WordPressClient, hash } from './client.js';
import { Journal } from './journal.js';
import { readPage } from './pages.js';

export const settingsSchema = z.object({ title: z.string(), description: z.string(), show_on_front: z.enum(['page', 'posts']), page_on_front: z.number(), page_for_posts: z.number() });
export type Settings = z.infer<typeof settingsSchema>;
export async function readSettings(client: WordPressClient): Promise<Settings> { return settingsSchema.parse(await client.request('/wp/v2/settings')); }

export async function configureSite(client: WordPressClient, journal: Journal, before: Settings, title: string, description: string, home: number): Promise<Settings> {
  const body = { title, description, show_on_front: 'page', page_on_front: home };
  return journal.mutate('configure-site', { before, body }, settingsSchema, async () => {
    if (hash(await readSettings(client)) !== hash(before)) throw new Error('Site settings changed since planning.');
    if (home === before.page_for_posts || (await readPage(client, home)).status !== 'publish') throw new Error('Homepage must be published and differ from the posts page.');
    const schema = z.object({ schema: z.object({ properties: z.record(z.string(), z.object({ readonly: z.boolean().optional() })) }) }).parse(await client.request('/wp/v2/settings', 'OPTIONS'));
    for (const key of Object.keys(body)) if (!schema.schema.properties[key] || schema.schema.properties[key].readonly) throw new Error(`Setting ${key} is not writable in the current schema.`);
  }, () => client.request('/wp/v2/settings', 'POST', body), async () => {
    const after = await readSettings(client);
    if (after.title !== title || after.description !== description || after.page_on_front !== home || after.show_on_front !== 'page' || after.page_for_posts !== before.page_for_posts) throw new Error('Site settings readback mismatch.');
    return after;
  });
}
