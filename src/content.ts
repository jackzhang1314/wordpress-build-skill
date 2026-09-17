import { z } from 'zod';
import { WordPressClient, hash } from './client.js';
import { Journal } from './journal.js';
import { wpBlocksSchema } from './blocks.js';
import { compile } from './pages.js';
import { assertWritable, contentRecordSchema, contentType, contentVersion, discoverContentModel, modelSchema, normalizeWpSchema, readContent, stableHash, validateFieldPatch, wpProperties, type ContentModel, type ContentRecord } from './content-model.js';

const fields = z.record(z.string(), z.json()).refine(value => Object.keys(value).length > 0, 'Supply at least one field.');
export const contentInput = z.object({
  type: contentType, id: z.number().int().positive().optional(), expectedVersion: z.string().regex(/^[a-f0-9]{64}$/).optional(),
  title: z.string().min(1).max(200).optional(), slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(180).optional(),
  status: z.enum(['draft', 'publish']).optional(), blocks: wpBlocksSchema.optional(), excerpt: z.string().max(12000).optional(),
  featuredMedia: z.number().int().nonnegative().optional(), meta: fields.optional(), acf: fields.optional(),
}).strict().superRefine((input, ctx) => {
  if (input.id === undefined && (!input.title || !input.slug || input.expectedVersion || input.status === 'publish')) ctx.addIssue({ code: 'custom', message: 'Creation requires title and slug, starts as draft, and has no expectedVersion.' });
  if (input.id !== undefined && !input.expectedVersion) ctx.addIssue({ code: 'custom', message: 'Updates require the current expectedVersion.' });
  if (!['title', 'slug', 'status', 'blocks', 'excerpt', 'featuredMedia', 'meta', 'acf'].some(key => key in input)) ctx.addIssue({ code: 'custom', message: 'Empty update.' });
  if (input.meta && input.acf && Object.keys(input.meta).some(key => key in (input.acf ?? {}))) ctx.addIssue({ code: 'custom', message: 'Do not write the same field through both meta and acf.' });
});
export type ContentInput = z.infer<typeof contentInput>;
export const contentPlan = z.object({ identity: z.string(), input: contentInput, model: modelSchema, before: contentRecordSchema.optional(), patch: z.record(z.string(), z.unknown()) });
type ContentPlan = z.infer<typeof contentPlan>;

async function uniqueSlug(client: WordPressClient, model: ContentModel, slug: string, exceptId?: number) {
  const found = z.array(z.object({ id: z.number() })).parse(await client.request(`${model.route}?context=edit&status=any&slug=${encodeURIComponent(slug)}&per_page=100`));
  if (found.some(item => item.id !== exceptId)) throw new Error(`Slug ${slug} already exists. Read its ID and explicitly plan an update.`);
}

/** Caller holds the task lock; shared by single-item and whole-batch planning. */
export async function prepareContentPlan(client: WordPressClient, raw: ContentInput): Promise<ContentPlan> {
  const input = contentInput.parse(raw);
  const model = await discoverContentModel(client, input.type);
  const before = input.id === undefined ? undefined : await readContent(client, model, input.id);
  if (before && contentVersion(before) !== input.expectedVersion) throw new Error('Content changed before planning; read and merge the current record.');
  if (input.slug) await uniqueSlug(client, model, input.slug, input.id);
  const patch: Record<string, unknown> = {};
  for (const key of ['title', 'slug', 'status', 'excerpt', 'meta', 'acf'] as const) if (input[key] !== undefined) patch[key] = input[key];
  if (!before) patch.status = 'draft';
  if (input.blocks) {
    patch.content = await compile(client, input.blocks, model);
    const names = new Set(z.array(z.object({ name: z.string() })).parse(await client.request('/wp/v2/block-types?context=edit')).map(item => item.name));
    for (const match of String(patch.content).matchAll(/<!-- wp:([a-z0-9/-]+)/g)) if (!names.has(`core/${match[1]}`)) throw new Error(`Required block core/${match[1]} is not registered.`);
  }
  if (input.featuredMedia !== undefined) {
    if (input.featuredMedia > 0) {
      const image = z.object({ id: z.number(), media_type: z.literal('image') }).parse(await client.request(`/wp/v2/media/${input.featuredMedia}?context=edit`));
      if (image.id !== input.featuredMedia) throw new Error('Featured image identity mismatch.');
    }
    patch.featured_media = input.featuredMedia;
  }
  if (!before) {
    for (const [key, definition] of Object.entries(model.args)) {
      if (definition.required === true && !(key in patch)) throw new Error(`Creation requires field ${key}.`);
      if (key === 'meta' || key === 'acf') {
        const children = wpProperties(definition.properties ?? {});
        const supplied = z.record(z.string(), z.unknown()).parse(patch[key] ?? {});
        for (const [field, schema] of Object.entries(children)) if (schema.required === true && !(field in supplied)) throw new Error(`Creation requires field ${key}.${field}.`);
      }
    }
  }
  for (const [key, value] of Object.entries(patch)) {
    const definition = model.args[key];
    assertWritable(definition, key);
    if (key === 'meta' || key === 'acf') validateFieldPatch(model, key, z.record(z.string(), z.unknown()).parse(value));
    else {
      const schema = ['title', 'content', 'excerpt'].includes(key) ? z.record(z.string(), z.unknown()).parse(definition.properties).raw : definition;
      z.fromJSONSchema(normalizeWpSchema(schema)).parse(value);
    }
  }
  return contentPlan.parse({ identity: client.identity, input, model, before, patch });
}

