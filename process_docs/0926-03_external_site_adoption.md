# 0926-03 External Site Adoption

- Time: 2026-09-26 04:07 CST (+08:00)
- Trigger: make explicit that Starter is optional and prevent Harness source deployment from overwriting arbitrary historical WordPress sites.

## Changes

- Added project `mode: source | external`; existing projects default to `source`.
- Added `harness/cli.mjs adopt <name> --domain <domain>` to create a remote-only project for an existing WordPress implementation.
- Adoption configures the reusable Hostinger account key, then records the live site URL, WordPress version, active theme, plugin list and timezone.
- External mode permits precise remote operations (`edit-page`, `post push`, `nav`, `template assign`, `backup`, `status`, audits) and blocks `deploy`, `media`, `content`, `setup`, and `configure-seo`.
- External `template assign` validates that the template already exists on the remote theme, has a Template Name, and renders `the_content` before assigning it.
- External `check` runs live site checks (WP-CLI, active theme, plugins, homepage) instead of Starter local gates.
- Added a per-user verified SSH host map because website DNS may point at the web server rather than the SSH endpoint.

## Real Validation

- Adopted `mediumblue-quail-505146.hostingersite.com` as an external project. It reported active theme `b2b-equipment`, WordPress 7.1.2 and nine plugins.
- External `check` passed all four live checks.
- `status` reported the site as `HONGDA` with active ACF, Fluent Forms, site-model and Rank Math.
- `deploy --skip-content` was correctly blocked.
- Account key had already passed navigation and theme-file write tests on all six Hostinger sites; all test artifacts were removed.

## Regression

- Full gate after changes: typecheck, lint, `npm test` — 187/187 passed.
