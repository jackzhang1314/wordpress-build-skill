// Conflict-resolution helpers: keep/reset/restore with mandatory backups.
// Write operations are lab-only and never touch theme.json global styles.
import {createHash} from 'node:crypto';
import {validateChangedPaths,OVERRIDE_PATH_PATTERN} from './overrides.mjs';
const sha256Hex=data=>createHash('sha256').update(data).digest('hex');
export const overrideContentPhp=`
function harness_overrides_for_paths($paths){
 $theme=get_stylesheet();$items=[];
 foreach(get_posts(['post_type'=>['wp_template','wp_template_part'],'post_status'=>'publish','numberposts'=>-1,'tax_query'=>[['taxonomy'=>'wp_theme','field'=>'name','terms'=>$theme]]]) as $post){
  $path=($post->post_type==='wp_template'?'templates/':'parts/').$post->post_name.'.html';
  if(in_array($path,$paths,true))$items[]=['id'=>$post->ID,'type'=>$post->post_type,'path'=>$path,'slug'=>$post->post_name,'title'=>$post->post_title,'content'=>$post->post_content,'contentHash'=>hash('sha256',$post->post_content)];
 }
 return $items;
}`;
export function resolvePaths(paths){
 const clean=validateChangedPaths(paths);
 return {allowed:clean.filter(path=>path!=='theme.json'),rejected:clean.filter(path=>path==='theme.json')};
}
export function validateBackupShape(backup){
 if(!backup||typeof backup!=='object'||Array.isArray(backup))throw new Error('Backup must be a JSON object');
 if(backup.shape!=='wp-override-backup')throw new Error('Unexpected backup shape');
 if(typeof backup.theme!=='string'||!backup.theme)throw new Error('Backup theme missing');
 if(!Array.isArray(backup.entries)||!backup.entries.length)throw new Error('Backup entries missing');
 for(const entry of backup.entries){
  if(!entry||typeof entry!=='object'||Array.isArray(entry))throw new Error('Invalid backup entry');
  if(typeof entry.path!=='string'||!OVERRIDE_PATH_PATTERN.test(entry.path)||entry.path==='theme.json')throw new Error('Unsupported backup path: '+String(entry.path));
  for(const key of ['type','slug','title','content','contentHash'])if(typeof entry[key]!=='string'||!entry[key])throw new Error('Backup entry missing '+key+' for '+entry.path);
  if(!/^[a-f0-9]{64}$/.test(entry.contentHash))throw new Error('Invalid contentHash for '+entry.path);
  if(sha256Hex(entry.content)!==entry.contentHash)throw new Error('Content hash mismatch for '+entry.path);
 }
 return backup;
}
