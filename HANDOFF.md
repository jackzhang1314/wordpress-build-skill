# WordPress Builder Project Handoff

Handoff date: 2026-09-26
Handoff time: 2026-09-26 19:02 CST (+08:00)
Reason: continuation snapshot after the live free Hello Elementor compatibility E2E and WordPress Builder 2.20.0 release candidate.
Repository: <https://github.com/jackzhang1314/wordpress-build-skill>
Release branch: `main`
Current release candidate: `v2.20.0`
Pre-release baseline commit: `30aae2f809808f48e6bfd55fbe1409189e0b6ad3`
Current worktree: `/Users/Zhuanz1/Documents/ChatGPT/wordpress-builder-skill`

## 1. Read this first

The next session should treat this repository as **WordPress Builder**, not merely a Starter template generator.

The system has two distinct layers:

1. **WordPress Builder CLI**: executable operations, safety checks, deployment and verification.
2. **WordPress Builder Skill Suite**: Codex workflow guidance and progressive disclosure.

The Starter Template is only an optional fast path for new B2B sites. It must never be copied over an existing/custom WordPress site without explicit authorization, backup and a source-custody decision.

Expected state after the release commit/tag push:

```bash
git status --short --branch
## main
## (no local or remote divergence)
```

Latest tested tag:

```bash
v2.20.0
```

Full verification before handoff:

```text
typecheck: pass
lint: pass
tests: 206 / 206 pass
```

## 2. Canonical setup

Clone and inspect in this order:

```bash
git clone https://github.com/jackzhang1314/wordpress-build-skill.git
cd wordpress-build-skill

node harness/bootstrap.mjs --fix
node wordpress-builder.mjs help
node wordpress-builder.mjs sites list

npm run typecheck
npm run lint
npm test
```

Read the current truth sources in this order:

1. [README.md](README.md)
2. [AGENTS.md](AGENTS.md)
3. [HANDOFF.md](HANDOFF.md)
4. [docs/HARNESS-GUIDE.md](docs/HARNESS-GUIDE.md)
5. [docs/SKILL-SUITE-PLAN.md](docs/SKILL-SUITE-PLAN.md)
6. [docs/SKILL-SUITE-PLAN-AUDIT.md](docs/SKILL-SUITE-PLAN-AUDIT.md)
7. [.agents/skills/wordpress-builder/SKILL.md](.agents/skills/wordpress-builder/SKILL.md)

The filename `HARNESS-GUIDE.md` remains only as a historical compatibility name. New user-facing terminology is **WordPress Builder**.

## 3. Canonical CLI

The new canonical entrypoint is:

```bash
node wordpress-builder.mjs
```

The old path remains as a deprecated compatibility alias:

```bash
node harness/cli.mjs
```

Do not remove the legacy path in a normal feature release. It is still present in existing projects, docs and user habits.

Important commands:

```bash
# Account inventory
node wordpress-builder.mjs sites list

# Environment
node wordpress-builder.mjs bootstrap --fix
node wordpress-builder.mjs hostinger setup --install --connect

# Project creation
node wordpress-builder.mjs init <project-name> --root ../projects --from-starter
node wordpress-builder.mjs init <project-name> --root ../projects

# Adopt an existing WordPress site
node wordpress-builder.mjs adopt <project-name> --domain <domain> --root ../projects

# Project-level remote inspection
node wordpress-builder.mjs --project . project inspect

# Safe remote status
node wordpress-builder.mjs --project . status
node wordpress-builder.mjs --project . backup
```

## 4. Current architecture

### Project modes

```json
{
  "mode": "source | external",
  "sourceProfile": "starter | custom"
}
``+

### Source mode

The local project owns deployable theme/plugin code.

- `sourceProfile: starter` keeps the full Starter contracts.
- `sourceProfile: custom` is a controlled custom implementation and skips Starter-only assumptions.

Source mode may use:

```bash
check
backup
deploy --skip-content
deploy --with-content
media
content
setup
configure-seo
rollback
verify
```

### External mode

The local project manages an existing WordPress site but does not own its theme/plugin source.

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
project inspect
wp
```

