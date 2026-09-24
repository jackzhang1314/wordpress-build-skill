# Product Detail Page v2 implementation

- **Date/time:** 2026-09-25, 03:46 Asia/Shanghai
- **Branch/worktree:** `codex/component-starter-rebuild`
- **Trigger:** User approved the Product Detail Page v2 plan and requested implementation.

## Work completed

1. Added five ACF Free image slots for the product gallery.
2. Added `at_a_glance`, `product_faq`, `product_shipping_terms`, and `product_details_title` fields.
3. Extended `product_data()` into a normalized product controller.
4. Added gallery, hero summary, attribute grid, fact strip, document list and rich-description component contracts.
5. Rebuilt `single-starter_product.php` with the approved section order.
6. Moved the WordPress main content editor to the bottom “Product details” section.
7. Added responsive gallery, hero, attribute, fact, document and rich-text CSS.
8. Corrected the demo `Reference: 22,500 lm` data error and removed fake reference rows.
9. Added tests enforcing the minimal hero, section order, ACF Free gallery slots and seed field coverage.
10. Bumped the Starter content model to 2.3.0 and theme assets to 6.2.0.

## Lessons / harness sedimentation

- A controller running inside the Loop cannot rely on `get_the_content()` before later `the_content()` processing; use `get_post_field('post_content', $post_id)` for the has-content decision.
- Rich-text output is intentionally not re-sanitized through `wp_kses_post()` because that can remove embed markup; the content wrapper constrains styling instead.
- Seed loops must list every new ACF field explicitly; missing field coverage is caught by a remote field-count audit.

## Verification

- `npm run typecheck`: pass
- `npm run lint`: pass
- `npm test`: **155/155 pass**
- `starter check`: pass
- Deploy: [verification site](https://aqua-termite-784698.hostingersite.com)
- Live routes: **23/23 pass**
- Remote blank media: **0**
- Product screenshots at 390 / 768 / 1440: **3/3 pass**
- Browser DOM audit: product details section confirmed after structured sections and before related products
- RFQ browser submission: Fluent Forms entries **3 → 4**
- Field audit: **128/128 stored values have admin-editable fields**

## Remaining

- Sync this implementation into the published standalone template repository after review.
- Add a real multi-image browser interaction test when a verification product has multiple uploaded gallery images.
