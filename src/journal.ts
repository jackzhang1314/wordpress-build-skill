import { mkdir, open, readFile, rename, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { hostname } from 'node:os';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { hash } from './client.js';

export async function saveJson(path: string, value: unknown): Promise<void> {
  const tmp = `${path}.${randomUUID()}.tmp`;
  const file = await open(tmp, 'wx', 0o600);
  try { await file.writeFile(JSON.stringify(value, null, 2) + '\n'); await file.sync(); }
  finally { await file.close(); }
  await rename(tmp, path);
}

export async function readJson(path: string): Promise<unknown> {
  return JSON.parse(await readFile(path, 'utf8')) as unknown;
}

function missing(error: unknown): boolean { return error instanceof Error && 'code' in error && error.code === 'ENOENT'; }

const entrySchema = z.object({
  identity: z.string(), key: z.string(), intentHash: z.string(), intent: z.unknown(),
  submittedAt: z.string(), state: z.enum(['submitted', 'responded', 'verified']),
  response: z.unknown().optional(), receipt: z.unknown().optional(),
});

export class Journal {
  readonly directory: string;
  constructor(directory: string, readonly identity: string) { this.directory = resolve(directory); }

  async initialize(): Promise<void> { await mkdir(this.directory, { recursive: true, mode: 0o700 }); }

  async lock<T>(run: () => Promise<T>): Promise<T> {
    await this.initialize();
    const path = join(this.directory, 'writer.lock');
    try { await mkdir(path); }
    catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'EEXIST') throw new Error(`Task is locked. Inspect ${path}/owner.json and the actual process before recovering a stopped writer.`, { cause: error });
      throw error;
    }
    try {
      await saveJson(join(path, 'owner.json'), { pid: process.pid, host: hostname(), startedAt: new Date().toISOString() });
      return await run();
    } finally { await rm(path, { recursive: true }); }
  }

  async load(name: string): Promise<unknown | undefined> {
    if (!/^[a-zA-Z0-9_.-]+$/.test(name)) throw new Error('Invalid evidence filename.');
    try { return await readJson(join(this.directory, name)); }
    catch (error) { if (missing(error)) return undefined; throw error; }
  }

  async save(name: string, value: unknown): Promise<void> {
    if (!/^[a-zA-Z0-9_.-]+$/.test(name)) throw new Error('Invalid evidence filename.');
    await this.initialize();
    await saveJson(join(this.directory, name), value);
  }

  /** Caller holds the task lock. Persist response before any readback; never retry an unknown write. */
  async mutate<T>(key: string, intent: unknown, schema: z.ZodType<T>, prepare: () => Promise<void>, send: () => Promise<unknown>, verify: (response: unknown) => Promise<T>): Promise<T> {
    const name = `operation-${hash([this.identity, key])}.json`;
    const stored = await this.load(name);
    let entry = stored === undefined ? undefined : entrySchema.parse(stored);
    if (entry && (entry.identity !== this.identity || entry.intentHash !== hash(intent))) throw new Error(`Operation ${key} was already bound to different input. Inspect receipts before revising the plan.`);
    if (entry?.state === 'verified') return schema.parse(entry.receipt);
    if (entry?.state === 'submitted') throw new Error(`Unknown result for ${key}; do not retry. Inspect ${join(this.directory, name)} and reconcile the remote state.`);
    if (!entry) {
      await prepare();
      entry = { identity: this.identity, key, intentHash: hash(intent), intent, submittedAt: new Date().toISOString(), state: 'submitted' };
      await this.save(name, entry);
      const response = await send();
      entry = { ...entry, state: 'responded', response };
      await this.save(name, entry);
    }
    const receipt = schema.parse(await verify(entry.response));
    await this.save(name, { ...entry, state: 'verified', receipt });
    return receipt;
  }
}
