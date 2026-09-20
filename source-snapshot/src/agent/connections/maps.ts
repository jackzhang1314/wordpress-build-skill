import { z } from 'zod';
import { bindApify } from './apify';

export const mapsInputSchema = z.object({
  searchTerms: z.array(z.string().trim().min(1).max(120)).min(1).max(5),
  location: z.string().trim().min(1).max(160),
  placesPerTerm: z.number().int().min(1).max(100),
  websiteContacts: z.boolean().default(false),
  maxChargeUsd: z.number().min(0.1).max(50).describe('用户明确指定或确认的本次 Apify 费用上限（美元）'),
});
const runSchema = z.object({ id: z.string().regex(/^[A-Za-z0-9]+$/), defaultDatasetId: z.string().regex(/^[A-Za-z0-9]+$/),
  status: z.enum(['READY','RUNNING','SUCCEEDED','FAILED','TIMING-OUT','TIMED-OUT','ABORTING','ABORTED']), usageTotalUsd: z.number().optional() });
export interface MapsJob {
  input: z.infer<typeof mapsInputSchema>; connectionIdentity: string; submittedAt: string;
  run?: z.infer<typeof runSchema>;
}
export interface MapsState { mapsJob?: MapsJob }
export const terminalRun = (status: string) => ['SUCCEEDED','FAILED','TIMED-OUT','ABORTED'].includes(status);
export function publicJob(job: MapsJob) {
  return { input: job.input, submittedAt: job.submittedAt, run: job.run,
    consoleUrl: job.run ? `https://console.apify.com/actors/runs/${job.run.id}` : 'https://console.apify.com/actors/runs',
    note: job.run ? '任务编号已保存。继续查询本任务，不要重复启动。停止本地对话不会自动停止云端采集，可在 Apify 控制台停止。' : '提交状态未知。先在 Apify 控制台核对；本对话不会自动重复启动。' };
}
export async function startMaps(state: MapsState, raw: z.input<typeof mapsInputSchema>, signal: AbortSignal, persist: () => Promise<void>) {
  const input = mapsInputSchema.parse(raw);
  if (state.mapsJob) {
    if (JSON.stringify(state.mapsJob.input) !== JSON.stringify(input)) throw new Error('本对话已有地图采集任务，请先处理已有结果；不同范围请新建对话。');
    return publicJob(state.mapsJob);
  }
  const api = await bindApify(); signal.throwIfAborted();
  if (state.mapsJob) return publicJob(state.mapsJob);
  // Persist before POST. An uncertain network outcome must never trigger an automatic retry.
  const job: MapsJob = { input, connectionIdentity: api.identity, submittedAt: new Date().toISOString() };
  state.mapsJob = job; await persist(); signal.throwIfAborted();
  const response = await api.request(`/actors/compass~crawler-google-places/runs?maxTotalChargeUsd=${input.maxChargeUsd}&restartOnError=false&timeout=3600`, signal, {
    searchStringsArray: input.searchTerms, locationQuery: input.location, maxCrawledPlacesPerSearch: input.placesPerTerm,
    language: 'en', scrapePlaceDetailPage: true, skipClosedPlaces: true, scrapeContacts: input.websiteContacts,
    maximumLeadsEnrichmentRecords: 0, maxReviews: 0,
    scrapeSocialMediaProfiles: { instagrams: false, facebooks: false, youtubes: false, tiktoks: false, twitters: false },
  });
  const parsed = z.object({ data: runSchema }).safeParse(response);
  if (!parsed.success) throw new Error('Apify 提交响应无法验证，状态未知。请在控制台核对，不要重新提交。');
  job.run = parsed.data.data; await persist(); return publicJob(job);
}
export async function mapsProgress(state: MapsState, signal: AbortSignal, persist: () => Promise<void>, waitSeconds = 0) {
  const job = state.mapsJob;
  if (!job) return { status: 'not-started' as const };
  if (!job.run) return publicJob(job);
  const api = await bindApify();
  if (api.identity !== job.connectionIdentity) throw new Error('Apify 连接已更换，请恢复提交任务时使用的 Token。');
  const response = z.object({ data: runSchema }).safeParse(await api.request(`/actor-runs/${job.run.id}?waitForFinish=${waitSeconds}`, signal));
  if (!response.success || response.data.data.id !== job.run.id || response.data.data.defaultDatasetId !== job.run.defaultDatasetId) throw new Error('Apify 任务响应不匹配，未更新状态。');
  job.run = response.data.data; await persist(); return publicJob(job);
}
const text = z.string().max(2000).nullish();
const placeSchema = z.object({ title: text, placeId: text, url: text, website: text, phone: text, address: text,
  categoryName: text, emails: z.array(z.string().max(320)).max(100).nullish(),
  totalScore: z.number().nullish(), reviewsCount: z.number().nullish() });
export type MapsPlace = z.infer<typeof placeSchema>;
export async function mapsResults(state: MapsState, signal: AbortSignal, offset: number) {
  const job = state.mapsJob;
  if (!job?.run) throw new Error('没有可读取的采集任务编号。');
  if (!terminalRun(job.run.status)) throw new Error('采集仍在运行，请先查询进度；结束后再读取稳定结果。');
  const api = await bindApify();
  if (api.identity !== job.connectionIdentity) throw new Error('Apify 连接已更换，请恢复原 Token 后读取结果。');
  const result = z.array(placeSchema).max(50).safeParse(await api.request(`/datasets/${job.run.defaultDatasetId}/items?format=json&clean=true&offset=${offset}&limit=50`, signal));
  if (!result.success) throw new Error('采集结果格式异常，未生成客户表。');
  return { items: result.data, offset, nextOffset: result.data.length === 50 ? offset + 50 : null,
    runStatus: job.run.status, partial: job.run.status !== 'SUCCEEDED', retrievedAt: new Date().toISOString(), runId: job.run.id };
}
function safeUrl(value: string | null | undefined): string {
  try { const url = new URL(value ?? ''); return ['http:','https:'].includes(url.protocol) ? url.href : ''; } catch { return ''; }
}
export function uniqueMapsPlaces(items: MapsPlace[]): MapsPlace[] {
  const seen = new Set<string>();
  return items.filter(item => { const key = item.placeId || safeUrl(item.url); if (!key) return true; if (seen.has(key)) return false; seen.add(key); return true; });
}
export function mapsCsv(items: MapsPlace[]): string {
  const cell = (value: unknown) => { let text = value == null ? '' : String(value); if (/^[\s]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = "'" + text; return '"' + text.replaceAll('"','""') + '"'; };
  const rows: unknown[][] = [['商家名称','类别','地址','官网','电话','邮箱','评分','评论数','Google Maps 来源','Place ID']];
  for (const item of uniqueMapsPlaces(items)) {
    rows.push([item.title,item.categoryName,item.address,safeUrl(item.website),item.phone,item.emails?.join('; '),item.totalScore,item.reviewsCount,safeUrl(item.url),item.placeId]);
  }
  return '\uFEFF' + rows.map(row => row.map(cell).join(',')).join('\r\n');
}
