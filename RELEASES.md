# Releases

## 2026-09-27 — WordPress Builder 2.24.0 route-owned FSE template patches

### Builder

- Added a two-phase Block/FSE template patch workflow:
  - `block-template plan --route </path/> (--part <slug>|--template <slug>) --file <patch.json>`;
  - `block-template apply --plan <plan-id>`.
- A plan may target only the selected route template or one of its selected template parts.
- Patch input requires one unique `find`, one different `replace`, and 1-5 `verifyText` values present in the replacement.
- Added block markup structural validation for the complete patched content before planning.
- Supported source custody:
  - `custom`: updates the existing database override;
  - `theme`: creates a same-slug Site Editor custom override without editing theme files.
- Apply rechecks site/theme/route/template/part/content drift, snapshots prior state, updates or creates the override, reads it back, flushes cache and verifies the original live route text.
- Automatic rollback restores an existing custom override or deletes a newly created theme override when readback or live verification fails.
- Kept theme.json, PHP theme files, arbitrary full-template overwrites and Elementor data out of scope.

### Skills and documentation

- Updated Design route ownership guidance, project contract, mode safety and command map.
- Documented patch input, custom-versus-theme source strategy, rollback and live verification.
- Added `process_docs/0927-02_block_template_patch_workflow.md`.

### Verification

- Added ten block-template/CLI regressions covering markup validation, unique patch hashing, local-only planning, custom update, live failure rollback, theme override creation/deletion rollback, non-selected target refusal, drift refusal and command-map safety.
- Full local gate passed: typecheck, lint, build and **246/246 tests**.
- Real local Block/FSE E2E verified a custom header part patch, automatic rollback, normal apply and live `Template Patch OK` output.
- Real local theme-source E2E verified `theme -> custom` override creation, failed live verification, automatic override deletion and restoration of the original fixture.
- Live canonical CLI safety check on a real Hostinger route rejected a patch whose `find` fragment did not exist, created no plan and wrote no remote data.
- Post-release clean clone of tag `v2.24.0` passed bootstrap, typecheck, lint, all 246 tests, build and CLI help.

## 2026-09-27 — WordPress Builder 2.23.0 route-owned `wp_navigation` writes

### Builder

- Added a two-phase Block navigation workflow:
  - `nav block plan --route </path/> --file <links.json> [--navigation <id>]`;
  - `nav block apply --plan <plan-id>`.
- Plan is local-only and records route, active theme, selected template, selected parts, navigation owner, shared impact, before/after navigation hashes and the immutable navigation content needed for rollback.
- Apply rechecks site/theme/route/template/part/navigation drift, creates a restore snapshot, updates only a route-owned `wp_navigation`, reads back the hash, flushes cache, verifies every requested label in the original route HTML and automatically restores the previous content if verification fails.
- Supported navigation content is deliberately limited to a flat list of `wp:navigation-link` blocks.
- Rejected inline-only navigation, submenus, unknown/locked blocks, unreferenced navigation posts, multiple candidates without an explicit ID and low-confidence/missing owners.
- FSE template and template-part editing remains a separate source-custody workflow; this release does not modify theme files.

### Skills and documentation

- Updated Content navigation guidance, Design route ownership rules, project contract and command-map safety.
- Documented input format, plan/apply flow, impact, rollback and current non-goals.
- Added `process_docs/0927-01_block_navigation_write_workflow.md`.

### Verification

- Added twelve block-navigation/CLI regressions covering parsing, planning, impact, apply, live verification, readback failure rollback, frontend-failure rollback, manual drift, route-owner drift, unreferenced targets, inline-only refusal and command-map safety.
- Full local gate passed: typecheck, lint, build and **236/236 tests**.
- Live canonical CLI safety check on a real Hostinger route without `wp_navigation` correctly refused planning, created no plan and wrote no remote data.
- Post-release clean clone of tag `v2.23.0` passed bootstrap, typecheck, lint, all 236 tests, build and CLI help.
- Real local Block/FSE E2E verified:
  - custom `front-page` template;
  - custom header template part;
  - route owner `template-part:header`;
  - `wp_navigation 279`;
  - failed live verification automatically restored `Shape Home`;
  - normal apply rendered `E2E Home` and `E2E Products`;
  - cleanup restored the original navigation.

## 2026-09-27 — WordPress Builder 2.22.0 Block/FSE route shape diagnosis

### Builder

- Added route-level read-only diagnosis for Block/FSE and hybrid WordPress sites:
  - `project inspect --routes /,/about/`;
  - `project inspect --route-set core`.
- Used WordPress Core’s `_wp-find-template` read-only protocol to identify the template actually selected for each route, instead of guessing from object inventory.
- Reported selected FSE template slug/id/source/hash, selected template parts, `wp_navigation` references, inline Navigation blocks, navigation owner and confidence.
- Persisted only compact `project.remote.routeShapes`; full block markup is not copied into `project.json`.
- Distinguished theme files from Site Editor `source: custom` database overrides.
- Treated unreferenced `wp_navigation` posts and unrendered Classic menu locations as candidates, not proven route owners.
- Kept Block/FSE template and navigation edits read-only in this release.
- Hardened writes: mixed navigation blocks Classic menu writes, and Classic/FSE hybrids block classic template assignment until route ownership is proven.
- Consolidated remote inventory into one WP-CLI request while retaining the legacy multi-command path as fallback.

### Verification

