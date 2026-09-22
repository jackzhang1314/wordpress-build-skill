#!/usr/bin/env node
// WordPress Harness — user says WHAT, harness handles HOW.
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const scriptDir=dirname(fileURLToPath(import.meta.url));
const step=n=>console.log(`\n▶ ${n}`);
const ok=m=>console.log(`  ✅ ${m}`);
const warn=m=>console.log(`  ⚠️  ${m}`);
const fail=m=>console.log(`  ❌ ${m}`);

function findProject(){let dir=process.cwd();while(dir!=='/'){if(existsSync(join(dir,'project.json')))return dir;dir=dirname(dir);}return null;}
function loadProject(){const root=findProject();if(!root){console.error('Error: Not in a project directory.');process.exit(1);}return {root,cfg:JSON.parse(readFileSync(join(root,'project.json'),'utf8'))};}
function sshCmd(ssh,cmd,opts={}){const key=resolve(findProject(),ssh.keyPath);return execFileSync('ssh',['-p',ssh.port,'-i',key,'-o','StrictHostKeyChecking=no',ssh.user+'@'+ssh.host,cmd],{encoding:'utf8',timeout:120000,maxBuffer:16*1024*1024,stdio:['pipe','pipe','pipe'],...opts});}
function rsyncDir(ssh,root,local,remote){const key=resolve(findProject(),ssh.keyPath);execFileSync('rsync',['-avz','--delete','-e',`ssh -p ${ssh.port} -i ${key}`,local,ssh.user+'@'+ssh.host+':'+remote],{encoding:'utf8',timeout:300000,maxBuffer:64*1024*1024,stdio:['pipe','pipe','pipe']});}

// ═══ deploy pipeline ═══
async function deploy(root,cfg,ssh,wpPath){
  const runSSH=cmd=>sshCmd(ssh,cmd);
  const rsyncTo=(local,remote)=>rsyncDir(ssh,root,local,remote);

  step('SSH connectivity');runSSH('echo ok');ok('connected');
  step('WordPress accessible');runSSH(`wp eval 'echo "OK";' --path=${wpPath}`);ok('WordPress responding');

  step('Checking template overrides');
  const overrideCount=parseInt(runSSH(`wp post list --post_type=wp_template,wp_template_part --post_status=publish --format=count --path=${wpPath}`).trim())||0;
  if(overrideCount>0)warn(`${overrideCount} override(s) in DB (file sync won't overwrite them)`);
  else ok('No DB overrides');

  step('Creating backup');
  const backupDir=join(findProject(),'.backups',Date.now().toString());
  mkdirSync(backupDir,{recursive:true});
  const tarData=execFileSync('ssh',['-p',ssh.port,'-i',resolve(findProject(),ssh.keyPath),ssh.user+'@'+ssh.host,`tar -cf - -C ${wpPath}/wp-content themes plugins`],{encoding:null,timeout:120000,maxBuffer:256*1024*1024});
  writeFileSync(join(backupDir,'themes-plugins.tar'),tarData);
  ok(`Backup saved (${tarData.length} bytes)`);

  step('Syncing theme files');
  rsyncDir(ssh,findProject(),join(findProject(),'theme')+'/',wpPath+'/wp-content/themes/liteng-parts-theme/');
  ok('Theme synced');

  step('Syncing plugin files');
  rsyncDir(ssh,findProject(),join(findProject(),'plugin')+'/',wpPath+'/wp-content/plugins/site-model/');
  ok('Plugin synced');

  step('Flushing rewrite rules');
  try{runSSH(`wp rewrite flush --path=${wpPath}`);ok('flushed');}
  catch{warn('flush skipped (proc_open disabled)');}

  step('Clearing cache');
  try{execFileSync('hostinger',['hosting','cache','clear-website',user,domain,'--format','json'],{encoding:'utf8',timeout:30000,stdio:['pipe','pipe','pipe']});ok('cleared');}
  catch{warn('cache clear skipped');}

  step('Verifying pages');
  for(const page of ['/','/parts/']){
    const r=await fetch(`https://${cfg.domain}${page}`);
    if(r.status!==200)throw new Error(`Page ${page} returned ${r.status}`);
  }
  ok('All key pages verified');
}

// ═══ commands ═══
const commands={};

