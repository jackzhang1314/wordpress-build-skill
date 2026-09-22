// Explicit local lab target; a conflict exits 2 without modifying WordPress.
import {readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {join} from 'node:path';
import assert from 'node:assert/strict';
import {overrideInventoryPhp,validateChangedPaths} from './release/overrides.mjs';
const args=process.argv.slice(2);
let diff;
let paths;
if(args[0]==='--compare'){
 assert.equal(args.length,3,'Usage: --compare BEFORE_THEME AFTER_THEME');
 const {themeDiff}=await import('./release/theme-diff.mjs');
 diff=await themeDiff(args[1],args[2]);paths=diff.overridePaths;
}else if(args[0]==='--baseline'){
 assert.equal(args.length,3,'Usage: --baseline BASELINE_REPORT.json CANDIDATE_THEME_DIR');
 const {deriveBaselineChanges}=await import('./release/baseline.mjs');
 diff=await deriveBaselineChanges(JSON.parse(await readFile(args[1],'utf8')),args[2]);paths=diff.overridePaths;
}else if(args[0]==='--snapshot'){
 assert.equal(args.length,3,'Usage: --snapshot THEME_DIR OUT.json');
 const {themeInventory}=await import('./release/theme-diff.mjs');
 const files=await themeInventory(args[1]);
 await writeFile(args[2],JSON.stringify({shape:'local-inventory',savedAt:new Date().toISOString(),files},null,2)+'\n');
 console.log(JSON.stringify({savedTo:args[2],files:Object.keys(files).length,releaseApproval:false}));
 process.exit(0);
}else{
 paths=validateChangedPaths(args);
 assert.ok(paths.length,'Supply changed theme-relative paths; empty input is not release approval');
}
const p=JSON.parse(await readFile('.lab/b2b-starter-latest.json','utf8'));
await readFile(join(p.run,'ready.json'));assert.equal(p.urls.reuse,'http://127.0.0.1:9491');
const encoded=Buffer.from(JSON.stringify(paths)).toString('base64');
const code=overrideInventoryPhp+`echo wp_json_encode(harness_template_overrides(json_decode(base64_decode('${encoded}'),true)));`;
const raw=execFileSync('docker',['compose','-p',p.project,'-f',p.compose,'exec','-T','reuse','php','/tools/wp','--allow-root','eval',code],{encoding:'utf8',timeout:60000});
const report={...JSON.parse(raw),...(diff?{diff}:{}),releaseApproval:false};console.log(JSON.stringify(report,null,2));
if(report.blocked)process.exitCode=2;
