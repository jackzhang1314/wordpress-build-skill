import {execFileSync} from 'node:child_process';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
export function validateTarget(value){
 const keys=['provider','environment','sshAlias','wordpressPath','expectedUrl'];
 if(!value||Object.keys(value).some(k=>!keys.includes(k)))throw new Error('Unsupported target fields; credentials must remain in SSH configuration');
 if(value.provider!=='hostinger'||value.environment!=='staging')throw new Error('Only Hostinger staging preflight is supported');
 if(typeof value.sshAlias!=='string'||!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/.test(value.sshAlias))throw new Error('Use a simple SSH configuration alias');
 if(typeof value.wordpressPath!=='string'||!/^\/[a-zA-Z0-9_./-]+$/.test(value.wordpressPath)||value.wordpressPath==='/'||value.wordpressPath.split('/').includes('..'))throw new Error('Expected absolute WordPress directory');
 const url=new URL(value.expectedUrl);
 if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash||url.pathname!=='/')throw new Error('Expected HTTPS site origin without credentials');
 return {...value,expectedUrl:url.origin};
}
export const shellQuote=value=>"'"+value.replaceAll("'","'\\''")+"'";
export function sshArgs(target,command){return ['-T','-o','BatchMode=yes','-o','StrictHostKeyChecking=yes','-o','ConnectTimeout=10','-o','ClearAllForwardings=yes','-o','ForwardAgent=no',target.sshAlias,command];}
export function assessRemote(target,remote){
 const checks={url:remote.home.replace(/\/$/,'')===target.expectedUrl,siteurl:remote.siteurl.replace(/\/$/,'')===target.expectedUrl,previewNoindex:remote.blogPublic==='0',directoryWritable:remote.writable==='yes'};
 return {checks,pass:Object.values(checks).every(Boolean)};
}
export async function main(args){
 if(args.length<1||args.length>2||(args[1]&&args[1]!=='--connect'))throw new Error('Usage: node scripts/hostinger/preflight.mjs TARGET.json [--connect]');
 const target=validateTarget(JSON.parse(await readFile(args[0],'utf8')));
 const report={at:new Date().toISOString(),scope:'hostinger-staging-read-preflight',mode:args[1]?'remote':'offline',configuration:'valid',hostingerAccount:'not-verified',deployment:'not-executed'};
 const run=(name,argv)=>execFileSync(name,argv,{encoding:'utf8',stdio:['ignore','pipe','pipe'],timeout:30000,maxBuffer:1024*1024}).trim();
 try{report.hostingerCli=run('hostinger',['version']);}catch{report.hostingerCli='unavailable-or-not-working';}
 if(!args[1]){report.remote='not-tested';console.log(JSON.stringify(report,null,2));return report;}
 if(target.expectedUrl.endsWith('.invalid')||target.wordpressPath.includes('REPLACE_'))throw new Error('Replace example placeholders before connecting');
 const ssh=command=>run('ssh',sshArgs(target,command));
 const base='wp --path='+shellQuote(target.wordpressPath);
 try{
  report.phase='ssh-and-runtime';
  const php=ssh('php -r '+shellQuote('echo PHP_VERSION;'));
  const wpcli=ssh('wp cli version');
  const wordpress=ssh(base+' core version');
  // config get and db query avoid bootstrapping themes/plugins/MU plugins.
  const prefix=ssh(base+' config get table_prefix --type=variable');
  if(!/^[a-zA-Z0-9_]+$/.test(prefix))throw new Error('Unsupported database prefix');
  report.phase='database-read';
  const query="SELECT option_name,option_value FROM `"+prefix+"options` WHERE option_name IN ('home','siteurl','blog_public') ORDER BY option_name";
  const rows=ssh(base+' db query '+shellQuote(query)+' --skip-column-names --batch');
  const values=Object.fromEntries(rows.split('\n').map(row=>{const i=row.indexOf('\t');if(i<0)throw new Error('Unexpected database response');return [row.slice(0,i),row.slice(i+1)];}));
  if(!['home','siteurl','blog_public'].every(k=>typeof values[k]==='string'))throw new Error('Missing WordPress site options');
  const writable=ssh('if test -w '+shellQuote(target.wordpressPath+'/wp-content')+'; then printf yes; else printf no; fi');
  report.runtime={php,wpcli,wordpress};
  const assessed=assessRemote(target,{home:values.home,siteurl:values.siteurl,blogPublic:values.blog_public,writable});
  report.checks=assessed.checks;report.status=assessed.pass?'preflight-passed-not-deploy-authorized':'needs-attention';
  report.remaining=['Confirm Hostinger account and plan','Determine whether target is a disposable new site','Backup and recovery','Package/runtime compatibility','SMTP and DNS/TLS','Deployment implementation'];
 }catch{report.status='failed';report.error='Remote preflight failed at '+report.phase+'; raw command output withheld to avoid exposing configuration.';}
 await mkdir('.wordpress-builder/hostinger',{recursive:true,mode:0o700});
 const output=resolve('.wordpress-builder/hostinger/preflight-'+Date.now()+'.json');
 await writeFile(output,JSON.stringify(report,null,2),{mode:0o600});console.log(JSON.stringify({...report,reportPath:output},null,2));
 if(report.status!=='preflight-passed-not-deploy-authorized')process.exitCode=1;
 return report;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){main(process.argv.slice(2)).catch(()=>{console.error('Invalid or missing target configuration. See the Hostinger playbook; do not put secrets in the target file.');process.exitCode=1;});}
