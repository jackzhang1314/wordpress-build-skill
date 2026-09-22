import {chmodSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
import {dirname, join, relative, resolve} from 'node:path';

function jsonOutput(execFile, args, options = {}) {
  return JSON.parse(execFile('hostinger', [...args, '--format', 'json'], {
    encoding: 'utf8',
    timeout: 60000,
    maxBuffer: 16 * 1024 * 1024,
    stdio: ['pipe', 'pipe', 'pipe'],
    ...options,
  }));
}

function sleepSync(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

export function normalizeDomain(value) {
  const domain = String(value || '').trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/.test(domain) || domain.includes('..')) {
    throw new Error(`Invalid Hostinger domain: ${value}`);
  }
  return domain;
}

export function commandValue(args, name, fallback = undefined) {
  const index = args.indexOf(name);
  return index >= 0 && index + 1 < args.length ? args[index + 1] : fallback;
}

function persistDomain(projectRoot, domain) {
  const path = join(projectRoot, 'project.json');
  const raw = JSON.parse(readFileSync(path, 'utf8'));
  if (raw.domain === domain) return;
  raw.domain = domain;
  writeFileSync(path, JSON.stringify(raw, null, 2) + '\n');
}

export function updateProvisionedProject(projectRoot, {
  domain,
  hostingerUser,
  order,
  sshHost,
  sshPort,
  sshUser,
  sshKeyPath,
} = {}) {
  const root = resolve(projectRoot);
  const path = join(root, 'project.json');
  const raw = JSON.parse(readFileSync(path, 'utf8'));
  raw.domain = normalizeDomain(domain);
  raw.hostinger = {...raw.hostinger, user: hostingerUser};
  if (order) raw.hostinger.order = Number(order);
  const wpPath = `/home/${hostingerUser}/domains/${raw.domain}/public_html`;
  raw.ssh = {
    ...(raw.ssh || {}),
    host: sshHost || raw.ssh?.host || '',
    port: sshPort || raw.ssh?.port || '22',
    user: sshUser || raw.ssh?.user || hostingerUser,
    keyPath: sshKeyPath || raw.ssh?.keyPath || '',
    wpPath,
  };
  writeFileSync(path, JSON.stringify(raw, null, 2) + '\n');
  return raw;
}

export async function provisionHostinger(projectRoot, project, args = [], {
  execFile,
  logger = () => {},
  attempts = 36,
  intervalMs = 5000,
} = {}) {
  if (!project.hostinger?.order && commandValue(args, '--order') === undefined) {
    throw new Error('Hostinger provisioning requires project.hostinger.order or --order <id>');
  }
  const order = Number(commandValue(args, '--order') ?? project.hostinger.order);
  let domain = commandValue(args, '--domain') || project.domain;
  if (!domain) {
    domain = jsonOutput(execFile, ['hosting', 'domains', 'generate-free-subdomain']).domain;
    logger(`  OK  generated free subdomain: ${domain}`);
  }
  domain = normalizeDomain(domain);
  // Persist before any remote mutation so a mid-provision failure leaves the target on disk.
  persistDomain(projectRoot, domain);

  const listWebsites = () => jsonOutput(execFile, ['hosting', 'websites', 'list']).data ?? [];
  let website = listWebsites().find(item => item.domain === domain);
  if (!website) {
    const createArgs = ['hosting', 'websites', 'create', '--order-id', String(order), '--domain', domain];
    const datacenter = commandValue(args, '--datacenter');
    if (datacenter) createArgs.push('--datacenter-code', datacenter);
    jsonOutput(execFile, createArgs);
    logger(`  OK  website creation accepted for ${domain}`);
  }

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    website = listWebsites().find(item => item.domain === domain);
    if (website) break;
    if (attempt === attempts) throw new Error(`Timed out waiting for Hostinger website ${domain}`);
    sleepSync(intervalMs);
  }
  logger(`  OK  website available (user ${website.username})`);

  const hostingerUser = website.username || project.hostinger?.user;
  if (!hostingerUser) throw new Error('Hostinger did not return the hosting username');
  const installations = () => jsonOutput(execFile, [
    'wordpress', 'installations', 'list', hostingerUser, '--domain', domain,
  ]);
  let installationsList = installations();
  let credentialsPath = '';
  if (!installationsList.some(item => item.domain === domain)) {
    const adminUser = commandValue(args, '--admin-user') || project.hostinger?.adminUser || 'codexadmin';
    const adminEmail = commandValue(args, '--admin-email') || project.hostinger?.adminEmail || `admin@${domain}`;
    const password = process.env.WP_ADMIN_PASSWORD || randomBytes(21).toString('base64url');
    const credentials = {login: adminUser, password, email: adminEmail};
    jsonOutput(execFile, [
      'wordpress', 'installations', 'install', hostingerUser,
      '--domain', domain,
      '--site-title', project.title,
      '--language', 'en_US',
      '--auto-updates', 'minor',
      '--credentials', JSON.stringify(credentials),
    ]);
    logger('  OK  WordPress installation accepted');

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      installationsList = installations();
      if (installationsList.some(item => item.domain === domain && item.is_valid)) break;
      if (attempt === attempts) throw new Error(`Timed out waiting for WordPress installation ${domain}`);
      sleepSync(intervalMs);
    }
    credentialsPath = join(projectRoot, '.wordpress-builder', `hostinger-${domain}`, 'wordpress.json');
    mkdirSync(dirname(credentialsPath), {recursive: true});
    writeFileSync(credentialsPath, JSON.stringify(credentials, null, 2));
    chmodSync(credentialsPath, 0o600);
    logger(`  OK  WordPress ready; admin credentials stored privately (${relative(projectRoot, credentialsPath)})`);
  } else {
    logger('  OK  WordPress installation already exists');
  }

  updateProvisionedProject(projectRoot, {
    domain,
    hostingerUser,
    order,
    sshHost: commandValue(args, '--ssh-host'),
    sshPort: commandValue(args, '--ssh-port'),
    sshUser: commandValue(args, '--ssh-user'),
    sshKeyPath: commandValue(args, '--ssh-key'),
  });
  logger('  OK  project.json updated');
  return {domain, hostingerUser, credentialsPath, website};
}
