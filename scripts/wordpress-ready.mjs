import {readFile} from 'node:fs/promises';
import {setTimeout as delay} from 'node:timers/promises';
export async function waitForWordPress({url,artifact,php,wordpress,isRunning=()=>true,timeoutMs=120000}){
 const target=new URL(url);if(target.hostname!=='127.0.0.1'||target.protocol!=='http:')throw new Error('Readiness check is loopback-only');
 const deadline=Date.now()+timeoutMs;let last='No runtime evidence';
 while(Date.now()<deadline){
  if(!isRunning())throw new Error('WordPress exited before becoming ready; active pointer unchanged');
  try{
   const runtime=JSON.parse(await readFile(artifact,'utf8'));
   if(runtime.wordpress!==wordpress||!runtime.php.startsWith(php+'.'))throw new Error('Actual runtime version differs from target');
   const response=await fetch(url+'/wp-json/',{redirect:'error',signal:AbortSignal.timeout(Math.max(1,Math.min(3000,deadline-Date.now())))});
   if(!response.ok)throw new Error('REST readiness status '+response.status);
   const index=await response.json();if(!index.namespaces?.includes('wp/v2'))throw new Error('WordPress REST namespace unavailable');
   return runtime;
  }catch(error){last=error.message;}
  await delay(Math.min(500,Math.max(0,deadline-Date.now())));
 }
 throw new Error('WordPress readiness timeout; active pointer unchanged: '+last);
}
