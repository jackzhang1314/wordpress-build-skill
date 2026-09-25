# 2026-09-25 11:35 Asia/Shanghai — Harness and Starter consolidation

## Trigger
User requested a full audit of the latest Harness and Starter Template, consolidation of multiple worktree histories, operational onboarding documentation, and push to the remote repositories.

## Audit findings
- Root README still described an older browser/connector workflow and did not document the current Harness/Starter path.
- Starter README/DEPLOY/CUSTOMIZE contained legacy manual setup, old field examples and form assumptions.
- Harness `init` could scaffold only the generic PHP reference, not the production-shaped B2B Starter.
- Email onboarding help embedded a customer-specific domain instead of using the configured project domain.
- Multiple worktrees and divergent histories made the canonical branch unclear.

## Changes
- Added `harness init --from-starter`, which copies the full Classic B2B Starter and generates a local, SSH-free `project.json`.
- Replaced customer-specific email guidance with dynamic project-domain guidance.
- Rewrote the root README and added `docs/HARNESS-GUIDE.md` as the canonical onboarding and operations manual.
- Rewrote Starter README, CUSTOMIZE and DEPLOY documentation around current template routing, ACF ownership, Fluent Forms, mu-plugin SMTP, Hostinger deployment and verification gates.
- Documented positive contracts and anti-patterns for downstream customization.
- Reconciled remote `main` into the canonical starter branch with the starter baseline taking precedence.
- Bumped the Harness package to `2.10.0`.
- Published standalone Starter Template `v1.10.1` with the consolidated documentation.

## Verification
- `npm run typecheck`: pass.
- `npm run lint`: pass.
- `npm test`: 167/167 pass; one isolated WordPress readiness timeout occurred during a full run and passed on rerun.
- Starter local quality gates: pass.
- Starter package generation: pass.
- Standalone template package check: pass.

## Repository state
- Harness canonical branch: `codex/component-starter-rebuild`.
- Harness remote `main`: consolidated and updated.
- Standalone template release: `v1.10.1`.
- Working evidence directories remain untracked and are not source deliverables.

## Remaining work
- Keep main and canonical branch synchronized after future changes.
- Continue accessibility verification beyond screenshots and DOM checks.
- Add a fresh end-to-end Hostinger run using only `init --from-starter` on a clean checkout.
