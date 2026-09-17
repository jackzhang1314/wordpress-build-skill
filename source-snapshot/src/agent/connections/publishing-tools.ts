import type {WordpressState} from './wordpress-workflows';
import {tool} from 'ai';
import {z} from 'zod';
import type {ToolHost} from '../tools';
import type {FileRuntime} from '../files/runtime';
import {googleConnection,googleScopes,cruxRequest} from './google';
import {wordpressConnection} from './wordpress';
import {publicUrl,saveSeoEvidence} from './seo-advanced';
import {seoHash} from './dataforseo';
export interface SeoAction {submittedAt:string;kind:'mail'|'wordpress';receipt?:unknown;messageId?:string;postId?:number}
export interface SeoPublishingState extends WordpressState {seoActions?:Record<string,SeoAction>}
const email=z.email().max(254).refine(v=>!/[^\x21-\x7e]/.test(v));
export const seoMailSchema=z.object({to:email,subject:z.string().trim().min(1).max(200).refine(v=>!/[\r\n]/.test(v)),body:z.string().min(1).max(12000)});
const base64=(text:string)=>btoa(Array.from(new TextEncoder().encode(text),b=>String.fromCharCode(b)).join(''));
export function encodeSeoMail(from:string,to:string,subject:string,body:string,messageId:string){
 const encodedBody=base64(body).match(/.{1,76}/g)?.join('\r\n')??'';
 return base64(`From: ${from}\r\nTo: ${to}\r\nSubject: =?UTF-8?B?${base64(subject)}?=\r\nMessage-ID: <${messageId}>\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n${encodedBody}`).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
}
const contactSchema=z.object({email,status:z.enum(['active','do-not-contact']),nextFollowUp:z.iso.datetime().optional(),note:z.string().max(2000).default(''),updatedAt:z.string()});
async function contactKey(to:string){return `seo-contact:${await seoHash(to.toLowerCase())}`;}
async function contact(to:string){const key=await contactKey(to);return contactSchema.safeParse((await chrome.storage.local.get(key))[key]);}
async function markAction(state:SeoPublishingState,id:string,action:SeoAction,persist:()=>Promise<void>){state.seoActions??={};if(state.seoActions[id])return state.seoActions[id];state.seoActions[id]=action;await persist();return action;}
export async function sendSeoMail(raw:z.input<typeof seoMailSchema>,state:SeoPublishingState,signal:AbortSignal,persist:()=>Promise<void>,assertActive:()=>void){
 const v=seoMailSchema.parse(raw),connection=await googleConnection(googleScopes.mailSend);
 const blocked=await contact(v.to);if(blocked.success&&blocked.data.status==='do-not-contact')throw new Error('此联系人已标记停止联系，未发送。');
 const profile=z.object({emailAddress:email}).parse(await connection.request('https://gmail.googleapis.com/gmail/v1/users/me/profile',signal));
 const id=await seoHash(JSON.stringify([profile.emailAddress.toLowerCase(),v.to.toLowerCase(),v.subject,v.body]));
 const previous=state.seoActions?.[id];if(previous){if(previous.receipt)return {actionId:id,cached:true,receipt:previous.receipt};throw new Error(`邮件已有提交记录，结果未知。请用 checkSeoDelivery 核对 ${id}，不要重复发送。`);}
 const messageId=`seo-${id}@${profile.emailAddress.split('@')[1]}`;
 const action=await markAction(state,id,{kind:'mail',submittedAt:new Date().toISOString(),messageId},persist);assertActive();signal.throwIfAborted();
 // Check suppression again immediately before dispatch.
 const latest=await contact(v.to);if(latest.success&&latest.data.status==='do-not-contact')throw new Error('联系人已停止联系，未发送。');
 const result=z.object({id:z.string(),threadId:z.string().optional()}).parse(await connection.request('https://gmail.googleapis.com/gmail/v1/users/me/messages/send',signal,{raw:encodeSeoMail(profile.emailAddress,v.to,v.subject,v.body,messageId)}));
 action.receipt={...result,to:v.to,sentAt:new Date().toISOString(),messageId};await persist();return {actionId:id,receipt:action.receipt};
}
const postSchema=z.object({id:z.number().int(),status:z.string(),link:z.string(),modified_gmt:z.string(),title:z.object({raw:z.string().optional(),rendered:z.string().optional()}).optional(),content:z.object({raw:z.string().optional(),rendered:z.string().optional()}).optional()}).passthrough();
export const writeSeoPostSchema=z.object({title:z.string().min(1).max(200),content:z.string().min(1).max(60000),status:z.enum(['draft','publish']).default('draft'),postId:z.number().int().positive().optional(),expectedModified:z.string().optional()}).superRefine((v,ctx)=>{if(v.postId&&!v.expectedModified)ctx.addIssue({code:'custom',message:'更新已有文章必须提供最近回读的 expectedModified'});});
export async function writeSeoPost(raw:z.input<typeof writeSeoPostSchema>,state:SeoPublishingState,files:FileRuntime,signal:AbortSignal,persist:()=>Promise<void>,assertActive:()=>void){
 const v=writeSeoPostSchema.parse(raw),connection=await wordpressConnection(),id=await seoHash(JSON.stringify([connection.identity,v]));
 const previous=state.seoActions?.[id];if(previous){if(previous.receipt)return {actionId:id,cached:true,receipt:previous.receipt};throw new Error(`文章保存结果未知，请在后台核对；不会重复创建。操作号 ${id}，已知文章ID ${previous.postId??'未知'}。`);}
 if(v.postId){const before=postSchema.parse(await connection.request(`/posts/${v.postId}?context=edit`,signal));if(before.modified_gmt!==v.expectedModified)throw new Error('文章已发生变化，请重新读取再修改。');await saveSeoEvidence(files,'wordpress-before',{site:connection.site,post:before},assertActive);}
 const action=await markAction(state,id,{kind:'wordpress',submittedAt:new Date().toISOString()},persist);assertActive();signal.throwIfAborted();
 const result=postSchema.parse(await connection.request(v.postId?`/posts/${v.postId}`:'/posts',signal,{title:v.title,content:v.content,status:v.status}));action.postId=result.id;await persist();
 const verified=postSchema.parse(await connection.request(`/posts/${result.id}?context=edit`,signal));
 if(verified.status!==v.status)throw new Error('WordPress 返回状态与请求不一致，请检查后台；不重复发布。');
 action.receipt={id:verified.id,url:verified.link,status:verified.status,modified:verified.modified_gmt,contentMatches:verified.content?.raw===v.content,titleMatches:verified.title?.raw===v.title,evidence:await saveSeoEvidence(files,'wordpress-after',{site:connection.site,post:verified},assertActive)};await persist();return {actionId:id,receipt:action.receipt};
}
const searchSchema=z.object({operation:z.enum(['sites','analytics','inspect']),siteUrl:z.string().max(2000).optional(),url:publicUrl.optional(),startDate:z.iso.date().optional(),endDate:z.iso.date().optional(),dimensions:z.array(z.enum(['date','query','page','country','device'])).max(5).default(['query']),startRow:z.number().int().min(0).max(100000).default(0),limit:z.number().int().min(1).max(1000).default(100)}).superRefine((v,ctx)=>{if(v.operation!=='sites'&&!v.siteUrl)ctx.addIssue({code:'custom',message:'请先查询 sites，再使用真实站点属性 siteUrl'});if(v.operation==='inspect'&&!v.url)ctx.addIssue({code:'custom',message:'inspect 需要 url'});if(v.operation==='analytics'&&(!v.startDate||!v.endDate||v.startDate>v.endDate))ctx.addIssue({code:'custom',message:'analytics 需要有效起止日期'});});
export function publishingTools(host:ToolHost,files:FileRuntime,state:SeoPublishingState,persist:()=>Promise<void>){return {
 readSeoCorrespondence:tool({description:'读取与指定已知联系人之间的 Gmail 往来，用于跟进前核查实际回复。最多10封，保留 Message-ID/线程/时间、完整 MIME 数据与分页令牌到文件；不把未读或无搜索结果当成未回复。',inputSchema:z.object({email,limit:z.number().int().min(1).max(10).default(5),pageToken:z.string().max(1000).optional()}),execute:input=>host.execute('readSeoCorrespondence',input,async()=>{
  const c=await googleConnection(googleScopes.mailRead),params=new URLSearchParams({q:`{from:${input.email} to:${input.email}}`,maxResults:String(input.limit)});if(input.pageToken)params.set('pageToken',input.pageToken);
  const listing=z.object({messages:z.array(z.object({id:z.string()})).optional(),nextPageToken:z.string().optional()}).parse(await c.request(`https://gmail.googleapis.com/gmail/v1/users/me/messages?${params}`,host.signal));
  const messages:unknown[]=[];for(const item of listing.messages??[])messages.push(await c.request(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${item.id}?format=full`,host.signal));
  return {...await saveSeoEvidence(files,'mail-correspondence',{email:input.email,readAt:new Date().toISOString(),messages,nextPageToken:listing.nextPageToken},host.assertActive),count:messages.length,nextPageToken:listing.nextPageToken??null};
 })}),
 listSeoFollowUps:tool({description:'列出已记录且到期的外联跟进，不自动发信。只返回 active 联系人；发送前用 readSeoCorrespondence 检查实际回复。',inputSchema:z.object({}),execute:input=>host.execute('listSeoFollowUps',input,async()=>{const values=await chrome.storage.local.get(null);return Object.entries(values).filter(([key])=>key.startsWith('seo-contact:')).flatMap(([,value])=>{const parsed=contactSchema.safeParse(value);return parsed.success&&parsed.data.status==='active'&&parsed.data.nextFollowUp&&Date.parse(parsed.data.nextFollowUp)<=Date.now()?[parsed.data]:[];});})}),
 googleSearchConsole:tool({description:'Google 真实站点数据：sites列出有权限的站点；analytics读取点击/展示/CTR/位置（日期为太平洋时间，最多1000行/批，API只保证热门行）；inspect读取已索引版本状态，不是实时可索引测试。需要 Google Search Console 授权。保存原始结果到文件。',inputSchema:searchSchema,execute:input=>host.execute('googleSearchConsole',input,async()=>{
 const c=await googleConnection(googleScopes.search);let path='https://www.googleapis.com/webmasters/v3/sites';let body:object|undefined;
 if(input.operation!=='sites'){
  const sites=z.object({siteEntry:z.array(z.object({siteUrl:z.string(),permissionLevel:z.string()})).optional()}).parse(await c.request(path,host.signal));
  if(!sites.siteEntry?.some(site=>site.siteUrl===input.siteUrl&&site.permissionLevel!=='siteUnverifiedUser'))throw new Error('当前 Google 账户无此站点权限。');
  if(input.operation==='inspect'){const target=new URL(input.url!);const property=input.siteUrl!;const domain=property.startsWith('sc-domain:')?property.slice(10):undefined;
   if(domain?target.hostname!==domain&&!target.hostname.endsWith(`.${domain}`):!input.url!.startsWith(property))throw new Error('检查 URL 不属于所选站点属性。');
   path='https://searchconsole.googleapis.com/v1/urlInspection/index:inspect';body={inspectionUrl:input.url,siteUrl:input.siteUrl};
  }else{path=`${path}/${encodeURIComponent(input.siteUrl!)}/searchAnalytics/query`;body={startDate:input.startDate,endDate:input.endDate,dimensions:[...new Set(input.dimensions)],rowLimit:input.limit,startRow:input.startRow,type:'web',dataState:'final'};}
 }
 const data=await c.request(path,host.signal,body);return saveSeoEvidence(files,'gsc',{provider:'Google Search Console',endpoint:path,request:body,retrievedAt:new Date().toISOString(),data,coverage:'Search Analytics 只保证热门行；按 startRow 显式分页，缺失行不代表零。'},host.assertActive);
 })}),
 seoFieldPerformance:tool({description:'使用 Google 连接器中的 CrUX API Key 查询真实用户移动端体验，保留采集周期。无数据不能替换为实验室分数。',inputSchema:z.object({url:publicUrl}),execute:input=>host.execute('seoFieldPerformance',input,async()=>saveSeoEvidence(files,'crux',{provider:'CrUX',url:input.url,retrievedAt:new Date().toISOString(),...await cruxRequest(input.url,host.signal)},host.assertActive))}),
 readSeoResource:tool({description:'无登录凭据读取用户指定的公开网页、robots.txt 或 sitemap XML，保存 HTTP 状态、关键响应头与原始正文。不跟随重定向，Location 是下一步待核对地址；不执行 HTML/JS，不将 HTTP 200 当成可索引保证。',inputSchema:z.object({url:publicUrl}),execute:input=>host.execute('readSeoResource',input,async()=>{const response=await fetch(input.url,{credentials:'omit',redirect:'manual',signal:AbortSignal.any([host.signal,AbortSignal.timeout(30000)])});const text=await response.text();return saveSeoEvidence(files,'http',{url:input.url,status:response.status,responseType:response.type,headers:Object.fromEntries(['content-type','location','x-robots-tag','link','last-modified'].map(k=>[k,response.headers.get(k)])),capturedAt:new Date().toISOString(),body:text.slice(0,1000000),truncated:text.length>1000000},host.assertActive);})}),
 sendSeoEmail:tool({description:'通过已授权 Gmail 发送一封可审阅的纯文本外联邮件。需要明确收件人、主题、完整正文，每次发送确认。不会向停止联系名单发信。成功保存 Gmail id；未知结果不重发，可 checkSeoDelivery 核查。',inputSchema:seoMailSchema,execute:input=>host.execute('sendSeoEmail',input,()=>sendSeoMail(input,state,host.signal,persist,host.assertActive),true)}),
 checkSeoDelivery:tool({description:'核对当前任务邮件操作 actionId 的 Gmail 发送证据；通过稳定 Message-ID 搜索，不再次发送。未找到只表示暂未找到，不代表未发出。',inputSchema:z.object({actionId:z.string().regex(/^[a-f0-9]{64}$/)}),execute:input=>host.execute('checkSeoDelivery',input,async()=>{const action=state.seoActions?.[input.actionId];if(action?.kind!=='mail'||!action.messageId)throw new Error('当前任务没有该邮件记录。');const c=await googleConnection(googleScopes.mailRead);const result=z.object({messages:z.array(z.object({id:z.string()})).optional()}).parse(await c.request(`https://gmail.googleapis.com/gmail/v1/users/me/messages?${new URLSearchParams({q:`in:sent rfc822msgid:${action.messageId}`,maxResults:'10'})}`,host.signal));if(result.messages?.length===1){action.receipt={id:result.messages[0]!.id,messageId:action.messageId,verifiedAt:new Date().toISOString()};await persist();}return {found:result.messages?.length??0,receipt:action.receipt??null,note:'未找到不代表未发送；不自动重试。'};})}),
 seoContact:tool({description:'读取或更新外联联系人状态：active 或 do-not-contact（阻止后续发信）、下一次跟进时间和备注。仅记计划，不在后台自动发邮件。',inputSchema:z.object({email,operation:z.enum(['read','update']),status:z.enum(['active','do-not-contact']).optional(),nextFollowUp:z.iso.datetime().optional(),note:z.string().max(2000).optional()}),execute:input=>host.execute('seoContact',input,async()=>{if(input.operation==='read'){const v=await contact(input.email);return v.success?v.data:null;}if(!input.status)throw new Error('更新需要明确 status');const value=contactSchema.parse({...input,updatedAt:new Date().toISOString()});await chrome.storage.local.set({[await contactKey(input.email)]:value});return value;},input.operation==='update')}),
 readSeoPost:tool({description:'读取 WordPress 文章正文、发布状态及 modified_gmt；更新前必须读取，保存原文用于回退和复查。',inputSchema:z.object({postId:z.number().int().positive()}),execute:input=>host.execute('readSeoPost',input,async()=>{const c=await wordpressConnection();const post=postSchema.parse(await c.request(`/posts/${input.postId}?context=edit`,host.signal));return {postId:post.id,status:post.status,modified:post.modified_gmt,...await saveSeoEvidence(files,'wordpress-read',{site:c.site,post},host.assertActive)};})}),
 writeSeoPost:tool({description:'将完整 HTML 内容保存到 WordPress，默认 draft；只有明确请求上线时 status=publish。每次确认显示标题、状态和完整正文。更新需 postId 与刚读取的 expectedModified；保存前留原文，保存后回读状态。结果未知不重复创建；改回 draft 可撤下已发布文章。',inputSchema:writeSeoPostSchema,execute:input=>host.execute('writeSeoPost',input,()=>writeSeoPost(input,state,files,host.signal,persist,host.assertActive),true)}),
};}
