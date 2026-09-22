import {readdir,readFile,lstat} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
const digest=data=>createHash('sha256').update(data).digest('hex');
export async function dirInventory(root,markers=['style.css','theme.json']){
 root=resolve(root);if(!(await lstat(root)).isDirectory()||(await lstat(root)).isSymbolicLink())throw new Error('Inventory root must be a real directory');
 const files={};
 async function walk(relative=''){
  for(const entry of await readdir(join(root,relative),{withFileTypes:true})){
   const path=relative?relative+'/'+entry.name:entry.name;
   if(entry.isSymbolicLink())throw new Error('Theme symlink rejected: '+path);
   if(entry.isDirectory())await walk(path);
   else if(entry.isFile())files[path]=digest(await readFile(join(root,path)));
   else throw new Error('Unsupported theme entry: '+path);
  }
 }
 await walk();
 for(const marker of markers)if(!files[marker])throw new Error('Expected identity file missing: '+marker);
 return Object.fromEntries(Object.entries(files).sort(([a],[b])=>a.localeCompare(b)));
}
export function themeInventory(root){return dirInventory(root,['style.css','theme.json']);}
export async function themeDiff(before,after){
 const oldFiles=await themeInventory(before),newFiles=await themeInventory(after);
 const changes=[...new Set([...Object.keys(oldFiles),...Object.keys(newFiles)])].sort().filter(p=>oldFiles[p]!==newFiles[p]).map(path=>({path,kind:!oldFiles[path]?'added':!newFiles[path]?'deleted':'modified'}));
 const direct=/^(theme\.json|(?:templates|parts)\/[a-zA-Z0-9_-]+\.html)$/;
 return {beforeHash:digest(JSON.stringify(oldFiles)),afterHash:digest(JSON.stringify(newFiles)),changes,overridePaths:changes.filter(c=>direct.test(c.path)).map(c=>c.path),requiresPageRegression:changes.some(c=>!direct.test(c.path))};
}
