// Read-only deployed resource verification. HTML 200 alone is not a deployment pass.
import {pathToFileURL} from 'node:url';
import {writeFile} from 'node:fs/promises';
export function collectAssets(html,base){
 const origin=new URL(base).origin,assets=new Set();
 for(const match of html.matchAll(/\b(src|href|srcset)\s*=\s*(["'])(.*?)\2/gs)){
  const values=match[1]==='srcset'?match[3].split(',').map(v=>v.trim().split(/\s+/)[0]):[match[3]];
  for(const value of values){
   const decoded=value.replace(/&(?:amp|#0*38|#x0*26);/gi,'&');
   let url;try{url=new URL(decoded,base);}catch{continue;}
   if(url.origin===origin&&/\.(css|js|png|jpe?g|webp|avif|gif|svg|woff2?)(?:$)/i.test(url.pathname))assets.add(url.href);
  }
 }
 return [...assets].sort();
}
export function validAsset(url,status,type){
 if(status!==200)return false;
 const path=new URL(url).pathname;
 if(/\.css$/i.test(path))return /text\/css/i.test(type);
 if(/\.js$/i.test(path))return /(?:javascript|ecmascript)/i.test(type);
 if(/\.(png|jpe?g|webp|avif|gif|svg)$/i.test(path))return /^image\//i.test(type);
 return !/text\/html/i.test(type);
}
export async function checkAssets(base,paths){
 const urls=new Set();
 for(const path of paths){const page=new URL(path,base);if(page.origin!==new URL(base).origin)throw new Error('Cross-origin route rejected');const r=await fetch(page,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw new Error('Route failed: '+page.pathname+' '+r.status);for(const u of collectAssets(await r.text(),page))urls.add(u);}
 if(!urls.size)throw new Error('No static assets found');
 const queue=[...urls],results=[];
 await Promise.all(Array.from({length:4},async()=>{while(queue.length){const url=queue.shift();try{const r=await fetch(url,{signal:AbortSignal.timeout(30000)});const type=r.headers.get('content-type')??'';await r.arrayBuffer();results.push({url,status:r.status,type,pass:validAsset(url,r.status,type)});}catch(e){results.push({url,pass:false,error:e.name});}}}));
 return {testedAt:new Date().toISOString(),base,assets:results.sort((a,b)=>a.url.localeCompare(b.url)),pass:results.every(r=>r.pass)};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const [base,output,...paths]=process.argv.slice(2);if(!base||!output)throw new Error('Usage: node scripts/hostinger/check-assets.mjs URL report.json [route ...]');
 const report=await checkAssets(base,paths.length?paths:['/']);await writeFile(output,JSON.stringify(report,null,2));console.log(JSON.stringify({pass:report.pass,assets:report.assets.length,failed:report.assets.filter(a=>!a.pass)}));if(!report.pass)process.exitCode=1;
}
