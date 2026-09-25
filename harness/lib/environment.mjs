import {execFileSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {commandExists} from './process.mjs';

const moduleDirectory = dirname(fileURLToPath(import.meta.url));
export const repositoryRoot = resolve(moduleDirectory, '../..');

/** Classify commands as required for remote work or useful/recommended only. */
export const commandRequirements = [
  {name: 'git', args: ['--version'], required: true, why: 'reads repository state and creates isolated project history'},
  {name: 'rsync', args: ['--version'], required: true, why: 'syncs theme and plugin files to Hostinger'},
  {name: 'tar', args: ['--version'], required: true, why: 'creates safe deployment and backup archives'},
  {name: 'gzip', args: ['--version'], required: true, why: 'compresses database backups'},
];

export const optionalCommands = [
  {name: 'php', args: ['-v'], required: false, why: 'runs PHP syntax checks locally; Docker can provide this when absent'},
  {name: 'docker', args: ['--version'], required: false, why: 'provides PHP/WordPress tooling when local PHP is absent'},
  {name: 'hostinger', args: ['version'], required: false, why: 'provisions and inspects Hostinger websites'},
];

/**
 * Audit the repository host. This intentionally does not require WordPress
 * credentials: “Skill integrity” means the bundled runtime is built and can
 * describe itself, not that a WordPress site is already connected.
 */
export function auditEnvironment({
  repoRoot = repositoryRoot,
  run = execFileSync,
  exists = existsSync,
  nodeVersion = process.versions.node,
  dependenciesDirectory = join(repoRoot, 'node_modules'),
} = {}) {
  const probe = (name, args) => {
    try {
      const value = run(name, args, {encoding: 'utf8', timeout: 5000, maxBuffer: 1024 * 1024, stdio: ['pipe', 'pipe', 'pipe']});
      return {available: true, detail: String(value).trim().split('\n')[0]};
    } catch (error) {
      return {available: false, detail: error?.message ?? 'not available'};
    }
  };

  const checks = {};
  checks.node = Number(String(nodeVersion).split('.')[0]) >= 22;
  checks.npm = probe('npm', ['--version']).available;
  for (const requirement of commandRequirements) {
    checks[requirement.name] = probe(requirement.name, requirement.args).available;
  }
  checks.dependencies = exists(join(dependenciesDirectory, '.package-lock.json'));

  const skillRuntime = join(repoRoot, '.agents/skills/wordpress-builder/scripts/wp.mjs');
  checks.skillRuntime = exists(skillRuntime);
  checks.skillIntegrity = false;
  if (checks.skillRuntime) {
    try {
      const raw = run(process.execPath, [skillRuntime, '--help'], {
        encoding: 'utf8', timeout: 15000, maxBuffer: 8 * 1024 * 1024, stdio: ['pipe', 'pipe', 'pipe'],
      });
      const payload = JSON.parse(raw);
      checks.skillIntegrity = payload?.ok === true && Array.isArray(payload?.result?.commands);
    } catch {
      checks.skillIntegrity = false;
    }
  }

  for (const requirement of optionalCommands) {
    checks[requirement.name] = probe(requirement.name, requirement.args).available;
  }
  checks.chrome = commandExists(run, 'google-chrome', ['--version'])
    || commandExists(run, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--version']);

  const required = [
    'node', 'npm', ...commandRequirements.filter(item => item.required).map(item => item.name),
    'dependencies', 'skillRuntime', 'skillIntegrity',
  ];
  const pass = required.every(name => checks[name]);
  return {
    repoRoot,
    pass,
    required,
    checks,
    reasons: [
      ...required.filter(name => !checks[name]).map(name => `${name} is required`),
    ],
    next: pass
      ? 'WordPress Builder is ready. Starter is optional; create a project, then run `ssh setup` and `hostinger setup` for deployment.'
      : 'Run the displayed repair actions, or rerun bootstrap with --fix where repair is supported.',
  };
}

/** Human-readable repair/next actions for CLI users. */
export function bootstrapActions(report, {fix = false} = {}) {
  const actions = [];
  if (!report.checks.node) {
    actions.push('Install Node.js 22+ from an official package, reopen the terminal, and rerun this command.');
  }
  if (!report.checks.npm) {
    actions.push('Install npm with Node.js 22+ (npm is included in the official Node.js release).');
  }
  for (const requirement of commandRequirements) {
    if (!report.checks[requirement.name]) {
      actions.push(`Install ${requirement.name} using your operating system package manager. ${requirement.why}.`);
    }
  }
  if (!report.checks.dependencies) {
    actions.push(fix ? 'Run `npm ci` now.' : 'Run `npm ci`, or rerun bootstrap with --fix.');
  }
  if (!report.checks.skillRuntime || !report.checks.skillIntegrity) {
    actions.push(fix ? 'Run `npm run build` now.' : 'Run `npm run build`, or rerun bootstrap with --fix.');
  }
  if (!report.checks.hostinger) {
    actions.push(fix ? 'Run `node wordpress-builder.mjs hostinger setup --install` now.' : 'Install the Hostinger CLI, or run `node wordpress-builder.mjs hostinger setup --install --connect`.');
  }
  if (!report.checks.php && !report.checks.docker) {
    actions.push('Install PHP 8.3 or Docker Desktop/Engine for local PHP syntax checks.');
  }
  if (!report.checks.chrome) {
    actions.push('Install Google Chrome (or set CHROME_BIN) if you want screenshot verification.');
  }
  return actions;
}
