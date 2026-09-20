import {tool} from 'ai';
import {z} from 'zod';
import type {ToolHost} from '../tools';
import {FileStore} from '../files/store';
import {FileRuntime} from '../files/runtime';
import {bindDataForSeo,seoHash} from './dataforseo';
import {runPaidSeoRequest,seoQuerySchema,seoRequest,type SeoState} from './seo-tools';
const prefix='seo-monitor:';
export const monitorInputSchema=z.object({name:z.string().trim().min(1).max(80),query:seoQuerySchema,intervalMinutes:z.number().int().min(60).max(43200).default(1440),maxRuns:z.number().int().min(1).max(30).default(7)});
interface Monitor {id:string;task:string;name:string;identity:string;query:z.infer<typeof seoQuerySchema>;intervalMinutes:number;maxRuns:number;runs:number;status:'active'|'paused'|'complete'|'unknown';nextAt:number;inFlight?:SeoState;receipts:unknown[];error?:string}
let serial:Promise<unknown>=Promise.resolve();
function locked<T>(action:()=>Promise<T>):Promise<T>{const next=serial.then(action,action);serial=next.catch(()=>{});return next;}
async function read(id:string):Promise<Monitor|undefined>{const value=(await chrome.storage.local.get(prefix+id))[prefix+id];if(!value||typeof value!=='object'||!('id' in value)||value.id!==id)return undefined;return value as Monitor;}
async function stopped(id:string){return (await chrome.storage.local.get('seo-monitor-stop:'+id))['seo-monitor-stop:'+id]===true;}
async function save(value:Monitor){await chrome.storage.local.set({[prefix+value.id]:value});}
export async function listSeoMonitors(task?:string){const values=await chrome.storage.local.get(null);return Object.entries(values).filter(([key])=>key.startsWith(prefix)).map(([,value])=>value as Monitor).filter(v=>!task||v.task===task).map(value=>({id:value.id,task:value.task,name:value.name,query:value.query,intervalMinutes:value.intervalMinutes,maxRuns:value.maxRuns,runs:value.runs,status:value.status,nextAt:value.nextAt,receipts:value.receipts,error:value.error}));}
export async function createSeoMonitor(raw:z.input<typeof monitorInputSchema>,task:string){return locked(async()=>{
 const input=monitorInputSchema.parse(raw),c=await bindDataForSeo();
 const id=await seoHash(JSON.stringify([task,c.identity,input]));const previous=await read(id);if(previous)return {id,status:previous.status,note:'已存在，不新增计划或恢复暂停任务。'};
 if((await listSeoMonitors()).filter(m=>m.status==='active').length>=10)throw new Error('最多启用10个监测计划。');
 const markets=await c.request('/dataforseo_labs/locations_and_languages',new AbortController().signal);
 const supported=z.array(z.object({location_code:z.number(),available_languages:z.array(z.object({language_code:z.string(),available_sources:z.array(z.string())}))})).parse(markets.result);
 if(!supported.some(m=>m.location_code===input.query.locationCode&&m.available_languages.some(l=>l.language_code===input.query.languageCode&&l.available_sources.includes('google'))))throw new Error('不支持此国家和语言组合。');
 const value:Monitor={...input,id,task,identity:c.identity,runs:0,status:'active',nextAt:Date.now()+input.intervalMinutes*60000,receipts:[]};await save(value);await chrome.alarms.create(prefix+id,{when:value.nextAt});return {id,status:value.status,nextAt:value.nextAt,maxRuns:value.maxRuns,note:'每轮执行一次指定的付费查询；最多所选次数。浏览器关闭时不运行，失败暂停，不补跑错过的次数。'};
});}
export async function pauseSeoMonitor(id:string,task?:string){return locked(async()=>{const v=await read(id);if(!v||task&&v.task!==task)throw new Error('没有该监测计划。');await chrome.storage.local.set({['seo-monitor-stop:'+id]:true});v.status='paused';await save(v);await chrome.alarms.clear(prefix+id);return {id,status:v.status};});}
export async function tickSeoMonitor(id:string){return locked(async()=>{
 const v=await read(id);if(!v||v.status!=='active'||v.nextAt>Date.now()+1000)return;
 if(await stopped(id)){v.status='paused';await save(v);return;}
 if(v.inFlight){v.status='unknown';v.error='上次运行中断，可能已计费。请核对服务与已有文件，计划已暂停。';await save(v);return;}
 const store=new FileStore();
 try{
  const c=await bindDataForSeo();if(c.identity!==v.identity)throw new Error('DataForSEO 账户已变更或删除，请重新创建监测。');
  v.inFlight={};await save(v);
  if(await stopped(id)){v.status='paused';delete v.inFlight;await save(v);return;}
  const request=seoRequest(v.query);request.body={...request.body,tag:`monitor-${id.slice(0,16)}-${v.runs+1}`};
  const receipt=await runPaidSeoRequest(request,new FileRuntime(store,v.task),v.inFlight,new AbortController().signal,async()=>{const halt=await stopped(id);if(halt)v.status='paused';await save(v);if(halt&&!Object.values(v.inFlight?.seoQueries??{}).some(entry=>entry.receipt||entry.pendingReceipt))throw new Error('监测已暂停，未提交新的查询。');},()=>{});
  v.receipts.push({run:v.runs+1,...receipt});v.runs++;delete v.inFlight;v.error=undefined;v.status=await stopped(id)?'paused':v.runs>=v.maxRuns?'complete':'active';v.nextAt=Date.now()+v.intervalMinutes*60000;await save(v);
  if(v.status==='active')await chrome.alarms.create(prefix+id,{when:v.nextAt});
 }catch(error){v.status=await stopped(id)?'paused':v.inFlight?'unknown':'paused';v.error=error instanceof Error?error.message:'监测失败';await save(v);}finally{await store.close();}
});}
export async function restoreSeoMonitors(){return locked(async()=>{for(const item of await listSeoMonitors()){
 const v=await read(item.id);if(!v||v.status!=='active')continue;
 if(await stopped(v.id)){v.status='paused';await save(v);continue;}
 if(v.inFlight){v.status='unknown';v.error='浏览器执行已中断，结果需核对；不会重复付费。';await save(v);continue;}
 await chrome.alarms.create(prefix+v.id,{when:Math.max(Date.now()+60000,v.nextAt)});
}});}
export function installSeoMonitors(){if(!chrome.alarms?.onAlarm)return;chrome.alarms.onAlarm.addListener(alarm=>{if(alarm.name.startsWith(prefix))void tickSeoMonitor(alarm.name.slice(prefix.length)).catch(()=>{});});void restoreSeoMonitors().catch(()=>{});}
export function seoMonitorTools(host:ToolHost,files:FileRuntime){return {
 createSeoMonitor:tool({description:'创建浏览器本地定时 SEO 数据快照，按指定国家/语言/范围执行一个 DataForSEO 查询，每次间隔至少60分钟，最多30次。此确认授权整个有限计划的付费查询，实际费用按账单，没有美元硬上限。关闭浏览器不运行，重启不补跑；未知结果或更换凭据自动暂停。结果保存在当前任务文件，可用 seoMonitorStatus 查询。',inputSchema:monitorInputSchema,execute:input=>host.execute('createSeoMonitor',input,()=>createSeoMonitor(input,files.task),true)}),
 seoMonitorStatus:tool({description:'列出当前任务 SEO 监测计划、运行次数、状态、错误和每次数据文件。对比快照时保持国家/语言与范围一致，分析原始数据后交付复盘。',inputSchema:z.object({}),execute:input=>host.execute('seoMonitorStatus',input,()=>listSeoMonitors(files.task))}),
 pauseSeoMonitor:tool({description:'暂停当前任务指定 SEO 监测计划，停止后续付费轮次。已提交的查询不会撤回或退款。',inputSchema:z.object({id:z.string().regex(/^[a-f0-9]{64}$/)}),execute:input=>host.execute('pauseSeoMonitor',input,()=>pauseSeoMonitor(input.id,files.task),true)}),
};}

export async function pauseTaskSeoMonitors(task:string){for(const m of await listSeoMonitors(task))await pauseSeoMonitor(m.id,task);}
