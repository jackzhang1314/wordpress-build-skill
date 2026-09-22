// Local template-update rehearsal. Never accepts a production URL or imports a database.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {join} from 'node:path';
import assert from 'node:assert/strict';
import {overrideInventoryPhp} from './release/overrides.mjs';
const p=JSON.parse(await readFile('.lab/b2b-starter-latest.json','utf8'));
await readFile(join(p.run,'ready.json'));
assert.equal(p.urls.reuse,'http://127.0.0.1:9491');
const php=`
${overrideInventoryPhp}
if(!defined('NEW_SITE_REFERENCE_LAB') || !NEW_SITE_REFERENCE_LAB) throw new Exception('Lab only');
global $wpdb;
$slug='harness-update-'.bin2hex(random_bytes(5));
$theme=get_stylesheet();$file=get_stylesheet_directory().'/templates/'.$slug.'.html';
$ids=[];$result=[];$testTerm=null;
$check=function($yes,$name)use(&$result){$result[$name]=(bool)$yes;if(!$yes)throw new Exception($name);};
$state=function()use($wpdb){$out=[];foreach(['fluentform_submissions','fluentform_entry_details','fluentform_submission_meta'] as $suffix){$rows=$wpdb->get_results('SELECT * FROM '.$wpdb->prefix.$suffix,ARRAY_A);$encoded=array_map('wp_json_encode',$rows);sort($encoded);$out[$suffix]=hash('sha256',implode("\\n",$encoded));}return $out;};
$before=$state();
try{
 file_put_contents($file,'<!-- wp:paragraph --><p>FILE VERSION ONE</p><!-- /wp:paragraph -->');
 $post=wp_insert_post(['post_type'=>'hd_product','post_status'=>'draft','post_title'=>$slug,'post_content'=>'Operator content after initial release'],true);
 if(is_wp_error($post))throw new Exception('Create product failed');$ids[]=$post;
 update_post_meta($post,'_wp_page_template',$slug);update_field('model','OPERATOR-MODEL',$post);
 $custom=wp_insert_post(['post_type'=>'wp_template','post_status'=>'publish','post_name'=>$slug,'post_title'=>$slug,'post_content'=>'<!-- wp:paragraph --><p>OPERATOR TEMPLATE</p><!-- /wp:paragraph -->'],true);
 if(is_wp_error($custom))throw new Exception('Create template failed');$ids[]=$custom;wp_set_object_terms($custom,$theme,'wp_theme');
 $resolve=function()use($theme,$slug){return get_block_template($theme.'//'.$slug,'wp_template');};
 $check(str_contains($resolve()->content,'OPERATOR TEMPLATE'),'databaseOverrideWins');
 $contentBefore=get_post($custom)->post_content;
 $scan=harness_template_overrides(['templates/'.$slug.'.html']);
 $check($scan['blocked'],'preflightBlocksChangedTemplate');
 $check(!harness_template_overrides(['templates/unrelated-harness-file.html'])['blocked'],'unrelatedFileDoesNotConflict');
 $check(get_post($custom)->post_content===$contentBefore,'preflightDoesNotModifyOverride');
 foreach(['wp_template_part','wp_global_styles'] as $type){
  $fixture=wp_insert_post(['post_type'=>$type,'post_status'=>'publish','post_name'=>$slug,'post_title'=>$slug,'post_content'=>$type==='wp_global_styles'?'{"version":3,"styles":{"color":{"text":"#123456"}}}':'<!-- wp:paragraph --><p>OPERATOR PART</p><!-- /wp:paragraph -->'],true);
  if(is_wp_error($fixture))throw new Exception('Fixture creation failed');$ids[]=$fixture;
  wp_set_object_terms($fixture,$theme,'wp_theme');
  $path=$type==='wp_global_styles'?'theme.json':'parts/'.$slug.'.html';
  $original=get_post($fixture)->post_content;
  $check(harness_template_overrides([$path])['blocked'],$type.'ConflictDetected');
  wp_set_object_terms($fixture,$slug.'-other-theme','wp_theme');$testTerm=get_term_by('name',$slug.'-other-theme','wp_theme');
  $check(!harness_template_overrides([$path])['blocked'],$type.'OtherThemeExcluded');
  $check(get_post($fixture)->post_content===$original,$type.'ContentUnchanged');
  wp_delete_post($fixture,true);$ids=array_values(array_diff($ids,[$fixture]));
 }
 $saved=get_post($post)->post_content;$fields=get_fields($post);
 file_put_contents($file,'<!-- wp:paragraph --><p>FILE VERSION TWO</p><!-- /wp:paragraph -->');
 $check(str_contains($resolve()->content,'OPERATOR TEMPLATE'),'fileUpdatePreservesOperatorTemplate');
 $check(str_contains(file_get_contents($file),'FILE VERSION TWO'),'updatedFileExistsButIsShadowed');
 $check(get_post($post)->post_content===$saved && get_fields($post)===$fields,'operatorContentAndAcfPreserved');
 $check($state()===$before,'existingEnquiryRowsUnchanged');
 // Explicit reset only for this owned fixture, never delete a real operator override.
 wp_delete_post($custom,true);$ids=array_values(array_diff($ids,[$custom]));
 $check(str_contains($resolve()->content,'FILE VERSION TWO'),'explicitResetRevealsNewFile');
 $check(!harness_template_overrides(['templates/'.$slug.'.html'])['blocked'],'resetClearsConflict');
}finally{
 foreach($ids as $id)wp_delete_post($id,true);
 if($testTerm)wp_delete_term($testTerm->term_id,'wp_theme');
 if(file_exists($file))unlink($file);
 $result['testObjectsRemoved']=!get_posts(['post_type'=>['hd_product','wp_template'],'name'=>$slug,'post_status'=>'any'])&&!file_exists($file);
}
echo wp_json_encode($result);
`;
const raw=execFileSync('docker',['compose','-p',p.project,'-f',p.compose,'exec','-T','reuse','php','/tools/wp','--allow-root','--path=/var/www/html','eval',php],{encoding:'utf8',timeout:60000,maxBuffer:1024*1024});
const checks=JSON.parse(raw);assert.ok(Object.values(checks).every(Boolean));
const output='docs/acceptance/template-update';await mkdir(output,{recursive:true});
await writeFile(join(output,'report.json'),JSON.stringify({testedAt:new Date().toISOString(),scope:'local-reuse-template-file-update-not-full-deployment',checks,notCovered:['remote-incremental-transport','new-enquiry-during-deployment','media-update','template-parts-and-global-styles-rendering','plugin-schema-migration']},null,2)+'\n');
console.log(JSON.stringify(checks,null,2));
