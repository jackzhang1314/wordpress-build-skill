import { mkdir, writeFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';

// Only creates a private local fixture. No customer credentials or production host changes.
const out = resolve('.lab');
await mkdir(out, { recursive: true, mode: 0o700 });
await mkdir(resolve(out, 'artifacts'), { recursive: true, mode: 0o700 });
await mkdir(resolve(out, 'wordpress'), { recursive: true, mode: 0o700 });
const bootstrap = `<?php
require '/wordpress/wp-load.php';
$user = get_user_by('login', 'admin');
if (!$user) throw new Exception('Missing lab administrator');
$path = '/artifacts/connection.json';
if (!file_exists($path)) {
  update_option('blogname', 'Codex WordPress Lab');
  update_option('blog_public', '0');
  $result = WP_Application_Passwords::create_new_application_password($user->ID, array('name' => 'Codex isolated lab'));
  if (is_wp_error($result)) throw new Exception('Cannot create application password');
  file_put_contents($path, json_encode(array('site' => home_url(), 'username' => 'admin', 'password' => $result[0])));
}
file_put_contents('/artifacts/environment.json', json_encode(array('wp' => get_bloginfo('version'), 'theme' => get_stylesheet(), 'isBlockTheme' => wp_is_block_theme(), 'fixture' => true)));
`;
const auth = "<?php\n// Local fixture only: enable real application-password authentication on loopback HTTP.\nadd_filter('wp_is_application_passwords_available', '__return_true');\n";
const blueprint = { steps: [
  { step: 'mkdir', path: '/wordpress/wp-content/mu-plugins' },
  { step: 'writeFile', path: '/wordpress/wp-content/mu-plugins/codex-lab.php', data: auth },
  { step: 'runPHP', code: bootstrap },
] };
await writeFile(resolve(out, 'blueprint.json'), JSON.stringify(blueprint, null, 2), { mode: 0o600 });
const cli = resolve('node_modules/.bin/wp-playground-cli');
await access(cli);
let installed = false;
try { await access(resolve(out, 'wordpress/wp-load.php')); installed = true; } catch { /* First installation. */ }
console.log('Starting isolated WordPress at http://127.0.0.1:9462; private credentials stay under .lab/artifacts/.');
const child = spawn(process.execPath, ['--import=' + resolve('scripts/lab-bind.mjs'), cli, 'server', '--wp=6.9', '--php=8.3', '--port=9462', '--workers=6', '--wordpress-install-mode=' + (installed ? 'do-not-attempt-installing' : 'download-and-install'), '--blueprint=' + resolve(out, 'blueprint.json'), '--mount-dir-before-install', resolve(out, 'wordpress'), '/wordpress', '--mount-dir', resolve(out, 'artifacts'), '/artifacts', '--define-bool', 'AUTOMATIC_UPDATER_DISABLED', 'true', '--define-bool', 'DISABLE_WP_CRON', 'true'], { stdio: 'inherit' });
child.on('exit', code => { process.exitCode = code ?? 1; });
process.on('SIGINT', () => child.kill('SIGINT'));
process.on('SIGTERM', () => child.kill('SIGTERM'));
