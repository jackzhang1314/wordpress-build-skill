#!/usr/bin/env node
import {execFileSync,spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync,existsSync,mkdirSync,copyFileSync,readdirSync,statSync} from 'node:fs';
import {join,resolve,basename,extname} from 'node:path';
import {createHash} from 'node:crypto';

const root=process.cwd();
const config=JSON.parse(readFileSync(join(root,'project.json'),'utf8'));
const [,,cmd,...args]=process.argv;
function sh(file,args2,opts={}){ let lastError; for(let attempt=1;attempt<=3;attempt++){ try{return execFileSync(file,args2,{encoding:'utf8',timeout:180000,maxBuffer:64*1024*1024,stdio:['pipe','pipe','pipe'],...opts});}catch(error){ lastError=error; const transient=['ETIMEDOUT','ECONNRESET','EPIPE'].includes(error.code)||error.status===255||error.status===20; if(attempt<3 && transient){ const wait=attempt*4000; console.log(`    transient ${file} failure (${error.code||error.status}), retrying in ${wait}ms`); Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,wait); continue;} throw error; } } throw lastError; }
const log=m=>console.log(m);
const ok=m=>console.log('  ✅ '+m);
const warn=m=>console.log('  ⚠️ '+m);
const fail=m=>console.error('  ❌ '+m);
const sshArgs=()=>['-p',config.ssh.port,'-i',resolve(root,config.ssh.keyPath),'-o','StrictHostKeyChecking=no','-o','ConnectTimeout=15',`${config.ssh.user}@${config.ssh.host}`];
const sshRun=(command,opts={})=>sh('ssh',[...sshArgs(),command],opts);
const wp=(command,opts={})=>sshRun(`wp --path=${config.ssh.wpPath} ${command}`,opts);
const live=`https://${config.domain}`;
const mediaMapPath=join(root,'content/media-map.json');

function loadMediaMap(){ try{return JSON.parse(readFileSync(mediaMapPath,'utf8'));}catch{return {};}}
function saveMediaMap(map){ mkdirSync(join(root,'content'),{recursive:true}); writeFileSync(mediaMapPath,JSON.stringify(map,null,2)+'\n'); }

function commandDoctor(){
  log('\n=== Environment doctor ===');
  const checks=[];
  checks.push(['Node.js',process.version,Number(process.versions.node.split('.')[0])>=20]);
  try{checks.push(['Docker',sh('docker',['info','--format','running']).trim(),true]);}catch(e){checks.push(['Docker','not running',false]);}
  try{checks.push(['Hostinger CLI',sh('hostinger',['version']).trim(),true]);}catch(e){checks.push(['Hostinger CLI','not installed',false]);}
  try{sshRun('echo connected');checks.push(['SSH',`${config.ssh.user}@${config.ssh.host}`,true]);}catch(e){checks.push(['SSH','unreachable',false]);}
  try{checks.push(['WP-CLI',wp('core version').trim(),true]);}catch(e){checks.push(['WP-CLI','unreachable',false]);}
  let passed=true;
  for(const [name,value,pass] of checks){ if(!pass) passed=false; log(`  ${pass?'✅':'❌'} ${name}: ${value}`); }
  if(!passed) process.exitCode=1; else log('\nAll required operations are available.');
}

function headingLintTheme(){
  const dirs=[join(root,'theme'),join(root,'theme/page-templates')];
  const checks=[];
  for(const dir of dirs){
    if(!existsSync(dir)) continue;
    for(const file of readdirSync(dir).filter(f=>f.endsWith('.php'))){
      const html=readFileSync(join(dir,file),'utf8');
      const headings=[...html.matchAll(/<h([1-6])(?:\s[^>]*)?>/gi)].map(m=>Number(m[1]));
      let previous=0,skips=0; for(const level of headings){ if(previous && level>previous+1) skips++; previous=level; }
      checks.push({file:file,headings:headings.length,skips,pass:skips===0});
    }
  }
  return checks;
}

