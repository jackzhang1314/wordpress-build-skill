import { z } from 'zod';

const key = 'agent-connection-apify-v1';
const verificationKey = 'agent-connection-apify-check-v1';
const tokenSchema = z.string().trim().min(1, '请填写 API Token。').max(2048).regex(/^[\x21-\x7e]+$/, 'Token 不能包含空格或换行。');
const recordSchema = z.object({ token: tokenSchema });
const verificationSchema = z.object({ fingerprint: z.string(), checkedAt: z.string().datetime() });
async function fingerprint(token: string): Promise<string> {
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))), byte => byte.toString(16).padStart(2, '0')).join('');
}
class ConnectionError extends Error {}
/** Trusted callers get a bound transport, never a credential in tool output. */
export async function bindApify() {
  const saved = await read();
  if (!saved) throw new Error('请先在设置 → 连接器 → Apify 配置 API Token。');
  const identity = await fingerprint(saved.token);
  return { identity, request: async (path: string, signal: AbortSignal, body?: object): Promise<unknown> => {
    if (!/^\/(actors\/compass~crawler-google-places\/runs|actor-runs\/[A-Za-z0-9]+|datasets\/[A-Za-z0-9]+\/items)(\?|$)/.test(path)) throw new Error('不支持的 Apify 请求路径。');
    if ((await read())?.token !== saved.token) throw new Error('Apify 配置已更改，请恢复原连接后继续任务。');
    try {
      const response = await fetch(`https://api.apify.com/v2${path}`, {
        method: body ? 'POST' : 'GET', headers: { Authorization: `Bearer ${saved.token}`, 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined, redirect: 'error', credentials: 'omit', cache: 'no-store',
        signal: AbortSignal.any([signal, AbortSignal.timeout(40000)]),
      });
      if (!response.ok) throw new ConnectionError(`Apify 请求失败（HTTP ${response.status}）。请检查权限、余额及服务状态。`);
      const text = await response.text();
      if (text.length > 2000000) throw new ConnectionError('Apify 单批结果过大，请减少单批数量。');
      // Provider responses must not echo the credential into model output or task files.
      return JSON.parse(text.replaceAll(saved.token, '[REDACTED]')) as unknown;
    } catch (error) {
      if (error instanceof ConnectionError) throw error;
      // eslint-disable-next-line preserve-caught-error -- Transport errors may contain authorization details.
      throw new Error('Apify 请求中断或响应异常。提交结果可能未知，请勿重复启动采集；先检查已有任务。');
    }
  } };
}
export interface ConnectionStatus { configured: boolean; checkedAt?: string }
async function area(): Promise<chrome.storage.LocalStorageArea> {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) throw new Error('请在已安装的插件中配置 API。');
  await chrome.storage.local.setAccessLevel({ accessLevel: 'TRUSTED_CONTEXTS' });
  return chrome.storage.local;
}
async function read() {
  const storage = await area(), data = await storage.get(key);
  const parsed = recordSchema.safeParse(data[key]);
  return parsed.success ? parsed.data : undefined;
}
export async function apifyStatus(): Promise<ConnectionStatus> {
  const saved = await read(); if (!saved) return { configured: false };
  const data = await (await area()).get(verificationKey), checked = verificationSchema.safeParse(data[verificationKey]);
  const checkedAt = checked.success && checked.data.fingerprint === await fingerprint(saved.token) ? checked.data.checkedAt : undefined;
  return { configured: true, checkedAt };
}
export async function saveApifyToken(token: string): Promise<void> {
  const parsed = tokenSchema.safeParse(token);
  if (!parsed.success) throw new Error('请填写有效的 API Token，不要包含空格或换行。');
  const storage = await area(); await storage.set({ [key]: { token: parsed.data } });
}
export async function removeApifyToken(): Promise<void> { const storage = await area(); await storage.remove(key); await storage.remove(verificationKey); }
export async function testApifyConnection(): Promise<ConnectionStatus> {
  const saved = await read(); if (!saved) throw new Error('请先保存 API Token。');
  const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch('https://api.apify.com/v2/users/me', {
      method: 'GET', headers: { Authorization: `Bearer ${saved.token}` },
      redirect: 'error', credentials: 'omit', cache: 'no-store', signal: controller.signal,
    });
    if (response.status === 401 || response.status === 403) throw new ConnectionError('Token 无效或没有账户读取权限，请检查 Apify 配置。');
    if (!response.ok) throw new ConnectionError(`Apify 暂时无法连接（HTTP ${response.status}），请稍后重试。`);
    const valid = z.object({ data: z.object({ id: z.string().min(1) }) }).safeParse(await response.json());
    if (!valid.success) throw new ConnectionError('Apify 返回的数据无法验证，请稍后重试。');
    const current = await read();
    if (current?.token !== saved.token) throw new ConnectionError('配置已更改，请重新测试连接。');
    const checkedAt = new Date().toISOString();
    // Verification never rewrites the credential: another settings view may remove it concurrently.
    await (await area()).set({ [verificationKey]: { fingerprint: await fingerprint(saved.token), checkedAt } });
    return { configured: true, checkedAt };
  } catch (error) {
    // Never surface network/server response bodies that could echo credentials.
    if (error instanceof ConnectionError) throw error;
    // eslint-disable-next-line preserve-caught-error -- Raw transport errors may contain the credential; do not retain them in cause or logs.
    throw new Error(controller.signal.aborted ? '连接测试超时，请检查网络后重试。' : '连接测试失败，请检查网络后重试。');
  } finally { clearTimeout(timeout); }
}
