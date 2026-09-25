# 2026-09-25 19:15 Asia/Shanghai — Guided bootstrap and SSH wizard

## Trigger
User requested novice-friendly automatic detection, repair, Hostinger CLI onboarding and SSH setup. Review found two overlapping doctor entrypoints and an incorrect Skill integrity check that depended on WordPress credentials.

## Changes
- Added `harness/lib/environment.mjs` with one repository environment audit and human-readable repair actions.
- Added `bootstrap` and `bootstrap --fix` to `harness/cli.mjs`; fix installs dependencies, builds the bundled Skill runtime, and installs Hostinger CLI via supported package manager.
- Added `hostinger setup [--install] [--connect]` as a first-class Harness command.
- Added `harness/lib/ssh-setup.mjs` and `ssh setup` to create/reuse an ed25519 key, derive Hostinger SSH defaults, persist SSH fields, and test SSH/WP-CLI.
- Existing private keys without public counterparts now derive their public key using `ssh-keygen -y`.
- Skill integrity now runs `wp.mjs --help` and does not require WordPress credentials.
- Starter projects ignore local `project.json`.
- Updated README, Harness guide and AGENTS routing.

## Validation
- `npm run typecheck`: pass.
- `npm run lint`: pass.
- `npm test`: 180/180 pass.
- `node harness/cli.mjs bootstrap --fix`: pass.
- `node harness/cli.mjs hostinger setup --connect --json`: pass.
- `node harness/cli.mjs --project /Users/Zhuanz1/Documents/Codex/harness-clean-chain-20260925/projects/clean-chain-site ssh setup --json`: pass; SSH and remote WP-CLI connected.

## Remaining
- Native Hostinger CLI installation remains Homebrew-first; Windows and no-Homebrew systems still require guided official-release installation.
- SSH public key insertion into hPanel remains a user action because the public Hostinger CLI surface does not expose SSH-key management.
- A future launch wizard can chain bootstrap → init → ssh setup → provision → deploy → email → verify behind explicit authorization.
