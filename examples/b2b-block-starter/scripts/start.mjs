import {execFileSync} from 'node:child_process';
import {mkdir,mkdtemp,readFile,writeFile,cp,chmod} from 'node:fs/promises';
import {resolve,join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomBytes} from 'node:crypto';
import {createServer} from 'node:net';
import {loadPluginProfile,installRequiredPlugins} from './plugins.mjs';
for(const port of [9490,9491,9492])await new Promise((resolve,reject)=>{const server=createServer();server.once('error',()=>reject(new Error('Local port '+port+' is occupied; use the existing project or select different ports before creating a run.')));server.listen(port,'127.0.0.1',()=>server.close(resolve));});
const source=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const repo=resolve(source,'../..');
const pluginProfile=await loadPluginProfile(join(repo,'config/wordpress-plugins.json'));
const lab=join(repo,'.lab'); await mkdir(lab,{recursive:true});
const run=await mkdtemp(join(lab,'b2b-starter-'));await chmod(run,0o700);
const project='b2b-starter-'+randomBytes(4).toString('hex'),compose=join(run,'compose.json'),secret=randomBytes(24).toString('hex');
const cmd=(name,args,options={})=>execFileSync(name,args,{encoding:'utf8',timeout:180000,maxBuffer:64*1024*1024,...options});
const dc=(...args)=>cmd('docker',['compose','-p',project,'-f',compose,...args]);
const wp=(id,...args)=>dc('exec','-T',id,'php','/tools/wp','--allow-root','--path=/var/www/html',...args);
for(const dir of ['tools','mu','artifacts-primary','artifacts-reuse','source-primary','source-reuse']){await mkdir(join(run,dir));await chmod(join(run,dir),0o777);}
await cp(join(repo,'scripts/fixtures/hongda-native/smtp.php'),join(run,'mu/smtp.php'));
await cp(join(repo,'scripts/fixtures/hongda/receipts.php'),join(run,'mu/receipts.php'));
await writeFile(join(run,'tools/wp'),cmd('docker',['run','--rm','--entrypoint','cat','wordpress:cli-php8.3','/usr/local/bin/wp'],{encoding:null}));
const env={WORDPRESS_DB_USER:'wordpress',WORDPRESS_DB_PASSWORD:secret,WORDPRESS_DB_NAME:'wordpress',WORDPRESS_CONFIG_EXTRA:"define('NEW_SITE_REFERENCE_LAB',true);define('DISABLE_WP_CRON',true);define('AUTOMATIC_UPDATER_DISABLED',true);"};
const web=(id,port)=>({image:'wordpress:php8.3-apache',ports:[`127.0.0.1:${port}:80`],environment:{...env,WORDPRESS_DB_HOST:'db-'+id},volumes:[id+':/var/www/html',join(run,'tools')+':/tools:ro',join(run,'source-'+id)+':/source:ro',join(run,'mu')+':/var/www/html/wp-content/mu-plugins:ro',join(run,'artifacts-'+id)+':/artifacts']});
const db=()=>({image:'mysql:8.4',environment:{MYSQL_ROOT_PASSWORD:secret,MYSQL_DATABASE:'wordpress',MYSQL_USER:'wordpress',MYSQL_PASSWORD:secret},healthcheck:{test:['CMD-SHELL','MYSQL_PWD="$$MYSQL_ROOT_PASSWORD" mysqladmin ping -h 127.0.0.1 -uroot --silent'],interval:'2s',timeout:'3s',retries:60}});
await writeFile(compose,JSON.stringify({services:{primary:web('primary',9490),reuse:web('reuse',9491),'db-primary':{...db(),volumes:['db-primary:/var/lib/mysql']},'db-reuse':{...db(),volumes:['db-reuse:/var/lib/mysql']},mail:{image:'public.ecr.aws/supabase/mailpit:v1.30.2',ports:['127.0.0.1:9492:8025']}},volumes:{primary:{},reuse:{},'db-primary':{},'db-reuse':{}}},null,2),{mode:0o600});
const pointer={run,compose,project,source,urls:{primary:'http://127.0.0.1:9490',reuse:'http://127.0.0.1:9491'},mail:'http://127.0.0.1:9492',adminPassword:secret};
// Unique private runs are retained. A failed run does not erase previous pointers.
await writeFile(join(run,'pointer.json'),JSON.stringify(pointer),{mode:0o600});
try{
 for(const id of ['primary','reuse']){
  await cp(join(source,'content'),join(run,'source-'+id,'content'),{recursive:true});
  const seed=join(run,'source-'+id,'content/seed.php');
  await writeFile(seed,(await readFile(seed,'utf8')).replace("'http://127.0.0.1:9468'",JSON.stringify(pointer.urls[id])));
 }
 const fixture=JSON.parse(await readFile(join(source,'content/reference.json'),'utf8'));
 fixture.categories=[{slug:'process-pumps',label:'Process pumps',desc:'Illustrative pump selection: compare flow, head, fluid compatibility and installation constraints. Confirm all figures with the supplier.'}];
 fixture.products=[1,2].map(n=>({slug:'fp-'+n,model:'FP-'+n,name:'FP-'+n+' process pump',category:'process-pumps',ton:0.1*n,blurb:'Mock industrial pump for clean-water transfer. Select against the full duty point, not the model name.',bullets:['Demonstration only — no certified operating curve or commercial availability claimed.'],specs:[['Flow rate',n*10+' m³/h (mock)'],['Head',n*20+' m (mock)'],['Fluid','Clean water (example)']],range:[],size:[]}));
 for(const key of ['industries','stories','posts','contactTopics'])fixture[key]=[];
 await writeFile(join(run,'source-reuse/content/reference.json'),JSON.stringify(fixture));
 console.log('Starting isolated clean installs on 9490 and 9491');dc('up','-d','--wait','--wait-timeout','120');
 for(const id of ['primary','reuse']){
  wp(id,'core','install','--url='+pointer.urls[id],'--title=B2B local preview','--admin_user=admin','--admin_password='+secret,'--admin_email=admin@example.test','--skip-email');
  const plugins=await installRequiredPlugins({profile:pluginProfile,wp:(...args)=>wp(id,...args),copy:(path,slug)=>dc('cp',path,id+':/var/www/html/wp-content/plugins/'+slug),cacheRoot:process.env.WP_TEST_PLUGINS_PATH??join(repo,'.lab/wordpress/wp-content/plugins'),projectPlugin:join(source,'plugin')});
  await writeFile(join(run,'artifacts-'+id,'plugins.json'),JSON.stringify(plugins,null,2));
  dc('cp',join(source,'theme'),id+':/var/www/html/wp-content/themes/b2b-equipment');wp(id,'theme','activate','b2b-equipment');wp(id,'eval-file','/source/content/seed.php');
  wp(id,'eval',`foreach(['contact_page','about_page','credits_page'] as $key)update_option('b2b_'.$key,get_theme_mod($key));$home=(int)get_option('page_on_front');wp_update_post(['ID'=>$home,'post_content'=>file_get_contents('/source/content/home.html')]);update_post_meta((int)get_option('b2b_contact_page'),'_wp_page_template','enquiry');update_post_meta((int)get_option('b2b_about_page'),'_wp_page_template','company');`);
  if(id==='primary')wp(id,'eval-file','/source/content/redesign.php');
  if(id==='reuse')wp(id,'eval',"update_option('blogname','FLOWLINE Pump Preview');$home=(int)get_option('page_on_front');wp_update_post(['ID'=>$home,'post_title'=>'Select a pump for your duty point.','post_content'=>'<!-- wp:heading {\"level\":1} --><h1 class=\"wp-block-heading\">Select a pump for your duty point.</h1><!-- /wp:heading --><!-- wp:paragraph --><p>Independent clean-install fixture: all pump data is illustrative.</p><!-- /wp:paragraph --><!-- wp:b2b-site/home-families /--><!-- wp:pattern {\"slug\":\"b2b-equipment/selection-guide\"} /-->']);");
  wp(id,'eval-file','/source/content/rankmath.php');wp(id,'rewrite','flush','--hard');dc('exec','-T',id,'chown','-R','www-data:www-data','/var/www/html/wp-content/uploads');
  await writeFile(join(run,'artifacts-'+id,'runtime.json'),wp(id,'eval',"global $wpdb;echo wp_json_encode(['wordpress'=>get_bloginfo('version'),'php'=>PHP_VERSION,'mysql'=>$wpdb->get_var('SELECT VERSION()'),'seo'=>['name'=>'Rank Math Free','version'=>RANK_MATH_VERSION],'acf'=>ACF_VERSION,'acfPro'=>acf_is_pro(),'fluentform'=>FLUENTFORM_VERSION,'blockTheme'=>wp_is_block_theme(),'theme'=>get_stylesheet(),'bindings'=>array_keys(get_all_registered_block_bindings_sources())]);"));
 }
 await writeFile(join(run,'ready.json'),JSON.stringify({readyAt:new Date().toISOString()}));await writeFile(join(lab,'b2b-starter-latest.json'),JSON.stringify(pointer),{mode:0o600});
 console.log('Ready: http://127.0.0.1:9490/ and http://127.0.0.1:9491/; private pointer saved.');
}catch(error){console.error(String(error.stderr??error.message).replaceAll(secret,'[redacted]').slice(-1500));console.error('Run preserved at '+run);process.exitCode=1;}
