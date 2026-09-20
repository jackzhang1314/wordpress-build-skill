import { z } from 'zod';
import { seoAdvancedPaths, onPageReadPaths } from './seo-paths';
import type { ConnectionStatus } from './apify';

const key = 'agent-connection-dataforseo-v1', checkKey = `${key}-check`;
const credentialsSchema = z.object({
  login: z.string().trim().min(1).max(254).regex(/^[\x21-\x39\x3b-\x7e]+$/),
  password: z.string().min(1).max(2048).regex(/^[\x21-\x7e]+$/),
});
const checkedSchema = z.object({ identity: z.string(), checkedAt: z.string().datetime() });
export async function seoHash(value: string): Promise<string> {
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))), b => b.toString(16).padStart(2, '0')).join('');
}
async function area(): Promise<chrome.storage.LocalStorageArea> {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) throw new Error('请在已安装的插件中配置 DataForSEO。');
  await chrome.storage.local.setAccessLevel({ accessLevel: 'TRUSTED_CONTEXTS' });
  return chrome.storage.local;
}
async function read() {
  const value = (await (await area()).get(key))[key], parsed = credentialsSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}
export async function saveDataForSeo(login: string, password: string): Promise<void> {
  const parsed = credentialsSchema.safeParse({ login, password });
  if (!parsed.success) throw new Error('请填写有效的 API Login 和 API Password，不能包含空格或换行。');
  await (await area()).set({ [key]: parsed.data });
}
export async function removeDataForSeo(): Promise<void> { await (await area()).remove([key, checkKey]); }
export async function dataForSeoStatus(): Promise<ConnectionStatus> {
  const saved = await read(); if (!saved) return { configured: false };
  const check = checkedSchema.safeParse((await (await area()).get(checkKey))[checkKey]);
  return { configured: true, checkedAt: check.success && check.data.identity === await seoHash(JSON.stringify(saved)) ? check.data.checkedAt : undefined };
}
export const seoPaths = {
  keywords: '/dataforseo_labs/google/keyword_overview/live',
  ideas: '/dataforseo_labs/google/keyword_ideas/live',
  domain: '/dataforseo_labs/google/domain_rank_overview/live',
  ranked: '/dataforseo_labs/google/ranked_keywords/live',
  competitors: '/dataforseo_labs/google/competitors_domain/live',
  gap: '/dataforseo_labs/google/domain_intersection/live',
  serp: '/serp/google/organic/live/advanced',
} as const;
const envelopeSchema = z.object({ status_code: z.number(), cost: z.number().nonnegative(), tasks: z.array(z.object({
  id: z.string().nullable().optional(), status_code: z.number(), result: z.array(z.unknown()).nullable(),
})).length(1) });
class SeoError extends Error {}
function redact(value: unknown, secrets: string[]): unknown {
  if (typeof value === 'string') return secrets.reduce((text, secret) => text.replaceAll(secret, '[REDACTED]'), value);
  if (Array.isArray(value)) return value.map(item => redact(item, secrets));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([name, item]) => [name, redact(item, secrets)]));
  return value;
}
/** Fixed hosts and paths; credentials never enter tool arguments, responses or skill packages. */
export async function bindDataForSeo() {
  const saved = await read(); if (!saved) throw new Error('请先在设置 → 连接器 → DataForSEO 配置 API Login 和 API Password。');
  const identity = await seoHash(JSON.stringify(saved));
  const authorization = `Basic ${btoa(`${saved.login}:${saved.password}`)}`;
  return { identity, request: async (path: string, signal: AbortSignal, body?: object) => {
    const post = [...Object.values(seoPaths), ...Object.values(seoAdvancedPaths), ...onPageReadPaths, '/on_page/task_post', '/on_page/force_stop'].includes(path);
    const get = ['/appendix/user_data', '/dataforseo_labs/locations_and_languages'].includes(path) || /^\/on_page\/summary\/[a-zA-Z0-9-]{1,80}$/.test(path);
    if (!(post ? !!body : get && !body)) throw new Error('不支持的 DataForSEO 请求。');
    if (JSON.stringify(await read()) !== JSON.stringify(saved)) throw new Error('DataForSEO 配置已更改，请重新执行查询。');
    signal.throwIfAborted();
    try {
      const response = await fetch(`https://api.dataforseo.com/v3${path}`, { method: post ? 'POST' : 'GET',
        headers: { Authorization: authorization, 'Content-Type': 'application/json' }, body: post ? JSON.stringify([body]) : undefined,
        redirect: 'error', credentials: 'omit', cache: 'no-store', signal: AbortSignal.any([signal, AbortSignal.timeout(60000)]),
      });
      if (!response.ok) throw new SeoError(`DataForSEO 请求失败（HTTP ${response.status}），请检查账户权限、余额或服务状态。`);
      const text = await response.text();
      if (text.length > 4000000) throw new SeoError('DataForSEO 响应过大；本次请求可能已计费，请缩小后续查询范围。');
      const parsed = envelopeSchema.safeParse(JSON.parse(text) as unknown);
      if (!parsed.success) throw new SeoError('DataForSEO 响应结构异常；本次请求可能已计费，不自动重试。');
      const data = parsed.data, task = data.tasks[0]!;
      if (data.status_code !== 20000 || ![20000, ...(path === '/on_page/task_post' ? [20100] : []), ...(path.startsWith('/on_page/summary/') ? [40601, 40602] : [])].includes(task.status_code)) throw new SeoError(`DataForSEO 业务错误（${data.status_code}/${task.status_code}，本次返回费用 $${data.cost}）。请在服务后台查看原因，不自动重试。`);
      const secrets = [authorization, authorization.slice(6), saved.password, saved.login];
      return { taskId: task.id, statusCode: task.status_code, costUsd: data.cost, result: (task.result ?? []).map(item => redact(item, secrets)) };
    } catch (error) {
      if (error instanceof SeoError) throw error;
      // eslint-disable-next-line preserve-caught-error -- Transport errors may echo credentials; omit bodies and causes.
      throw new Error('DataForSEO 请求中断或响应异常，付费请求结果可能未知，不自动重试。请先核对服务后台。');
    }
  } };
}
export async function testDataForSeo(): Promise<ConnectionStatus> {
  const connection = await bindDataForSeo();
  const result = await connection.request('/appendix/user_data', new AbortController().signal);
  if (!result.result.length) throw new Error('未返回账户数据，无法验证连接。');
  if ((await bindDataForSeo()).identity !== connection.identity) throw new Error('配置已更改，请重新测试。');
  const checkedAt = new Date().toISOString();
  await (await area()).set({ [checkKey]: { identity: connection.identity, checkedAt } });
  return { configured: true, checkedAt };
}
