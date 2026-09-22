import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, realpath, stat } from 'node:fs/promises';
import { resolve, relative, isAbsolute } from 'node:path';
import { z } from 'zod';
import { hash } from './client.js';
import { Journal, readJson } from './journal.js';
import { createHash } from 'node:crypto';

const digest = z.string().regex(/^[a-f0-9]{64}$/);
const registrySchema = z.object({
  schemaVersion: z.literal(1), scope: z.literal('new-site'),
  source: z.object({ repository: z.string().url(), commit: z.string().regex(/^[a-f0-9]{40}$/), license: z.string() }),
  modules: z.array(z.object({ id: z.string(), entry: z.string(), requires: z.array(z.string()), status: z.string() })),
  files: z.array(z.object({ path: z.string(), sha256: digest })),
});

async function contained(root: string, path: string): Promise<string> {
  const base = await realpath(root);
  const target = await realpath(resolve(base, path));
  const rel = relative(base, target);
  if (rel === '..' || rel.startsWith('../') || isAbsolute(rel)) throw new Error('Path escapes the declared root.');
  return target;
}

export async function capabilities(root: string) {
  const registry = registrySchema.parse(await readJson(resolve(root, 'capabilities.json')));
  for (const file of registry.files) {
    const bytes = await readFile(await contained(root, file.path));
    if (createHash('sha256').update(bytes).digest('hex') !== file.sha256) throw new Error(`Upstream module changed: ${file.path}`);
  }
  for (const module of registry.modules) {
    if (!registry.files.some(file => file.path === module.entry)) throw new Error(`Untracked module entry: ${module.id}`);
  }
  return { ...registry, integrity: 'verified', runtimeAvailability: 'not-probed', registryHash: hash(registry) };
}

export const projectSchema = z.object({
  schemaVersion: z.literal(1), scope: z.literal('new-site'),
  name: z.string().min(1), sourceRoot: z.string().min(1),
  theme: z.enum(['php-hybrid', 'block']),
  environment: z.enum(['playground', 'wp-env', 'managed-host']),
  targets: z.object({ wordpress: z.string().regex(/^\d+\.\d+(?:\.\d+)?$/), php: z.string().regex(/^\d+\.\d+(?:\.\d+)?$/), acf: z.enum(['free', 'pro']) }).strict(),
  brief: z.string().min(1),
}).strict();
const contractSchema = z.object({ project: projectSchema, projectHash: digest, registryHash: digest });
const stages = ['discover', 'model', 'theme', 'content', 'verify', 'release'] as const;
const stageSchema = z.enum(stages);
export const receiptSchema = z.object({
  projectHash: digest, stage: stageSchema,
  outcome: z.enum(['verified', 'failed']),
  summary: z.string().min(10),
  checks: z.array(z.object({ name: z.string().min(1), status: z.enum(['pass', 'fail', 'not-tested']) }).strict()).min(1),
  evidence: z.array(z.string().min(1)).min(1),
}).strict();
const savedReceiptSchema = receiptSchema.extend({
  recordedAt: z.string(), files: z.array(z.object({ path: z.string(), sha256: digest })),
});

export async function initializeProject(root: string, directory: string, input: unknown) {
  const registry = await capabilities(root);
  const parsed = projectSchema.parse(input);
  const project = { ...parsed, sourceRoot: await realpath(parsed.sourceRoot) };
  if (!(await stat(project.sourceRoot)).isDirectory()) throw new Error('sourceRoot must be a directory.');
  const contract = { project, projectHash: hash(project), registryHash: registry.registryHash };
  const journal = new Journal(directory, contract.projectHash);
  await journal.lock(async () => {
    const existing = await journal.load('project.json');
    if (existing && hash(existing) !== hash(contract)) throw new Error('Project contract already exists with different inputs. Preserve this task; initialize a separate project directory.');
    await journal.save('project.json', contract);
  });
  return { ...contract, stages, note: 'Local project contract only. Does not provision WordPress, prove a clean remote site, or grant publication permission.' };
}

