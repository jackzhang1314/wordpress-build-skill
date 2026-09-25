# WordPress Builder Skill Suite Plan

Status: initial suite and legacy migration implemented; Block/FSE adapters and source-custody promotion remain
Date: 2026-09-26  
Target baseline: v2.16.0  

## 1. Decision

The current `wordpress-builder` skill should be refactored into a small, coherent skill suite instead of remaining one large entrypoint plus many mixed-purpose references.

The suite will use **five skills**:

```text
wordpress-builder
wordpress-setup
wordpress-content
wordpress-design
wordpress-delivery
```

The word `harness` will be removed from public skill names. `wordpress-delivery` is preferred over `wordpress-harness-delivery`.

The existing executable path `harness/cli.mjs` may remain as a compatibility path for now. User-facing documentation and skill instructions should call it the **WordPress Builder CLI**, not the Harness CLI. A later non-breaking release may introduce a cleaner command entrypoint.

## 2. Goals

1. Make Codex load only the skill relevant to the current task.
2. Keep executable logic in the WordPress Builder CLI.
3. Keep skills focused on workflow, safety, validation and handoff rules.
4. Make Starter optional, not mandatory.
5. Protect existing WordPress sites from accidental Starter overwrites.
6. Preserve the coupling between design, ACF, CMS and backend editability through one shared contract.
7. Avoid excessive fragmentation and circular skill references.
8. Do not assume that a `source` project is Starter or that every external WordPress site uses classic menus and classic page templates.

## 3. Naming

| Final skill name | Purpose |
| --- | --- |
| `wordpress-builder` | Main router and global safety contract. |
| `wordpress-setup` | Environment, Hostinger connection, project creation, external-site adoption. |
| `wordpress-content` | Pages, posts, navigation, ACF, CPT/taxonomy, forms, CMS audits. |
| `wordpress-design` | Theme architecture, page templates, components, visual system, accessibility. |
| `wordpress-delivery` | Local/live checks, deployment for source projects, backup, rollback, SEO, screenshots and acceptance. |

Do not use these names:

```text
wordpress-harness
wordpress-harness-setup
wordpress-harness-content
wordpress-harness-design
wordpress-harness-delivery
```

## 4. Audit-driven prerequisites

Before references are moved, the implementation must add safety prerequisites discovered in [SKILL-SUITE-PLAN-AUDIT.md](SKILL-SUITE-PLAN-AUDIT.md):

1. Explicit project mode: `source` or `external`.
2. Source profile: `starter` or `custom`.
3. Remote WordPress shape detection: classic, block, hybrid or unknown.
4. `project inspect` for WordPress version, theme type, plugins, navigation mechanism, templates, CPT/taxonomy and forms.
5. A canonical command map with project-mode restrictions and verification requirements.
6. Skill routing tests for names, references, commands and safety rules.

These prerequisites prevent the refactor from copying Starter assumptions into supposedly generic skills.

## 5. Suite layout

```text
.agents/skills/
├── wordpress-builder/
│   ├── SKILL.md
│   └── references/
│       ├── command-map.md
│       ├── project-contract.md
│       ├── mode-safety.md
│       ├── starter-vs-existing.md
│       └── handoff-rules.md
│
├── wordpress-setup/
│   ├── SKILL.md
│   └── references/
│       ├── environment.md
│       ├── hostinger-account.md
│       ├── account-ssh-key.md
│       ├── starter-project.md
│       ├── external-adoption.md
│       └── project-agents.md
│
├── wordpress-content/
│   ├── SKILL.md
│   └── references/
│       ├── content-model.md
│       ├── acf.md
│       ├── pages-posts.md
│       ├── navigation.md
│       ├── forms.md
│       └── media.md
│
├── wordpress-design/
│   ├── SKILL.md
│   └── references/
│       ├── design-system.md
│       ├── page-architecture.md
│       ├── theme-code.md
│       ├── component-contracts.md
│       └── accessibility.md
│
└── wordpress-delivery/
    ├── SKILL.md
    └── references/
        ├── local-checks.md
        ├── deployment.md
        ├── release-verification.md
        ├── seo-acceptance.md
        ├── backup-rollback.md
        └── incident-recovery.md
```

## 6. Router behavior

`wordpress-builder/SKILL.md` is the main entrypoint.

It should answer:

```text
Is this a setup, content, design or delivery task?
Is the project mode source or external?
Is this a new Starter site or an existing WordPress site?
Which CLI commands are allowed?
What must be verified after the change?
Which skill should handle the next step?
```

Routing table:

| User intent | Load first | Possible next skill |
| --- | --- | --- |
| Install dependencies / repair machine | `wordpress-setup` | `wordpress-builder` |
| Create a new Starter site | `wordpress-setup` | `wordpress-design`, `wordpress-delivery` |
| Adopt an existing WordPress site | `wordpress-setup` | `wordpress-content`, `wordpress-delivery` |
| SSH / Hostinger key / account issue | `wordpress-setup` | `wordpress-builder` |
| Edit a page or post | `wordpress-content` | `wordpress-delivery` |
| Change navigation | `wordpress-content` | `wordpress-delivery` |
| Add or audit ACF / CMS model | `wordpress-content` | `wordpress-design` |
| Change visual style | `wordpress-design` | `wordpress-content`, `wordpress-delivery` |
| Create or modify page template | `wordpress-design` | `wordpress-content`, `wordpress-delivery` |
| Deploy a source project | `wordpress-delivery` | `wordpress-builder` |
| Roll back after failure | `wordpress-delivery` | `wordpress-builder` |
| Final acceptance / release report | `wordpress-delivery` | none |

