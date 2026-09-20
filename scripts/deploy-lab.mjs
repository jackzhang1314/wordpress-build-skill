#!/usr/bin/env node
// Local fixture deployment only. Restart Playground after sync, then run smoke.
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, realpathSync, existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { request } from 'node:http';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const targets = {
  theme: { src: 'examples/terralift-ui-theme', dst: '.lab/wordpress/wp-content/themes/terralift-ui' },
  plugin: { src: 'examples/octopus-site', dst: '.lab/wordpress/wp-content/plugins/octopus-site' },
};
function run(args) { return execFileSync('rsync', args, { cwd: ROOT, encoding: 'utf8' }); }
export function assertInside(file, directory) {
  const rel = path.relative(realpathSync(directory), realpathSync(file));
  if (!rel || rel.startsWith('..' + path.sep) || rel === '..' || path.isAbsolute(rel)) throw new Error('Path escapes managed source directory');
  return rel;
}
function backup() {
  const dir = path.join(ROOT, '.lab/backups', new Date().toISOString().replace(/[:.]/g, '-'));
  mkdirSync(dir, { recursive: true });
  for (const name of ['themes', 'plugins', 'mu-plugins']) {
    const source = path.join(ROOT, '.lab/wordpress/wp-content', name);
    if (existsSync(source)) cpSync(source, path.join(dir, name), { recursive: true });
  }
  const db = path.join(ROOT, '.lab/wordpress/wp-content/database/.ht.sqlite');
  if (!existsSync(db)) throw new Error('Expected lab SQLite database missing; no deployment performed');
  execFileSync('python3', ['-c', 'import sqlite3,sys\nwith sqlite3.connect("file:"+sys.argv[1]+"?mode=ro",uri=True) as src, sqlite3.connect(sys.argv[2]) as dst: src.backup(dst)', db, path.join(dir, 'database.sqlite')]);
  writeFileSync(path.join(dir, 'restore.json'), JSON.stringify({ createdAt: new Date().toISOString(), targets, database: db, instructions: 'Stop Playground; restore themes, plugins, mu-plugins and SQLite together; preserve uploads; restart and run smoke. This is not a production backup.' }, null, 2));
  console.log('Backup:', path.relative(ROOT, dir));
  return dir;
}
function checkTemplateOwnership() {
  const db = path.join(ROOT, '.lab/wordpress/wp-content/database/.ht.sqlite');
  const code = `import sqlite3,sys,json
with sqlite3.connect("file:"+sys.argv[1]+"?mode=ro",uri=True) as db:
 rows=db.execute("SELECT p.post_name FROM wp_posts p JOIN wp_term_relationships r ON r.object_id=p.ID JOIN wp_term_taxonomy x ON x.term_taxonomy_id=r.term_taxonomy_id JOIN wp_terms t ON t.term_id=x.term_id WHERE p.post_type IN ('wp_template','wp_template_part') AND p.post_status='publish' AND x.taxonomy='wp_theme' AND t.slug='terralift-ui'").fetchall()
 print(json.dumps([r[0] for r in rows]))`;
  const conflicts = JSON.parse(execFileSync('python3', ['-c', code, db], { encoding: 'utf8' }));
  if (conflicts.length) throw new Error('Editor-owned template overrides need review; nothing deleted: ' + conflicts.join(', '));
}
function syncTarget(name) {
  const { src, dst } = targets[name];
  console.log(run(['-ani', '--delete', src + '/', dst + '/']));
  console.log(run(['-ai', '--delete', src + '/', dst + '/']));
}
export function checkRoute(url, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const req = request(url, { method: 'GET' }, res => {
      res.resume();
      if (res.statusCode !== 200) reject(new Error(`${url}: HTTP ${res.statusCode}`));
      else resolve(res.statusCode);
    });
    req.setTimeout(timeoutMs, () => req.destroy(new Error('Smoke request timed out')));
    req.on('error', reject);
    req.end();
  });
}
async function main() {
  const [cmd, arg] = process.argv.slice(2);
  if (['file', 'theme', 'all'].includes(cmd)) checkTemplateOwnership();
  if (cmd === 'smoke') {
    for (const route of ['/', '/products/', '/products/tl-e08/', '/terralift-contact/']) {
      await checkRoute('http://127.0.0.1:9462' + route);
      console.log('PASS', route);
    }
    return;
  }
  if (cmd === 'backup') { backup(); return; }
  if (cmd === 'file') {
    if (!arg) throw new Error('Expected source file');
    const file = path.resolve(ROOT, arg);
    const match = Object.values(targets).find(t => file.startsWith(path.resolve(ROOT, t.src) + path.sep));
    if (!match) throw new Error('File is outside managed source trees');
    const rel = assertInside(file, path.resolve(ROOT, match.src));
    backup();
    const dest = path.resolve(ROOT, match.dst, rel);
    mkdirSync(path.dirname(dest), { recursive: true });
    cpSync(file, dest);
  } else if (cmd === 'all' || Object.hasOwn(targets, cmd ?? '')) {
    backup();
    for (const name of cmd === 'all' ? Object.keys(targets) : [cmd]) syncTarget(name);
  } else throw new Error('commands: file <path> | theme | plugin | backup | all | smoke');
  console.log('Files synced; restart Playground before smoke/browser verification. Not yet verified.');
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
