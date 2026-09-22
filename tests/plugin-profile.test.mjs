import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {loadPluginProfile,verifyPluginInventory,installRequiredPlugins} from '../examples/b2b-block-starter/scripts/plugins.mjs';
const profile=await loadPluginProfile('config/wordpress-plugins.json');
const inventory=profile.required.map(p=>({name:p.slug,version:p.version,status:'active'}));
test('plugin gate rejects missing, inactive, drifted and extra active dependencies',()=>{
 assert.equal(verifyPluginInventory(profile,inventory).pass,true);
 for(const bad of [inventory.slice(1),inventory.map((p,i)=>i===0?{...p,status:'inactive'}:p),inventory.map((p,i)=>i===0?{...p,version:'0.0.1'}:p),[...inventory,{name:'extra-seo',version:'1.0.0',status:'active'}]])assert.equal(verifyPluginInventory(profile,bad).pass,false);
});
test('bootstrap uses declared vendor and pinned repository sources before activation',async()=>{
 const root=await mkdtemp(join(tmpdir(),'wp-plugins-'));const calls=[];
 try{await installRequiredPlugins({profile,cacheRoot:root,projectPlugin:'/source/project-plugin',copy:(...args)=>calls.push(['copy',...args]),wp:(...args)=>{calls.push(args);if(args[1]==='get')return profile.required.find(p=>p.slug===args[2]).version;if(args[1]==='list')return JSON.stringify(inventory);return '';}});
 assert.ok(calls.some(c=>c[1]==='install'&&c[2]===profile.required[0].url));
 assert.ok(calls.some(c=>c[1]==='install'&&c[2]==='fluentform'&&c.includes('--version=6.2.9')));
 assert.ok(calls.findIndex(c=>c[1]==='activate')>calls.findLastIndex(c=>c[1]==='get'));
 }finally{await rm(root,{recursive:true});}
});
test('wrong package version stops before activation; malformed profiles fail early',async()=>{
 const root=await mkdtemp(join(tmpdir(),'wp-plugins-'));let activated=false;
 try{await assert.rejects(installRequiredPlugins({profile,cacheRoot:root,projectPlugin:'/source/plugin',copy:()=>{},wp:(...args)=>{if(args[1]==='activate')activated=true;return args[1]==='get'?'0.0.1':'';}}),/version mismatch/);assert.equal(activated,false);
 const path=join(root,'bad.json');await writeFile(path,JSON.stringify({...profile,required:[profile.required[0],profile.required[0]]}));await assert.rejects(loadPluginProfile(path),/duplicate/);
 }finally{await rm(root,{recursive:true});}
});