## 7. Project modes

### Source mode

A project has controlled local source code, usually `theme/` and `plugin/`.

Allowed:

```bash
check
backup
deploy --skip-content
verify
verify-form
rollback
```

This mode may be created from Starter or from a custom local implementation.

### External mode

A project represents an existing WordPress site whose code is not owned by the local project.

Allowed:

```bash
status
backup
edit-page
post push
nav add / nav remove
template assign
cms-audit
audit-fields
credentials
verify
```

Blocked:

```bash
deploy
media
content
setup
configure-seo
```

External mode prevents the local Starter or unrelated source code from overwriting the customer's live theme, plugin or implementation.

## 8. Shared project contract

`wordpress-builder/references/project-contract.md` is the shared contract used by all skills.

Every template, component, field or navigation change must answer:

```text
Where does the data come from?
Can the owner edit it in WordPress admin?
Does it need a new or updated ACF field?
Does it change the page template or template assignment?
Does it affect navigation?
Does it affect SEO, headings or accessibility?
Is this a source project or external project?
What local and live verification is required?
What must be backed up before writing?
```

This contract is the main protection against the common failure mode: changing styling or templates without ensuring the content remains editable through ACF/CMS.

## 9. Migration map

| Current reference | Target |
| --- | --- |
| `runtime.md` | `wordpress-builder/references/command-map.md` |
| `architecture.md` | `wordpress-builder/references/project-contract.md` |
| `site-workflow.md` | `wordpress-builder` |
| `orchestration.md` | `wordpress-builder/references/handoff-rules.md` |
| `project-instructions.md` | `wordpress-setup/references/project-agents.md` |
| `plugins.md` | `wordpress-setup/references/starter-project.md` |
| `hostinger.md` | `wordpress-setup/references/hostinger-account.md`, `wordpress-delivery/references/deployment.md` |
| `content.md` | `wordpress-content/references/content-model.md` |
| `media.md` | `wordpress-content/references/media.md` |
| `classic-acf-default.md` | `wordpress-content/references/acf.md` |
| `search-quality.md` | `wordpress-content`, `wordpress-delivery/references/seo-acceptance.md` |
| `b2b-pages.md` | `wordpress-design/references/page-architecture.md` |
| `design.md` | `wordpress-design/references/design-system.md` |
| `design-classic.md` | `wordpress-design/references/design-system.md` |
| `theme-code.md` | `wordpress-design/references/theme-code.md` |
| `release.md` | `wordpress-delivery/references/release-verification.md` |
| `verification.md` | `wordpress-delivery/references/release-verification.md` |
| `seo.md` | `wordpress-delivery/references/seo-acceptance.md` |

## 10. Compatibility

Keep the existing `wordpress-builder` skill path during migration.

The refactor will also introduce the clean CLI entrypoint now, not in a later unrelated release:

```bash
node wordpress-builder.mjs --project . status
```

`wordpress-builder.mjs` will become the canonical command path. The existing path will remain as a deprecated compatibility alias:

```bash
node harness/cli.mjs --project . status
```

This avoids breaking existing projects, docs and user habits while making the new naming clear. Removing `harness/cli.mjs` should wait for a future major release after all docs, examples and project templates have been migrated.

Migration should be staged:

1. Convert `wordpress-builder` into the router.
2. Move mixed-purpose references into the four domain skills.
3. Add `wordpress-builder.mjs` as the canonical CLI entrypoint.
4. Convert `harness/cli.mjs` into a deprecated compatibility wrapper.
5. Update README, AGENTS, the WordPress Builder guide and executable examples.
6. Keep redirects from old reference names while references are still linked elsewhere.
7. Run link, command and routing regression checks.
8. Remove obsolete references and the deprecated CLI path only after the suite is stable.

## 11. Implementation phases

### Phase 1 — Router

Refactor `wordpress-builder` into the main router and add the clean CLI entrypoint.

Deliverables:

```text
wordpress-builder.mjs
wordpress-builder/SKILL.md
wordpress-builder/references/command-map.md
wordpress-builder/references/project-contract.md
wordpress-builder/references/mode-safety.md
wordpress-builder/references/starter-vs-existing.md
wordpress-builder/references/handoff-rules.md
```

### Phase 2 — Setup

Create `wordpress-setup`.

Migrate environment, Hostinger account, account-level SSH key, Starter creation and external adoption guidance.

### Phase 3 — Content

Create `wordpress-content`.

Migrate page/post operations, navigation, ACF, CPT/taxonomy, forms and media guidance.

### Phase 4 — Design

Create `wordpress-design`.

Migrate design system, page architecture, theme-code, component and accessibility guidance.

### Phase 5 — Delivery

Create `wordpress-delivery`.

Migrate local checks, deployment, release verification, SEO acceptance, backup and rollback guidance.

## 12. Validation

Before declaring the refactor complete:

1. Every skill has valid `SKILL.md` frontmatter.
2. Every referenced file exists.
3. Every referenced CLI command exists in the current WordPress Builder CLI.
4. Every skill has explicit scope, non-scope and next-step routing.
5. No skill instructs Codex to deploy an external project.
6. Starter is documented as optional.
7. Existing-site adoption is documented as a first-class workflow.
8. `npm run typecheck`, `npm run lint` and `npm test` pass.
9. A new-site Starter flow can be completed from the new skill route.
10. An existing-site adoption flow can be completed without loading Starter implementation rules.
