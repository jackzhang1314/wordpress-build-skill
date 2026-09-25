import {chmodSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync} from 'node:fs';
import {execFileSync as defaultSshExec} from 'node:child_process';
import dns from 'node:dns/promises';
import {homedir} from 'node:os';
import {dirname, join, resolve} from 'node:path';
import {argValue} from './maintenance.mjs';
import {createSSH} from './ssh.mjs';

/** Read Hostinger's website list and return only the fields needed for SSH defaults. */
export function discoverHostingerWebsite(domain, {exec = defaultSshExec} = {}) {
  const raw = exec('hostinger', ['hosting', 'websites', 'list', '--format', 'json'], {
    encoding: 'utf8', timeout: 60000, maxBuffer: 16 * 1024 * 1024, stdio: ['pipe', 'pipe', 'pipe'],
  });
  const payload = JSON.parse(raw);
  const rows = Array.isArray(payload?.data) ? payload.data : [];
  const exact = rows.find(row => row?.domain === domain);
  if (exact) return {domain: exact.domain, user: exact.username, orderId: exact.order_id};
  const parent = rows.find(row => domain.endsWith(`.${row?.domain}`));
  return parent ? {domain: parent.domain, user: parent.username, orderId: parent.order_id} : undefined;
}

/** Choose an SSH host/user when project.json does not already have one. */
export async function deriveSshDefaults(project, {domain = project.domain, lookup = dns.lookup, discover = undefined} = {}) {
  if (!domain) throw new Error('SSH setup needs project.domain or --ssh-host');
  let host = '';
  let user = project.ssh?.user || project.hostinger?.user || '';
  let orderId = project.hostinger?.order;
  if (discover !== undefined) {
    const website = discover(domain);
    if (website?.user) user ||= website.user;
    if (website?.orderId) orderId ||= website.orderId;
  }
  if (!host) {
    try {
      const records = await lookup(domain, {all: true, verbatim: true});
      host = records?.[0]?.address || '';
    } catch {
      host = '';
    }
  }
  return {host, user, port: project.ssh?.port || '65002', orderId};
}

/** Update only SSH fields; all other project settings and local state remain untouched. */
export function writeProjectSsh(projectRoot, project, ssh) {
  const root = resolve(projectRoot);
  const path = join(root, 'project.json');
  const raw = JSON.parse(readFileSync(path, 'utf8'));
  raw.ssh = {
    ...(raw.ssh || {}),
    host: ssh.host,
    port: ssh.port,
    user: ssh.user,
    keyPath: ssh.keyPath,
    wpPath: ssh.wpPath,
  };
  if (!raw.hostinger?.user && ssh.user) raw.hostinger = {...(raw.hostinger || {}), user: ssh.user};
  writeFileSync(path, `${JSON.stringify(raw, null, 2)}\n`);
  return raw;
}

