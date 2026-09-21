import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {createHash} from 'node:crypto';
import {loadBaselineFiles,deriveBaselineChanges} from '../examples/b2b-block-starter/scripts/release/baseline.mjs';
const sha=data=>createHash('sha256').update(data).digest('hex');
async function theme(root,files){
 await mkdir(root,{recursive:true});
 for(const [path,data] of Object.entries(files)){
  await mkdir(dirname(join(root,path)),{recursive:true});
  await writeFile(join(root,path),data);
 }
}
test('baseline loader accepts inventory and Hostinger shapes and rejects malformed input',()=>{
 const local=loadBaselineFiles({shape:'local-inventory',files:{'style.css':sha('a'),'theme.json':sha('b')}});
 assert.equal(local.shape,'local-inventory');assert.equal(Object.keys(local.files).length,2);assert.deepEqual(local.normalized,[]);
 const hostinger=loadBaselineFiles({remoteResponseHashes:{'style.css':sha('a')},normalizedFinalNewlineMatches:['style.css'],unverified:['screenshot.png']});
 assert.equal(hostinger.shape,'hostinger-baseline');assert.deepEqual(hostinger.normalized,['style.css']);assert.deepEqual(hostinger.unverified,['screenshot.png']);
 for(const bad of [null,'x',42,[],{},{files:[]},{files:{'../evil':sha('a')}},{files:{'/abs':sha('a')}},{files:{'style.css':'nothash'}},{remoteResponseHashes:{'style.css':sha('a')},unverified:'x'},{remoteResponseHashes:{'a/../b':sha('a')}},{remoteResponseHashes:[]}])assert.throws(()=>loadBaselineFiles(bad));
 assert.throws(()=>loadBaselineFiles({}),/Baseline must contain a files inventory or a Hostinger remoteResponseHashes map/);
});
test('derives candidate-added/deleted/modified and filters override paths',async()=>{
 const root=await mkdtemp(join(tmpdir(),'baseline-derive-'));
 try{
  const before=join(root,'before'),after=join(root,'after');
  const files={'style.css':'v1','theme.json':'{}\n','templates/index.html':'idx','parts/header.html':'hdr','assets/css/main.css':'css1'};
  await theme(before,files);
  const inventory={shape:'local-inventory',savedAt:'2026-09-21T00:00:00Z',files:{}};
  for(const [path,data] of Object.entries(files))inventory.files[path]=sha(Buffer.from(data));
  await theme(after,{'style.css':'v2','theme.json':'{}\n','templates/new.html':'new','parts/header.html':'hdr','assets/css/main.css':'css2'});
  const d=await deriveBaselineChanges(inventory,after);
  assert.equal(d.shape,'local-inventory');assert.equal(d.candidateFiles,5);assert.equal(d.baselineFiles,5);
  assert.deepEqual(d.changes,[
   {path:'assets/css/main.css',kind:'modified'},
   {path:'style.css',kind:'modified'},
   {path:'templates/index.html',kind:'candidate-deleted'},
   {path:'templates/new.html',kind:'candidate-added'},
  ]);
  assert.deepEqual(d.overridePaths,['templates/index.html','templates/new.html']);
  assert.equal(d.requiresPageRegression,true);assert.deepEqual(d.unverified,[]);
 }finally{await rm(root,{recursive:true,force:true});}
});
test('normalized final-newline baselines match modulo trailing LF and keep unverified paths out of changes',async()=>{
 const root=await mkdtemp(join(tmpdir(),'baseline-normalized-'));
 try{
  const dir=join(root,'candidate');
  const body=Buffer.from('template body');
  await theme(dir,{'style.css':'css','theme.json':'{}\n','templates/index.html':Buffer.concat([body,Buffer.from('\n')]),'screenshot.png':Buffer.from('binary')});
  const report={remoteResponseHashes:{'style.css':sha(Buffer.from('css')),'theme.json':sha(Buffer.from('{}\n')),'templates/index.html':sha(body)},normalizedFinalNewlineMatches:['templates/index.html'],unverified:['screenshot.png']};
  const unchanged=await deriveBaselineChanges(report,dir);
  assert.deepEqual(unchanged.changes,[]);assert.deepEqual(unchanged.overridePaths,[]);
  await writeFile(join(dir,'templates/index.html'),'template body v2\n');
  const changed=await deriveBaselineChanges(report,dir);
  assert.deepEqual(changed.changes,[{path:'templates/index.html',kind:'modified'}]);
  assert.deepEqual(changed.overridePaths,['templates/index.html']);
  assert.deepEqual(changed.unverified,['screenshot.png']);
 }finally{await rm(root,{recursive:true,force:true});}
});
test('exact candidate match of stripped remote bytes stays unchanged',async()=>{
 const root=await mkdtemp(join(tmpdir(),'baseline-exact-'));
 try{
  const dir=join(root,'candidate');
  const body=Buffer.from('no trailing newline');
  await theme(dir,{'style.css':'css','theme.json':'{}'});
  await writeFile(join(dir,'theme.json'),body);
  const report={remoteResponseHashes:{'style.css':sha(Buffer.from('css')),'theme.json':sha(body)},normalizedFinalNewlineMatches:[],unverified:[]};
  assert.deepEqual((await deriveBaselineChanges(report,dir)).changes,[]);
 }finally{await rm(root,{recursive:true,force:true});}
});
test('LF-only candidate variance stays unchanged and real changes still classify',async()=>{
 const root=await mkdtemp(join(tmpdir(),'baseline-lf-'));
 try{
  const dir=join(root,'candidate');
  const remoteBytes=Buffer.from('template v1'); // remote without trailing LF
  await theme(dir,{'style.css':'css','theme.json':'{}','templates/page.html':Buffer.concat([remoteBytes,Buffer.from('\n')])});
  const report={remoteResponseHashes:{'style.css':sha(Buffer.from('css')),'theme.json':sha(Buffer.from('{}\n')),'templates/page.html':sha(remoteBytes)},normalizedFinalNewlineMatches:[],unverified:[]};
  // Candidate identical except its own trailing LF: unchanged.
  assert.deepEqual((await deriveBaselineChanges(report,dir)).changes,[]);
  // Candidate truly changed: modified even though a LF-stripped comparison is in play.
  await writeFile(join(dir,'templates/page.html'),'template v2\n');
  const changed=await deriveBaselineChanges(report,dir);
  assert.deepEqual(changed.changes,[{path:'templates/page.html',kind:'modified'}]);
 }finally{await rm(root,{recursive:true,force:true});}
});
test('CLI rejects malformed baseline usage before touching lab state',async()=>{
 const {execFileSync}=await import('node:child_process');
 assert.throws(()=>execFileSync(process.execPath,['examples/b2b-block-starter/scripts/update-preflight.mjs','--baseline','only-report.json'],{stdio:'pipe'}),error=>error.status===1&&error.stderr.toString().includes('Usage: --baseline'));
 assert.throws(()=>execFileSync(process.execPath,['examples/b2b-block-starter/scripts/update-preflight.mjs','--snapshot','only-dir'],{stdio:'pipe'}),error=>error.status===1&&error.stderr.toString().includes('Usage: --snapshot'));
});
