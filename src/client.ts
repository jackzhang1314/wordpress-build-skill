import { createHash } from 'node:crypto';
import { z } from 'zod';

export function hash(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

export class WordPressError extends Error {
  constructor(readonly status: number, readonly code: string) {
    super(`WordPress HTTP ${status} (${code}). Check connection, permissions and server logs.`);
  }
}

export interface ConnectionConfig {
  site: string;
  restRoot?: string;
  username: string;
  password: string;
  allowLocalHttp?: boolean;
}

function safeUrl(raw: string, allowLocalHttp = false): URL {
  const url = new URL(raw);
  const local = ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname);
  if (url.username || url.password || url.hash || !(url.protocol === 'https:' || (allowLocalHttp && local && url.protocol === 'http:'))) {
    throw new Error('Use HTTPS without URL credentials; HTTP is allowed only for an explicit loopback lab.');
  }
  return url;
}

export class WordPressClient {
  readonly site: string;
  readonly root: URL;
  readonly identity: string;
  private readonly authorization: string;

  constructor(config: ConnectionConfig, private readonly fetcher: typeof fetch = fetch) {
    const site = safeUrl(config.site, config.allowLocalHttp);
    if (site.search) throw new Error('WP_URL must be a site URL without query parameters.');
    this.site = site.href.replace(/\/$/, '');
    this.root = safeUrl(config.restRoot ?? `${this.site}/wp-json/`, config.allowLocalHttp);
    if (this.root.origin !== site.origin) throw new Error('REST root must share the configured site origin.');
    if (!config.username.trim() || config.username.includes(':') || !config.password.trim()) throw new Error('WordPress username and application password are required.');
    this.authorization = `Basic ${Buffer.from(`${config.username}:${config.password}`).toString('base64')}`;
    this.identity = hash([this.site, this.root.href, config.username]);
  }

  static fromEnv(env: NodeJS.ProcessEnv = process.env): WordPressClient {
    if (!env.WP_URL || !env.WP_USERNAME || !env.WP_APP_PASSWORD) {
      throw new Error('Set WP_URL, WP_USERNAME and WP_APP_PASSWORD privately in the environment.');
    }
    return new WordPressClient({ site: env.WP_URL, restRoot: env.WP_REST_URL, username: env.WP_USERNAME, password: env.WP_APP_PASSWORD, allowLocalHttp: env.WP_ALLOW_LOCAL_HTTP === '1' });
  }

  url(route: string): URL {
    if (!/^\/(?:[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]*)*)?(?:\?[^#]*)?$/.test(route)) throw new Error('Invalid REST route.');
    const [path = '', query = ''] = route.split('?');
    const target = new URL(this.root);
    if (target.searchParams.has('rest_route')) target.searchParams.set('rest_route', path || '/');
    else target.pathname = `${target.pathname.replace(/\/$/, '')}${path || '/'}`;
    for (const [key, value] of new URLSearchParams(query)) {
      if (key === 'rest_route') throw new Error('REST root cannot be overridden by a query.');
      target.searchParams.append(key, value);
    }
    return target;
  }

  async request(route: string, method: 'GET' | 'OPTIONS' | 'POST' = 'GET', body?: unknown): Promise<unknown> {
    const response = await this.fetcher(this.url(route), {
      method, redirect: 'error', signal: AbortSignal.timeout(30_000),
      headers: { Authorization: this.authorization, Accept: 'application/json', ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return this.decode(response);
  }

  async upload(bytes: Uint8Array, filename: string, mime: string, fields: { title: string; alt_text: string; caption: string }): Promise<unknown> {
    const body = new FormData();
    body.append('file', new Blob([new Uint8Array(bytes)], { type: mime }), filename);
    for (const [key, value] of Object.entries(fields)) body.append(key, value);
    const response = await this.fetcher(this.url('/wp/v2/media'), {
      method: 'POST', redirect: 'error', signal: AbortSignal.timeout(60_000),
      headers: { Authorization: this.authorization, Accept: 'application/json' }, body,
    });
    return this.decode(response);
  }

  private async decode(response: Response): Promise<unknown> {
    const raw = await response.text();
    let data: unknown;
    try { data = JSON.parse(raw); } catch { throw new WordPressError(response.status, 'invalid_json'); }
    if (!response.ok) {
      const parsed = z.object({ code: z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/) }).safeParse(data);
      throw new WordPressError(response.status, parsed.success ? parsed.data.code : 'request_failed');
    }
    return data;
  }

  async probe(route: string, method: 'GET' | 'OPTIONS' = 'GET') {
    try { return { status: 'available' as const, data: await this.request(route, method) }; }
    catch (error) {
      if (!(error instanceof WordPressError)) throw error;
      return { status: 'unknown' as const, httpStatus: error.status, code: error.code };
    }
  }

  async discover() {
    const account = z.object({ id: z.number(), capabilities: z.record(z.string(), z.boolean()).optional() }).parse(await this.request('/wp/v2/users/me?context=edit'));
    const [themes, blocks, pages, types, settings] = await Promise.all([
      this.probe('/wp/v2/themes?status=active'), this.probe('/wp/v2/block-types?context=edit'),
      this.probe('/wp/v2/pages', 'OPTIONS'), this.probe('/wp/v2/types?context=edit'), this.probe('/wp/v2/settings'),
    ]);
    return { site: this.site, restRoot: this.root.href, identity: this.identity, checkedAt: new Date().toISOString(), account, themes, blocks, pages, types, settings };
  }
}
