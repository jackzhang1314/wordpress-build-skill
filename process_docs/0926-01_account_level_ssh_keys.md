# 0926-01 Account-Level SSH Keys

- Time: 2026-09-26 02:06 CST (+08:00)
- Trigger: clarify provenance of the existing clean-chain key and make the intended reusable account-key behavior explicit.

## Provenance

- The clean-chain private key was copied from the earlier LITENG project at `/Users/Zhuanz1/Documents/ChatGPT/wordpress-projects/liteng-parts/.wordpress-builder/hostinger-brightdozer/liteng-ssh-key`.
- Both projects use Hostinger SSH user `u939005367`; the old key therefore continued to authorize the clean-chain site. This was account-user reuse, not a fresh clean-room SSH bootstrap.

## Harness Changes

- New `ssh setup` runs now select `~/.ssh/hostinger-<ssh-user>_ed25519` instead of a project-local copy when no key is explicitly configured.
- Added `--account-key` to force that reusable path and `--install-key` to bootstrap it when authorized Hostinger CLI credentials are available.
- The bootstrap uploads a public key and idempotent install script through Hostinger Files, runs it once with a temporary Cron Job, waits for SSH, then removes the Cron Job. The script now handles an `authorized_keys` file that is missing a trailing newline.
- If API bootstrap fails, the command falls back to clipboard/hPanel handoff and reports `bootstrapError`.
- Added `--account-key`, `--install-key`, `accountKeyPath`, `installAccountSshKey`, `installedVia`, `cronDeleted`, and account-key regression tests.

## Validation

- Focused regression: `npx tsx --test tests/harness/ssh-setup.test.mjs` — 10/10 passed.
- Full gate: typecheck, lint, and `npm test` — 184/184 passed.
- Real E2E: ran `ssh setup --account-key --install-key` against the clean-chain site. A new central key was created with mode 0600, installed, used for SSH/WP-CLI, and verified on a second run. Cron list was empty and no staging directory remained.

## Boundary

- The reusable scope is the Hostinger hosting account / SSH user (for example `u939005367`), not the Hostinger website login or every unrelated hosting order. Different hosting users still require their own authorization.
