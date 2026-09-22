import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
const c = JSON.parse(await readFile('.lab/artifacts/connection.json', 'utf8'));
if (c.site !== 'http://127.0.0.1:9462') throw new Error('Lab-only audit');
const auth = {Authorization:'Basic '+Buffer.from(c.username+':'+c.password).toString('base64')};
const records = [];
for (const type of ['pages','oct_product','oct_case','oct_product_category']) {
  const r = await fetch(`${c.site}/wp-json/wp/v2/${type}?per_page=100`, {headers:auth,redirect:'error'});
  if (!r.ok) throw new Error('Cannot read '+type);
  records.push(...await r.json());
}
const urls = new Set([c.site+'/',c.site+'/products/',c.site+'/terralift-equipment/', ...records.map(x=>x.link)]);
const results = [];
const links = new Set();
for (const url of urls) {
  const r = await fetch(url,{signal:AbortSignal.timeout(20000)});
  const html = await r.text();
  const map = html.includes('type="importmap"');
  const nav = html.includes('wp-block-navigation__responsive-container-open');
  results.push({url,finalUrl:r.url,status:r.status,h1:(html.match(/<h1\b/g)||[]).length,importMap:map,navigation:nav,title:html.match(/<title>(.*?)<\/title>/s)?.[1],description:/<meta name="description"/.test(html),canonical:/<link rel="canonical"/.test(html),openGraph:/property="og:title"/.test(html),noindex:/name=['"]robots['"][^>]*noindex/.test(html)});
  for (const [,href] of html.matchAll(/href="([^"]+)"/g)) {
    const decoded=href.replaceAll('&amp;','&');
    const target = new URL(decoded,url);
    if(target.origin===c.site && !target.pathname.includes('/wp-') && !/\.(css|xml|json|jpg|png|woff2)$/.test(target.pathname)) {target.hash='';links.add(target.href);}
  }
}
const broken=[];
for(const url of links){ const r=await fetch(url,{signal:AbortSignal.timeout(20000)}); await r.arrayBuffer(); if(r.status>=400) broken.push({url,status:r.status}); }
const drift=[]; const files=[];
for(const [source,destination] of [['examples/terralift-ui-theme','.lab/wordpress/wp-content/themes/terralift-ui'],['examples/octopus-site','.lab/wordpress/wp-content/plugins/octopus-site']]){
 for(const entry of await readdir(source,{recursive:true,withFileTypes:true})){
  if(!entry.isFile())continue;
  const file=resolve(entry.parentPath,entry.name); const rel=file.slice(resolve(source).length+1);
  const bytes=await readFile(file);const sha256=createHash('sha256').update(bytes).digest('hex');
  const remote=await readFile(resolve(destination,rel));
  if(!bytes.equals(remote))drift.push(source+'/'+rel);
  files.push({path:source+'/'+rel,sha256});
 }
}
const report={recordedAt:new Date().toISOString(),environment:JSON.parse(await readFile('.lab/artifacts/environment.json','utf8')),routes:results,internalLinksChecked:links.size,brokenLinks:broken,sourceDrift:drift,files};
await mkdir('docs/acceptance/0919-remediation',{recursive:true});
await writeFile('docs/acceptance/0919-remediation/runtime.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({routes:results.length,links:links.size,broken,drift,missingMaps:results.filter(r=>r.navigation&&!r.importMap).map(r=>r.url),badH1:results.filter(r=>r.h1!==1).map(r=>({url:r.url,h1:r.h1}))},null,2));
if(broken.length||drift.length||results.some(r=>r.status!==200 || (r.navigation&&!r.importMap)))process.exitCode=1;
