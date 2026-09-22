import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, cp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { capabilities, initializeProject, inspectProject, projectStatus, recordStage } from '../src/orchestration.js';

const skill = resolve('.agents/skills/wordpress-builder');
async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'wp-orchestration-'));
  const source = join(root, 'site'); const task = join(root, 'task');
  await mkdir(source);
  await writeFile(join(source, 'style.css'), '/*\nTheme Name: New Site Test\n*/');
  await writeFile(join(source, 'index.php'), '<?php get_header(); ?>');
  const input = { schemaVersion: 1, scope: 'new-site', name: 'Fresh site', sourceRoot: source, theme: 'php-hybrid', environment: 'playground', targets: { wordpress: '7.1', php: '8.3', acf: 'free' }, brief: 'A new product catalogue with enquiry form.' };
  return { root, task, input };
}

test('new-site contract resumes unchanged and rejects old-site scope or silent rebinding', async () => {
  const f = await fixture();
  try {
    const first = await initializeProject(skill, f.task, f.input);
    assert.equal((await initializeProject(skill, f.task, f.input)).projectHash, first.projectHash);
    await assert.rejects(initializeProject(skill, f.task, { ...f.input, scope: 'legacy-site' }));
    await assert.rejects(initializeProject(skill, f.task, { ...f.input, theme: 'block' }), /already exists/);
    assert.equal((await projectStatus(f.task)).next, 'discover');
  } finally { await rm(f.root, { recursive: true, force: true }); }
});

test('official module executes against a fresh theme and preserves evidence', async () => {
  const f = await fixture();
  try {
    await initializeProject(skill, f.task, f.input);
    const result = await inspectProject(skill, f.task);
    assert.match(JSON.stringify(result.report.project.kind), /theme/);
    assert.equal(result.source.commit, 'd87ee6916e740c7960b6959220c0481a41b320c7');
    assert.equal((await projectStatus(f.task)).next, 'discover', 'Local triage alone does not prove remote readiness.');
  } finally { await rm(f.root, { recursive: true, force: true }); }
});

test('handoffs require passing prerequisites, isolate evidence and detect later evidence drift', async () => {
  const f = await fixture();
  try {
    const p = await initializeProject(skill, f.task, f.input);
    await writeFile(join(f.task, 'check.txt'), 'actual verification output');
    const receipt = { projectHash: p.projectHash, stage: 'discover', outcome: 'verified', summary: 'Checked the fresh site and runtime.', checks: [{ name: 'environment', status: 'pass' }], evidence: ['check.txt'] };
    await assert.rejects(recordStage(f.task, { ...receipt, stage: 'theme' }), /predecessors/);
    await assert.rejects(recordStage(f.task, { ...receipt, checks: [{ name: 'environment', status: 'not-tested' }] }), /passing checks/);
    await writeFile(join(f.root, 'outside.txt'), 'outside');
    await assert.rejects(recordStage(f.task, { ...receipt, evidence: ['../outside.txt'] }), /escapes/);
    await recordStage(f.task, receipt);
    await recordStage(f.task, { ...receipt, stage: 'model' });
    await assert.rejects(recordStage(f.task, receipt), /Later receipts/);
    await writeFile(join(f.task, 'check.txt'), 'changed output');
    const status = await projectStatus(f.task);
    assert.equal(status.next, 'discover');
    assert.equal(status.progress[0]?.state, 'stale');
  } finally { await rm(f.root, { recursive: true, force: true }); }
});

test('edited upstream scripts are rejected before execution', async () => {
  const f = await fixture();
  try {
    const copy = join(f.root, 'skill'); await cp(skill, copy, { recursive: true });
    await writeFile(join(copy, 'vendor/wordpress/skills/wp-project-triage/scripts/detect_wp_project.mjs'), 'throw new Error("do not execute")');
    await assert.rejects(capabilities(copy), /Upstream module changed/);
  } finally { await rm(f.root, { recursive: true, force: true }); }
});
