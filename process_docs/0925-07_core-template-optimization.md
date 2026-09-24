# Core template optimization

- **Date/time:** 2026-09-25, 06:18 Asia/Shanghai
- **Branch/worktree:** `codex/component-starter-rebuild`
- **Trigger:** User requested continued optimisation of core page templates with stronger B2B information architecture and factory proof.

## Research applied

1. Clear B2B value proposition and product/specification paths.
2. Trust signals: certifications, production capability, export markets, QC and social proof.
3. Guided paths for technical buyers.
4. Contact/RFQ pages should explain response time, next steps and required information.
5. Manufacturing About pages should cover credentials, history, facility, certifications and capability.

## Changes

1. Added a global factory profile data controller.
2. Added ACF Free fields:
   - `factory_certifications`
   - `factory_process`
   - `factory_quality_tests`
   - `factory_markets`
3. Added reusable components:
   - `component_factory_strip`
   - `component_factory_capability`
4. Injected compact factory proof into Home, Category and Product pages.
5. Injected full Manufacturing & QC capability into Home, Category, About and Contact.
6. Rebuilt About and Contact core architecture:
   - About now has hero, stats, story, capabilities, manufacturing/QC, knowledge and CTA.
   - Contact now has routing paths, RFQ form, checklist, direct lines, next steps, factory proof and guides.
7. Added seed data for global factory proof and quality process.
8. Improved core CSS for proof strips, capability grids, quality panels, About and Contact routing.

## Verification

- `npm run typecheck`: pass
- `npm run lint`: pass
- `npm test`: **157/157 pass**
- Starter local quality gates: pass

## Live verification

- Deployment: pass
- Live routes: **24/24 pass**
- Factory proof present on Home, Product Category, Product Detail, About and Contact
- Full Manufacturing & QC module present on Home, Category, About and Contact
- Remote ACF audit: **66/66 stored values have admin-editable fields**
- Core responsive screenshots at 390 and 1440: pass
- Removed an About-only duplicate capability section after visual review.
