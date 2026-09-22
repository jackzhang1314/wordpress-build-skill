import {runWithRetry} from './process.mjs';

const SSH_OPTIONS = [
  '-o', 'ConnectTimeout=15',
  '-o', 'ServerAliveInterval=15',
  '-o', 'ServerAliveCountMax=3',
  '-o', 'StrictHostKeyChecking=accept-new',
];

export function shellQuote(value) {
  if (/^[A-Za-z0-9_@%+=:,./-]+$/.test(value)) return value;
  return `'${String(value).replaceAll("'", `'\\''`)}'`;
}

export function createSSH(config, {execFile} = {}) {
  const baseArgs = ['-p', config.ssh.port, '-i', config.ssh.keyPath, ...SSH_OPTIONS, `${config.ssh.user}@${config.ssh.host}`];
  const run = (remoteCommand, options = {}) => {
    const policy = {attempts: options.attempts ?? 3, delayMs: options.delayMs ?? 3000, onRetry: options.onRetry};
    return runWithRetry(execFile, 'ssh', [...baseArgs, remoteCommand], {
      encoding: 'utf8',
      timeout: 180000,
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['pipe', 'pipe', 'pipe'],
      ...options,
    }, policy);
  };
  const wp = (args, options = {}) => {
    const list = Array.isArray(args) ? args.map(shellQuote).join(' ') : args;
    return run(`wp --path=${shellQuote(config.ssh.wpPath)} ${list}`, options);
  };
  const rsync = (localPath, remotePath, options = {}) => runWithRetry(execFile, 'rsync', [
    '-az', options.delete ? '--delete' : '', '-e', `ssh -p ${config.ssh.port} -i ${config.ssh.keyPath} ${SSH_OPTIONS.join(' ')}`,
    `${localPath.replace(/\/$/, '')}/`, `${config.ssh.user}@${config.ssh.host}:${remotePath}`,
  ].filter(Boolean), {
    encoding: 'utf8',
    timeout: options.timeout ?? 300000,
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['pipe', 'pipe', 'pipe'],
  }, {attempts: options.attempts ?? 3, delayMs: options.delayMs ?? 3000, onRetry: options.onRetry});
  return {config, baseArgs, run, wp, rsync};
}
