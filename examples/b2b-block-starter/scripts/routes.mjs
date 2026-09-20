import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const base='http://127.0.0.1:9490',urls=new Set([base+'/',base+'/equipment/',base+'/industry/']);
for(const type of ['pages','posts','hd_product','hd_solution','hd_category']){const r=await fetch(base+'/wp-json/wp/v2/'+type+'?per_page=100');assert.ok(r.ok);for(const item of await r.json())urls.add(item.link);}
const results=[];
for(const url of urls){assert.equal(new URL(url).origin,base);const r=await fetch(url,{signal:AbortSignal.timeout(15000)});const html=await r.text();const row={url,status:r.status,h1:(html.match(/<h1\b/g)||[]).length,noindex:/noindex/.test(html),hasNav:html.includes('Main navigation'),hasForm:html.includes('frm-fluent-form'),fatal:/Fatal error|Warning:.*on line/.test(html)};results.push(row);assert.ok(row.status===200&&row.h1===1&&row.noindex&&row.hasNav&&row.hasForm&&!row.fatal,url);}
await writeFile('docs/acceptance/b2b-redesign/routes.json',JSON.stringify({testedAt:new Date().toISOString(),results},null,2));console.log(results.length+' published routes passed.');
