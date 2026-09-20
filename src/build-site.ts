import { z } from 'zod';
import { WordPressClient, hash } from './client.js';
import { Journal } from './journal.js';
import { wpBlocksSchema, walkWpBlocks } from './blocks.js';
import { compile, createPage, pageStateSchema, pageVersion, readPage, resolvePageLinks, updatePage, type Page } from './pages.js';
import { configureSite, readSettings, settingsSchema } from './site.js';

const keySchema = z.string().regex(/^[a-z][a-z0-9-]{0,79}$/);
export const sitePlanSchema = z.object({
  title: z.string().min(1).max(200), description: z.string().max(500),
  sourceFiles: z.array(z.string().min(1)).min(1),
  home: keySchema,
  pages: z.array(z.object({ key: keySchema, title: z.string().min(1).max(200), slug: keySchema, template: z.string().max(200).optional(), blocks: wpBlocksSchema }).strict()).min(1).max(30),
}).strict().superRefine((plan, ctx) => {
  const keys = new Set(plan.pages.map(page => page.key));
  if (keys.size !== plan.pages.length || new Set(plan.pages.map(page => page.slug)).size !== plan.pages.length) ctx.addIssue({ code: 'custom', message: 'Page keys and slugs must be unique.' });
  if (!keys.has(plan.home)) ctx.addIssue({ code: 'custom', message: 'Homepage key is missing.' });
  for (const page of plan.pages) for (const node of walkWpBlocks(page.blocks)) if (node.type === 'button' && node.url.startsWith('page:') && !keys.has(node.url.slice(5))) ctx.addIssue({ code: 'custom', message: `Unknown page reference: ${node.url}` });
});
export type SitePlan = z.infer<typeof sitePlanSchema>;

const taskSchema = z.object({ identity: z.string(), planHash: z.string(), plan: sitePlanSchema, settingsBefore: settingsSchema.optional(), createdAt: z.string() });

export async function buildSite(client: WordPressClient, journal: Journal, plan: SitePlan, phase: 'draft' | 'publish') {
  return journal.lock(async () => {
    let stored = await journal.load('task.json');
    if (stored === undefined) {
      const profile = await client.discover();
      await journal.save('profile.json', profile);
      if (profile.blocks.status !== 'available') throw new Error('Cannot verify registered blocks. Resolve block-types permission before building.');
      const names = new Set(z.array(z.object({ name: z.string() })).parse(profile.blocks.data).map(block => block.name));
      const options = profile.pages.status === 'available' ? z.object({ schema: z.object({ properties: z.record(z.string(), z.unknown()) }) }).parse(profile.pages.data) : undefined;
      for (const page of plan.pages) {
        // Compile final-shaped content with local dummy targets, for validation only; it is never written.
        const links = new Map<string, Page>(plan.pages.map((entry, index) => [entry.key, { id: index + 1, type: 'page', title: { raw: entry.title }, content: { raw: '' }, status: 'draft', slug: entry.slug, modified_gmt: '', link: `${client.site}/?page_id=${index + 1}`, template: '', parent: 0, featured_media: 0 }]));
        const content = await compile(client, resolvePageLinks(page.blocks, links));
        const required = [...content.matchAll(/<!-- wp:([a-z0-9/-]+)/g)].map(match => `core/${match[1]}`);
        for (const name of required) if (!names.has(name)) throw new Error(`Required block ${name} is not registered.`);
        if (page.template !== undefined) {
          const template = z.object({ enum: z.array(z.string()) }).safeParse(options?.schema.properties.template);
          if (!template.success || !template.data.enum.includes(page.template)) throw new Error(`Template ${page.template} has not been verified in the page schema.`);
        }
      }
      stored = { identity: client.identity, planHash: hash(plan), plan, settingsBefore: profile.settings.status === 'available' ? settingsSchema.parse(profile.settings.data) : undefined, createdAt: new Date().toISOString() };
      await journal.save('task.json', stored);
    }
    const task = taskSchema.parse(stored);
    if (task.identity !== client.identity || task.planHash !== hash(plan)) throw new Error('This task directory belongs to another connection or plan. Read its progress; do not overwrite it.');
    if (phase === 'publish' && !task.settingsBefore) {
      task.settingsBefore = await readSettings(client);
      await journal.save('task.json', task);
    }

    const pages = new Map<string, Page>();
    for (const page of plan.pages) {
      const initialContent = await compile(client, resolvePageLinks(page.blocks, new Map(), true));
      const initial = await createPage(client, journal, `create-${page.key}`, { title: page.title, slug: page.slug, content: initialContent, ...(page.template === undefined ? {} : { template: page.template }) });
      const saved = await journal.load(`page-${page.key}.json`);
      const state = saved === undefined ? { initial } : pageStateSchema.parse(saved);
      await journal.save(`page-${page.key}.json`, state);
      // Always use initial, stable draft URLs so a resumed plan has identical operation inputs.
      pages.set(page.key, initial);
    }
    for (const page of plan.pages) {
      const state = pageStateSchema.parse(await journal.load(`page-${page.key}.json`));
      if (state.linked) continue;
      const content = await compile(client, resolvePageLinks(page.blocks, pages));
      const linked = await updatePage(client, journal, `link-${page.key}`, state.initial, { content });
      await journal.save(`page-${page.key}.json`, { ...state, linked });
    }

    // A resume must detect manual changes even if all mutation receipts are cached.
    const current = new Map<string, Page>();
    for (const page of plan.pages) {
      const state = pageStateSchema.parse(await journal.load(`page-${page.key}.json`));
      const expected = state.published ?? state.linked ?? state.initial;
      const live = await readPage(client, expected.id);
      // A publish response may have been saved before the page summary on a crashed process.
      // Recover that response through the same immutable operation before checking freshness.
      if (phase === 'publish' && state.linked && !state.published) {
        const published = await updatePage(client, journal, `publish-${page.key}`, state.linked, { status: 'publish' });
        await journal.save(`page-${page.key}.json`, { ...state, published });
        const fresh = await readPage(client, published.id);
        if (pageVersion(fresh) !== pageVersion(published)) throw new Error(`Published page ${page.key} changed since the receipt.`);
        current.set(page.key, fresh);
      } else {
        if (pageVersion(live) !== pageVersion(expected)) throw new Error(`Page ${page.key} changed since the receipt.`);
        current.set(page.key, live);
      }
    }
    if (phase === 'publish') {
      const home = current.get(plan.home);
      if (!home) throw new Error('Missing homepage receipt.');
      if (!task.settingsBefore) throw new Error('Missing site settings snapshot for publication.');
      const settings = await configureSite(client, journal, task.settingsBefore, plan.title, plan.description, home.id);
      if (hash(await readSettings(client)) !== hash(settings)) throw new Error('Site settings changed after configuration.');
      // Homepage selection can change the canonical URL; return the actual final URLs.
      for (const [key, expected] of current) {
        const fresh = await readPage(client, expected.id);
        if (pageVersion(fresh) !== pageVersion(expected)) throw new Error(`Page ${key} changed during site configuration.`);
        current.set(key, fresh);
      }
    }
    const report = { site: client.site, phase, pages: [...current].map(([key, page]) => ({ key, id: page.id, status: page.status, url: page.link, version: pageVersion(page) })), evidenceDirectory: journal.directory, frontendVerified: false, navigationVerified: false, next: phase === 'draft' ? 'Inspect real drafts in desktop/mobile and native editor; publish when authorized.' : 'Configure and inspect navigation; validate published frontend and all requested business features.' };
    await journal.save('progress.json', report);
    return report;
  });
}
