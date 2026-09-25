# 0926-02 Default Account Key Bootstrap

- Time: 2026-09-26 03:05 CST (+08:00)
- Trigger: turn the clarified account-key decision into the default novice flow rather than an opt-in command.

## Changes

- `ssh setup` now defaults to the reusable account key and automatic Files + temporary Cron bootstrap. `--account-key` remains as an explicit alias and `--no-install-key` disables the write path.
- If automatic bootstrap fails, fallback now automatically copies the public key and opens hPanel unless `--no-copy-key` or `--no-open` is supplied.
- Account keys use neutral `harness-account-<user>` comments instead of the first project's slug.
- `provision` now creates the website/WordPress, configures the reusable account key, then continues to plugins/deploy. It no longer requires `REPLACE_SSH_HOST/USER/KEY` arguments.
- Updated starter example, README, Harness guide, AGENTS, and Hostinger Skill reference to the account-key default and exact reuse boundary.

## Validation

- SSH regressions: 10/10 passed, including default automatic bootstrap.
- Starter/template regressions: 25/25 passed after removing the old private-key placeholder contract.
- Full gate: typecheck, lint, and `npm test` — 184/184 passed.

## Boundary

- Reuse is per Hostinger hosting account / SSH user, not per Hostinger website login and not universal across unrelated hosting users/orders.
- Automatic bootstrap requires an existing website document root because Hostinger Files/Cron APIs are website-scoped.
