#!/usr/bin/env node
// Layered lab deployment (fusion item #5, docs/15).
// Usage:
//   node scripts/deploy-lab.mjs file <path-inside-theme-or-plugin>   # single-file hot sync
//   node scripts/deploy-lab.mjs theme                                # full theme sync
//   node scripts/deploy-lab.mjs plugin                               # plugin sync
//   node scripts/deploy-lab.mjs backup                               # snapshot deployed theme
//   node scripts/deploy-lab.mjs all                                  # backup + theme + plugin

import { execSync } from 'node:child_process';
import { cpSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const THEME_SRC = 'examples/terralift-ui-theme';
const PLUGIN_SRC = 'source-snapshot/wordpress-site/plugin/octopus-site';
const THEME_DST = '.lab/wordpress/wp-content/themes/terralift-ui';
const PLUGIN_DST = '.lab/wordpress/wp-content/plugins/octopus-site';
const BACKUP_ROOT = '.lab/backups';
const SITE_URL = 'http://127.0.0.1:9462';

const targets = {
  theme: { src: THEME_SRC, dst: THEME_DST },
  plugin: { src: PLUGIN_SRC, dst: PLUGIN_DST },
};

function run(cmd) {
  execSync(cmd, { stdio: 'inherit', cwd: ROOT });
}

function syncTarget(name) {
  const { src, dst } = targets[name];
  run(`rsync -a --delete ${src}/ ${dst}/`);
  console.log(`✔ synced ${name}: ${src} -> ${dst}`);
}

function backup() {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const dir = path.join(BACKUP_ROOT, stamp);
  mkdirSync(dir, { recursive: true });
  cpSync(THEME_DST, path.join(dir, 'terralift-ui'), { recursive: true });
  console.log(`✔ backed up deployed theme -> ${dir}`);
  return dir;
}

function syncFile(rel) {
  const abs = path.resolve(ROOT, rel);
  const matched = Object.entries(targets).find(([, { src }]) =>
    abs.startsWith(path.resolve(ROOT, src) + path.sep)
  );
  if (!matched) {
    console.error(`✖ ${rel} is not inside ${THEME_SRC}/ or ${PLUGIN_SRC}/`);
    process.exit(1);
  }
  const [, { src, dst }] = matched;
  const relInside = path.relative(path.resolve(ROOT, src), abs);
  const dstAbs = path.join(ROOT, dst, relInside);
  mkdirSync(path.dirname(dstAbs), { recursive: true });
  cpSync(abs, dstAbs);
  console.log(`✔ synced file: ${relInside} -> ${dst}/${relInside}`);
}

function smoke() {
  for (const route of ['/', '/products/', '/products/tl-e08/', '/terralift-contact/']) {
    const code = Number(execSync(`curl -s -o /dev/null -w '%{http_code}' ${SITE_URL}${route}`).toString());
    console.log(`${code === 200 ? '✔' : '✖'} smoke ${route} -> ${code}`);
  }
}

const [cmd, arg] = process.argv.slice(2);
switch (cmd) {
  case 'file':
    if (!arg) { console.error('usage: deploy-lab.mjs file <path>'); process.exit(1); }
    syncFile(arg);
    break;
  case 'theme':
  case 'plugin':
    syncTarget(cmd);
    break;
  case 'backup':
    backup();
    break;
  case 'all':
    backup();
    syncTarget('theme');
    syncTarget('plugin');
    smoke();
    break;
  case 'smoke':
    smoke();
    break;
  default:
    console.log('commands: file <path> | theme | plugin | backup | all | smoke');
}