- Added parser, hierarchy, ownership, custom-override, missing-part, failed-probe and safety regressions.
- Full local gate passed: typecheck, lint, build and **224/224 tests**.
- Real local Block/FSE E2E verified a custom `front-page` template and custom header part referencing `wp_navigation`; diagnostic IDs/source/owner matched the rendered frontend HTML.
- Added an unreferenced `wp_navigation`; inventory counted it but route ownership remained unchanged.
- Live read-only Hostinger regression on `brightdozer-482910.hostingersite.com` sampled 10 core routes. Nine resolved with high confidence; the non-JSON 404 route stayed low confidence instead of inventing an owner.
- Performance regression found and fixed: one-route live inspection fell from about 7m41s with serial inventory commands to about 5.7s; the 10-route core set completed in about 62s.
- Post-release clean clone of tag `v2.22.0` passed bootstrap, typecheck, lint, all 224 tests, build and CLI help.

## 2026-09-26 — WordPress Builder 2.21.0 remote/local site custody status

### Builder

- Added `sites status` as a read-only account and local-project inventory.
- Correlated Hostinger website domains with local `project.json` directories.
- Reported local path, mode, source profile, configured and inspected active theme, SSH presence, latest backup, latest deploy and inspection freshness.
- Marked remote domains as `unique`, `unmatched` or `ambiguous`; local-only projects and invalid project files are reported separately.
- Preserved ownership safety: unmatched remote sites are never guessed to belong to a local project, and duplicate local domains remain explicit warnings.
- Added `--root <projects-parent>` (also accepted as `--projects-root`) and automatic default discovery for common `../projects` / `../wordpress-projects` layouts.

### Verification

- Added regression coverage for matched/unmatched sites, stale inspection, duplicate local projects, local-only projects, missing roots and invalid project JSON.
- Full local gate passed: 215/215 tests.
- Live account inventory correlated 7 Hostinger sites with 6 local projects: 5 remote sites matched, 2 were unmatched, and 1 had duplicate local projects (`yellow-koala-142147.hostingersite.com`) and was correctly reported as `ambiguous`.
- Post-release clean clone of tag `v2.21.0` passed bootstrap, typecheck, lint, all 215 tests and `sites status`.

## 2026-09-26 — WordPress Builder 2.20.1 fresh-clone CMS audit regression

### Builder

- Updated Builder Core to `1.0.2`.
- Exposed every Builder Core ACF field individually through `show_in_rest`; group-level REST exposure does not cascade to fields.
- Added non-empty admin instructions for the CTA label and CTA URL fields.
- Changed CMS template auditing to collect the official `WP_Theme::get_page_templates(null, $post_type)` inventory and validate assigned templates against it. Plugin-owned `builder-templates/*.php` templates now pass when WordPress exposes them, while genuinely unavailable templates still fail.
- Required the CMS audit payload to include the available template inventory instead of silently skipping that check.
- Corrected fresh-clone bootstrap guidance to use canonical `node wordpress-builder.mjs ...` and user-facing WordPress Builder terminology.

### Verification

- Fresh clean clone at `8ec2339`: bootstrap, dependency repair, typecheck, lint, Hostinger inventory, Starter init/check and external adoption all passed.
- Full local gate after the fix: `212/212` tests passed.
- Live external regression on `yellow-koala-142147.hostingersite.com`: Builder Core `1.0.2` installed after backup, `cms-audit` passed with five available page templates, all four ACF fields returned `show_in_rest=true` with instructions, Builder page/CPT markers still rendered, and the historical Elementor marker remained unchanged.
- Post-release clean clone of tag `v2.20.1` again passed bootstrap, typecheck, lint, 212 tests, Hostinger inventory, Starter init/check and external `cms-audit`.

## 2026-09-26 — WordPress Builder 2.20.0 free Hello Elementor compatibility E2E

### Builder

- Verified Builder Core on a live free Hello Elementor theme + free Elementor builder site.
- Confirmed historical Elementor rendering remains untouched while new Builder pages and CPTs render through Builder templates.
- Added `template assign --post-type` support for Builder CPTs such as `builder_service`.
- Added CPT support to Builder Core `template_include`.
- Switched Builder Core template registration to WordPress’ official `theme_templates` filter so page and CPT admin selectors expose plugin templates.
- Corrected external template validation to use `WP_Theme::get_page_templates(null, $post_type)`.
- Fixed Builder Core installation verification to use valid WP-CLI syntax.
- Preserved prior template values through post metadata snapshots.
- Made `builder status` inspect the live WordPress shape instead of reporting stale adoption metadata.
- Blocked generic `edit-page` writes to `_elementor_edit_mode=builder` posts because changing `post_content` would not change the rendered Elementor page.

### Skills and documentation

- Documented the compatibility model: historical page-builder pages stay on their rendering owner; new pages use Builder CPT/ACF/template architecture.
- Added a live E2E process record with environment, evidence, fixes, validation and the Elementor out-of-scope boundary.
- Updated README usage for page/CPT template assignment and the Elementor limitation.

### Verification

- Full typecheck, lint and test suite passed: 206/206 tests.
- Live verification on `yellow-koala-142147.hostingersite.com`:
  - historical Elementor marker still rendered;
  - Builder page and `builder_service` markers rendered;
  - page and CPT template selectors exposed Builder Canvas/Landing;
  - ACF field group and four editable field definitions were present with stored values;
  - generic `edit-page` safely refused an Elementor-owned historical page.

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
+
+## 2026-09-26 — WordPress Builder 2.19.1 version metadata correction
+
+- Corrected package version metadata after the Builder Core release.
+- Confirmed current main includes theme-agnostic adoption, Builder Core, external safety, account inventory and the five-skill suite.
+
+### Verification
+
+- Documentation/version metadata only; run `git diff --check`.

## 2026-09-26 — WordPress Builder 2.19.2 Builder Core template assignment fix

- Fixed assignment of plugin-owned `builder-templates/*.php` page templates on adopted sites.
- Added regression coverage for external Builder Core template assignment.

### Verification

- Full typecheck, lint and test suite passed: 204/204 tests.
