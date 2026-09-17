import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { parse } from 'csv-parse/sync';
import { z } from 'zod';
import { WordPressClient, hash } from './client.js';
import { Journal } from './journal.js';
import { contentType, contentVersion } from './content-model.js';
import { contentInput, contentPlan, executeContentPlan, prepareContentPlan, type ContentInput } from './content.js';
import { wpBlocksSchema } from './blocks.js';

export const importInput = z.object({
  file: z.string().min(1), type: contentType, keyColumn: z.string().min(1), titleColumn: z.string().min(1),
  slugColumn: z.string().min(1).optional(), excerptColumn: z.string().min(1).optional(),
  fields: z.array(z.object({ column: z.string().min(1), group: z.enum(['meta', 'acf']), key: z.string().regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/) }).strict()).max(50),
  blocks: wpBlocksSchema.optional(),
}).strict().superRefine((input, ctx) => {
  if (new Set(input.fields.map(field => field.key)).size !== input.fields.length) ctx.addIssue({ code: 'custom', message: 'Each destination field may be mapped only once, including meta/ACF aliases.' });
});
type ImportInput = z.infer<typeof importInput>;
const sourceHash = (bytes: Uint8Array): string => createHash('sha256').update(bytes).digest('hex');
const batchSchema = z.object({ identity: z.string(), input: importInput, sourceHash: z.string(), keys: z.array(z.string()), plans: z.array(contentPlan).min(1).max(20) });

/** csv-parse handles quoting, BOM and embedded newlines; values stay strings, without guessed coercions. */
export function importRows(bytes: Uint8Array, input: ImportInput): { keys: string[]; inputs: ContentInput[] } {
  if (bytes.byteLength > 1_048_576) throw new Error('CSV is limited to 1 MiB per batch.');
  const rows = parse(bytes, { bom: true, skip_empty_lines: true, max_record_size: 128_000 });
  const [header, ...data] = rows;
  if (!header || !data.length || data.length > 20) throw new Error('A CSV batch must contain a header and 1–20 records. Split larger sources explicitly.');
  if (header.some(key => !key.trim()) || new Set(header).size !== header.length) throw new Error('CSV headers must be nonempty and unique.');
  const columns = [input.keyColumn, input.titleColumn, input.slugColumn, input.excerptColumn, ...input.fields.map(field => field.column)].filter(column => column !== undefined);
  for (const column of columns) if (!header.includes(column)) throw new Error(`Missing CSV column: ${column}.`);
  const keys: string[] = [];
  const inputs = data.map(row => {
    const values = Object.fromEntries(header.map((key, index) => [key, z.string().parse(row[index])]));
    const key = z.string().trim().min(1).max(200).parse(values[input.keyColumn]);
    if (keys.includes(key)) throw new Error(`Duplicate stable key: ${key}.`);
    keys.push(key);
    const meta: Record<string, string> = {}, acf: Record<string, string> = {};
    for (const field of input.fields) (field.group === 'meta' ? meta : acf)[field.key] = z.string().parse(values[field.column]);
    return contentInput.parse({
      type: input.type, title: values[input.titleColumn],
      slug: input.slugColumn ? values[input.slugColumn] : `import-${input.type.replaceAll('_', '-')}-${hash([input.type, key]).slice(0, 20)}`,
      excerpt: input.excerptColumn ? values[input.excerptColumn] : undefined, blocks: input.blocks,
      ...(Object.keys(meta).length ? { meta } : {}), ...(Object.keys(acf).length ? { acf } : {}),
    });
  });
  if (new Set(inputs.map(input => input.slug)).size !== inputs.length) throw new Error('Duplicate CSV destination slugs.');
  return { keys, inputs };
}

export async function planImport(client: WordPressClient, journal: Journal, raw: ImportInput) {
  return journal.lock(async () => {
    const input = importInput.parse({ ...raw, file: resolve(raw.file) });
    const bytes = await readFile(input.file);
    const rows = importRows(bytes, input);
    const plans: z.infer<typeof contentPlan>[] = [];
    // Validate the entire batch against the server before any record is written.
    for (const row of rows.inputs) plans.push(await prepareContentPlan(client, row));
    const plan = batchSchema.parse({ identity: client.identity, input, sourceHash: sourceHash(bytes), keys: rows.keys, plans });
    const planId = hash(plan);
    await journal.save(`import-${planId}.json`, plan);
    return { planId, count: plans.length, sourceHash: plan.sourceHash, records: plans.map((plan, index) => ({ key: rows.keys[index], patch: plan.patch })), impact: 'Creates drafts only. Review all mappings and raw body before applying. Existing slugs are never overwritten.' };
  });
}

export async function applyImport(client: WordPressClient, journal: Journal, planId: string) {
  z.string().regex(/^[a-f0-9]{64}$/).parse(planId);
  return journal.lock(async () => {
    const plan = batchSchema.parse(await journal.load(`import-${planId}.json`));
    if (plan.identity !== client.identity || hash(plan) !== planId) throw new Error('Import plan identity or hash mismatch.');
    if (sourceHash(await readFile(plan.input.file)) !== plan.sourceHash) throw new Error('CSV changed since planning; no writes sent. Restore the reviewed source or create a new reviewed plan.');
    const records = [];
    for (const [index, item] of plan.plans.entries()) {
      const record = await executeContentPlan(client, journal, item);
      records.push({ key: plan.keys[index], id: record.id, type: record.type, url: record.link, status: record.values.status, version: contentVersion(record) });
      await journal.save(`import-progress-${planId}.json`, { planId, completed: records.length, total: plan.plans.length, records });
    }
    return { planId, records, frontendVerified: false, evidenceDirectory: journal.directory };
  });
}
