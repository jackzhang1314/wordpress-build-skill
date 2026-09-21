// Real incremental theme release for the sanctioned Hostinger site.
// Gate chain: fresh read-only preflight (blocks on DB overrides) -> backup remote
// copies -> TUS upload of changed text files -> read-back hash verification ->
// cache purge -> convergence re-preflight. Binaries are out of scope and refused.
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {access} from 'node:fs/promises';
import {setTimeout as delay} from 'node:timers/promises';
const here=dirname(fileURLToPath(import.meta.url));
const candidate=resolve(process.argv[2]??'examples/b2b-block-starter/theme');
const privateDir=resolve('.wordpress-builder/hostinger');
const provision=JSON.parse(await readFile(join(privateDir,'provision.json'),'utf8'));
const domain=provision.domain,user=provision.username;
const run=promisify(execFile);
const sh=(cmd,args,opts={})=>run(cmd,args,{timeout:120000,maxBuffer:8*1024*1024,encoding:'utf8',...opts});
const transient=/deadline exceeded|TLS handshake timeout|connection reset|EOF|Client\.Timeout/i;
const cli=async args=>{
 for(let attempt=1;;attempt++){
  try{return JSON.parse((await sh('hostinger',['hosting',...args,'--format','json'])).stdout);}
  catch(error){
   if(attempt>=3||!transient.test(String(error.stderr??'')+String(error.message)))throw error;
   await delay(2000*attempt);
  }
 }
};
const outputDir=resolve('docs/acceptance/template-update');
const baselinePath=join(outputDir,'hostinger-baseline.json');
if(await access(baselinePath).then(()=>true,()=>false)){
 const previous=JSON.parse(await readFile(baselinePath,'utf8'));
 await writeFile(join(outputDir,'hostinger-baseline-'+previous.testedAt.slice(0,10).replaceAll('-','')+'.json'),JSON.stringify(previous,null,2)+'\n');
}

// 1. Gate: fresh preflight. Conflicts abort the release before any write.
const preflight=async()=>{
 await sh(process.execPath,[join(here,'remote-preflight.mjs'),candidate],{timeout:300000,maxBuffer:8*1024*1024});
 return JSON.parse(await readFile(join(outputDir,'hostinger-preflight.json'),'utf8'));
};
let report=await preflight();
if(report.blocked){
 console.error('Blocked: database overrides conflict with changed files — resolve first:',report.conflicts);
 process.exit(2);
}
const changed=report.derivedChanges.filter(change=>change.kind!=='candidate-deleted');
const deleted=report.derivedChanges.filter(change=>change.kind==='candidate-deleted');
assert.equal(deleted.length,0,'Deleted remote files present; removal transport is not implemented');
const binary=changed.filter(change=>report.unverifiedPaths.includes(change.path));
assert.equal(binary.length,0,'Refusing binary transport (unsupported): '+binary.map(change=>change.path).join(', '));
assert.ok(changed.length,'No changes to release; nothing to do');

// 2. Backup current remote content of every changed file (read-only API).
const backupDir=join(privateDir,'backups','incremental-'+Date.now());
await mkdir(backupDir,{recursive:true});
for(const change of changed){
 const content=await cli(['files','website-content',user,domain,'--path','wp-content/themes/b2b-equipment/'+change.path,'--from-line','0','--max-lines','5000']);
 await writeFile(join(backupDir,change.path.replaceAll('/','__')),content.content);
}

// 3. TUS upload each changed file, then read back and verify the remote hash.
const uploaded=[];
for(const change of changed){
 const local=await readFile(join(candidate,change.path));
 const creds=await cli(['files','generate-upload-url','--domain',domain,'--username',user]);
 const target=creds.url.replace(/\/$/,'')+'/wp-content/themes/b2b-equipment/'+change.path+'?override=true';
 const tusHeaders={'X-Auth':creds.auth_key,'X-Auth-Rest':creds.rest_auth_key,'Tus-Resumable':'1.0.0'};
 const create=await fetch(target,{method:'POST',headers:{...tusHeaders,'Upload-Length':String(local.length),'Upload-Offset':'0'}});
 assert.equal(create.status,201,change.path+': TUS create returned '+create.status);
 const patch=await fetch(target,{method:'PATCH',headers:{...tusHeaders,'Upload-Offset':'0','Content-Type':'application/offset+octet-stream'},body:local});
 assert.equal(patch.status,204,change.path+': TUS patch returned '+patch.status);
 const remote=await cli(['files','website-content',user,domain,'--path','wp-content/themes/b2b-equipment/'+change.path,'--from-line','0','--max-lines','5000']);
 assert.ok(remote.content.length>0,change.path+': remote read-back empty');
 assert.equal(createHash('sha256').update(normalize(Buffer.from(remote.content,'utf8'))).digest('hex'),createHash('sha256').update(normalize(local)).digest('hex'),change.path+': remote hash mismatch after upload');
 uploaded.push(change.path);
}
function normalize(buffer){return buffer.at(-1)===10?buffer.subarray(0,-1):buffer;}

// 4. Purge site cache, then converge: fresh preflight must report zero changes.
 await cli(['cache','clear-website',user,domain]);
const after=await preflight();
assert.equal(after.derivedChanges.length,0,'Post-release preflight still reports changes: '+JSON.stringify(after.derivedChanges));
const final={testedAt:new Date().toISOString(),scope:'real-incremental-release-files-only-not-full-deployment',domain,uploaded:changed.map(change=>change.path),backupDir:backupDir.replace(resolve('.'),'' ),converged:after.derivedChanges.length===0,postOverrides:after.dbOverridePaths,limitations:['No database writes: enquiries untouched by construction','Binary files not transported','Rendered-page verification is a separate live check'],releaseApproval:false};
await writeFile(join(outputDir,'hostinger-incremental-release.json'),JSON.stringify(final,null,2)+'\n');
console.log(JSON.stringify(final,null,2));
