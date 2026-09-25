import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {configureSmtp, testSmtp} from '../../harness/lib/smtp.mjs';

const repoRoot = fileURLToPath(new URL('../../', import.meta.url));

function mockSite(projectTitle = 'Clean Chain Site') {
  const calls = {run: [], wp: []};
  const site = {
    project: {
      title: projectTitle,
      theme: 'clean-site-theme',
      ssh: {wpPath: '/home/owner/domains/site.test/public_html'},
    },
    ssh: {
      run: command => calls.run.push(command),
      wp: args => {
        calls.wp.push(args);
        if (args[0] === 'eval-file' && args[1]?.includes('/smtp-test-')) {
          return '{"ok":true,"error":""}';
        }
        return '';
      },
    },
  };
  return {site, calls};
}

test('smtp configure writes business mailbox constants and installs the starter mu-plugin', async () => {
  const {site, calls} = mockSite();
  await configureSmtp(site, [
    '--user', 'notify@site.test',
    '--pass', 'mailbox-secret',
    '--from-email', 'notify@site.test',
  ], () => {});

  assert.match(calls.run[0], /mu-plugins\/smtp\.php/);
  assert.match(calls.run[0], /mu-plugins\/starter-smtp\.php/);
  assert.match(calls.run[0], /rm -f .*mu-plugins\/smtp\.php/);

  const configCalls = calls.wp.filter(args => args[0] === 'config' && args[1] === 'set');
  assert.deepEqual(configCalls.map(args => args[2]), [
    'SMTP_HOST', 'SMTP_PORT', 'SMTP_SECURE', 'SMTP_USERNAME',
    'SMTP_PASSWORD', 'SMTP_FROM', 'SMTP_FROM_NAME',
  ]);
  assert.equal(configCalls[0][3], 'smtp.hostinger.com');
  assert.equal(configCalls[1][3], '465');
  assert.equal(configCalls[2][3], 'ssl');
  assert.equal(configCalls[4][3], 'mailbox-secret');
  for (const args of configCalls) assert.deepEqual(args.slice(4), ['--type=constant']);
  assert.ok(calls.wp.some(args => args[0] === 'eval' && args[1].includes("delete_option('fluentmail-settings')")));
});

test('smtp configure supports port 587 with STARTTLS', async () => {
  const {site, calls} = mockSite();
  await configureSmtp(site, [
    '--port', '587',
    '--user', 'notify@site.test',
    '--pass', 'mailbox-secret',
    '--from-email', 'notify@site.test',
  ], () => {});
  const secure = calls.wp.find(args => args[0] === 'config' && args[1] === 'set' && args[2] === 'SMTP_SECURE');
  assert.equal(secure[3], 'tls');
});

test('smtp test invokes wp_mail and reports PHPMailer errors', async () => {
  const {site, calls} = mockSite();
  const result = await testSmtp(site, ['--to', 'owner@site.test'], () => {});
  assert.deepEqual(result, {ok: true, error: ''});
  const command = calls.wp.find(args => args[0] === 'eval-file');
  assert.match(command[1], /smtp-test-/);
  assert.match(command[2], /smtp-test-.*payload\.json$/);
});

test('harness SMTP code contains no legacy mail-plugin implementation', () => {
  const source = [
    readFileSync(join(repoRoot, 'harness/lib/smtp.mjs'), 'utf8'),
    readFileSync(join(repoRoot, 'harness/cli.mjs'), 'utf8'),
    readFileSync(join(repoRoot, 'harness/lib/ops.mjs'), 'utf8'),
  ].join('\n');
  assert.doesNotMatch(source, /Brevo|FluentSMTP/i);
  assert.doesNotMatch(source, /update_option\(\s*'fluentmail-settings'/);
});
