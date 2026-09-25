# 2026-09-25 11:00 Asia/Shanghai — Design system refactor: Precision Catalogue

## Trigger
User requested a system-level starter template and component design optimization using Product Design and frontend design guidance.

## Main work
- Completed a fresh desktop audit of home, category, product, about, contact, and blog routes.
- Fixed selectable layout shell defects: corporate homepage and standard category page now own exactly one `main.shell`.
- Introduced a calibrated technical media-placeholder system with target dimensions, engineering grid, centered frame, crosshair, and accessible label.
- Refactored core tokens into explicit color, typography, spacing, radius, container, control-height, and hairline scales; reduced hero visual weight and normalized section rhythm.
- Corrected card body layout, product/category fact ledgers, anchor navigation touch targets, specification table containment, featured blog spacing, and contact aside stickiness.
- Corrected factory metric parsing to preserve `Value | Label`; removed the duplicate proof strip directly beneath homepage stats.
- Replaced the stale design contract with a complete Precision Catalogue design system covering foundations, components, responsive rules, accessibility, WordPress/ACF binding, and QA.
- Added starter regression tests for layout shells, technical placeholders, value-first factory metrics, and homepage duplicate-proof prevention.

## Key files
- `examples/classic-b2b-starter/DESIGN.md`
- `examples/classic-b2b-starter/theme/style.css`
- `examples/classic-b2b-starter/theme/functions.php`
- `examples/classic-b2b-starter/theme/inc/components.php`
- `examples/classic-b2b-starter/theme/inc/page-data.php`
- `examples/classic-b2b-starter/plugin/starter-model.php`
- Selectable home/category templates
- `tests/starter-template.test.mjs`

## Validation
- Starter local quality gates: pass.
- Node test suite: 166/166 pass.
- Live deploy: pass; 24 routes returned 200 with one H1 and no skipped headings.
- CMS model audit: 14 checks pass.
- Editor pattern audit: pass.
- ACF field audit: 68/68 stored values editable.
- Fluent Forms browser submission: accepted; entries increased 4 → 5.
- Visual screenshots captured at 390/768/1440 for home, category, product, contact, and blog.

## Evidence
- `evidence/design-audit-current/`
- `evidence/design-audit-optimized/`
- `evidence/design-audit-final/`

Evidence remains working output and is intentionally excluded from the source commit.

## Remaining work
- Release and tag the standalone starter template package.
- Continue component-level accessibility testing with keyboard and screen-reader tools beyond screenshot/DOM checks.
