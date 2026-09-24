# Product Detail Page Plan v2

Status: planning document for the next product-page refactor.  
Scope: `single-starter_product.php`, product ACF fields, page data, components, seed data, CSS, harness gates and deployment verification.

## 1. Goal

Rebuild the product page as a clean international B2B catalogue page with an Alibaba-style free-form details section at the bottom.

The page must answer four questions in order:

1. **What does the product look like?**
2. **What is it and where is it used?**
3. **Can I verify the technical and commercial details?**
4. **How do I request pricing?**

It must remain a reusable Starter page, not an LED-only or Alibaba-cloned layout.

## 2. Architecture Fit

The feature uses the existing Page Architecture v2 stack:

```text
WordPress template hierarchy
  -> single-starter_product.php
  -> Starter\Theme\product_data()
  -> normalized product array
  -> presentation components
  -> CSS component/token layer
```

### What does not change

- Product route remains `/products/{slug}/`.
- Product content type remains `starter_product`.
- Product categories remain `product_collection`.
- Fluent Forms remains the RFQ engine.
- The Starter remains compatible with ACF Free.
- No real images ship inside the theme.
- No product-specific business copy is hardcoded into templates.

## 3. Page Information Architecture

### 3.1 Screen 1 — Product Hero

The first screen must stay simple. It should not contain the full specification table, MOQ, lead time, warranty, FAQ or back link.

```text
Breadcrumb
Home / Products / {category} / {product}

┌──────────────────────────────┐  ┌──────────────────────────────┐
│ Product gallery              │  │ Category chip                │
│                              │  │ Product title                │
│ Main image                   │  │ Short description / excerpt  │
│ Thumbnails 1–5               │  │                              │
│                              │  │ 2–4 compact value chips      │
│                              │  │                              │
│                              │  │ Primary RFQ button           │
│                              │  │ Response promise             │
└──────────────────────────────┘  └──────────────────────────────┘
```

Hero owns only four jobs:

```text
Look at the product.
Understand what it is.
See whether it is relevant.
Start an enquiry.
```

### 3.2 Screen 2 — Key attributes and at-a-glance value

This is the compact buyer-qualification section.

```text
Key attributes
 Capacity / wattage or equivalent
 Efficiency or performance value
 Protection / durability value
 Reference / model code

At a glance
 Three or four short buyer-facing claims
```

This section must be editable and generic. LED words such as wattage, efficacy and IP rating must not become fixed Starter labels.

### 3.3 Screen 3 — Commercial facts

```text
Warranty
MOQ
Lead time
Customization
Shipping terms / trade terms
```

The values come from ACF. Empty fields are hidden.

### 3.4 Middle sections — Technical confidence

```text
Full specifications
Applications
Documents & downloads
FAQ
```

These sections remain structured because buyers need predictable, copyable data.

### 3.5 Bottom section — Rich-text product details

This is the Alibaba-style free-form section.

```text
Product details

Paragraphs
Headings
Images
Captions
Tables
Lists
Video embeds
Application notes
Factory / packaging / certification images
```

It uses the WordPress product main content editor, not a new ACF textarea.

```php
<?php if (trim((string) get_the_content()) !== '') : ?>
    <section class="product-details">
        <?php Starter\Theme\component_section_heading([
            'eyebrow' => 'Details',
            'title' => 'Product details',
        ]); ?>

        <article class="prose rich-description">
            <?php the_content(); ?>
        </article>
    </section>
<?php endif; ?>
```

The exact heading can remain a neutral UI label in the template. The editable content lives in the main WordPress editor.

### 3.6 Footer conversion sections

```text
Related products
CTA band
```

The bottom CTA is the final conversion opportunity after long-form details.

## 4. Target Section Order