function commandCheck(){
  log('\n=== Local quality gates ===');
  const checks=headingLintTheme();
  for(const check of checks) log(`  ${check.pass?'✅':'❌'} ${check.file}: ${check.headings} headings, ${check.skips} skips`);
  if(!checks.every(c=>c.pass)) process.exitCode=1;
  const required=['theme/style.css','theme/functions.php','plugin/site-model.php','plugin/acf-fields.php','content/site-data.json'];
  for(const file of required){ if(!existsSync(join(root,file))){fail(`${file} missing`);process.exitCode=1;} }
  const json=readFileSync(join(root,'content/site-data.json'),'utf8');
  JSON.parse(json); ok('site-data.json parses');
}

function backupTag(){ return new Date().toISOString().replace(/[:.]/g,'-'); }

function commandBackup(){
  const backupDir=join(root,'.backups',backupTag()); mkdirSync(backupDir,{recursive:true});
  const tarData=execFileSync('ssh',[...sshArgs(),`tar -cf - -C ${config.ssh.wpPath}/wp-content themes plugins`],{encoding:'buffer',timeout:240000,maxBuffer:512*1024*1024});
  writeFileSync(join(backupDir,'themes-plugins.tar'),tarData);
  const dbDumpCommand=`WP=${config.ssh.wpPath}; DB_NAME=$(wp config get DB_NAME --path=$WP); DB_USER=$(wp config get DB_USER --path=$WP); DB_PASSWORD=$(wp config get DB_PASSWORD --path=$WP); DB_HOST=$(wp config get DB_HOST --path=$WP); MYSQL_PWD="$DB_PASSWORD" mysqldump --host=$DB_HOST --user=$DB_USER --single-transaction --quick --no-tablespaces $DB_NAME | gzip`;
  const db=execFileSync('ssh',[...sshArgs(),dbDumpCommand],{encoding:'buffer',timeout:240000,maxBuffer:512*1024*1024});
  writeFileSync(join(backupDir,'database.sql.gz'),db);
  log(`✅ Backup: ${backupDir}`);
}

function ensurePlugins(){
  log('  Ensuring official baseline plugins');
  const list=JSON.parse(wp('plugin list --format=json'));
  const has=name=>list.some(p=>p.name===name);
  if(!has('advanced-custom-fields')) wp('plugin install advanced-custom-fields --activate');
  if(!has('seo-by-rank-math')) wp('plugin install seo-by-rank-math --activate');
  const activate=name=>{ if(!list.find(p=>p.name===name)?.status || list.find(p=>p.name===name).status!=='active') wp(`plugin activate ${name}`); };
  activate('advanced-custom-fields');
  const installed=JSON.parse(wp('plugin list --format=json'));
  if(installed.some(p=>p.name==='seo-by-rank-math')) wp('plugin activate seo-by-rank-math');
  for(const name of ['hostinger-ai-assistant','hostinger-easy-onboarding','hostinger-reach']) {
    const plugin=installed.find(p=>p.name===name); if(plugin&&plugin.status==='active') wp(`plugin deactivate ${name}`);
  }
  ok('ACF + Rank Math ready');
}

function syncCode(){
  log('  Syncing theme and plugin');
  sh('rsync',['-az','--delete','-e',`ssh -p ${config.ssh.port} -i ${resolve(root,config.ssh.keyPath)}`,join(root,'theme')+'/',`${config.ssh.user}@${config.ssh.host}:${config.ssh.wpPath}/wp-content/themes/${config.theme}/`]);
  sh('rsync',['-az','--delete','-e',`ssh -p ${config.ssh.port} -i ${resolve(root,config.ssh.keyPath)}`,join(root,'plugin')+'/',`${config.ssh.user}@${config.ssh.host}:${config.ssh.wpPath}/wp-content/plugins/${config.plugin}/`]);
  wp(`theme activate ${config.theme}`);
  wp(`plugin activate ${config.plugin}`);
  wp('rewrite flush');
  ok('Theme/plugin synced and activated');
}

function mediaKey(file){ return basename(file,extname(file)); }

