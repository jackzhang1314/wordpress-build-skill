import {execFile} from 'node:child_process';
import {existsSync, mkdirSync, statSync} from 'node:fs';
import {dirname, join} from 'node:path';

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

/**
 * Capture every route at every width with headless Chrome.
 * `runner` is injectable for tests; defaults to a real chrome spawn.
 */
export async function captureScreenshots({base, routes, widths = [390, 768, 1440], outDir, chromeBin, timeoutMs = 45000, runner} = {}) {
  if (chromeBin === '') return {pass: false, skipped: true, reason: 'chrome disabled (CHROME_BIN empty)', shots: []};
  const bin = chromeBin || detectChromeBin();
  if (!bin && !runner) return {pass: false, skipped: true, reason: 'no chrome binary found (set CHROME_BIN)', shots: []};
  mkdirSync(outDir, {recursive: true});
  const jobs = planScreenshotJobs(routes, widths, outDir);
  const run = runner ?? ((job, chrome) => new Promise((resolve, reject) => {
    const args = [
      '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
      `--window-size=${job.width},2400`, `--screenshot=${job.out}`,
      '--virtual-time-budget=6000', '--timeout=30000',
      `${base.replace(/\/$/, '')}${job.route}`,
    ];
    execFile(chrome, args, {timeout: timeoutMs}, error => (error ? reject(error) : resolve()));
  }));
  const shots = [];
  for (const job of jobs) {
    try {
      mkdirSync(dirname(job.out), {recursive: true});
      await run(job, bin);
      const bytes = existsSync(job.out) ? statSync(job.out).size : 0;
      shots.push({...job, bytes, pass: bytes > 5000});
    } catch (error) {
      shots.push({...job, bytes: 0, pass: false, error: String(error.message ?? error).slice(0, 160)});
    }
  }
  return {pass: shots.length > 0 && shots.every(shot => shot.pass), skipped: false, shots};
}