export async function projectStatus(directory: string) {
  const contract = contractSchema.parse(await readJson(resolve(directory, 'project.json')));
  if (hash(contract.project) !== contract.projectHash) throw new Error('Project contract changed outside initialization.');
  const journal = new Journal(directory, contract.projectHash);
  const progress = [];
  let dependenciesVerified = true;
  for (const stage of stages) {
    const raw = await journal.load(`stage-${stage}.json`);
    let state = 'pending';
    if (raw) {
      const receipt = savedReceiptSchema.parse(raw);
      let intact = receipt.projectHash === contract.projectHash && receipt.stage === stage && receipt.files.length > 0;
      if (receipt.outcome === 'verified' && receipt.checks.some(check => check.status !== 'pass')) intact = false;
      for (const file of receipt.files) {
        try { intact &&= createHash('sha256').update(await readFile(await contained(directory, file.path))).digest('hex') === file.sha256; }
        catch { intact = false; }
      }
      state = !intact ? 'stale' : receipt.outcome === 'failed' ? 'failed' : dependenciesVerified ? 'recorded-verified' : 'blocked-by-predecessor';
    }
    dependenciesVerified &&= state === 'recorded-verified';
    progress.push({ stage, state });
  }
  return { ...contract, progress, next: progress.find(item => item.state !== 'recorded-verified')?.stage ?? null, note: 'Evidence-backed declarations; not a live remote audit or automatic publication.' };
}

export async function recordStage(directory: string, input: unknown) {
  const receipt = receiptSchema.parse(input);
  const journal = new Journal(directory, receipt.projectHash);
  return journal.lock(async () => {
    const status = await projectStatus(directory);
    if (receipt.projectHash !== status.projectHash) throw new Error('Receipt belongs to another project.');
    const previous = status.progress.slice(0, stages.indexOf(receipt.stage));
    if (receipt.outcome === 'verified' && (receipt.checks.some(check => check.status !== 'pass') || previous.some(item => item.state !== 'recorded-verified'))) throw new Error('Verified stages require passing checks and verified predecessors.');
    // Do not retroactively change a prerequisite while retaining later completion claims.
    const later = status.progress.slice(stages.indexOf(receipt.stage) + 1);
    if (later.some(item => item.state !== 'pending')) throw new Error('Later receipts already exist. Preserve this run and start a new iteration task.');
    const files = [];
    for (const path of receipt.evidence) {
      const target = await contained(directory, path);
      files.push({ path: relative(await realpath(directory), target), sha256: createHash('sha256').update(await readFile(target)).digest('hex') });
    }
    const saved = { ...receipt, recordedAt: new Date().toISOString(), files };
    await journal.save(`stage-${receipt.stage}.json`, saved);
    return saved;
  });
}

export async function inspectProject(root: string, directory: string) {
  const registry = await capabilities(root);
  const status = await projectStatus(directory);
  if (registry.registryHash !== status.registryHash) throw new Error('Module set differs from the initialized project.');
  const script = await contained(root, 'vendor/wordpress/skills/wp-project-triage/scripts/detect_wp_project.mjs');
  const { stdout } = await promisify(execFile)(process.execPath, [script], { cwd: status.project.sourceRoot, timeout: 30000, maxBuffer: 4 * 1024 * 1024 });
  const report = z.object({ project: z.object({ kind: z.unknown() }), signals: z.unknown(), tooling: z.unknown() }).passthrough().parse(JSON.parse(stdout));
  const journal = new Journal(directory, status.projectHash);
  await journal.lock(async () => {
    if (await journal.load('stage-discover.json')) throw new Error('Discovery already recorded; preserve its evidence and start a new iteration to inspect again.');
    await journal.save('triage.json', report);
  });
  return { report, evidence: resolve(directory, 'triage.json'), source: registry.source, note: 'Official local triage executed. Verify remote identity, cleanliness and actual versions separately before recording discovery complete.' };
}
