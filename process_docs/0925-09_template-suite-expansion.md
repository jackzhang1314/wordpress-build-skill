# Starter template suite expansion

- **Date/time:** 2026-09-25, 07:22 Asia/Shanghai
- **Branch/worktree:** `codex/component-starter-rebuild`
- **Trigger:** User requested deep research into high-selling B2B/factory starters and expansion of selectable template types.

## Research sources

1. ThemeForest industrial/factory WordPress themes and bestseller listings.
2. Envato Tuts+ industrial WordPress theme showcase.
3. Webflow industrial templates including Manufactt and Industro.
4. Framer/Webflow SaaS and B2B landing template patterns.
5. Manufacturing site guidance around specifications, catalogs, downloads, case studies, RFQs and certifications.

## Research patterns adopted

1. Multiple homepage variants.
2. Multiple product presentation layouts.
3. Category pages as selectable commercial layouts.
4. Dedicated factory capability page.
5. Product catalogue page.
6. Case-study page.
7. Resource-centre page.
8. Controlled template registry instead of unstructured page-builder output.

## Implementation

1. Added `theme/inc/template-loader.php` with validated registries and renderers.
2. Added four product layouts selectable through the WordPress product template selector and ACF Product layout field.
3. Added four category layouts controlled by Category layout ACF select.
4. Added four homepage variants controlled by Homepage layout ACF select.
5. Added Product catalogue, Factory capability, Case study and Resource center page templates.
6. Moved current product/category/home implementations into stable partials.
7. Added template registry, ACF choice and architecture regression tests.

## Verification

- `npm run typecheck`: pass
- `npm run lint`: pass
- `npm test`: **161/161 pass**
- Starter local quality gates: pass

## Deployment regression and verification

Initial deployment exposed a double-main-query defect: template renderers owned the loop while product/home partials repeated it. The Home route returned 500 and the harness automatically restored pre-deploy files. The architecture was corrected so only renderers own the loop; layout partials consume context only. A harness regression test now prevents partials from calling `have_posts()`.

Final verification:

- `npm run typecheck`: pass
- `npm run lint`: pass
- `npm test`: **162/162 pass**
- Starter local quality gates: pass
- Deployment after fix: pass
- Live routes: **24/24 pass**
- Template-choice smoke test:
  - Product `technical` layout rendered its document CTA.
  - Category `conversion` layout rendered RFQ process.
  - Home `conversion` layout rendered quotation process.
  - Reverted to Standard/Corporate defaults after test.
- Core page screenshots at 390 and 1440: pass.
