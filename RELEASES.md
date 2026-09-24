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
