import {existsSync, mkdirSync, statSync, writeFile} from 'node:fs';
import {dirname, join} from 'node:path';
import {launchCdpBrowser, mapWithConcurrency} from './cdp-browser.mjs';

export const screenshotModes = ['smoke', 'templates', 'full'];

/** Resolve a route set by explicit routes or a named verification tier. */
export function resolveScreenshotRoutes(project = {}, {mode = 'smoke', routes} = {}) {
  if (routes?.length) {
    return {mode: 'custom', routes: [...routes]};
  }

  const selected = String(mode || 'smoke').toLowerCase();
  if (!screenshotModes.includes(selected)) {
    throw new Error(`Unknown screenshot mode "${selected}". Expected: ${screenshotModes.join(', ')}`);
  }

  const livePages = project.livePages ?? [];
  const configured = project.screenshotModes?.[selected];
  if (Array.isArray(configured) && configured.length) {
    return {mode: selected, routes: [...configured]};
  }
  if (selected === 'smoke') return {mode: selected, routes: livePages.slice(0, 5)};
  return {mode: selected, routes: livePages};
}

/** Expand routes × widths into deterministic job list with safe file names. */
export function planScreenshotJobs(routes, widths, outDir) {
  return routes.flatMap(route => widths.map(width => {
    const slug = route === '/' ? 'home' : route.replace(/^\//, '').replace(/\/$/, '').replace(/[^a-z0-9]+/gi, '-');
    return {route, width, out: join(outDir, `${String(width).padStart(4, '0')}--${slug}.png`)};
  }));
}

/** Locate a usable Chrome/Chromium binary without extra dependencies. */
export function detectChromeBin(env = process.env, platform = process.platform) {
  if (env.CHROME_BIN) return existsSync(env.CHROME_BIN) ? env.CHROME_BIN : '';
  const candidates = platform === 'darwin' ? [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  ] : platform === 'linux' ? [
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/microsoft-edge',
  ] : [];
  return candidates.find(candidate => existsSync(candidate)) ?? '';
}

/** Run a legacy injectable command for callers/tests that do not use CDP. */
async function runLegacyRunner(jobs, runner, concurrency) {
  return mapWithConcurrency(jobs, concurrency, async job => {
    try {
      mkdirSync(dirname(job.out), {recursive: true});
      await runner(job);
      const bytes = existsSync(job.out) ? statSync(job.out).size : 0;
      return {...job, bytes, pass: bytes > 5000};
    } catch (error) {
      return {...job, bytes: 0, pass: false, error: String(error.message ?? error).slice(0, 160)};
    }
  });
}

/** Capture one route after setting viewport and waiting for page load. */
async function captureJob(browser, job, base, timeoutMs) {
  const page = await browser.newPage();
  try {
    await page.setViewport({width: job.width, height: 2400, mobile: job.width < 768});
    await page.navigate(`${base.replace(/\/$/, '')}${job.route}`, {timeoutMs, settleMs: 500});
    const png = await page.screenshot();
    await new Promise((resolve, reject) => writeFile(job.out, png, error => (error ? reject(error) : resolve())));
    const bytes = existsSync(job.out) ? statSync(job.out).size : 0;
    return {...job, bytes, pass: bytes > 5000};
  } finally {
    page.close();
  }
}

/**
 * Capture routes using a shared headless Chrome instance.
 * Each worker keeps one CDP page open; width is changed before every navigation.
 * `runner` remains as an injectable legacy escape hatch for custom capture commands.
 */
export async function captureScreenshots({
  base, routes, widths = [390, 768, 1440], outDir,
  chromeBin, concurrency = 4, timeoutMs = 45000, mode = 'templates',
  project = {}, runner, browserFactory,
} = {}) {
  const resolved = resolveScreenshotRoutes(project, {mode, routes});
  routes = resolved.routes;
  if (chromeBin === '') return {pass: false, skipped: true, reason: 'chrome disabled (CHROME_BIN empty)', shots: []};
  const bin = chromeBin || detectChromeBin();
  if (!bin && !runner && !browserFactory) {
    return {pass: false, skipped: true, reason: 'no chrome binary found (set CHROME_BIN)', shots: []};
  }

  mkdirSync(outDir, {recursive: true});
  const jobs = planScreenshotJobs(routes, widths, outDir);
  const startedAt = Date.now();

  if (runner) {
    const shots = await runLegacyRunner(jobs, runner, concurrency);
    return {pass: shots.length > 0 && shots.every(shot => shot.pass), skipped: false, concurrency, durationMs: Date.now() - startedAt, shots};
  }

  const factory = browserFactory ?? (async () => launchCdpBrowser({chromeBin: bin, timeoutMs}));
  const browser = await factory({chromeBin: bin, timeoutMs});
  try {
    const shots = await mapWithConcurrency(jobs, concurrency, async job => {
      let result = {...job, bytes: 0, pass: false};
      for (let attempt = 1; attempt <= 2; attempt += 1) {
        try {
          result = await captureJob(browser, job, base, timeoutMs);
          if (result.pass) break;
          result.error = 'Screenshot was empty or suspiciously small';
        } catch (error) {
          result = {...job, bytes: 0, pass: false, error: String(error.message ?? error).slice(0, 160)};
        }
        if (attempt === 1) await new Promise(resolve => setTimeout(resolve, 250));
      }
      return result;
    });

    return {
      pass: shots.length > 0 && shots.every(shot => shot.pass),
      skipped: false,
      concurrency,
      durationMs: Date.now() - startedAt,
      shots,
    };
  } finally {
    await browser.close?.();
  }
}
