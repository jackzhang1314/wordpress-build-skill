import { build } from 'esbuild';
import { readFile, writeFile } from 'node:fs/promises';
await build({ entryPoints: ['src/cli.ts'], outfile: '.agents/skills/wordpress-builder/scripts/wp.mjs', bundle: true, platform: 'node', target: 'node22', format: 'esm' });
const licenses = await Promise.all(['zod', 'csv-parse'].map(async name => `## ${name}\n\n${await readFile(`node_modules/${name}/LICENSE`, 'utf8')}`));
await writeFile('.agents/skills/wordpress-builder/THIRD_PARTY_LICENSES.md', '# Bundled runtime dependencies\n\n' + licenses.join('\n\n'));
