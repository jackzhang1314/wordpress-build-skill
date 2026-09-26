---
name: wordpress-builder
description: Route WordPress Builder tasks for new Starter sites, existing WordPress adoption, content/CMS changes, theme/template work, deployment, audits or recovery; enforce project mode and safety before execution.
---

# WordPress Builder Router

This is the main entrypoint for the WordPress Builder skill suite. It routes work to `wordpress-setup`, `wordpress-content`, `wordpress-design` or `wordpress-delivery`.

Before a write, identify:

1. Project mode: `source` or `external`.
2. Source profile: `starter` or `custom`.
3. WordPress shape: classic, block, hybrid or unknown.
4. Whether the user authorized production writes.

For unknown shape, prefer `node wordpress-builder.mjs project inspect`. For Block/FSE or hybrid routing questions, add `--route-set core` or explicit `--routes`; route ownership, not object existence, decides the safe adapter.

## Routing

| Task | Load |
| --- | --- |
| Environment, Hostinger, SSH key, new project, adoption | [wordpress-setup](../wordpress-setup/SKILL.md) |
| Pages, posts, navigation, ACF, CPT, forms, CMS audit | [wordpress-content](../wordpress-content/SKILL.md) |
| Design system, theme, page template, component, accessibility | [wordpress-design](../wordpress-design/SKILL.md) |
| Check, deploy, backup, release verification, rollback | [wordpress-delivery](../wordpress-delivery/SKILL.md) |

## Required references

- [Project contract](references/project-contract.md)
- [Mode safety](references/mode-safety.md)
- [Command map](references/command-map.md)
- [Starter versus existing](references/starter-vs-existing.md)
- [Handoff rules](references/handoff-rules.md)

## Hard safety rules

1. Starter is an optional fast path, never a requirement for existing sites.
2. `external` projects must not run `deploy`, `media`, `content`, `setup` or `configure-seo`.
3. Production writes require confirmation and a backup or rollback plan.
4. If template or plugin code must change on an external site, stop and propose a scoped source-custody upgrade.
5. After any write, use the delivery skill to verify the affected live path and data.

Return to this router when the user changes task type or when the selected skill says another discipline is required.
