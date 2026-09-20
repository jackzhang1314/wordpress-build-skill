import { build } from 'esbuild';
import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
await build({ entryPoints: ['src/cli.ts'], outfile: '.agents/skills/wordpress-builder/scripts/wp.mjs', bundle: true, platform: 'node', target: 'node22', format: 'esm' });
const licenses = await Promise.all(['zod', 'csv-parse'].map(async name => `## ${name}\n\n${await readFile(`node_modules/${name}/LICENSE`, 'utf8')}`));
await writeFile('.agents/skills/wordpress-builder/THIRD_PARTY_LICENSES.md', '# Bundled runtime dependencies\n\n' + licenses.join('\n\n'));

// Validate the full, relocatable module bundle; a changed vendor file fails the build.
const result = JSON.parse(execFileSync(process.execPath, ['.agents/skills/wordpress-builder/scripts/wp.mjs', 'capabilities'], { encoding: 'utf8' }));
if (!result.ok || result.result.integrity !== 'verified') throw new Error('Skill bundle integrity check failed');
console.log(`Verified ${result.result.modules.length} official modules in the Skill bundle.`);

await import('./build-block-starter.mjs');
