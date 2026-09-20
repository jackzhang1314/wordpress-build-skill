import { verifyPublication, releasePageFingerprint } from './release.js';
import { parseArgs } from 'node:util';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { capabilities, initializeProject, inspectProject, projectStatus, recordStage } from './orchestration.js';
import { z } from 'zod';
import { WordPressClient } from './client.js';
import { Journal, readJson } from './journal.js';
import { buildSite, sitePlanSchema } from './build-site.js';
import { pageVersion, readPage } from './pages.js';
import { applyNavigation, navigationInput, planNavigation } from './navigation.js';
import { applyPageEdit, editInput, planPageEdit } from './edit-page.js';
import { mediaInput, uploadMedia } from './media.js';
import { contentType, contentVersion, discoverContentModel, readContent } from './content-model.js';
import { applyContent, contentInput, planContent } from './content.js';
import { applyImport, importInput, planImport } from './import-content.js';
import { applySingleTemplate, planSingleTemplate, readTemplate, singleTemplateInput, templateVersion } from './templates.js';

async function main(): Promise<unknown> {
  const args = parseArgs({ allowPositionals: true, strict: true, options: { plan: { type: 'string' }, evidence: { type: 'string' }, task: { type: 'string', default: '.wordpress-builder' }, id: { type: 'string' }, type: { type: 'string' }, publish: { type: 'boolean', default: false }, help: { type: 'boolean' } } });
  const command = args.positionals[0];
  if (args.values.help || !command) return {
    commands: ['capabilities', 'project-init --plan FILE', 'project-inspect', 'project-status', 'project-record --plan FILE', 'doctor', 'read-page --id ID', 'build --plan FILE [--publish --evidence FILE]', 'status', 'template-parts', 'navigation-plan --plan FILE', 'navigation-apply --id PLAN_HASH', 'page-edit-plan --plan FILE', 'page-edit-apply --id PLAN_HASH', 'upload-media --plan FILE', 'content-type --type TYPE', 'read-content --type TYPE --id ID', 'content-plan --plan FILE', 'content-apply --id PLAN_HASH', 'import-plan --plan FILE', 'import-apply --id PLAN_HASH', 'templates', 'read-template --id THEME//SLUG', 'single-template-plan --plan FILE', 'single-template-apply --id PLAN_HASH'],
    task: 'Pass --task DIRECTORY to keep each site task isolated. All output is JSON.',
    connection: 'WP_URL, WP_USERNAME, WP_APP_PASSWORD; optional WP_REST_URL. WP_ALLOW_LOCAL_HTTP=1 only for loopback labs.',
    publish: 'Use --publish only within the user-authorized scope, after actual draft preview. Includes setting title, description and homepage.',
  };
  const adjacent = fileURLToPath(new URL('../', import.meta.url));
  const skillRoot = existsSync(resolve(adjacent, 'capabilities.json')) ? adjacent : resolve(adjacent, '.agents/skills/wordpress-builder');
  if (command === 'capabilities') return capabilities(skillRoot);
  if (command === 'project-init') return initializeProject(skillRoot, resolve(args.values.task), await readJson(z.string().min(1).parse(args.values.plan)));
  if (command === 'project-status') return projectStatus(resolve(args.values.task));
  if (command === 'project-inspect') return inspectProject(skillRoot, resolve(args.values.task));
  if (command === 'project-record') return recordStage(resolve(args.values.task), await readJson(z.string().min(1).parse(args.values.plan)));
  const client = WordPressClient.fromEnv();
  const journal = new Journal(resolve(args.values.task), client.identity);
  switch (command) {
    case 'doctor': { const profile = await client.discover(); await journal.save('profile.json', profile); return { ...profile, evidenceDirectory: journal.directory }; }
    case 'read-page': { const page = await readPage(client, z.coerce.number().int().positive().parse(args.values.id)); await journal.save(`read-page-${page.id}.json`, page); return { ...page, version: pageVersion(page), releaseFingerprint: releasePageFingerprint(page), rawComplete: true }; }
    case 'build': {
      const plan = sitePlanSchema.parse(await readJson(z.string().min(1).parse(args.values.plan)));
      if (args.values.publish) {
        if (!args.values.evidence) throw new Error('Publication requires --evidence FILE with reviewed, version-bound checks. Build drafts first.');
        await verifyPublication(client, journal, plan, resolve(args.values.evidence));
      }
      return buildSite(client, journal, plan, args.values.publish ? 'publish' : 'draft');
    }
    case 'status': return { progress: await journal.load('progress.json'), task: await journal.load('task.json'), note: 'Saved state; use read-page for current remote evidence.' };
    case 'template-parts': { const data = await client.request('/wp/v2/template-parts?context=edit&per_page=100'); await journal.save('template-parts.json', data); return data; }
    case 'navigation-plan': return planNavigation(client, journal, navigationInput.parse(await readJson(z.string().min(1).parse(args.values.plan))));
    case 'navigation-apply': return applyNavigation(client, journal, z.string().parse(args.values.id));
    case 'page-edit-plan': return planPageEdit(client, journal, editInput.parse(await readJson(z.string().min(1).parse(args.values.plan))));
    case 'page-edit-apply': return applyPageEdit(client, journal, z.string().parse(args.values.id));
    case 'upload-media': return uploadMedia(client, journal, mediaInput.parse(await readJson(z.string().min(1).parse(args.values.plan))));
    case 'content-type': { const model = await discoverContentModel(client, contentType.parse(args.values.type)); await journal.save(`model-${model.type}.json`, model); return model; }
    case 'read-content': { const model = await discoverContentModel(client, contentType.parse(args.values.type)); const record = await readContent(client, model, z.coerce.number().int().positive().parse(args.values.id)); await journal.save(`read-content-${record.id}.json`, record); return { ...record, version: contentVersion(record), rawComplete: true }; }
    case 'content-plan': return planContent(client, journal, contentInput.parse(await readJson(z.string().min(1).parse(args.values.plan))));
    case 'content-apply': return applyContent(client, journal, z.string().parse(args.values.id));
    case 'import-plan': return planImport(client, journal, importInput.parse(await readJson(z.string().min(1).parse(args.values.plan))));
    case 'import-apply': return applyImport(client, journal, z.string().parse(args.values.id));
    case 'templates': { const result = await client.request('/wp/v2/templates?context=edit'); await journal.save('templates.json', result); return result; }
    case 'read-template': { const result = await readTemplate(client, z.string().parse(args.values.id)); return { ...result, version: templateVersion(result) }; }
    case 'single-template-plan': return planSingleTemplate(client, journal, singleTemplateInput.parse(await readJson(z.string().min(1).parse(args.values.plan))));
    case 'single-template-apply': return applySingleTemplate(client, journal, z.string().parse(args.values.id));
    default: throw new Error('Unknown command. Run --help.');
  }
}
try { console.log(JSON.stringify({ ok: true, result: await main() }, null, 2)); }
catch (error) {
  console.error(JSON.stringify({ ok: false, error: error instanceof z.ZodError ? z.prettifyError(error) : error instanceof Error ? error.message : 'Operation failed.' }));
  process.exitCode = 1;
}
