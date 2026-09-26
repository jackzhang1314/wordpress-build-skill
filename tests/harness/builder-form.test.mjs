import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {mkdtempSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {installBuilderForm} from '../../harness/lib/builder-form.mjs';
import {commandMap} from '../../harness/lib/command-map.mjs';

test('builder form install activates Fluent Forms and creates an idempotent RFQ form', async () => {
  const root = mkdtempSync(join(tmpdir(), 'builder-form-'));
  const files = new Map();
  const plugins = [{name: 'fluentform', status: 'inactive'}];
  const ssh = {
    run(command, options = {}) {
      const match = /^cat > (\S+)$/.exec(command);
      if (match) files.set(match[1], options.input?.toString('utf8') ?? '');
      return '';
    },
    wp(args) {
      const text = args.join(' ');
      if (text.includes('plugin list')) return JSON.stringify(plugins);
      if (text.includes('plugin activate')) {
        plugins[0].status = 'active';
        return '';
      }
      if (text.includes('eval-file')) {
        assert.equal(files.get(args[1]).includes("title = 'Builder equipment RFQ'"), true);
        return JSON.stringify({id: 7, title: 'Builder equipment RFQ', action: 'created', shortcode: '[fluentform id="7"]'});
      }
      throw new Error(`unexpected wp call: ${text}`);
    },
  };
  try {
    const messages = [];
    const result = await installBuilderForm(
      {root, project: {domain: 'site.test'}, ssh},
      ['--skip-backup'],
      message => messages.push(message),
    );
    assert.equal(result.id, 7);
    assert.equal(result.fluentFormsInstalled, false);
    assert.equal(plugins[0].status, 'active');
  } finally {
    rmSync(root, {recursive: true, force: true});
  }
});

test('builder form install is represented in the canonical command map', () => {
  const command = commandMap.find(item => item.command === 'builder form install');
  assert.equal(command.projectMode, 'source-or-external');
  assert.equal(command.risk, 'remote-write-with-backup');
  const cli = readFileSync('harness/cli.mjs', 'utf8');
  assert.equal(cli.includes('installBuilderForm'), true);
});
