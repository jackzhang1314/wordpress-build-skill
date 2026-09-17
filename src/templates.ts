import { z } from 'zod';
import { WordPressClient, WordPressError, hash } from './client.js';
import { Journal } from './journal.js';
import { contentType, discoverContentModel, stableHash } from './content-model.js';
import { serializeWpBlocks } from './blocks.js';
import { pageSchema, readPage } from './pages.js';

const themeName = z.string().regex(/^[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)?$/);
export const templateId = z.string().regex(/^[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)?\/\/[a-zA-Z0-9_-]+$/);
export const templateSchema = z.object({
  id: templateId, theme: themeName, slug: z.string(), type: z.literal('wp_template'),
  source: z.string(), content: z.object({ raw: z.string() }), title: z.object({ raw: z.string() }),
  description: z.string(), status: z.string(), wp_id: z.number().int().nonnegative(), modified: z.string().nullable(),
});
type Template = z.infer<typeof templateSchema>;
const partSchema = z.object({ id: templateId, theme: themeName, slug: z.string(), area: z.string(), content: z.object({ raw: z.string() }) });
export const templateVersion = (template: Template): string => stableHash(template);
export const singleTemplateInput = z.object({
  postType: contentType.refine(value => !['post', 'page'].includes(value), 'This adapter creates dedicated custom-content templates.'),
  title: z.string().min(1).max(200), description: z.string().max(2000).default(''),
  header: templateId, footer: templateId, expectedVersion: z.string().regex(/^[a-f0-9]{64}$/).optional(),
  showFeaturedImage: z.boolean().default(true),
  cta: z.object({ pageId: z.number().int().positive(), heading: z.string().min(1).max(200), text: z.string().min(1).max(2000), label: z.string().min(1).max(100) }).strict().optional(),
}).strict();
type Input = z.infer<typeof singleTemplateInput>;
const planSchema = z.object({ identity: z.string(), input: singleTemplateInput, theme: themeName, id: templateId, slug: z.string(), before: templateSchema.optional(), fallback: templateSchema.optional(), header: partSchema, footer: partSchema, ctaPage: pageSchema.optional(), content: z.string() });

async function activeTheme(client: WordPressClient): Promise<string> {
  const themes = z.array(z.object({ stylesheet: themeName, is_block_theme: z.boolean() })).parse(await client.request('/wp/v2/themes?status=active'));
  if (themes.length !== 1 || !themes[0]?.is_block_theme) throw new Error('Dedicated single templates require one active block theme.');
  return themes[0].stylesheet;
}
export async function readTemplate(client: WordPressClient, id: string): Promise<Template> {
  const template = templateSchema.parse(await client.request(`/wp/v2/templates/${templateId.parse(id)}?context=edit`));
  if (template.id !== id) throw new Error('Template ID mismatch.');
  return template;
}
async function optionalTemplate(client: WordPressClient, id: string): Promise<Template | undefined> {
  try { return await readTemplate(client, id); }
  catch (error) { if (error instanceof WordPressError && error.status === 404 && error.code === 'rest_template_not_found') return undefined; throw error; }
}
async function readPart(client: WordPressClient, id: string, theme: string, area: 'header' | 'footer') {
  const part = partSchema.parse(await client.request(`/wp/v2/template-parts/${templateId.parse(id)}?context=edit`));
  if (part.id !== id || part.theme !== theme || part.area !== area) throw new Error(`Select an actual ${area} part from the active theme.`);
  return part;
}
async function publishedCta(client: WordPressClient, input: Input) {
  if (!input.cta) return undefined;
  const page = await readPage(client, input.cta.pageId);
  if (page.status !== 'publish') throw new Error('Template CTA must link to an actual published page.');
  return page;
}

const attrs = (value: object) => JSON.stringify(value).replaceAll('--', '\\u002d\\u002d').replaceAll('<', '\\u003c').replaceAll('>', '\\u003e').replaceAll('&', '\\u0026');
function renderTemplate(input: Input, theme: string, headerSlug: string, footerSlug: string, ctaUrl?: string): string {
  const cta = input.cta && ctaUrl ? serializeWpBlocks([{ type: 'section', style: { padding: 24, radius: 12 }, children: [{ type: 'heading', level: 2, text: input.cta.heading }, { type: 'paragraph', text: input.cta.text }, { type: 'button', text: input.cta.label, url: ctaUrl }] }], new Map()) : '';
  return `<!-- wp:template-part ${attrs({ slug: headerSlug, theme, tagName: 'header' })} /-->

<!-- wp:group {"tagName":"main","style":{"spacing":{"padding":{"top":"48px","right":"24px","bottom":"64px","left":"24px"},"blockGap":"32px"}},"layout":{"type":"constrained"}} -->
<main class="wp-block-group" style="padding-top:48px;padding-right:24px;padding-bottom:64px;padding-left:24px">
<!-- wp:post-title {"level":1} /-->
${input.showFeaturedImage ? '<!-- wp:post-featured-image /-->\n' : ''}<!-- wp:post-content {"layout":{"type":"constrained"}} /-->
${cta}
</main>
<!-- /wp:group -->

<!-- wp:template-part ${attrs({ slug: footerSlug, theme, tagName: 'footer' })} /-->`;
}

