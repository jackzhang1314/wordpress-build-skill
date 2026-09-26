# WordPress Builder Skill Suite Plan Audit

Audit date: 2026-09-26  
Scope: current WordPress Builder CLI, Starter assumptions, external-site support, current `wordpress-builder` skill and the five-skill suite proposal in [SKILL-SUITE-PLAN.md](SKILL-SUITE-PLAN.md).  
Code baseline: `v2.15.0` plus the skill-suite planning document.  

## 1. Current system inventory

### Execution layer

The executable core is still the monolithic CLI:

```bash
node harness/cli.mjs
```

It owns command dispatch, project loading and operational side effects. The main areas are:

| Area | Current capability |
| --- | --- |
| Environment | `bootstrap`, `doctor`; checks Node/npm/Git/rsync/tar/gzip, optional PHP/Docker/Chrome/Hostinger CLI. |
| Project creation | `init --from-starter`, generic `init`, and `adopt` for an existing WordPress site. |
| Hostinger / SSH | Hostinger setup, reusable account-level SSH key, SSH bootstrap, site cache, website/account discovery. |
| Source deployment | backup, plugin sync, theme/plugin rsync, WordPress/Rank Math configuration, media, content seed, cache clear, live verification, rollback. |
| External projects | live checks, status, backup, page edits with conflict detection, posts, classic navigation changes, existing classic page-template assignment, WP-CLI passthrough. |
| Audits | source quality gates, external live-site checks, CMS/ACF audits, editor-pattern audit, form verification, screenshots, SEO verification. |
| SMTP | Hostinger SMTP constants through a must-use plugin plus setup/test commands. |

The current test suite has 187 passing tests.

### Project model

`project.json` now supports:

```json
{
  "mode": "source | external",
  "theme": "active-or-local-theme-slug",
  "plugin": "local-plugin-or-external-placeholder"
}
```

`source` is the default for older project files. It means the local project owns deployable code.

`external` means WordPress already exists and the local project only manages safe remote content/configuration. `adopt` sets this mode and blocks `deploy`, `media`, `content`, `setup` and `configure-seo`.

### Starter relationship

The Starter is no longer the only workflow:

1. `init --from-starter` creates a controlled Starter source project.
2. Generic `init` creates a minimal project.
3. `adopt` manages an existing site without local theme/plugin ownership.

However, implementation still contains Starter assumptions in several places, especially local quality gates, form verification, media invariants and SMTP naming.

### Current skill

There is still one `wordpress-builder` skill with 20 references. Its entrypoint still describes an 8-phase design pipeline and Classic PHP + ACF defaults. It does not yet route setup, content, design and delivery as separate progressive workflows, and it does not lead with external-site safety.

## 2. Assessment of the five-skill proposal

### Verdict

The five-skill shape is the correct first implementation.

```text
wordpress-builder     router / global contract
wordpress-setup       environment, Hostinger, project creation, adoption
wordpress-content     content, ACF, CMS, navigation, forms
wordpress-design      theme, templates, components, visual system
wordpress-delivery    checks, deployment, release, backup, rollback
```

This is better than seven skills because the current knowledge base is only about 1,500 skill-reference lines and the primary coupling is cross-cutting rather than cleanly separable. Five skills preserve cohesive workflows while still preventing a user from loading design guidance for an SSH task.

The main improvement over the old skill is that Starter is repositioned as an optional fast path, while external adoption becomes a first-class workflow.

## 3. Findings and required plan changes

### Finding 1 — source mode still has Starter assumptions

High priority.

Current source quality gates assume more than “controlled local source”. They still hard-code several Starter expectations:

1. default route count;
2. required page templates such as About, Contact, Landing and Full Width;
3. zero-media invariants;
4. Starter component markup/CSS contracts;
5. Starter plugin defaults;
6. Starter SMTP mu-plugin naming.

This conflicts with the new principle that Starter is optional and a source project may be a custom implementation.

Required change:

Add a project source profile:

```json
{
  "sourceProfile": "starter | custom"
}
```

Behavior:

| Profile | Checks |
| --- | --- |
| `starter` | Keep the full Starter route/template/media/component contracts. |
| `custom` | Only run generic source checks: structure, syntax, secrets, user-declared routes, user-declared checks, backup/rollback and live verification. |