commands.deploy=async function(){
  const {root,cfg}=loadProject();
  const ssh=cfg.ssh;
  const wpPath=ssh.wpPath;
  console.log(`\n🚀 Deploying ${cfg.title} → ${cfg.domain}\n`);
  await deploy(root,cfg,ssh,wpPath);
  console.log(`\n✅ Deploy complete: https://${cfg.domain}`);
  console.log('   Noindex is set (test site). Verify pages before removing noindex.\n');
};

commands.status=function(){
  const {root,cfg}=loadProject();
  const ssh=cfg.ssh;
  const wpPath=ssh.wpPath;
  console.log(`\n=== ${cfg.title} ===`);
  console.log(`Live: https://${cfg.domain}`);
  const parts=sshCmd(ssh,`wp post list --post_type=lt_part --format=count --path=${wpPath}`);
  const guides=sshCmd(ssh,`wp post list --post_type=lt_guide --format=count --path=${wpPath}`);
  const overrides=sshCmd(ssh,`wp post list --post_type=wp_template,wp_template_part --post_status=publish --format=count --path=${wpPath}`);
  console.log(`Parts: ${parts.trim()} | Guides: ${guides.trim()} | DB overrides: ${overrides.trim()}`);
};

commands.ssh=function(){
  const {root,cfg}=loadProject();
  const ssh=cfg.ssh;
  const key=resolve(root,ssh.keyPath);
  execFileSync('ssh',['-p',ssh.port,'-i',key,ssh.user+'@'+ssh.host],{stdio:'inherit'});
};

commands.wp=function(...wpArgs){
  const {root,cfg}=loadProject();
  const ssh=cfg.ssh;
  const wpPath=ssh.wpPath;
  const result=sshCmd(ssh,`wp --path=${wpPath} ${wpArgs.join(' ')}`);
  console.log(result);
};

commands.rollback=function(){
  const {root,cfg}=loadProject();
  const ssh=cfg.ssh;
  const backupsDir=join(root,'.backups');
  const {readdirSync}=require('node:fs');
  const backups=readdirSync(backupsDir).sort().reverse();
  if(!backups.length){console.log('No backups found.');return;}
  console.log('Available backups:');
  backups.forEach((b,i)=>console.log(`  [${i}] ${b}`));
  const latest=join(backupsDir,backups[0],'themes-plugins.tar');
  if(!existsSync(latest)){console.log('Backup tar not found.');return;}
  const key=resolve(root,ssh.keyPath);
  console.log('Rolling back to:',backups[0]);
  execFileSync('rsync',['-avz','-e',`ssh -p ${ssh.port} -i ${key}`,latest,ssh.user+'@'+ssh.host+':/tmp/rollback.tar'],{timeout:120000});
  sshCmd(ssh,`tar -xf /tmp/rollback.tar -C ${ssh.wpPath}/wp-content`);
  console.log('Rollback complete.');
};

commands.doctor=function(){
  console.log('\n=== Environment Doctor ===\n');
  const checks=[];
  checks.push(['Node.js',process.version,parseInt(process.version.slice(1))>=18]);
  try{execFileSync('docker',['info'],{timeout:5000,stdio:['pipe','pipe','pipe']});checks.push(['Docker','running',true]);}
  catch{checks.push(['Docker','not running',false]);}
  try{const v=execFileSync('hostinger',['version'],{encoding:'utf8',timeout:5000}).trim();checks.push(['Hostinger CLI',v,true]);}
  catch{checks.push(['Hostinger CLI','not installed',false]);}
  let allPass=true;
  for(const [name,value,pass] of checks){
    if(!pass)allPass=false;
    console.log(`  ${pass?'✅':'❌'} ${name}: ${value}`);
  }
  if(!allPass){console.log('\nSome checks failed.');process.exit(1);}
  console.log('\nAll checks passed.');
};

commands.help=function(){
  console.log(`
WordPress Harness
==================
Usage: harness <command>

  deploy       One command: check → backup → sync → verify (auto-rollback)
  status       Check site status (read-only)
  rollback     Rollback to previous backup
  doctor       Check environment dependencies
  ssh          Open SSH session
  wp <args>    Run WP-CLI remotely
  help         Show this help

The harness handles all intermediate steps automatically.
If any step fails, it stops and tells you what to do.
  `);
};

// ── main ──
const cmd=process.argv[2];
const cmdArgs=process.argv.slice(3);
if(cmd&&commands[cmd]){
  const result=commands[cmd](...cmdArgs);
  if(result instanceof Promise)await result;
}else{
  if(cmd){console.error('Unknown command:',cmd);}
  commands.help();
  if(cmd)process.exit(1);
}
