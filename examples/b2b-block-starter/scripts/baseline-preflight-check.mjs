// Live rehearsal of --snapshot + --baseline preflight against the local reuse environment.
// Creates one unique throwaway wp_template override, proves conflict detection,
// proves the operator content is untouched, and cleans everything up.
import {readFile,writeFile,mkdir,mkdtemp,rm,cp} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {overrideInventoryPhp} from './release/overrides.mjs';
const here=dirname(fileURLToPath(import.meta.url));
const p=JSON.parse(await readFile('.lab/b2b-starter-latest.json','utf8'));
await readFile(join(p.run,'ready.json'));
assert.equal(p.urls.reuse,'http://127.0.0.1:9491');
const wp=args=>execFileSync('docker',['compose','-p',p.project,'-f',p.compose,'exec','-T','reuse','php','/tools/wp','--allow-root','--path=/var/www/html','eval',args],{encoding:'utf8',timeout:60000,maxBuffer:1024*1024});
const cli=(args,options={})=>{try{return {code:0,out:execFileSync(process.execPath,[join(here,'update-preflight.mjs'),...args],{encoding:'utf8',timeout:60000,...options})};}catch(e){return {code:e.status,out:String(e.stdout??'')+String(e.stderr??'')};}};
const run=await mkdtemp(resolve('.lab/baseline-preflight-'));
const checks={};let slug='',overrideId=0;let contentHash;
try{
 const setup=`
${overrideInventoryPhp}
if(!defined('NEW_SITE_REFERENCE_LAB') || !NEW_SITE_REFERENCE_LAB) throw new Exception('Lab only');
$slug='harness-baseline-'.bin2hex(random_bytes(5));
$theme=get_stylesheet();
$post=wp_insert_post(['post_type'=>'wp_template','post_status'=>'publish','post_name'=>$slug,'post_title'=>$slug,'post_content'=>'<!-- wp:paragraph --><p>OPERATOR EDIT</p><!-- /wp:paragraph -->'],true);
if(is_wp_error($post))throw new Exception('Insert failed');
wp_set_object_terms($post,$theme,'wp_theme');
echo wp_json_encode(['slug'=>$slug,'id'=>$post,'contentHash'=>hash('sha256',get_post($post)->post_content)]);`;
 const state=JSON.parse(wp(setup));slug=state.slug;overrideId=state.id;contentHash=state.contentHash;
 checks.overrideCreated=overrideId>0&&slug.startsWith('harness-baseline-');

 // Baseline from the deployed source theme; candidate is an evolved copy adding the overridden template.
 const source=resolve(here,'../theme');
 const candidate=join(run,'candidate');
 await cp(source,candidate,{recursive:true});
 const snapshotPath=join(run,'baseline.json');
 const snap=cli(['--snapshot',source,snapshotPath]);
 checks.snapshotExported=snap.code===0&&JSON.parse(snap.out).files>0;
 await mkdir(join(candidate,'templates'),{recursive:true});
 await writeFile(join(candidate,'templates',slug+'.html'),'<!-- wp:paragraph --><p>FILE VERSION</p><!-- /wp:paragraph -->\n');

 const conflict=cli(['--baseline',snapshotPath,candidate]);
 const conflictReport=JSON.parse(conflict.out);
 checks.conflictDetected=conflict.code===2&&conflictReport.blocked===true;
 checks.derivedOverridePath=(conflictReport.diff?.overridePaths??[]).includes('templates/'+slug+'.html');
 checks.derivedKind=(conflictReport.diff?.changes??[]).some(c=>c.path==='templates/'+slug+'.html'&&c.kind==='candidate-added');
 checks.operatorContentPreservedAfterConflict=JSON.parse(wp(`echo wp_json_encode(hash('sha256',get_post(${overrideId})->post_content));`))===contentHash;

 await rm(join(candidate,'templates',slug+'.html'));
 const clean=cli(['--baseline',snapshotPath,candidate]);
 const cleanReport=JSON.parse(clean.out);
 checks.noConflictWithoutFile=clean.code===0&&cleanReport.blocked===false;
 checks.operatorContentPreservedAfterCleanRun=JSON.parse(wp(`echo wp_json_encode(hash('sha256',get_post(${overrideId})->post_content));`))===contentHash;
}finally{
 if(overrideId){
  const cleanup=`
${overrideInventoryPhp}
$post=get_posts(['post_type'=>'wp_template','name'=>'${slug}','post_status'=>'any','numberposts'=>1]);
if($post)wp_delete_post($post[0]->ID,true);
$term=get_term_by('name',get_stylesheet(),'wp_theme');
$remaining=$term?count(get_objects_in_term($term->term_id,'wp_theme',['fields'=>'ids'])):0;
if(!$remaining&&$term)wp_delete_term($term->term_id,'wp_theme');
echo wp_json_encode(['removed'=>!get_posts(['post_type'=>'wp_template','name'=>'${slug}','post_status'=>'any'])]);`;
  checks.cleanup=JSON.parse(wp(cleanup)).removed;
 }
 await rm(run,{recursive:true,force:true});
}
assert.ok(Object.values(checks).every(Boolean),'Failed: '+JSON.stringify(checks));
const output='docs/acceptance/template-update';await mkdir(output,{recursive:true});
await writeFile(join(output,'baseline-preflight.json'),JSON.stringify({testedAt:new Date().toISOString(),scope:'local-reuse-baseline-derived-preflight-not-full-deployment',slug,checks,notCovered:['hostinger-remote-baseline-live-run','conflict-resolution-and-backup','new-enquiry-during-deployment','binary-and-plugin-incremental-transport']},null,2)+'\n');
console.log(JSON.stringify(checks,null,2));
