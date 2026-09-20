import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const lab=JSON.parse(await readFile(process.env.WP_LAB_POINTER??'.lab/hongda-latest.json','utf8'));
const c=JSON.parse(await readFile(join(lab.artifacts,'connection.json'),'utf8'));
const site=JSON.parse(await readFile(join(lab.artifacts,'site.json'),'utf8'));
assert.ok(['http://127.0.0.1:9464','http://127.0.0.1:9466','http://127.0.0.1:9468'].includes(c.site));
const headers={Authorization:'Basic '+Buffer.from(c.username+':'+c.password).toString('base64'),'Content-Type':'application/json'};
async function api(path,method='GET',body){const r=await fetch(c.site+'/wp-json/wp/v2/'+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(30000)});assert.ok(r.ok,`${path}: ${r.status}`);return r.json();}
const checks={},routes=[];
function check(name,ok){checks[name]=Boolean(ok);assert.ok(ok,name);}
async function page(path,status=200){const r=await fetch(new URL(path,c.site),{signal:AbortSignal.timeout(30000)});const html=await r.text();assert.equal(r.status,status,path);assert.equal((html.match(/<h1\b/g)||[]).length,1,path+' H1');assert.equal((html.match(/<!doctype html>/gi)||[]).length,1,path+' document');assert.ok(!/Fatal error|Warning:.*on line/.test(html),path+' PHP');routes.push({path:new URL(path,c.site).pathname,status});return html;}
const products=await api('hd_product?per_page=100&context=edit');
const terms=await api('hd_category?per_page=100');
const solutions=await api('hd_solution?per_page=100');
const pages=await api('pages?per_page=100');
const posts=await api('posts?per_page=100');
check('expected_native_objects',products.length===19&&terms.length===5&&solutions.length===11&&site.posts.length===9);
check('classic_theme_with_acf',site.isBlockTheme===false&&site.acf==='6.8.9');
const html=await page('/');check('no_compiled_reference_app',!html.includes('index-XbKuH3yj')&&!html.includes('code.tidio.co'));
check('local_noindex_and_canonical',html.includes('noindex')&&html.includes('rel="canonical"'));
for(const entry of [...products,...terms,...solutions,...pages,...posts])await page(entry.link);
for(const url of ['/equipment/','/equipment/page/2/','/equipment/page/3/','/industry/','/blog/','/?s=excavator'])await page(url);
await page('/this-does-not-exist/',404);
const first=await page('/equipment/'),second=await page('/equipment/page/2/');
const firstLinks=products.filter(p=>first.includes(`href="${p.link}"`)).map(p=>p.id),secondLinks=products.filter(p=>second.includes(`href="${p.link}"`)).map(p=>p.id);
check('distinct_pagination',firstLinks.length===9&&secondLinks.length===9&&!firstLinks.some(id=>secondLinks.includes(id)));
const filtered=await page('/equipment/?max_weight=1');
const shown=products.filter(p=>filtered.includes(`href="${p.link}"`));check('weight_filter',shown.length>0&&shown.every(p=>Number(p.acf.weight)<=1));
const cat=terms.find(t=>t.slug==='construction-excavator');check('empty_filter', (await page(cat.link+'?max_weight=1')).includes('No machines match'));
const product=products.find(p=>p.id===site.products.yhd08);
const task=join(lab.run,'content-task'),planFile=join(lab.run,'content-plan.json');
const env={...process.env,WP_URL:c.site,WP_USERNAME:c.username,WP_APP_PASSWORD:c.password,WP_ALLOW_LOCAL_HTTP:'1'};
function cli(command,...args){const r=JSON.parse(execFileSync(process.execPath,[resolve('.agents/skills/wordpress-builder/scripts/wp.mjs'),command,'--task',task,...args],{env,encoding:'utf8',timeout:90000,stdio:['ignore','pipe','pipe']}));assert.ok(r.ok);return r.result;}
try {
 const before=cli('read-content','--type','hd_product','--id',String(product.id));
 await writeFile(planFile,JSON.stringify({type:'hd_product',id:product.id,expectedVersion:before.version,acf:{model:'CMS VERIFIED MODEL'}}));
 const plan=cli('content-plan','--plan',planFile);const result=cli('content-apply','--id',plan.planId??plan.hash);const replay=cli('content-apply','--id',plan.planId??plan.hash);
 check('skill_edit_and_safe_replay',result.version===replay.version);
 check('acf_field_renders',(await page(product.link)).includes('CMS VERIFIED MODEL'));
 await api('hd_product/'+product.id,'POST',{content:'<!-- wp:paragraph --><p>CMS body readback verified.</p><!-- /wp:paragraph -->',featured_media:site.media['wheel-loader']});
 const updated=await page(product.link);check('native_body_renders',updated.includes('CMS body readback verified.'));
 const image=await api('media/'+site.media['wheel-loader']);check('native_thumbnail_renders',updated.includes(image.media_details.sizes.large?.source_url ?? image.source_url));
} finally {await api('hd_product/'+product.id,'POST',{acf:product.acf,content:product.content.raw,featured_media:product.featured_media});}
const contact=await api('pages/'+site.pages.contact+'?context=edit');
try {await api('pages/'+contact.id,'POST',{slug:'inquiry-test'});check('contact_link_follows_id',(await page(product.link)).includes('/inquiry-test/?product_id='+product.id));}
finally {await api('pages/'+contact.id,'POST',{slug:contact.slug});}
check('valid_context',(await page(contact.link+'?product_id='+product.id)).includes('Your selected machine'));
check('invalid_context_ignored',!(await page(contact.link+'?product_id=999999')).includes('Your selected machine'));
const source=[];
async function files(dir,base=''){for(const f of await readdir(dir,{withFileTypes:true})){const name=join(base,f.name);if(f.isDirectory())await files(join(dir,f.name),name);else {const bytes=await readFile(join(dir,f.name));const runtime=await readFile(join(lab.run,'source',name));assert.deepEqual(bytes,runtime,'runtime source '+name);source.push({path:name,sha256:createHash('sha256').update(bytes).digest('hex')});}}}
await files('examples/hongda-wordpress');check('runtime_matches_source',true);
const output=process.env.WP_ACCEPTANCE_DIR??'docs/acceptance/0920-hongda';
await mkdir(output,{recursive:true});
await writeFile(join(output,'runtime.json'),JSON.stringify({testedAt:new Date().toISOString(),site,checks,routes,source},null,2));
console.log(JSON.stringify({checks,routes:routes.length,sourceFiles:source.length},null,2));
