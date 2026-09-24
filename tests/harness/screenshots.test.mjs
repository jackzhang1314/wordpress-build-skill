import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtempSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {captureScreenshots, detectChromeBin, planScreenshotJobs, resolveScreenshotRoutes} from '../../harness/lib/screenshots.mjs';

test('screenshot plan expands routes by widths and creates safe names', () => {
  const jobs = planScreenshotJobs(['/', '/product-category/food-grade/'], [390, 1440], '/tmp/shots');
  assert.deepEqual(jobs, [
    {route: '/', width: 390, out: '/tmp/shots/0390--home.png'},
    {route: '/', width: 1440, out: '/tmp/shots/1440--home.png'},
    {route: '/product-category/food-grade/', width: 390, out: '/tmp/shots/0390--product-category-food-grade.png'},
    {route: '/product-category/food-grade/', width: 1440, out: '/tmp/shots/1440--product-category-food-grade.png'},
  ]);
});

test('screenshot capture passes only when every file is produced and non-empty', async () => {
  const outDir = mkdtempSync(join(tmpdir(), 'wp-screens-'));
  const result = await captureScreenshots({
    base: 'https://example.com',
    routes: ['/', '/about/'],
    widths: [390],
    outDir,
    chromeBin: '/fake-chrome',
    runner: async job => {
      writeFileSync(job.out, Buffer.alloc(6000, 'x'));
    },
  });
  assert.equal(result.pass, true);
  assert.equal(result.shots.length, 2);
  assert.ok(result.shots.every(shot => shot.pass && shot.bytes > 5000));
});

test('screenshot capture records failed jobs without throwing', async () => {
  const result = await captureScreenshots({
    base: 'https://example.com',
    routes: ['/'],
    widths: [390],
    outDir: mkdtempSync(join(tmpdir(), 'wp-screens-')),
    chromeBin: '/fake-chrome',
    runner: async () => {
      throw new Error('renderer failed');
    },
  });
  assert.equal(result.pass, false);
  assert.match(result.shots[0].error, /renderer failed/);
});

test('chrome detection honours CHROME_BIN and requires an existing binary', () => {
  assert.equal(detectChromeBin({CHROME_BIN: '/definitely-missing'}, 'darwin'), '');
  assert.equal(detectChromeBin({CHROME_BIN: import.meta.filename}, 'darwin'), import.meta.filename);
});

test('screenshot modes resolve explicit, configured and fallback route sets', () => {
  const project = {
    livePages: ['/', '/products/', '/contact/'],
    screenshotModes: {
      smoke: ['/'],
      templates: ['/', '/products/'],
    },
  };
  assert.deepEqual(resolveScreenshotRoutes(project, {mode: 'smoke'}).routes, ['/']);
  assert.deepEqual(resolveScreenshotRoutes(project, {mode: 'templates'}).routes, ['/', '/products/']);
  assert.deepEqual(resolveScreenshotRoutes(project, {mode: 'full'}).routes, ['/', '/products/', '/contact/']);
  const custom = resolveScreenshotRoutes(project, {mode: 'full', routes: ['/contact/']});
  assert.equal(custom.mode, 'custom');
  assert.deepEqual(custom.routes, ['/contact/']);
  assert.throws(() => resolveScreenshotRoutes(project, {mode: 'everything'}), /Unknown screenshot mode/);
});

test('captureScreenshots reuses browser pages through CDP with bounded concurrency', async () => {
  const createdPages = [];
  const browser = {
    newPage: async () => {
      const page = {
        setViewport: async () => {},
        navigate: async () => {},
        screenshot: async () => Buffer.alloc(6000, 'png'),
        close: () => {},
      };
      createdPages.push(page);
      return page;
    },
    close: async () => {},
  };
  const outDir = mkdtempSync(join(tmpdir(), 'cdp-screens-'));
  const result = await captureScreenshots({
    base: 'https://example.com',
    routes: ['/', '/products/', '/contact/'],
    widths: [390],
    outDir,
    chromeBin: '/fake-chrome',
    concurrency: 2,
    browserFactory: async () => browser,
  });
  assert.equal(result.pass, true);
  assert.equal(result.concurrency, 2);
  assert.equal(result.shots.length, 3);
  assert.ok(result.shots.every(shot => shot.bytes > 5000));
});
