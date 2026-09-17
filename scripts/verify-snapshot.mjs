import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const manifest=JSON.parse(await readFile(resolve(root,'SYNC-MANIFEST.json'),'utf8'));
const failures=[];
for(const file of manifest.files){try{const bytes=await readFile(resolve(root,file.destination));if(createHash('sha256').update(bytes).digest('hex')!==file.sha256)failures.push(file.destination);}catch{failures.push(file.destination);}}
const skills=JSON.parse(await readFile(resolve(root,'skills/manifest.json'),'utf8'));
for(const skill of skills.skills)for(const path of skill.files){try{await readFile(resolve(root,skill.directory,path));}catch{failures.push(skill.name+'/'+path);}}
console.log(JSON.stringify({files:manifest.files.length,skills:skills.skills.length,failures},null,2));
if(failures.length)process.exitCode=1;
