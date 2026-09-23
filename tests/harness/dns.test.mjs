import test from 'node:test';
import assert from 'node:assert/strict';
import {dnsAdd, dnsDelete} from '../../harness/lib/dns.mjs';

function makeFetch(zoneResult, recordResult) {
  const calls = [];
  const fn = async (url, options = {}) => {
    calls.push({url, body: options.body ? JSON.parse(options.body) : null});
    if (String(url).includes('/zones?name=')) {
      return {json: async () => ({success: true, result: zoneResult})};
    }
    return {json: async () => ({success: true, result: recordResult})};
  };
  fn.calls = calls;
  return fn;
}

test('dns add resolves the zone then creates the record', async () => {
  const record = {id: 'rec9', type: 'TXT', name: 'owlteam.work', content: 'verify123'};
  const fetchImpl = makeFetch([{id: 'zone1', name: 'owlteam.work'}], record);
  const site = {project: {title: 'Demo'}};
  const result = await dnsAdd(site, [
    '--cf-token', 'tok', '--zone', 'owlteam.work',
    '--type', 'TXT', '--name', '@', '--content', 'verify123',
  ], () => {}, {fetchImpl});
  assert.equal(result.id, 'rec9');
  assert.equal(fetchImpl.calls.length, 2);
});

test('dns add throws when the zone is missing from the account', async () => {
  const fetchImpl = makeFetch([], {});
  const site = {project: {title: 'Demo'}};
  await assert.rejects(
    dnsAdd(site, ['--cf-token', 'tok', '--zone', 'missing.test', '--type', 'TXT', '--name', '@', '--content', 'x'], () => {}, {fetchImpl}),
    /zone not found/,
  );
});

test('dns delete removes a record by type and name', async () => {
  const impl = async (url, options = {}) => {
    if (String(url).includes('/zones?name=')) {
      return {json: async () => ({success: true, result: [{id: 'zone1', name: 'owlteam.work'}]})};
    }
    if (String(url).includes('dns_records?per_page')) {
      return {json: async () => ({success: true, result: [{id: 'rec5', type: 'TXT', name: 'old.test'}]})};
    }
    if (options.method === 'DELETE') {
      return {json: async () => ({success: true})};
    }
    throw new Error('unexpected: ' + url);
  };
  const site = {project: {title: 'Demo'}};
  const result = await dnsDelete(site, ['--cf-token', 'tok', '--zone', 'owlteam.work', '--type', 'TXT', '--name', 'old.test'], () => {}, impl);
  assert.equal(result.deleted, 'rec5');
});
