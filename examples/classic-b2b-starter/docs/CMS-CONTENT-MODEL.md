# CMS Content Model & Governance

Status: active content contract for the B2B Starter.  
Goal: keep the WordPress admin predictable, every displayed value editable, and every edit location discoverable.

## Core content types

| Type | Purpose | Admin owner |
|---|---|---|
| `page` | Site pages and assigned page templates | Page editor + template-specific ACF |
| `starter_product` | SKU/product catalogue entries | Product editor + Product content ACF |
| `product_collection` | Product category landing pages | Product category term editor + Category content ACF |
| `starter_industry` | Industry solution landing content | Industry editor + Industry details ACF |
| `starter_guide` | B2B technical guides | Guide editor + archive/global copy |
| `post` | Company news and editorial articles | Post editor + Classic Editor body |
| Fluent Forms | RFQ submissions and notifications | Fluent Forms |

## Registration contract

Every public content type must register:

- a public route or archive;
- REST access;
- complete admin labels (`name`, `singular_name`, `menu_name`, `all_items`, `edit_item`, `add_new_item`, `search_items`);
- predictable rewrites without `with_front`;
- revisions, thumbnail, editor, excerpt and custom-fields support where relevant;
- `map_meta_cap: true`.

The product category taxonomy is hierarchical, REST-enabled, public, attached only to products, and exposed in the admin list.

## ACF editing contract

- Local ACF fields are defined in `plugin/starter-model.php`.
- Every displayed business value has one admin-editable field.
- Every non-tab ACF field has a label and admin instructions.
- Every non-tab ACF field is REST-enabled.
- Every field group has a valid edit location.
- Terms are written and read with the qualified ACF object ID:
  `product_collection_{$term_id}`.
- ACF tabs are used to organise large field groups, but tabs never store values.
- ACF Free is the baseline: no repeaters, no flexible content and no ACF PRO gallery.

## Current field groups

| Group | Location | Purpose |
|---|---|---|
| Product content | `starter_product` | Gallery, specifications, FAQ, details, related products |
| Category content | `product_collection` | Category hero, facts, selection guide, specs, applications, use cases, standards, process, checklist, resources, FAQ, editorial guide and CTA |
| Industry details | `starter_industry` | Challenge, outcome and CTA |
| Homepage content & sections | Front page | Hero, section visibility/titles/counts and CTA |
| Landing page content | Landing template | Campaign copy, feature rows and CTA |
| Factory profile | Factory profile option page | Factory proof, capabilities, certifications, process, QC and export markets |
| Site copy & conversion | Site copy option page | Archive descriptions, response promise, About CTA |
| Contact page content | Contact template | Contact intro, checklist, form title and form note |

## Stored-value rule

A value displayed on the frontend must have a matching ACF field definition. Third-party fields such as Rank Math are excluded from the ACF editable-value audit.

## Audit commands

```bash
node harness/cli.mjs --project <project> cms-audit
node harness/cli.mjs --project <project> audit-fields
node harness/cli.mjs --project <project> verify
```

`cms-audit` checks:

- expected CPTs and taxonomies exist;
- public and REST registration;
- admin labels;
- required supports;
- ACF group locations and activity;
- labels, instructions, types and REST on every editable field;
- orphan post meta and term meta;
- static front page/posts page assignment;
- unexpected page templates.

`audit-fields` performs the focused legacy post-meta audit.

## Frontend/backend contract

A template may not hardcode a business claim if it changes per company or product. It should read through `page-data.php` or another controller. Generic labels such as “Specifications” may live in templates. Company-specific values such as “ISO 9001”, “3 production lines” or “40,000 pcs / month” must come from ACF/Customizer.
