#!/usr/bin/env node
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {join,resolve} from 'node:path';
const P=process.cwd();
const provision=JSON.parse(readFileSync(join(P,'.wordpress-builder/hostinger-brightdozer/site.json'),'utf8'));
const domain=provision.domain;
const user=provision.username;
const sshKey=join(P,'.wordpress-builder/hostinger-brightdozer/liteng-ssh-key');
const sshTarget=user+'@46.202.182.12';
const sshPort='65002';
const wpRemote='/home/'+user+'/domains/'+domain+'/public_html';
const live='https://'+domain;
const sh=(cmd,args,opts={})=>execFileSync(cmd,args,{encoding:'utf8',timeout:120000,maxBuffer:16*1024*1024,stdio:['pipe','pipe','pipe'],...opts});
const sshRun=(cmd)=>sh('ssh',['-p',sshPort,'-i',sshKey,'-o','StrictHostKeyChecking=no',sshTarget,cmd]);
const step=n=>console.log('\n▶ '+n);
const ok=m=>console.log('  ✅ '+m);
const [,,cmd,...rest]=process.argv;
const commands={};
commands.status=function(){
  console.log('\n=== LITENG PARTS ===');
  console.log('Live: '+live);
  const parts=sshRun('wp post list --post_type=${cfg.partPostType} --format=count --path='+wpRemote);
  const guides=sshRun('wp post list --post_type=${cfg.guidePostType} --format=count --path='+wpRemote);
  const overrides=sshRun('wp post list --post_type=wp_template,wp_template_part --post_status=publish --format=count --path='+wpRemote);
  console.log('Parts: '+parts.trim()+' | Guides: '+guides.trim()+' | DB overrides: '+overrides.trim());
};
commands.deploy=async function(){
  console.log('\n🚀 Deploying LITENG PARTS → '+domain);
  step('Creating backup');
  const backupDir=join(P,'.backups',Date.now().toString());
  mkdirSync(backupDir,{recursive:true});
  const tarData=execFileSync('ssh',['-p',sshPort,'-i',sshKey,sshTarget,'tar -cf - -C '+wpRemote+'/wp-content themes plugins'],{encoding:null,timeout:120000,maxBuffer:256*1024*1024});
  writeFileSync(join(backupDir,'themes-plugins.tar'),tarData);
  ok('Backup saved');
  step('Syncing theme files');
  execFileSync('rsync',['-avz','--delete','-e','ssh -p '+sshPort+' -i '+sshKey,join(P,'theme')+'/',user+'@46.202.182.12:'+wpRemote+'/wp-content/themes/${cfg.themeName}/'],{encoding:'utf8',timeout:300000,maxBuffer:64*1024*1024,stdio:['pipe','pipe','pipe']});
  ok('Theme synced');
  step('Syncing plugin files');
  execFileSync('rsync',['-avz','--delete','-e','ssh -p '+sshPort+' -i '+sshKey,join(P,'plugin')+'/',user+'@46.202.182.12:'+wpRemote+'/wp-content/plugins/${cfg.pluginSlug}/'],{encoding:'utf8',timeout:300000,maxBuffer:64*1024*1024,stdio:['pipe','pipe','pipe']});
  ok('Plugin synced');
  step('Flushing rewrite rules');
  try{sshRun('wp rewrite flush --path='+wpRemote);ok('flushed');}
  catch{console.log('  ⚠️ flush skipped');}
  step('Clearing cache');
  try{execFileSync('hostinger',['hosting','cache','clear-website',user,domain,'--format','json'],{encoding:'utf8',timeout:30000,stdio:['pipe','pipe','pipe']});ok('cleared');}
  catch{console.log('  ⚠️ cache clear skipped');}
  step('Verifying pages');
  for(const page of ['/','/parts/']){
    const r=await fetch(live+page);
    if(r.status!==200){console.error('  ❌ '+page+' returned '+r.status);process.exit(1);}
  }
  ok('Pages verified');
  console.log('\n✅ Deploy complete: '+live+'\n');
};
commands.ssh=function(){
  const key=resolve(sshKey);
  execFileSync('ssh',['-p',sshPort,'-i',key,sshTarget],{stdio:'inherit'});
};
commands.wp=function(...wpArgs){
  const result=sshRun('wp --path='+wpRemote+' '+wpArgs.join(' '));
  console.log(result);
};
commands.help=function(){
  console.log('\nLITENG Harness\n===============\nUsage: harness <command>\n\n  deploy       Deploy (check → backup → sync → verify)\n  status       Check site status\n  ssh          Open SSH session\n  wp <args>    Run WP-CLI remotely\n  help         Show this help\n');
};
if(cmd&&commands[cmd]){commands[cmd](...rest);}
else{if(cmd)console.error('Unknown:',cmd);commands.help();if(cmd)process.exit(1);}
