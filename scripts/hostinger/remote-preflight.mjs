// Read-only remote preflight for Hostinger Managed WordPress:
// fresh theme baseline (official CLI, file reads) + offline change derivation +
// authenticated REST template-override inventory. No writes to the site.
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {readFile,writeFile,copyFile,access} from 'node:fs/promises';
import {mkdir} from 'node:fs/promises';
import {dirname,resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import {deriveBaselineChanges} from '../../examples/b2b-block-starter/scripts/release/baseline.mjs';
import {restSession} from './rest-session.mjs';
const here=dirname(fileURLToPath(import.meta.url));
export function restOverridesToPaths(items){
 const paths=[];
 for(const item of items){
  if(item.type==='wp_global_styles'){paths.push('theme.json');continue;}
  if(item.source!=='custom'||item.status!=='publish')continue;
  const slug=String(item.id).split('//')[1];
  if(!slug)throw new Error('Unexpected REST template id: '+item.id);
  paths.push((item.type==='wp_template'?'templates/':'parts/')+slug+'.html');
 }
 return [...new Set(paths)].sort();
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const candidateDir=resolve(process.argv[2]??'examples/b2b-block-starter/theme');
 const privateDir=resolve('.wordpress-builder/hostinger');
 const outputDir=resolve('docs/acceptance/template-update');
 const provision=JSON.parse(await readFile(join(privateDir,'provision.json'),'utf8'));
 const admin=JSON.parse(await readFile(join(privateDir,'wordpress-admin.json'),'utf8'));
 const domain=provision.domain,base='https://'+domain,user=provision.username;
 assert.ok(/^[a-z0-9.-]+$/.test(domain)&&/^[a-z0-9]+$/.test(user)&&admin.login&&admin.password,'Invalid private provisioning state');
 // 1. Fresh remote baseline through the established read-only CLI comparison.
 const baselinePath=join(outputDir,'hostinger-baseline.json');
 if(await access(baselinePath).then(()=>true,()=>false)){
  const previous=JSON.parse(await readFile(baselinePath,'utf8'));
  await copyFile(baselinePath,join(outputDir,'hostinger-baseline-'+previous.testedAt.slice(0,10).replaceAll('-','')+'.json'));
 }
 await promisify(execFile)(process.execPath,[join(here,'theme-baseline.mjs'),user,domain,'b2b-equipment',candidateDir,baselinePath],{timeout:300000,maxBuffer:8*1024*1024});
 const baseline=JSON.parse(await readFile(baselinePath,'utf8'));
 // 2. Offline derivation: remote hashes vs candidate directory.
 const derived=await deriveBaselineChanges(baseline,candidateDir);
 // 3. Authenticated REST override inventory (GET only).
 const session=await restSession(base,admin.login,admin.password);
 const api=session.api;
 const collections=await Promise.all([
  api('wp/v2/templates?context=edit&per_page=100'),
  api('wp/v2/template-parts?context=edit&per_page=100'),
 ]);
 let globalStyles;
 try{globalStyles=await api('wp/v2/global-styles?context=edit&per_page=100');}
 catch{globalStyles=null;}
 const restItems=[...collections[0].map(item=>({type:'wp_template',...item})),...collections[1].map(item=>({type:'wp_template_part',...item}))];
 if(globalStyles)for(const item of globalStyles)restItems.push({type:'wp_global_styles',...item});
 // 4. Conflict intersection.
 const dbOverridePaths=restOverridesToPaths(restItems);
 const conflicts=derived.overridePaths.filter(path=>dbOverridePaths.includes(path));
 const report={testedAt:new Date().toISOString(),scope:'read-only-remote-preflight-cli-baseline-plus-rest-overrides',domain,theme:'b2b-equipment',candidate:candidateDir,remoteFiles:baseline.remoteFiles,verifiedTextFiles:baseline.verifiedTextFiles,derivedChanges:derived.changes,derivedOverridePaths:derived.overridePaths,unverifiedPaths:derived.unverified,requiresPageRegression:derived.requiresPageRegression,dbOverridePaths,conflicts,blocked:conflicts.length>0,globalStylesViaRest:Boolean(globalStyles),releaseApproval:false,limitations:['No writes performed; blocking only signals required conflict resolution','Binary files and database content overrides beyond templates/parts/global-styles are not covered','Baseline reflects read time; remote may change afterwards']};
 await mkdir(outputDir,{recursive:true});
 await writeFile(join(outputDir,'hostinger-preflight.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({verifiedTextFiles:report.verifiedTextFiles,derivedChanges:derived.changes.length,derivedOverridePaths:derived.overridePaths,dbOverridePaths,conflicts,blocked:report.blocked,releaseApproval:false},null,1));
}
