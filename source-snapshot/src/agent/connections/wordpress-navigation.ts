import {z} from 'zod';
import {wordpressConnection} from './wordpress';
import {wordpressMutation,type WpContext} from './wordpress-workflows';
import {escapeHtml} from './wordpress-blocks';
import {seoHash} from './dataforseo';
import {saveSeoEvidence} from './seo-advanced';
import {fileRefSchema} from '../files/model';
const partId=z.string().regex(/^[a-zA-Z0-9_-]+\/\/[a-zA-Z0-9_-]+$/);
const partSchema=z.object({id:partId,theme:z.string(),status:z.literal('publish'),content:z.object({raw:z.string().max(120000)})});
const pageSchema=z.object({id:z.number().int().positive(),type:z.literal('page'),status:z.literal('publish'),link:z.url()});
export const wpPlanNavigationSchema=z.object({templatePart:partId,navigationMarkup:z.string().min(1).max(12000),links:z.array(z.object({pageId:z.number().int().positive(),label:z.string().trim().min(1).max(100)}).strict()).min(1).max(12)}).strict();
export const wpApplyNavigationSchema=z.object({plan:fileRefSchema}).strict();
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
const navigationRecord=z.object({id:z.number().int().positive(),content:z.object({raw:z.string().max(120000)})});
const planSchema=z.object({identity:z.string(),input:wpPlanNavigationSchema,theme:z.string(),before:partSchema,pages:z.array(pageSchema),links:z.array(z.object({label:z.string(),pageId:z.number(),url:z.string()})),content:z.string().max(140000),detachedRef:z.number().optional(),referencedNavigation:navigationRecord.optional()});
async function currentTheme(ctx:WpContext){const c=await wordpressConnection();const themes=z.array(z.object({stylesheet:z.string(),is_block_theme:z.boolean()})).parse(await c.api('/wp/v2/themes?status=active',ctx.signal));if(themes.length!==1||!themes[0]!.is_block_theme)throw new Error('需要可读取的现有区块主题。');return themes[0]!.stylesheet;}
async function readPart(id:string,ctx:WpContext){const c=await wordpressConnection();const result=partSchema.parse(await c.api(`/wp/v2/template-parts/${partId.parse(id)}?context=edit`,ctx.signal));if(result.id!==id)throw new Error('模板部件ID不一致。');return result;}
async function readPages(input:z.infer<typeof wpPlanNavigationSchema>,ctx:WpContext){
 const c=await wordpressConnection(),pages=[];
 if(new Set(input.links.map(link=>link.pageId)).size!==input.links.length)throw new Error('导航页面不能重复。');
 for(const link of input.links){const page=pageSchema.parse(await c.api(`/wp/v2/pages/${link.pageId}?context=edit`,ctx.signal));if(page.id!==link.pageId||new URL(page.link).origin!==new URL(c.site).origin||new URL(page.link).username||new URL(page.link).password)throw new Error('导航只允许真实已发布站内页面。');pages.push(page);}
 return pages;
}
export async function wpPlanNavigation(raw:z.input<typeof wpPlanNavigationSchema>,ctx:WpContext){
 const input=wpPlanNavigationSchema.parse(raw),c=await wordpressConnection(),theme=await currentTheme(ctx),before=await readPart(input.templatePart,ctx);
 if(before.theme!==theme||!before.id.startsWith(theme+'//'))throw new Error('仅修改当前主题的模板部件。');
 const pages=await readPages(input,ctx),links=input.links.map((link,i)=>({...link,url:pages[i]!.link}));
 const patch=replaceNavigation(before.content.raw,input.navigationMarkup,links);
 const referencedNavigation=patch.detachedRef===undefined?undefined:navigationRecord.parse(await c.api(`/wp/v2/navigation/${z.number().int().positive().parse(patch.detachedRef)}?context=edit`,ctx.signal));
 if(referencedNavigation&&referencedNavigation.id!==patch.detachedRef)throw new Error('共享导航ID不一致。');
 const plan=planSchema.parse({identity:c.identity,input,theme,before,pages,links,...patch,referencedNavigation});
 const planId=await seoHash(JSON.stringify(plan)),file=await saveSeoEvidence(ctx.files,'wordpress-navigation-plan',plan,ctx.assertActive);
 ctx.state.wpNavigationPreviews=[...new Set([...(ctx.state.wpNavigationPreviews??[]),planId])].slice(-20);await ctx.persist();
 const removed=referencedNavigation?.content.raw??input.navigationMarkup;
 return {plan:file,planId,templatePart:before.id,links,removedNavigation:removed.slice(0,6000),removedNavigationComplete:removed.length<=6000,detachedRef:patch.detachedRef,impact:'替换此部件中的选定导航，所有引用此部件的页面会受影响。ref转为部件内联菜单，原共享菜单记录不修改。完整旧内容在计划文件。',frontendVerified:false,concurrency:'客户端写前检查，非服务端原子锁。'};
}
export async function wpApplyNavigation(raw:z.input<typeof wpApplyNavigationSchema>,ctx:WpContext){
 const input=wpApplyNavigationSchema.parse(raw),c=await wordpressConnection(),file=await ctx.files.store.read(ctx.files.task,input.plan.path,input.plan.version);
 const plan=planSchema.parse(JSON.parse(file.content)),planId=await seoHash(JSON.stringify(plan));
 if(plan.identity!==c.identity||!ctx.state.wpNavigationPreviews?.includes(planId))throw new Error('请先生成并检查本任务当前连接的导航计划。');
 return wordpressMutation(ctx,c.identity,{kind:'navigation-part',planId},()=>c.api(`/wp/v2/template-parts/${plan.input.templatePart}`,ctx.signal,'POST',{content:plan.content}),async()=>{
  const after=await readPart(plan.input.templatePart,ctx),theme=await currentTheme(ctx);
  return {templatePart:after.id,contentMatches:after.content.raw===plan.content,themeMatches:theme===plan.theme,frontendVerified:false,evidence:await saveSeoEvidence(ctx.files,'wordpress-navigation-after',after,ctx.assertActive)};
 },async()=>{
  const before=await readPart(plan.input.templatePart,ctx),theme=await currentTheme(ctx),pages=await readPages(plan.input,ctx);
  if(theme!==plan.theme||JSON.stringify(before)!==JSON.stringify(plan.before)||JSON.stringify(pages)!==JSON.stringify(plan.pages))throw new Error('模板、主题或页面链接已变化，请重新生成计划。');
  if(plan.referencedNavigation){const current=navigationRecord.parse(await c.api(`/wp/v2/navigation/${plan.referencedNavigation.id}?context=edit`,ctx.signal));if(JSON.stringify(current)!==JSON.stringify(plan.referencedNavigation))throw new Error('共享菜单内容已变化，请重新生成计划。');}
  if(replaceNavigation(before.content.raw,plan.input.navigationMarkup,plan.links).content!==plan.content)throw new Error('计划内容不一致。');
 });
}
