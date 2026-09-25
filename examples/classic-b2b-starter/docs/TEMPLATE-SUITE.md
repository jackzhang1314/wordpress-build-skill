# Template Suite & Selection

## Market research conclusion

High-performing industrial/B2B templates commonly offer multiple presentation paths instead of one fixed layout. Across ThemeForest, Webflow, Framer and Next.js catalogue products, the strongest patterns are:

- two or more homepage variants (corporate, product-led, conversion, capability-first);
- dedicated product/category catalogue pages;
- service and capability pages;
- case studies / project proof;
- resource centres for datasheets and technical guides;
- quote/request-first conversion pages;
- explicit factory, certification and QC sections;
- structured CMS ownership for products, categories, resources and case studies.

The Starter now encodes these patterns without requiring a page builder.

## Template selection model

| Content | Selection method | Templates |
|---|---|---|
| Product | WordPress `Template` selector | Standard catalogue, Technical datasheet, Application/project, Compact RFQ |
| Product category | ACF `Category layout` select | Full commercial, Catalogue-first, Conversion-first, Editorial/SEO-first |
| Static home page | ACF `Homepage layout` select | Corporate, Product-led, Conversion, Industrial capability |
| Regular page | WordPress `Template` selector | About, Contact/RFQ, Landing, Full width, Product catalogue, Factory capability, Case study, Resource center |

## Product layouts

### Standard catalogue layout

Balanced product hero, proof, specifications, FAQ, rich details, related products and CTA.

### Technical datasheet layout

Technical-hero emphasis, specification table, rich technical content and document-focused CTA.

### Application / project layout

Project context, rich application explanation, related products, factory capability and project RFQ.

### Compact RFQ layout

Minimal product data and a direct quotation flow.

## Category layouts

### Full commercial landing page

The richest default: products, selection guide, benefits, specifications, applications, factory capability, standards/process/checklist, related categories, resources, FAQ, guide and CTA.

### Catalogue-first layout

Products appear immediately after the category hero, followed by selection, specifications and FAQ.

### Conversion-first layout

Products, RFQ process, factory capability and applications lead the page.

### Editorial / SEO-first layout

The long-form category guide leads, followed by products, FAQ, factory capability and CTA.

## Homepage layouts

### Corporate / manufacturer

Balanced brand, products, industries, factory capability and knowledge.

### Product-led catalogue

Products and categories are promoted immediately.

### Conversion / RFQ first

Quotation process and product proof receive higher priority.

### Industrial capability first

Manufacturing capacity and QC lead the page.

## WordPress registration contract

Custom templates declare:

```php
/**
 * Template Name: Product: Technical
 * Template Post Type: starter_product
 */
```

WordPress then exposes them in the product editor. Category and homepage variants use validated ACF select fields and a controlled template loader.

## Harness contract

- All selectable templates must have valid headers.
- Template names/choices must exist in `template-loader.php`.
- ACF select choices and template registries must match.
- Every template file must pass PHP syntax and local quality gates.
- Every core content route must remain in the live verification manifest.
