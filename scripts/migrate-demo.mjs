// Scoped, reversible correction of the existing TerraLift fixture. No other host.
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const c = JSON.parse(await readFile('.lab/artifacts/connection.json', 'utf8'));
if (c.site !== 'http://127.0.0.1:9462') throw new Error('This migration is lab-only');
const dir = '.lab/artifacts/remediation-migration';
await mkdir(dir, { recursive: true, mode: 0o700 });
const headers = { Authorization: 'Basic ' + Buffer.from(c.username + ':' + c.password).toString('base64'), 'Content-Type': 'application/json' };
async function request(route, method = 'GET', body) {
  const r = await fetch(c.site + '/wp-json/wp/v2/' + route, { headers, method, redirect: 'error', body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(15000) });
  if (!r.ok) throw new Error(`${route}: HTTP ${r.status}`);
  return r.json();
}
const fingerprint = data => createHash('sha256').update(JSON.stringify([data.id, data.content?.raw, data.acf, data.featured_media, data.modified])).digest('hex');
async function patch(route, changes) {
  const file = `${dir}/${route.replaceAll('/', '-')}.json`;
  let record;
  try { await access(file); record = JSON.parse(await readFile(file, 'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (!record) {
    const before = await request(route + '?context=edit');
    record = { route, before, changes, fingerprint: fingerprint(before), status: 'planned' };
    await writeFile(file, JSON.stringify(record, null, 2), { mode: 0o600 });
  }
  if (record.status === 'verified') return;
  if (record.status === 'submitted') throw new Error(`Unknown write outcome for ${route}; inspect and reconcile before retry`);
  const current = await request(route + '?context=edit');
  if (fingerprint(current) !== record.fingerprint) throw new Error(`Concurrent edit: ${route}`);
  record.status = 'submitted';
  await writeFile(file, JSON.stringify(record, null, 2));
  await request(route, 'POST', record.changes);
  const after = await request(route + '?context=edit');
  for (const [key, value] of Object.entries(record.changes)) {
    if (key === 'acf') {
      for (const [field, expected] of Object.entries(value)) if (after.acf[field] !== expected) throw new Error(`Readback mismatch: ${field}`);
    } else if ((key === 'content' ? after.content.raw : after[key]) !== value) throw new Error(`Readback mismatch: ${key}`);
  }
  record.status = 'verified'; record.afterFingerprint = fingerprint(after);
  await writeFile(file, JSON.stringify(record, null, 2));
  console.log('Verified', route);
}
const products = await request('oct_product?context=edit&per_page=100');
for (const product of products) {
  if (!/^tl-(e08|e20|e35|l10|b30|s50)$/.test(product.slug)) continue;
  const changes = { acf: { oct_cta_url: c.site + '/terralift-contact/' } };
  // This exact fixture paragraph identifies the old generated duplicate block.
  if (product.content.raw.includes('This is an original demo profile for testing the WordPress content model.')) {
    changes.content = '<!-- wp:heading -->\n<h2 class="wp-block-heading">Plan your configuration</h2>\n<!-- /wp:heading -->\n<!-- wp:paragraph -->\n<p>Specifications above are illustrative demo data, not verified manufacturer specifications. For a real enquiry, confirm working space, attachments, destination requirements, transport dimensions and commercial terms.</p>\n<!-- /wp:paragraph -->';
  }
  await patch('oct_product/' + product.id, changes);
}
await patch('pages/67', { acf: { hero_eyebrow: 'Equipment for smaller worksites', hero_title: 'Find your next compact machine', hero_intro: 'Explore excavators, loaders and skid steers by application. Compare example specifications, then build an enquiry around the work you need to do.', hero_image: 109, cta_url: c.site + '/products/', stat_1_value: '', stat_2_value: '', stat_3_value: '', stat_4_value: '' } });
await patch('pages/74', { acf: { hero_title: 'Tell us about your next project', hero_intro: 'Choose a model, describe your application and include your destination. This is a demonstration enquiry; no real quotation or external message will be sent.', email: 'sales@example.com', phone: '', whatsapp: '', address: 'Demonstration site — no physical sales office', hours: 'Demo only', form_title: 'Try an equipment enquiry' } });
