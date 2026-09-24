# Core Template Information Architecture

Status: implemented for the Starter verification build.  
Purpose: keep every core page focused on the same B2B buyer sequence while avoiding duplicate modules.

## Buyer sequence

Every core template should move a buyer through five questions:

```text
1. What do you offer?
2. Is this relevant to my application?
3. Can I trust your factory and quality system?
4. Can I compare the technical and commercial details?
5. What is the next action?
```

## Core proof layer

A reusable factory proof system is injected into high-intent pages:

```text
component_factory_strip
component_factory_capability
```

The proof layer uses global ACF option data:

- `factory_stats`
- `factory_capabilities`
- `factory_certifications`
- `factory_process`
- `factory_quality_tests`
- `factory_markets`
- `factory_intro`

It is intentionally modular. A page can show the compact proof strip without repeating the full manufacturing module.

## Template rules

### Home

```text
Hero
Stats
Factory proof strip
Product categories
Featured products
Industries
Manufacturing capability
Knowledge
CTA
```

Purpose: route buyers quickly by category, sector and knowledge, while proving factory capability.

### Product category

```text
Hero
Factory proof strip
Anchor navigation
Products
Selection guide
Benefits
Specifications
Applications / use cases
Manufacturing capability
Standards / RFQ process / checklist
Related categories
Resources
FAQ
Category guide
CTA
```

Purpose: rank for category intent, support selection and drive qualified RFQs.

### Product detail

```text
Hero
Factory proof strip
Specifications
FAQ
Rich product details
Related products
CTA
```

Purpose: keep the SKU page focused after the earlier simplification; factory proof remains present without repeating commercial modules.

### About

```text
Hero
Stats
Company story
Capabilities
Manufacturing and quality control
Knowledge
CTA
```

Purpose: provide deeper company evidence for buyers who have moved beyond product discovery.

### Contact / RFQ

```text
Hero
Contact paths
RFQ checklist
Direct lines
Form
What happens next
Factory proof strip
Knowledge
```

Purpose: reduce RFQ uncertainty and reinforce response, quality and factory credibility.

## Global factory data fields

| Field | Purpose |
|---|---|
| `factory_intro` | Short manufacturing positioning |
| `factory_stats` | Compact proof metrics |
| `factory_capabilities` | Reusable capability cards |
| `factory_certifications` | Standards and certifications |
| `factory_process` | Production process steps |
| `factory_quality_tests` | QC checks |
| `factory_markets` | Export market summary |

## Acceptance criteria

- Core pages expose factory proof without inventing content.
- Empty global factory fields do not render empty modules.
- Product pages remain simplified and do not reintroduce removed commercial modules.
- Category pages remain rich but do not duplicate the same proof block more than once.
- Every proof point is editable through ACF.
