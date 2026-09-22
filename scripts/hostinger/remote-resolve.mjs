// Remote conflict resolution over REST (sanctioned site, explicit paths only):
//   reset --backup OUT.json PATH...   backup overrides locally, then force-delete them
//   restore BACKUP.json               recreate overrides from a backup
// theme.json is not supported (global styles cannot be listed on the current site).
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {validateChangedPaths} from '../../examples/b2b-block-starter/scripts/release/overrides.mjs';
import {validateBackupShape} from '../../examples/b2b-block-starter/scripts/release/resolve.mjs';
import {restSession} from './rest-session.mjs';
const sha256Hex=data=>createHash('sha256').update(data).digest('hex');
const args=process.argv.slice(2);
const mode=args[0];
const provision=JSON.parse(await readFile(resolve('.wordpress-builder/hostinger/provision.json'),'utf8'));
const admin=JSON.parse(await readFile(resolve('.wordpress-builder/hostinger/wordpress-admin.json'),'utf8'));
const base='https://'+provision.domain;
const session=await restSession(base,admin.login,admin.password);
const templateCollections=async()=>{
 const [templates,parts]=await Promise.all([
  session.api('wp/v2/templates?context=edit&per_page=100'),
  session.api('wp/v2/template-parts?context=edit&per_page=100'),
 ]);
 const items=[];
 const push=(type,list)=>{for(const item of list){
  const slug=String(item.id).split('//')[1];
  if(!slug)throw new Error('Unexpected REST template id');
  items.push({type,id:item.id,slug,status:item.status,source:item.source,area:item.area??null,
   title:typeof item.title==='object'&&item.title!==null?String(item.title.raw??''):String(item.title??''),
   content:typeof item.content==='object'&&item.content!==null?String(item.content.raw??''):String(item.content??'')});
 }};
 push('wp_template',templates);push('wp_template_part',parts);
 return items;
};
const pathOf=item=>(item.type==='wp_template'?'templates/':'parts/')+item.slug+'.html';
if(mode==='reset'){
 const rest=args.slice(1);
 assert.equal(rest[0],'--backup','Usage: reset --backup OUT.json PATH...');
 const backupOut=rest[1];assert.ok(backupOut,'Usage: reset --backup OUT.json PATH...');
 const paths=validateChangedPaths(rest.slice(2));
 assert.ok(paths.length,'Supply theme-relative template/parts paths; theme.json is not supported');
 assert.ok(paths.every(path=>path!=='theme.json'),'Refusing theme.json reset; global styles resolution is not supported');
 const items=await templateCollections();
 const byPath=new Map(items.filter(item=>item.source==='custom'&&item.status==='publish').map(item=>[pathOf(item),item]));
 const missing=paths.filter(path=>!byPath.has(path));
 assert.equal(missing.length,0,'No published override at: '+missing.join(', ')+' — nothing to reset');
 const entries=paths.map(path=>{
  const item=byPath.get(path);
  return {id:item.id,type:item.type,path,slug:item.slug,title:item.title,content:item.content,contentHash:sha256Hex(item.content),area:item.area??undefined,source:item.source,origin:item.origin};
 });
 const backup={shape:'wp-override-backup',backedUpAt:new Date().toISOString(),via:'hostinger-rest',domain:provision.domain,theme:'b2b-equipment',entries};
 await mkdir(dirname(resolve(backupOut)),{recursive:true});
 await writeFile(backupOut,JSON.stringify(backup,null,2)+'\n');
 assert.deepEqual(JSON.parse(await readFile(backupOut,'utf8')).entries.map(entry=>entry.contentHash),entries.map(entry=>entry.contentHash),'Backup file verification failed');
 const reset=[];
 for(const entry of entries){
  const encoded=encodeURIComponent(entry.id);
  const del=await session.request('wp/v2/'+(entry.type==='wp_template'?'templates':'template-parts')+'/'+encoded+'?force=true',{method:'DELETE'});
  assert.equal(del.status,200,entry.path+': delete returned '+del.status);
  const result=await del.json();
  assert.ok(result.deleted===true,entry.path+': delete did not confirm');
  const previousContent=typeof result.previous?.content==='object'?result.previous.content.raw:result.previous?.content;
  assert.equal(sha256Hex(String(previousContent)),entry.contentHash,entry.path+': remote content changed since backup');
  const gone=await session.request('wp/v2/'+(entry.type==='wp_template'?'templates':'template-parts')+'/'+encoded+'?context=edit');
  assert.equal(gone.status,404,entry.path+': override still resolvable after delete');
  reset.push(entry.path);
 }
 console.log(JSON.stringify({decision:'reset',reset,backup:backupOut,ensure:'New theme files must ship in the same release',releaseApproval:false},null,2));
}else if(mode==='restore'){
 const file=args[1];assert.ok(file,'Usage: restore BACKUP.json');
 const backup=validateBackupShape(JSON.parse(await readFile(file,'utf8')));
 assert.equal(backup.domain,provision.domain,'Backup domain mismatch');
 const restored=[];
 for(const entry of backup.entries){
  const route='wp/v2/'+(entry.type==='wp_template'?'templates':'template-parts');
  const encoded=encodeURIComponent(entry.id);
  const existing=await session.request(route+'/'+encoded+'?context=edit');
  assert.ok(existing.status===404||existing.status===200,'Unexpected lookup status for '+entry.path);
  assert.equal(existing.status,404,entry.path+': override already exists — reset it first');
  const body={slug:entry.slug,title:entry.title,content:entry.content,status:'publish'};
  if(entry.type==='wp_template_part')body.area=entry.area??'uncategorized';
  const created=await session.request(route,{method:'POST',body});
  assert.equal(created.status,201,entry.path+': create returned '+created.status);
  const item=await created.json();
  const content=typeof item.content==='object'?item.content.raw:item.content;
  assert.equal(sha256Hex(String(content)),entry.contentHash,entry.path+': restored content hash mismatch');
  restored.push(entry.path);
 }
 console.log(JSON.stringify({decision:'restore',restored,releaseApproval:false},null,2));
}else{
 throw new Error('Usage: reset --backup OUT.json PATH... | restore BACKUP.json');
}
