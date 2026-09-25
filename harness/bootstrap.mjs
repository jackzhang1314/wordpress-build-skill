#!/usr/bin/env node
/**
 * Zero-dependency bootstrap entrypoint.
 * Fresh clones can run this before `node_modules` exists; it only uses Node
 * built-ins and the bundled Hostinger setup helper.
 */
import {execFileSync} from 'node:child_process';
import {auditEnvironment, bootstrapActions, repositoryRoot} from './lib/environment.mjs';
import {setupHostinger} from '../.agents/skills/wordpress-builder/scripts/hostinger-setup.mjs';

const args = process.argv.slice(2);
const json = args.includes('--json');
const logger = json ? () => {} : console.log;
const error = json ? () => {} : console.error;
const dryRun = args.includes('--dry-run');
const fix = args.includes('--fix') && !dryRun;
const connect = args.includes('--connect');

function execute(name, args_, timeout = 30000) {
  return execFileSync(name, args_, {
    encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], timeout, maxBuffer: 16 * 1024 * 1024,
  });
}

function print(report) {
  if (json) return;
  logger('Local harness environment');
  for (const name of report.required) logger(`  ${report.checks[name] ? 'OK ' : 'FAIL'} ${name}`);
  for (const action of report.nextSteps) logger(`  NEXT ${action}`);
  logger(`\n${report.pass ? 'OK: local harness is ready.' : 'FAIL: local harness is not ready yet.'}`);
  logger(`NEXT ${report.next}`);
}

function repair(report) {
  const actions = [];
  if (!report.checks.dependencies) {
    execute('npm', ['ci'], 180000);
    actions.push('npm-ci');
  }
  if (!report.checks.skillRuntime || !report.checks.skillIntegrity) {
    execute('npm', ['run', 'build'], 180000);
    actions.push('build-bundled-skill-runtime');
  }
  if (!report.checks.hostinger) {
    const hostinger = setupHostinger({install: true, connect: false, platform: process.platform, run: execute});
    actions.push(hostinger.installation === 'installed' ? 'install-hostinger-cli' : 'request-hostinger-cli-install');
  }
  return actions;
}

try {
  let report = auditEnvironment({repoRoot: repositoryRoot});
  report.actions = fix && !dryRun ? repair(report) : [];
  report = auditEnvironment({repoRoot: repositoryRoot});
  report.actions = args.includes('--dry-run') ? [] : report.actions;
  report.nextSteps = bootstrapActions(report, {fix});
  report.pass = report.required.every(name => report.checks[name]);
  report.next = report.pass
    ? 'Run `node harness/cli.mjs init <project-name> --root ../projects --from-starter`.'
    : 'Complete the NEXT actions above, then rerun this command.';
  print(report);
  if (json) console.log(JSON.stringify(report, null, 2));
  process.exit(report.pass ? 0 : 1);
} catch (caught) {
  error(`FAIL ${caught.message}`);
  if (process.env.HARNESS_DEBUG && caught.stack) error(caught.stack);
  process.exit(1);
}
