import {execFileSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {setupHostinger} from '../.agents/skills/wordpress-builder/scripts/hostinger-setup.mjs';
const execute=(name,args,timeout=30000)=>execFileSync(name,args,{encoding:'utf8',stdio:['ignore','pipe','pipe'],timeout,maxBuffer:8*1024*1024});
export function harnessDoctor({setup=false,installSystem=false,deploy=false,connect=false,platform=process.platform,run=execute,exists=existsSync,nodeVersion=process.versions.node}={}){
 const checks={node:Number(nodeVersion.split('.')[0])>=22};const actions=[];
 const probe=(name,args)=>{try{return run(name,args).trim();}catch{return null;}};
 const report={scope:'harness-prerequisites-not-site-acceptance',checks,actions,ready:false,siteCreated:false,deployed:false};
 if(!checks.node){report.next='Install Node.js 22+ from an official source, reopen the terminal and rerun';return report;}
 checks.npm=probe('npm',['--version'])!==null;
 checks.dependencies=exists('node_modules/.package-lock.json')&&probe('npm',['ls','--depth=0'])!==null;
 if(setup&&checks.npm&&!checks.dependencies){try{run('npm',['ci'],180000);actions.push('npm-ci');checks.dependencies=true;}catch{report.next='npm ci failed; inspect local dependency installation';return report;}}
 checks.skillRuntime=exists('.agents/skills/wordpress-builder/scripts/wp.mjs');
 if(setup&&checks.dependencies){try{run('npm',['run','build'],180000);checks.skillRuntime=true;actions.push('build-and-verify-bundled-skills');}catch{report.next='Build or bundled Skill integrity check failed';return report;}}
 checks.skillIntegrity=false;
 if(checks.skillRuntime){try{const r=JSON.parse(run(process.execPath,['.agents/skills/wordpress-builder/scripts/wp.mjs','capabilities']));checks.skillIntegrity=r.ok===true&&r.result.integrity==='verified';}catch{/* Fail closed. */}}
 checks.dockerCli=probe('docker',['--version'])!==null;
 if(!checks.dockerCli&&installSystem&&platform==='darwin'&&probe('brew',['--version'])){
  try{run('brew',['install','--cask','docker'],180000);actions.push('install-docker-desktop');checks.dockerCli=probe('docker',['--version'])!==null;}catch{report.next='Docker Desktop installation requires local attention; no raw installer output published';return report;}
 }
 checks.compose=checks.dockerCli&&probe('docker',['compose','version'])!==null;
 checks.dockerEngine=checks.dockerCli&&probe('docker',['info','--format','{{.ServerVersion}}'])!==null;
 report.wordpress={core:'official Docker image at starter:start',wpCli:'official wordpress:cli image at starter:start; host wp command unnecessary',plugins:'installed and version-checked from config/wordpress-plugins.json at starter:start',mcp:'optional; not required for local starter'};
 if(deploy)report.hostinger=setupHostinger({install:setup,connect,platform,run});
 report.ready=Object.values(checks).every(Boolean)&&(!deploy||(report.hostinger.cli==='available'&&(!connect||report.hostinger.account==='hosting-orders-readable')));
 report.next=report.ready?'Run npm run starter:start for a NEW isolated site, or reuse the existing private site pointer':!checks.dockerCli?'Install Docker with Compose from the official platform instructions; macOS/Homebrew supports --install-system':!checks.dockerEngine?'Start Docker Desktop or the Docker service and complete any first-run UI, then rerun':'Resolve failed checks and rerun --setup';
 return report;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const args=process.argv.slice(2);if(args.some(a=>!['--setup','--install-system','--deploy','--connect'].includes(a))||args.includes('--connect')&&!args.includes('--deploy'))throw new Error('Usage: harness-doctor.mjs [--setup] [--install-system] [--deploy [--connect]]');
 const report=harnessDoctor({setup:args.includes('--setup'),installSystem:args.includes('--install-system'),deploy:args.includes('--deploy'),connect:args.includes('--connect')});console.log(JSON.stringify(report,null,2));if(!report.ready)process.exitCode=1;
}
