# 2026-09-25 18:45 Asia/Shanghai — SMTP mu-plugin regression fix

## Trigger
Clean-chain E2E passed delivery checks, but evidence showed `smtp configure` used the legacy FluentSMTP option path. This conflicted with the agreed Starter architecture: `mu-plugin + wp-config SMTP constants + Hostinger business mailbox`.

## Changes
- Rewrote `harness/lib/smtp.mjs` to use only the Starter mu-plugin and remote `wp-config.php` constants.
- `syncCode` now copies the Starter SMTP file to `wp-content/mu-plugins/starter-smtp.php` during deploy.
- `email-setup` delegates to the same implementation and no longer generates PHP containing mailbox credentials.
- Added SMTP regression tests for constant writes, mu-plugin installation, STARTTLS and absence of legacy implementation.
- Bumped Harness package version to `2.10.1`.

## Remote correction and verification
Target: `mistyrose-kingfisher-381103.hostingersite.com`

- Reconfigured using the disposable mailbox credentials already stored in the project private directory.
- Remote `wp-config.php` syntax check passed.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_FROM`, and `SMTP_FROM_NAME` are configured; secret output was redacted.
- `fluentmail-settings` option is absent.
- `wp-content/mu-plugins/starter-smtp.php` is present.
- Legacy `wp-content/mu-plugins/smtp.php` is absent.
- `wp_mail` send passed.
- IMAP search found the exact subject `Clean Chain mu-plugin SMTP Test 20260925`.

## Validation
- `npm run typecheck`: pass.
- `npm run lint`: pass.
- `npm test`: 171/171 pass.
- Evidence: `/Users/Zhuanz1/Documents/Codex/harness-clean-chain-20260925/projects/clean-chain-site/evidence/clean-chain/results/smtp-mu-plugin-retest.json`

## Remaining
- Clean-chain acceptance summary still contains the original FluentSMTP wording; the new retest evidence is authoritative for SMTP architecture.
- Future clean-chain rerun should use this corrected `main` so the primary summary directly records mu-plugin SMTP.
