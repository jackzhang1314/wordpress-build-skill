import {chmodSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync} from 'node:fs';
import {execFileSync as defaultSshExec} from 'node:child_process';
import {randomUUID} from 'node:crypto';
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
export function ensureSshKey(project, keyPath, {exec = defaultSshExec, rotateKey = false, comment} = {}) {
  const identityComment = comment || `harness-${project.slug || project.title}`;
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
    exec('ssh-keygen', ['-t', 'ed25519', '-N', '', '-C', identityComment, '-f', target], {
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
    writeFileSync(`${target}.pub`, `${material} ${identityComment}\n`, {mode: 0o644});
  }
  const publicKey = readFileSync(`${target}.pub`, 'utf8').trim();
  return {privateKey: target, publicKey};
}

/** Hostinger authorization is per hosting account; keep one reusable key per account user. */
export function accountKeyPath(user, home = homedir()) {
  const safeUser = String(user || 'site').replace(/[^A-Za-z0-9._-]/g, '-');
  return join(home, '.ssh', `hostinger-${safeUser}_ed25519`);
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
    limitation: 'Hostinger shared/cloud hosting has no direct SSH-key endpoint; Harness bootstraps it via Files + Cron and falls back to hPanel.',
    steps,
  };
}

/**
 * Bootstrap an account key through the authorized Hostinger API. This uses the official
 * Files upload endpoint plus a one-minute Cron Job only until SSH succeeds, then deletes both.
 */
export async function installAccountSshKey(project, sshSettings, key, {
  exec = defaultSshExec,
  fetchImpl = globalThis.fetch,
  timeoutMs = 90000,
  intervalMs = 5000,
} = {}) {
  if (!project?.domain) throw new Error('Hostinger SSH bootstrap needs project.domain');
  if (!sshSettings?.user || !sshSettings?.host) throw new Error('Hostinger SSH bootstrap needs SSH user and host');
  const domain = project.domain;
  const user = sshSettings.user;
  const docRoot = `/home/${user}/domains/${domain}/public_html`;
  const staging = `.harness-ssh-bootstrap-${Date.now().toString(36)}-${randomUUID().slice(0, 8)}`;
  const remoteStaging = `${docRoot}/${staging}`;
  const runCli = args => exec('hostinger', [...args, '--format', 'json'], {
    encoding: 'utf8',
    timeout: 60000,
    maxBuffer: 16 * 1024 * 1024,
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  async function uploadOnce(name, content) {
    try {
      const credentials = JSON.parse(runCli([
        'hosting', 'files', 'generate-upload-url', '--domain', domain, '--username', user,
      ]));
      const target = `${String(credentials.url).replace(/\/$/, '')}/${staging}/${name}?override=true`;
      const headers = {
        'X-Auth': String(credentials.auth_key),
        'X-Auth-Rest': String(credentials.rest_auth_key),
        'Tus-Resumable': '1.0.0',
        'Upload-Offset': '0',
      };
      const body = Buffer.from(content);
      const created = await fetchImpl(target, {
        method: 'POST',
        headers: {...headers, 'Upload-Length': String(body.length)},
        body,
      });
      if (created.status !== 201) throw new Error(`creation returned HTTP ${created.status}`);
      const patched = await fetchImpl(target, {
        method: 'PATCH',
        headers: {...headers, 'Content-Type': 'application/offset+octet-stream'},
        body,
      });
      if (patched.status !== 204) throw new Error(`upload returned HTTP ${patched.status}`);
    } catch (error) {
      const detail = [error.cause?.code, error.cause?.message, error.message]
        .filter(Boolean).filter((item, index, list) => list.indexOf(item) === index).join('; ');
      throw new Error(`Hostinger file bootstrap failed for ${name}: ${detail}`, {cause: error});
    }
  }

  async function upload(name, content) {
    let lastError;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        await uploadOnce(name, content);
        return;
      } catch (error) {
        lastError = error;
        if (attempt < 3) await new Promise(resolve => setTimeout(resolve, attempt * 5000));
      }
    }
    throw lastError;
  }

  const script = [
    '#!/bin/sh',
    'set -eu',
    'mkdir -p "$HOME/.ssh"',
    'chmod 700 "$HOME/.ssh"',
    'touch "$HOME/.ssh/authorized_keys"',
    'AUTH="$HOME/.ssh/authorized_keys"',
    `if [ -s "$AUTH" ] && [ "$(tail -c 1 "$AUTH" | wc -l)" -eq 0 ]; then`,
    '  printf \'\\n\' >> "$AUTH"',
    'fi',
    `if ! grep -qxF "$(cat '${docRoot}/${staging}/key.pub')" "$AUTH"; then`,
    `  cat '${docRoot}/${staging}/key.pub' >> "$AUTH"`,
    'fi',
    'chmod 600 "$HOME/.ssh/authorized_keys"',
    `rm -rf -- '${remoteStaging}'`,
    '',
  ].join('\n');

  await upload('key.pub', `${key.publicKey}\n`);
  await new Promise(resolve => setTimeout(resolve, 2000));
  await upload('install.sh', script);

  const cron = JSON.parse(runCli([
    'hosting', 'cron-jobs', 'create', user,
    '--command', `/bin/sh ${remoteStaging}/install.sh`,
    '--time', '* * * * *',
  ]));
  const cronUid = cron?.uid ?? cron?.data?.uid ?? cron?.id;
  let connected = false;
  try {
    const candidate = {...project, ssh: sshSettings};
    const ssh = createSSH(candidate, {execFile: exec});
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      try {
        ssh.run('echo ok', {attempts: 1});
        connected = true;
        break;
      } catch {
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    }
    if (!connected) throw new Error('SSH did not become ready before the bootstrap timeout');
    return {
      method: 'hostinger-files-cron',
      user,
      keyPath: sshSettings.keyPath,
      cronDeleted: !cronUid || (() => {
        try {
          runCli(['hosting', 'cron-jobs', 'delete', user, String(cronUid)]);
          return true;
        } catch {
          return false;
        }
      })(),
    };
  } finally {
    if (cronUid && !connected) {
      try {
        runCli(['hosting', 'cron-jobs', 'delete', user, String(cronUid)]);
      } catch {
        // Keep the original bootstrap failure visible; do not mask it with cleanup errors.
      }
    }
  }
}

