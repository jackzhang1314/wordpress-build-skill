import test from 'node:test';import assert from 'node:assert/strict';
import {harnessDoctor} from '../scripts/harness-doctor.mjs';
const ready=(name,args)=>args.includes('capabilities')?JSON.stringify({ok:true,result:{integrity:'verified'}}):'version';
test('ready checks do not create a site or require host WP-CLI/MCP',()=>{const calls=[];const r=harnessDoctor({nodeVersion:'22.0.0',exists:()=>true,run:(n,a)=>{calls.push([n,a]);return ready(n,a);}});assert.equal(r.ready,true);assert.equal(r.siteCreated,false);assert.ok(!calls.some(([n])=>['wp','hostinger','brew'].includes(n)));});
test('missing npm dependencies and runtime get installed and built explicitly',()=>{const calls=[];const r=harnessDoctor({setup:true,exists:()=>false,run:(n,a)=>{calls.push([n,a]);return ready(n,a);}});assert.equal(r.ready,true);assert.ok(calls.some(([n,a])=>n==='npm'&&a[0]==='ci'));});
test('Docker CLI alone is insufficient and default check never installs',()=>{const calls=[];const r=harnessDoctor({exists:()=>true,run:(n,a)=>{calls.push(n);if(n==='docker'&&a[0]==='info')throw new Error('daemon off');return ready(n,a);}});assert.equal(r.ready,false);assert.equal(r.checks.dockerEngine,false);assert.ok(!calls.includes('brew'));});
test('unsupported Node exits before any command or write',()=>{assert.equal(harnessDoctor({nodeVersion:'18.0.0',run:()=>{throw new Error('must not run');}}).ready,false);});
