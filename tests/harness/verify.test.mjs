import test from 'node:test';
import assert from 'node:assert/strict';
import {fetchPage, inspectPage, verifyPages} from '../../harness/lib/verify.mjs';

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
