import {headingReport} from './quality.mjs';

export function normalizeBase(base) {
  return String(base).replace(/\/$/, '');
}

export async function fetchPage(base, path, {fetchImpl = fetch, timeoutMs = 15000} = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(`${normalizeBase(base)}${path}`, {
      signal: controller.signal,
      headers: {'Cache-Control': 'no-cache'},
      redirect: 'follow',
    });
    return {response, html: await response.text()};
  } finally {
    clearTimeout(timer);
  }
}

export function inspectPage(response, html, path, markers = []) {
  const headings = headingReport(html);
  const missingMarkers = markers.filter(marker => !html.includes(marker));
  return {
    path,
    status: response.status,
    h1: headings.h1,
    headings: headings.headings,
    skips: headings.skips,
    missingMarkers,
    fatal: /There has been a critical error on this website/i.test(html),
    pass: response.status === 200 && headings.h1 === 1 && headings.skips === 0 && missingMarkers.length === 0 && !/There has been a critical error on this website/i.test(html),
  };
}

export async function verifyPages(base, paths, markers = [], options = {}) {
  const results = [];
  for (const path of paths) {
    let attemptsLeft = options.transportRetries ?? 2;
    let result;
    for (;;) {
      try {
        const {response, html} = await fetchPage(base, path, options);
        result = inspectPage(response, html, path, path === '/' ? markers : []);
      } catch (error) {
        result = {path, status: 0, h1: 0, headings: 0, skips: 0, missingMarkers: [], fatal: false, pass: false, detail: error.message};
      }
      // Retry only transport failures (status 0); HTTP failures are real answers.
      if (result.pass || result.status !== 0 || attemptsLeft === 0) break;
      attemptsLeft -= 1;
      if (options.transportRetryDelayMs) await new Promise(resolve => setTimeout(resolve, options.transportRetryDelayMs));
    }
    results.push(result);
  }
  return {pass: results.every(result => result.pass), results};
}

export async function verifyDatabase(project, options = {}) {
  const wp = options.wp ?? (() => '');
  const results = [];
  for (const item of project.contentCounts) {
    const countArgs = item.kind === 'term'
      ? ['term', 'list', item.postType, '--format=count']
      : ['post', 'list', '--post_type=' + item.postType, '--format=count'];
    let attemptsLeft = options.wpRetries ?? 2;
    let output;
    for (;;) {
      try {
        output = wp(countArgs).trim();
        break;
      } catch (error) {
        // Shared-host SSH connections drop intermittently; counts are read-only and safe to retry.
        if (attemptsLeft === 0 || !/timed out|connection|aborted/i.test(error.message)) throw error;
        attemptsLeft -= 1;
        if (options.wpRetryDelayMs) await new Promise(resolve => setTimeout(resolve, options.wpRetryDelayMs));
      }
    }
    const count = Number(output.split('\n').pop()) || 0;
    const pass = item.expected === undefined ? count >= 0 : count >= item.expected;
    results.push({label: item.label, postType: item.postType, kind: item.kind, count, expected: item.expected, pass});
  }
  return {pass: results.every(item => item.pass), results};
}
