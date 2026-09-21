import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {resolvePaths,validateBackupShape} from '../examples/b2b-block-starter/scripts/release/resolve.mjs';
const sha=data=>createHash('sha256').update(data).digest('hex');
test('resolvePaths isolates theme.json from resettable template paths',()=>{
 const {allowed,rejected}=resolvePaths(['theme.json','templates/a.html','parts/header.html','theme.json']);
 assert.deepEqual(allowed,['templates/a.html','parts/header.html']);
 assert.deepEqual(rejected,['theme.json']);
 assert.deepEqual(resolvePaths(['templates/b.html']).rejected,[]);
});
test('backup validator accepts well-formed backups and rejects malformed ones',()=>{
 const entry={id:7,type:'wp_template',path:'templates/x.html',slug:'x',title:'x',content:'<!-- wp:paragraph --><p>old</p><!-- /wp:paragraph -->',contentHash:sha('<!-- wp:paragraph --><p>old</p><!-- /wp:paragraph -->')};
 const good=validateBackupShape({shape:'wp-override-backup',backedUpAt:'2026-09-21T00:00:00Z',theme:'b2b-equipment',entries:[entry]});
 assert.equal(good.entries.length,1);
 const mismatched={...entry,contentHash:sha('different')};
 for(const bad of [null,'x',42,[],{},{shape:'other',theme:'t',entries:[entry]},{shape:'wp-override-backup',theme:'',entries:[entry]},{shape:'wp-override-backup',theme:'t',entries:[]},{shape:'wp-override-backup',theme:'t',entries:[{...entry,path:'theme.json'}]},{shape:'wp-override-backup',theme:'t',entries:[{...entry,path:'../evil.html'}]},{shape:'wp-override-backup',theme:'t',entries:[{...entry,contentHash:'zz'}]},{shape:'wp-override-backup',theme:'t',entries:[{...entry,content:''}]},{shape:'wp-override-backup',theme:'t',entries:[{...entry,title:undefined}]},{shape:'wp-override-backup',theme:'t',entries:[mismatched]}])assert.throws(()=>validateBackupShape(bad));
});
