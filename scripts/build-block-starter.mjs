import {cp,mkdir,readFile,readdir,writeFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {createHash} from 'node:crypto';
const source=resolve('examples/b2b-block-starter'),target=resolve('.agents/skills/wordpress-builder/assets/block-starter');
await mkdir(target,{recursive:true});
const files={};
async function copyTree(relative){for(const file of await readdir(join(source,relative),{withFileTypes:true})){const name=join(relative,file.name);if(file.isDirectory())await copyTree(name);else if(file.isFile()){await mkdir(join(target,relative),{recursive:true});await cp(join(source,name),join(target,name));files[name]=createHash('sha256').update(await readFile(join(target,name))).digest('hex');}}}
for(const folder of ['theme','plugin'])await copyTree(folder);
await writeFile(join(target,'manifest.json'),JSON.stringify({source:'examples/b2b-block-starter',files},null,2)+'\n');
console.log('Packaged '+Object.keys(files).length+' block starter source files into Skill assets.');

await cp('config/wordpress-plugins.json','.agents/skills/wordpress-builder/assets/plugin-profile.json');
