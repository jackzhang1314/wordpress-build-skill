// Fragment replacement adapted from the preserved WordPress navigation implementation.
// Codex adapter added 2026-09-08; source-snapshot remains unchanged.
import { z } from 'zod';
import { WordPressClient, hash } from './client.js';
import { Journal } from './journal.js';
import { escapeHtml } from './blocks.js';
import { readPage } from './pages.js';
const jsonAttributes=(value:object)=>JSON.stringify(value).replaceAll('--','\\u002d\\u002d').replaceAll('<','\\u003c').replaceAll('>','\\u003e').replaceAll('&','\\u0026');
const attributes=(text:string|undefined)=>z.record(z.string(),z.unknown()).parse(text?JSON.parse(text):{});
/** Deliberately limited fragment validator, not a general Gutenberg parser. */
export function replaceNavigation(content:string,markup:string,links:readonly {label:string;pageId:number;url:string}[]){
 const start=content.indexOf(markup);
 if(start<0||content.indexOf(markup,start+1)>=0)throw new Error('导航片段必须与部件原文唯一匹配。');
 const single=/^<!-- wp:navigation(?: (\{[^\r\n]*?\}))? \/-->$/.exec(markup);
 const paired=/^<!-- wp:navigation(?: (\{[^\r\n]*?\}))? -->([\s\S]*)<!-- \/wp:navigation -->$/.exec(markup);
 if(!single&&!paired)throw new Error('仅支持完整原生简单导航片段。');
 const attrs=attributes(single?.[1]??paired?.[1]);
 if(attrs.lock||attrs.templateLock||attrs.metadata)throw new Error('锁定或带特殊绑定的导航需在站点编辑器处理。');
 if(paired){
  const inner=paired[2]??'';
  const remainder=inner.replace(/<!-- wp:(navigation-link|page-list)(?: (\{[^\r\n]*?\}))? \/-->/g,(_match:string,_name:string,raw:string|undefined)=>{const child=attributes(raw);if(child.lock||child.metadata)throw new Error('子区块包含锁或绑定。');return '';});
  if(remainder.trim())throw new Error('导航包含未适配的子菜单或自定义内容，不能覆盖。');
 }
 const detachedRef=typeof attrs.ref==='number'?attrs.ref:undefined;
 delete attrs.ref;
 const children=links.map(link=>`<!-- wp:navigation-link ${jsonAttributes({label:escapeHtml(link.label),type:'page',id:link.pageId,url:link.url,kind:'post-type'})} /-->`).join('\n');
 const replacement=`<!-- wp:navigation${Object.keys(attrs).length?' '+jsonAttributes(attrs):''} -->\n${children}\n<!-- /wp:navigation -->`;
 return {content:content.slice(0,start)+replacement+content.slice(start+markup.length),detachedRef};
}
const partId = z.string().regex(/^[a-zA-Z0-9_-]+\/\/[a-zA-Z0-9_-]+$/);
const partSchema = z.object({ id: partId, theme: z.string(), content: z.object({ raw: z.string() }) });
export const navigationInput = z.object({ templatePart: partId, markup: z.string().min(1).max(12000), links: z.array(z.object({ pageId: z.number().int().positive(), label: z.string().min(1).max(100) }).strict()).min(1).max(20) }).strict();
const navigationPlan = z.object({ identity: z.string(), input: navigationInput, before: partSchema, theme: z.string(), content: z.string(), links: z.array(z.object({ pageId: z.number(), label: z.string(), url: z.string() })), referenced: z.object({ id: z.number(), content: z.object({ raw: z.string() }) }).optional() });