Blocked:

```bash
deploy
media
content
setup
configure-seo
```

External writes create lightweight restore snapshots under:

```text
.backups/external-writes/
```

These are useful for surgical rollback, but they are not a replacement for a full database backup.

## 5. Skill Suite

The suite is now five skills:

```text
wordpress-builder     router / global contract
wordpress-setup       environment, Hostinger, project creation, adoption
wordpress-content     pages, posts, navigation, ACF, CMS, forms
wordpress-design      theme, templates, components, design system
wordpress-delivery    checks, deployment, release, backup, rollback
```

Router:

```text
.agents/skills/wordpress-builder/SKILL.md
```

Machine-readable manifest:

```text
.agents/skills/wordpress-builder/suite-manifest.json
```

Old `wordpress-builder/references/*.md` files are compatibility stubs pointing at the new domain skills. Do not extend those stubs.

## 6. Current deployed Hostinger sites

All seven sites are currently visible to the same connected Hostinger hosting user:

```text
u939005367
order_id: 1010058955
```

The shared account-level key is:

```text
~/.ssh/hostinger-u939005367_ed25519
```

Fingerprint:

```text
SHA256:TpFJnrS6GQq8IWMexVXFAcDeTJUUgZkbLfmMI4ISF68
```

| # | Site | Local project / context | Live URL |
| --- | --- | --- | --- |
| 1 | `mistyrose-kingfisher-381103.hostingersite.com` | `clean-chain-site` / current Starter chain | <https://mistyrose-kingfisher-381103.hostingersite.com> |
| 2 | `aqua-termite-784698.hostingersite.com` | `starter-component-verify` | <https://aqua-termite-784698.hostingersite.com> |
| 3 | `grey-salmon-695379.hostingersite.com` | `harness-cleanroom` / Your Company Industrial Supply | <https://grey-salmon-695379.hostingersite.com> |
| 4 | `violet-vulture-561066.hostingersite.com` | `IRONTRACK PARTS` | <https://violet-vulture-561066.hostingersite.com> |
| 5 | `brightdozer-482910.hostingersite.com` | `LITENG PARTS` | <https://brightdozer-482910.hostingersite.com> |
| 6 | `mediumblue-quail-505146.hostingersite.com` | adopted historical site; no original local project | <https://mediumblue-quail-505146.hostingersite.com> |
| 7 | `yellow-koala-142147.hostingersite.com` | `hello-elementor-external` / free Hello Elementor + Elementor E2E | <https://yellow-koala-142147.hostingersite.com> |

All seven have been tested over account-level SSH with WP-CLI. The current account key can operate them.

Do not interpret this as permission to deploy Starter code over every site. SSH ownership is account-level; safe code changes require the local project to own the matching source.

## 7. Current implementation status

### Completed in this session

#### Free Hello Elementor compatibility E2E

- Created a disposable Hostinger site with free Hello Elementor `3.5.1` and free Elementor `4.3.2`.
- Adopted it as `mode: external` and installed Builder Core without converting the historical page.
- Verified historical `_elementor_data` rendering, a new Builder page and a `builder_service` CPT.
- Added page/CPT template assignment, official WordPress template-selector registration, live `builder status` inspection and an Elementor write guard.
- Evidence: `/Users/Zhuanz1/Documents/ChatGPT/wordpress-projects/hello-elementor-external/evidence/hello-elementor-e2e/report.json`.

#### Account-level SSH

- Added a reusable SSH key per Hostinger hosting user.
- Default path:

```text
~/.ssh/hostinger-<hosting-user>_ed25519
```

- Added automatic SSH key bootstrap through Hostinger Files plus a temporary Cron Job.
- Added hPanel clipboard/open fallback.
- Added verified SSH host mapping because website DNS may point to a web server that differs from the SSH endpoint.
- Live-tested against the clean-chain site.

#### External adoption

- Added `adopt` as a first-class workflow.
- `adopt` records the real site URL, WordPress version, active theme, plugin list, navigation/template shape, timezone and content counts.
- Creates `mode: external`.
- Blocks source-only deployment commands to avoid Starter overwrite.

