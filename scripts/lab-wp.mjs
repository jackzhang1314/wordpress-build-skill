import { readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { z } from 'zod';
const connection = z.object({ site: z.literal('http://127.0.0.1:9462'), username: z.string(), password: z.string() }).parse(JSON.parse(await readFile('.lab/artifacts/connection.json', 'utf8')));
const child = spawn(process.execPath, ['.agents/skills/wordpress-builder/scripts/wp.mjs', ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: { ...process.env, WP_URL: connection.site, WP_USERNAME: connection.username, WP_APP_PASSWORD: connection.password, WP_ALLOW_LOCAL_HTTP: '1' },
});
child.on('exit', code => { process.exitCode = code ?? 1; });
