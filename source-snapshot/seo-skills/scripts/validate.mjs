import {createHash} from 'node:crypto';
import {readFile,readdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
const manifest=JSON.parse(await readFile(resolve(root,'manifest.json'),'utf8'));
assert.equal(manifest.skills.length,18);
assert.equal(new Set(manifest.skills.map(s=>s.name)).size,18);
for(const skill of manifest.skills){
 const dir=resolve(root,'skills',skill.name);const files=await readdir(dir,{recursive:true});
 for(const file of skill.files)assert(files.includes(file),`${skill.name} missing ${file}`);
 const entries=await Promise.all(skill.files.map(async path=>({path,data:(await readFile(resolve(dir,path))).toString('base64')})));entries.sort((a,b)=>a.path.localeCompare(b.path));
 assert.equal(createHash('sha256').update(JSON.stringify(entries)).digest('hex'),skill.version,`${skill.name}: content version mismatch`);
 const body=await readFile(resolve(dir,'SKILL.md'),'utf8');assert(body.startsWith('---\n'));assert(body.includes(`name: ${skill.name}\n`));
 for(const match of body.matchAll(/references\/[a-z-]+\.md/g))assert(files.includes(match[0]),`${skill.name}: missing reference ${match[0]}`);
 assert(!/as any|YOUR_API_KEY|sk-[A-Za-z0-9]{20}/.test(body));
}
const examples=JSON.parse(await readFile(resolve(root,'examples/scenarios.json'),'utf8'));assert.equal(examples.simulated,true);assert(examples.cases.length>=6);
console.log('18 skill packages, references, manifest and simulated examples verified. This does not test a live API account.');
