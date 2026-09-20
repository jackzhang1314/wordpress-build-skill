import {mediaMime} from '../files/media-types';
import {z} from 'zod';
import {wordpressConnection,WordpressError} from './wordpress';
import {wpToolBlocksSchema,serializeWpBlocks,walkWpBlocks,type WpBlocks} from './wordpress-blocks';
import {seoHash} from './dataforseo';
import {saveSeoEvidence} from './seo-advanced';
import type {FileRuntime} from '../files/runtime';
import {fileRefSchema} from '../files/model';
import {fileBytes} from '../files/bytes';
import {delimitedRecords} from '../files/delimited';

export interface WpOperation {submittedAt:string;response?:unknown;receipt?:unknown}
export interface WordpressState {wpOperations?:Record<string,WpOperation>;wpProductPreviews?:string[];wpNavigationPreviews?:string[]}
export interface WpContext {files:FileRuntime;state:WordpressState;signal:AbortSignal;persist:()=>Promise<void>;assertActive:()=>void}
export const wpObject=z.record(z.string(),z.unknown());
const segment=z.string().regex(/^[a-z][a-z0-9_-]{0,79}$/);
const post=z.object({id:z.number().int().positive(),link:z.string(),status:z.string(),modified_gmt:z.string(),title:z.object({raw:z.string().optional()}).optional(),content:z.object({raw:z.string().optional()}).optional()}).passthrough();
const mediaSchema=z.object({id:z.number().int().positive(),source_url:z.url(),media_type:z.string(),alt_text:z.string().optional()}).passthrough();
const query=(params:Record<string,string|number|undefined>)=>{const q=new URLSearchParams();for(const[k,v]of Object.entries(params))if(v!==undefined)q.set(k,String(v));return q.toString();};
const safeError=(error:unknown)=>error instanceof WordpressError?error.message:'操作未完成；请核对站点和任务回执。';
async function evidence(ctx:WpContext,label:string,data:unknown){return saveSeoEvidence(ctx.files,label,data,ctx.assertActive);}
/** Persist the response before evidence writing. Unknown POSTs are never silently retried. */
export async function wordpressMutation(ctx:WpContext,identity:string,operation:object,send:()=>Promise<unknown>,verify:(response:unknown)=>Promise<unknown>,prepare?:()=>Promise<void>){
 const id=await seoHash(JSON.stringify([identity,operation]));const records=ctx.state.wpOperations??={};let action=records[id];
 if(action?.receipt)return {actionId:id,cached:true,receipt:action.receipt};
 if(action&&!Object.hasOwn(action,'response'))throw new Error(`WordPress 操作结果未知，不会重复提交。请核对后台，操作号 ${id}`);
 if(!action){await prepare?.();ctx.assertActive();ctx.signal.throwIfAborted();action={submittedAt:new Date().toISOString()};records[id]=action;await ctx.persist();ctx.assertActive();ctx.signal.throwIfAborted();action.response=await send();await ctx.persist();}
 const receipt=await verify(action.response);ctx.assertActive();action.receipt=receipt;await ctx.persist();return {actionId:id,receipt};
}
export async function wpContentType(type:string,signal:AbortSignal){
 segment.parse(type);const c=await wordpressConnection();const raw=wpObject.parse(await c.api('/wp/v2/types?context=edit',signal));
 const item=z.object({rest_base:segment,rest_namespace:z.literal('wp/v2').optional()}).parse(raw[type]);
 if(['users','settings','plugins','themes','media','blocks','templates','template-parts','navigation'].includes(item.rest_base))throw new Error('请选择文章、页面或产品内容类型。');
 return {connection:c,base:`/wp/v2/${item.rest_base}`};
}
export async function discoverWordpress(signal:AbortSignal){
 const c=await wordpressConnection();const types=wpObject.parse(await c.api('/wp/v2/types?context=edit',signal));
 let abilities:unknown=[],abilityStatus='available';try{abilities=await c.api('/wp-abilities/v1/abilities?per_page=100&page=1',signal);}catch(error){if(!(error instanceof WordpressError))throw error;abilityStatus=`HTTP ${error.status}：能力未开放或无权限`;}
 return {site:c.site,checkedAt:new Date().toISOString(),types:Object.entries(types).map(([name,value])=>{const v=wpObject.parse(value);return {name,label:v.name,restBase:v.rest_base,restNamespace:v.rest_namespace};}),abilities,abilityStatus,abilityCoverage:'仅第一页，最多100项；用wpRead的abilities模式继续分页',note:'接口存在不证明可写；各操作仍由站点校验权限。'};
}
export const wpReadSchema=z.object({operation:z.enum(['site','content','list','schema','media','terms','abilities','ability','navigation','templates','templateParts']),type:segment.default('page'),status:z.enum(['any','publish','draft','pending','private','future']).default('any'),id:z.number().int().positive().optional(),search:z.string().max(200).optional(),page:z.number().int().min(1).max(1000).default(1),limit:z.number().int().min(1).max(100).default(20),taxonomy:z.enum(['categories','tags','oct_product_category','oct_case_industry']).default('categories'),ability:z.string().max(120).optional()});
export async function wpRead(raw:z.input<typeof wpReadSchema>,ctx:WpContext){
 const v=wpReadSchema.parse(raw),c=await wordpressConnection();let result:unknown;
 switch(v.operation){
 case 'site':result=await discoverWordpress(ctx.signal);break;
 case 'navigation':result=await c.api(`/wp/v2/navigation?${query({context:'edit',page:v.page,per_page:v.limit,search:v.search})}`,ctx.signal);break;
 case 'templates':case 'templateParts':{
  // Core template collections do not support server-side page/per_page.
  const base=v.operation==='templateParts'?'template-parts':'templates';
  const items=z.array(z.object({id:z.string()}).passthrough()).parse(await c.api(`/wp/v2/${base}?context=edit`,ctx.signal)).sort((a,b)=>a.id.localeCompare(b.id));
  const filtered=v.search?items.filter(item=>item.id.toLowerCase().includes(v.search!.toLowerCase())):items;
  const start=(v.page-1)*v.limit,selected=filtered.slice(start,start+v.limit);
  return {evidence:await evidence(ctx,'wordpress-read',{site:c.site,operation:v,result:selected}),result:undefined,summary:{count:selected.length,page:v.page,nextPage:start+selected.length<filtered.length?v.page+1:null,total:filtered.length,coverage:'接口返回集合后的本地ID排序分页；search仅筛选ID，每次重读可能变化。'}};
 }
 case 'abilities':result=await c.api(`/wp-abilities/v1/abilities?${query({page:v.page,per_page:v.limit})}`,ctx.signal);break;
 case 'ability':{const name=allowedAbility(v.ability??'');result=await c.api(`/wp-abilities/v1/abilities/${name}`,ctx.signal);break;}
 case 'media':result=await c.api(`/wp/v2/media${v.id?'/'+v.id:''}?${query({context:'edit',page:v.page,per_page:v.limit,search:v.search})}`,ctx.signal);break;
 case 'terms':result=await c.api(`/wp/v2/${v.taxonomy}?${query({page:v.page,per_page:v.limit,search:v.search})}`,ctx.signal);break;
 default:{const {base}=await wpContentType(v.type,ctx.signal);if(v.operation==='content'&&!v.id)throw new Error('读取内容需要实际ID。');result=await c.api(`${base}${v.operation==='content'?'/'+v.id:''}${v.operation==='schema'?'':'?'+query({context:'edit',page:v.page,per_page:v.limit,search:v.search,status:v.operation==='list'?v.status:undefined})}`,ctx.signal,v.operation==='schema'?'OPTIONS':'GET');}
 }
 const saved=await evidence(ctx,'wordpress-read',{site:c.site,operation:v,result});
 if(v.operation==='content'){
  const content=post.parse(result),raw=content.content?.raw;
  return {evidence:saved,content:{id:content.id,url:content.link,status:content.status,modifiedGmt:content.modified_gmt,title:content.title?.raw,raw:raw?.slice(0,6000),rawComplete:raw!==undefined&&raw.length<=6000,totalCharacters:raw?.length,offsetUnit:'utf-16'},note:'本次API实际读取；rawComplete=true时正文已完整返回，无需再翻读同份证据。false时按固定证据版本读取完整正文。其他字段仍在证据文件；写前检查最新版本，前端另行验证。'};
 }
 return {evidence:saved,result:v.operation==='site'?result:undefined,summary:Array.isArray(result)?{count:result.length,page:v.page,nextPage:result.length===v.limit?v.page+1:null,coverage:'当前页；不表示全部数据'}:undefined};
}
export const wpWriteContentSchema=z.object({type:z.enum(['post','page','oct_product','oct_case']).default('page'),id:z.number().int().positive().optional(),expectedModified:z.string().optional(),title:z.string().min(1).max(200),template:z.string().max(200).optional(),meta:z.record(z.string().regex(/^oct_[a-z_]+$/),z.string().max(2000)).optional(),productCategories:z.array(z.number().int().positive()).max(30).optional(),caseIndustries:z.array(z.number().int().positive()).max(30).optional(),blocks:wpToolBlocksSchema.optional(),content:z.string().max(120000).optional(),status:z.enum(['draft','publish']).default('draft'),slug:z.string().regex(/^[a-z0-9][a-z0-9-]{0,159}$/).optional(),excerpt:z.string().max(2000).optional(),featuredMedia:z.number().int().positive().optional(),categories:z.array(z.number().int().positive()).max(20).optional(),tags:z.array(z.number().int().positive()).max(30).optional(),parent:z.number().int().nonnegative().optional()}).superRefine((v,ctx)=>{
 if(v.id&&!v.expectedModified)ctx.addIssue({code:'custom',message:'更新需要最新 expectedModified。'});
 if((!!v.blocks)===(v.content!==undefined))ctx.addIssue({code:'custom',message:'blocks与content须且只能提供一个。'});
 if(v.type==='page'&&!v.blocks)ctx.addIssue({code:'custom',message:'页面必须使用原生blocks。'});
 if(v.meta&&!['oct_product','oct_case'].includes(v.type))ctx.addIssue({code:'custom',message:'业务字段仅用于配套插件的产品/案例类型。'});
 if(v.productCategories&&v.type!=='oct_product'||v.caseIndustries&&v.type!=='oct_case')ctx.addIssue({code:'custom',message:'分类与内容类型不匹配。'});
 if(v.type!=='post'&&(v.categories||v.tags))ctx.addIssue({code:'custom',message:'原生页面没有文章分类标签。'});
});
export async function resolveBlocks(blocks:WpBlocks,signal:AbortSignal){
 const c=await wordpressConnection(),media=new Map<number,string>();
 for(const node of walkWpBlocks(blocks)){
  if(node.type==='image'&&!media.has(node.mediaId)){const m=mediaSchema.parse(await c.api(`/wp/v2/media/${node.mediaId}`,signal));if(m.media_type!=='image')throw new Error('正文图片区块需要图片媒体。');media.set(m.id,m.source_url);}
  if(node.type==='catalog')await wpContentType(node.postType,signal);
  if(node.type==='form')await runAbilityRead('wpforms/get-form',{form_id:node.formId,include_fields:true},signal);
 }
 return serializeWpBlocks(blocks,media);
}
export async function wpWriteContent(raw:z.input<typeof wpWriteContentSchema>,ctx:WpContext){
 const v=wpWriteContentSchema.parse(raw),{connection:c,base}=await wpContentType(v.type,ctx.signal);
 if(v.template!==undefined){const schema=wpObject.parse(await c.api(base,ctx.signal,'OPTIONS'));const properties=wpObject.parse(wpObject.parse(schema.schema).properties);const template=wpObject.parse(properties.template);const choices=z.array(z.string()).parse(template.enum);if(!choices.includes(v.template))throw new Error('页面模板未在站点schema中开放，请重新读取设计信息。');}
 if(v.meta){const schema=wpObject.parse(await c.api(base,ctx.signal,'OPTIONS'));const properties=wpObject.parse(wpObject.parse(schema.schema).properties);const fields=wpObject.parse(wpObject.parse(properties.meta).properties);for(const [key,value]of Object.entries(v.meta)){if(!fields[key])throw new Error('业务字段未在站点schema登记。');validateWpSchema(wpObject.parse(fields[key]),value);}}
 const content=v.blocks?await resolveBlocks(v.blocks,ctx.signal):v.content!;
 const body={title:v.title,content,status:v.status,...(v.meta?{meta:v.meta}:{}),...(v.productCategories?{oct_product_category:v.productCategories}:{}),...(v.caseIndustries?{oct_case_industry:v.caseIndustries}:{}),...(v.template!==undefined?{template:v.template}:{}),...(v.slug?{slug:v.slug}:{}),...(v.excerpt!==undefined?{excerpt:v.excerpt}:{}),...(v.featuredMedia?{featured_media:v.featuredMedia}:{}),...(v.categories?{categories:v.categories}:{}),...(v.tags?{tags:v.tags}:{}),...(v.parent!==undefined?{parent:v.parent}:{})};
 if(v.featuredMedia){const m=mediaSchema.parse(await c.api(`/wp/v2/media/${v.featuredMedia}`,ctx.signal));if(m.media_type!=='image')throw new Error('特色图需要图片媒体。');}
 const operation={kind:'content',type:v.type,id:v.id,expectedModified:v.expectedModified,body};
 return wordpressMutation(ctx,c.identity,operation,async()=>{
  return c.api(`${base}${v.id?'/'+v.id:''}`,ctx.signal,'POST',body);
 },async(response)=>{const saved=post.parse(response),after=post.parse(await c.api(`${base}/${saved.id}?context=edit`,ctx.signal));return {site:c.site,id:after.id,url:after.link,status:after.status,modified:after.modified_gmt,statusMatches:after.status===v.status,contentMatches:after.content?.raw===content,titleMatches:after.title?.raw===v.title,metaMatches:!v.meta||Object.entries(v.meta).every(([key,value])=>wpObject.parse(after.meta)[key]===value),templateMatches:v.template===undefined||after.template===v.template,featuredMediaMatches:v.featuredMedia===undefined||after.featured_media===v.featuredMedia,evidence:await evidence(ctx,'wordpress-after',after),frontendVerified:false};},async()=>{
  if(v.id){const before=post.parse(await c.api(`${base}/${v.id}?context=edit`,ctx.signal));if(before.modified_gmt!==v.expectedModified)throw new Error('文章已变化，请重新读取。');await evidence(ctx,'wordpress-before',before);}
 });
}
export const wpMediaSchema=z.object({file:fileRefSchema,title:z.string().max(200),alt:z.string().max(500).default(''),caption:z.string().max(2000).default('')});
export async function wpUploadMedia(raw:z.input<typeof wpMediaSchema>,ctx:WpContext){
 const v=wpMediaSchema.parse(raw),c=await wordpressConnection(),file=await ctx.files.store.read(ctx.files.task,v.file.path,v.file.version);
 if(file.encoding!=='base64')throw new Error('请选择原始二进制素材，不能上传提取后的文本。');
 const bytes=fileBytes(file),name=file.path.split('/').at(-1)!,mime=mediaMime(bytes,name);if(bytes.length>10*1024*1024)throw new Error('本次媒体上传上限10MB。');
 const hash=await seoHash(file.content);const body=new FormData();body.set('file',new Blob([bytes],{type:mime}),name);body.set('title',v.title);body.set('alt_text',v.alt);body.set('caption',v.caption);
 return wordpressMutation(ctx,c.identity,{kind:'media',hash,title:v.title,alt:v.alt,caption:v.caption},()=>c.api('/wp/v2/media',ctx.signal,'POST',body),async(response)=>{
  const m=mediaSchema.parse(response),saved=mediaSchema.parse(await c.api(`/wp/v2/media/${m.id}?context=edit`,ctx.signal));return {id:saved.id,url:saved.source_url,mime,altMatches:mime==='application/pdf'||saved.alt_text===v.alt,evidence:await evidence(ctx,'wordpress-media',saved)};
 });
}
const readAbilities=['wpforms/list-forms','wpforms/get-form','wpforms/describe-editing-schema','rank-math/get-settings','rank-math/get-system-status','rank-math/get-robots-txt','rank-math/get-llms-txt'] as const;
const writeAbilities=['wpforms/create-form','wpforms/add-field','wpforms/update-field','wpforms/update-form-settings','rank-math/set-website-identity','rank-math/set-global-seo-settings','rank-math/set-homepage-seo','rank-math/set-link-settings','rank-math/set-sitemap-settings','rank-math/set-post-type-seo-settings','rank-math/set-breadcrumb-settings'] as const;
const names=[...readAbilities,...writeAbilities];
function allowedAbility(name:string){if(!names.includes(name as typeof names[number]))throw new Error('此插件能力尚未适配。请查看站点公开能力，不使用任意端点。');return name;}
function inputQuery(input:Record<string,unknown>){const params=new URLSearchParams();function add(k:string,v:unknown){if(v!==null&&typeof v==='object'){for(const [key,value]of Object.entries(v))add(`${k}[${key}]`,value);}else params.append(k,typeof v==='boolean'?String(v):String(v??''));}if(!Object.keys(input).length)params.set('input[]','');else for(const [k,v]of Object.entries(input))add(`input[${k}]`,v);return params.toString();}
async function abilityDefinition(name:string,signal:AbortSignal){const c=await wordpressConnection();return z.object({name:z.literal(name),input_schema:wpObject,meta:wpObject.optional()}).passthrough().parse(await c.api(`/wp-abilities/v1/abilities/${allowedAbility(name)}`,signal));}
export function validateWpSchema(schema:Record<string,unknown>,value:unknown){
 // The official converter validates the supported declaration; the server remains authoritative.
 try{return z.fromJSONSchema(schema).parse(value);}catch{throw new Error('输入不符合站点字段/schema，或包含当前不支持的约束。请先读取schema并修正。');}
}
async function runAbilityRead(name:string,input:Record<string,unknown>,signal:AbortSignal){
 if(!(readAbilities as readonly string[]).includes(name))throw new Error('请使用写能力工具。');const definition=await abilityDefinition(name,signal);validateWpSchema(definition.input_schema,input);const c=await wordpressConnection();return c.api(`/wp-abilities/v1/abilities/${name}/run?${inputQuery(input)}`,signal);
}
export const wpAbilityReadSchema=z.object({name:z.enum(readAbilities),input:wpObject.default({})});
export const wpAbilityWriteSchema=z.object({name:z.enum(writeAbilities),input:wpObject,readback:z.object({name:z.enum(readAbilities),input:wpObject}).optional()});
export async function wpReadAbility(raw:z.input<typeof wpAbilityReadSchema>,ctx:WpContext){const v=wpAbilityReadSchema.parse(raw),result=await runAbilityRead(v.name,v.input,ctx.signal);return {evidence:await evidence(ctx,'wordpress-ability-read',{name:v.name,result})};}
export async function wpWriteAbility(raw:z.input<typeof wpAbilityWriteSchema>,ctx:WpContext){
 const v=wpAbilityWriteSchema.parse(raw),c=await wordpressConnection(),definition=await abilityDefinition(v.name,ctx.signal);validateWpSchema(definition.input_schema,v.input);
 return wordpressMutation(ctx,c.identity,{kind:'ability',name:v.name,input:v.input},()=>c.api(`/wp-abilities/v1/abilities/${v.name}/run`,ctx.signal,'POST',{input:v.input}),async(response)=>{
  let follow=v.readback;
  if(v.name==='wpforms/create-form'){const parsed=wpObject.parse(response);const id=parsed.form_id??parsed.id;if(typeof id!=='number'||!Number.isInteger(id)||id<1)throw new Error('创建响应缺少实际表单ID，请核对回执，不重复创建。');follow={name:'wpforms/get-form',input:{form_id:id,include_fields:true}};}
  if(v.name.startsWith('wpforms/')&&typeof v.input.form_id==='number')follow={name:'wpforms/get-form',input:{form_id:v.input.form_id,include_fields:true}};
  if(v.name.startsWith('rank-math/'))follow={name:'rank-math/get-settings',input:{}};
  const after=follow?await runAbilityRead(follow.name,follow.input,ctx.signal):undefined;
  return {response,readbackPerformed:!!follow,evidence:await evidence(ctx,'wordpress-ability-write',{name:v.name,input:v.input,response,after}),note:'回读结果需核对，未自动证明每个字段或前台输出完全一致。'};
 });
}