Existing Starter projects should be normalized to `sourceProfile: starter`.

### Finding 2 — external projects need WordPress shape/rendering adapters, not a theme restriction

High priority.

The current external workflow is strongest for classic WordPress sites:

1. navigation uses classic menus;
2. page-template assignment uses classic page-template metadata;
3. active theme and plugin discovery are reliable.

That covers the current Hostinger test sites, but not every arbitrary WordPress implementation.

Block/FSE themes can store navigation and template structure differently. Page-builder sites may store layout and styling in postmeta or builder templates. Therefore the external skill must inspect the rendering system and choose an adapter; it must not infer incompatibility merely because the site is not a Classic theme.

Required change:

Add remote shape detection to adoption and checks:

```json
{
  "wordpressShape": {
    "themeType": "classic | block | hybrid | unknown",
    "navigation": "classic-menu | block-navigation | mixed | unknown",
    "pageTemplates": "classic | fse | mixed | none | unknown"
  }
}
```

Until an adapter exists, `wordpress-content` must say:

1. classic menu navigation is supported;
2. block navigation requires inspection and may need template/part editing;
3. classic page-template assignment is supported;
4. FSE template assignment is not yet universally supported.

### Finding 3 — external mode needs a safe upgrade path for code changes

High priority.

External mode correctly blocks whole-site code deployment. But users may eventually ask to modify an existing theme template or plugin file.

The plan should not pretend that safe generic remote PHP patching is a normal external operation.

Required policy:

```text
External mode can edit content/configuration.
External mode cannot silently edit theme/plugin code.
If a code change is required, first upgrade to source custody with explicit authorization and backup.
```

Add a future command family:

```bash
wordpress-builder remote inspect
wordpress-builder remote template pull
wordpress-builder remote theme pull
wordpress-builder project promote-to-source
```

Promotion to source custody must:

1. create a full remote backup;
2. download only the explicitly authorized theme/plugin scope;
3. record checksums and source URLs;
4. set `mode: source`;
5. require live verification before further deployment;
6. preserve rollback artifacts.

### Finding 4 — the router needs remote inventory

High priority.

The router cannot reliably choose navigation/template/form rules from `project.json` alone.

Add:

```bash
wordpress-builder project inspect
```

It should report:

1. WordPress version;
2. active theme;
3. theme type;
4. active plugins;
5. navigation mechanism;
6. page templates;
7. public post types and taxonomies;
8. forms detected;
9. media/attachment count;
10. site URL and maintenance state.

This should update or emit a remote inventory section without modifying the site.

### Finding 5 — Skill routing needs a machine-checkable manifest

Medium priority.

The suite should include a manifest, but it is documentation and test data, not a runtime registry:

```json
{
  "skills": [
    {
      "name": "wordpress-builder",
      "role": "router"
    },
    {
      "name": "wordpress-setup",
      "owns": ["environment", "hostinger", "project creation", "adoption"]
    }
  ]
}
```

Add regression checks:

1. all SKILL.md files have valid frontmatter;
2. all referenced Markdown files exist;
3. all documented CLI commands exist;
4. all skills define scope, non-scope, safety and next-step routing;
5. no skill tells Codex to deploy an external project;
6. no circular mandatory handoffs exist.

### Finding 6 — current skill descriptions overlap

Medium priority.

The current `wordpress-builder` description emphasizes an 8-phase design pipeline. That makes it likely to load design guidance even for SSH, adoption or content tasks.

Each new skill needs discriminating descriptions:

| Skill | Should activate for |
| --- | --- |
| `wordpress-builder` | Any WordPress Builder task; route and safety contract. |
| `wordpress-setup` | Environment, Hostinger connection, SSH key, project creation, adoption. |
| `wordpress-content` | Pages, posts, navigation, ACF, CMS, forms. |
| `wordpress-design` | Visual system, theme/template/component changes. |
| `wordpress-delivery` | Deployment, release checks, rollback, acceptance. |

### Finding 7 — terminology migration must be staged

Medium priority.

`harness` should disappear from new public skill names, but it is still present in:

1. `harness/cli.mjs`;
2. package scripts;
3. AGENTS.md;
4. README;
5. many historical references;
6. existing user habits.

Terminology policy:

