import { buildDirectory } from './build-paths.mjs';
const buildDir = buildDirectory();
import {buildWordpressPackages} from '../wordpress-site/build.mjs';
import { build } from 'esbuild';
import { mkdir, copyFile, cp, rm } from 'node:fs/promises';

// Clean only this candidate output; regular builds leave the loaded dist untouched.
await rm(buildDir, { recursive: true, force: true });
await mkdir(buildDir, { recursive: true });
await buildWordpressPackages(`${buildDir}/wordpress-site`);
await build({
  entryPoints: ['src/background.ts', 'src/content.ts', 'src/sidepanel.ts', 'src/agent-content.ts', 'src/quick-content.ts', 'src/quick-ui.ts', 'src/video-assistant.ts'],
  outdir: buildDir, bundle: true, format: 'iife', target: 'chrome120',
  loader: { '.svg': 'text', '.css': 'text', '.md': 'text' }, minify: true,
});
for (const file of ['manifest.json', 'sidepanel.html', 'agent-sandbox.html', 'agent-sandbox-frame.html', 'privacy.html', 'recorder.html', 'microphone.html']) {
  await copyFile(`public/${file}`, `${buildDir}/${file}`);
}
await cp('public/icons', `${buildDir}/icons`, { recursive: true });
await cp('public/_locales', `${buildDir}/_locales`, { recursive: true });
await copyFile('src/ui.css', `${buildDir}/ui.css`);
await copyFile('src/agent/panel.css', `${buildDir}/agent-panel.css`);
await copyFile('src/agent/transcript.css', `${buildDir}/transcript.css`);
await copyFile('src/agent/core-pages.css', `${buildDir}/core-pages.css`);
await copyFile('THIRD_PARTY_NOTICES.md', `${buildDir}/THIRD_PARTY_NOTICES.md`);
// Load document parsers only when needed; package the worker and its assets locally.
await build({ entryPoints: ['src/agent/files/document-parsers.ts'], outfile: `${buildDir}/document-parsers.js`, bundle: true, format: 'esm', platform: 'browser', target: 'chrome142', minify: true });
await build({ entryPoints: ['src/agent/files/document-renderers.ts'], outfile: `${buildDir}/document-renderers.js`, bundle: true, format: 'esm', platform: 'browser', target: 'chrome142', loader: { '.css': 'text', '.svg': 'text' }, minify: true });
await mkdir(`${buildDir}/pdf`, { recursive: true });
await copyFile('node_modules/pdfjs-dist/build/pdf.worker.mjs', `${buildDir}/pdf/pdf.worker.mjs`);
for (const directory of ['cmaps', 'standard_fonts']) await cp(`node_modules/pdfjs-dist/${directory}`, `${buildDir}/pdf/${directory}`, { recursive: true });
await mkdir(`${buildDir}/licenses`, { recursive: true });
for (const dependency of ['pdfjs-dist', 'mammoth', 'exceljs', 'i18next', 'remend']) await copyFile(`node_modules/${dependency}/LICENSE`, `${buildDir}/licenses/${dependency}.txt`);
await build({ entryPoints: ['src/prototype.ts'], outfile: 'output/prototype/prototype.js', bundle: true, format: 'iife', target: 'chrome120', loader: { '.svg': 'text', '.css': 'text', '.md': 'text' } });

const worker = await build({ entryPoints: ['src/agent/sandbox/worker.ts'], bundle: true, write: false, format: 'iife', platform: 'browser', target: 'chrome142', minify: true });
await build({ entryPoints: { 'sandbox-offscreen': 'src/agent/sandbox/offscreen.ts', 'sandbox-frame': 'src/agent/sandbox/frame.ts' }, outdir: buildDir, bundle: true, format: 'iife', platform: 'browser', target: 'chrome142', minify: true, define: { SANDBOX_WORKER_SOURCE: JSON.stringify(worker.outputFiles[0].text) } });
await copyFile('node_modules/@jitl/quickjs-wasmfile-release-sync/dist/emscripten-module.wasm', `${buildDir}/quickjs.wasm`);

await cp('public/icons', 'output/prototype/icons', { recursive: true });

await build({ entryPoints: ['src/quick/settings-preview.ts'], outfile: 'output/prototype/settings-preview.js', bundle: true, format: 'iife', target: 'chrome142', loader: { '.css': 'text', '.svg': 'text' } });

await build({ entryPoints: ['src/agent/settings-preview.ts'], outfile: 'output/prototype/all-settings-preview.js', bundle: true, format: 'esm', target: 'chrome142', loader: { '.css': 'text', '.svg': 'text', '.md': 'text' } });

await build({ entryPoints: ['src/agent/core-pages-preview.ts'], outfile: 'output/prototype/core-pages-preview.js', bundle: true, format: 'esm', target: 'chrome142', loader: { '.css': 'text', '.svg': 'text', '.md': 'text' } });



await build({entryPoints:{'recorder':'src/recording/main.ts','microphone':'src/recording/microphone-page.ts','recording-ticker':'src/recording/ticker.ts','recording-edit-worker':'src/recording/edit-worker.ts'},outdir:buildDir,bundle:true,format:'esm',target:'chrome142',loader:{'.css':'text','.svg':'text'},minify:true});
await build({entryPoints:['src/recording/offscreen.ts'],outfile:`${buildDir}/recording-offscreen.js`,bundle:true,format:'iife',target:'chrome142',minify:true});
await copyFile('node_modules/mediabunny/LICENSE',`${buildDir}/licenses/mediabunny.txt`);
await copyFile('node_modules/gifenc/LICENSE.md',`${buildDir}/licenses/gifenc.txt`);
await import('./audit-store-build.mjs');

await build({entryPoints:['src/quick/writing-preview.ts'],outfile:'output/prototype/writing-preview.js',bundle:true,format:'esm',target:'chrome142',loader:{'.css':'text','.svg':'text'}});