#### Project inspection

Added:

```bash
node wordpress-builder.mjs --project . project inspect
```

It reports:

1. WordPress version;
2. active theme;
3. theme type: classic, block, hybrid or unknown;
4. navigation mechanism: classic menu, block navigation, mixed or unknown;
5. page templates: classic, FSE, mixed, none or unknown;
6. active plugins;
7. public CPTs and taxonomies;
8. Fluent Forms presence;
9. published pages, posts and media count;
10. classic page-template map;
11. menus and assigned locations.

#### Source profile separation

Added:

```text
sourceProfile: starter | custom
```

Starter-only checks now run only when:

```json
{
  "sourceProfile": "starter"
}
```

Custom source projects skip Starter route/template/component/media assumptions.

#### External safety

External writes now have lightweight snapshots:

```text
.backups/external-writes/
```

Covered writes:

1. `edit-page`;
2. `post push`;
3. `nav add`;
4. `nav remove`;
5. `template assign`.

Safety rules:

1. Block-only navigation blocks classic menu writes.
2. Mixed navigation allows classic writes but warns that another rendered navigation location may exist.
3. FSE-managed templates block classic template assignment.
4. Unknown shape requires inspection.
5. Elementor-owned historical pages block generic `post_content` edits because they would not change the rendered page.
6. External projects still cannot deploy source code.

#### Skill Suite refactor

Implemented:

1. `wordpress-builder` router;
2. `wordpress-setup`;
3. `wordpress-content`;
4. `wordpress-design`;
5. `wordpress-delivery`;
6. shared project contract;
7. mode safety reference;
8. Starter versus existing policy;
9. handoff rules;
10. machine-readable manifest;
11. command map;
12. routing/reference regression tests.

Legacy references were converted to compatibility stubs.

#### Site inventory

Added:

```bash
node wordpress-builder.mjs sites list
```

Live tested against six Hostinger sites.

## 8. Project history summary

### Phase A — CMS and WordPress foundation

Process records: `process_docs/0908-*.md`

Major outcomes:

1. WordPress CMS integration;
2. draft/publish workflow;
3. media upload and rendering verification;
4. ACF/CMS model exploration;
5. CSV content import;
6. isolated project state and credential handling.

### Phase B — B2B design and architecture exploration

Process records: `process_docs/0917-*.md` through `process_docs/0919-*.md`

Major outcomes:

1. excavator/native B2B prototype;
2. design system direction;
3. comparison with other WordPress AI workflows;
4. Classic PHP + ACF direction selected over Block-first default;
5. template architecture and navigation experiments;
6. upstream WordPress Skills collected and reviewed;
7. orchestration and progressive-disclosure ideas started.

### Phase C — Harness V2 and Hostinger deployment

Process records: `process_docs/0920-*.md` and `process_docs/0921-*.md`

Major outcomes:

1. unified Harness CLI;
2. B2B Starter architecture;
3. CPT/taxonomy/ACF model;
4. Fluent Forms;
5. Rank Math Free;
6. Hostinger real deployment;
7. incremental update flow;
8. conflict detection;
9. backup and rollback;
10. remote preflight;
11. heading hierarchy gates;
12. media and binary handling;
13. live route verification.

### Phase D — Clean-room Starter and quality gates

Process records: `process_docs/0922-*.md` and `process_docs/0924-*.md`

Major outcomes:

1. Starter clone/init workflow;
2. clean-room Hostinger exercise;
3. plugin baseline;
4. local Docker/WordPress workflow;
5. componentized Starter rebuild;
6. project packaging;
7. quality gates for structure, headings, ACF, CMS, editor patterns and routes;
8. empty-site deployment and form verification;
9. experience audit and regression write-back.

### Phase E — page architecture, UI and verification refinement

Process records: `process_docs/0925-01_*` through `process_docs/0925-14_*`

Major outcomes:

1. CDP browser form verification;
2. page architecture v2;
3. product detail v2;
4. removal of low-value product modules;
5. category landing page redesign;
6. editorial blog redesign;
7. CMS/ACF audit;
8. template suite expansion;
9. design-system precision catalogue;
10. Harness/Starter consolidation;
11. SMTP mu-plugin correction;
12. guided bootstrap and SSH wizard;
13. shared hosting SSH boundary discovery;
14. guided external adoption.

### Phase F — Skill Suite and account-level operations

Process records and docs:

1. `docs/SKILL-SUITE-PLAN.md`;
2. `docs/SKILL-SUITE-PLAN-AUDIT.md`;
3. `process_docs/0926-04_skill_suite_phase0_phase1.md`;
4. `process_docs/0926-05_external_safety_and_site_inventory.md`.

Major outcomes:

1. `wordpress-builder.mjs` canonical CLI;
2. explicit `mode` and `sourceProfile`;
3. external adoption;
4. remote WordPress shape inspection;
5. five-skill suite;
6. account/site inventory;
7. external write snapshots;
8. Block/FSE safety blocks;
9. compatibility reference stubs;
10. full skill routing tests.

## 9. Verification evidence

Latest full local gate:

```bash
npm run typecheck
npm run lint
npm test
```

Result:

```text
206 / 206 tests passing
typecheck: pass
lint: pass
```

Live checks performed in this session:

1. `sites list` found seven Hostinger sites;
2. account-level SSH reached all seven WP sites;
3. WP-CLI returned WordPress 7.1.2 on each test;
4. `project inspect` worked on a live site;
5. external write safety was covered by regression tests;
6. free Hello Elementor + Elementor historical page, Builder page and Builder CPT were verified live;
7. page/CPT template selectors and the Elementor `edit-page` guard were verified live.

## 10. Known boundaries and remaining work

### 1. Block/FSE navigation and templates

Implemented:

1. shape detection;
2. safety blocks;
3. clear warnings.

Not implemented:

1. universal Block navigation editor;
2. universal FSE template editor;
3. automatic migration between classic and block navigation.

Next task:

```text
Add Block/FSE-specific inspection and, only after explicit authorization, controlled template-part/navigation editing.
```

### Historical Elementor visible editing policy

Implemented:

1. detection of `_elementor_edit_mode=builder`;
2. preservation of historical Elementor pages;
3. a pre-write guard against invisible `post_content` updates.

Out of scope by product decision:

1. reading and editing `_elementor_data`;
2. converting Elementor widgets to Builder templates;
3. an Elementor rollback-aware visual editor.

Do not plan or implement an Elementor data-writing adapter. If an old page must be visibly edited, the owner uses its native editor. If Builder should own the route, create a separate Builder-managed page and switch routing only after explicit authorization and verification.

### 2. External to source custody

External mode intentionally cannot patch arbitrary theme/plugin code.

Future commands should be added:

```bash
project promote-to-source
remote theme pull
remote plugin pull
remote template pull
```

Promotion must require:

1. explicit authorization;
2. full backup;
3. checksum recording;
4. ownership confirmation;
5. mode change to `source`;
6. live verification.

### 3. Lightweight snapshots are not full backups

External write snapshots are useful, but they are not full site backups.

For broad changes always run:

```bash
node wordpress-builder.mjs --project . backup
```

### 4. Legacy naming and paths

Canonical public term is now **WordPress Builder**.

Remaining legacy paths:

```text
harness/
harness/cli.mjs
docs/HARNESS-GUIDE.md
process_docs/*harness*.md
```

Do not mass-rename in a patch release. Migrate docs and examples gradually, and keep compatibility wrappers.

### 5. Starter-specific checks

Starter checks are now isolated by:

```json
{
  "sourceProfile": "starter"
}
```

Continue adding generic checks under `custom`, not Starter assumptions.

### 6. `sites list` local mapping

`sites list` currently inventories Hostinger websites but does not automatically map them to local `project.json` directories.

Future enhancement:

```text
Add `sites status` to correlate remote domains with local projects, modes, themes and last backup.
```

## 11. Safety rules for the next session

