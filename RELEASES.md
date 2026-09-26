# Releases

## 2026-09-26 — WordPress Builder 2.18.0 theme-agnostic rendering adapters

### Builder

- Added remote rendering-system detection for Classic PHP, Block/FSE, page builders, hybrid and unknown implementations.
- Added authoring-system detection for Elementor, Divi, Beaver Builder, WPBakery, Bricks and Oxygen.
- Enhanced `project inspect` with classic menu items, block navigation references, FSE templates/template parts and rendering capabilities.
- Fixed navigation count parsing when WP-CLI returns a numeric scalar.
- Added theme-independent Builder Core plugin installation for adopted sites.

### Skills

- Clarified that ACF/CPT/page-content workflows are theme-agnostic.
- Documented Classic, Block/FSE, page-builder and hybrid adapters.
- Made clear that theme type is an adapter signal, not an incompatibility.
- Builder Core now provides Builder CPTs, taxonomy, ACF fields and plugin-owned page templates without converting existing editor pages.

### Verification

- Full typecheck, lint and test suite passed: 202/202 tests.

## 2026-09-26 — WordPress Builder 2.17.0 external safety and account inventory

### Builder

- Added `sites list` to inventory every WordPress site visible to the connected Hostinger account.
- Added external WordPress shape preflight for navigation and page-template writes.
- Added lightweight restore snapshots for external page/post, navigation and page-template writes.
- Block-only navigation now blocks classic menu writes; mixed navigation returns an explicit verification warning.
- FSE-managed page templates block classic template assignment with actionable guidance.

### Skills

- Setup now includes account inventory.
- Content documents classic, block, mixed and unknown navigation limits.
- Delivery documents external write snapshots and backup boundaries.

### Verification

- Full typecheck, lint and test suite passed: 201/201 tests.
- Live `sites list` verified six visible Hostinger WordPress sites.

## 2026-09-26 — WordPress Builder 2.16.0 Skill Suite foundation

### Builder

- Added `wordpress-builder.mjs` as the canonical CLI entrypoint. `harness/cli.mjs` remains as a deprecated compatibility path.
- Added `project inspect` to detect WordPress version, active theme, theme type, navigation mechanism, page templates, plugins, public CPT/taxonomy, Fluent Forms and content/media counts.
- Added `mode: source | external` and `sourceProfile: starter | custom`.
- Custom source projects now skip Starter-specific route, page-template, component, ACF, media and UI contracts.
- External adoption records the real WordPress shape and inventory before content or design work.
- External page/post/navigation/template writes create lightweight restore snapshots.
- Block-only navigation writes and FSE classic template assignment are blocked with explicit guidance.
- Added a reusable account SSH host map because website DNS and SSH endpoints can differ.

### Skills

- Introduced the five-skill suite: `wordpress-builder`, `wordpress-setup`, `wordpress-content`, `wordpress-design` and `wordpress-delivery`.
- Converted `wordpress-builder` into the router and global safety contract.
- Added the shared project contract, mode-safety rules, Starter-versus-existing policy, handoff rules and canonical command map.
- Added skill suite regression tests for routing, references, mode safety and WordPress inspection.

### Verification

- Full typecheck, lint and test suite passed: 193/193 tests.
- Live `project inspect` verified against a real Hostinger WordPress site.

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

## 2026-09-25 — Harness 2.11.1 guided bootstrap and SSH onboarding

### Environment

- Added `node harness/cli.mjs bootstrap` as the unified local entrypoint.
- `bootstrap --fix` can install npm dependencies, build the bundled Skill runtime, and install the official Hostinger CLI through Homebrew when available.
- Environment checks now verify Node 22+, npm, Git, rsync, tar, gzip, npm dependencies, Skill runtime and integrity, PHP/Docker, Hostinger CLI and Chrome.
- Skill integrity no longer requires WordPress credentials; `wp.mjs --help` is the integrity probe.

### Hostinger and SSH

- Added `node harness/cli.mjs hostinger setup [--install] [--connect]`.
- Added `node harness/cli.mjs --project . ssh setup`.
- SSH setup creates or reuses a dedicated ed25519 key, derives Hostinger SSH user/host from the website list and DNS, saves only SSH fields in `project.json`, and verifies SSH plus remote WP-CLI.
- If Hostinger has not received the public key yet, the command prints the key and the exact hPanel URL, then asks the user to rerun after pasting it.

### Safety and docs

- Generated Starter projects now ignore local `project.json`, preventing accidental SSH credential commits.
- README, Harness guide and AGENTS now route users through `bootstrap`, `hostinger setup` and `ssh setup`.

### Verification

- Typecheck, lint and 180/180 tests passed.
- Live local checks: `bootstrap`, `bootstrap --fix`, `hostinger setup --connect`, and `ssh setup` all passed against the disposable clean-chain Hostinger site.

### 2.11.0 addendum: zero-dependency first run

- Added `harness/bootstrap.mjs` as the fresh-clone entrypoint.
- It uses Node built-ins only, so it can run before npm dependencies are installed.
- Fresh-clone flow is now `node harness/bootstrap.mjs --fix`, then `init --from-starter`.

## 2026-09-25 — Harness 2.11.1 zero-dependency bootstrap

- Promoted `harness/bootstrap.mjs` to the official fresh-clone entrypoint after a real public clone test found the main CLI could not import `zod` before `npm ci`.
- Tagged the complete guided onboarding baseline as `v2.11.1`.
