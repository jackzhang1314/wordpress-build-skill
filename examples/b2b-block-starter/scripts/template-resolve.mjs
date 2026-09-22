// Explicit conflict resolution for template overrides. Lab-only writes:
//   keep PATH...                        read-only decision record
//   reset --backup OUT.json PATH...     backup overrides, then delete them (file version takes over)
//   restore BACKUP.json                 recreate overrides from a backup
import {readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {join} from 'node:path';
import assert from 'node:assert/strict';
import {validateChangedPaths} from './release/overrides.mjs';
import {overrideContentPhp,resolvePaths,validateBackupShape} from './release/resolve.mjs';
const p=JSON.parse(await readFile('.lab/b2b-starter-latest.json','utf8'));
await readFile(join(p.run,'ready.json'));
assert.equal(p.urls.reuse,'http://127.0.0.1:9491');
const wp=args=>execFileSync('docker',['compose','-p',p.project,'-f',p.compose,'exec','-T','reuse','php','/tools/wp','--allow-root','--path=/var/www/html','eval',args],{encoding:'utf8',timeout:60000,maxBuffer:8*1024*1024});
const encode=value=>Buffer.from(JSON.stringify(value)).toString('base64');
const args=process.argv.slice(2);
const mode=args[0];
if(mode==='keep'){
 const paths=validateChangedPaths(args.slice(1));
 assert.ok(paths.length,'Supply theme-relative paths; empty input is not a decision');
 const report=JSON.parse(wp(`echo wp_json_encode(harness_template_overrides(json_decode(base64_decode('${encode(paths)}'),true)));`));
 console.log(JSON.stringify({...report,decision:'keep',releaseApproval:false},null,2));
}else if(mode==='reset'){
 const rest=args.slice(1);
 assert.equal(rest[0],'--backup','Usage: reset --backup OUT.json PATH...');
 const backupOut=rest[1];assert.ok(backupOut,'Usage: reset --backup OUT.json PATH...');
 const {allowed,rejected}=resolvePaths(rest.slice(2));
 assert.ok(allowed.length,'Supply theme-relative template/parts paths; theme.json is not supported');
 if(rejected.length)throw new Error('Refusing theme.json reset; global styles resolution is not supported');
 const state=JSON.parse(wp(overrideContentPhp+`echo wp_json_encode(['theme'=>get_stylesheet(),'items'=>harness_overrides_for_paths(json_decode(base64_decode('${encode(allowed)}'),true))]);`));
 const found=new Set(state.items.map(entry=>entry.path));
 const missing=allowed.filter(path=>!found.has(path));
 assert.equal(missing.length,0,'No override at: '+missing.join(', ')+' — nothing to reset');
 const backup={shape:'wp-override-backup',backedUpAt:new Date().toISOString(),theme:state.theme,entries:state.items};
 await writeFile(backupOut,JSON.stringify(backup,null,2)+'\n');
 const del=JSON.parse(wp(`if(!defined('NEW_SITE_REFERENCE_LAB') || !NEW_SITE_REFERENCE_LAB) throw new Exception('Lab only');
$data=json_decode(base64_decode('${encode(backup.entries.map(entry=>[entry.id,entry.contentHash]))}'),true);$deleted=[];
foreach($data as [$id,$hash]){$post=get_post($id);if(!$post||$post->post_status!=='publish')throw new Exception('Override disappeared: '.$id);
if(hash('sha256',$post->post_content)!==$hash)throw new Exception('Content changed since backup: '.$id);
wp_delete_post($id,true);$deleted[]=$id;}echo wp_json_encode(['deleted'=>$deleted]);`));
 assert.equal(del.deleted.length,allowed.length);
 console.log(JSON.stringify({decision:'reset',reset:allowed,backup:backupOut,ensure:'New theme files must ship in the same release',releaseApproval:false},null,2));
}else if(mode==='restore'){
 const file=args[1];assert.ok(file,'Usage: restore BACKUP.json');
 const backup=validateBackupShape(JSON.parse(await readFile(file,'utf8')));
 const res=JSON.parse(wp(`if(!defined('NEW_SITE_REFERENCE_LAB') || !NEW_SITE_REFERENCE_LAB) throw new Exception('Lab only');
$data=json_decode(base64_decode('${encode(backup)}'),true);$theme=get_stylesheet();
if($theme!==$data['theme'])throw new Exception('Backup theme mismatch: '.$data['theme']);$restored=[];
foreach($data['entries'] as $e){$exists=get_posts(['post_type'=>$e['type'],'name'=>$e['slug'],'post_status'=>'any','numberposts'=>1]);
if($exists)throw new Exception('Override already exists: '.$e['path'].' — reset it first');
$id=wp_insert_post(['post_type'=>$e['type'],'post_status'=>'publish','post_name'=>$e['slug'],'post_title'=>$e['title'],'post_content'=>$e['content']],true);
if(is_wp_error($id))throw new Exception('Insert failed for '.$e['path']);
wp_set_object_terms($id,$theme,'wp_theme');
if(hash('sha256',get_post($id)->post_content)!==$e['contentHash'])throw new Exception('Restored content hash mismatch: '.$e['path']);
$restored[]=$id;}echo wp_json_encode(['restored'=>$restored]);`));
 assert.equal(res.restored.length,backup.entries.length);
 console.log(JSON.stringify({decision:'restore',restored:backup.entries.map(entry=>entry.path),releaseApproval:false},null,2));
}else{
 throw new Error('Usage: keep PATH... | reset --backup OUT.json PATH... | restore BACKUP.json');
}
