import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { z } from 'zod';
import { hash, type WordPressClient } from './client.js';
import { pageStateSchema, readPage, type Page } from './pages.js';
import { type Journal, readJson } from './journal.js';
import { type SitePlan } from './build-site.js';

const digest = z.string().regex(/^[a-f0-9]{64}$/);
const check = z.object({ status: z.enum(['pass', 'not-applicable']), evidence: z.string().min(10) }).strict();
export const releaseSchema = z.object({
  identity: digest, planHash: digest, reviewedAt: z.iso.datetime({ offset: true }),
  environment: z.object({ wordpress: z.string().min(1), php: z.string().min(1), theme: z.string().min(1) }).strict(),
  checks: z.object({ navigation: check.extend({status:z.literal('pass')}), primaryLinks: check.extend({status:z.literal('pass')}), forms: check, editing: check.extend({status:z.literal('pass')}), responsive: check.extend({status:z.literal('pass')}), visual: check.extend({status:z.literal('pass')}), recovery: check.extend({status:z.literal('pass')}) }).strict(),
  files: z.array(z.object({ path: z.string().min(1), sha256: digest }).strict()).min(1),
  pages: z.array(z.object({ id: z.number().int().positive(), fingerprint: digest }).strict()).min(1),
}).strict();
// Publication status, modified time and homepage permalink can change during a resumed release.
export function releasePageFingerprint(page: Page): string {
  return hash({ id: page.id, slug: page.slug, title: page.title.raw, content: page.content.raw, template: page.template, parent: page.parent, featuredMedia: page.featured_media });
}
export async function verifyReleaseFiles(file: string): Promise<z.infer<typeof releaseSchema>> {
  const evidence = releaseSchema.parse(await readJson(file));
  for (const item of evidence.files) {
    const bytes = await readFile(resolve(dirname(file), item.path));
    if (createHash('sha256').update(bytes).digest('hex') !== item.sha256) throw new Error(`Release evidence changed: ${item.path}`);
  }
  return evidence;
}
export async function verifyPublication(client: WordPressClient, journal: Journal, plan: SitePlan, file: string): Promise<void> {
  const evidence = await verifyReleaseFiles(file);
  if (evidence.identity !== client.identity || evidence.planHash !== hash(plan)) throw new Error('Release evidence belongs to another connection or plan.');
  const ids = new Set<number>();
  for (const entry of plan.pages) {
    const state = pageStateSchema.parse(await journal.load(`page-${entry.key}.json`));
    if (!state.linked) throw new Error('Build and review linked drafts before publication.');
    const id = state.initial.id;
    ids.add(id);
    const proof = evidence.pages.filter(page => page.id === id);
    if (proof.length !== 1 || proof[0]?.fingerprint !== releasePageFingerprint(await readPage(client, id))) throw new Error(`Release page evidence is missing or stale: ${id}`);
  }
  if (evidence.pages.length !== ids.size) throw new Error('Release page set does not match the task.');
  await journal.save('release-verified.json', { ...evidence, verifiedAt: new Date().toISOString() });
}
