import test from 'node:test';
import assert from 'node:assert/strict';
import {auditEnvironment, bootstrapActions, commandRequirements, repositoryRoot} from '../../harness/lib/environment.mjs';

function readyRun(name, args) {
  if (process.execPath === name && args.at(-1) === '--help') {
    return JSON.stringify({ok: true, result: {commands: ['doctor']}});
  }
  return `${name} ready`;
}

test('environment audit checks bundled skill integrity without WordPress credentials', () => {
  const report = auditEnvironment({
    repoRoot: repositoryRoot,
    run: readyRun,
    exists: path => path.endsWith('node_modules/.package-lock.json') || path.endsWith('scripts/wp.mjs'),
    nodeVersion: '22.11.0',
  });
  assert.equal(report.pass, true);
  assert.equal(report.checks.node, true);
  assert.equal(report.checks.dependencies, true);
  assert.equal(report.checks.skillRuntime, true);
  assert.equal(report.checks.skillIntegrity, true);
  assert.deepEqual(report.reasons, []);
});

test('environment audit reports actionable missing requirements without marking optional tools fatal', () => {
  const report = auditEnvironment({
    repoRoot: repositoryRoot,
    run: (name, args) => {
      if (process.execPath === name && args.at(-1) === '--help') return JSON.stringify({ok: true, result: {commands: []}});
      if (name === 'rsync' || name === 'php' || name === 'docker') throw new Error('missing');
      return `${name} ready`;
    },
    exists: path => !path.endsWith('node_modules/.package-lock.json') && path.endsWith('scripts/wp.mjs'),
    nodeVersion: '22.0.0',
  });
  assert.equal(report.pass, false);
  assert.equal(report.checks.rsync, false);
  assert.equal(report.checks.php, false);
  assert.equal(report.checks.hostinger, true);
  assert.ok(report.reasons.includes('rsync is required'));
  const actions = bootstrapActions(report, {fix: true});
  assert.ok(actions.some(item => item.includes('Install rsync')));
  assert.ok(actions.some(item => item.includes('Install PHP 8.3 or Docker')));
});

test('command requirements never use unattended curl install scripts', () => {
  for (const requirement of commandRequirements) {
    assert.equal(requirement.required, true);
    assert.match(requirement.why, /\S/);
  }
});
