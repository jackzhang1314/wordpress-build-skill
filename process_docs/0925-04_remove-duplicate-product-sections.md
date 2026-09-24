# Remove duplicate product sections

- **Date/time:** 2026-09-25, 04:42 Asia/Shanghai
- **Branch/worktree:** `codex/component-starter-rebuild`
- **Trigger:** User reviewed the simplified product page and marked the Essential Product Data, At a Glance, Buying & Delivery and Customization sections as redundant.

## Changes

1. Removed four product-page sections:
   - Essential product data / Key Attributes
   - At a Glance
   - Buying & Delivery / Commercial Terms
   - Customization
2. Removed their dedicated product ACF fields so no orphan backend inputs remain:
   - `at_a_glance`
   - `product_highlights`
   - `product_trust_points`
   - `warranty`
   - `lead_time`
   - `moq`
   - `customization_note`
   - `product_shipping_terms`
   - `product_cta_note`
3. Kept `quick_specs` only for the three compact hero value chips.
4. Kept `spec_table`, `product_faq`, product details rich text, related products and CTA.
5. Removed obsolete attribute, fact and check-list component contracts/CSS.
6. Preserved category-level application pills on product-category pages.
7. Added seed cleanup for obsolete product meta and increased regression coverage against their return.
8. Bumped Starter content model to 2.4.0 and theme assets to 6.3.0.

## Verification

- `npm run typecheck`: pass
- `npm run lint`: pass
- `npm test`: **155/155 pass**
- Starter local checks: pass
- Deployment: pass
- Live routes: **23/23 pass**
- Product DOM: removed sections absent; Specifications, FAQ, Product Details and Related Products remain
- Remote field audit: **67/67 stored values have admin-editable fields**
- Product screenshots at 390 / 768 / 1440: pass

## Product page structure

```text
1. Breadcrumbs
2. Product Hero
3. Full Specifications
4. FAQ
5. Product Details
6. Related Products
7. CTA Band
```
