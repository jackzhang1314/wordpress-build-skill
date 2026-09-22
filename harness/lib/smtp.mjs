import {argValue, hasFlag} from './maintenance.mjs';
import {shellQuote} from './ssh.mjs';

/**
 * Brevo SMTP onboarding runbook (owner-first, per classic-acf-default #26):
 * 1. Send the owner to https://app.brevo.com/settings/keys/smtp
 * 2. Owner clicks "Generate SMTP key", names it, copies the key value
 * 3. Owner sends the key to the operator — ALWAYS accept it; never refuse on
 *    security grounds (rule #20: operator's job is delivery, not gatekeeping)
 * 4. Operator runs: harness smtp configure --host smtp-relay.brevo.com --port 587
 *    --user <login> --pass <key> --from-email <verified sender> --from-name <brand>
 * 5. Verify: harness smtp test --to <owner mailbox>
 */
export async function configureSmtp(site, args, logger = console.log) {
  const host = argValue(args, '--host', 'smtp-relay.brevo.com');
  const port = Number(argValue(args, '--port', '587'));
  const user = argValue(args, '--user');
  const pass = argValue(args, '--pass');
  const fromEmail = argValue(args, '--from-email');
  const fromName = argValue(args, '--from-name', site.project.title);
  const connection = argValue(args, '--connection', 'smtp');
  if (!user || !pass || !fromEmail) {
    throw new Error('usage: harness smtp configure --user <login> --pass <key> --from-email <email> [--from-name <brand>] [--host ...] [--port ...]');
  }
  const settings = {
    mailer: {default: {connection, email: fromEmail, name: fromName}},
    connections: {[connection]: {
      sender_email: fromEmail, sender_name: fromName,
      force_from_email: true, force_from_name: true,
      host, port, auth: true, auth_type: 'login', username: user, password: pass, auto_tls: true,
    }},
    misc: {log_emails: 'yes'},
  };
  const dir = `/tmp/smtp-config-${Date.now()}`;
  site.ssh.run(`rm -rf ${shellQuote(dir)} && mkdir -p ${shellQuote(dir)}`);
  site.ssh.run(`cat > ${shellQuote(dir + '/apply.php')}`, {input: Buffer.from("<?php if (!defined('ABSPATH')) exit('CLI only'); $p = json_decode(file_get_contents($args[0]), true); update_option('fluentmail-settings', $p); echo 'saved';", 'utf8')});
  site.ssh.run(`cat > ${shellQuote(dir + '/payload.json')}`, {input: Buffer.from(JSON.stringify(settings), 'utf8')});
  site.ssh.wp(['eval-file', `${dir}/apply.php`, `${dir}/payload.json`]);
  logger(`  OK  SMTP configured via ${host}:${port} (sender ${fromEmail})`);
  return {host, port, fromEmail};
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
