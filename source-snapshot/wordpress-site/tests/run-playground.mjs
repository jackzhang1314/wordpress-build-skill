// Developer-only verification. Does not add a local runtime requirement for users.
import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const root=fileURLToPath(new URL('../..',import.meta.url));
const cli=process.argv[2],directory=process.argv[3];if(!cli||!directory)throw new Error('Usage: node wordpress-site/tests/run-playground.mjs /absolute/wp-playground-cli /absolute/output-directory [acf]');
const out=resolve(directory);await mkdir(out,{recursive:true});
await copyFile(resolve(root,'dist/wordpress-site/octopus-site-0.1.0.zip'),resolve(out,'octopus-site-0.1.0.zip'));
const steps=[];
if(process.argv[4]==='acf')steps.push({step:'installPlugin',pluginData:{resource:'url',url:'https://www.advancedcustomfields.com/latest/'},options:{activate:true}});
steps.push({step:'installPlugin',pluginData:{resource:'vfs',path:'/artifacts/octopus-site-0.1.0.zip'},options:{activate:true}},{step:'runPHP',code:await readFile(resolve(root,'wordpress-site/tests/acceptance.php'),'utf8')});
await writeFile(resolve(out,'blueprint.json'),JSON.stringify({preferredVersions:{php:'8.3',wp:'6.9'},steps}));
await promisify(execFile)(cli,['run-blueprint','--wp=6.9','--php=8.3','--blueprint='+resolve(out,'blueprint.json'),'--mount-dir',out,'/artifacts'],{maxBuffer:2*1024*1024});
const report=JSON.parse(await readFile(resolve(out,'results.json'),'utf8'));
if(report.error||report.results.some(r=>!r.passed))throw new Error(JSON.stringify(report));
console.log(JSON.stringify(report,null,2));