1. Read the project mode before any remote write.
2. `external` projects must not run source deployment.
3. Do not copy Starter over an existing/custom site.
4. Do not modify external theme/plugin PHP without explicit source-custody promotion.
5. Production writes require authorization and a backup or rollback plan.
6. Do not commit credentials, SSH private keys, SMTP passwords or customer secrets.
7. Verify original public URLs after changes.
8. Keep Starter-specific checks out of custom projects.
9. Preserve historical process docs; do not rewrite evidence.
10. Prefer canonical CLI:

```bash
node wordpress-builder.mjs
```

## 12. Immediate next-task recommendations

### Priority 1 — Block/FSE shape adapters

Goal:

1. reliably inspect `wp_navigation`;
2. inspect FSE template parts;
3. report which navigation/template locations render;
4. add safe read-only editing guidance before any write.

Acceptance:

1. works on classic, block and mixed sites;
2. never claims a change worked when only one navigation source changed;
3. includes tests for classic, block and mixed shapes.

### Priority 2 — source-custody promotion

Goal:

Allow an external site owner to authorize controlled source management.

Acceptance:

1. full backup;
2. selected theme/plugin download;
3. checksum manifest;
4. mode changes to `source`;
5. rollback remains possible;
6. live verification after promotion.

### Priority 3 — site/project correlation

Goal:

Extend `sites list` to show:

1. local project path, if found;
2. project mode;
3. source profile;
4. active theme;
5. last backup;
6. last deploy;
7. whether remote inspection is stale.

### Priority 4 — handoff regression

Goal:

Confirm a fresh clone and fresh session can complete:

```bash
node harness/bootstrap.mjs --fix
node wordpress-builder.mjs sites list
npm test
```

without undocumented local setup.

## 13. Handoff prompt for the new OpenAI session

Send the following prompt to the new session:

```text
你继续维护我现有的 WordPress Builder 项目。

仓库：
https://github.com/jackzhang1314/wordpress-build-skill

当前应使用：
branch/main: main
tag: v2.17.0

请先执行：

1. clone 或进入本仓库；
2. 按顺序阅读：
   - README.md
   - AGENTS.md
   - HANDOFF.md
   - docs/HARNESS-GUIDE.md
   - docs/SKILL-SUITE-PLAN.md
   - docs/SKILL-SUITE-PLAN-AUDIT.md
   - .agents/skills/wordpress-builder/SKILL.md
3. 运行环境检查和测试：
   - node harness/bootstrap.mjs --fix
   - node wordpress-builder.mjs sites list
   - npm run typecheck
   - npm run lint
   - npm test

当前项目基线：

- 最新实现 tag: v2.17.0
- 实施前回滚 tag: pre-skill-suite-implementation
- 当前 tests: 201/201 passing
- WordPress Builder canonical CLI: node wordpress-builder.mjs
- legacy compatibility CLI: node harness/cli.mjs

关键架构规则：

1. Starter 只是新站可选快速路径，不是唯一方案；
2. source 项目拥有本地可部署代码；
3. external 项目只允许内容、导航、模板分配、备份和审计；
4. external 禁止 deploy/media/content/setup/configure-seo；
5. external 的 theme/plugin 代码变更必须先走显式 source-custody promotion；
6. sourceProfile 是 starter 或 custom，不能把 Starter 质量门强加给 custom 项目；
7. 生产写入前必须有备份或回滚方案；
8. 修改后必须验证原始公网 URL 和业务数据；
9. 不得提交密码、SSH private key、SMTP password 或客户 secret；
10. 所有可复用工作流优先沉淀到 WordPress Builder Skill Suite。

当前账号级 SSH key 已配置，可访问同一 Hostinger hosting user 下的站点；不要重新生成或覆盖，除非我明确要求。

第一个开发任务是：

1. 先复测当前基线；
2. 然后实现 Block/FSE shape adapter：可靠识别 wp_navigation、FSE template parts、classic menu 和 mixed navigation；
3. 先只做只读检查和明确报告，不做未经授权的前台写入；
4. 为 classic/block/mixed 三种形态添加回归测试；
5. 完成后再讨论 external-to-source promotion。

不要删除历史文档；不要在没有备份和授权的情况下修改生产站点。
```
