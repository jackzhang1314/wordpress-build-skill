import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const lab=JSON.parse(await readFile(process.env.WP_RESTORED_POINTER??'.lab/hongda-restored-latest.json','utf8'));
const c=JSON.parse(await readFile(join(lab.artifacts,'connection.json'),'utf8'));
const manifest=JSON.parse(await readFile(join(lab.snapshot,'manifest.json'),'utf8'));
assert.ok(['http://127.0.0.1:9465','http://127.0.0.1:9467'].includes(c.site));
const headers={Authorization:'Basic '+Buffer.from(c.username+':'+c.password).toString('base64')};
const expected=JSON.parse(execFileSync('python3',['-c',`import sqlite3,json,sys
c=sqlite3.connect('file:'+sys.argv[1]+'?mode=ro',uri=True)
c.row_factory=sqlite3.Row
posts=[dict(r) for r in c.execute("SELECT ID,post_type,post_title,post_content,post_excerpt,post_name FROM wp_posts WHERE post_status='publish' AND post_type IN ('hd_product','hd_solution','post','page') ORDER BY ID")]
meta={str(r['post_id'])+':'+r['meta_key']:r['meta_value'] for r in c.execute("SELECT post_id,meta_key,meta_value FROM wp_postmeta WHERE meta_key IN ('model','weight','specifications','working_range','dimensions','_thumbnail_id')")}
entries=[{'id':r['id'],'productId':json.loads(r['response']).get('product_id')} for r in c.execute('SELECT id,response FROM wp_fluentform_submissions ORDER BY id')]
print(json.dumps({'posts':posts,'meta':meta,'entries':entries}))
`,join(lab.snapshot,'database.sqlite')],{encoding:'utf8'}));
async function api(path){const r=await fetch(c.site+'/wp-json/'+path,{headers,redirect:'error',signal:AbortSignal.timeout(30000)});assert.ok(r.ok,path+' '+r.status);return r.json();}
const types={hd_product:'hd_product',hd_solution:'hd_solution',post:'posts',page:'pages'};
let fields=0;
for(const [type,endpoint] of Object.entries(types)){
 const rows=await api('wp/v2/'+endpoint+'?context=edit&per_page=100');
 for(const p of expected.posts.filter(p=>p.post_type===type)){
  const actual=rows.find(x=>x.id===p.ID);assert.ok(actual,'Preserved ID '+p.ID);
  for(const [key,value] of [['title',p.post_title],['content',p.post_content],['excerpt',p.post_excerpt]])assert.equal(actual[key].raw,value,`${p.ID} ${key}`);
  assert.equal(actual.slug,p.post_name);
  if(type==='hd_product')for(const name of ['model','weight','specifications','working_range','dimensions']){assert.equal(String(actual.acf[name]),expected.meta[p.ID+':'+name],`${p.ID} ${name}`);fields++;}
  if(expected.meta[p.ID+':_thumbnail_id'])assert.equal(actual.featured_media,Number(expected.meta[p.ID+':_thumbnail_id']));
 }
}
for(const f of manifest.uploads)assert.equal(createHash('sha256').update(await readFile(join(lab.run,'uploads',f.path))).digest('hex'),f.sha256,f.path);
const entries=await api('hongda-lab/v1/receipts');
assert.deepEqual(entries.map(({id,productId})=>({id,productId})).sort((a,b)=>a.id-b.id),expected.entries);
const version=JSON.parse(await readFile(join(lab.artifacts,'restored.json'),'utf8'));
assert.equal(version.wordpress,manifest.wordpress);assert.equal(version.php,manifest.php);
const checks=[];
for(const path of ['/','/equipment/','/equipment/model/yhd08/','/industry/agriculture/','/our-story/','/contact-us/','/not-a-page/']){const r=await fetch(c.site+path,{redirect:'error',signal:AbortSignal.timeout(30000)});const html=await r.text();assert.equal(r.status,path==='/not-a-page/'?404:200,path);assert.equal((html.match(/<h1\b/g)||[]).length,1);assert.ok(!/Fatal error|Warning:.*on line/.test(html));checks.push({path,status:r.status});}
// The snapshot file itself must remain untouched by boot and validation.
assert.equal(createHash('sha256').update(await readFile(join(lab.snapshot,'database.sqlite'))).digest('hex'),manifest.databaseSha256);
const evidence={testedAt:new Date().toISOString(),scope:'local-sqlite-restore-only',wordpress:version.wordpress,php:version.php,objectsPreserved:expected.posts.length,acfFieldsPreserved:fields,uploadsVerified:manifest.uploads.length,enquiriesPreserved:entries.length,snapshotDatabaseUnchanged:true,routes:checks,productionMysqlRecovery:'not-tested'};
const output=process.env.WP_ACCEPTANCE_DIR??'docs/acceptance/0920-hongda-iteration2';await mkdir(output,{recursive:true});await writeFile(join(output,'recovery.json'),JSON.stringify(evidence,null,2));console.log(JSON.stringify(evidence,null,2));
