# Releases

## 2026-09-25 — Harness 2.4.0 / B2B Starter 1.0.0

This release promotes the componentized classic B2B Starter from verification branch to the reusable baseline.

### Starter

- Bright, neutral industrial B2B design system.
- Componentized templates: global header/footer, breadcrumb, cards, media slots, section headings, CTA bands, stats, FAQ, specs and related products.
- Hierarchical navigation: Products / Industries / Knowledge with category and child-page menus.
- ACF-backed editable copy for products, industries, categories, factory profile, archive copy and contact content.
- Fluent Forms integration with a fresh-site renderable RFQ form and stable `[starter_rfq_form]` shortcode.
- Zero-media placeholder contract with explicit aspect-ratio slots.
- SMTP through a mu-plugin using owner business mailbox credentials stored in `wp-config.php`.

### Harness

- Fresh Hostinger provisioning and deployment pipeline with backup, rollback, plugin baseline, content seed, cache purge and live verification.
- Local quality gates for structure, headings, content, secrets, PHP syntax, component duplication, zero media, ACF binding, routes, WordPress classes and UI component contracts.
- `screenshot` and `verify --screenshots` for 390/768/1440 captures.
- Remote blank-media verification for zero-media starters.
- Credentials, DNS, email onboarding, rollback and template-update workflows.

### Verification highlights

- Fresh Hostinger site provisioned and deployed.
- 23/23 live pages returned 200 with one H1 and no heading skips.
- 69/69 responsive screenshots captured across 390/768/1440.
- Fluent Forms rendered in the browser, submitted successfully, and the database entry increment was verified.
- Remote blank media count remained zero.

## 2026-09-25 — Harness 2.10.0 / Starter Template baseline consolidation

### Harness

- Added `init --from-starter` to create a new project from the production-shaped Classic B2B Starter, including theme, plugin, ACF model, seed content, editor patterns and docs.
- Starter-initialized projects now generate a safe local `project.json` without SSH secrets and without pretending to target a placeholder domain.
- Replaced customer-specific email onboarding guidance with project-domain guidance.
- Updated the root README and added the canonical Harness/Starter guide.

### Starter

- Consolidated the current Classic PHP + ACF baseline after the Precision Catalogue design refactor.
- Updated Starter README, customization guide and deployment guide to match selectable templates, ACF ownership, Fluent Forms, mu-plugin SMTP, Hostinger lifecycle and verification gates.
- Clarified positive architecture contracts and forbidden anti-patterns for downstream customization.

### Verification baseline

- Node test suite: 166/166 passing before this documentation/CLI integration update.
- Live route verification: 24/24 routes passing.
- CMS model audit: 14 checks passing.
- ACF editability audit: 68/68 stored values editable.
- Fluent Forms browser submission verified with entry increment.

### 2026-09-25 consolidation addendum

- Updated the standalone Starter Template release documentation to `v1.10.1`.
- Reconciled the consolidated starter baseline with remote `main`.
- Root README now reports `v1.10.1` as the current template release.

## 2026-09-25 — Harness 2.10.1 SMTP architecture correction

### Fix

- Replaced the legacy SMTP option-writing path with the agreed Starter mu-plugin contract.
- `smtp configure` now writes `SMTP_*` constants to the target `wp-config.php`, installs `starter-smtp.php` into `wp-content/mu-plugins/`, removes the legacy SMTP file name, deletes the legacy option and flushes cache.
- `email-setup` now delegates to the same implementation instead of embedding mailbox credentials in generated PHP.
- Normal deploys now install the Starter SMTP mu-plugin when it is present in the theme.
- Added regression tests for constants, mu-plugin installation, STARTTLS behavior and absence of legacy mail-plugin implementation.

### Verification

- Local typecheck, lint and 171/171 tests passed.
- Reconfigured the disposable clean-chain Hostinger site.
- Remote `wp-config.php` syntax passed; constants were present; the legacy option was absent.
- `wp_mail` send passed and IMAP confirmed the exact test subject in the real mailbox.
