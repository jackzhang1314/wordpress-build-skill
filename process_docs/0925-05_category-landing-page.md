# Product category landing page implementation

- **Date/time:** 2026-09-25, 05:22 Asia/Shanghai
- **Branch/worktree:** `codex/component-starter-rebuild`
- **Trigger:** User requested a deeply optimized B2B product category page for precise search traffic.

## Research conclusion

Category pages capture broad commercial-intent queries before a buyer selects a SKU. For industrial B2B, the page must combine a crawlable product grid with technical selection data, compliance evidence, RFQ guidance, internal links and category-specific editorial content.

## Implementation

1. Rebuilt `taxonomy-product_collection.php` as a category landing page.
2. Added a category hero with H1, intro, key facts, optional image and RFQ CTA.
3. Added sticky anchor navigation.
4. Kept the crawlable product grid immediately after the hero.
5. Added selection guide, benefits, category specifications, applications, use cases, standards, RFQ process, checklist, related categories, resources, FAQ and WYSIWYG editorial guide.
6. Added ItemList and FAQ structured data.
7. Added rich category ACF fields and demo content for all four categories.
8. Fixed ACF term reads to use `product_collection_{term_id}`.
9. Fixed the `lines()` page-data helper so it respects the supplied ACF source; previously it checked the source but parsed the current/global object.
10. Added category architecture and ACF regression tests.
11. Bumped Starter content model to 2.5.0 and theme assets to 6.4.0.

## Verification

- `npm run typecheck`: pass
- `npm run lint`: pass
- `npm test`: **156/156 pass**
- Starter local checks: pass
- Deployment: pass
- Live routes: **23/23 pass**
- Live industrial category DOM:
  - 2 products in grid
  - 6 selection criteria
  - 6 category specifications
  - 6 applications
  - 6 standards
  - 4 process steps
  - 5 RFQ checklist items
  - 3 related categories
  - 3 resources
  - 4 FAQs
  - ItemList JSON-LD present
- Full-page screenshot captured.
