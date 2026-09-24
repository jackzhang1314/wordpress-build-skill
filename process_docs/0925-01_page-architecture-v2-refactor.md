# Page Architecture v2 refactor

- **Date/time:** 2026-09-25, 02:43 Asia/Shanghai
- **Branch/worktree:** `codex/component-starter-rebuild` at `/Users/Zhuanz1/.codex/worktrees/component-starter`
- **Trigger:** User requested comprehensive refactor/implementation after the architecture review.

## Work completed

1. Added `theme/inc/page-data.php` as the page-controller layer.
2. Replaced slug-bound `page-about.php` / `page-contact.php` with assigned templates in `theme/page-templates/`, plus landing and full-width templates.
3. Refactored home, product, industry, product category, contact, about and news templates to consume normalized data/components.
4. Generalized the product ACF schema and migrated LED-specific scalar fields into demo quick specs.
5. Added homepage section show/hide/title/count controls and generic conversion-copy fields.
6. Added generic fallbacks rather than hardcoded LED business claims in the core theme.
7. Added `PAGE-ARCHITECTURE-V2.md`, refreshed component/customization docs, and added CSS contracts for new components.
8. Changed navigation seeding policy: fresh seed builds nav; normal deploy/content preserves it; explicit `--with-nav` rebuilds.
9. Added page-template, nested-template assignment, generic schema, ACF term-object and nav-policy regression gates.
10. Fixed Hero ignoring controller props.
11. Fixed ACF term seeding using bare numeric term IDs; now uses `product_collection_{id}` and cleans polluted legacy post meta.
12. Bumped harness to `2.5.0` and Starter content model to `2.2.0`; packaged Starter tarball/manifest.

## Verification

- `npm run typecheck` — pass
- `npm run lint` — pass
- `npm test` — 151/151 pass
- Starter local check — all gates pass
- Starter package — `dist/b2b-wordpress-starter-2.2.0.tar.gz`
- Deploy — [live verification site](https://aqua-termite-784698.hostingersite.com), 23/23 routes pass
- Screenshots — 39/39 templates pass (earlier full template run); final smoke 15/15 pass
- Form — browser submission accepted; Fluent Forms entries 2 → 3
- Remote field audit — 104 meta/field pairs, all admin-editable
- Visual spot-check — home desktop after final deploy passes

## Remaining / next

- Optional full 23-route screenshot regression after all UI work settles.
- Publish Starter v2.2.0 tag/release to the standalone template repository after user review.
- Merge this worktree branch only after user accepts the v2 architecture implementation.