```text
1. Breadcrumbs
2. Product hero
   - gallery
   - category
   - title
   - short description
   - compact value chips
   - primary RFQ button
3. Key attributes
4. At a glance
5. Commercial facts
6. Full specifications
7. Applications
8. Documents & downloads
9. FAQ
10. Product details
    ← WordPress main rich-text content
11. Related products
12. CTA band
```

## 5. Component Plan

### 5.1 New or upgraded components

| Component | Responsibility | Inputs |
|---|---|---|
| `component_product_gallery` | Main image, thumbnails, captions, placeholder fallback | `images`, `title`, `aspect` |
| `component_product_hero_summary` | Category, H1, excerpt, value chips, primary CTA | `category`, `title`, `description`, `value_chips`, `cta` |
| `component_attribute_grid` | Four to six compact key attributes | `rows` |
| `component_check_list` | At-a-glance claims | existing component |
| `component_fact_strip` | Warranty, MOQ, lead time, customization | existing/upgraded component |
| `component_spec_table` | Full structured specifications | existing component |
| `component_pill_list` | Applications | existing component |
| `component_document_list` | Downloadable or named documents | `rows` |
| `component_faq` | Product FAQ | existing component |
| `component_rich_description` | Safe, constrained prose wrapper for main content | current post content |
| `component_related_products` | Manual IDs first, automatic fallback | existing/upgraded component |
| `component_cta_band` | Final RFQ call to action | existing component |

### 5.2 Component rules

- Templates call `product_data()` and pass normalized props into components.
- Components do not read ACF fields directly.
- Components hide themselves when required input arrays are empty.
- Components must not contain product-specific business claims.
- Placeholder media must show realistic dimension/ratio labels, not stock artwork or fake photos.
- The main content wrapper must constrain editor output so pasted images and tables remain responsive.

## 6. Data and Editing Model

### 6.1 Existing fields retained

| Field | Used by |
|---|---|
| `product_highlights` | Hero value chips or at-a-glance claims |
| `quick_specs` | Key attributes |
| `spec_table` | Full specifications |
| `product_applications` | Applications |
| `product_documents` | Documents & downloads |
| `warranty` | Commercial facts |
| `lead_time` | Commercial facts |
| `moq` | Commercial facts |
| `customization_note` | Commercial facts |
| `product_cta_note` | Hero or final CTA helper text |
| `product_cta_label` | Primary RFQ button label |
| `product_trust_points` | Optional fallback/at-a-glance claims |
| `related_products` | Manual related products |

### 6.2 New gallery fields

ACF Free does not provide the PRO Gallery/repeater experience. For Starter compatibility, use fixed image slots:

```text
product_gallery_1
product_gallery_2
product_gallery_3
product_gallery_4
product_gallery_5
```

Rules:

- Each field is an ACF `image` field using the Media Library.
- `product_gallery_1` becomes the first gallery image when present.
- The featured image remains the canonical card/archive image and is also accepted as a fallback for slot 1.
- Empty slots are hidden.
- If no images exist, the component renders one neutral `1200 × 900 · 4:3` placeholder.
- This can later migrate to an ACF PRO Gallery field without changing the component contract.

### 6.3 New editable support fields

| Field name | Type | Purpose |
|---|---|---|
| `product_details_title` | Text | Optional override for the bottom section heading |
| `product_shipping_terms` | Text | Optional trade/shipping terms, e.g. FOB / CIF / EXW |
| `at_a_glance` | Textarea | Three or four short buyer-facing claims, one per line |

Existing `product_highlights` and `product_trust_points` should be consolidated visually so the page does not show two duplicate-looking claim lists. The preferred admin field for public claims is `at_a_glance`; the other fields remain for backward compatibility.

### 6.4 Rich-text content ownership

| Content type | Where edited |
|---|---|
| Short hero description | Product excerpt |
| Structured specs and facts | ACF fields |
| Free-form product details | WordPress main content editor |
| Related products | ACF relationship/post-object field |
| SEO title/description | Rank Math |

The Classic Editor is the intended editing interface. Admin instructions should say:

