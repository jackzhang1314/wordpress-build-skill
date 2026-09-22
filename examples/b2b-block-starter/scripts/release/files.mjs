import {readdir,readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
export const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
export async function inventory(root){
 const files={};
 async function walk(dir,relative=''){
  for(const entry of await readdir(dir,{withFileTypes:true})){
   const name=relative?relative+'/'+entry.name:entry.name;
   if(entry.isSymbolicLink())throw new Error('Symlink rejected: '+name);
   if(entry.isDirectory())await walk(join(dir,entry.name),name);
   else if(entry.isFile())files[name]=hash(await readFile(join(dir,entry.name)));
   else throw new Error('Nonregular file rejected: '+name);
  }
 }
 await walk(root);return Object.fromEntries(Object.entries(files).sort(([a],[b])=>a.localeCompare(b)));
}
export function assertPackagePaths(files){
 for(const name of Object.keys(files)){
  if(name.startsWith('/')||name.split('/').some(p=>p==='..'||(p.startsWith('.')&&!(['.phpcs.xml','.jshintrc','.mddoc.xml','.wp-env-tests.json','.gitkeep','.gitignore'].includes(p)&&name.startsWith('wp-content/plugins/'))))||/wp-config|mu-plugins|\.env|\.log$/i.test(name))throw new Error('Forbidden package path: '+name);
  if(!/^(database\.sql$|plugin-profile\.json$|wp-content\/(themes\/b2b-equipment\/|plugins\/(advanced-custom-fields|fluentform|seo-by-rank-math|site-model)\/|uploads\/))/.test(name))throw new Error('Outside release allowlist: '+name);
 }
}
export function assertInventory(actual,expected){
 if(JSON.stringify(actual)!==JSON.stringify(expected))throw new Error('Release file inventory mismatch');
}
