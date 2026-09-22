// Full incremental update rehearsal on the local reuse environment:
// preflight conflict -> reset with backup -> file takes over, while enquiries are
// submitted mid-update (before and after the destructive step) and must survive.
import {readFile,writeFile,mkdir,mkdtemp,rm,cp} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const here=dirname(fileURLToPath(import.meta.url));
const p=JSON.parse(await readFile('.lab/b2b-starter-latest.json','utf8'));
await readFile(join(p.run,'ready.json'));
assert.equal(p.urls.reuse,'http://127.0.0.1:9491');
const wp=args=>execFileSync('docker',['compose','-p',p.project,'-f',p.compose,'exec','-T','reuse','php','/tools/wp','--allow-root','--path=/var/www/html','eval',args],{encoding:'utf8',timeout:60000,maxBuffer:8*1024*1024});
const cli=(script,args)=>{try{return {code:0,out:execFileSync(process.execPath,[join(here,script),...args],{encoding:'utf8',timeout:60000,stdio:['pipe','pipe','pipe']})};}catch(e){return {code:e.status,out:String(e.stdout??'')+String(e.stderr??'')};}};
const run=await mkdtemp(resolve('.lab/incremental-enquiry-'));
const checks={};let slug,containerFile,overrideId;const markers={},inserted={};
const enquiry=(marker,point)=>{
 const fields={name:'Update Window Customer',email:'update-window@example.test',message:'Submitted during incremental update: '+point};
 const payload=JSON.stringify({...fields,marker,point});
 const res=JSON.parse(wp(`if(!defined('NEW_SITE_REFERENCE_LAB') || !NEW_SITE_REFERENCE_LAB) throw new Exception('Lab only');
global $wpdb;$marker='${marker}';$now=current_time('mysql');
$response=wp_json_encode(json_decode(base64_decode('${encode(payload)}'),true));
$wpdb->insert($wpdb->prefix.'fluentform_submissions',['form_id'=>1,'response'=>$response,'source_url'=>'http://127.0.0.1:9491/contact/','status'=>'unread','browser'=>'harness','device'=>'harness','ip'=>'127.0.0.1','created_at'=>$now,'updated_at'=>$now]);
if(!$wpdb->insert_id)throw new Exception('Submission insert failed');
$id=$wpdb->insert_id;
foreach(json_decode(base64_decode('${encode(fields)}'),true) as $key=>$value)$wpdb->insert($wpdb->prefix.'fluentform_entry_details',['form_id'=>1,'submission_id'=>$id,'field_name'=>$key,'field_value'=>$value]);
echo wp_json_encode(['id'=>$id,'details'=>$wpdb->get_var('SELECT COUNT(*) FROM '.$wpdb->prefix.'fluentform_entry_details WHERE submission_id='.$id)]);`));
 markers[point]=marker;inserted[point]={...fields,marker,point,id:res.id};
 return res.details===String(Object.keys(fields).length);
};
const encode=value=>Buffer.from(typeof value==='string'?value:JSON.stringify(value)).toString('base64');
try{
 // Existing enquiry state before the update window.
 const snapshot=JSON.parse(wp(`global $wpdb;$s=[];
foreach(['fluentform_submissions','fluentform_entry_details','fluentform_submission_meta'] as $suffix){
 $rows=$wpdb->get_results('SELECT * FROM '.$wpdb->prefix.$suffix,ARRAY_A);
 $encoded=array_map('wp_json_encode',$rows);sort($encoded);
 $s[$suffix]=['count'=>count($rows),'hash'=>hash('sha256',implode("\n",$encoded))];}
echo wp_json_encode($s);`));

 // The update: an admin override for a template the new release also changes.
 const setup=JSON.parse(wp(`if(!defined('NEW_SITE_REFERENCE_LAB') || !NEW_SITE_REFERENCE_LAB) throw new Exception('Lab only');
$slug='harness-enquiry-'.bin2hex(random_bytes(5));$theme=get_stylesheet();
$post=wp_insert_post(['post_type'=>'wp_template','post_status'=>'publish','post_name'=>$slug,'post_title'=>$slug,'post_content'=>'<!-- wp:paragraph --><p>OPERATOR EDIT</p><!-- /wp:paragraph -->'],true);
if(is_wp_error($post))throw new Exception('Insert failed');
wp_set_object_terms($post,$theme,'wp_theme');
$file=get_stylesheet_directory().'/templates/'.$slug.'.html';
file_put_contents($file,'<!-- wp:paragraph --><p>FILE VERSION</p><!-- /wp:paragraph -->');
echo wp_json_encode(['slug'=>$slug,'id'=>$post,'file'=>basename(dirname($file)).'/'.basename($file)]);`));
 slug=setup.slug;overrideId=setup.id;containerFile=setup.file;
 checks.fixtureCreated=overrideId>0&&containerFile==='templates/'+slug+'.html';

 const source=resolve(here,'../theme');const candidate=join(run,'candidate');
 await cp(source,candidate,{recursive:true});
 await mkdir(join(candidate,'templates'),{recursive:true});
 await writeFile(join(candidate,'templates',slug+'.html'),'<!-- wp:paragraph --><p>FILE VERSION</p><!-- /wp:paragraph -->\n');
 const snap=cli('update-preflight.mjs',['--snapshot',source,join(run,'baseline.json')]);
 checks.snapshotExported=snap.code===0;

 const preflight=cli('update-preflight.mjs',['--baseline',join(run,'baseline.json'),candidate]);
 checks.preflightDetectedConflict=preflight.code===2&&JSON.parse(preflight.out).blocked===true;

 // Mid-update submissions: before and after the destructive override reset.
 checks.enquiryBeforeReset=enquiry('harness-enq-'+Date.now().toString(16)+'-a','pre-reset');
 const backupPath=join(run,'backup.json');
 const resetRun=cli('template-resolve.mjs',['reset','--backup',backupPath,'templates/'+slug+'.html']);
 checks.resetSucceeded=resetRun.code===0&&JSON.parse(resetRun.out).decision==='reset';
 checks.enquiryAfterReset=enquiry('harness-enq-'+Date.now().toString(16)+'-b','post-reset');

 const takeover=JSON.parse(wp(`$t=get_block_template(get_stylesheet().'//${slug}','wp_template');echo wp_json_encode(['fileWins'=>$t&&str_contains($t->content,'FILE VERSION')]);`));
 checks.newFileTakesOver=takeover.fileWins===true;

 // Pre-existing enquiry rows are byte-identical once our inserted rows are excluded.
 const verify=JSON.parse(wp(`global $wpdb;$markers=json_decode(base64_decode('${encode(Object.values(markers))}'),true);
$ours=[];foreach([${Object.values(inserted).map(entry=>entry.id).join(',')} ] as $id)$ours[]=(int)$id;
$out=[];
foreach(['fluentform_submissions','fluentform_entry_details','fluentform_submission_meta'] as $suffix){
 $rows=$wpdb->get_results('SELECT * FROM '.$wpdb->prefix.$suffix,ARRAY_A);
 $rows=array_values(array_filter($rows,static function($row)use($markers,$ours,$suffix){
  if($suffix==='fluentform_submissions')return !array_reduce($markers,static fn($carry,$m)=>$carry||str_contains((string)$row['response'],$m),false);
  return !in_array((int)($suffix==='fluentform_submission_meta'?$row['response_id']:$row['submission_id']),$ours,true);}));
 $encoded=array_map('wp_json_encode',$rows);sort($encoded);
 $out[$suffix]=hash('sha256',implode("\n",$encoded));}
echo wp_json_encode($out);`));
 checks.preExistingEnquiriesUnchanged=Object.keys(snapshot).every(table=>snapshot[table].hash===verify[table]);

 for(const point of ['pre-reset','post-reset']){
  const entry=inserted[point];
  const row=JSON.parse(wp(`global $wpdb;$marker=base64_decode('${encode(entry.marker)}');
$row=$wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}fluentform_submissions WHERE response LIKE %s",'%'.$marker.'%'),ARRAY_A);
if(!$row)throw new Exception('Submission missing: ${point}');
$details=$wpdb->get_results($wpdb->prepare("SELECT field_name,field_value FROM {$wpdb->prefix}fluentform_entry_details WHERE submission_id=%d ORDER BY id",$row['id']),ARRAY_A);
echo wp_json_encode(['id'=>(int)$row['id'],'status'=>$row['status'],'response'=>json_decode($row['response'],true),'details'=>$details]);`));
  checks['enquiryPreserved'+point.replace(/-/g,'')]=row.id===entry.id&&row.status==='unread'
   &&row.response.name===entry.name&&row.response.email===entry.email&&row.response.message===entry.message&&row.response.marker===entry.marker&&row.response.point===point
   &&row.details.some(d=>d.field_name==='message'&&d.field_value===entry.message)&&row.details.length>=3;
 }
}finally{
 const state={slug,containerFile,markers:Object.values(markers),ids:Object.values(inserted).map(entry=>entry.id)};
 if(state.markers.length||state.ids.length||state.slug){
  const cleanup=JSON.parse(wp(`if(!defined('NEW_SITE_REFERENCE_LAB') || !NEW_SITE_REFERENCE_LAB) throw new Exception('Lab only');
global $wpdb;$state=json_decode(base64_decode('${encode(state)}'),true);
foreach($state['ids'] as $id){$wpdb->delete($wpdb->prefix.'fluentform_entry_details',['submission_id'=>$id]);$wpdb->delete($wpdb->prefix.'fluentform_submission_meta',['response_id'=>$id]);$wpdb->delete($wpdb->prefix.'fluentform_submissions',['id'=>$id]);}
if($state['slug']){$post=get_posts(['post_type'=>'wp_template','name'=>$state['slug'],'post_status'=>'any','numberposts'=>1]);if($post)wp_delete_post($post[0]->ID,true);}
$file=$state['containerFile']?get_stylesheet_directory().'/'.$state['containerFile']:null;
if($file&&file_exists($file))unlink($file);
$term=get_term_by('name',get_stylesheet(),'wp_theme');
$remaining=$term?count(get_objects_in_term($term->term_id,'wp_theme',['fields'=>'ids'])):0;
if(!$remaining&&$term)wp_delete_term($term->term_id,'wp_theme');
$left=0;foreach($state['ids'] as $id)$left+=$wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM {$wpdb->prefix}fluentform_submissions WHERE id=%d",$id))?1:0;
$templateLeft=$state['slug']?!get_posts(['post_type'=>'wp_template','name'=>$state['slug'],'post_status'=>'any']):true;
$fileLeft=$state['containerFile']?!file_exists(get_stylesheet_directory().'/'.$state['containerFile']):true;
echo wp_json_encode(['removed'=>!$left&&$templateLeft&&$fileLeft]);`));
  checks.cleanup=cleanup.removed;
 }
 await rm(run,{recursive:true,force:true});
}
assert.ok(Object.values(checks).every(Boolean),'Failed: '+JSON.stringify(checks));
const output='docs/acceptance/template-update';await mkdir(output,{recursive:true});
await writeFile(join(output,'incremental-enquiry.json'),JSON.stringify({testedAt:new Date().toISOString(),scope:'local-reuse-full-incremental-rehearsal-mid-update-enquiries-not-full-deployment',slug,insertionPoints:Object.keys(inserted),checks,notCovered:['hostinger-remote-incremental-run','form-submission-via-browser-during-update','plugin-database-migration','binary-file-transport']},null,2)+'\n');
console.log(JSON.stringify(checks,null,2));
