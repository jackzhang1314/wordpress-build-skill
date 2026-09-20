import { z } from 'zod';
import { WordPressClient, hash } from './client.js';
import { Journal } from './journal.js';
import { wpBlocksSchema } from './blocks.js';
import { compile, pageSchema, pageStateSchema, pageVersion, readPage, updatePage } from './pages.js';
import { sitePlanSchema } from './build-site.js';

export const editInput = z.object({ id: z.number().int().positive(), expectedVersion: z.string().regex(/^[a-f0-9]{64}$/), title: z.string().min(1).max(200).optional(), blocks: wpBlocksSchema }).strict();
const editPlan = z.object({ identity: z.string(), input: editInput, before: pageSchema, content: z.string() });

export async function planPageEdit(client: WordPressClient, journal: Journal, input: z.infer<typeof editInput>) {
  return journal.lock(async () => {
    const before = await readPage(client, input.id);
    if (pageVersion(before) !== input.expectedVersion) throw new Error('Page changed before edit planning; read the current content.');
    const content = await compile(client, input.blocks);
    const plan = editPlan.parse({ identity: client.identity, input, before, content });
    const planId = hash(plan);
    await journal.save(`edit-${planId}.json`, plan);
    return { planId, id: before.id, status: before.status, before: before.content.raw, after: content, impact: 'Replaces the entire page body with the supplied blocks while preserving status, template and parent. Review the complete before/after and preserve unrelated content in your input.' };
  });
}

export async function applyPageEdit(client: WordPressClient, journal: Journal, planId: string) {
  z.string().regex(/^[a-f0-9]{64}$/).parse(planId);
  return journal.lock(async () => {
    const plan = editPlan.parse(await journal.load(`edit-${planId}.json`));
    if (plan.identity !== client.identity || hash(plan) !== planId) throw new Error('Page edit plan identity or hash mismatch.');
    const after = await updatePage(client, journal, `edit-${planId}`, plan.before, { content: plan.content, ...(plan.input.title === undefined ? {} : { title: plan.input.title }) });
    const fresh = await readPage(client, after.id);
    if (pageVersion(fresh) !== pageVersion(after)) throw new Error('Page changed after the edit receipt.');
    const task = z.object({ identity: z.string(), plan: sitePlanSchema }).safeParse(await journal.load('task.json'));
    if (task.success && task.data.identity === client.identity) {
      for (const page of task.data.plan.pages) {
        const state = pageStateSchema.safeParse(await journal.load(`page-${page.key}.json`));
        if (state.success && state.data.initial.id === after.id) {
          await journal.save(`page-${page.key}.json`, { ...state.data, ...(after.status === 'publish' ? { published: after } : { linked: after }) });
        }
      }
    }
    return { id: after.id, status: after.status, url: fresh.link, version: pageVersion(fresh), frontendVerified: false, evidenceDirectory: journal.directory };
  });
}
