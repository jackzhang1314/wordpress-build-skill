# Product Category Landing Page Architecture

Status: implemented for `product_collection` archives.  
Goal: make every category page a commercial landing page for high-intent B2B search demand.

## Why the category page matters

Category pages capture buyers who know the product group but have not selected a SKU:

```text
"LED high bay"           -> category page
"IP69K washdown light"   -> category page
"warehouse lighting"     -> category page
"UFO high bay 150W"      -> product page
```

A strong B2B category page must do more than list products. It must help a buyer:

1. Confirm that this range matches the application.
2. Understand selection criteria and technical ranges.
3. Check standards, documentation and compliance.
4. Compare adjacent ranges.
5. Send an RFQ with enough project context.

## Research-based principles

- Category pages target broad commercial intent; product pages target SKU-level intent.
- Copy should explain what belongs in the range, not repeat product-page text.
- Product grids must remain crawlable and close to the top.
- FAQs should answer selection, compatibility, compliance and commercial concerns.
- Industrial buyers need specifications, standards, dimensions, environmental limits and documents early.
- RFQ context should be requested beside the product range, not only on a contact page.
- Internal links to guides, adjacent categories and representative products strengthen topical authority.

## Page architecture

```text
1. Breadcrumbs
2. Category hero
   - H1
   - range introduction
   - key facts
   - primary RFQ action
   - optional hero image
3. Section navigation
4. Product grid
5. Selection guide
6. Range benefits
7. Category specifications
8. Applications and use cases
9. Standards, compliance, RFQ process and checklist
10. Related categories
11. Resources and downloads
12. Category FAQ
13. Long-form category guide
14. CTA band
15. ItemList / FAQ JSON-LD
```

## Content model

All category content is editable on the product category term screen using ACF Free-compatible fields.

| Field | Purpose |
|---|---|
| `category_overline` | Hero eyebrow |
| `category_intro` | Short range introduction |
| `category_hero_image` | Optional hero image |
| `category_key_facts` | 2–4 label/value facts |
| `category_features` | Range benefits as `Title \| Description` |
| `category_selection_guide` | Buying criteria as `Step \| Guidance` |
| `category_specifications` | Category-level `Label \| Value` ranges |
| `category_applications` | Application pills |
| `category_use_cases` | Detailed `Title \| Description` use cases |
| `category_standards` | Standards, certifications and compliance notes |
| `category_process` | RFQ process as `Step \| Description` |
| `category_checklist` | Information buyers should send |
| `category_resources` | `Label \| URL` technical resources |
| `category_faq` | `Question \| Answer` pairs |
| `category_long_description` | WYSIWYG editorial guide |
| `category_cta_*` | Final CTA copy and button label |

Term ACF values must use the qualified ACF object ID:

```php
'product_collection_' . $term_id
```

## Component layer

| Component | Responsibility |
|---|---|
| `component_category_hero` | Hero copy, key facts, image and CTAs |
| `component_anchor_nav` | Long-page section navigation |
| `component_feature_grid` | Benefits, selection guide and use cases |
| `component_spec_table` | Category-level technical ranges |
| `component_pill_list` | Applications and standards |
| `component_process_steps` | Numbered RFQ process |
| `component_check_list` | RFQ checklist |
| `component_related_category_tiles` | Adjacent category navigation |
| `component_resource_list` | Resource/download cards |
| `component_faq` | Category FAQ |
| `component_category_editorial` | Constrained WYSIWYG editorial guide |
| `component_cta_band` | Final RFQ conversion |

## SEO and schema

The template emits structured data:

- `ItemList` for crawlable representative products.
- `mainEntity` FAQ questions when category FAQ data exists.

Editorial copy is rendered in a constrained prose container so images, tables and headings remain responsive.

## Acceptance criteria

- The page has one category H1 and a visible product grid.
- The category content is unique and not copied from product pages.
- Buyers can see selection criteria, technical ranges, applications, standards and FAQ.
- Every major section is editable without changing theme code.
- Empty ACF sections do not render.
- Term ACF values are read with the qualified term object ID.
- The page passes starter checks, live route checks and responsive screenshot checks.