export async function planContent(client: WordPressClient, journal: Journal, input: ContentInput) {
  return journal.lock(async () => {
    const plan = await prepareContentPlan(client, input);
    const planId = hash(plan);
    await journal.save(`content-${planId}.json`, plan);
    return { planId, type: input.type, id: input.id, before: plan.before?.values, patch: plan.patch, impact: input.blocks ? 'Replaces the full body. Other supplied fields are patched; omitted fields are preserved.' : 'Patches only supplied fields; existing raw body is preserved.', frontendVerified: false };
  });
}

function verifyValues(plan: ContentPlan, after: ContentRecord): void {
  for (const [key, expected] of Object.entries(plan.patch)) {
    const actual = after.values[key];
    if (key === 'meta' || key === 'acf') {
      const values = z.record(z.string(), z.unknown()).parse(actual);
      for (const [field, value] of Object.entries(z.record(z.string(), z.unknown()).parse(expected))) if (stableHash(values[field]) !== stableHash(value)) throw new Error(`Field readback mismatch: ${key}.${field}.`);
    } else if (stableHash(actual) !== stableHash(expected)) throw new Error(`Content readback mismatch: ${key}.`);
  }
  if (!plan.before) return;
  for (const [key, before] of Object.entries(plan.before.values)) {
    if (key === 'meta' || key === 'acf') {
      const previous = z.record(z.string(), z.unknown()).parse(before);
      const current = z.record(z.string(), z.unknown()).parse(after.values[key]);
      const patches = { ...z.record(z.string(), z.unknown()).parse(plan.patch.meta ?? {}), ...z.record(z.string(), z.unknown()).parse(plan.patch.acf ?? {}) };
      for (const [field, value] of Object.entries(previous)) {
        if (field.startsWith('_')) continue; // Plugin-maintained internal flags are not user-editable fields.
        const expected = Object.hasOwn(patches, field) ? patches[field] : value;
        if (stableHash(current[field]) !== stableHash(expected)) throw new Error(`Unexpected field change: ${key}.${field}.`);
      }
    } else if (!(key in plan.patch)) {
      // WordPress assigns publication dates when a draft is first published.
      if (['date', 'date_gmt'].includes(key) && plan.before.values.status === 'draft' && plan.patch.status === 'publish') continue;
      if (stableHash(after.values[key]) !== stableHash(before)) throw new Error(`Unrequested content change: ${key}.`);
    }
  }
}

/** Caller holds the task lock. A persisted response resumes readback without a second POST. */
export async function executeContentPlan(client: WordPressClient, journal: Journal, raw: unknown): Promise<ContentRecord> {
  const plan = contentPlan.parse(raw);
  const planId = hash(plan);
  if (plan.identity !== client.identity) throw new Error('Content plan belongs to another connection.');
  const receipt = await journal.mutate(`content-${planId}`, plan, contentRecordSchema, async () => {
    const currentModel = await discoverContentModel(client, plan.input.type);
    if (stableHash(currentModel) !== stableHash(plan.model)) throw new Error('Content schema changed since planning.');
    if (plan.before && contentVersion(await readContent(client, plan.model, plan.before.id)) !== contentVersion(plan.before)) throw new Error('Content changed since planning; no update sent.');
    if (plan.input.slug) await uniqueSlug(client, plan.model, plan.input.slug, plan.before?.id);
  }, () => client.request(`${plan.model.route}${plan.before ? `/${plan.before.id}` : ''}`, 'POST', plan.patch), async response => {
    const id = z.object({ id: z.number().int().positive() }).parse(response).id;
    if (plan.before && id !== plan.before.id) throw new Error('Update returned an unexpected content ID.');
    const after = await readContent(client, plan.model, id);
    verifyValues(plan, after);
    return after;
  });
  const fresh = await readContent(client, plan.model, receipt.id);
  if (contentVersion(fresh) !== contentVersion(receipt)) throw new Error('Content changed after the saved receipt; inspect current record.');
  return fresh;
}

export async function applyContent(client: WordPressClient, journal: Journal, planId: string) {
  z.string().regex(/^[a-f0-9]{64}$/).parse(planId);
  return journal.lock(async () => {
    const plan = contentPlan.parse(await journal.load(`content-${planId}.json`));
    if (hash(plan) !== planId) throw new Error('Content plan hash mismatch.');
    const record = await executeContentPlan(client, journal, plan);
    return { ...record, version: contentVersion(record), frontendVerified: false, evidenceDirectory: journal.directory };
  });
}