/** Prepare defaults, persist them, install the key pair, then test SSH/WP-CLI when possible. */
export async function setupProjectSsh(projectRoot, project, args = [], {
  exec = defaultSshExec,
  lookup = dns.lookup,
  discover = discoverHostingerWebsite,
  openUrl,
  home = homedir(),
  fetchImpl = globalThis.fetch,
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
  const accountKey = args.includes('--account-key') || !requestedKey;
  const selectedKeyPath = accountKey ? accountKeyPath(defaults.user, home) : keyPath;
  const key = ensureSshKey(project, selectedKeyPath, {
    exec,
    rotateKey,
    comment: accountKey ? `harness-account-${defaults.user}` : undefined,
  });
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
    let bootstrapError;
    const installKey = args.includes('--install-key') || !args.includes('--no-install-key');
    const fallbackCopy = args.includes('--copy-key') || !args.includes('--no-copy-key');
    const fallbackOpen = args.includes('--open') || !args.includes('--no-open');
    if (installKey) {
      logger('  Installing the account key through the authorized Hostinger CLI...');
      try {
        const install = await installAccountSshKey(project, sshSettings, key, {exec, fetchImpl, logger});
        const wpVersion = ssh.wp(['core', 'version']).trim();
        logger('  OK  Account SSH key installed; Hostinger bootstrap cleanup requested');
        logger('  OK  SSH connection and remote WP-CLI are ready');
        return {
          pass: true,
          connected: true,
          accountKey,
          ssh: sshSettings,
          manualKeySetup: false,
          publicKey: key.publicKey,
          installedVia: install.method,
          cronDeleted: install.cronDeleted,
          wpVersion,
          next: 'Run `node harness/cli.mjs --project . doctor` to complete project checks.',
        };
      } catch (installError) {
        bootstrapError = installError.message;
        logger(`  WARN  Automatic key bootstrap failed: ${bootstrapError}`);
      }
    }

    let copied = false;
    if (fallbackCopy) {
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
    if (fallbackOpen && openUrl) {
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
      accountKey,
      ...onboarding,
      bootstrapError,
      error: error.message,
      next: 'After saving the key, rerun `node harness/cli.mjs --project . ssh setup`.',
    };
  }
}
