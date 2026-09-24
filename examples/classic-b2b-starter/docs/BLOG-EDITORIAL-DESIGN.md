# Blog & Article Editorial Design

Status: implemented for the WordPress post archive and single posts.  
Goal: create a people-first editorial system that supports Google page experience, E-E-A-T, readable long-form content and B2B conversion.

## Research principles applied

### Google page experience

Google's page-experience guidance asks whether pages have good Core Web Vitals, are secure, work on mobile, avoid intrusive interstitials and clearly distinguish main content from supporting content. The blog system therefore uses:

- a restrained 1240px page frame;
- a 76ch article measure;
- stable aspect-ratio media;
- no popups or sticky interruptions;
- high-contrast text and visible focus states;
- no heavy third-party blog dependencies.

Source: Google Search Central, “Understanding page experience in Google Search results”.

### Helpful, people-first content

Google's people-first guidance emphasises a clear audience, first-hand expertise, bylines where expected, clear sourcing and a satisfying answer to the reader's task. The article template now has:

- a visible author byline;
- publish and modified dates;
- category context;
- reading time;
- an author box;
- related updates;
- a relevant product/contact CTA.

Source: Google Search Central, “Creating helpful, reliable, people-first content”.

### Article structured data

Google recommends Article properties including author, `datePublished` and `dateModified` in ISO 8601 format. Single posts now emit `BlogPosting` JSON-LD with:

- `headline`;
- `description`;
- `image` when available;
- `datePublished`;
- `dateModified`;
- `author`;
- `publisher`;
- `mainEntityOfPage`;
- `inLanguage`.

Source: Google Search Central, “Article structured data”.

## Archive information architecture

```text
1. Blog hero
   - purpose
   - audience
   - short description
2. Category filter
3. Featured lead article
4. Compact article grid
5. Pagination
```

The lead article uses a larger two-column card. Subsequent articles remain scannable in a consistent grid.

## Single-article information architecture

```text
1. Breadcrumbs
2. Category and article title
3. Short leader / summary
4. Author byline
5. Published, updated and reading time
6. Featured image and caption
7. Optional table of contents
8. Main article body
9. Topics/tags
10. Author box
11. Previous / next
12. Related updates
13. Product / contact CTA
14. BlogPosting JSON-LD
```

## Reading design rules

- Main article copy is capped near 76 characters per line.
- Body text uses 17px/1.75 desktop and 16px/1.7 mobile.
- H2 and H3 headings have stable anchor IDs.
- A table of contents appears when there are at least three H2/H3 headings.
- Images, captions, tables, blockquotes, lists and embeds have explicit responsive styles.
- Modified date is shown only after a significant one-day difference, while accurate modified data remains in schema.
- The primary action is quiet and contextual, not a popup.

## Harness contracts

- `/news/` is part of the 24-route verification manifest.
- Blog templates must include an editorial archive component.
- Single posts must include reading time, author, TOC support, `BlogPosting` schema and related/CTA structure.
- Page experience is checked through live routes, responsive screenshots and DOM checks.
