// Dedicated native-PHP/MySQL/SMTP acceptance; never reuses existing containers or databases.
import {execFileSync} from 'node:child_process';
import {mkdir,mkdtemp,writeFile,readFile,cp,chmod} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {randomBytes,createHash} from 'node:crypto';
import {setTimeout as delay} from 'node:timers/promises';
import assert from 'node:assert/strict';
await mkdir('.lab',{recursive:true});await mkdir('docs/acceptance/hongda-native',{recursive:true});
const run=await mkdtemp(resolve('.lab/hongda-native-'));await chmod(run,0o700);
const output=await mkdtemp(resolve('docs/acceptance/hongda-native/run-'));
const artifacts=join(run,'artifacts');await mkdir(artifacts,{mode:0o777});await chmod(artifacts,0o777);
const project='hongda-native-'+randomBytes(4).toString('hex');
const compose=join(run,'compose.json');let phase='prepare';
const report={startedAt:new Date().toISOString(),scope:'local-native-php-mysql-smtp',project,checks:{},externalInbox:'not-tested',publicDnsTls:'not-tested',visualApproval:'pending'};
function command(cmd,args,options={}){try{return execFileSync(cmd,args,{encoding:'utf8',timeout:180000,maxBuffer:64*1024*1024,...options});}catch(error){throw new Error(phase+': '+cmd+' exited '+error.status+' '+String(error.stderr??'').slice(-2000),{cause:error});}}
function dc(...args){return command('docker',['compose','-p',project,'-f',compose,...args]);}
function wp(service,...args){return dc('exec','-T',service,'php','/tools/wp','--allow-root','--path=/var/www/html',...args);}
function step(name){phase=name;console.log(name);}
async function save(){await writeFile(join(output,'summary.json'),JSON.stringify(report,null,2));}
async function ready(url){for(let i=0;i<90;i++){try{const r=await fetch(url,{signal:AbortSignal.timeout(2000),redirect:'manual'});if(r.status===200)return;}catch{/* Booting. */}await delay(1000);}throw new Error('HTTP readiness failed');}
try{
 command(process.execPath,['scripts/hongda-package.mjs']);
 const delivery=JSON.parse(await readFile('.lab/hongda-package-latest.json','utf8'));await cp(delivery.directory,join(run,'delivery'),{recursive:true});
 await cp('examples/hongda-wordpress',join(run,'source'),{recursive:true});await mkdir(join(run,'tools'));await mkdir(join(run,'mu'));
 await cp('scripts/fixtures/hongda-native/smtp.php',join(run,'mu/smtp.php'));await cp('scripts/fixtures/hongda/receipts.php',join(run,'mu/receipts.php'));await cp('scripts/fixtures/hongda-native/state.php',join(run,'tools/state.php'));
 await writeFile(join(run,'tools/wp'),command('docker',['run','--rm','--entrypoint','cat','wordpress:cli-php8.3','/usr/local/bin/wp'],{encoding:null}));
 const secret=randomBytes(24).toString('hex');const environment={WORDPRESS_DB_HOST:'db',WORDPRESS_DB_USER:'wordpress',WORDPRESS_DB_PASSWORD:secret,WORDPRESS_DB_NAME:'wordpress',WORDPRESS_CONFIG_EXTRA:"define('NEW_SITE_REFERENCE_LAB', true); define('DISABLE_WP_CRON', true); define('AUTOMATIC_UPDATER_DISABLED', true);"};
 const mounts=[join(run,'tools')+':/tools:ro',join(run,'source')+':/source:ro',join(run,'delivery')+':/delivery:ro',artifacts+':/artifacts',join(run,'mu')+':/var/www/html/wp-content/mu-plugins:ro'];
 const wpService=(host,port,volume)=>({image:'wordpress:php8.3-apache',environment:{...environment,WORDPRESS_DB_HOST:host},ports:[`127.0.0.1:${port}:80`],volumes:[volume+':/var/www/html',...mounts]});
 const db=()=>({image:'mysql:8.4',environment:{MYSQL_ROOT_PASSWORD:secret,MYSQL_DATABASE:'wordpress',MYSQL_USER:'wordpress',MYSQL_PASSWORD:secret},healthcheck:{test:['CMD-SHELL','mysqladmin ping -h 127.0.0.1 -uroot -p"$$MYSQL_ROOT_PASSWORD" --silent'],interval:'2s',timeout:'3s',retries:60}});
 const config={services:{db:{...db(),volumes:['db:/var/lib/mysql']},restoredb:{...db(),volumes:['restoredb:/var/lib/mysql']},web:wpService('db',9468,'web'),restore:wpService('restoredb',9469,'restore'),mail:{image:'public.ecr.aws/supabase/mailpit:v1.30.2',ports:['127.0.0.1:9470:8025']}},volumes:{db:{},restoredb:{},web:{},restore:{}},networks:{default:{}}};
 await writeFile(compose,JSON.stringify(config,null,2),{mode:0o600});
 await writeFile('.lab/hongda-native-latest.json',JSON.stringify({run,artifacts,project,compose,output}),{mode:0o600});
 step('Start isolated MySQL, PHP/Apache and SMTP services');dc('up','-d','--wait','--wait-timeout','120');
 await ready('http://127.0.0.1:9470/api/v1/messages');
 step('Install WordPress and ZIP deliverables');
 wp('web','core','install','--url=http://127.0.0.1:9468','--title=HONGDA native acceptance','--admin_user=admin','--admin_password='+secret,'--admin_email=admin@example.test','--skip-email');
 const plugins=resolve(process.env.WP_TEST_PLUGINS_PATH??'.lab/wordpress/wp-content/plugins');
 for(const service of ['web','restore']){
  for(const name of ['advanced-custom-fields','fluentform','autodescription'])dc('cp',join(plugins,name),service+':/var/www/html/wp-content/plugins/'+name);
  // Restore has an empty database at this stage; place exactly the same ZIP code via PHP ZipArchive.
  for(const [name,folder] of [['site-model','plugins'],['site-reference','themes']])dc('exec','-T',service,'php','-r',`$z=new ZipArchive();if($z->open('/delivery/${name}.zip')!==true)exit(1);if(!$z->extractTo('/var/www/html/wp-content/${folder}'))exit(2);$z->close();`);
 }
 wp('web','plugin','activate','advanced-custom-fields','fluentform','autodescription','site-model');wp('web','theme','activate','site-reference');
 wp('web','eval-file','/source/content/seed.php');wp('web','rewrite','flush','--hard');
 dc('exec','-T','web','chown','-R','www-data:www-data','/var/www/html/wp-content/uploads');
 const manifest=JSON.parse(await readFile(join(run,'delivery/manifest.json'),'utf8'));
 for(const file of manifest.files){const folder=file.path.startsWith('site-reference/')?'themes':'plugins';const actual=dc('exec','-T','web','sha256sum','/var/www/html/wp-content/'+folder+'/'+file.path).split(' ')[0];assert.equal(actual,file.sha256);}
 report.checks.installedFiles=manifest.files.length;
 await writeFile(join(output,'package-manifest.json'),JSON.stringify(manifest,null,2));
 report.runtime=JSON.parse(wp('web','eval',"global $wpdb; echo wp_json_encode(['wordpress'=>get_bloginfo('version'),'php'=>PHP_VERSION,'database'=>$wpdb->get_var('SELECT VERSION()'),'smtp'=>has_action('phpmailer_init'),'mailIntercept'=>has_filter('pre_wp_mail')]);"));assert.equal(report.runtime.mailIntercept,false);
 report.images=command('docker',['image','inspect','wordpress:php8.3-apache','mysql:8.4','public.ecr.aws/supabase/mailpit:v1.30.2','--format','{{json .Id}}']).trim().split('\n').map(value=>JSON.parse(value));
 const pointer=join(run,'pointer.json');await writeFile(pointer,JSON.stringify({run,artifacts,url:'http://127.0.0.1:9468'}));
 const env={...process.env,WP_LAB_POINTER:pointer,WP_ACCEPTANCE_DIR:output,WP_MAILPIT_URL:'http://127.0.0.1:9470'};
 step('Run content, routes and browser inquiry against native PHP/MySQL');
 command(process.execPath,['scripts/test-hongda-site.mjs'],{env,stdio:'inherit'});report.checks.site=true;
 command(process.execPath,['scripts/test-hongda-enquiry.mjs'],{env,stdio:'inherit'});report.checks.inquiry=true;
 const inbox=await (await fetch('http://127.0.0.1:9470/api/v1/messages')).json();assert.equal(inbox.total,1);
 const message=await (await fetch('http://127.0.0.1:9470/api/v1/message/'+inbox.messages[0].ID)).json();
 assert.ok(JSON.stringify(message).includes('acceptance@example.test'));assert.ok(JSON.stringify(message).includes('reference@example.test'));
 report.checks.smtp={received:1,containsSubmittedEmail:true,expectedRecipient:true,transport:'PHPMailer -> SMTP -> Mailpit'};
 const state=JSON.parse(wp('web','eval-file','/tools/state.php'));await writeFile(join(output,'before-state.json'),JSON.stringify(state,null,2));
 step('Quiesce web writes; export real MySQL and uploads');dc('stop','web');
 const dump=command('docker',['compose','-p',project,'-f',compose,'exec','-T','db','sh','-c','exec mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" --single-transaction --no-tablespaces --set-gtid-purged=OFF wordpress'],{encoding:null});await writeFile(join(run,'database.sql'),dump,{mode:0o600});
 dc('start','web');
 const archive=command('docker',['compose','-p',project,'-f',compose,'exec','-T','web','tar','czf','-','-C','/var/www/html/wp-content','uploads'],{encoding:null});await writeFile(join(run,'uploads.tar.gz'),archive,{mode:0o600});
 const dumpHash=createHash('sha256').update(dump).digest('hex');
 step('Import into independent MySQL database and restore uploads');
 command('docker',['compose','-p',project,'-f',compose,'exec','-T','restoredb','sh','-c','exec mysql -uroot -p"$MYSQL_ROOT_PASSWORD" wordpress'],{input:dump});
 command('docker',['compose','-p',project,'-f',compose,'exec','-T','restore','tar','xzf','-','-C','/var/www/html/wp-content'],{input:archive});
 wp('restore','search-replace','http://127.0.0.1:9468','http://127.0.0.1:9469','--all-tables-with-prefix','--dry-run');
 wp('restore','search-replace','http://127.0.0.1:9468','http://127.0.0.1:9469','--all-tables-with-prefix');wp('restore','rewrite','flush','--hard');
 const restored=JSON.parse(wp('restore','eval-file','/tools/state.php'));assert.deepEqual(restored,state);assert.equal(createHash('sha256').update(await readFile(join(run,'database.sql'))).digest('hex'),dumpHash);
 report.checks.recovery={tables:Object.keys(state).filter(x=>!['uploads','configuration'].includes(x)),uploads:Object.keys(state.uploads).length,enquiries:state.fluentform_submissions.rows,configuration:true,logicalHashesMatch:true,dumpUnchanged:true};
 step('Recreate web container and verify persistent data and restored routes');dc('up','-d','--force-recreate','web');await ready('http://127.0.0.1:9468/wp-json/');assert.deepEqual(JSON.parse(wp('web','eval-file','/tools/state.php')),state);report.checks.containerRecreate=true;
 for(const port of [9468,9469])for(const path of ['/','/equipment/','/equipment/model/yhd08/','/industry/agriculture/','/our-story/','/contact-us/','/not-a-page/']){const response=await fetch('http://127.0.0.1:'+port+path,{redirect:'error',signal:AbortSignal.timeout(15000)});assert.equal(response.status,path==='/not-a-page/'?404:200);const html=await response.text();assert.equal((html.match(/<h1\b/g)||[]).length,1);}
 report.checks.recreatedAndRestoredRoutes=14;report.status='passed';
}catch(error){report.status='failed';report.phase=phase;report.error=error.message;process.exitCode=1;}finally{report.finishedAt=new Date().toISOString();await save();try{dc('stop');}catch{/* Report remains available when daemon is unavailable. */}console.log(JSON.stringify(report,null,2));console.log('Evidence: '+output);}