> Use the main editor for the bottom “Product details” section. You can add long descriptions, images, tables, captions and videos here.

## 7. Product Data Controller

Extend `theme/inc/page-data.php` with one normalized return shape:

```php
return [
    'gallery' => [
        ['id' => 12, 'url' => '...', 'alt' => '...', 'caption' => '...'],
    ],
    'title' => '...',
    'category' => [...],
    'excerpt' => '...',
    'value_chips' => [...],
    'cta' => [
        'label' => '...',
        'note' => '...',
        'url' => '...',
    ],
    'key_attributes' => [...],
    'at_a_glance' => [...],
    'commercial_facts' => [...],
    'specifications' => [...],
    'applications' => [...],
    'documents' => [...],
    'faq' => [...],
    'details' => [
        'title' => 'Product details',
        'has_content' => true,
    ],
    'related_ids' => [...],
];
```

Implementation notes:

- `product_data()` remains the single product controller.
- The controller resolves gallery fallbacks and empty slots.
- The controller converts line-based ACF textarea values into arrays.
- The controller resolves related products to IDs.
- The template no longer calls scattered ACF helpers directly.

## 8. Front-End Layout

### 8.1 Desktop

```text
Hero: two columns, roughly 7/5 or 8/4
Gallery left, summary right
Right column should not become a long scrolling data dump

Key attributes: two-column grid
At a glance: compact checklist
Commercial facts: full-width four-column strip
Specifications: constrained table
Applications: pills or cards
Documents: named download cards
FAQ: collapsed rows
Product details: constrained prose container
Related products: three-card grid
CTA band: final full-width conversion module
```

### 8.2 Mobile

Order:

```text
Gallery
Category
Title
Short description
Primary CTA
Key attributes
At a glance
Commercial facts
Specifications
Applications
Documents
FAQ
Product details
Related products
CTA band
```

A mobile sticky RFQ button may be added after the layout is stable. It should be hidden on desktop.

## 9. Rich-Text Rendering Rules

The bottom editor is intentionally flexible, but visual output must be constrained.

CSS must handle:

```text
h2 / h3 rhythm
paragraph width
image max-width
image border radius
figcaption spacing
table overflow-x
table border rhythm
ul / ol spacing
blockquote styling
iframe/video responsive height
caption alignment
avoid editor-generated inline colors from breaking the design system
```

Recommended wrapper:

```text
.rich-description
.rich-description img
.rich-description figure
.rich-description table
.rich-description iframe
```

Do not use arbitrary inline width values as a design contract. WordPress-generated width attributes may exist, but CSS should ensure media never overflows the container.

## 10. Seed and Demo Strategy

The Starter must keep zero shipped media.

Seed rules:

1. Remove the incorrect `Reference: 22,500 lm` style data.
2. `Reference` should only ever contain a model/SKU code or be omitted.
3. Do not attach real product photos during Starter deployment.
4. Leave ACF gallery slots empty for a fresh Starter.
5. Render a neutral placeholder gallery when no images exist.
6. Provide demo structured content, such as specs, applications and documents, from `site-data.json`.
7. The demo rich-text editor content may contain short HTML text, but should not depend on remote images.

## 11. Harness and Quality Gates

Existing gates must continue passing:

```text
structure
heading hierarchy
content data
secret scan
component duplication
zero media
ACF binding
page template contract
route count
WordPress class qualification
UI component contracts
PHP syntax
```

New checks to add:

| Check | Purpose |
|---|---|
| Product hero is minimal | Prevent specs, MOQ and back links from returning to the first screen |
| Gallery component contract | Ensure images, empty slots and placeholder fallback are handled consistently |
| Rich description renders `the_content()` | Ensure the main editor remains the source for bottom details |
| Product details section order | Ensure the rich-text section appears after structured technical sections |
| Generic schema remains generic | Prevent LED-specific fields from becoming core fields |
| Empty-section hiding | Ensure sections with no ACF data do not render empty headings |

