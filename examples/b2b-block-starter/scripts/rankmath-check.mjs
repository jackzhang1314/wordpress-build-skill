import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const p=JSON.parse(await readFile('.lab/b2b-starter-latest.json','utf8'));
assert.equal(p.urls.primary,'http://127.0.0.1:9490');assert.equal(p.urls.reuse,'http://127.0.0.1:9491');
const out='docs/acceptance/rankmath-free';await mkdir(out,{recursive:true});
const wp=(id,code)=>execFileSync('docker',['compose','-p',p.project,'-f',p.compose,'exec','-T',id,'php','/tools/wp','--allow-root','eval',code],{encoding:'utf8',timeout:60000});
const report={testedAt:new Date().toISOString(),sites:{}};
for(const id of ['primary','reuse']){
 const state=JSON.parse(wp(id,`echo wp_json_encode(['version'=>RANK_MATH_VERSION,'pro'=>defined('RANK_MATH_PRO_VERSION'),'active'=>get_option('active_plugins'),'modules'=>get_option('rank_math_modules'),'skipAccount'=>get_option('rank_math_registration_skip'),'frontend'=>isset(rank_math()->frontend),'preview'=>get_option('blog_public'),'sitemap'=>get_option('rank-math-options-sitemap'),'titles'=>get_option('rank-math-options-titles'),'syntax'=>token_get_all(file_get_contents(WP_PLUGIN_DIR.'/site-model/seo.php'),TOKEN_PARSE)!==[]]);`));
 assert.equal(state.version,'1.0.278');assert.equal(state.pro,false);assert.ok(state.skipAccount&&state.frontend&&state.syntax);assert.equal(String(state.preview),'0');assert.deepEqual(state.active.filter(n=>!['advanced-custom-fields/acf.php','fluentform/fluentform.php','site-model/site-model.php'].includes(n)),['seo-by-rank-math/rank-math.php']);assert.deepEqual([...state.modules].sort(),['404-monitor','acf','redirections','rich-snippet','sitemap']);
 assert.equal(state.titles.pt_hd_product_default_rich_snippet,'off');assert.equal(state.sitemap.tax_hd_category_sitemap,'on');
 const html=await(await fetch(p.urls[id])).text();assert.equal((html.match(/<title>/g)||[]).length,1);assert.equal((html.match(/<meta[^>]*name=["']robots["']/g)||[]).length,1);assert.ok(html.includes('noindex'));assert.ok(html.includes('Rank Math'));
 report.sites[id]=state;
}
const id=JSON.parse(await readFile(p.run+'/artifacts-primary/site.json','utf8')).products.yhd08;
const original=JSON.parse(wp('primary',`echo wp_json_encode(['title'=>get_post_meta(${id},'rank_math_title',false),'description'=>get_post_meta(${id},'rank_math_description',false),'url'=>get_permalink(${id})]);`));
try{
 wp('primary',`update_post_meta(${id},'rank_math_title','Rank Math title acceptance');update_post_meta(${id},'rank_math_description','Rank Math description acceptance.');`);
 const html=await(await fetch(original.url)).text();assert.ok(html.includes('<title>Rank Math title acceptance</title>'));assert.ok(html.includes('content="Rank Math description acceptance."'));
 const data=[...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
 const nodes=data.flatMap(d=>d['@graph']??[d]);assert.ok(!nodes.some(n=>['Product','Article'].includes(n['@type'])));assert.ok(!JSON.stringify(data).includes('aggregateRating'));report.metadataReadback={title:true,description:true,productSchemaNotFabricated:true,writeMethod:'WP post meta API; frontend readback'};
}finally{const encoded=Buffer.from(JSON.stringify(original)).toString('base64');wp('primary',`$v=json_decode(base64_decode('${encoded}'),true);foreach(['title','description'] as $key){delete_post_meta(${id},'rank_math_'.$key);foreach($v[$key] as $value)add_post_meta(${id},'rank_math_'.$key,$value);}`);}
const manifest=JSON.parse(await readFile('.agents/skills/wordpress-builder/assets/block-starter/manifest.json','utf8'));
for(const [file,hash]of Object.entries(manifest.files))assert.equal(createHash('sha256').update(await readFile('examples/b2b-block-starter/'+file)).digest('hex'),hash,file);
report.packageVerified=true;await writeFile(out+'/integration.json',JSON.stringify(report,null,2));console.log('Rank Math Free: both sites, modules, single metadata owner, field readback and package checks passed.');
