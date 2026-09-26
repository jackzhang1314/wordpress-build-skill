import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {buildSitesStatus} from '../../harness/lib/site-status.mjs';

function writeProject(root, name, overrides = {}) {
  const projectRoot = join(root, name);
  mkdirSync(projectRoot, {recursive: true});
  writeFileSync(join(projectRoot, 'project.json'), JSON.stringify({
    title: name,
    domain: `${name}.hostingersite.com`,
    theme: `${name}-theme`,
    plugin: `${name}-model`,
    ...overrides,
  }, null, 2));
  return projectRoot;
}

function writeBackup(projectRoot, id, createdAt, domain) {
  const backupRoot = join(projectRoot, '.backups', id);
  mkdirSync(backupRoot, {recursive: true});
  writeFileSync(join(backupRoot, 'manifest.json'), JSON.stringify({id, createdAt, domain}));
}

test('sites status correlates remote sites with local project custody', () => {
  const root = mkdtempSync(join(tmpdir(), 'wordpress-site-status-'));
  try {
    const inspectedAt = '2026-09-26T10:00:00.000Z';
    const matched = writeProject(root, 'matched', {
      mode: 'external',
      sourceProfile: 'custom',
      remote: {activeTheme: 'hello-elementor', inspectedAt},
    });
    writeBackup(matched, '2026-09-26T10-10-00-000Z', '2026-09-26T10:10:00.000Z', 'matched.hostingersite.com');
    writeFileSync(join(matched, '.deploy-state.json'), JSON.stringify({
      domain: 'matched.hostingersite.com',
      deployedAt: '2026-09-26T11:00:00.000Z',
      backup: '2026-09-26T10-10-00-000Z',
    }));
    writeProject(root, 'local-only', {domain: 'local-only.hostingersite.com'});

    const report = buildSitesStatus([
      {domain: 'matched.hostingersite.com', username: 'u_test', order_id: 42, is_enabled: true, website_type: 'wordpress'},
      {domain: 'remote-only.hostingersite.com', username: 'u_test', order_id: 42, is_enabled: true, website_type: 'wordpress'},
    ], root, {now: new Date('2026-09-26T12:00:00.000Z')});

    assert.equal(report.projectsRootExists, true);
    assert.equal(report.summary.remoteCount, 2);
    assert.equal(report.summary.matchedRemoteCount, 1);
    assert.equal(report.summary.unmatchedRemoteCount, 1);
    assert.equal(report.summary.localProjectCount, 2);
    assert.equal(report.summary.localOnlyProjectCount, 1);

    const matchedSite = report.websites.find(site => site.domain === 'matched.hostingersite.com');
    assert.equal(matchedSite.matchState, 'unique');
    assert.equal(matchedSite.localProjects.length, 1);
    const project = matchedSite.localProjects[0];
    assert.equal(project.mode, 'external');
    assert.equal(project.sourceProfile, 'custom');
    assert.equal(project.activeTheme, 'hello-elementor');
    assert.equal(project.remoteInspection.state, 'fresh');
    assert.equal(project.lastBackup.id, '2026-09-26T10-10-00-000Z');
    assert.equal(project.lastDeploy.deployedAt, '2026-09-26T11:00:00.000Z');

    const unmatched = report.websites.find(site => site.domain === 'remote-only.hostingersite.com');
    assert.equal(unmatched.matchState, 'unmatched');
    assert.deepEqual(unmatched.localProjects, []);
    assert.equal(report.localOnlyProjects[0].relativePath, 'local-only');
  } finally {
    rmSync(root, {recursive: true, force: true});
  }
});

test('sites status marks duplicate projects and stale inspections explicitly', () => {
  const root = mkdtempSync(join(tmpdir(), 'wordpress-site-status-'));
  try {
    writeProject(root, 'one', {domain: 'duplicate.hostingersite.com'});
    writeProject(root, 'two', {
      domain: 'duplicate.hostingersite.com',
      remote: {inspectedAt: '2026-09-01T00:00:00.000Z'},
    });
    const report = buildSitesStatus([
      {domain: 'duplicate.hostingersite.com', username: 'u_test', order_id: 1, is_enabled: true, website_type: 'wordpress'},
    ], root, {now: new Date('2026-09-26T00:00:00.000Z')});

    const site = report.websites[0];
    assert.equal(site.matchState, 'ambiguous');
    assert.equal(site.localProjects.length, 2);
    assert.equal(site.localProjects[0].remoteInspection.state, 'unknown');
    assert.equal(site.localProjects[1].remoteInspection.state, 'stale');
    assert.equal(report.summary.ambiguousRemoteCount, 1);
  } finally {
    rmSync(root, {recursive: true, force: true});
  }
});

test('sites status reports missing and invalid local projects without guessing ownership', () => {
  const root = join(tmpdir(), `wordpress-site-status-missing-${Date.now()}`);
  let report = buildSitesStatus([], root);
  assert.equal(report.projectsRootExists, false);
  assert.deepEqual(report.websites, []);
  assert.deepEqual(report.invalidProjects, []);

  mkdirSync(root, {recursive: true});
  mkdirSync(join(root, 'broken'), {recursive: true});
  writeFileSync(join(root, 'broken', 'project.json'), '{');
  report = buildSitesStatus([], root);
  assert.equal(report.summary.invalidProjectCount, 1);
  assert.match(report.invalidProjects[0].error, /JSON|property|schema/i);
  rmSync(root, {recursive: true, force: true});
});
