/* global WebSocket */
import {spawn} from 'node:child_process';
import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

/** Minimal JSON-RPC connection to one Chrome DevTools Protocol page target. */
export class CdpPage {
  constructor(wsUrl, {onClose} = {}) {
    this.ws = new WebSocket(wsUrl);
    this.nextId = 1;
    this.pending = new Map();
    this.events = [];
    this.waiters = [];
    this.closed = false;
    this.onClose = onClose;
    this.opened = new Promise((resolve, reject) => {
      this.ws.onopen = () => resolve();
      this.ws.onerror = () => reject(new Error('Unable to connect to Chrome DevTools page'));
    });
    this.ws.onmessage = event => this.#receive(String(event.data));
    this.ws.onclose = () => this.#close(new Error('Chrome DevTools connection closed'));
    this.ws.onerror = () => this.#close(new Error('Chrome DevTools connection error'));
  }

  #receive(data) {
    let message;
    try { message = JSON.parse(data); } catch { return; }
    if (message.id !== undefined && this.pending.has(message.id)) {
      const pending = this.pending.get(message.id);
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(message.error.message || 'Chrome DevTools request failed'));
      else pending.resolve(message.result || {});
      return;
    }
    if (message.method) {
      const event = {method: message.method, params: message.params ?? {}};
      this.events.push(event);
      this.waiters = this.waiters.filter(waiter => {
        if (!waiter.match(event)) return true;
        clearTimeout(waiter.timer);
        waiter.resolve(event);
        return false;
      });
    }
  }

  #close(error) {
    if (this.closed) return;
    this.closed = true;
    for (const pending of this.pending.values()) pending.reject(error);
    this.pending.clear();
    for (const waiter of this.waiters) {
      clearTimeout(waiter.timer);
      waiter.reject(error);
    }
    this.waiters = [];
    this.onClose?.(error);
  }

  send(method, params = {}) {
    if (this.closed) return Promise.reject(new Error('Chrome DevTools connection is closed'));
    const id = this.nextId++;
    const sendPromise = this.opened.then(() => {
      this.ws.send(JSON.stringify({id, method, params}));
    });
    return new Promise((resolve, reject) => {
      this.pending.set(id, {resolve, reject});
      sendPromise.catch(reject);
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`Timed out waiting for Chrome DevTools response: ${method}`));
        }
      }, 15000).unref?.();
    });
  }

  waitEvent(method, predicate = () => true, timeoutMs = 20000) {
    const existing = this.events.reverse().find(event => event.method === method && predicate(event));
    this.events.reverse();
    if (existing) return Promise.resolve(existing);
    return new Promise((resolve, reject) => {
      const waiter = {
        match: event => event.method === method && predicate(event),
        resolve: null,
        timer: setTimeout(() => {
          const index = this.waiters.indexOf(waiter);
          if (index >= 0) this.waiters.splice(index, 1);
          reject(new Error(`Timed out waiting for Chrome event: ${method}`));
        }, timeoutMs),
      };
      waiter.resolve = resolve;
      this.waiters.push(waiter);
    });
  }

  async evaluate(expression, {awaitPromise = false} = {}) {
    const result = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise,
      returnByValue: true,
      userGesture: true,
    });
    if (result.exceptionDetails) {
      const detail = result.exceptionDetails.exception?.description ||
        result.exceptionDetails.text || 'Browser evaluation failed';
      throw new Error(detail);
    }
    return result.result?.value;
  }

  async setViewport({width, height, mobile = false}) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width, height, mobile, deviceScaleFactor: 1,
    });
  }

  async navigate(url, {timeoutMs = 30000, settleMs = 500} = {}) {
    await this.send('Page.enable');
    const loaded = this.waitEvent('Page.loadEventFired', () => true, timeoutMs);
    await this.send('Page.navigate', {url});
    await loaded;
    if (settleMs) await new Promise(resolve => setTimeout(resolve, settleMs));
    return this.evaluate('location.href');
  }

  async screenshot() {
    const result = await this.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false,
      optimizeForSpeed: true,
    });
    return Buffer.from(result.data, 'base64');
  }

  close() {
    try { this.ws.close(); } catch { /* Chrome may already have disconnected. */ }
  }
}

/** Reusable headless browser process; jobs reuse pages instead of relaunching Chrome. */
export class CdpBrowser {
  constructor({process: childProcess, port, endpoint, chromeBin}) {
    this.process = childProcess;
    this.port = port;
    this.endpoint = endpoint;
    this.chromeBin = chromeBin;
  }

  async request(path, method = 'GET') {
    const response = await fetch(`http://127.0.0.1:${this.port}${path}`, {method});
    if (!response.ok) throw new Error(`Chrome DevTools HTTP ${response.status}: ${path}`);
    return response.json();
  }

  async newPage() {
    const target = await this.request('/json/new?about:blank', 'PUT');
    await new Promise(resolve => setTimeout(resolve, 100));
    const page = new CdpPage(target.webSocketDebuggerUrl, {
      onClose: () => this.closePage(target.id).catch(() => {}),
    });
    await page.send('Runtime.enable');
    await page.send('Page.enable');
    return page;
  }

  async closePage(targetId) {
    await this.request(`/json/close/${targetId}`, 'GET');
  }

  close() {
    this.process?.kill('SIGTERM');
  }
}

/** Launch Chrome and wait until its CDP HTTP endpoint is available. */
export async function launchCdpBrowser({
  chromeBin,
  timeoutMs = 20000,
  env = process.env,
  spawnImpl = spawn,
} = {}) {
  const bin = chromeBin || env.CHROME_BIN || '';
  if (!bin) throw new Error('No Chrome/Chromium binary found (set CHROME_BIN)');
  const profile = mkdtempSync(join(tmpdir(), 'wp-harness-chrome-'));
  const childProcess = spawnImpl(bin, [
    '--headless=new',
    '--remote-debugging-port=0',
    `--user-data-dir=${join(profile, 'profile')}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    'about:blank',
  ], {stdio: ['ignore', 'pipe', 'pipe']});
  const endpoint = await new Promise((resolve, reject) => {
    let buffer = '';
    const timer = setTimeout(() => reject(new Error('Timed out waiting for Chrome DevTools endpoint')), timeoutMs);
    const handle = data => {
      buffer += String(data);
      const match = buffer.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match) {
        clearTimeout(timer);
        resolve(match[1]);
      }
    };
    childProcess.stdout?.on('data', handle);
    childProcess.stderr?.on('data', handle);
    childProcess.once('exit', code => {
      clearTimeout(timer);
      reject(new Error(`Chrome exited before DevTools endpoint was available (code ${code})`));
    });
  });
  const browser = new CdpBrowser({process: childProcess, port: new URL(endpoint).port, endpoint, chromeBin: bin});
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      await browser.request('/json/version');
      return browser;
    } catch {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  browser.close();
  throw new Error('Chrome DevTools HTTP endpoint did not become ready');
}

/** Run asynchronous jobs with bounded concurrency and stable result order. */
export async function mapWithConcurrency(items, concurrency, worker) {
  const results = new Array(items.length);
  let next = 0;
  const size = Math.max(1, Math.min(Number(concurrency) || 1, items.length));
  await Promise.all(Array.from({length: size}, async () => {
    for (;;) {
      const index = next;
      next += 1;
      if (index >= items.length) return;
      results[index] = await worker(items[index], index);
    }
  }));
  return results;
}
