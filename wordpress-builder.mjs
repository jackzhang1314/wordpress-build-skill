#!/usr/bin/env node

const {main} = await import('./harness/cli.mjs');
process.exit(await main());
