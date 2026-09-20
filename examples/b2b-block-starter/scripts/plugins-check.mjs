import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {loadPluginProfile,verifyPluginInventory} from './plugins.mjs';
const profile=await loadPluginProfile('config/wordpress-plugins.json');
assert.deepEqual(JSON.parse(await readFile('.agents/skills/wordpress-builder/assets/plugin-profile.json','utf8')),profile);
const p=JSON.parse(await readFile('.lab/b2b-starter-latest.json','utf8'));
assert.equal(p.urls.primary,'http://127.0.0.1:9490');assert.equal(p.urls.reuse,'http://127.0.0.1:9491');
const report={testedAt:new Date().toISOString(),profile:profile.profile,sites:{},scope:'read-only existing local instances; production mail/spam/backup/performance gates are separate'};
for(const id of ['primary','reuse']){
 const wp=(...args)=>execFileSync('docker',['compose','-p',p.project,'-f',p.compose,'exec','-T',id,'php','/tools/wp','--allow-root',...args],{encoding:'utf8',timeout:60000});
 const inventory=verifyPluginInventory(profile,JSON.parse(wp('plugin','list','--format=json')));assert.ok(inventory.pass,JSON.stringify(inventory));
 const config=JSON.parse(wp('eval',`$id=(int)get_option('hd_enquiry_form_id');$f=\\FluentForm\\App\\Models\\Form::find($id);$notice=\\FluentForm\\App\\Models\\FormMeta::retrieve('notifications',$id);echo wp_json_encode(['acfFree'=>defined('ACF_VERSION')&&!acf_is_pro(),'fieldRegistered'=>!!acf_get_field('field_hd_model'),'productType'=>post_type_exists('hd_product'),'category'=>taxonomy_exists('hd_category'),'formExists'=>!!$f,'formFields'=>$f?array_column(array_column(json_decode($f->form_fields,true)['fields'],'attributes'),'name'):[],'notificationEnabled'=>!empty($notice['enabled']),'rankMathFree'=>defined('RANK_MATH_VERSION')&&!defined('RANK_MATH_PRO_VERSION'),'rankMathFrontend'=>isset(rank_math()->frontend),'rankMathModules'=>get_option('rank_math_modules'),'previewNoindex'=>get_option('blog_public')==='0','labOnly'=>defined('NEW_SITE_REFERENCE_LAB')&&NEW_SITE_REFERENCE_LAB]);`));
 for(const key of ['acfFree','fieldRegistered','productType','category','formExists','notificationEnabled','rankMathFree','rankMathFrontend','previewNoindex','labOnly'])assert.equal(config[key],true,id+' '+key);
 for(const field of ['name','email','country','description','product_id'])assert.ok(config.formFields.includes(field));
 assert.deepEqual([...config.rankMathModules].sort(),['404-monitor','acf','redirections','rich-snippet','sitemap']);
 report.sites[id]={inventory,configuration:config};
}
await mkdir('docs/acceptance/plugin-harness',{recursive:true});await writeFile('docs/acceptance/plugin-harness/inventory.json',JSON.stringify(report,null,2));
console.log('Both local sites match the plugin profile and basic configuration checks.');
