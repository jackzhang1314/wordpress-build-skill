import {mkdir,mkdtemp,readFile,readdir,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const root=resolve('examples/hongda-wordpress');await mkdir('output/hongda-delivery',{recursive:true});
const directory=await mkdtemp(resolve('output/hongda-delivery/release-'));
const files=[];
async function collect(dir,base){for(const f of await readdir(dir,{withFileTypes:true})){if(f.isSymbolicLink())throw new Error('No symlinks in deliverable');const rel=base+'/'+f.name;if(f.isDirectory())await collect(join(dir,f.name),rel);else{if(!/\.(php|css|json)$/.test(f.name))throw new Error('Unexpected package file: '+rel);files.push({path:rel,sha256:createHash('sha256').update(await readFile(join(dir,f.name))).digest('hex')});}}}
await collect(join(root,'theme'),'site-reference');await collect(join(root,'plugin'),'site-model');
for(const [folder,name] of [['theme','site-reference'],['plugin','site-model']])execFileSync('python3',['-c',`import pathlib,zipfile,sys
root=pathlib.Path(sys.argv[1])
with zipfile.ZipFile(sys.argv[2],'w',zipfile.ZIP_DEFLATED) as z:
 for p in sorted(root.rglob('*')):
  if p.is_file():z.write(p,sys.argv[3]+'/'+str(p.relative_to(root)))
`,join(root,folder),join(directory,name+'.zip'),name]);
const manifest={createdAt:new Date().toISOString(),scope:'installable-code-only',theme:'site-reference',plugin:'site-model/site-model.php',files,archives:[]};
for(const name of ['site-reference','site-model'])manifest.archives.push({file:name+'.zip',sha256:createHash('sha256').update(await readFile(join(directory,name+'.zip'))).digest('hex')});
await writeFile(join(directory,'manifest.json'),JSON.stringify(manifest,null,2));
await writeFile(join(directory,'README.md'),'# HONGDA WordPress code delivery\n\nInstall site-model.zip as a plugin and site-reference.zip as a theme. Requires ACF for business fields. Fluent Forms and The SEO Framework are the tested form/SEO dependencies; install and configure them separately.\n\nThis package contains code only: no customer data, media, accounts, seed script, lab helpers or credentials. Configure menus, contact/about/credits page destinations and the form for the target site. Local acceptance does not establish production email, MySQL recovery, content accuracy or visual approval.\n');
await mkdir('.lab',{recursive:true});await writeFile('.lab/hongda-package-latest.json',JSON.stringify({directory}));console.log(JSON.stringify({directory,files:files.length},null,2));
