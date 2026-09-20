import {waitForWordPress} from './wordpress-ready.mjs';
// Disposable full-site reference; no existing WordPress database is mounted.
import { mkdtemp, mkdir, readFile, writeFile, access, readdir, cp } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createServer } from 'node:net';
import { validateBlueprint } from '@wp-playground/blueprints';
import { spawn, execFileSync } from 'node:child_process';
// Fail before changing the latest-run pointer when another preview owns the port.
const probe = createServer();
await new Promise((accept, reject) => { probe.once('error', reject); probe.listen(9464, '127.0.0.1', accept); });
await new Promise((accept, reject) => probe.close(error => error ? reject(error) : accept()));
execFileSync(process.execPath, [resolve('.agents/skills/wordpress-builder/scripts/wp.mjs'), 'capabilities'], { stdio: 'pipe' });
await mkdir('.lab', { recursive: true });
const run = await mkdtemp(resolve('.lab/hongda-'));
const artifacts = join(run, 'artifacts');
await mkdir(artifacts, { mode: 0o700 });
const plugins = resolve(process.env.WP_TEST_PLUGINS_PATH ?? '.lab/wordpress/wp-content/plugins');
for (const file of ['advanced-custom-fields/acf.php', 'fluentform/fluentform.php', 'autodescription/autodescription.php']) await access(join(plugins, file));
// Copy source so a preview process never observes half-written changes in the repository.
await cp('examples/hongda-wordpress', join(run, 'source'), { recursive: true });
const mu = join(run, 'mu-plugins');
await mkdir(mu);
await cp('scripts/fixtures/new-site/lab-only.php', join(mu, 'lab-only.php'));
await cp('scripts/fixtures/hongda/route-compat.php', join(mu, 'route-compat.php'));
await cp('scripts/fixtures/hongda/receipts.php', join(mu, 'receipts.php'));
await cp('scripts/fixtures/hongda/snapshot.php', join(mu, 'snapshot.php'));
const steps = [
  ...['advanced-custom-fields/acf.php', 'fluentform/fluentform.php', 'autodescription/autodescription.php', 'site-model/site-model.php'].map(pluginPath => ({ step: 'activatePlugin', pluginPath })),
  { step: 'activateTheme', themeFolderName: 'site-reference' },
  { step: 'runPHP', code: await readFile('examples/hongda-wordpress/content/seed.php', 'utf8') },
];
const blueprint = { $schema: 'https://playground.wordpress.net/blueprint-schema.json', preferredVersions: { wp: '7.1.1', php: '8.3' }, constants: { NEW_SITE_REFERENCE_LAB: true }, steps };
await writeFile(join(run, 'blueprint.json'), JSON.stringify(blueprint, null, 2));
const phpFiles = [];
async function collect(directory) {
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, item.name);
    if (item.isDirectory()) await collect(path);
    else if (path.endsWith('.php')) phpFiles.push(path);
  }
}
await collect(join(run, 'source'));
// Parse all site PHP with the actual Playground PHP before seeding.
steps.unshift({ step: 'runPHP', code: '<?php ' + phpFiles.map(path => `token_get_all(file_get_contents(${JSON.stringify('/source/' + path.slice(join(run, 'source').length + 1))}), TOKEN_PARSE);`).join('\n') });
const validation = validateBlueprint(blueprint);
if (!validation.valid) throw new Error(JSON.stringify(validation.errors));
await writeFile(join(run, 'blueprint.json'), JSON.stringify(blueprint, null, 2));
await writeFile(join(run, 'loopback.mjs'), "import {Server} from 'node:net'; const original=Server.prototype.listen; Server.prototype.listen=function(...args){if(args[0]===9464&&(args[1]===undefined||typeof args[1]==='function'))return Reflect.apply(original,this,[9464,'127.0.0.1',...args.slice(1)]);return Reflect.apply(original,this,args);};");
for (const [module, script] of [['wp-project-triage','detect_wp_project.mjs'],['wp-plugin-development','detect_plugins.mjs']]) {
  const path = resolve(`.agents/skills/wordpress-builder/vendor/wordpress/skills/${module}/scripts/${script}`);
  const output = execFileSync(process.execPath, [path], { cwd: join(run, 'source'), encoding: 'utf8' });
  await writeFile(join(artifacts, module + '.json'), output);
}
const args = ['--experimental-wasm-jspi','--import='+join(run,'loopback.mjs'),resolve('node_modules/.bin/wp-playground-cli'),'server','--wp=7.1.1','--php=8.3','--port=9464','--workers=6','--blueprint='+join(run,'blueprint.json'),
  '--mount-dir',join(run,'source'),'/source',
  '--mount-dir',join(run,'source/theme'),'/wordpress/wp-content/themes/site-reference',
  '--mount-dir',join(run,'source/plugin'),'/wordpress/wp-content/plugins/site-model',
  '--mount-dir',mu,'/wordpress/wp-content/mu-plugins',
  '--mount-dir',artifacts,'/artifacts',
  '--define-bool','DISABLE_WP_CRON','true','--define-bool','AUTOMATIC_UPDATER_DISABLED','true'];
for (const name of ['advanced-custom-fields','fluentform','autodescription']) args.push('--mount-dir',join(plugins,name),'/wordpress/wp-content/plugins/'+name);
console.log('HONGDA preview at http://127.0.0.1:9464; private artifacts:', artifacts);
const child = spawn(process.execPath, args, { stdio: 'inherit' });
child.on('exit', code => { process.exitCode = code ?? 1; });
process.on('SIGINT', () => child.kill('SIGINT'));
process.on('SIGTERM', () => child.kill('SIGTERM'));

let running=true; child.once('exit',()=>{running=false;});
try {
 await waitForWordPress({url:'http://127.0.0.1:9464',artifact:join(artifacts,'site.json'),php:'8.3',wordpress:'7.1.1',isRunning:()=>running});
 await writeFile('.lab/hongda-latest.json', JSON.stringify({ run, artifacts, url: 'http://127.0.0.1:9464' }));
 console.log("Verified ready; active preview pointer updated.");
} catch(error) {child.kill('SIGTERM');throw error;}
