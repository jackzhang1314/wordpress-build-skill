import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const p=JSON.parse(await readFile('.lab/b2b-starter-latest.json','utf8'));
await readFile(join(p.run,'ready.json'));
for(const service of ['primary','reuse'])for(const [folder,target] of [['theme','themes/b2b-equipment'],['plugin','plugins/site-model']])execFileSync('docker',['compose','-p',p.project,'-f',p.compose,'cp',join(p.source,folder)+'/.',service+':/var/www/html/wp-content/'+target],{stdio:'pipe'});
for(const service of ['primary','reuse']){const local=createHash('sha256').update(await readFile(join(p.source,'plugin/site-model.php'))).digest('hex');const remote=execFileSync('docker',['compose','-p',p.project,'-f',p.compose,'exec','-T',service,'sha256sum','/var/www/html/wp-content/plugins/site-model/site-model.php'],{encoding:'utf8'}).split(' ')[0];assert.equal(remote,local);}
console.log('Synced source only; content and database templates preserved.');
