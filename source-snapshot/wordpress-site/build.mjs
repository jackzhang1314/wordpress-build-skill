import {readdir,readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,relative} from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {zipSync} from 'fflate';
const root=fileURLToPath(new URL('.',import.meta.url));
export async function buildWordpressPackages(destination){
 await mkdir(destination,{recursive:true});const artifacts=[];
 for(const [kind,name]of [['plugin','octopus-site']]){
  const source=resolve(root,kind,name),files={};
  async function walk(directory){for(const entry of (await readdir(directory,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){const path=resolve(directory,entry.name);if(entry.isDirectory())await walk(path);else if(entry.isFile())files[`${name}/${relative(source,path).split('\\').join('/')}`]=[new Uint8Array(await readFile(path)),{mtime:new Date('2026-09-08T00:00:00Z')}];else throw new Error('Unsupported package entry');}}
  await walk(source);const bytes=zipSync(files,{level:6}),filename=`${name}-0.1.0.zip`;
  await writeFile(resolve(destination,filename),bytes);artifacts.push({kind,name,version:'0.1.0',filename,sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length});
 }
 await writeFile(resolve(destination,'manifest.json'),JSON.stringify({formatVersion:1,artifacts},null,2)+'\n');return artifacts;
}
