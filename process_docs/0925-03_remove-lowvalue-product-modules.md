# Remove low-value product modules

- **Date/time:** 2026-09-25, 04:23 Asia/Shanghai
- **Branch/worktree:** `codex/component-starter-rebuild`
- **Trigger:** User reviewed Product Detail v2 and identified product-only Applications and Documents modules as redundant.

## Changes

1. Removed the Typical Applications section from the product template.
2. Removed the Documents & Downloads section and its no-link document cards.
3. Removed `product_applications` and `product_documents` from the generic product ACF schema and demo seed.
4. Preserved category-level application content because it remains useful on product-category pages.
5. Removed obsolete document-list component and CSS.
6. Updated Page Architecture and Product Detail plan documents.
7. Added regression coverage so these modules cannot return in the product template/schema.
8. Bumped Starter content model to 2.3.1 and theme assets to 6.2.1.

## Harness correction

A deployment initially failed because the legacy “Remote blank media” gate counted owner-uploaded media in the Media Library. This violated the intent of the zero-media contract, which is to prevent the Starter from shipping/importing media, not to forbid users from uploading media later.

The gate is now:

- “Harness-managed media”
- Audits only IDs recorded in `content/media-map.json`
- Automatically passes with zero harness-managed imports for a zero-source Starter
- Continues to fail if a configured/imported media ID appears unexpectedly

## Verification

- `npm run typecheck`, `npm run lint`, `npm test`: **155/155 pass**
- Starter local checks: pass
- Deployment: pass after corrected media contract
- Live routes: **23/23 pass**
- Product page no longer contains “Typical applications” or “Documents & downloads”
- Product Details and Related Products remain in the correct order
- Remote field audit: **121/121 stored values have admin-editable fields**
- Product screenshots at 390 / 768 / 1440: pass
