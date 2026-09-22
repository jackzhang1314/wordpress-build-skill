// Read-only theme comparison through the official Hostinger CLI.
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {createHash} from 'node:crypto';
import {writeFile} from 'node:fs/promises';
import {setTimeout as delay} from 'node:timers/promises';
import {dirInventory} from '../../examples/b2b-block-starter/scripts/release/theme-diff.mjs';
import assert from 'node:assert/strict';
const [user,domain,theme,candidate,output,kind='theme']=process.argv.slice(2);
assert.ok(user&&/^[a-z0-9]+$/.test(user)&&domain&&/^[a-z0-9.-]+$/.test(domain)&&theme&&/^[a-z0-9_-]+$/.test(theme)&&candidate&&output,'Usage: USER DOMAIN THEME CANDIDATE_DIR REPORT.json [KIND=theme|plugin]');
assert.ok(kind==='theme'||kind==='plugin','KIND must be theme or plugin');
const run=promisify(execFile),root=kind==='plugin'?'wp-content/plugins/'+theme:'wp-content/themes/'+theme;
const transient=/deadline exceeded|TLS handshake timeout|connection reset|EOF|Client\.Timeout/i;
const cli=async args=>{
 for(let attempt=1;;attempt++){
  try{return JSON.parse((await run('hostinger',['hosting','files',...args,'--format','json'],{timeout:60000,maxBuffer:8*1024*1024})).stdout);}
  catch(error){
   if(attempt>=3||!transient.test(String(error.stderr??'')+String(error.message)))throw error;
   await delay(2000*attempt);
  }
 }
};
async function listing(){
 const entries=[];let total;
 do{
  const r=await cli(['list-website-and-directories',user,domain,'--directory',root,'--max-depth','10','--max-items','1000','--offset',String(entries.length)]);
  assert.equal(r.path,root);assert.ok(Array.isArray(r.items));assert.ok(Number.isSafeInteger(r.total_items));
  total??=r.total_items;assert.equal(total,r.total_items,'Directory changed while paginating');
  assert.ok(r.items.length||entries.length===total,'Incomplete listing');entries.push(...r.items);
 }while(entries.length<total);
 assert.equal(entries.length,total);assert.equal(new Set(entries.map(e=>e.path)).size,total);
 for(const e of entries){assert.ok(typeof e.path==='string'&&!e.path.startsWith('/')&&!e.path.split('/').some(p=>['','..','.'].includes(p)));assert.ok(['file','directory'].includes(e.type),'Unsupported remote entry');assert.ok(e.type!=='directory'||e.path.split('/').length<10,'Listing depth limit reached');}
 return entries.sort((a,b)=>a.path.localeCompare(b.path));
}
const entries=await listing(),local=await dirInventory(candidate,kind==='plugin'?['site-model.php']:['style.css','theme.json']),remote={},unverified=[],normalized=[];
const files=entries.filter(e=>e.type==='file');
for(let offset=0;offset<files.length;offset+=4){
 await Promise.all(files.slice(offset,offset+4).map(async e=>{
  // The content endpoint refuses binary files; retain an explicit coverage gap.
if(!/\.(php|html|css|js|json|txt|md)$/i.test(e.path)){unverified.push(e.path);return;}
 let r;
 for(let attempt=1;;attempt++){
  try{
   r=await cli(['website-content',user,domain,'--path',root+'/'+e.path,'--from-line','0','--max-lines','5000']);
   assert.equal(r.path,root+'/'+e.path);
   break;
  }catch(error){
   const text=String(error.stdout??'')+String(error.stderr??'')+String(error.message);
   // Credential-bearing files are refused by the hosting API; they are as
   // unverifiable as binaries and stay out of the change set.
   if(/sensitive credentials/i.test(text)){unverified.push(e.path);break;}
   if(attempt>=3)throw error;
   await delay(2000*attempt);
  }
 }
 if(!r)return;
 assert.equal(Number(r.from_line),0);
  const bytes=Buffer.from(r.content);assert.equal(Number(r.size_bytes),e.size_bytes);
  if(bytes.length!==e.size_bytes){
 // The endpoint stripped exactly one byte (the final LF). Store the hash of the
 // stripped bytes under the normalized set; derivation compares candidates
 // modulo the trailing LF, so pending candidate changes still classify correctly.
 assert.ok(bytes.length+1===e.size_bytes,'Incomplete or unexplained remote content: '+e.path);
  normalized.push(e.path);
 }
  remote[e.path]=createHash('sha256').update(bytes).digest('hex');
 }));
}
assert.deepEqual(await listing(),entries,'Remote directory changed during read');
const changes=[...new Set([...Object.keys(local),...files.map(e=>e.path)])].sort().filter(p=>!unverified.includes(p)&&!normalized.includes(p)&&local[p]!==remote[p]).map(path=>({path,kind:!remote[path]?'candidate-added':!local[path]?'candidate-deleted':'modified'}));
const report={testedAt:new Date().toISOString(),domain,theme,scope:'read-only-remote-text-files-vs-local-candidate',remoteFiles:files.length,verifiedTextFiles:Object.keys(remote).length,changes,unverified:unverified.sort(),remoteResponseHashes:remote,normalizedFinalNewlineMatches:normalized.sort(),releaseApproval:false,limitations:['No atomic filesystem snapshot; same-size concurrent edits may evade directory consistency check','Endpoint may strip final newline; normalized matches are not byte-exact remote file verification','Binary files not downloaded','Database overrides and plugin files not covered']};
await writeFile(output,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({verifiedTextFiles:report.verifiedTextFiles,changes,unverified:report.unverified,releaseApproval:false}));
