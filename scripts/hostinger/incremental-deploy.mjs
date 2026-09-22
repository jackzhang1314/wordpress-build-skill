// Real incremental release for the sanctioned Hostinger site: theme or plugin.
// Gate chain: fresh baseline (theme mode additionally blocks on DB template
// overrides) -> backup remote copies -> TUS upload -> verification (PHP via
// text read-back, static assets via public URL after cache purge) -> cache
// purge -> convergence re-baseline. Deletions are refused (no transport yet).
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {setTimeout as delay} from 'node:timers/promises';
const here=dirname(fileURLToPath(import.meta.url));
const pluginMode=process.argv.includes('--plugin');
const positional=process.argv.slice(2).filter(arg=>arg!=='--plugin');
const slug=pluginMode?'site-model':'b2b-equipment';
const candidate=resolve(positional[0]??(pluginMode?'examples/b2b-block-starter/plugin':'examples/b2b-block-starter/theme'));
const privateDir=resolve('.wordpress-builder/hostinger');
const provision=JSON.parse(await readFile(join(privateDir,'provision.json'),'utf8'));
const domain=provision.domain,user=provision.username;
const remoteRoot='wp-content/'+(pluginMode?'plugins/':'themes/')+slug;
const publicBase='https://'+domain+'/wp-content/'+(pluginMode?'plugins/':'themes/')+slug;
const run=promisify(execFile);
const sh=(cmd,args,opts={})=>run(cmd,args,{timeout:120000,maxBuffer:8*1024*1024,encoding:'utf8',...opts});
const transient=/deadline exceeded|TLS handshake timeout|connection reset|EOF|Client\.Timeout/i;
const cli=async args=>{
 for(let attempt=1;;attempt++){
  try{return JSON.parse((await sh('hostinger',['hosting',...args,'--format','json'])).stdout);}
  catch(error){
   if(attempt>=3||!transient.test(String(error.stdout??'')+String(error.stderr??'')+String(error.message)))throw error;
   await delay(2000*attempt);
  }
 }
};
const outputDir=resolve('docs/acceptance/template-update');
const baselinePath=join(outputDir,pluginMode?'hostinger-baseline-plugin.json':'hostinger-baseline.json');
if(await access(baselinePath).then(()=>true,()=>false)){
 const previous=JSON.parse(await readFile(baselinePath,'utf8'));
 await writeFile(join(outputDir,'hostinger-baseline-'+(pluginMode?'plugin-':'')+previous.testedAt.slice(0,10).replaceAll('-','')+'.json'),JSON.stringify(previous,null,2)+'\n');
}
const digestOf=data=>createHash('sha256').update(data).digest('hex');
const normalize=buffer=>buffer.at(-1)===10?buffer.subarray(0,-1):buffer;
const isPhp=path=>path.endsWith('.php');
const publicHash=async path=>{
 for(let attempt=1;;attempt++){
  try{
   const res=await fetch(publicBase+'/'+path);
   assert.equal(res.status,200,publicBase+'/'+path+' returned '+res.status);
   return digestOf(Buffer.from(await res.arrayBuffer()));
  }catch(error){
   if(attempt>=3)throw error;
   await delay(2000*attempt);
  }
 }
};
const baseline=async()=>{
 await sh(process.execPath,[join(here,'theme-baseline.mjs'),user,domain,slug,candidate,baselinePath,pluginMode?'plugin':'theme'],{timeout:300000,maxBuffer:8*1024*1024});
 return JSON.parse(await readFile(baselinePath,'utf8'));
};

// 1. Gate: fresh baseline; theme mode also enforces the DB-override conflict gate.
let report=await baseline();
let derived=report.changes,unverified=report.unverified??[];
if(!pluginMode){
 await sh(process.execPath,[join(here,'remote-preflight.mjs'),candidate],{timeout:300000,maxBuffer:8*1024*1024});
 const preflightReport=JSON.parse(await readFile(join(outputDir,'hostinger-preflight.json'),'utf8'));
 if(preflightReport.blocked){
  console.error('Blocked: database overrides conflict with changed files — resolve first:',preflightReport.conflicts);
  process.exit(2);
 }
 derived=preflightReport.derivedChanges;
 unverified=preflightReport.unverifiedPaths;
}
const changed=derived.filter(change=>change.kind!=='candidate-deleted');
assert.equal(derived.filter(change=>change.kind==='candidate-deleted').length,0,'Deleted remote files present; removal transport is not implemented');

