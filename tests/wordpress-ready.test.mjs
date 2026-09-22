import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createServer} from 'node:http';
import {waitForWordPress} from '../scripts/wordpress-ready.mjs';
async function fixture(t,runtime,response){
 const dir=await mkdtemp(join(tmpdir(),'wp-ready-test-'));const artifact=join(dir,'runtime.json');await writeFile(artifact,JSON.stringify(runtime));
 const server=createServer((_request,res)=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(response));});await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 t.after(async()=>{server.closeAllConnections();await new Promise(ok=>server.close(ok));await rm(dir,{recursive:true});});
 return {url:'http://127.0.0.1:'+server.address().port,artifact,php:'8.3',wordpress:'7.1.1',timeoutMs:80};
}
test('ready requires actual runtime evidence and WordPress REST namespace',async t=>{const config=await fixture(t,{wordpress:'7.1.1',php:'8.3.32'},{namespaces:['wp/v2']});assert.equal((await waitForWordPress(config)).php,'8.3.32');});
test('wrong runtime version never becomes ready',async t=>{const config=await fixture(t,{wordpress:'7.1.1',php:'8.5.8'},{namespaces:['wp/v2']});await assert.rejects(waitForWordPress(config),/Actual runtime version differs/);});
test('HTTP success alone does not establish WordPress readiness',async t=>{const config=await fixture(t,{wordpress:'7.1.1',php:'8.3.32'},{startup:true});await assert.rejects(waitForWordPress(config),/REST namespace unavailable/);});
test('early process exit aborts without waiting for timeout',async()=>{await assert.rejects(waitForWordPress({url:'http://127.0.0.1:1',artifact:'unused',isRunning:()=>false}),/exited before becoming ready/);});
