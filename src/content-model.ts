import { z } from 'zod';
import { WordPressClient, hash } from './client.js';

const record = z.record(z.string(), z.unknown());
export const contentType = z.string().regex(/^[a-z][a-z0-9_-]{0,31}$/).refine(value => !value.startsWith('wp_') && !['attachment', 'revision', 'nav_menu_item'].includes(value), 'Use an actual public editorial content type.');
export const modelSchema = z.object({
  type: contentType, route: z.string(),
  properties: z.record(z.string(), record), args: z.record(z.string(), record),
});
export type ContentModel = z.infer<typeof modelSchema>;
export function wpProperties(raw: unknown): Record<string, Record<string, unknown>> {
  // PHP encodes an empty field map as [] in some ACF responses.
  if (Array.isArray(raw) && raw.length === 0) return {};
  return z.record(z.string(), record).parse(raw);
}

export async function discoverContentModel(client: WordPressClient, type: string): Promise<ContentModel> {
  contentType.parse(type);
  // get_all_post_type_supports returns true or an argument array (e.g. editor notes).
  const supported = z.union([z.literal(true), z.array(z.unknown()).min(1)]);
  const definition = z.object({ slug: z.string(), rest_namespace: z.string().regex(/^[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*$/), rest_base: z.string().regex(/^[a-zA-Z0-9_-]+$/), viewable: z.literal(true), supports: z.object({ title: supported, editor: supported }) }).parse(await client.request(`/wp/v2/types/${type}?context=edit`));
  if (definition.slug !== type) throw new Error('Content type identity mismatch.');
  const route = `/${definition.rest_namespace}/${definition.rest_base}`;
  const options = z.object({ schema: z.object({ properties: z.record(z.string(), record) }), endpoints: z.array(z.object({ methods: z.array(z.string()), args: z.record(z.string(), record) })) }).parse(await client.request(route, 'OPTIONS'));
  const write = options.endpoints.find(endpoint => endpoint.methods.includes('POST'));
  if (!write) throw new Error('The discovered content endpoint does not declare POST.');
  return modelSchema.parse({ type, route, properties: options.schema.properties, args: write.args });
}

/** Keep server constraints; normalize WordPress's property-level required booleans. */
export function normalizeWpSchema(raw: unknown): z.core.JSONSchema.JSONSchema {
  const source = record.parse(raw);
  const result: z.core.JSONSchema.JSONSchema = { ...source };
  delete result.default; // Validation must not inject values into a partial update.
  delete result.context;
  delete result.readonly;
  if (typeof source.required === 'boolean') delete result.required;
  else if (source.required !== undefined) result.required = z.array(z.string()).parse(source.required);
  if (source.properties !== undefined) {
    const properties = wpProperties(source.properties);
    const required = new Set(result.required ?? []);
    result.properties = Object.fromEntries(Object.entries(properties).map(([key, value]) => {
      if (record.parse(value).required === true) required.add(key);
      return [key, normalizeWpSchema(value)];
    }));
    result.required = [...required];
  }
  for (const key of ['items', 'additionalProperties'] as const) {
    const value = source[key];
    if (value !== undefined && typeof value !== 'boolean') result[key] = normalizeWpSchema(value);
  }
  for (const key of ['anyOf', 'oneOf', 'allOf'] as const) {
    if (source[key] !== undefined) result[key] = z.array(z.unknown()).parse(source[key]).map(normalizeWpSchema);
  }
  return result;
}

export function assertWritable(definition: Record<string, unknown> | undefined, label: string): asserts definition is Record<string, unknown> {
  if (!definition || definition.readonly === true || definition.readOnly === true || (Array.isArray(definition.context) && !definition.context.includes('edit'))) throw new Error(`Field ${label} is not explicitly writable in the discovered schema.`);
}

export function fieldDefinitions(model: ContentModel, group: 'meta' | 'acf'): Record<string, Record<string, unknown>> {
  const definition = model.args[group];
  assertWritable(definition, group);
  return wpProperties(definition.properties);
}

export function validateFieldPatch(model: ContentModel, group: 'meta' | 'acf', values: Record<string, unknown>): void {
  const fields = fieldDefinitions(model, group);
  for (const [key, value] of Object.entries(values)) {
    if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(key)) throw new Error('Protected or invalid field key.');
    const definition = fields[key];
    assertWritable(definition, `${group}.${key}`);
    if (value === null) throw new Error('Null field deletion needs a field-specific adapter; use an explicit supported value.');
    z.fromJSONSchema(normalizeWpSchema(definition)).parse(value);
  }
}

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value !== null && typeof value === 'object') return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, canonical(item)]));
  return value;
}
export const stableHash = (value: unknown): string => hash({ value: canonical(value) });

export const contentRecordSchema = z.object({ id: z.number().int().positive(), type: contentType, link: z.url(), modified_gmt: z.string(), values: z.record(z.string(), z.unknown()) });
export type ContentRecord = z.infer<typeof contentRecordSchema>;
export const contentVersion = (record: ContentRecord): string => stableHash({ id: record.id, type: record.type, modified_gmt: record.modified_gmt, values: record.values });

export async function readContent(client: WordPressClient, model: ContentModel, id: number): Promise<ContentRecord> {
  const raw = record.parse(await client.request(`${model.route}/${z.number().int().positive().parse(id)}?context=edit`));
  const identity = contentRecordSchema.omit({ values: true }).parse(raw);
  if (identity.id !== id || identity.type !== model.type || new URL(identity.link).origin !== new URL(client.site).origin) throw new Error('Content identity or origin mismatch.');
  const values: Record<string, unknown> = {};
  for (const [key, definition] of Object.entries(model.properties)) {
    if (definition.readonly === true || definition.readOnly === true || raw[key] === undefined) continue;
    if (['title', 'content', 'excerpt'].includes(key)) values[key] = z.object({ raw: z.string() }).parse(raw[key]).raw;
    else values[key] = (key === 'meta' || key === 'acf') && Array.isArray(raw[key]) && raw[key].length === 0 ? {} : raw[key];
  }
  return { ...identity, values };
}
