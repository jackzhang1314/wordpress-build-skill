import {readFile,access} from 'node:fs/promises';
import {join} from 'node:path';
export async function loadPluginProfile(path){
 const profile=JSON.parse(await readFile(path,'utf8'));
 if(profile.schemaVersion!==1||profile.scope!=='new-sites-only'||!Array.isArray(profile.required))throw new Error('Unsupported plugin profile');
 const slugs=new Set();
 for(const p of profile.required){
  if(!/^[a-z0-9-]+$/.test(p.slug)||slugs.has(p.slug)||!/^\d+\.\d+(?:\.\d+)*$/.test(p.version)||!['wordpress.org','vendor','project'].includes(p.source))throw new Error('Invalid or duplicate plugin requirement');
  if(p.source==='vendor'&&(!p.url||new URL(p.url).protocol!=='https:'))throw new Error('Vendor package requires HTTPS');
  slugs.add(p.slug);
 }
 return profile;
}
export function verifyPluginInventory(profile,inventory){
 const checks=profile.required.map(p=>{
  const actual=inventory.find(row=>row.name===p.slug);
  return {slug:p.slug,expected:p.version,actual:actual?.version??null,active:actual?.status==='active',pass:actual?.version===p.version&&actual?.status==='active'};
 });
 const unexpectedActive=inventory.filter(row=>row.status==='active'&&!profile.required.some(p=>p.slug===row.name)).map(row=>row.name);
 return {pass:checks.every(c=>c.pass)&&unexpectedActive.length===0,checks,unexpectedActive};
}
// Called only by the isolated new-site bootstrap, not an upgrade/migration path.
export async function installRequiredPlugins({profile,wp,copy,cacheRoot,projectPlugin}){
 for(const p of profile.required){
  if(p.source==='project'){copy(projectPlugin,p.slug);}
  else{
   const cached=join(cacheRoot,p.slug);let exists=true;
   try{await access(cached);}catch(error){if(error.code!=='ENOENT')throw error;exists=false;}
   if(exists)copy(cached,p.slug);
   else if(p.source==='vendor')wp('plugin','install',p.url);
   else wp('plugin','install',p.slug,'--version='+p.version);
  }
  const actual=wp('plugin','get',p.slug,'--field=version').trim();
  if(actual!==p.version)throw new Error(p.slug+' version mismatch: expected '+p.version+', got '+actual+'; activation stopped');
 }
 // All versions must match before activating any dependency.
 wp('plugin','activate',...profile.required.map(p=>p.slug));
 const result=verifyPluginInventory(profile,JSON.parse(wp('plugin','list','--format=json')));
 if(!result.pass)throw new Error('Plugin activation inventory failed: '+JSON.stringify(result));
 return result;
}
