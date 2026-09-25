import {argValue} from './maintenance.mjs';
import {shellQuote} from './ssh.mjs';

/**
 * Business-mailbox SMTP contract: credentials belong only in the remote
 * wp-config.php; PHP behavior belongs only to the starter mu-plugin.
 */
export async function configureSmtp(site, args, logger = console.log) {
  const host = argValue(args, '--host', 'smtp.hostinger.com');
  const port = Number(argValue(args, '--port', '465'));
  const user = argValue(args, '--user');
  const pass = argValue(args, '--pass');
  const fromEmail = argValue(args, '--from-email');
  const fromName = argValue(args, '--from-name', site.project.title);
  const secure = argValue(args, '--secure', Number(port) === 587 ? 'tls' : 'ssl');
  if (!user || !pass || !fromEmail) {
    throw new Error('usage: harness smtp configure --user <mailbox> --pass <mailbox-password> --from-email <mailbox> [--from-name <brand>] [--host smtp.hostinger.com] [--port 465] [--secure ssl|tls]');
  }

  const wpPath = site.project.ssh.wpPath;
  const themePlugin = `${wpPath}/wp-content/themes/${site.project.theme}/mu-plugins/smtp.php`;
  const muPlugin = `${wpPath}/wp-content/mu-plugins/starter-smtp.php`;
  site.ssh.run([
    `test -f ${shellQuote(themePlugin)}`,
    `mkdir -p ${shellQuote(`${wpPath}/wp-content/mu-plugins`)}`,
    `cp ${shellQuote(themePlugin)} ${shellQuote(muPlugin)}`,
    `rm -f ${shellQuote(`${wpPath}/wp-content/mu-plugins/smtp.php`)}`,
  ].join(' && '));

  const constants = [
    ['SMTP_HOST', host],
    ['SMTP_PORT', String(port)],
    ['SMTP_SECURE', secure],
    ['SMTP_USERNAME', user],
    ['SMTP_PASSWORD', pass],
    ['SMTP_FROM', fromEmail],
    ['SMTP_FROM_NAME', fromName],
  ];
  for (const [name, value] of constants) {
    site.ssh.wp(['config', 'set', name, value, '--type=constant']);
  }
  site.ssh.wp(['eval', `echo (int) delete_option('fluentmail-settings');`]);
  site.ssh.wp(['cache', 'flush']);
  logger(`  OK  SMTP configured via ${host}:${port} (sender ${fromEmail})`);
  return {host, port, secure, fromEmail, muPlugin: 'starter-smtp.php'};
}

export async function testSmtp(site, args, logger = console.log) {
  const to = argValue(args, '--to');
  const subject = argValue(args, '--subject', 'SMTP channel test');
  if (!to) throw new Error('usage: harness smtp test --to <mailbox>');
  const dir = `/tmp/smtp-test-${Date.now()}`;
  site.ssh.run(`rm -rf ${shellQuote(dir)} && mkdir -p ${shellQuote(dir)}`);
  site.ssh.run(`cat > ${shellQuote(dir + '/test.php')}`, {input: Buffer.from("<?php if (!defined('ABSPATH')) exit('CLI only'); $p = json_decode(file_get_contents($args[0]), true); $r = wp_mail($p['to'], $p['subject'], $p['body']); global $phpmailer; echo wp_json_encode(['ok' => $r, 'error' => ($phpmailer && $phpmailer->ErrorInfo) ? $phpmailer->ErrorInfo : '']);", 'utf8')});
  site.ssh.run(`cat > ${shellQuote(dir + '/payload.json')}`, {input: Buffer.from(JSON.stringify({to, subject, body: 'SMTP channel is live. If you got this, deliverability is confirmed.'}), 'utf8')});
  const result = site.ssh.wp(['eval-file', `${dir}/test.php`, `${dir}/payload.json`]);
  const parsed = JSON.parse(result.slice(result.indexOf('{')));
  if (!parsed.ok) throw new Error(`send failed: ${parsed.error}`);
  logger(`  OK  test email sent to ${to} — ask the owner to confirm it arrived`);
  return parsed;
}
