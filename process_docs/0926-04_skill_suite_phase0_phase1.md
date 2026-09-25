# 0926-04 Skill Suite Phase 0/1

- Time: 2026-09-26 05:56 CST (+08:00)
- Trigger: implement the audited WordPress Builder Skill Suite prerequisites and router.

## Implemented

- Added canonical `wordpress-builder.mjs` entrypoint; retained `harness/cli.mjs` as compatibility path.
- Added `sourceProfile: starter | custom` with compatibility normalization for legacy Starter projects.
- Added `project inspect` for live WordPress version, active theme, theme type, navigation mechanism, page templates, plugins, public CPT/taxonomy, Fluent Forms and content/media counts.
- Added remote shape detection for classic, block, hybrid and unknown WordPress implementations.
- Added machine-readable command ownership and risk classification.
- Added custom-source quality profile so Starter route/template/component contracts only run for `sourceProfile: starter`.
- Created the five-skill suite and router manifest:
  `wordpress-builder`, `wordpress-setup`, `wordpress-content`, `wordpress-design`, `wordpress-delivery`.
- Updated docs to use `wordpress-builder.mjs` and documented source profiles, external limits and inspection.

## Validation

- Live `project inspect --json` verified against `mistyrose-kingfisher-381103.hostingersite.com`.
- Full gate after implementation: typecheck, lint and `npm test` — 193/193 tests.

## Remaining

- Complete the staged migration/removal of old `wordpress-builder/references` copies.
- Add deeper Block/FSE navigation and template adapters.
- Add source-custody pull/promotion commands for authorized external code changes.
- Add targeted external-write snapshots for navigation and template assignments.
