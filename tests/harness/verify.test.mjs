import test from 'node:test';
import assert from 'node:assert/strict';
import {fetchPage, inspectPage, isBlankMediaContract, verifyDatabase, verifyPages} from '../../harness/lib/verify.mjs';
import {fileURLToPath} from 'node:url';

const starterRoot = fileURLToPath(new URL('../../examples/classic-b2b-starter', import.meta.url));

test('page inspection requires one H1, order and markers', () => {
  const response = {status: 200};
  assert.equal(inspectPage(response, '<h1>A</h1><h2>B</h2>Marker', '/', ['Marker']).pass, true);
  const bad = inspectPage(response, '<h1>A</h1><h4>C</h4>', '/', ['Missing']);
  assert.equal(bad.pass, false);
  assert.equal(bad.skips, 1);
  assert.deepEqual(bad.missingMarkers, ['Missing']);
});

test('verify pages reports transport failures without throwing', async () => {
  const fetchImpl = async () => { throw new Error('offline'); };
  const result = await verifyPages('https://example.test', ['/', '/products/'], [], {fetchImpl});
  assert.equal(result.pass, false);
  assert.equal(result.results[0].detail, 'offline');
});

test('fetch page normalizes base and closes its timeout', async () => {
  const seen = [];
  const fetchImpl = async url => {
    seen.push(url);
    return {status: 200, text: async () => '<h1>ok</h1>'};
  };
  const {response, html} = await fetchPage('https://example.test/', '/x', {fetchImpl});
  assert.equal(seen[0], 'https://example.test/x');
  assert.equal(response.status, 200);
  assert.equal(html, '<h1>ok</h1>');
});

test('database verification counts taxonomy terms when kind is term', async () => {
  const calls = [];
  const wp = args => {
    calls.push(args);
    if (args[0] === 'term') return '4';
    return args.some(arg => String(arg).includes('cleanroom_product')) ? '6' : '0';
  };
  const project = {contentCounts: [
    {label: 'Products', postType: 'cleanroom_product', expected: 6, kind: 'post'},
    {label: 'Categories', postType: 'product_collection', expected: 4, kind: 'term'},
  ]};
  const result = await verifyDatabase(project, {wp});
  assert.equal(result.pass, true);
  assert.deepEqual(calls[0], ['post', 'list', '--post_type=cleanroom_product', '--format=count']);
  assert.deepEqual(calls[1], ['term', 'list', 'product_collection', '--format=count']);
  assert.equal(result.results[1].count, 4);
});

test('verify pages retries transient transport failures but not HTTP failures', async () => {
  let attempts = 0;
  const fetchImpl = async () => {
    attempts += 1;
    if (attempts === 1) throw new Error('This operation was aborted');
    return {status: 200, text: async () => '<h1>ok</h1>'};
  };
  const result = await verifyPages('https://example.test', ['/slow/'], [], {fetchImpl, transportRetryDelayMs: 1});
  assert.equal(result.pass, true);
  assert.equal(attempts, 2);

  attempts = 0;
  const httpFailFetch = async () => ({status: 404, text: async () => 'not found'});
  const httpResult = await verifyPages('https://example.test', ['/missing/'], [], {fetchImpl: httpFailFetch});
  assert.equal(httpResult.pass, false);
  assert.equal(attempts, 0);
});

test('zero-source starter allows owner uploads and audits only harness-managed media', async () => {
  const calls = [];
  const wp = args => {
    calls.push(args);
    return args.some(arg => String(arg).includes('attachment')) ? 'ID\n180\n182\n' : '3';
  };
  const project = {
    contentCounts: [{label: 'Guides', postType: 'starter_guide', expected: 3, kind: 'post'}],
    media: {sources: []},
    paths: {content: 'content'},
  };
  const result = await verifyDatabase(project, {wp, blankMedia: true, managedMediaIds: []});
  assert.equal(result.pass, true);
  assert.deepEqual(calls.filter(args => args.some(arg => String(arg).includes('attachment'))), []);
  assert.deepEqual(result.results.at(-1), {label: 'Harness-managed media', postType: 'attachment', kind: 'post', count: 0, expected: 0, pass: true});

  const managed = await verifyDatabase(project, {wp, blankMedia: true, managedMediaIds: [180]});
  assert.equal(managed.pass, false);
  assert.equal(managed.results.at(-1).count, 1);
});

test('starter blank media contract is detected from source and empty map', () => {
  assert.equal(isBlankMediaContract(starterRoot, {
    media: {sources: []},
    paths: {content: 'content'},
  }), true);
  assert.equal(isBlankMediaContract(starterRoot, {
    media: {sources: [{name: 'products', path: 'docs/media/products'}]},
    paths: {content: 'content'},
  }), false);
});

test('database verification retries transient wp failures', async () => {
  const project = {contentCounts: [{label: 'Guides', postType: 'cleanroom_guide', expected: 3, kind: 'post'}]};
  let calls = 0;
  const wp = () => {
    calls += 1;
    if (calls === 1) throw new Error('Command failed: Connection to host port 65002 timed out');
    return '3';
  };
  const result = await verifyDatabase(project, {wp, wpRetryDelayMs: 1});
  assert.equal(result.pass, true);
  assert.equal(result.results[0].count, 3);
  assert.equal(calls, 2);
});
