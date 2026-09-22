// Read-only preview identity/cache gate. Production cache policy is intentionally separate.
import {pathToFileURL} from 'node:url';
import {writeFile} from 'node:fs/promises';
export function assessPreview({status,url,expectedUrl,html,cacheControl,expectedMarker}){
 const actual=new URL(url),expected=new URL(expectedUrl);
 const directives=cacheControl.toLowerCase().split(',').map(v=>v.trim());
 const checks={status:status===200,identity:actual.origin===expected.origin&&actual.pathname===expected.pathname&&!actual.search,content:html.includes(expectedMarker),htmlNotStored:directives.includes('no-store')};
 return {...checks,pass:Object.values(checks).every(Boolean)};
}
export async function checkPreview(base,expectedMarker,paths=['/']){
 if(!expectedMarker?.trim())throw new Error('An expected site content marker is required');
 const root=new URL(base);if(root.protocol!=='https:'||root.search||root.hash)throw new Error('Use the real HTTPS URL without query/hash');
 const pages=[];
 for(const path of paths){
  const expected=new URL(path,root);if(expected.origin!==root.origin||expected.search||expected.hash)throw new Error('Routes must stay on the real origin without query/hash');
  const response=await fetch(expected,{signal:AbortSignal.timeout(30000)}),html=await response.text();
  const cacheControl=response.headers.get('cache-control')??'';
  pages.push({requested:expected.href,final:response.url,status:response.status,cacheControl,cdnCache:response.headers.get('x-hcdn-cache-status'),checks:assessPreview({status:response.status,url:response.url,expectedUrl:expected.href,html,cacheControl,expectedMarker})});
 }
 return {testedAt:new Date().toISOString(),scope:'preview-only-fresh-network-not-existing-browser-cache',pages,pass:pages.every(p=>p.checks.pass)};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const [base,marker,output,...paths]=process.argv.slice(2);if(!output)throw new Error('Usage: node scripts/hostinger/check-preview.mjs HTTPS_URL EXPECTED_MARKER report.json [route ...]');
 const report=await checkPreview(base,marker,paths.length?paths:['/']);await writeFile(output,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(!report.pass)process.exitCode=1;
}