export const wpImportSchema=z.object({source:fileRefSchema,type:segment,delimiter:z.enum([',',';','\t']).default(','),keyColumn:z.number().int().nonnegative(),titleColumn:z.number().int().nonnegative(),fields:z.array(z.object({column:z.number().int().nonnegative(),field:segment,format:z.enum(['text','number','boolean','json']).default('text')})).min(1).max(40),featuredMediaColumn:z.number().int().nonnegative().optional(),offset:z.number().int().min(0).max(2000).default(0),limit:z.number().int().min(1).max(20).default(5)});
export async function wpImportProducts(raw:z.input<typeof wpImportSchema>,ctx:WpContext,execute:boolean){
 const v=wpImportSchema.parse(raw),{connection:c,base}=await wpContentType(v.type,ctx.signal);
 if(['post','page','attachment'].includes(v.type))throw new Error('请选择已有ACF产品内容类型。');
 const options=wpObject.parse(await c.api(base,ctx.signal,'OPTIONS'));
 const responseSchema=wpObject.parse(options.schema),properties=wpObject.parse(responseSchema.properties),acfSchema=wpObject.parse(properties.acf);
 const file=await ctx.files.store.read(ctx.files.task,v.source.path,v.source.version);if(file.encoding==='base64')throw new Error('请先将Excel用已有导入解析为CSV，使用固定版本CSV。');
 if(!/\.(csv|tsv)$/i.test(file.path))throw new Error('需要CSV/TSV来源。');
 const records=[...delimitedRecords(file.content,v.delimiter)];if(records.length<2||records.length>2001)throw new Error('需要表头和1至2000条数据。');
 const header=records[0]!,rows=records.slice(1),keys=new Set<string>();
 if(new Set(v.fields.map(f=>f.field)).size!==v.fields.length)throw new Error('同一ACF字段不可映射多列。');
 const acfFields=wpObject.parse(acfSchema.properties);
 if(v.fields.some(f=>!Object.hasOwn(acfFields,f.field)))throw new Error('映射包含站点未公开的ACF字段。');
 const plans=[];
 for(const row of rows){
  if(row.values.length!==header.values.length)throw new Error(`第${row.record}条列数不一致。`);
  const key=row.values[v.keyColumn]?.trim(),title=row.values[v.titleColumn]?.trim();if(!key||!title||keys.has(key))throw new Error(`第${row.record}条唯一键/标题为空或重复。`);keys.add(key);
  const acf:Record<string,unknown>={};
  for(const f of v.fields){const value=row.values[f.column];if(value===undefined)throw new Error('映射列越界。');if(f.format==='text')acf[f.field]=value;else if(f.format==='number'){if(!value.trim()||!Number.isFinite(Number(value)))throw new Error(`第${row.record}条数字无效。`);acf[f.field]=Number(value);}else if(f.format==='boolean'){if(!['true','false','1','0'].includes(value))throw new Error(`第${row.record}条布尔值无效。`);acf[f.field]=value==='true'||value==='1';}else{try{acf[f.field]=JSON.parse(value) as unknown;}catch{throw new Error(`第${row.record}条JSON无效。`);}}}
  validateWpSchema(acfSchema,acf);
  const media=v.featuredMediaColumn===undefined?undefined:Number(row.values[v.featuredMediaColumn]);if(media!==undefined&&(!Number.isInteger(media)||media<1))throw new Error(`第${row.record}条特色图需要已上传媒体ID。`);
  const slug=`product-${(await seoHash(JSON.stringify([v.type,key]))).slice(0,24)}`;
  plans.push({record:row.record,key,slug,body:{title,status:'draft',slug,acf,...(media?{featured_media:media}:{})}});
 }
 if(v.offset>=plans.length)throw new Error('offset超出记录范围。');
 const batch=plans.slice(v.offset,v.offset+v.limit);const preview=await evidence(ctx,'wordpress-product-plan',{source:v.source,site:c.site,type:v.type,mapping:v,validatedRows:plans.length,rows:batch});
 const planId=await seoHash(JSON.stringify([c.identity,v,acfSchema,batch]));
 if(!execute){ctx.state.wpProductPreviews=[...new Set([...(ctx.state.wpProductPreviews??[]),planId])].slice(-100);await ctx.persist();return {preview,planId,rows:batch.length,totalRows:plans.length,nextOffset:v.offset+batch.length<plans.length?v.offset+batch.length:null};}
 if(!ctx.state.wpProductPreviews?.includes(planId))throw new Error('请先使用相同来源版本、映射和批次预览产品。');
 const results:unknown[]=[];
 for(const item of batch){ctx.assertActive();ctx.signal.throwIfAborted();try{
  const saved=await wordpressMutation(ctx,c.identity,{kind:'acf-import',type:v.type,body:item.body},async()=>{
   return c.api(base,ctx.signal,'POST',item.body);
  },async(response)=>{const p=post.parse(response),after=post.parse(await c.api(`${base}/${p.id}?context=edit`,ctx.signal));return {id:after.id,url:after.link,status:after.status,acf:after.acf,evidence:await evidence(ctx,'wordpress-product',after),frontendVerified:false,acfMatches:JSON.stringify(after.acf)===JSON.stringify(item.body.acf)};},async()=>{
   const existing=z.array(post).parse(await c.api(`${base}?${query({context:'edit',slug:item.slug,status:'any'})}`,ctx.signal));if(existing.length)throw new Error('该唯一键已有内容，请读取后使用明确更新流程。');
   if(item.body.featured_media){const media=mediaSchema.parse(await c.api(`/wp/v2/media/${item.body.featured_media}`,ctx.signal));if(media.media_type!=='image')throw new Error('特色图需要图片媒体。');}
  });results.push({record:item.record,key:item.key,...saved});
 }catch(error){results.push({record:item.record,key:item.key,error:safeError(error),needsReview:true});break;}}
 const processed=results.length,hasFailure=results.some(r=>wpObject.parse(r).needsReview===true);
 return {report:await evidence(ctx,'wordpress-product-results',{source:v.source,site:c.site,results}),processed,totalRows:plans.length,stopped:hasFailure,nextOffset:hasFailure?v.offset+processed-1:v.offset+processed<plans.length?v.offset+processed:null};
}