async function theme(client: WordPressClient): Promise<string> {
  const themes = z.array(z.object({ stylesheet: z.string(), is_block_theme: z.boolean() })).parse(await client.request('/wp/v2/themes?status=active'));
  if (themes.length !== 1 || !themes[0]?.is_block_theme) throw new Error('Navigation adapter requires one active block theme.');
  return themes[0].stylesheet;
}
async function readPart(client: WordPressClient, id: string) {
  const part = partSchema.parse(await client.request(`/wp/v2/template-parts/${partId.parse(id)}?context=edit`));
  if (part.id !== id) throw new Error('Template part ID mismatch.');
  return part;
}
async function readLinks(client: WordPressClient, input: z.infer<typeof navigationInput>) {
  if (new Set(input.links.map(link => link.pageId)).size !== input.links.length) throw new Error('Duplicate navigation pages.');
  return Promise.all(input.links.map(async link => {
    const page = await readPage(client, link.pageId);
    if (page.status !== 'publish') throw new Error('Navigation targets must be published.');
    return { ...link, url: page.link };
  }));
}

export async function planNavigation(client: WordPressClient, journal: Journal, input: z.infer<typeof navigationInput>) {
  return journal.lock(async () => {
    const active = await theme(client), before = await readPart(client, input.templatePart);
    if (before.theme !== active) throw new Error('Template part is not in the active theme.');
    const links = await readLinks(client, input);
    const patch = replaceNavigation(before.content.raw, input.markup, links);
    const referenced = patch.detachedRef === undefined ? undefined : z.object({ id: z.number(), content: z.object({ raw: z.string() }) }).parse(await client.request(`/wp/v2/navigation/${z.number().int().positive().parse(patch.detachedRef)}?context=edit`));
    if (referenced) {
      if (referenced.id !== patch.detachedRef) throw new Error('Referenced navigation mismatch.');
      // Validate the contents of a shared ref as well; do not silently discard nested menus.
      const wrapped = `<!-- wp:navigation -->${referenced.content.raw}<!-- /wp:navigation -->`;
      replaceNavigation(wrapped, wrapped, links);
    }
    const plan = navigationPlan.parse({ identity: client.identity, input, before, theme: active, content: patch.content, links, referenced });
    const planId = hash(plan);
    await journal.save(`navigation-${planId}.json`, plan);
    return { planId, before: before.content.raw, after: plan.content, links, detachedRef: patch.detachedRef, impact: 'Changes the selected navigation in every page using this template part; original shared menu records remain intact.' };
  });
}

export async function applyNavigation(client: WordPressClient, journal: Journal, planId: string) {
  z.string().regex(/^[a-f0-9]{64}$/).parse(planId);
  return journal.lock(async () => {
    const plan = navigationPlan.parse(await journal.load(`navigation-${planId}.json`));
    if (plan.identity !== client.identity || hash(plan) !== planId) throw new Error('Navigation plan identity or hash mismatch.');
    const after = await journal.mutate('navigation-' + planId, plan, partSchema, async () => {
      if (await theme(client) !== plan.theme || hash(await readPart(client, plan.before.id)) !== hash(plan.before) || hash(await readLinks(client, plan.input)) !== hash(plan.links)) throw new Error('Navigation dependencies changed; generate a fresh plan.');
      if (plan.referenced) {
        const current = z.object({ id: z.number(), content: z.object({ raw: z.string() }) }).parse(await client.request(`/wp/v2/navigation/${plan.referenced.id}?context=edit`));
        if (hash(current) !== hash(plan.referenced)) throw new Error('Shared menu changed since planning.');
      }
      if (replaceNavigation(plan.before.content.raw, plan.input.markup, plan.links).content !== plan.content) throw new Error('Navigation content mismatch.');
    }, () => client.request(`/wp/v2/template-parts/${plan.before.id}`, 'POST', { content: plan.content }), async () => {
      const current = await readPart(client, plan.before.id);
      if (current.content.raw !== plan.content || await theme(client) !== plan.theme) throw new Error('Navigation readback mismatch.');
      return current;
    });
    if (hash(await readPart(client, after.id)) !== hash(after)) throw new Error('Navigation changed after the saved receipt.');
    return { templatePart: after.id, contentMatches: true, frontendVerified: false, evidenceDirectory: journal.directory };
  });
}