| Context | New term |
| --- | --- |
| Product / skill suite | WordPress Builder |
| Canonical executable | `wordpress-builder.mjs` |
| Internal legacy path | `harness/cli.mjs`, marked deprecated |
| Historical docs | do not mass-rewrite |

### Finding 8 — external write safety needs backup policy

Medium priority.

`edit-page` has conflict detection and `--adopt-remote`, which is good. Navigation and template assignment are surgical, but they are still live writes.

Before promoting the new skill suite, define:

1. whether writes require a prior backup;
2. what lightweight snapshot is created for content/nav/template changes;
3. how to undo a surgical external write;
4. when full `backup` is mandatory;
5. what warning is shown if the site has no recent backup.

The skill should prefer explicit user authorization for production writes and should never imply that a surgical write is risk-free.

### Finding 9 — official WordPress vendor skills must remain leaf specialists

Medium priority.

The current bundled WordPress skills include WP-CLI, Playground, block development, REST API, PHPStan, plugin development, patterns and Blueprints.

The new WordPress Builder skills should route to these only when relevant. They should not duplicate deep WordPress internals.

Example routing:

| Task | Load additionally |
| --- | --- |
| WP-CLI operation details | WP-CLI and Ops |
| block development | Block Development |
| REST API design | WP REST API |
| plugin coding standards | Plugin Development |
| Playground reproducibility | WP Playground |
| PHP static analysis | WP PHPStan |

### Finding 10 — CLI decomposition can wait, but command-map cannot

Low-to-medium priority.

`harness/cli.mjs` is a large dispatcher. Decomposing it into command modules would improve maintainability, but it should not block the Skill Suite refactor.

However, the plan must immediately create a canonical command map:

1. command name;
2. allowed project mode;
3. source/external behavior;
4. destructive risk;
5. required precheck;
6. post-write verification;
7. owning skill.

This map becomes the truth source for skill routing and tests.

## 4. Revised implementation order

### Phase 0 — audit controls before migration

1. Introduce or normalize explicit `mode` in project files.
2. Introduce `sourceProfile` for source projects.
3. Add external WordPress shape detection.
4. Add `project inspect`.
5. Create the canonical command map.
6. Add Skill Suite validation tests.

### Phase 1 — router

1. Turn `wordpress-builder` into the router.
2. Add global mode safety.
3. Add the shared project contract.
4. Add `wordpress-builder.mjs`.
5. Keep `harness/cli.mjs` as a deprecated compatibility wrapper.

### Phase 2 — setup

Create `wordpress-setup`.

Owns environment, Hostinger account, account SSH key, Starter creation and external adoption.

### Phase 3 — content

Create `wordpress-content`.

Owns pages, posts, navigation, ACF, CMS, media and forms, with explicit WordPress-shape limits.

### Phase 4 — design

Create `wordpress-design`.

Owns visual system, theme architecture, page templates and components.

### Phase 5 — delivery

Create `wordpress-delivery`.

Owns checks, source deployment, backup, release acceptance, rollback and recovery.

## 5. Updated acceptance criteria

The refactor is not complete until all of the following pass:

1. Existing Starter project passes with `mode: source` and `sourceProfile: starter`.
2. A custom source project can pass without Starter-only template/route/component assumptions.
3. An external project passes live-site checks without loading Starter quality gates.
4. External mode blocks source deployment commands.
5. A classic external site supports page edits, posts, classic navigation and classic page-template assignment.
6. A block/FSE external site is correctly detected and unsafe operations are explained rather than silently attempted.
7. `wordpress-builder.mjs` is the canonical CLI entrypoint.
8. `harness/cli.mjs` remains a tested compatibility wrapper.
9. Every documented command exists.
10. Every skill reference exists.
11. Every skill has explicit routing and non-scope.
12. Full typecheck, lint and tests pass.

## 6. Decision

Proceed with the five-skill suite, but treat it as a workflow refactor plus a compatibility refactor, not only a documentation move.

Before moving references, implement the safety prerequisite:

```text
explicit project mode
+ source profile
+ external shape detection
+ project inspect
+ canonical command map
+ skill routing tests
```

This prevents the new Skill Suite from preserving the old problem: making Starter assumptions for custom sites and giving users false confidence that every historical WordPress implementation behaves the same way.
