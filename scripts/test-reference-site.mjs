// Integration against the isolated server created by reference-site.mjs.
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const lab = JSON.parse(await readFile('.lab/reference-latest.json', 'utf8'));
const c = JSON.parse(await readFile(join(lab.artifacts, 'connection.json'), 'utf8'));
const site = JSON.parse(await readFile(join(lab.artifacts, 'site.json'), 'utf8'));
assert.equal(c.site, 'http://127.0.0.1:9463');
const headers = { Authorization: 'Basic ' + Buffer.from(c.username + ':' + c.password).toString('base64') };
const checks = {};
const routes = [];
function check(name, condition) { checks[name] = Boolean(condition); assert.ok(condition, name); }
async function api(path, method = 'GET', body) {
  const response = await fetch(c.site + '/wp-json/wp/v2/' + path, { method, headers: { ...headers, 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(30000) });
  assert.ok(response.ok, path + ' status=' + response.status + ': ' + (response.ok ? '' : await response.text()));
  return response.json();
}
async function page(path, expected = 200) {
  const response = await fetch(new URL(path, c.site), { signal: AbortSignal.timeout(30000) });
  const html = await response.text();
  assert.equal(response.status, expected, path);
  assert.equal((html.match(/<h1\b/g) || []).length, 1, 'single H1: ' + path);
  assert.equal((html.match(/<!doctype html>/gi) || []).length, 1, 'single document: ' + path);
  assert.ok(!/Fatal error|Warning:.*on line/.test(html), 'PHP diagnostics: ' + path);
  routes.push({ path, status: response.status, h1: 1, document: 1 });
  return html;
}
const task = join(lab.run, 'content-task');
const env = { ...process.env, WP_URL: c.site, WP_USERNAME: c.username, WP_APP_PASSWORD: c.password, WP_ALLOW_LOCAL_HTTP: '1' };
function cli(command, ...args) {
  const raw = execFileSync(process.execPath, [resolve('.agents/skills/wordpress-builder/scripts/wp.mjs'), command, '--task', task, ...args], { env, encoding: 'utf8', timeout: 90000, stdio: ['ignore', 'pipe', 'pipe'] });
  const result = JSON.parse(raw); assert.ok(result.ok); return result.result;
}
check('exact_versions_and_classic_theme', site.wordpress === '7.1.1' && site.php.startsWith('8.3.') && site.isBlockTheme === false && site.theme === 'site-reference');
const product = site.products[0];
const before = cli('read-content', '--type', 'site_product', '--id', String(product));
const planFile = join(lab.run, 'edit.json');
await writeFile(planFile, JSON.stringify({ type: 'site_product', id: product, expectedVersion: before.version, acf: { material: 'Verified editable composite' } }));
const plan = cli('content-plan', '--plan', planFile);
const planId = plan.planId ?? plan.hash;
assert.ok(planId, JSON.stringify(plan));
const edited = cli('content-apply', '--id', planId);
const replay = cli('content-apply', '--id', planId);
check('cli_field_update_and_safe_replay', edited.version === replay.version);
const productRecord = await api('site_product/' + product + '?context=edit');
check('unrelated_body_preserved', productRecord.content.raw === before.values.content);
check('field_update_renders', (await page(productRecord.link)).includes('Verified editable composite'));
await api('site_product/' + product, 'POST', { content: '<!-- wp:paragraph --><p>Operator-edited product body.</p><!-- /wp:paragraph -->' });
check('native_body_edit_renders', (await page(productRecord.link)).includes('Operator-edited product body.'));
// A tiny generated fixture tests the attachment pipeline; not a customer product photograph.
const imagePath = join(lab.run, 'attachment-fixture.png');
await writeFile(imagePath, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j8ZkAAAAASUVORK5CYII=', 'base64'));
const mediaPlan = join(lab.run, 'media.json');
await writeFile(mediaPlan, JSON.stringify({ file: imagePath, title: 'Attachment test fixture', alt: 'Generated attachment test fixture' }));
const media = cli('upload-media', '--plan', mediaPlan);
const fresh = cli('read-content', '--type', 'site_product', '--id', String(product));
await writeFile(planFile, JSON.stringify({ type: 'site_product', id: product, expectedVersion: fresh.version, featuredMedia: media.id }));
const mediaChange = cli('content-plan', '--plan', planFile);
cli('content-apply', '--id', mediaChange.planId ?? mediaChange.hash);
check('featured_image_renders', (await page(productRecord.link)).includes('Generated attachment test fixture'));
const collection = await api('product_collection/' + site.collection, 'POST', { acf: { collection_intro: 'Verified collection introduction' } });
check('taxonomy_field_edit_renders', (await page(collection.link)).includes('Verified collection introduction'));
for (const path of ['/', '/products/', '/products/page/2/', '/about/', '/journal/', '/journal/page/2/', '/contact/']) await page(path);
for (const id of site.products.slice(1)) await page((await api('site_product/' + id)).link);
for (const id of site.articles) await page((await api('posts/' + id)).link);
check('product_search', (await page('/?s=Linen')).includes('Linen panel'));
await page('/not-a-real-page/', 404);
const home = await page('/');
check('seo_and_local_noindex', /rel=["']canonical["']/.test(home) && /name=["']robots["'][^>]*noindex/.test(home));
const urls = new Set();
for (const [, href] of home.matchAll(/href=["']([^"']+)["']/g)) {
  const target = new URL(href.replaceAll('&amp;', '&'), c.site);
  if (target.origin === c.site && !target.pathname.startsWith('/wp-')) { target.hash = ''; urls.add(target.href); }
}
for (const url of urls) { const response = await fetch(url); await response.arrayBuffer(); assert.ok(response.ok, url); }
check('homepage_internal_links', urls.size > 5);
const archiveFirst = await page('/products/');
const archiveSecond = await page('/products/page/2/');
const productLinks = await Promise.all(site.products.map(async id => (await api('site_product/' + id)).link));
const first = productLinks.filter(link => archiveFirst.includes('href="' + link + '"'));
const second = productLinks.filter(link => archiveSecond.includes('href="' + link + '"'));
check('pagination_distinct_products', first.length === 2 && second.length === 1 && !second.some(link => first.includes(link)));
await api('pages/' + site.pages.contact, 'POST', { slug: 'enquire' });
try {
  const linked = await page(productRecord.link);
  check('contact_links_follow_page_identity', linked.includes('/enquire/?product=') && linked.includes('href="' + c.site + '/enquire/"'));
} finally { await api('pages/' + site.pages.contact, 'POST', { slug: 'contact' }); }
const preserved = await api('site_product/' + product + '?context=edit');
await api('plugins/site-model/site-model', 'POST', { status: 'inactive' });
try {
  check('theme_renders_without_model', (await page('/')).includes('Materials for considered spaces.'));
} finally { await api('plugins/site-model/site-model', 'POST', { status: 'active' }); }
const restored = await api('site_product/' + product + '?context=edit');
check('plugin_reactivation_preserves_content', restored.content.raw === preserved.content.raw && restored.acf.material === preserved.acf.material);
check('permalinks_restored_after_activation', (await page(restored.link)).includes('Verified editable composite'));
const files = [];
async function hashFiles(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await hashFiles(path);
    else {
      const relative = path.slice(resolve('.agents/skills/wordpress-builder/assets/php-reference').length + 1);
      const bytes = await readFile(path);
      assert.ok(bytes.equals(await readFile(join(lab.run, 'source', relative))), 'Running source drift: ' + relative);
      files.push({ path: relative, sha256: createHash('sha256').update(bytes).digest('hex') });
    }
  }
}
await hashFiles(resolve('.agents/skills/wordpress-builder/assets/php-reference'));
const report = { recordedAt: new Date().toISOString(), site, checks, routes, internalLinks: urls.size, files, limitations: ['Playground SQLite, not production MySQL', 'Form UI and real editor checked separately', 'Mail captured locally, no external delivery'] };
await mkdir('docs/acceptance/0920-reference', { recursive: true });
await writeFile('docs/acceptance/0920-reference/runtime.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify({ checks, routes: routes.length, internalLinks: urls.size }));