async function checkWritable(client: WordPressClient, id?: string) {
  const options = z.object({ endpoints: z.array(z.object({ methods: z.array(z.string()), args: z.record(z.string(), z.record(z.string(), z.unknown())) })) }).parse(await client.request(`/wp/v2/templates${id ? `/${id}` : ''}`, 'OPTIONS'));
  const endpoint = options.endpoints.find(item => item.methods.includes('POST'));
  for (const key of ['content', 'title', 'description', ...(id ? [] : ['slug', 'theme'])]) {
    const field = endpoint?.args[key];
    if (!field || field.readonly === true || field.readOnly === true) throw new Error(`Template endpoint does not declare writable ${key}.`);
  }
}

export async function planSingleTemplate(client: WordPressClient, journal: Journal, raw: Input) {
  return journal.lock(async () => {
    const input = singleTemplateInput.parse(raw);
    await discoverContentModel(client, input.postType);
    const theme = await activeTheme(client);
    const slug = `single-${input.postType}`, id = `${theme}//${slug}`;
    const before = await optionalTemplate(client, id);
    if (before ? templateVersion(before) !== input.expectedVersion : input.expectedVersion !== undefined) throw new Error('Existing templates require the current expectedVersion; a new template has no version.');
    const fallback = before ? undefined : templateSchema.parse(await client.request(`/wp/v2/templates/lookup?slug=${slug}&context=edit`));
    if (fallback && fallback.theme !== theme) throw new Error('Fallback template is outside the active theme; inspect its origin before adapting.');
    const header = await readPart(client, input.header, theme, 'header');
    const footer = await readPart(client, input.footer, theme, 'footer');
    const ctaPage = await publishedCta(client, input);
    const content = renderTemplate(input, theme, header.slug, footer.slug, ctaPage?.link);
    await checkWritable(client, before?.id);
    const registered = new Set(z.array(z.object({ name: z.string() })).parse(await client.request('/wp/v2/block-types?context=edit')).map(item => item.name));
    for (const match of content.matchAll(/<!-- wp:([a-z0-9/-]+)/g)) if (!registered.has(`core/${match[1]}`)) throw new Error(`Template block core/${match[1]} is not registered.`);
    const plan = planSchema.parse({ identity: client.identity, input, theme, slug, id, before, fallback, header, footer, ctaPage, content });
    const planId = hash(plan);
    await journal.save(`template-${planId}.json`, plan);
    return { planId, id, before: (before ?? fallback)?.content.raw, after: content, impact: `Applies immediately to ${input.postType} single views using the default hierarchy. Replaces the dedicated template body while referencing the selected unchanged header/footer. Per-item custom templates and more-specific single templates can take precedence.`, created: !before, frontendVerified: false };
  });
}

export async function applySingleTemplate(client: WordPressClient, journal: Journal, planId: string) {
  z.string().regex(/^[a-f0-9]{64}$/).parse(planId);
  return journal.lock(async () => {
    const plan = planSchema.parse(await journal.load(`template-${planId}.json`));
    if (plan.identity !== client.identity || hash(plan) !== planId) throw new Error('Template plan identity or hash mismatch.');
    const receipt = await journal.mutate(`template-${planId}`, plan, templateSchema, async () => {
      if (await activeTheme(client) !== plan.theme) throw new Error('Active theme changed since template planning.');
      await discoverContentModel(client, plan.input.postType);
      await checkWritable(client, plan.before?.id);
      const current = await optionalTemplate(client, plan.id);
      if (stableHash(current) !== stableHash(plan.before)) throw new Error('Dedicated template changed or appeared since planning.');
      if (plan.fallback && templateVersion(await readTemplate(client, plan.fallback.id)) !== templateVersion(plan.fallback)) throw new Error('Fallback template changed since planning.');
      if (stableHash(await readPart(client, plan.header.id, plan.theme, 'header')) !== stableHash(plan.header) || stableHash(await readPart(client, plan.footer.id, plan.theme, 'footer')) !== stableHash(plan.footer) || stableHash(await publishedCta(client, plan.input)) !== stableHash(plan.ctaPage)) throw new Error('Template part or CTA dependencies changed since planning.');
    }, () => client.request(`/wp/v2/templates${plan.before ? `/${plan.id}` : ''}`, 'POST', { ...(plan.before ? {} : { slug: plan.slug, theme: plan.theme }), title: plan.input.title, description: plan.input.description, content: plan.content }), async response => {
      const responseId = z.object({ id: z.string() }).parse(response).id;
      if (responseId !== plan.id) throw new Error('Unexpected template ID returned; inspect the saved response.');
      const after = await readTemplate(client, plan.id);
      if (after.theme !== plan.theme || after.slug !== plan.slug || after.content.raw !== plan.content || after.title.raw !== plan.input.title || after.description !== plan.input.description || after.status !== 'publish') throw new Error('Template readback mismatch.');
      return after;
    });
    const fresh = await readTemplate(client, plan.id);
    if (templateVersion(fresh) !== templateVersion(receipt) || await activeTheme(client) !== plan.theme) throw new Error('Template or active theme changed after the receipt.');
    return { id: fresh.id, wpId: fresh.wp_id, version: templateVersion(fresh), contentMatches: true, frontendVerified: false, evidenceDirectory: journal.directory };
  });
}
