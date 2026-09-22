import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,symlink,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {inventory,assertPackagePaths,assertInventory} from '../examples/b2b-block-starter/scripts/release/files.mjs';
test('release rejects credentials, test helpers and traversal outside allowlist',()=>{
 for(const path of ['wp-config.php','wp-content/mu-plugins/smtp.php','wp-content/uploads/../wp-config.php','wp-content/uploads/.env','database.sql.bak','wp-content/plugins/unknown/plugin.php'])assert.throws(()=>assertPackagePaths({[path]:'hash'}),path);
 assert.doesNotThrow(()=>assertPackagePaths({'database.sql':'hash','wp-content/themes/b2b-equipment/style.css':'hash','wp-content/plugins/fluentform/app/Services/Cache.php':'hash'}));
});
test('release detects changed, missing and added bytes and rejects symlinks',async()=>{
 const root=await mkdtemp(join(tmpdir(),'release-files-'));
 try{await writeFile(join(root,'one'),'original');const expected=await inventory(root);assertInventory(await inventory(root),expected);await writeFile(join(root,'one'),'modified');const modified=await inventory(root);assert.throws(()=>assertInventory(modified,expected));assert.throws(()=>assertInventory({},expected));assert.throws(()=>assertInventory({...expected,two:'new'},expected));await symlink(join(root,'one'),join(root,'link'));await assert.rejects(inventory(root),/Symlink/);}finally{await rm(root,{recursive:true,force:true});}
});
