import {z} from 'zod';
import {wordpressConnection} from './wordpress';
import {wordpressMutation,type WpContext} from './wordpress-workflows';
import {saveSeoEvidence} from './seo-advanced';
import {seoHash} from './dataforseo';
import {WordpressError} from './wordpress';
export const wpSiteSourceSchema=z.object({source:z.enum(['native','companion']).default('companion')});
const nativeSettings=z.object({title:z.string(),description:z.string(),show_on_front:z.enum(['page','posts']),page_on_front:z.number().int().nonnegative(),page_for_posts:z.number().int().nonnegative()});
export async function readNativeWordpressSite(signal:AbortSignal){
 const c=await wordpressConnection(),settings=nativeSettings.parse(await c.api('/wp/v2/settings',signal));
 let canConfigure:boolean|null=null;
 try{const account=z.object({capabilities:z.record(z.string(),z.boolean()).optional()}).parse(await c.api('/wp/v2/users/me?context=edit&_fields=capabilities',signal));canConfigure=account.capabilities?.manage_options??null;}catch(error){if(!(error instanceof WordpressError))throw error;}
 const state={siteTitle:settings.title,description:settings.description,homePage:settings.page_on_front,postsPage:settings.page_for_posts,showOnFront:settings.show_on_front};
 return {site:c.site,source:'native' as const,state,canConfigure,revision:await seoHash(JSON.stringify([c.identity,'native-settings',state])),concurrency:'客户端写前变化检测；官方接口不提供原子条件写，核对后仍存在并发窗口。'};
}
export async function readWpSite(signal:AbortSignal,source:'native'|'companion'){return source==='native'?readNativeWordpressSite(signal):readWordpressSite(signal);}
const siteSchema=z.object({version:z.string(),modelVersion:z.literal(1),revision:z.string().regex(/^[a-f0-9]{64}$/),state:z.object({siteTitle:z.string(),description:z.string(),homePage:z.number(),postsPage:z.number(),showOnFront:z.string(),theme:z.string()}),acfAvailable:z.boolean(),canConfigure:z.boolean(),models:z.record(z.string(),z.unknown())});
export async function readWordpressSite(signal:AbortSignal){const c=await wordpressConnection();return {site:c.site,...siteSchema.parse(await c.api('/octopus/v1/site',signal))};}
export const wpConfigureSiteSchema=z.object({source:z.enum(['native','companion']).default('companion'),expectedRevision:z.string().regex(/^[a-f0-9]{64}$/),siteTitle:z.string().min(1).max(200).optional(),description:z.string().max(500).optional(),homePage:z.number().int().positive().optional(),postsPage:z.number().int().positive().optional()}).strict().refine(v=>v.siteTitle!==undefined||v.description!==undefined||v.homePage!==undefined||v.postsPage!==undefined,'至少指定一个配置项。');
export async function wpConfigureSite(raw:z.input<typeof wpConfigureSiteSchema>,ctx:WpContext){
 const {source,...input}=wpConfigureSiteSchema.parse(raw),c=await wordpressConnection();
 if(source==='native'){
  const body={...(input.siteTitle!==undefined?{title:input.siteTitle}:{}),...(input.description!==undefined?{description:input.description}:{}),...(input.homePage!==undefined?{page_on_front:input.homePage,show_on_front:'page'}:{}),...(input.postsPage!==undefined?{page_for_posts:input.postsPage}:{})};
  return wordpressMutation(ctx,c.identity,{kind:'native-site-configuration',input},()=>c.api('/wp/v2/settings',ctx.signal,'POST',body),async()=>{
   const after=await readNativeWordpressSite(ctx.signal);
   const matches=Object.entries(input).every(([key,value])=>key==='expectedRevision'||after.state[key as keyof typeof after.state]===value)&&(!input.homePage||after.state.showOnFront==='page');
   return {...after,settingsMatch:matches,frontendVerified:false,evidence:await saveSeoEvidence(ctx.files,'wordpress-native-site-after',after,ctx.assertActive)};
  },async()=>{
   const before=await readNativeWordpressSite(ctx.signal);
   if(before.revision!==input.expectedRevision)throw new Error('站点配置已变化，请重新读取。');
   if(before.canConfigure===false)throw new Error('当前账号没有站点配置权限。');
   const home=input.homePage??before.state.homePage,posts=input.postsPage??before.state.postsPage;
   if(home>0&&home===posts)throw new Error('首页与文章页不能相同。');
   for(const id of new Set([input.homePage,input.postsPage].filter((value):value is number=>value!==undefined))){
    const page=z.object({id:z.number(),type:z.literal('page'),status:z.literal('publish')}).safeParse(await c.api(`/wp/v2/pages/${id}?context=edit`,ctx.signal));
    if(!page.success||page.data.id!==id)throw new Error('首页或文章页必须是已发布的真实页面。');
   }
   const schema=z.object({schema:z.object({properties:z.record(z.string(),z.object({readonly:z.boolean().optional()}))})}).parse(await c.api('/wp/v2/settings',ctx.signal,'OPTIONS'));
   for(const key of Object.keys(body))if(!schema.schema.properties[key]||schema.schema.properties[key].readonly)throw new Error('站点未开放所需设置字段。');
   await saveSeoEvidence(ctx.files,'wordpress-native-site-before',before,ctx.assertActive);
  });
 }
 return wordpressMutation(ctx,c.identity,{kind:'site-configuration',input},()=>c.api('/octopus/v1/site',ctx.signal,'POST',input),async()=>{
  const after=await readWordpressSite(ctx.signal);
  const matches=Object.entries(input).every(([key,value])=>key==='expectedRevision'||key in after.state&&after.state[key as keyof typeof after.state]===value);
  return {site:c.site,state:after.state,revision:after.revision,settingsMatch:matches,frontendVerified:false,evidence:await saveSeoEvidence(ctx.files,'wordpress-site-after',after,ctx.assertActive)};
 },async()=>{const before=await readWordpressSite(ctx.signal);if(before.revision!==input.expectedRevision)throw new Error('站点配置已变化，请重新读取。');if(!before.canConfigure)throw new Error('当前账号没有站点配置权限。');await saveSeoEvidence(ctx.files,'wordpress-site-before',before,ctx.assertActive);});
}
