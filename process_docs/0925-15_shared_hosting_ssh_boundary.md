# 0925-15 Shared Hosting SSH Boundary

- Time: 2026-09-25 20:09 CST (+08:00)
- Trigger: verify whether Hostinger CLI/API can install the generated SSH key without the hPanel handoff.

## Findings

- Account automation works: `hostinger setup --connect` can discover the site and the generated key can run remote WP-CLI; the clean-chain test host reports WordPress 7.1.2.
- Tested CLI 3.35.0 and public API 1.54.2. The shared `hosting` command tree exposes cache, cron, databases, domains, files, git, Node.js, orders, PHP, redirects, SSL and websites, but no SSH key management.
- The API has write endpoints only for VPS at `/api/vps/v1/public-keys`. Agency Hosting website details expose read-only SSH/SFTP connection details, but the account has zero Agency Hosting websites and there is no public-key write endpoint.
- Hostinger's own FTP/SSH guide therefore documents a hPanel action: SSH Access → Add SSH Key. This is a platform boundary, not a missing Harness step.

## Harness Improvements

- `ssh setup` now reports the verified limitation and exact handoff steps instead of appearing to fail unexpectedly.
- Added `--copy-key` to place the public key on the clipboard and `--open` to open the current project's hPanel SSH page.
- Added `ssh open`, machine-readable `manualKeySetup`, `publicKeyPath`, `copied`, `limitation` and `steps`; logs avoid the private key.
- Documented that users with an existing working private key can bypass the handoff with `--ssh-key <path>`.

## Validation

- Focused regression: `npx tsx --test tests/harness/ssh-setup.test.mjs` — 8/8 passed.
- Real SSH/WP-CLI smoke: existing key reached the clean-chain host and `wp core version` returned 7.1.2.

## Next

- Run full typecheck/lint/tests, commit and push the updated Harness release.
