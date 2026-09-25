# Official toolchain and native editor audit

- **Date/time:** 2026-09-25, 07:54 Asia/Shanghai
- **Branch/worktree:** `codex/component-starter-rebuild`
- **Trigger:** User requested deeper WordPress architecture audit, official documentation review and full use of WP-CLI/MCP/Skills.

## Findings

1. CPT and taxonomy admin labels are now complete.
2. REST is enabled on all custom content types and the product taxonomy.
3. ACF groups and fields are REST-visible and all editable fields have instructions.
4. Static home page and posts page assignments are correct.
5. The Starter intentionally uses Classic Editor because ACF owns structured fields. However, product and guide bodies lacked native editor skeleton contracts.
6. The bundled WordPress Skills were not fully integrated into project guidance. They are connector-native and useful for content/media/SEO operations on sites that expose the required abilities.
7. WordPress MCP should not be enabled blindly. The current official direction is the WordPress MCP Adapter / Abilities API; the older Automattic `wordpress-mcp` package is deprecated. Production write access should be opt-in and restricted.

## Fixes and sedimentation

1. Added `theme/inc/template-loader.php` with validated product, category and homepage template registries.
2. Added editor module pattern contract in `config/editor-block-patterns.json`.
3. Added `harness/lib/editor-audit.mjs` and CLI `editor-audit` to reject unsupported editor modules and empty/missing patterns.
4. Registered locked native editor skeletons for `starter_product` and `starter_guide`.
5. Added `WORDPRESS-TOOLCHAIN.md` documenting WP-CLI, MCP and bundled Skills decision rules.
6. Expanded local and live verification contracts.

## Verification

- `npm run typecheck`: pass
- `npm run lint`: pass
- `npm test`: **163/163 pass**
- Starter local quality gates: pass
- `editor-audit`: pass
- `cms-audit`: pass
- `audit-fields`: 66/66 editable
- Live verify: 24/24 routes pass

## Deployment and remote verification

- Plugin/theme/toolchain configuration deployed to verification site.
- Remote `cms-audit`: pass, 14 checks, 0 problems.
- Remote `editor-audit`: pass, 5 canonical patterns and allowed module contract.
- Remote `audit-fields`: pass, 68/68 stored values have editable definitions.
- Live verify: pass, 24/24 routes.
- Fixed `audit-fields` so page-level ACF locations (`page_type`, `page_template`, page post type) are included. Previously `home_template` and page template fields were false positives.
