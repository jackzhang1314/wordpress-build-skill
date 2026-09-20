import test from 'node:test';
import assert from 'node:assert/strict';
import {setupHostinger} from '../.agents/skills/wordpress-builder/scripts/hostinger-setup.mjs';
const missing=()=>{throw Object.assign(new Error('missing'),{code:'ENOENT'});};
test('missing CLI is detected without implicit installation or account calls',()=>{
 const calls=[];const r=setupHostinger({run:(name,args)=>{calls.push([name,args]);missing();}});assert.equal(r.cli,'missing');assert.equal(calls.length,1);
});
test('explicit setup installs official brew formula and checks account without exposing data',()=>{
 let installed=false;const calls=[];const r=setupHostinger({install:true,connect:true,platform:'darwin',run:(name,args)=>{calls.push([name,args]);if(name==='brew'){if(args[0]==='install')installed=true;return 'brew';}if(args[0]==='version'){if(!installed)missing();return '3.35.0';}return '{"data":[{"private":"do-not-print"}]}';}});
 assert.equal(r.account,'hosting-orders-readable');assert.ok(calls.some(([n,a])=>n==='brew'&&a.join(' ')==='install hostinger/tap/hostinger'));assert.ok(!JSON.stringify(r).includes('do-not-print'));
});
test('existing CLI is preserved and failures do not leak secrets or imply authentication success',()=>{
 const r=setupHostinger({install:true,connect:true,run:(name,args)=>{assert.equal(name,'hostinger');if(args[0]==='version')return '3.35.0';throw new Error('PRIVATE_TOKEN');}});assert.equal(r.account,'login-or-api-check-incomplete');assert.ok(!JSON.stringify(r).includes('PRIVATE_TOKEN'));
});
test('unsupported installer returns official release instructions rather than shell downloads',()=>{
 const r=setupHostinger({install:true,platform:'win32',run:missing});assert.equal(r.installation,'official-release-required');
});
test('CLI entrypoint runs instead of silently exiting',async()=>{
 const {spawnSync}=await import('node:child_process');
 const output=spawnSync(process.execPath,['.agents/skills/wordpress-builder/scripts/hostinger-setup.mjs'],{encoding:'utf8'});
 assert.ok([0,1].includes(output.status));
 assert.equal(JSON.parse(output.stdout).scope,'hostinger-tool-bootstrap');
});
