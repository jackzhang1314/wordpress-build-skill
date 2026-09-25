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
