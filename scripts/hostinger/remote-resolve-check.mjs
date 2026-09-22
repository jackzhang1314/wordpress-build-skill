// Live rehearsal of remote conflict resolution on the sanctioned Hostinger site:
// create a unique custom template override -> reset (backup+delete) -> restore.
// Everything is owned, hashed, and removed in finally; site stays noindex.
import {readFile,writeFile,mkdir,mkdtemp,rm} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {restSession} from './rest-session.mjs';
const here=dirname(fileURLToPath(import.meta.url));
const provision=JSON.parse(await readFile(resolve('.wordpress-builder/hostinger/provision.json'),'utf8'));
const admin=JSON.parse(await readFile(resolve('.wordpress-builder/hostinger/wordpress-admin.json'),'utf8'));
const base='https://'+provision.domain;
const session=await restSession(base,admin.login,admin.password);
const cli=args=>{try{return {code:0,out:execFileSync(process.execPath,[join(here,'remote-resolve.mjs'),...args],{encoding:'utf8',timeout:120000,stdio:['pipe','pipe','pipe']})};}catch(e){return {code:e.status,out:String(e.stdout??'')+String(e.stderr??'')};}};
const run=await mkdtemp(resolve('.wordpress-builder/hostinger/backups/rehearsal-'));
const checks={};let slug,id,contentHash;
try{
 const setupSlug='harness-rresolve-'+Date.now().toString(16);
 const createRes=await session.request('wp/v2/templates',{method:'POST',body:{slug:setupSlug,title:setupSlug,content:'<!-- wp:paragraph --><p>OPERATOR EDIT</p><!-- /wp:paragraph -->',status:'publish'}});
 assert.equal(createRes.status,201,'fixture create failed: '+createRes.status);
 const created=await createRes.json();
 slug=setupSlug;id=created.id;
 contentHash=(await import('node:crypto')).createHash('sha256').update(typeof created.content==='object'?created.content.raw:created.content).digest('hex');
 checks.fixtureCreated=id==='b2b-equipment//'+slug;

 const backupPath=join(run,'backup.json');
 const resetRun=cli(['reset','--backup',backupPath,'templates/'+slug+'.html']);
 const resetReport=JSON.parse(resetRun.out);
 checks.resetSucceeded=resetRun.code===0&&resetReport.decision==='reset';
 const backup=JSON.parse(await readFile(backupPath,'utf8'));
 checks.backupCapturesOperatorContent=backup.entries.length===1&&backup.entries[0].content.includes('OPERATOR EDIT')&&backup.entries[0].contentHash===contentHash&&backup.domain===provision.domain;
 const goneRes=await session.request('wp/v2/templates/'+encodeURIComponent(id)+'?context=edit');
 checks.overrideGoneAfterReset=goneRes.status===404;

 const restoreRun=cli(['restore',backupPath]);
 const restoreReport=JSON.parse(restoreRun.out);
 checks.restoreSucceeded=restoreRun.code===0&&restoreReport.decision==='restore';
 const backRes=await session.request('wp/v2/templates/'+encodeURIComponent(id)+'?context=edit');
 const back=await backRes.json();
 const backContent=(await import('node:crypto')).createHash('sha256').update(typeof back.content==='object'?back.content.raw:back.content).digest('hex');
 checks.operatorEditRestored=backRes.status===200&&back.source==='custom'&&back.status==='publish'&&backContent===contentHash;

 const missing=cli(['reset','--backup',join(run,'unused.json'),'templates/harness-rresolve-missing.html']);
 checks.resetRefusesMissingOverride=missing.code===1&&missing.out.includes('No published override at');
}finally{
 if(id){
  const del=await session.request('wp/v2/templates/'+encodeURIComponent(id)+'?force=true',{method:'DELETE'});
  checks.cleanup=del.status===200&&(await (async()=>{const g=await session.request('wp/v2/templates/'+encodeURIComponent(id)+'?context=edit');return g.status===404;})());
 }
 await rm(run,{recursive:true,force:true});
}
assert.ok(Object.values(checks).every(Boolean),'Failed: '+JSON.stringify(checks));
const output=resolve('docs/acceptance/template-update');await mkdir(output,{recursive:true});
await writeFile(join(output,'hostinger-resolve.json'),JSON.stringify({testedAt:new Date().toISOString(),scope:'hostinger-rest-remote-conflict-resolution-not-full-deployment',slug,checks,notCovered:['wp-cli-based-remote-resolution','enquiry-table-hash-during-remote-resolution-structurally-unreachable-via-rest','binary-and-plugin-incremental-transport']},null,2)+'\n');
console.log(JSON.stringify(checks,null,2));
