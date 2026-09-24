#!/usr/bin/env node
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync} from 'node:fs';
import {join, relative, resolve} from 'node:path';

const repoRoot = resolve(process.cwd());
const sourceRoot = join(repoRoot, 'examples/classic-b2b-starter');
const distRoot = join(repoRoot, 'dist');
if (!existsSync(sourceRoot)) {
  throw new Error(`Starter source not found: ${sourceRoot}`);
}
if (!existsSync(join(sourceRoot, 'project.example.json'))) {
  throw new Error('project.example.json is required before packaging');
}

const forbidden = /cleanroom|Cleanroom|harness-cleanroom|novalux|NOVALUX|field_nova/;
const files = [];
const walk = relative => {
  for (const entry of readdirSync(join(sourceRoot, relative), {withFileTypes: true})) {
    const path = relative ? `${relative}/${entry.name}` : entry.name;
    if (entry.isDirectory()) walk(path);
    else files.push(path);
  }
};
walk('');

for (const file of files) {
  if (!/\.(php|css|js|json|md|html|svg|woff2)$/.test(file)) continue;
  if (forbidden.test(file) || forbidden.test(readFileSync(join(sourceRoot, file), 'utf8'))) {
    throw new Error(`Forbidden project-specific naming found in ${file}`);
  }
}

const plugin = readFileSync(join(sourceRoot, 'plugin/starter-model.php'), 'utf8');
const version = plugin.match(/^ \* Version:\s*(.+)$/m)?.[1]?.trim();
if (!version) throw new Error('Unable to read starter plugin version');
const slug = `b2b-wordpress-starter-${version}`;
const archive = join(distRoot, `${slug}.tar.gz`);
mkdirSync(distRoot, {recursive: true});
execFileSync('tar', ['-czf', archive, '-C', sourceRoot, '.'], {stdio: 'pipe'});

const sha256 = path => createHash('sha256').update(readFileSync(path)).digest('hex');
const manifest = {
  name: 'B2B WordPress Starter',
  version,
  archive: relative(repoRoot, archive),
  archiveSha256: sha256(archive),
  files: files.sort().map(file => ({path: file, sha256: sha256(join(sourceRoot, file))})),
  createdAt: new Date().toISOString(),
};
const manifestPath = join(distRoot, `${slug}.manifest.json`);
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`OK ${relative(repoRoot, archive)}`);
console.log(`OK ${relative(repoRoot, manifestPath)}`);
console.log(`SHA256 ${manifest.archiveSha256}`);