Remote verification should include:

```bash
node harness/cli.mjs --project <project> verify
node harness/cli.mjs --project <project> verify --screenshots --mode templates
node harness/cli.mjs --project <project> verify-form --route /contact/
```

Manual visual checks should cover:

```text
desktop hero
tablet hero
mobile hero
empty gallery
one image
multiple images
long specification table
rich text with images
rich text with tables
rich text with video embed
```

## 12. Implementation Plan

### Phase 1 — Data contract

1. Add gallery and supporting ACF fields.
2. Update ACF binding tests.
3. Extend `product_data()` with the normalized product shape.
4. Resolve gallery fallbacks and empty slots.

### Phase 2 — Components

1. Add `component_product_gallery`.
2. Add or upgrade hero summary component.
3. Upgrade fact/document/rich-description presentation.
4. Keep components prop-driven and empty-state-safe.

### Phase 3 — Product template

1. Rebuild `single-starter_product.php` in the target order.
2. Move the main editor content to the bottom `Product details` section.
3. Remove hero duplication and the unnecessary back link.
4. Keep breadcrumbs as the only navigation-recovery module.

### Phase 4 — CSS

1. Add responsive gallery styles.
2. Refine the hero grid and CTA hierarchy.
3. Add commercial fact and key attribute layouts.
4. Add robust prose styles for editor output.
5. Ensure all tables and media are responsive.

### Phase 5 — Seed migration

1. Correct product demo data.
2. Ensure legacy scalar fields stay removed.
3. Leave gallery fields empty in the zero-media Starter.
4. Add safe demo rich-text content without remote media.

### Phase 6 — Verification and deployment

1. Run all local gates.
2. Deploy theme/plugin with content seed.
3. Preserve navigation unless `--with-nav` is explicitly requested.
4. Verify all product routes.
5. Capture template screenshots.
6. Submit a real RFQ through the browser.
7. Audit stored ACF/meta values.

## 13. Acceptance Criteria

The feature is complete only when all statements are true:

1. The first screen shows gallery, category, title, short description, minimal value chips and primary RFQ action only.
2. Full specs, MOQ, warranty, lead time, FAQ and back links are absent from the first screen.
3. The product gallery supports multiple images and degrades to a neutral placeholder when empty.
4. ACF Free users can upload gallery images without depending on ACF PRO repeaters or gallery fields.
5. Structured technical and commercial data remain backend-editable.
6. The bottom free-form details section is edited through the WordPress main content editor.
7. Pasted images, captions, tables and video embeds do not break the responsive layout.
8. Empty sections do not render empty headings.
9. No LED-specific wording becomes a generic Starter schema requirement.
10. Navigation is not rebuilt by a normal deploy.
11. Local quality gates and all harness tests pass.
12. The live verification site passes route, screenshot, form-submission and ACF-field audits.

## 14. Risks and Controls

| Risk | Control |
|---|---|
| ACF Free lacks a true gallery/repeater | Use fixed image slots now and preserve a stable component contract for later PRO migration |
| Rich-text content can break layout | Render only through a constrained prose wrapper with media/table CSS |
| Editors duplicate hero copy and bottom details | Document that the excerpt is short hero copy while the main editor is long-form details |
| Product page becomes lighting-specific again | Keep all schema names generic and move industry values into seed content |
| Too many modules return to the first screen | Add a harness/test check enforcing the minimal hero contract |
| Empty structured sections create noise | Components hide when input rows are empty |

## 15. Recommended First Implementation Slice

Implement in one coherent, testable slice:

```text
1. Add gallery fields.
2. Extend product_data().
3. Add gallery and rich-description components.
4. Rebuild single product template.
5. Add CSS.
6. Update seed/tests.
7. Deploy to the verification site.
```

Do not introduce tabs, a custom page builder or ACF PRO dependency in this slice.