async function commandMedia(){
  if(existsSync(mediaMapPath) && !args.includes('--force')){ log('Media map already exists; use --force to reimport'); return; }
  log('  Syncing media to remote staging');
  sshRun('rm -rf /tmp/irontrack-media && mkdir -p /tmp/irontrack-media/products /tmp/irontrack-media/factory');
  sh('rsync',['-az','-e',`ssh -p ${config.ssh.port} -i ${resolve(root,config.ssh.keyPath)}`,join(root,'docs/media/products')+'/',`${config.ssh.user}@${config.ssh.host}:/tmp/irontrack-media/products/`]);
  sh('rsync',['-az','-e',`ssh -p ${config.ssh.port} -i ${resolve(root,config.ssh.keyPath)}`,join(root,'docs/media/factory')+'/',`${config.ssh.user}@${config.ssh.host}:/tmp/irontrack-media/factory/`]);
  const map={};
  for(const folder of ['products','factory']){
    for(const file of readdirSync(join(root,'docs/media',folder)).filter(f=>/\.(jpe?g|png|webp)$/i.test(f))){
      const key=mediaKey(file);
      const output=wp(`media import /tmp/irontrack-media/${folder}/${file} --title=${key} --porcelain`).trim();
      const id=Number(output.split('\n').pop());
      if(!id) throw new Error(`Media import failed for ${file}: ${output}`);
      map[key]=id; log(`    ${key}: ${id}`);
    }
  }
  saveMediaMap(map); ok(`${Object.keys(map).length} media items imported`);
}

function commandContent(){
  const media=loadMediaMap(); if(!Object.keys(media).length) throw new Error('Run media first');
  log('  Uploading seed package');
  sshRun('rm -rf /tmp/irontrack-seed && mkdir -p /tmp/irontrack-seed');
  const staging=join(root,'.deploy-staging'); mkdirSync(staging,{recursive:true});
  copyFileSync(join(root,'scripts/seed.php'),join(staging,'seed.php'));
  copyFileSync(join(root,'content/site-data.json'),join(staging,'site-data.json'));
  copyFileSync(mediaMapPath,join(staging,'media-map.json'));
  const tar=execFileSync('tar',['-czf','-','-C',staging,'seed.php','site-data.json','media-map.json'],{encoding:'buffer',maxBuffer:64*1024*1024});
  execFileSync('ssh',[...sshArgs(),'cat > /tmp/irontrack-seed/package.tgz'],{input:tar,encoding:'buffer',maxBuffer:64*1024*1024});
  sshRun('tar -xzf /tmp/irontrack-seed/package.tgz -C /tmp/irontrack-seed');
  const result=wp(`eval-file /tmp/irontrack-seed/seed.php /tmp/irontrack-seed/media-map.json`);
  log(result.trim());
  wp('cache flush'); wp('rewrite flush');
  writeFileSync(join(root,'.seed-state.json'),JSON.stringify({seededAt:new Date().toISOString(),media:Object.keys(media).length},null,2));
  ok('Content seeded');
}

async function verifySite(){
  log('  Verifying live experience');
  const pages=config.livePages ?? ['/','/parts/','/guides/','/about-us/','/quality/','/contact-us/'];
  const results=[];
  for(const page of pages){
    const response=await fetch(live+page,{headers:{'Cache-Control':'no-cache'}});
    const html=await response.text();
    const headings=[...html.matchAll(/<h([1-6])(?:\s[^>]*)?>/gi)].map(m=>Number(m[1]));
    let previous=0,skips=0; for(const level of headings){ if(previous && level>previous+1) skips++; previous=level; }
    results.push({page,status:response.status,ok:response.status===200,skips,h1:(html.match(/<h1(?:\s[^>]*)?>/gi)||[]).length});
    log(`    ${response.status===200 && skips===0 && (page==='/' ? (html.match(/<h1(?:\s[^>]*)?>/gi)||[]).length===1 : true) ? '✅':'❌'} ${page} — ${response.status}, skips ${skips}, H1 ${(html.match(/<h1(?:\s[^>]*)?>/gi)||[]).length}`);
  }
  for(const marker of ['IRONTRACK','Undercarriage and wear parts','Core component families']){
    const html=await (await fetch(live+'/',{headers:{'Cache-Control':'no-cache'}})).text();
    if(!html.includes(marker)){fail(`Content marker missing: ${marker}`);results.push({marker,ok:false});}
  }
  const parts=Number(wp('post list --post_type=it_part --post_type=it_part --format=count').trim() || wp('post list --post_type=it_part --format=count').trim());
  const guides=Number(wp('post list --post_type=it_guide --format=count').trim());
  const rfq=Number(wp('post list --post_type=it_rfq --format=count').trim());
  log(`    ✅ Database: ${parts} parts, ${guides} guides, ${rfq} RFQ records`);
  if(!results.every(r=>r.ok)) throw new Error('Verification failed');
  return results;
}

