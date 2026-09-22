import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {join} from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const pointer=JSON.parse(await readFile('.lab/b2b-starter-latest.json','utf8'));
await readFile(join(pointer.run,'ready.json'));
const output='docs/acceptance/b2b-redesign';await mkdir(output,{recursive:true});
const dc=(...args)=>execFileSync('docker',['compose','-p',pointer.project,'-f',pointer.compose,...args],{encoding:'utf8',timeout:60000,maxBuffer:16*1024*1024});
const wp=(id,code)=>dc('exec','-T',id,'php','/tools/wp','--allow-root','--path=/var/www/html','eval',code);
const manifest=JSON.parse(await readFile('.agents/skills/wordpress-builder/assets/block-starter/manifest.json','utf8'));
for(const [name,hash] of Object.entries(manifest.files)){for(const root of [pointer.source,'.agents/skills/wordpress-builder/assets/block-starter'])assert.equal(createHash('sha256').update(await readFile(join(root,name))).digest('hex'),hash,name+' package/source drift');}
const evidence={testedAt:new Date().toISOString(),scope:'isolated local clean installations',sites:{}};
for(const id of ['primary','reuse']){
 const c=JSON.parse(await readFile(join(pointer.run,'artifacts-'+id,'connection.json'),'utf8'));
 assert.equal(c.site,pointer.urls[id]);assert.ok(/^http:\/\/127\.0\.0\.1:949[01]$/.test(c.site));
 const site=JSON.parse(await readFile(join(pointer.run,'artifacts-'+id,'site.json'),'utf8'));
 const headers={Authorization:'Basic '+Buffer.from(c.username+':'+c.password).toString('base64'),'Content-Type':'application/json'};
 async function api(path,method='GET',body){const r=await fetch(c.site+'/wp-json/wp/v2/'+path,{method,headers,body:body?JSON.stringify(body):undefined,redirect:'error',signal:AbortSignal.timeout(20000)});assert.ok(r.ok,path+' '+r.status);return r.json();}
 async function page(url,status=200){const r=await fetch(new URL(url,c.site),{redirect:'manual',signal:AbortSignal.timeout(20000)});const html=await r.text();assert.equal(r.status,status,url);if(status===200){assert.equal((html.match(/<h1\b/g)||[]).length,1,url+' h1');assert.ok(!/Fatal error|Warning:.*on line/.test(html));assert.ok(/noindex/.test(html),'preview noindex');}return html;}
 const checks={};evidence.sites[id]={runtime:JSON.parse(await readFile(join(pointer.run,'artifacts-'+id,'runtime.json'),'utf8')),checks};
 assert.equal(evidence.sites[id].runtime.blockTheme,true);
 const product=await api('hd_product/'+Object.values(site.products)[0]+'?context=edit');
 const category=await api('hd_category/'+Object.values(site.categories)[0]+'?context=edit');
 for(const path of ['/','/equipment/',product.link,category.link,'/contact-us/'])await page(path);
 await page('/does-not-exist/',404);checks.routes=true;
 const models=await api('hd_product?per_page=100&orderby=title&order=asc');const catalogue=await page('/equipment/');
 for(const m of models.slice(0,9)){assert.ok(catalogue.includes(m.acf.model),'ACF Query Loop model '+m.acf.model);}
 checks.officialAcfBindingsInQueryLoop=true;
 try{
  for(const template of ['product-standard','product-editorial']){
   await api('hd_product/'+product.id,'POST',{template});const saved=await api('hd_product/'+product.id+'?context=edit');assert.equal(saved.template,template);assert.deepEqual(saved.acf,product.acf);assert.equal(saved.link,product.link);assert.equal(saved.content.raw,product.content.raw);assert.equal(saved.featured_media,product.featured_media);
   const html=await page(product.link);assert.equal(html.includes('editorial-hero'),template==='product-editorial');assert.ok(html.includes('product_id='+product.id));assert.ok(html.includes(product.acf.model));
  }
  const sentinel='LOCAL-EDIT-'+id;await api('hd_product/'+product.id,'POST',{acf:{model:sentinel}});assert.ok((await page(product.link)).includes(sentinel));assert.ok((await page('/equipment/')).includes(sentinel));
  checks.templatesAndAcfReadback=true;
 }finally{await api('hd_product/'+product.id,'POST',{template:product.template||'',acf:{model:product.acf.model}});}
 try{
  for(const layout of ['catalogue','editorial']){await api('hd_category/'+category.id,'POST',{acf:{category_layout:layout}});assert.equal((await api('hd_category/'+category.id+'?context=edit')).acf.category_layout,layout);assert.equal((await page(category.link)).includes('APPLICATION-LED SELECTION'),layout==='editorial');}
  checks.categoryLayouts=true;
 }finally{await api('hd_category/'+category.id,'POST',{acf:{category_layout:category.acf.category_layout||'catalogue'}});}
 let created;
 try{created=await api('hd_product','POST',{title:'Acceptance draft '+id,status:'draft',template:'product-editorial',acf:{model:'TEST-'+id,weight:0.5,specifications:'Capacity | Mock'}});await page(created.link,404);const published=await api('hd_product/'+created.id,'POST',{status:'publish'});assert.ok((await page(published.link)).includes('TEST-'+id));checks.newDraftAndPublish=true;}finally{if(created)await api('hd_product/'+created.id,'DELETE');}
 const patterns=JSON.parse(wp(id,"echo wp_json_encode(array_values(array_filter(WP_Block_Patterns_Registry::get_instance()->get_all_registered(),static fn($p)=>str_starts_with($p['name'],'b2b-equipment/'))));"));
 assert.ok(patterns.some(p=>p.name==='b2b-equipment/selection-guide'));checks.patternsRegistered=patterns.map(p=>p.name);
 if(id==='primary'){const next=await page('/equipment/page/2/');assert.ok(/\/equipment\/page\/2\//.test(next));assert.ok(!next.includes('href="'+product.link+'"'));await page('/equipment/page/999/',404);checks.pagination=true;}
 const templates=JSON.parse(wp(id,"echo wp_json_encode(wp_get_theme()->get_page_templates(null,'hd_product'));"));assert.ok(templates['product-standard']&&templates['product-editorial']);
 checks.extensibleProductTemplates=JSON.parse(wp(id,"$custom=new WP_Block_Template();$custom->source='custom';$custom->has_theme_file=false;$custom->is_custom=true;$declared=clone $custom;$declared->source='theme';$declared->has_theme_file=true;$declared->post_types=['hd_product'];$page=clone $declared;$page->post_types=['page'];$hierarchy=clone $custom;$hierarchy->source='theme';$hierarchy->has_theme_file=true;echo wp_json_encode(array_map('Hongda\\\\Theme\\\\product_template_available',[$custom,$declared,$page,$hierarchy]));"));
 assert.deepEqual(checks.extensibleProductTemplates,[true,true,false,false]);
 checks.phpSyntax=JSON.parse(wp(id,"$n=0;foreach([get_stylesheet_directory(),WP_PLUGIN_DIR.'/site-model'] as $dir){foreach(new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir)) as $f){if($f->isFile()&&$f->getExtension()==='php'){token_get_all(file_get_contents($f->getPathname()),TOKEN_PARSE);$n++;}}}echo wp_json_encode($n);"));
 checks.databaseTemplateOverrides=JSON.parse(wp(id,"echo wp_json_encode(count(get_posts(['post_type'=>['wp_template','wp_template_part'],'numberposts'=>-1])));"));
 await writeFile(join(output,'functional.json'),JSON.stringify(evidence,null,2));console.log(id,JSON.stringify(checks));
}
