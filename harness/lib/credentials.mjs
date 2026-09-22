import {randomBytes} from 'node:crypto';
import {chmodSync, existsSync, readFileSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {hasFlag} from './maintenance.mjs';
import {shellQuote} from './ssh.mjs';

export function generatePassword() {
  // Same generator as provision: 21 bytes base64url (~128-bit entropy).
  return randomBytes(21).toString('base64url');
}

function credentialsPath(root, domain) {
  return join(root, '.wordpress-builder', `hostinger-${domain}`, 'wordpress.json');
}

function readCredentials(root, project) {
  const path = credentialsPath(root, project.domain);
  if (!existsSync(path)) throw new Error(`credentials file not found: ${path}`);
  return {path, data: JSON.parse(readFileSync(path, 'utf8'))};
}

function payload(site, data) {
  return {
    loginUrl: `https://${site.project.domain}/wp-admin`,
    login: data.login,
    password: data.password,
    email: data.email,
  };
}

function print(logger, p, source) {
  logger(`  Login URL: ${p.loginUrl}`);
  logger(`  User: ${p.login}`);
  logger(`  Password: ${p.password}`);
  if (p.email) logger(`  Email: ${p.email}`);
  if (source) logger(`  (source: ${source})`);
}

const ROTATE_PHP = `<?php
if (!defined('ABSPATH')) exit('CLI only');
$p = json_decode(file_get_contents($args[0]), true);
$user = get_user_by('login', $p['login']);
if (!$user) { fwrite(STDERR, 'user-not-found'); exit(1); }
wp_set_password($p['password'], $user->ID);
echo wp_json_encode(['id' => (int) $user->ID]);
`;

export async function showCredentials(site, args, logger = console.log) {
  const {path, data} = readCredentials(site.root, site.project);
  const p = payload(site, data);
  if (!hasFlag(args, '--json')) print(logger, p, path);
  return p;
}

export async function rotateCredentials(site, args, logger = console.log) {
  const {path, data} = readCredentials(site.root, site.project);
  const id = site.ssh.wp(['user', 'get', data.login, '--field=ID']).trim();
  if (!/^\d+$/.test(id)) throw new Error(`wp user not found: ${data.login}`);
  const password = generatePassword();
  const dir = `/tmp/credentials-${Date.now()}`;
  site.ssh.run(`rm -rf ${shellQuote(dir)} && mkdir -p ${shellQuote(dir)}`);
  site.ssh.run(`cat > ${shellQuote(dir + '/rotate.php')}`, {input: Buffer.from(ROTATE_PHP, 'utf8')});
  site.ssh.run(`cat > ${shellQuote(dir + '/payload.json')}`, {input: Buffer.from(JSON.stringify({login: data.login, password}), 'utf8')});
  site.ssh.wp(['eval-file', `${dir}/rotate.php`, `${dir}/payload.json`]);
  data.password = password;
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
  chmodSync(path, 0o600);
  const p = payload(site, data);
  if (!hasFlag(args, '--json')) print(logger, p, null);
  return p;
}
