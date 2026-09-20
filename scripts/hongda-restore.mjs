import {waitForWordPress} from './wordpress-ready.mjs';
import {readFile,writeFile,mkdir,mkdtemp,cp,lstat,realpath} from 'node:fs/promises';
import {resolve,join,relative,isAbsolute} from 'node:path';
import {createHash} from 'node:crypto';
import {createServer} from 'node:net';
import {spawn,execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {validateBlueprint} from '@wp-playground/blueprints';
const pointer=JSON.parse(await readFile(process.env.WP_SNAPSHOT_POINTER??'.lab/hongda-snapshot-latest.json','utf8'));
const snapshot=await realpath(pointer.directory);
assert.ok(snapshot.startsWith(await realpath('.lab')+'/'),'Snapshot must belong to local lab');
const manifest=JSON.parse(await readFile(join(snapshot,'manifest.json'),'utf8'));
assert.equal(manifest.scope,'local-sqlite-only');
for(const f of manifest.files){
 const target=resolve(snapshot,f.path),rel=relative(snapshot,target);
 assert.ok(rel&&!isAbsolute(rel)&&rel!=='..'&&!rel.startsWith('../'),'Unsafe snapshot path');
 const stat=await lstat(target);assert.ok(stat.isFile()&&!stat.isSymbolicLink());
 assert.equal(await realpath(target),target,'No parent symlinks');
 assert.equal(createHash('sha256').update(await readFile(target)).digest('hex'),f.sha256,f.path);
}
const port=Number(process.env.WP_RESTORE_PORT??9465);assert.ok([9465,9467].includes(port));const url='http://127.0.0.1:'+port;
const probe=createServer();await new Promise((ok,no)=>{probe.once('error',no);probe.listen(port,'127.0.0.1',ok);});await new Promise(ok=>probe.close(ok));
const run=await mkdtemp(resolve('.lab/hongda-restored-'));
const artifacts=join(run,'artifacts');await mkdir(artifacts,{mode:0o700});
for(const dir of ['source','dependencies','mu-plugins'])await cp(join(snapshot,dir),join(run,dir),{recursive:true});
await mkdir(join(run,'database'));await cp(join(snapshot,'database.sqlite'),join(run,'database/.ht.sqlite'));
await mkdir(join(run,'uploads'));
// Archive is locally generated and hashed above; still reject zip traversal and symlinks.
execFileSync('python3',['-c',`import zipfile,pathlib,sys,stat
root=pathlib.Path(sys.argv[2]).resolve()
with zipfile.ZipFile(sys.argv[1]) as z:
 for i in z.infolist():
  p=(root/i.filename).resolve()
  if not p.is_relative_to(root) or stat.S_ISLNK(i.external_attr>>16): raise RuntimeError('Unsafe archive entry')
 z.extractall(root)
`,join(snapshot,'uploads.zip'),join(run,'uploads')]);
const connection=JSON.parse(await readFile(join(snapshot,'connection.json'),'utf8'));connection.site=url;
await writeFile(join(artifacts,'connection.json'),JSON.stringify(connection),{mode:0o600});
// CLI bootstrap may alter permalink defaults on existing databases. Restore the
// recorded configuration after bootstrap; never reseed or run customer migrations.
const phpVersion=manifest.php.split('.').slice(0,2).join('.');
const blueprint={preferredVersions:{wp:manifest.wordpress,php:phpVersion},$schema:'https://playground.wordpress.net/blueprint-schema.json',steps:[{step:'runPHP',code:`<?php require '/wordpress/wp-load.php'; global $wp_rewrite; $wp_rewrite->set_permalink_structure(${JSON.stringify(manifest.permalinkStructure)}); flush_rewrite_rules(); file_put_contents('/artifacts/restored.json',wp_json_encode(['wordpress'=>get_bloginfo('version'),'php'=>PHP_VERSION,'theme'=>get_stylesheet(),'home'=>home_url(),'products'=>(int)wp_count_posts('hd_product')->publish]));`}]};
const valid=validateBlueprint(blueprint);assert.ok(valid.valid,JSON.stringify(valid.errors));
await writeFile(join(run,'blueprint.json'),JSON.stringify(blueprint));
await writeFile(join(run,'loopback.mjs'),`import {Server} from 'node:net';const orig=Server.prototype.listen;Server.prototype.listen=function(...a){if(a[0]===${port}&&(a[1]===undefined||typeof a[1]==='function'))return Reflect.apply(orig,this,[${port},'127.0.0.1',...a.slice(1)]);return Reflect.apply(orig,this,a);};`);
const args=['--experimental-wasm-jspi','--import='+join(run,'loopback.mjs'),resolve('node_modules/.bin/wp-playground-cli'),'server','--wp='+manifest.wordpress,'--php='+phpVersion,'--port='+port,'--workers=6','--blueprint='+join(run,'blueprint.json'),'--define-bool','NEW_SITE_REFERENCE_LAB','true','--define-bool','DISABLE_WP_CRON','true','--define-bool','AUTOMATIC_UPDATER_DISABLED','true'];
for(const [host,guest] of [[join(run,'database'),'/wordpress/wp-content/database'],[join(run,'uploads'),'/wordpress/wp-content/uploads'],[join(run,'source/theme'),'/wordpress/wp-content/themes/site-reference'],[join(run,'source/plugin'),'/wordpress/wp-content/plugins/site-model'],[join(run,'mu-plugins'),'/wordpress/wp-content/mu-plugins'],[artifacts,'/artifacts']])args.push('--mount-dir-before-install',host,guest);
for(const name of ['advanced-custom-fields','fluentform','autodescription'])args.push('--mount-dir-before-install',join(run,'dependencies',name),'/wordpress/wp-content/plugins/'+name);
console.log('Isolated restore:',connection.site);
const child=spawn(process.execPath,args,{stdio:'inherit'});child.on('exit',code=>{process.exitCode=code??1;});process.on('SIGTERM',()=>child.kill('SIGTERM'));process.on('SIGINT',()=>child.kill('SIGINT'));

let running=true; child.once('exit',()=>{running=false;});
try {
 await waitForWordPress({url,artifact:join(artifacts,'restored.json'),php:phpVersion,wordpress:manifest.wordpress,isRunning:()=>running});
 await writeFile(process.env.WP_RESTORED_POINTER??'.lab/hongda-restored-latest.json',JSON.stringify({run,artifacts,url:connection.site,snapshot}),{mode:0o600});
 console.log("Verified ready; active preview pointer updated.");
} catch(error) {child.kill('SIGTERM');throw error;}
