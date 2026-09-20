// Package and install the current block reference in disposable native MySQL environments.
// No production transport: private SQL and media remain under .lab.
import {execFileSync} from 'node:child_process';
import {mkdir,mkdtemp,readFile,writeFile,cp,chmod,readdir,rm} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {randomBytes} from 'node:crypto';
import assert from 'node:assert/strict';
import {inventory,assertPackagePaths,assertInventory,hash} from './release/files.mjs';
import {loadPluginProfile,verifyPluginInventory} from './plugins.mjs';
const source=JSON.parse(await readFile('.lab/b2b-starter-latest.json','utf8'));
assert.equal(source.urls.primary,'http://127.0.0.1:9490');
await readFile(join(source.run,'ready.json'));
const profile=await loadPluginProfile('config/wordpress-plugins.json');
await mkdir('.lab',{recursive:true});
const run=await mkdtemp(resolve('.lab/b2b-release-'));await chmod(run,0o700);
const bundle=join(run,'bundle'),tools=join(run,'tools'),project='b2b-release-'+randomBytes(4).toString('hex'),compose=join(run,'compose.json');
await mkdir(bundle);await mkdir(tools);await mkdir(join(run,'mu'));
const secret=randomBytes(24).toString('hex');let phase='prepare';
function command(name,args,options={}){try{return execFileSync(name,args,{encoding:'utf8',stdio:['pipe','pipe','pipe'],timeout:180000,maxBuffer:128*1024*1024,...options});}catch(e){throw new Error(phase+': '+name+' failed ('+e.status+'): '+String(e.stderr??'').replaceAll(secret,'[redacted]').slice(-1200),{cause:e});}}
const dc=(...args)=>command('docker',['compose','-p',project,'-f',compose,...args]);
const src=(...args)=>command('docker',['compose','-p',source.project,'-f',source.compose,...args]);
const wp=(id,...args)=>dc('exec','-T',id,'php','/tools/wp','--allow-root','--path=/var/www/html',...args);
const evaluate=(id,code)=>JSON.parse(wp(id,'eval',code));
function step(s){phase=s;console.log(s);}
const output=await mkdtemp(resolve('docs/acceptance/b2b-release/run-'));
const report={startedAt:new Date().toISOString(),scope:'block-reference-local-package-clean-install',checks:{},hostinger:'not-tested',externalMail:'not-tested',commercialContent:'mock-not-approved',visualApproval:'not-tested'};
async function save(){await writeFile(join(output,'report.json'),JSON.stringify(report,null,2));}
const dbcmd=(query,input)=>command('docker',['compose','-p',project,'-f',compose,'exec','-T','db','sh','-c',query],{input});
const dump=name=>dbcmd('exec mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" --single-transaction --no-tablespaces --set-gtid-purged=OFF '+name);
const importer=(name,data)=>dbcmd('exec mysql -uroot -p"$MYSQL_ROOT_PASSWORD" '+name,data);
const stateCode=`global $wpdb; $r=[];foreach(['posts','postmeta','terms','term_taxonomy','term_relationships','termmeta','fluentform_forms','fluentform_form_meta','fluentform_submissions','fluentform_entry_details','fluentform_submission_meta'] as $t){$rows=$wpdb->get_results('SELECT * FROM '.$wpdb->prefix.$t,ARRAY_A);$r[$t]=['count'=>count($rows),'hash'=>hash('sha256',wp_json_encode($rows))];}echo wp_json_encode($r);`;
try{
 step('Read source inventory and snapshot (source remains unchanged)');
 const sourceWp=(...args)=>src('exec','-T','primary','php','/tools/wp','--allow-root',...args);
 assert.ok(verifyPluginInventory(profile,JSON.parse(sourceWp('plugin','list','--format=json'))).pass);
 report.runtime=JSON.parse(sourceWp('eval',"global $wpdb;echo wp_json_encode(['wordpress'=>get_bloginfo('version'),'php'=>PHP_VERSION,'mysql'=>$wpdb->get_var('SELECT VERSION()')]);"));
 report.sourceHead=command('git',['rev-parse','HEAD']).trim();
 report.sourceUncommitted=true;
 // Copy exact runtime code, and require its custom theme/plugin to match the source manifest.
 for(const [kind,name] of [['themes','b2b-equipment'],...profile.required.map(p=>['plugins',p.slug])]){
  await mkdir(join(bundle,'wp-content',kind),{recursive:true});
  src('cp','primary:/var/www/html/wp-content/'+kind+'/'+name,join(bundle,'wp-content',kind,name));
 }
 // Remove development-only metadata shipped inside third-party vendor trees.
 const removed=[];
 async function prune(dir){for(const e of await readdir(dir,{withFileTypes:true})){const path=join(dir,e.name);if(e.isSymbolicLink())throw new Error('Plugin symlink rejected');if(['.agents','.beads','.codex','.helpers','.circleci','.phpcs.xml','.jshintrc','.mddoc.xml','.wp-env-tests.json','.gitkeep','.gitignore'].includes(e.name)){removed.push(path.slice(bundle.length+1));await rm(path,{recursive:true});}else if(e.isDirectory())await prune(path);}}
 await prune(join(bundle,'wp-content/plugins'));report.checks.excludedDevelopmentMetadata=removed.length;
 const custom=JSON.parse(await readFile('.agents/skills/wordpress-builder/assets/block-starter/manifest.json','utf8'));
 for(const [name,digest]of Object.entries(custom.files)){
  const runtime=name.replace(/^theme\//,'wp-content/themes/b2b-equipment/').replace(/^plugin\//,'wp-content/plugins/site-model/');
  assert.equal(hash(await readFile(join(bundle,runtime))),digest,'Runtime code drift '+name);
  assert.equal(hash(await readFile(join('examples/b2b-block-starter',name))),digest,'Source code drift '+name);
 }
 // Only WordPress media image files, never caches or arbitrary uploads.
 src('cp','primary:/var/www/html/wp-content/uploads',join(run,'raw-uploads'));
 command('python3',['-c',`import pathlib,shutil,sys
src=pathlib.Path(sys.argv[1]); dst=pathlib.Path(sys.argv[2])
for p in src.rglob('*'):
 if p.is_symlink(): raise Exception('Upload symlink')
 if p.is_file() and p.suffix.lower() in ['.jpg','.jpeg','.png','.webp','.gif','.avif'] and p.relative_to(src).parts[0].isdigit():
  q=dst/p.relative_to(src);q.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,q)
`,join(run,'raw-uploads'),join(bundle,'wp-content/uploads')]);
 const raw=src('exec','-T','db-primary','sh','-c','exec mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" --single-transaction --no-tablespaces --set-gtid-purged=OFF wordpress');
 await writeFile(join(run,'source.sql'),raw,{mode:0o600});
 await cp('config/wordpress-plugins.json',join(bundle,'plugin-profile.json'));
 await cp('examples/b2b-block-starter/scripts/release/sanitize.php',join(tools,'sanitize.php'));
 await cp('scripts/fixtures/hongda-native/smtp.php',join(run,'mu/smtp.php'));
 await writeFile(join(tools,'wp'),command('docker',['run','--rm','--entrypoint','cat','wordpress:cli-php8.3','/usr/local/bin/wp'],{encoding:null}));
 const web=id=>({image:'wordpress:php8.3-apache',ports:['127.0.0.1::80'],environment:{WORDPRESS_DB_HOST:'db',WORDPRESS_DB_NAME:id,WORDPRESS_DB_USER:'root',WORDPRESS_DB_PASSWORD:secret,WORDPRESS_CONFIG_EXTRA:"define('NEW_SITE_REFERENCE_LAB',true);define('DISABLE_WP_CRON',true);define('AUTOMATIC_UPDATER_DISABLED',true);"+(id==='prep'?"define('RELEASE_PREP',true);":"")},volumes:[id+':/var/www/html',tools+':/tools:ro',join(run,'mu')+':/var/www/html/wp-content/mu-plugins:ro']});
 await writeFile(compose,JSON.stringify({services:{db:{image:'mysql:8.4',environment:{MYSQL_ROOT_PASSWORD:secret},volumes:['db:/var/lib/mysql'],healthcheck:{test:['CMD-SHELL','MYSQL_PWD="$$MYSQL_ROOT_PASSWORD" mysql -h127.0.0.1 -uroot -N -e "SELECT 1"'],interval:'2s',timeout:'3s',retries:60}},prep:web('prep'),install:web('install'),restore:web('restore'),mail:{image:'public.ecr.aws/supabase/mailpit:v1.30.2',ports:['127.0.0.1::8025']}},volumes:{db:{},prep:{},install:{},restore:{}}}),{mode:0o600});
 step('Start isolated preparation, clean-install and recovery databases');dc('up','-d','--wait','--wait-timeout','120');
 dbcmd('exec mysql -uroot -p"$MYSQL_ROOT_PASSWORD"', 'CREATE DATABASE prep; CREATE DATABASE install; CREATE DATABASE restore;');
 const urls=Object.fromEntries(['prep','install','restore','mail'].map(id=>[id,'http://'+dc('port',id,id==='mail'?'8025':'80').trim()]));
 wp('prep','core','install','--url='+urls.prep,'--title=Release preparation','--admin_user=release','--admin_password='+secret,'--admin_email=release@example.test','--skip-email');
 await writeFile(join(tools,'core-options.json'),wp('prep','eval','global $wpdb;echo wp_json_encode($wpdb->get_col("SELECT option_name FROM {$wpdb->options}"));'));
 importer('prep',raw);
 step('Sanitize only the isolated snapshot');
 report.checks.sanitized=JSON.parse(wp('prep','--skip-plugins','--skip-themes','eval-file','/tools/sanitize.php'));
 assert.equal(report.checks.sanitized.users,0);assert.equal(report.checks.sanitized.enquiries,0);
 const sql=dump('prep');await writeFile(join(bundle,'database.sql'),sql,{mode:0o600});
 const manifest={schemaVersion:1,createdAt:new Date().toISOString(),scope:'private-mock-reference-first-install',sourceUrl:source.urls.primary,runtime:report.runtime,files:await inventory(bundle),requires:['fresh-database','new-administrator','mail-configuration','commercial-content-review'],excludes:['source-users','application-passwords','enquiries','logs','test-mu-plugins','wp-config.php']};
 assertPackagePaths(manifest.files);
 await writeFile(join(run,'manifest.json'),JSON.stringify(manifest,null,2));
 command('tar',['-czf',join(run,'site.tar.gz'),'-C',bundle,'.']);
 report.package={sha256:hash(await readFile(join(run,'site.tar.gz'))),files:Object.keys(manifest.files).length,manifestHash:hash(await readFile(join(run,'manifest.json')))};
 await mkdir(join(run,'unpacked'));command('tar',['-xzf',join(run,'site.tar.gz'),'-C',join(run,'unpacked')]);
 assertInventory(await inventory(join(run,'unpacked')),manifest.files);
 await writeFile(join(run,'release.json'),JSON.stringify({run,compose,project,urls,bundle:join(run,'site.tar.gz'),manifest:join(run,'manifest.json'),output}),{mode:0o600});
 // From here installation uses only the extracted package, not source folders or seed scripts.
 step('Install exclusively from the verified release archive');
 const extracted=join(run,'unpacked');
 assert.equal(dbcmd('exec mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -N -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=\'install\'"').trim(),'0');
 importer('install',await readFile(join(extracted,'database.sql')));
 for(const dir of ['themes','plugins','uploads'])dc('cp',join(extracted,'wp-content',dir)+'/.' ,'install:/var/www/html/wp-content/'+dir);
 wp('install','--skip-plugins','--skip-themes','user','create','release-admin','release@example.test','--role=administrator','--user_pass='+secret);
 wp('install','search-replace',manifest.sourceUrl,urls.install,'--all-tables-with-prefix','--skip-columns=guid','--dry-run');
 wp('install','search-replace',manifest.sourceUrl,urls.install,'--all-tables-with-prefix','--skip-columns=guid');
 wp('install','plugin','activate',...profile.required.map(p=>p.slug));wp('install','theme','activate','b2b-equipment');
 wp('install','eval',`global $wpdb; $id=get_user_by('login','release-admin')->ID;$wpdb->query($wpdb->prepare("UPDATE {$wpdb->posts} SET post_author=%d",$id));update_option('admin_email','release@example.test');foreach($wpdb->get_results("SELECT * FROM {$wpdb->prefix}fluentform_form_meta WHERE meta_key='notifications'")as $row){$v=json_decode($row->value,true);$v['enabled']=true;$wpdb->update($wpdb->prefix.'fluentform_form_meta',['value'=>wp_json_encode($v)],['id'=>$row->id]);}`);
 wp('install','rewrite','flush','--hard');dc('exec','-T','install','chown','-R','www-data:www-data','/var/www/html/wp-content/uploads');
 report.checks.plugins=verifyPluginInventory(profile,JSON.parse(wp('install','plugin','list','--format=json')));assert.ok(report.checks.plugins.pass);
 report.installedRuntime=evaluate('install',"global $wpdb;echo wp_json_encode(['wordpress'=>get_bloginfo('version'),'php'=>PHP_VERSION,'mysql'=>$wpdb->get_var('SELECT VERSION()')]);");assert.deepEqual(report.installedRuntime,report.runtime);
 report.checks.cleanInstall=await checkSite('install',urls.install);
 step('Exercise editing, templates and real browser enquiries');
 const product=evaluate('install',"echo wp_json_encode(get_posts(['post_type'=>'hd_product','name'=>'yhd08'])[0]->ID);");
 const old=wp('install','post','meta','get',String(product),'model').trim();
 wp('install','post','meta','update',String(product),'model','RELEASE-EDIT-CHECK');
 assert.ok((await (await fetch(urls.install+'/equipment/model/yhd08/')).text()).includes('RELEASE-EDIT-CHECK'));
 wp('install','post','meta','update',String(product),'model',old);
 const template=wp('install','post','meta','get',String(product),'_wp_page_template').trim();
 for(const name of ['product-standard','product-editorial']){wp('install','post','meta','update',String(product),'_wp_page_template',name);assert.equal((await (await fetch(urls.install+'/equipment/model/yhd08/')).text()).includes('editorial-hero'),name==='product-editorial');}
 wp('install','post','meta','update',String(product),'_wp_page_template',template);
 report.checks.editingAndTemplates=true;
 const inboxBefore=await(await fetch(urls.mail+'/api/v1/messages')).json();
 await browserCheck(urls.install);
 assert.equal(evaluate('install',"global $wpdb;echo (int)$wpdb->get_var('SELECT COUNT(*) FROM '.$wpdb->prefix.'fluentform_submissions');"),2);
 const mail=await(await fetch(urls.mail+'/api/v1/messages')).json();assert.equal(mail.total-inboxBefore.total,2);
 const newMessages=mail.messages.filter(m=>!inboxBefore.messages.some(old=>old.ID===m.ID));assert.equal(newMessages.length,2);
 for(const m of newMessages){const body=await(await fetch(urls.mail+'/api/v1/message/'+m.ID)).json();assert.ok(JSON.stringify(body).includes('release-test@example.test'));assert.ok(JSON.stringify(body).includes('release@example.test'));}
 report.checks.enquiries={browser:2,stored:2,smtp:2,notificationDelta:true,recipientAndSubmittedEmail:true};
 step('Restore database and media into a second empty environment');
 // Stop web writes during the recovery snapshot. WP-CLI has finished above.
 dc('stop','install');const backup=dump('install');await writeFile(join(run,'recovery.sql'),backup,{mode:0o600});dc('start','install');
 const state=evaluate('install',stateCode);
 importer('restore',backup);
 for(const dir of ['themes','plugins','uploads'])dc('cp',join(extracted,'wp-content',dir)+'/.' ,'restore:/var/www/html/wp-content/'+dir);
 assert.deepEqual(evaluate('restore',stateCode),state);
 wp('restore','search-replace',urls.install,urls.restore,'--all-tables-with-prefix','--skip-columns=guid','--dry-run');
 wp('restore','search-replace',urls.install,urls.restore,'--all-tables-with-prefix','--skip-columns=guid');wp('restore','rewrite','flush','--hard');
 report.checks.restored=await checkSite('restore',urls.restore);report.checks.recovery={logicalTables:Object.keys(state).length,enquiriesPreserved:state.fluentform_submissions.count};
 dc('up','-d','--force-recreate','install');assert.deepEqual(evaluate('install',stateCode),state);report.checks.containerPersistence=true;
 report.status='passed';await writeFile('.lab/b2b-release-latest.json',JSON.stringify({run,output}),{mode:0o600});
}catch(e){report.status='failed';report.phase=phase;report.error=e.message;process.exitCode=1;}finally{report.finishedAt=new Date().toISOString();await save();try{dc('stop');}catch{/* Keep original failure. */}console.log(JSON.stringify(report,null,2));console.log('Evidence: '+output);}
async function checkSite(id,url){
 const paths=['/','/equipment/','/equipment/model/yhd08/','/industry/agriculture/','/our-story/','/contact-us/'];
 for(const path of paths){const r=await fetch(url+path,{redirect:'error',signal:AbortSignal.timeout(20000)});assert.equal(r.status,200,path);const html=await r.text();assert.ok(!html.includes('Fatal error'));assert.ok(html.includes('noindex'));assert.equal((html.match(/<h1\b/g)||[]).length,1);assert.equal((html.match(/<title>/g)||[]).length,1);}
 const media=evaluate(id,"$n=0;foreach(get_posts(['post_type'=>'attachment','post_status'=>'inherit','numberposts'=>-1])as $p){if(!is_file(get_attached_file($p->ID)))throw new RuntimeException('Missing attachment');$n++;}echo $n;");
 assert.equal((await fetch(url+'/missing-release-page/',{redirect:'manual'})).status,404);
 // Verify every packaged byte, including media, against the installed files in one PHP invocation.
 await cp(join(run,'manifest.json'),join(tools,'manifest.json'));
 const verified=evaluate(id,`$n=0;$m=json_decode(file_get_contents('/tools/manifest.json'),true);foreach($m['files'] as $p=>$h){if(!str_starts_with($p,'wp-content/'))continue;if(hash_file('sha256',ABSPATH.$p)!==$h)throw new RuntimeException('Installed hash mismatch: '.$p);$n++;}echo $n;`);
 return {routes:paths.length+1,filesVerified:verified,attachments:media};
}
async function browserCheck(url){
 const cli=resolve(process.env.HOME,'.codex/skills/playwright/scripts/playwright_cli.sh'),session='release-'+Date.now();
 const browser=(...args)=>command(cli,['--session',session,'--raw',...args]);
 const code=`async(page)=>{const results=[];for(const path of ['/','/equipment/model/yhd08/']){await page.setViewportSize({width:390,height:844});await page.goto(${JSON.stringify(url)}+path);if(path!=='/')await page.locator('a[data-inquiry-product]').click();await page.locator('input[name=name]').fill('Release acceptance');await page.locator('input[name=email]').fill('release-test@example.test');await page.locator('input[name=country]').fill('Germany');await page.locator('textarea[name=description]').fill('Local isolated release package acceptance.');const wait=page.waitForResponse(r=>r.request().method()==='POST'&&r.url().includes('admin-ajax.php'));await page.getByRole('button',{name:'Send enquiry',exact:true}).click();const response=await wait;const body=await response.json();if(!body.success)throw new Error('Submission failed');await page.getByText('Thank you. Your enquiry has been received.',{exact:true}).waitFor();results.push({path,status:response.status()});}return results;}`;
 try{browser('open',url);const result=JSON.parse(browser('run-code',code));await writeFile(join(output,'browser.json'),JSON.stringify(result,null,2));assert.equal(result.length,2);}finally{browser('close');}
}
