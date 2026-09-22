import {execFileSync} from 'node:child_process';

export function sleepSync(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

export function isTransientError(error) {
  const code = error?.code ?? error?.errno;
  return ['ETIMEDOUT', 'ECONNRESET', 'EPIPE', 'EAI_AGAIN'].includes(code)
    || error?.status === 20
    || error?.status === 255;
}

export function runWithRetry(execFile, file, args = [], options = {}, policy = {}) {
  const attempts = Math.max(1, policy.attempts ?? 3);
  const delayMs = policy.delayMs ?? 3000;
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return execFile(file, args, {...options});
    } catch (error) {
      lastError = error;
      const message = String(error?.message ?? '');
      const transient = isTransientError(error) || /Killed by signal|Connection closed|Connection timed out/i.test(message);
      if (attempt === attempts || !transient) break;
      if (policy.onRetry) policy.onRetry(attempt, error);
      sleepSync(delayMs * attempt);
    }
  }
  throw lastError;
}

export function commandExists(runner, command, args = ['--version'], options = {}) {
  try {
    runner(command, args, {encoding: 'utf8', timeout: options.timeout ?? 5000, stdio: ['pipe', 'pipe', 'pipe']});
    return true;
  } catch {
    return false;
  }
}

export function run(file, args = [], options = {}) {
  return runWithRetry(execFileSync, file, args, {
    encoding: 'utf8',
    timeout: 180000,
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['pipe', 'pipe', 'pipe'],
    ...options,
  });
}
