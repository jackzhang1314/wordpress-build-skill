# Install WordPress Official Agent Skills

One install per agent. Pick yours from the table below.

## Per-agent install

| Agent | Install command | Auto-activates? |
|---|---|:-:|
| **Claude Code** | See below | Yes |
| **Gemini CLI** | `gemini extensions install https://github.com/mralaminahamed/wordpress-official-agent-skills` | Yes (extension) |
| **Gemini CLI** | `npx skills add mralaminahamed/wordpress-official-agent-skills -a gemini-cli` | On-demand |
| **opencode** | `curl -fsSL https://raw.githubusercontent.com/mralaminahamed/wordpress-official-agent-skills/trunk/AGENTS.md > AGENTS.md` | Yes (AGENTS.md) |
| **Cursor** | Rule file (always-on) — see below | Yes |
| **Cursor** | `npx skills add mralaminahamed/wordpress-official-agent-skills -a cursor` | On-demand |
| **Windsurf** | Rule file (always-on) — see below | Yes |
| **Windsurf** | `npx skills add mralaminahamed/wordpress-official-agent-skills -a windsurf` | On-demand |
| **Cline** | Rule file (always-on) — see below | Yes |
| **Cline** | `npx skills add mralaminahamed/wordpress-official-agent-skills -a cline` | On-demand |
| **GitHub Copilot** | Rule file — see below | Yes |
| **Codex** | `npx skills add mralaminahamed/wordpress-official-agent-skills -a codex` | On-demand |
| **Continue** | `npx skills add mralaminahamed/wordpress-official-agent-skills -a continue` | On-demand |
| **Roo Code** | `npx skills add mralaminahamed/wordpress-official-agent-skills -a roo` | On-demand |
| **Augment Code** | `npx skills add mralaminahamed/wordpress-official-agent-skills -a augment` | On-demand |
| **Amp / Replit** | `npx skills add mralaminahamed/wordpress-official-agent-skills -a amp` | On-demand |
| **Warp** | `npx skills add mralaminahamed/wordpress-official-agent-skills -a warp` | On-demand |
| **Aider Desk** | `npx skills add mralaminahamed/wordpress-official-agent-skills -a aider-desk` | On-demand |
| **Block Goose** | `npx skills add mralaminahamed/wordpress-official-agent-skills -a goose` | On-demand |
| **OpenHands** | `npx skills add mralaminahamed/wordpress-official-agent-skills -a openhands` | On-demand |
| **Devin** | `npx skills add mralaminahamed/wordpress-official-agent-skills -a devin` | On-demand |
| **Kilo Code** | `npx skills add mralaminahamed/wordpress-official-agent-skills -a kilo` | On-demand |
| **Kiro CLI** | `npx skills add mralaminahamed/wordpress-official-agent-skills -a kiro-cli` | On-demand |
| **Rovo Dev** | `npx skills add mralaminahamed/wordpress-official-agent-skills -a rovodev` | On-demand |
| **Qwen Code** | `npx skills add mralaminahamed/wordpress-official-agent-skills -a qwen-code` | On-demand |
| **Trae** | `npx skills add mralaminahamed/wordpress-official-agent-skills -a trae` | On-demand |

**Always-on vs on-demand:**
- **Rule file** — loads all skill descriptions into every session (more context, always available)
- **npx skills** — injects skills only when the agent detects a matching task (less context, better for large skill sets)

For on-demand skills — say the skill name: "use wp-block-development to scaffold a new block".

---

## Claude Code

```bash
claude plugin marketplace add mralaminahamed/wordpress-official-agent-skills
claude plugin install wordpress-official-agent-skills@wordpress-official-agent-skills
```

From a local clone:

```bash
claude plugin marketplace add ~/path/to/wordpress-official-agent-skills
claude plugin install wordpress-official-agent-skills@wordpress-official-agent-skills
```

Skills activate automatically — no slash commands needed.

## Gemini CLI

As a native extension (auto-discovers all skills):

```bash
gemini extensions install https://github.com/mralaminahamed/wordpress-official-agent-skills
```

Or via npx skills (on-demand):

```bash
npx skills add mralaminahamed/wordpress-official-agent-skills -a gemini-cli
```

## Cursor / Windsurf / Cline / GitHub Copilot

**Option A — Rule file (always-on).** Drop the rule file into your repo:

```bash
# Cursor
mkdir -p .cursor/rules
curl -fsSL https://raw.githubusercontent.com/mralaminahamed/wordpress-official-agent-skills/trunk/src/rules/wordpress-official-agent-skills.md \
  > .cursor/rules/wordpress-official-agent-skills.mdc

# Windsurf
mkdir -p .windsurf/rules
curl -fsSL https://raw.githubusercontent.com/mralaminahamed/wordpress-official-agent-skills/trunk/src/rules/wordpress-official-agent-skills.md \
  > .windsurf/rules/wordpress-official-agent-skills.md

# Cline
curl -fsSL https://raw.githubusercontent.com/mralaminahamed/wordpress-official-agent-skills/trunk/src/rules/wordpress-official-agent-skills.md \
  > .clinerules/wordpress-official-agent-skills.md

# GitHub Copilot
mkdir -p .github
curl -fsSL https://raw.githubusercontent.com/mralaminahamed/wordpress-official-agent-skills/trunk/src/rules/wordpress-official-agent-skills.md \
  > .github/copilot-instructions.md
```

**Option B — npx skills (on-demand).** Installs all SKILL.md files to the agent's skills directory:

```bash
npx skills add mralaminahamed/wordpress-official-agent-skills -a cursor
npx skills add mralaminahamed/wordpress-official-agent-skills -a windsurf
npx skills add mralaminahamed/wordpress-official-agent-skills -a cline
```

## opencode / AGENTS.md-based agents (Codex, Devin, OpenHands, …)

```bash
curl -fsSL https://raw.githubusercontent.com/mralaminahamed/wordpress-official-agent-skills/trunk/AGENTS.md > AGENTS.md
```

## All other agents

```bash
npx skills add mralaminahamed/wordpress-official-agent-skills -a <agent-slug>
```

Run `npx skills add mralaminahamed/wordpress-official-agent-skills --list` to preview all skills before installing.
Run `npx skills find wordpress` to search the public skills registry.

---

## Pair with wp-dev-skills

For full WordPress plugin development coverage, install both:

```bash
claude plugin marketplace add mralaminahamed/wordpress-official-agent-skills
claude plugin marketplace add mralaminahamed/wp-dev-skills
claude plugin install wordpress-official-agent-skills@wordpress-official-agent-skills
claude plugin install wp-dev-skills@wp-dev-skills
```

| Plugin | Owns |
|---|---|
| `wordpress-official-agent-skills` | Blocks, REST API, WP-CLI, Playground, Abilities API, performance, PHPStan config, block themes, Interactivity API |
| `wp-dev-skills` | Plugin audit, release/version sync, WP.org SVN deploy, PHPStan stubs scaffold, GitHub flow, QA fixes, WooCommerce, Freemius |

---

Stuck? [Open an issue](https://github.com/mralaminahamed/wordpress-official-agent-skills/issues).
