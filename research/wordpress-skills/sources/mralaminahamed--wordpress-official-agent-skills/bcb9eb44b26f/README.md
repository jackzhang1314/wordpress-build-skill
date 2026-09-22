# WordPress Official Agent Skills

Expert-level WordPress knowledge for AI coding agents — Claude Code, Gemini CLI, Cursor, Windsurf, Cline, Codex, GitHub Copilot, opencode, and more.

Skills covering blocks, themes, REST API, WP-CLI, performance, PHPStan, Playground, Interactivity API, Abilities API, and more. Skills activate automatically when their description matches your task.

> **Mirror of** [WordPress/agent-skills](https://github.com/WordPress/agent-skills) · GPL-2.0-or-later  
> Original upstream documentation: [README.upstream.md](README.upstream.md)

---

<p align="center">
  <a href="#skills">Skills</a> •
  <a href="#install">Install</a> •
  <a href="./INSTALL.md">Full install guide</a> •
  <a href="./CONTRIBUTING.md">Contributing</a>
</p>

---

## Skills

| Skill | Activates when |
|---|---|
| **blueprint** | Creating, editing, or reviewing WordPress Playground blueprint JSON files; setting up demo environments. |
| **wordpress-router** | Classifying a WordPress repo (plugin/theme/blocks/WP core) and routing to the correct workflow or skill. |
| **wp-abilities-api** | Working with the WordPress Abilities API: `wp_register_ability`, categories, REST exposure, permissions. |
| **wp-abilities-audit** | Auditing a plugin's REST surface and proposing standardized Abilities API registrations. |
| **wp-abilities-verify** | Verifying Abilities API registrations: enumerate abilities, check callbacks, validate permissions and schemas. |
| **wp-block-development** | Developing Gutenberg blocks: `block.json`, attributes, dynamic rendering, deprecations, `@wordpress/scripts`. |
| **wp-block-themes** | Developing WordPress block themes: `theme.json`, templates, patterns, style variations, Site Editor. |
| **wp-interactivity-api** | Building or debugging Interactivity API: `data-wp-*` directives, store/state/actions, `viewScriptModule`. |
| **wp-performance** | Investigating or improving WordPress performance: profiling, query optimization, object caching, cron, HTTP API. |
| **wp-phpstan** | Configuring, running, or fixing PHPStan static analysis in WordPress projects. |
| **wp-playground** | WordPress Playground workflows: disposable WP instances, blueprints, `@wp-playground/cli`, debugging. |
| **wp-plugin-development** | Developing WordPress plugins: hooks, activation, admin UI, Settings API, security, release packaging. |
| **wp-plugin-directory-guidelines** | GPL compliance, WP.org plugin directory guidelines, rejection reasons, naming/trademark rules. |
| **wp-project-triage** | Deterministic inspection of a WordPress repository; structured JSON report for workflow guidance. |
| **wp-rest-api** | Building or extending WordPress REST API: `register_rest_route`, controllers, schema, auth, CPT exposure. |
| **wp-wpcli-and-ops** | WP-CLI operations: search-replace, db management, plugin/theme/user/content, cron, multisite, automation. |
| **wpds** | Building UIs with the WordPress Design System: components, tokens, patterns. |

## Install

### Claude Code

```bash
claude plugin marketplace add mralaminahamed/wordpress-official-agent-skills
claude plugin install wordpress-official-agent-skills@wordpress-official-agent-skills
```

### Gemini CLI

```bash
gemini extensions install https://github.com/mralaminahamed/wordpress-official-agent-skills
```

### Cursor / Windsurf / Cline / GitHub Copilot

```bash
# Cursor
mkdir -p .cursor/rules && curl -fsSL https://raw.githubusercontent.com/mralaminahamed/wordpress-official-agent-skills/trunk/src/rules/wordpress-official-agent-skills.md > .cursor/rules/wordpress-official-agent-skills.mdc

# Windsurf
mkdir -p .windsurf/rules && curl -fsSL https://raw.githubusercontent.com/mralaminahamed/wordpress-official-agent-skills/trunk/src/rules/wordpress-official-agent-skills.md > .windsurf/rules/wordpress-official-agent-skills.md

# Cline
curl -fsSL https://raw.githubusercontent.com/mralaminahamed/wordpress-official-agent-skills/trunk/src/rules/wordpress-official-agent-skills.md > .clinerules/wordpress-official-agent-skills.md

# GitHub Copilot
curl -fsSL https://raw.githubusercontent.com/mralaminahamed/wordpress-official-agent-skills/trunk/src/rules/wordpress-official-agent-skills.md > .github/copilot-instructions.md
```

### opencode / AGENTS.md-based agents

```bash
curl -fsSL https://raw.githubusercontent.com/mralaminahamed/wordpress-official-agent-skills/trunk/AGENTS.md > AGENTS.md
```

### All other agents (Continue, Roo, Augment, Amp, Warp, …)

```bash
npx skills add mralaminahamed/wordpress-official-agent-skills -a <agent-slug>
```

Full per-agent install matrix and options → [**INSTALL.md**](./INSTALL.md).

### Pair with wp-dev-skills

These two plugins are designed to coexist without trigger conflicts:

```bash
claude plugin marketplace add mralaminahamed/wordpress-official-agent-skills
claude plugin marketplace add mralaminahamed/wp-dev-skills
claude plugin install wordpress-official-agent-skills@wordpress-official-agent-skills
claude plugin install wp-dev-skills@wp-dev-skills
```

| Plugin | Owns |
|---|---|
| `wordpress-official-agent-skills` | Blocks, REST API, WP-CLI, Playground, Abilities API, performance, PHPStan config, block themes, Interactivity API |
| `wp-dev-skills` | Plugin audit, release/version sync, WP.org SVN deploy, PHPStan stubs scaffold, GitHub contribution flow, QA fixes |

Boundaries are documented in each plugin's skill trigger descriptions — no ambiguous overlaps.

---

## Included Skills (17)

| Skill | What it covers |
|---|---|
| `wordpress-router` | Classifies WP repos and routes to the right skill automatically |
| `wp-project-triage` | Detects project type, tooling, and WP/PHP versions |
| `wp-plugin-development` | Plugin architecture, hooks, Settings API, security (nonces/caps/escaping/SQL) |
| `wp-plugin-directory-guidelines` | Authoritative review of 18 WP.org Plugin Directory guidelines (GPL, naming, trialware) |
| `wp-block-development` | Gutenberg blocks: `block.json`, attributes, rendering, deprecations |
| `wp-block-themes` | Block themes: `theme.json`, templates, patterns, style variations |
| `wp-interactivity-api` | Frontend interactivity with `data-wp-*` directives and stores |
| `wp-rest-api` | REST routes/endpoints, schema, auth, response shaping |
| `wp-abilities-api` | Capability-based permissions and REST API authentication |
| `wp-abilities-audit` | Audit a plugin's REST surface; propose Abilities API registrations |
| `wp-abilities-verify` | Verify Abilities API registrations against declared annotations |
| `wp-wpcli-and-ops` | WP-CLI commands, automation, multisite, search-replace |
| `wp-performance` | Profiling, caching, DB optimization, Server-Timing |
| `wp-phpstan` | PHPStan config (`phpstan.neon`), baselines, WP-specific type stubs |
| `wp-playground` | WordPress Playground — instant local environments |
| `blueprint` | Playground Blueprints for declarative environment setup |
| `wpds` | WordPress Design System |

---

## How skills activate

Claude Code auto-discovers every `SKILL.md` under `skills/`. Skills activate based on task context matching their `description` field — no manual invocation needed for most workflows. For explicit invocation in another skill or agent, reference by name (e.g. `wp-plugin-development`).

---

## Upstream sync

Skills stay current via a scheduled GitHub Actions workflow that runs every Monday:

- Diffs `skills/` and `shared/` against [WordPress/agent-skills](https://github.com/WordPress/agent-skills) trunk
- Opens a PR if anything changed, with a checklist to verify no new conflicts with `wp-dev-skills`
- `README.upstream.md` is also refreshed from upstream on each sync

To trigger manually:

1. Go to **Actions → Sync Upstream Skills**
2. Click **Run workflow**
3. Optional: enable **Dry run** to preview changes without opening a PR

---

## Repo layout

```
wordpress-official-agent-skills/
├── .claude-plugin/
│   ├── plugin.json              # Claude Code plugin manifest
│   └── marketplace.json         # Claude Code marketplace manifest
├── .codex/
│   ├── config.toml              # Codex CLI features
│   └── hooks.json               # Codex SessionStart hook
├── src/rules/
│   └── wordpress-official-agent-skills.md  # Rule file for Cursor/Windsurf/Cline/Copilot
├── .github/
│   ├── copilot-instructions.md  # GitHub Copilot rule file
│   └── workflows/               # CI and upstream sync
├── AGENTS.md                    # Universal context (opencode, Codex, Devin, …)
├── GEMINI.md                    # Gemini CLI context
├── gemini-extension.json        # Gemini CLI extension manifest
├── package.json                 # npm metadata for npx skills
├── INSTALL.md                   # Full per-agent install matrix
├── skills/                      # 17 skill directories (auto-discovered)
│   ├── wp-plugin-development/
│   │   ├── SKILL.md
│   │   ├── references/
│   │   └── scripts/
│   └── ...
├── shared/                      # Shared references (WP versions, Gutenberg mapping)
└── README.upstream.md           # Original WordPress/agent-skills README (auto-synced)
```

---

## Contributing

Bug fixes and improvements to the Claude Code plugin layer (manifest, sync workflow, this README) go here.

For skill content improvements — corrections to WordPress patterns, new skill topics, updated references — contribute upstream at [WordPress/agent-skills](https://github.com/WordPress/agent-skills/blob/trunk/CONTRIBUTING.md). Changes flow back here automatically on the next Monday sync.