/** Create a dedicated non-passphrase key; a passphrase prompt is not suitable for unattended deployment. */
export function ensureSshKey(project, keyPath, {exec = defaultSshExec, rotateKey = false} = {}) {
  const target = resolve(keyPath.replace(/^~(?=$|\/)/, homedir()));
  if (rotateKey && existsSync(target)) {
    const timestamp = Date.now();
    for (const path of [target, `${target}.pub`]) {
      if (existsSync(path)) {
        const backup = `${path}.${timestamp}.bak`;
        mkdirSync(dirname(backup), {recursive: true});
        renameSync(path, backup);
      }
    }
  }
  if (!existsSync(target)) {
    mkdirSync(dirname(target), {recursive: true});
    exec('ssh-keygen', ['-t', 'ed25519', '-N', '', '-C', `harness-${project.slug || project.title}`, '-f', target], {
      encoding: 'utf8', timeout: 30000, maxBuffer: 1024 * 1024, stdio: ['pipe', 'pipe', 'pipe'],
    });
    chmodSync(target, 0o600);
  } else {
    chmodSync(target, 0o600);
  }
  if (!existsSync(`${target}.pub`)) {
    const material = exec('ssh-keygen', ['-y', '-f', target], {
      encoding: 'utf8', timeout: 30000, maxBuffer: 1024 * 1024, stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
    writeFileSync(`${target}.pub`, `${material} harness-${project.slug || project.title}\n`, {mode: 0o644});
  }
  const publicKey = readFileSync(`${target}.pub`, 'utf8').trim();
  return {privateKey: target, publicKey};
}

/** Build a novice-safe one-time handoff for Hostinger's shared/cloud SSH key limitation. */
export function sshKeyOnboarding(project, key, {copied = false} = {}) {
  const publicKeyPath = `${key.privateKey}.pub`;
  const url = `https://hpanel.hostinger.com/websites/${project.domain}/advanced/ssh-access?redirectLocation=side_menu`;
  const copyCommand = process.platform === 'darwin'
    ? `pbcopy < ${publicKeyPath}`
    : `wl-copy < ${publicKeyPath}  # or: xclip -selection clipboard < ${publicKeyPath}`;
  const steps = copied ? [
    `The public key is already on the clipboard (source: ${publicKeyPath}).`,
    `Open hPanel: ${url}`,
    'Choose SSH Access → Add SSH Key, paste the key, then save.',
    'Rerun `node harness/cli.mjs --project . ssh setup`.',
  ] : [
    `Copy the public key from ${publicKeyPath}.`,
    `Open hPanel: ${url}`,
    'Choose SSH Access → Add SSH Key, paste the key, then save.',
    'Rerun `node harness/cli.mjs --project . ssh setup`.',
  ];
  return {
    url,
    publicKeyPath,
    copyCommand,
    copied,
    limitation: 'Hostinger shared/cloud hosting has no public API/CLI endpoint that installs an SSH key; only VPS public keys have a write API.',
    steps,
  };
}

/** Prepare defaults, persist them, install the key pair, then test SSH/WP-CLI when possible. */
export async function setupProjectSsh(projectRoot, project, args = [], {
  exec = defaultSshExec,
  lookup = dns.lookup,
  discover = discoverHostingerWebsite,
  openUrl,
  logger = () => {},
} = {}) {
  if (!project.domain) throw new Error('Add project.domain before running `ssh setup`.');
  const host = argValue(args, '--ssh-host');
  const user = argValue(args, '--ssh-user');
  const port = argValue(args, '--ssh-port', '65002');
  const requestedKey = argValue(args, '--ssh-key');
  const rotateKey = args.includes('--rotate-key');
  let defaults = {
    host: host || project.ssh?.host || '',
    user: user || project.ssh?.user || project.hostinger?.user || '',
    port,
  };
  if (!defaults.host || !defaults.user) {
    const discovered = await deriveSshDefaults(project, {lookup, discover: discover === false ? undefined : discover});
    defaults.host ||= discovered.host;
    defaults.user ||= discovered.user;
    defaults.orderId ||= discovered.orderId;
  }
  if (!defaults.host || !defaults.user) {
    throw new Error('Could not derive SSH host/user. Run `hostinger setup --connect` or pass --ssh-host and --ssh-user.');
  }

  const keyPath = requestedKey || project.ssh?.keyPath || join(homedir(), `.ssh/hostinger-${project.slug || 'site'}-ed25519`);
  const key = ensureSshKey(project, keyPath, {exec, rotateKey});
  const wpPath = project.ssh?.wpPath || `/home/${defaults.user}/domains/${project.domain}/public_html`;
  const sshSettings = {...defaults, keyPath: key.privateKey, wpPath};
  writeProjectSsh(projectRoot, project, sshSettings);

  const candidate = {...project, ssh: sshSettings};
  const ssh = createSSH(candidate, {execFile: exec});
  try {
    ssh.run('echo ok');
    const wpVersion = ssh.wp(['core', 'version']).trim();
    logger('  OK  SSH connection and remote WP-CLI are ready');
    return {
      pass: true,
      connected: true,
      ssh: sshSettings,
      manualKeySetup: false,
      publicKey: key.publicKey,
      wpVersion,
      next: 'Run `node harness/cli.mjs --project . doctor` to complete project checks.',
    };
  } catch (error) {
    let copied = false;
    if (args.includes('--copy-key')) {
      const command = process.platform === 'darwin' ? 'pbcopy' : 'wl-copy';
      try {
        exec(command, [], {
          input: key.publicKey,
          encoding: 'utf8',
          timeout: 10000,
          maxBuffer: 1024 * 1024,
          stdio: ['pipe', 'pipe', 'pipe'],
        });
        copied = true;
        logger('  OK  Public key copied to the clipboard');
      } catch (copyError) {
        logger(`  WARN  Could not copy the public key automatically: ${copyError.message}`);
      }
    }
    if (args.includes('--open') && openUrl) {
      const onboardingPreview = sshKeyOnboarding(project, key, {copied});
      try {
        openUrl(onboardingPreview.url);
        logger(`  OK  Opened hPanel: ${onboardingPreview.url}`);
      } catch (openError) {
        logger(`  WARN  Could not open hPanel automatically: ${openError.message}`);
      }
    }
    const onboarding = sshKeyOnboarding(project, key, {copied});
    logger('  ACTION REQUIRED  Hostinger shared/cloud hosting needs a one-time SSH key handoff.');
    logger(`  ${onboarding.limitation}`);
    for (const step of onboarding.steps) logger(`  - ${step}`);
    return {
      pass: false,
      connected: false,
      ssh: sshSettings,
      publicKey: key.publicKey,
      manualKeySetup: true,
      ...onboarding,
      error: error.message,
      next: args.includes('--open') || args.includes('--copy-key')
        ? 'After saving the key, rerun `node harness/cli.mjs --project . ssh setup`.'
        : 'For fewer copy/paste mistakes, rerun `node harness/cli.mjs --project . ssh setup --open --copy-key`.',
    };
  }
}