function clearCache(){
  try{sh('hostinger',['hosting','cache','clear-website',config.hostinger.user,config.domain,'--format','json'],{timeout:30000});ok('Hostinger cache cleared');}
  catch(e){warn('Hostinger cache clear skipped');}
}

async function commandDeploy(){
  const force=args.includes('--force');
  commandCheck();
  if(process.exitCode) throw new Error('Local checks failed');
  log('\n🚀 Deploying IRONTRACK PARTS');
  sshRun('echo connected'); ok('SSH preflight');
  wp('eval \'echo "OK";\''); ok('WordPress/WP-CLI');
  commandBackup(); ensurePlugins(); syncCode();
  if(!existsSync(mediaMapPath) || args.includes('--with-media')) await commandMedia();
  if(!existsSync(join(root,'.seed-state.json')) || args.includes('--with-content')) commandContent();
  clearCache();
  verifySite();
  const state={deployedAt:new Date().toISOString(),domain:config.domain,commit:gitHead(),media:Object.keys(loadMediaMap()).length};
  writeFileSync(join(root,'.deploy-state.json'),JSON.stringify(state,null,2));
  log(`\n✅ Live: ${live}`);
}

function gitHead(){ try{return sh('git',['rev-parse','--short','HEAD']).trim();}catch{return 'dirty';} }

function commandStatus(){
  log(`\n=== ${config.title} ===\nLive: ${live}`);
  for(const type of [config.partPostType,config.guidePostType,'it_rfq']){
    const count=wp(`post list --post_type=${type} --format=count`).trim();
    log(`${type}: ${count}`);
  }
  const plugins=JSON.parse(wp('plugin list --status=active --format=json')).map(p=>p.name);
  log(`Active plugins: ${plugins.join(', ')}`);
}

function commandRollback(){
  const backupDir=resolve(root,'.backups',args[0]??'');
  if(!existsSync(backupDir)) throw new Error('Backup directory not found');
  const tar=execFileSync('cat',[join(backupDir,'themes-plugins.tar')],{encoding:'buffer',maxBuffer:512*1024*1024});
  execFileSync('ssh',[...sshArgs(),'tar -xzf - -C '+config.ssh.wpPath+'/wp-content'],{input:tar,encoding:'buffer',maxBuffer:512*1024*1024});
  wp('cache flush'); wp('rewrite flush');
  log('✅ Theme/plugin rollback complete. Database restore requires manual approval.');
}

function commandWp(){ log(wp(args.join(' '))); }
function commandOpen(){
  const url=`https://hpanel.hostinger.com/websites/${config.domain}/advanced/ssh-access?redirectLocation=side_menu`;
  log(url);
  if(process.platform==='darwin') spawnSync('open',[url]);
}
function commandHelp(){
  log(`
IRONTRACK Harness
=================
Usage: node scripts/harness.mjs <command>

  doctor                 Check Node/Docker/CLI/SSH/WP-CLI
  check                  Local content, file and heading gates
  backup                 Back up remote theme/plugins + database
  media [--force]        Import local media and build ID map
  content                Seed/refresh terms, pages, products, guides and menus
  deploy [--with-media] [--with-content] [--force]
  status                 Remote content and plugin status
  rollback <backup-id>   Restore theme/plugin archive
  wp <args>              Run WP-CLI remotely
  open                   Open Hostinger SSH access page
`);
}

const commands={doctor:commandDoctor,check:commandCheck,backup:commandBackup,media:commandMedia,content:commandContent,deploy:commandDeploy,status:commandStatus,rollback:commandRollback,wp:commandWp,open:commandOpen,help:commandHelp};
if(commands[cmd]) await commands[cmd]();
else{ if(cmd) fail(`Unknown command: ${cmd}`); commandHelp(); process.exitCode=cmd?1:0; }
