import {argValue} from './maintenance.mjs';

const API = 'https://api.cloudflare.com/client/v4';

async function cfRequest(token, method, path, body, fetchImpl) {
  const res = await (fetchImpl ?? fetch)(`${API}${path}`, {
    method,
    headers: {Authorization: `Bearer ${token}`, 'Content-Type': 'application/json'},
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!data.success) {
    const detail = (data.errors ?? []).map(e => `${e.code}: ${e.message}`).join('; ');
    throw new Error(`Cloudflare API failed: ${detail}`);
  }
  return data;
}

function resolveArgs(args) {
  const token = argValue(args, '--cf-token');
  const zone = argValue(args, '--zone');
  const type = argValue(args, '--type', 'TXT');
  const name = argValue(args, '--name', '@');
  const content = argValue(args, '--content');
  const ttl = Number(argValue(args, '--ttl', '3600'));
  if (!token || !zone || !content) {
    throw new Error('usage: harness dns add --cf-token <token> --zone <domain> --type <TXT|MX|A|CNAME> --name <name> --content <value> [--ttl 3600]');
  }
  return {token, zone, type, name, content, ttl};
}

export async function dnsAdd(site, args, logger = console.log, deps = {}) {
  const fetchImpl = deps.fetchImpl ?? fetch;
  const {token, zone: zoneName, type, name, content, ttl} = resolveArgs(args);
  const zones = await cfRequest(token, 'GET', `/zones?name=${encodeURIComponent(zoneName)}`, undefined, fetchImpl);
  const zone = zones.result[0];
  if (!zone) throw new Error(`zone not found in this Cloudflare account: ${zoneName}`);
  const created = await cfRequest(token, 'POST', `/zones/${zone.id}/dns_records`, {type, name, content, ttl}, fetchImpl);
  logger(`  OK  ${type} ${name} added to ${zoneName} (record id ${created.result.id})`);
  return created.result;
}

export async function dnsList(site, args, logger = console.log, deps = {}) {
  const fetchImpl = deps.fetchImpl ?? fetch;
  const token = argValue(args, '--cf-token');
  const zoneName = argValue(args, '--zone');
  if (!token || !zoneName) throw new Error('usage: harness dns list --cf-token <token> --zone <domain>');
  const zones = await cfRequest(token, 'GET', `/zones?name=${encodeURIComponent(zoneName)}`, undefined, fetchImpl);
  const zone = zones.result[0];
  if (!zone) throw new Error(`zone not found: ${zoneName}`);
  const records = await cfRequest(token, 'GET', `/zones/${zone.id}/dns_records?per_page=100`, undefined, fetchImpl);
  for (const record of records.result) {
    logger(`  ${record.type}  ${record.name}  ->  ${String(record.content).slice(0, 60)}`);
  }
  return records.result;
}
