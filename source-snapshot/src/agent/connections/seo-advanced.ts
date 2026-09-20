import { tool } from 'ai';
import { z } from 'zod';
import type { ToolHost } from '../tools';
import type { FileRuntime } from '../files/runtime';
import { bindDataForSeo } from './dataforseo';
import { seoAdvancedPaths } from './seo-paths';
import { runPaidSeoRequest, type SeoState } from './seo-tools';

export const publicUrl = z.string().url().max(2000).refine(value => {
  const url = new URL(value), host = url.hostname;
  return /^https?:$/.test(url.protocol) && !url.username && !url.password && !url.port && !host.includes(':') && host.includes('.') && !/^\d+(?:\.\d+){3}$/.test(host) && !/\.(?:localhost|local|internal)$/.test(host);
}, '需要公开 HTTP(S) 网站地址，不含密码或自定义端口');
export const seoDomain = z.string().trim().toLowerCase().max(253).regex(/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,63}$/).refine(value => !/\.(local|internal|localhost)$/.test(value));
const date = z.iso.date();
export const advancedSchema = z.object({
  operation: z.enum(['backlinkSummary', 'backlinks', 'referringDomains', 'anchors', 'linkGap', 'linkChanges', 'contentDiscovery', 'instantPage', 'lighthouse']),
  target: seoDomain.optional(), competitors: z.array(seoDomain).min(1).max(5).optional(), url: publicUrl.optional(), keyword: z.string().trim().min(1).max(80).optional(),
  limit: z.number().int().min(1).max(100).default(50), offset: z.number().int().min(0).max(10000).default(0),
  dateFrom: date.optional(), dateTo: date.optional(), mobile: z.boolean().default(true), javascript: z.boolean().default(false),
}).superRefine((v, ctx) => {
  const problem = (message: string) => ctx.addIssue({ code: 'custom', message });
  if (['instantPage', 'lighthouse'].includes(v.operation) ? !v.url || !!v.target || !!v.keyword : v.operation === 'contentDiscovery' ? !v.keyword || !!v.url || !!v.target : !v.target || !!v.url || !!v.keyword) problem('请按操作提供 url、keyword 或 target 中的一项');
  if (v.operation === 'linkGap' ? !v.competitors || v.competitors.includes(v.target!) : !!v.competitors) problem('linkGap 必须提供与 target 不同的 competitors；其他操作不填');
  if (v.operation === 'linkChanges') { if (!v.dateFrom || !v.dateTo || v.dateFrom > v.dateTo || v.dateTo > new Date().toISOString().slice(0,10)) problem('变化查询需要有效起止日期，结束不晚于今天'); }
  else if (v.dateFrom || v.dateTo) problem('日期仅用于 linkChanges');
  if (v.offset && !['backlinks', 'referringDomains', 'anchors', 'linkGap'].includes(v.operation)) problem('此操作不支持 offset');
  if (v.javascript && v.operation !== 'instantPage') problem('javascript 仅用于 instantPage');
});
export function advancedRequest(raw: z.input<typeof advancedSchema>) {
  const v = advancedSchema.parse(raw); let body: object;
  switch (v.operation) {
    case 'linkGap': body = { targets: Object.fromEntries([...new Set(v.competitors)].sort().map((target,i) => [String(i+1), target])), exclude_targets: [v.target], include_subdomains: true, exclude_internal_backlinks: true, limit: v.limit, offset: v.offset }; break;
    case 'linkChanges': body = { target:v.target, date_from:v.dateFrom, date_to:v.dateTo, group_range:'day' }; break;
    case 'contentDiscovery': body = { keyword:v.keyword, search_mode:'one_per_domain', limit:v.limit }; break;
    case 'instantPage': body = { url:v.url, enable_javascript:v.javascript, load_resources:v.javascript, store_raw_html:true }; break;
    case 'lighthouse': body = { url:v.url, for_mobile:v.mobile, categories:['performance','seo','accessibility','best_practices'] }; break;
    case 'backlinkSummary': body = { target:v.target, include_subdomains:true }; break;
    default: body = { target:v.target, include_subdomains:true, limit:v.limit, offset:v.offset, ...(v.operation === 'backlinks' ? { mode:'as_is' } : {}) };
  }
  return { path:seoAdvancedPaths[v.operation], body };
}
export const crawlStartSchema = z.object({ target:seoDomain, maxPages:z.number().int().min(1).max(1000).default(100), javascript:z.boolean().default(false) });
export const crawlReadSchema = z.object({
  taskId:z.string().regex(/^[a-zA-Z0-9-]{1,80}$/), operation:z.enum(['summary','pages','links','duplicate_tags','duplicate_content','redirect_chains','non_indexable','raw_html','microdata']),
  limit:z.number().int().min(1).max(100).default(100), offset:z.number().int().min(0).max(100000).default(0), url:publicUrl.optional(), duplicateType:z.enum(['duplicate_title','duplicate_description']).optional(),
}).superRefine((v,ctx) => {
  if (['duplicate_content','raw_html','microdata'].includes(v.operation) && !v.url) ctx.addIssue({code:'custom', message:'该报告需要抓取结果中实际存在的 url'});
  if (v.operation === 'duplicate_tags' && !v.duplicateType) ctx.addIssue({code:'custom', message:'重复标签需要 duplicateType'});
});
export async function saveSeoEvidence(files: FileRuntime, name:string, evidence:unknown, assertActive:()=>void) {
  assertActive(); const path=`seo/${name}/${crypto.randomUUID()}.json`;
  const file=await files.store.change(files.task,path,0,()=>JSON.stringify(evidence,null,2),assertActive);
  return {path:file.path,version:file.version,bytes:file.bytes, note:'用 readFile 回读实际数据与覆盖范围后再分析。'};
}
export async function readCrawl(raw:z.input<typeof crawlReadSchema>, files:FileRuntime, signal:AbortSignal, assertActive:()=>void) {
  const v=crawlReadSchema.parse(raw), connection=await bindDataForSeo();
  const path=v.operation==='summary'?`/on_page/summary/${v.taskId}`:`/on_page/${v.operation}`;
  const body=v.operation==='summary'?undefined:{id:v.taskId,...(['raw_html','microdata'].includes(v.operation)?{}:{limit:v.limit,offset:v.offset}),...(v.url?{url:v.url}:{}),...(v.duplicateType?{type:v.duplicateType}:{})};
  const response=await connection.request(path,signal,body);
  const rows=z.array(z.object({crawl_progress:z.string().optional(),total_items_count:z.number().optional(),items:z.array(z.unknown()).nullable().optional()}).passthrough()).safeParse(response.result);
  const first=rows.success?rows.data[0]:undefined, count=first?.items?.length??0;
  return {...await saveSeoEvidence(files,'crawl', {provider:'DataForSEO',endpoint:path,request:body,retrievedAt:new Date().toISOString(),...response,coverage:'单次读取；crawl_progress 非 finished 时结果仍会变化。'},assertActive), taskId:v.taskId,statusCode:response.statusCode,progress:first?.crawl_progress??'unknown',count,total:first?.total_items_count??null,
    nextOffset:count===v.limit && (!first?.total_items_count || v.offset+count<first.total_items_count)?v.offset+count:null};
}
export function advancedSeoTools(host:ToolHost, files:FileRuntime, state:SeoState, persist:()=>Promise<void>) {
  return {
    dataForSeoResearch:tool({description:'付费 SEO 专项数据：外链画像/列表/引用域/锚文本/竞品外链缺口/新增丢失；网络内容发现；单页云检测；Lighthouse 实验室性能。每页最多100，offset 显式分页，不自动批量；linkGap 的 target 是我方，competitors 是同行。javascript 云渲染可能加价；Lighthouse 不是 CrUX 现场数据。',inputSchema:advancedSchema,execute:input=>host.execute('dataForSeoResearch',input,()=>runPaidSeoRequest(advancedRequest(input),files,state,host.signal,persist,host.assertActive),true)}),
    startSeoAudit:tool({description:'创建 DataForSEO 付费全站 OnPage 抓取；默认100页、最多1000页。JS 默认关闭，开启会增加费用。返回 taskId 后用 readSeoAudit 读取进度和分页；不能把创建成功称为审计完成。同任务相同配置复用提交，不自动重复付费。',inputSchema:crawlStartSchema,execute:input=>host.execute('startSeoAudit',input,()=>runPaidSeoRequest({path:'/on_page/task_post',body:{target:input.target,max_crawl_pages:input.maxPages,enable_javascript:input.javascript,load_resources:input.javascript,store_raw_html:true,respect_sitemap:true,enable_browser_rendering:false}},files,state,host.signal,persist,host.assertActive),true)}),
    readSeoAudit:tool({description:'读取已创建的 OnPage taskId：summary进度；pages页面；links链接；duplicate_tags重复标题/描述；duplicate_content某页重复；redirect_chains重定向；non_indexable；raw_html；microdata。读取不创建抓取，无紧密轮询，未 finished 只报告阶段进度。分页用实际 nextOffset。',inputSchema:crawlReadSchema,execute:input=>host.execute('readSeoAudit',input,()=>readCrawl(input,files,host.signal,host.assertActive))}),
    stopSeoAudit:tool({description:'停止明确 taskId 的 DataForSEO 抓取；已抓取数据可继续读取，停止不等于退款。随后 readSeoAudit 核对状态。',inputSchema:z.object({taskId:z.string().regex(/^[a-zA-Z0-9-]{1,80}$/)}),execute:input=>host.execute('stopSeoAudit',input,async()=>{const result=await(await bindDataForSeo()).request('/on_page/force_stop',host.signal,{id:input.taskId});return saveSeoEvidence(files,'crawl-stop',{...result,requestedTaskId:input.taskId},host.assertActive);},true)}),
  };
}