// 2-4. Backup, TUS upload, cache purge and public-URL verification of static assets.
let backupDir=null;
if(changed.length){
 backupDir=join(privateDir,'backups','incremental-'+Date.now());
 await mkdir(backupDir,{recursive:true});
 for(const change of changed){
  let content;
  if(isPhp(change.path)){
   content=(await cli(['files','website-content',user,domain,'--path',remoteRoot+'/'+change.path,'--from-line','0','--max-lines','5000'])).content;
  }else{
   const res=await fetch(publicBase+'/'+change.path);
   assert.equal(res.status,200,'Public backup failed for '+change.path);
   content=Buffer.from(await res.arrayBuffer());
  }
  await writeFile(join(backupDir,change.path.replaceAll('/','__')),content);
 }
 for(const change of changed){
  const local=await readFile(join(candidate,change.path));
  const creds=await cli(['files','generate-upload-url','--domain',domain,'--username',user]);
  const target=creds.url.replace(/\/$/,'')+'/'+remoteRoot+'/'+change.path+'?override=true';
  const tusHeaders={'X-Auth':creds.auth_key,'X-Auth-Rest':creds.rest_auth_key,'Tus-Resumable':'1.0.0'};
  const create=await fetch(target,{method:'POST',headers:{...tusHeaders,'Upload-Length':String(local.length),'Upload-Offset':'0'}});
  assert.equal(create.status,201,change.path+': TUS create returned '+create.status);
  const patch=await fetch(target,{method:'PATCH',headers:{...tusHeaders,'Upload-Offset':'0','Content-Type':'application/offset+octet-stream'},body:local});
  assert.equal(patch.status,204,change.path+': TUS patch returned '+patch.status);
  if(isPhp(change.path)){
   const remote=await cli(['files','website-content',user,domain,'--path',remoteRoot+'/'+change.path,'--from-line','0','--max-lines','5000']);
   assert.ok(remote.content.length>0,change.path+': remote read-back empty');
   assert.equal(digestOf(normalize(Buffer.from(remote.content,'utf8'))),digestOf(normalize(local)),change.path+': remote hash mismatch after upload');
  }
 }
 await cli(['cache','clear-website',user,domain]);
 for(const change of changed.filter(change=>!isPhp(change.path))){
  assert.equal(await publicHash(change.path),digestOf(await readFile(join(candidate,change.path))),change.path+': public URL hash mismatch after upload');
 }
}

// 5. Convergence: post-release baseline reports zero changes.
const after=changed.length?await baseline():report;
assert.equal(after.changes.length,0,'Post-release baseline still reports changes: '+JSON.stringify(after.changes));

// 6. Theme mode: previously unverifiable binaries get a public-URL integrity check.
const verifiedBinaries=[];
if(!pluginMode)for(const path of unverified){
 const local=join(candidate,path);
 if(await access(local).then(()=>true,()=>false)){
  assert.equal(await publicHash(path),digestOf(await readFile(local)),'Binary verification failed: '+path);
  verifiedBinaries.push(path);
 }
}
const final={testedAt:new Date().toISOString(),scope:'real-incremental-release-'+(pluginMode?'plugin':'theme')+'-files-only-not-full-deployment',kind:pluginMode?'plugin':'theme',domain,uploaded:changed.map(change=>change.path),backupDir:backupDir?backupDir.replace(resolve('.'), ''):null,converged:true,verifiedBinaries,dbOverridePaths:report.dbOverridePaths??[],limitations:['No database writes: enquiries untouched by construction','Rendered-page verification is a separate live check'],releaseApproval:false};
const evidenceName=pluginMode?'hostinger-incremental-release-plugin.json':'hostinger-incremental-release.json';
await writeFile(join(outputDir,evidenceName),JSON.stringify(final,null,2)+'\n');
console.log(JSON.stringify(final,null,2));
