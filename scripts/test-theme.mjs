// Real WordPress/ACF/PHP regression in a private copy; never alters the running fixture.
import { cp, mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
const root = resolve('.lab');
await mkdir(root, { recursive: true });
const run = await mkdtemp(resolve(root, 'theme-test-'));
const wordpress = resolve(run, 'wordpress');
const artifacts = resolve(run, 'artifacts');
await mkdir(artifacts);
await cp(resolve(root, 'wordpress'), wordpress, { recursive: true });
execFileSync('python3', ['-c', 'import sqlite3,sys\nwith sqlite3.connect("file:"+sys.argv[1]+"?mode=ro",uri=True) as src, sqlite3.connect(sys.argv[2]) as dst: src.backup(dst)', resolve(root, 'wordpress/wp-content/database/.ht.sqlite'), resolve(wordpress, 'wp-content/database/.ht.sqlite')]);
await cp('examples/terralift-ui-theme', resolve(wordpress, 'wp-content/themes/terralift-ui'), {recursive:true});
await cp('examples/octopus-site', resolve(wordpress, 'wp-content/plugins/octopus-site'), {recursive:true});
for (const [fixture, result] of [['integration-test','integration'], ['missing-acf-test','missing-acf']]) {
  const blueprint = resolve(run, fixture + '.json');
  await writeFile(blueprint, JSON.stringify({steps:[{step:'runPHP',code:await readFile('scripts/fixtures/' + fixture + '.php','utf8')}]}));
  execFileSync(process.execPath, ['--experimental-wasm-jspi','node_modules/.bin/wp-playground-cli','run-blueprint','--wp=6.9','--php=8.3','--site-url=http://127.0.0.1:9462','--wordpress-install-mode=do-not-attempt-installing','--mount-dir-before-install',wordpress,'/wordpress','--mount-dir',artifacts,'/artifacts','--blueprint='+blueprint,'--define-bool','TERRALIFT_REGRESSION','true','--define-bool','DISABLE_WP_CRON','true'], {stdio:'inherit'});
  const evidence = JSON.parse(await readFile(resolve(artifacts, result + '.json'),'utf8'));
  if (evidence.checks ? !Object.values(evidence.checks).every(Boolean) : evidence.pass !== true) throw new Error('Regression failed: ' + fixture);
  console.log('PASS', fixture, JSON.stringify(evidence));
}
console.log('Preserved isolated evidence:', artifacts);
