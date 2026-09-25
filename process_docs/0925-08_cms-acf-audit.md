# Backend CMS and ACF audit

- **Date/time:** 2026-09-25, 06:45 Asia/Shanghai
- **Branch/worktree:** `codex/component-starter-rebuild`
- **Trigger:** User requested a full backend CMS/ACF audit and harness sedimentation.

## Audit scope

1. CPT registration, labels, REST, public routes, archives and supports.
2. Product taxonomy registration, hierarchy, labels, REST and object attachment.
3. ACF field groups, locations, activity, labels, types, instructions and REST.
4. ACF tab organisation for large groups.
5. Post/term/option stored values versus editable ACF definitions.
6. Static front page and posts page assignment.
7. Assigned page templates.
8. Third-party Rank Math meta exclusion.

## Issues found

1. CPT labels were minimal, producing less predictable admin UI strings.
2. Taxonomy labels were minimal.
3. Several ACF fields lacked admin instructions.
4. Large ACF groups presented many fields without tabs.
5. Existing harness only had a focused post-meta `audit-fields`; it did not audit CPT/taxonomy contracts, term/option fields, REST, locations or page assignment.
6. WP post-type object did not reliably expose `supports`; the audit collector needed `get_all_post_type_supports()`.
7. Third-party Rank Math values needed exclusion from ACF orphan checks.

## Fixes and sedimentation

1. Rewrote CPT/taxonomy labels and registration options.
2. Added REST bases, map meta cap, stable rewrites and complete admin labels.
3. Added default ACF instructions and explicit field tabs for product, category and homepage groups.
4. Added `harness/lib/cms-audit.mjs` and CLI command:
   ```bash
   node harness/cli.mjs --project <project> cms-audit
   ```
5. Added tests for complete model, missing REST/labels/instructions, orphan meta and Rank Math exclusion.
6. Added `examples/classic-b2b-starter/docs/CMS-CONTENT-MODEL.md`.
7. Updated Starter AGENTS with backend CMS rules.

## Verification

- `npm run typecheck`: pass
- `npm run lint`: pass
- `npm test`: **161/161 pass**
- Starter local quality gates: pass
- Remote `cms-audit`: **pass, 14 checks, 0 problems**
- Remote `audit-fields`: **66/66 editable**
- Full live verification: **24/24 routes pass**
- Plugin deployed to verification site
