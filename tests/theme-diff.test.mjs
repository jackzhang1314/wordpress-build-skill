import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,cp,rm,symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {themeDiff} from '../examples/b2b-block-starter/scripts/release/theme-diff.mjs';
test('automatic theme diff captures additions/removals and marks non-template changes',async()=>{
 const root=await mkdtemp(join(tmpdir(),'theme-diff-'));
 try{
  const a=join(root,'before'),b=join(root,'after');await mkdir(join(a,'templates'),{recursive:true});
  for(const [path,data] of Object.entries({'style.css':'old','theme.json':'{}','templates/old.html':'old'}))await writeFile(join(a,path),data);
  await cp(a,b,{recursive:true});assert.equal((await themeDiff(a,b)).changes.length,0);
  await rm(join(b,'templates/old.html'));await writeFile(join(b,'templates/new.html'),'new');await writeFile(join(b,'style.css'),'new');
  const d=await themeDiff(a,b);assert.deepEqual(d.overridePaths,['templates/new.html','templates/old.html']);assert.equal(d.requiresPageRegression,true);assert.notEqual(d.beforeHash,d.afterHash);
  await symlink(join(a,'theme.json'),join(b,'linked.json'));await assert.rejects(()=>themeDiff(a,b),/symlink/);
 }finally{await rm(root,{recursive:true,force:true});}
});
