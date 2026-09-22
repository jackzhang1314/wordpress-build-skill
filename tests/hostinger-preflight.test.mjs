import test from 'node:test';
import assert from 'node:assert/strict';
import {validateTarget,sshArgs,shellQuote,assessRemote} from '../scripts/hostinger/preflight.mjs';
const fixture={provider:'hostinger',environment:'staging',sshAlias:'hostinger-staging',wordpressPath:'/home/test/domains/example.test/public_html',expectedUrl:'https://staging.example.test'};
test('Hostinger preflight rejects shell injection, credentials and production targets',()=>{
 for(const patch of [{sshAlias:'-oProxyCommand=bad'},{sshAlias:'site; touch bad'},{wordpressPath:'/home/../prod'},{wordpressPath:'/home/$(bad)'},{expectedUrl:'https://user:secret@example.test'},{environment:'production'},{token:'secret'}])assert.throws(()=>validateTarget({...fixture,...patch}));
 assert.equal(validateTarget(fixture).expectedUrl,fixture.expectedUrl);
 assert.equal(shellQuote("a'b"),"'a'\\''b'");
 const args=sshArgs(fixture,'php -v');assert.ok(args.includes('StrictHostKeyChecking=yes'));assert.ok(args.includes('BatchMode=yes'));assert.ok(args.includes('ForwardAgent=no'));
});
test('Remote checks fail for wrong site, indexable preview and unwritable directory',()=>{
 const good={home:fixture.expectedUrl,siteurl:fixture.expectedUrl,blogPublic:'0',writable:'yes'};
 assert.equal(assessRemote(fixture,good).pass,true);
 for(const patch of [{home:'https://wrong.test'},{siteurl:'https://wrong.test'},{blogPublic:'1'},{writable:'no'}])assert.equal(assessRemote(fixture,{...good,...patch}).pass,false);
});
test('example configuration cannot be used for a live SSH probe',async()=>{
 const {execFileSync}=await import('node:child_process');
 assert.throws(()=>execFileSync(process.execPath,['scripts/hostinger/preflight.mjs','config/hostinger-staging.example.json','--connect'],{stdio:'pipe'}),error=>error.status===1&&error.stderr.toString().includes('Invalid or missing target configuration'));
});
