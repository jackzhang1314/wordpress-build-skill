// Repeatable local acceptance. Private state stays in .lab; evidence is credential-free.
import {spawn} from 'node:child_process';
import {mkdir,mkdtemp,readFile,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {setTimeout as delay} from 'node:timers/promises';
await mkdir('docs/acceptance/hongda-e2e',{recursive:true});
const evidence=await mkdtemp(resolve('docs/acceptance/hongda-e2e/run-'));
await mkdir('.lab',{recursive:true});
const state=await mkdtemp(resolve('.lab/hongda-e2e-'));
const env={...process.env,WP_LAB_POINTER:'.lab/hongda-clean-latest.json',WP_ACCEPTANCE_DIR:evidence,WP_SNAPSHOT_POINTER:join(state,'snapshot.json'),WP_RESTORED_POINTER:join(state,'restored.json'),WP_RESTORE_PORT:'9467'};
const report={startedAt:new Date().toISOString(),scope:'local-new-site',steps:[],visualApproval:'pending',productionEmail:'not-tested',productionMysql:'not-tested'};
const servers=[];
async function run(script){const child=spawn(process.execPath,['scripts/'+script+'.mjs'],{env,stdio:'inherit'});await new Promise((ok,no)=>{child.once('error',no);child.once('exit',code=>code===0?ok():no(new Error(script+' exited '+code)));});report.steps.push({script,status:'passed'});await save();}
async function save(){await writeFile(join(evidence,'summary.json'),JSON.stringify(report,null,2));}
async function serve(script,pointer){let previous='';try{previous=await readFile(pointer,'utf8');}catch(error){if(error.code!=='ENOENT')throw error;}const child=spawn(process.execPath,['scripts/'+script+'.mjs'],{env,stdio:'inherit'});servers.push(child);let failed;child.once('error',error=>{failed=error;});child.once('exit',code=>{failed=new Error(script+' exited '+code);});for(let i=0;i<240;i++){if(failed)throw failed;try{const value=await readFile(pointer,'utf8');if(value!==previous){report.steps.push({script,status:'ready'});await save();return JSON.parse(value);}}catch(error){if(error.code!=='ENOENT')throw error;}await delay(500);}throw new Error(script+' readiness timed out');}
try{
 await run('hongda-package');
 const lab=await serve('hongda-clean-site',env.WP_LAB_POINTER);
 await writeFile(join(evidence,'package-manifest.json'),await readFile(join(lab.run,'delivery/manifest.json')));
 const installed=JSON.parse(await readFile(join(lab.artifacts,'package-install.json'),'utf8'));await writeFile(join(evidence,'package-install.json'),JSON.stringify(installed,null,2));
 await run('test-hongda-site');
 await run('test-hongda-enquiry');
 await run('hongda-snapshot');
 await serve('hongda-restore',env.WP_RESTORED_POINTER);
 await run('test-hongda-recovery');
 report.status='passed';
}catch(error){report.status='failed';report.error=error.message;process.exitCode=1;}finally{report.finishedAt=new Date().toISOString();await save();for(const child of servers)child.kill('SIGTERM');console.log('Acceptance report: '+join(evidence,'summary.json'));}
