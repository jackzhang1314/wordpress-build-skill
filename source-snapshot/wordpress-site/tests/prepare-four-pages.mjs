// Only used by developers; the extension uses the same serializer directly.
import {build} from 'esbuild';
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL, fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../..',import.meta.url));
if(!process.argv[2])throw new Error('Provide an isolated output directory.');
const out=resolve(process.argv[2]);await mkdir(out,{recursive:true});
await build({entryPoints:[resolve(root,'src/agent/connections/wordpress-blocks.ts')],bundle:true,platform:'node',format:'cjs',outfile:resolve(out,'serializer.cjs')});
const {serializeWpBlocks,wpBlocksSchema}=await import(pathToFileURL(resolve(out,'serializer.cjs')).href);
const pages=JSON.parse(await readFile(new URL('./four-pages.json',import.meta.url),'utf8'));
await writeFile(resolve(out,'pages.json'),JSON.stringify(pages.map(p=>({...p,content:serializeWpBlocks(wpBlocksSchema.parse(p.blocks),new Map())})),null,2));
await writeFile(resolve(out,'blueprint.json'),JSON.stringify({steps:[{step:'runPHP',code:await readFile(new URL('./four-pages.php',import.meta.url),'utf8')}]}));
console.log(out);
