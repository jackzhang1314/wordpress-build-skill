// Live rehearsal of conflict resolution against the local reuse environment:
// reset (with mandatory backup) -> file version takes over; restore -> operator edit returns.
import {readFile,writeFile,mkdir,mkdtemp,rm} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const here=dirname(fileURLToPath(import.meta.url));
const p=JSON.parse(await readFile('.lab/b2b-starter-latest.json','utf8'));
await readFile(join(p.run,'ready.json'));
assert.equal(p.urls.reuse,'http://127.0.0.1:9491');
const wp=args=>execFileSync('docker',['compose','-p',p.project,'-f',p.compose,'exec','-T','reuse','php','/tools/wp','--allow-root','--path=/var/www/html','eval',args],{encoding:'utf8',timeout:60000,maxBuffer:8*1024*1024});
const cli=args=>{try{return {code:0,out:execFileSync(process.execPath,[join(here,'template-resolve.mjs'),...args],{encoding:'utf8',timeout:60000,stdio:['pipe','pipe','pipe']})};}catch(e){return {code:e.status,out:String(e.stdout??'')+String(e.stderr??'')};}};
const run=await mkdtemp(resolve('.lab/template-resolve-'));
const checks={};let slug='',overrideId=0;let contentHash;
try{
 const setup=`
if(!defined('NEW_SITE_REFERENCE_LAB') || !NEW_SITE_REFERENCE_LAB) throw new Exception('Lab only');
$slug='harness-resolve-'.bin2hex(random_bytes(5));$theme=get_stylesheet();
$post=wp_insert_post(['post_type'=>'wp_template','post_status'=>'publish','post_name'=>$slug,'post_title'=>$slug,'post_content'=>'<!-- wp:paragraph --><p>OPERATOR EDIT</p><!-- /wp:paragraph -->'],true);
if(is_wp_error($post))throw new Exception('Insert failed');
wp_set_object_terms($post,$theme,'wp_theme');
$file=get_stylesheet_directory().'/templates/'.$slug.'.html';
file_put_contents($file,'<!-- wp:paragraph --><p>FILE VERSION</p><!-- /wp:paragraph -->\\n');
echo wp_json_encode(['slug'=>$slug,'id'=>$post,'contentHash'=>hash('sha256',get_post($post)->post_content)]);`;
 const state=JSON.parse(wp(setup));slug=state.slug;overrideId=state.id;contentHash=state.contentHash;
 checks.overrideAndFileCreated=overrideId>0&&slug.startsWith('harness-resolve-');

 const backupPath=join(run,'backup.json');
 const resetRun=cli(['reset','--backup',backupPath,'templates/'+slug+'.html']);
 const resetReport=JSON.parse(resetRun.out);
 checks.resetSucceeded=resetRun.code===0&&resetReport.decision==='reset'&&Array.isArray(resetReport.reset);
 const backup=JSON.parse(await readFile(backupPath,'utf8'));
 checks.backupCapturesOperatorContent=backup.entries.length===1&&backup.entries[0].content.includes('OPERATOR EDIT')&&backup.entries[0].contentHash===contentHash&&backup.theme.length>0;
 const afterReset=JSON.parse(wp(`$t=get_block_template(get_stylesheet().'//${slug}','wp_template');echo wp_json_encode(['gone'=>!get_post(${overrideId}),'fileWins'=>$t&&str_contains($t->content,'FILE VERSION')]);`));
 checks.overrideDeletedAndFileTakesOver=afterReset.gone===true&&afterReset.fileWins===true;

 const restoreRun=cli(['restore',backupPath]);
 const restoreReport=JSON.parse(restoreRun.out);
 checks.restoreSucceeded=restoreRun.code===0&&restoreReport.decision==='restore';
 const afterRestore=JSON.parse(wp(`$t=get_block_template(get_stylesheet().'//${slug}','wp_template');$post=get_posts(['post_type'=>'wp_template','name'=>'${slug}','post_status'=>'any','numberposts'=>1]);echo wp_json_encode(['operatorWins'=>$t&&str_contains($t->content,'OPERATOR EDIT'),'hash'=>hash('sha256',get_post($post[0]->ID)->post_content)]);`));
 checks.operatorEditRestoredAndWins=afterRestore.operatorWins===true&&afterRestore.hash===contentHash;

 const noOverride=cli(['reset','--backup',join(run,'unused.json'),'templates/harness-resolve-missing.html']);
 checks.resetRefusesMissingOverride=noOverride.code===1&&noOverride.out.includes('No override at');
}finally{
 if(overrideId||slug){
  const cleanup=`
$post=get_posts(['post_type'=>'wp_template','name'=>'${slug}','post_status'=>'any','numberposts'=>1]);
if($post)wp_delete_post($post[0]->ID,true);
$file=get_stylesheet_directory().'/templates/${slug}.html';
if(file_exists($file))unlink($file);
$term=get_term_by('name',get_stylesheet(),'wp_theme');
$remaining=$term?count(get_objects_in_term($term->term_id,'wp_theme',['fields'=>'ids'])):0;
if(!$remaining&&$term)wp_delete_term($term->term_id,'wp_theme');
echo wp_json_encode(['removed'=>!get_posts(['post_type'=>'wp_template','name'=>'${slug}','post_status'=>'any'])&&!file_exists(get_stylesheet_directory().'/templates/${slug}.html')]);`;
  checks.cleanup=JSON.parse(wp(cleanup)).removed;
 }
 await rm(run,{recursive:true,force:true});
}
assert.ok(Object.values(checks).every(Boolean),'Failed: '+JSON.stringify(checks));
const output='docs/acceptance/template-update';await mkdir(output,{recursive:true});
await writeFile(join(output,'conflict-resolve.json'),JSON.stringify({testedAt:new Date().toISOString(),scope:'local-reuse-conflict-resolution-not-full-deployment',slug,checks,notCovered:['hostinger-remote-resolution','multi-entry-backup-restore','global-styles-resolution','concurrent-enquiry-during-resolution']},null,2)+'\n');
console.log(JSON.stringify(checks,null,2));
