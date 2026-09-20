import {build} from 'esbuild';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const out=resolve('output/seo-export-runtime.mjs');await mkdir(resolve('output'),{recursive:true});
await build({entryPoints:['src/agent/skills/builtin.ts'],outfile:out,bundle:true,format:'esm',platform:'node',packages:'external',plugins:[{name:'raw-markdown',setup(b){b.onResolve({filter:/\.md\?raw$/},args=>({path:resolve(args.resolveDir,args.path.slice(0,-4)),namespace:'raw'}));b.onLoad({filter:/.*/,namespace:'raw'},async args=>({contents:await readFile(args.path,'utf8'),loader:'text'}));}}]});
const {builtinSkills,builtinSkillVersions}=await import(pathToFileURL(out).href+'?t='+Date.now());
if(process.argv.includes('--freeze-legacy')){
 const packages=(await builtinSkillVersions()).filter(s=>s.product?.category==='seo'||['technical-seo','on-page-seo'].includes(s.name));
 await writeFile('src/agent/skills/builtin/seo/legacy-packages.json',JSON.stringify(packages,null,2)+'\n');console.log(`Preserved ${packages.length} SEO package versions`);
}else{
 const skills=(await builtinSkills()).filter(s=>s.product?.category==='seo'||['technical-seo','on-page-seo'].includes(s.name));
 const manifest=[];
 for(const skill of skills){for(const file of skill.files){const path=resolve('seo-skills/skills',skill.name,file.path);await mkdir(resolve(path,'..'),{recursive:true});await writeFile(path,Buffer.from(file.data,'base64'));}manifest.push({name:skill.name,version:skill.version,files:skill.files.map(f=>f.path)});}
 await mkdir('seo-skills',{recursive:true});await writeFile('seo-skills/manifest.json',JSON.stringify({formatVersion:1,skills:manifest},null,2)+'\n');console.log(`Exported ${skills.length} SEO skills from built-in source`);
}
