# Fresh Clone Regression and CMS Audit Fix

- 时间：2026-09-26 19:26–19:49 CST（+08:00）
- 触发：发布前用干净 GitHub clone 验证新用户链路，发现 adopted external 站点 `cms-audit` 失败。
- 主仓库：`/Users/Zhuanz1/Documents/ChatGPT/wordpress-builder-skill`
- 干净 clone：`/tmp/wordpress-builder-fresh-clone-siwcYJ/wordpress-build-skill`
- 外部测试项目：`/tmp/wordpress-builder-fresh-clone-siwcYJ/projects/fresh-external-regression`
- 测试站：`https://yellow-koala-142147.hostingersite.com/`

## Fresh clone 结果（修复前）

干净 clone 检出 `8ec2339` 后完成：

1. `node harness/bootstrap.mjs --fix` 通过；
2. `npm run typecheck` 通过；
3. `npm run lint` 通过；
4. `npm test` 206/206 通过；
5. `sites list` 能列出 Hostinger 账号下 7 个网站；
6. `init fresh-starter-regression --from-starter` 创建成功；
7. Starter 项目 `check` 通过；
8. `adopt fresh-external-regression --domain yellow-koala-142147.hostingersite.com` 成功；
9. `project inspect` 与 `status` 通过。

同时发现两个问题：

1. bootstrap 成功后的 NEXT 指向 deprecated `harness/cli.mjs`；
2. `cms-audit` 失败。

失败项：

```text
FAIL field:wbc_subtitle — REST access is disabled
FAIL field:wbc_summary — REST access is disabled
FAIL field:wbc_cta_label — REST access is disabled
FAIL field:wbc_cta_label — admin instructions are empty
FAIL field:wbc_cta_url — REST access is disabled
FAIL field:wbc_cta_url — admin instructions are empty
FAIL page_template:builder-managed-service-page — page uses a slug-bound or unexpected template
```

## 原因

1. Builder Core 的 ACF group 设置了 `show_in_rest`，但 ACF field 级别没有逐一设置。审计读取的是每个 field 的 `show_in_rest`，因此四个字段全部判为 REST disabled。
2. `wbc_cta_label` 与 `wbc_cta_url` 缺少后台编辑说明。
3. CMS audit 的 page-template 规则硬编码 `page-templates/` 前缀。它没有调用 WordPress 官方模板清单，因此误判 Builder Core 插件模板 `builder-templates/landing.php` 是 slug-bound/unexpected template。
4. bootstrap 的成功引导保留了旧 CLI 路径，和 canonical `wordpress-builder.mjs` 规范冲突。

## 修复

1. Builder Core 升级为 `1.0.2`，四个字段全部添加 `show_in_rest => 1`，并补齐 CTA 字段 instructions。
2. CMS audit PHP payload 现在按 public post type 收集 `WP_Theme::get_page_templates(null, $type)`，返回 `pageTemplates` 清单。
3. `auditCmsModel` 用官方清单验证已分配模板；插件模板可用即通过，未知模板仍失败；缺少清单本身也失败。
4. bootstrap 输出 canonical `node wordpress-builder.mjs ...`，并把用户可见的 “Local harness” 文案改为 “WordPress Builder”。
5. 新增回归测试：
   - Builder Core 每个字段的 REST/instructions 契约；
   - Builder Core 版本一致性；
   - Builder Core 模板头与 `the_content()`；
   - 插件模板通过官方清单；
   - 不在清单中的模板失败；
   - CMS payload 缺少模板清单失败。

## 验证

本地：

```text
npm run typecheck: pass
npm run lint: pass
npm test: 212/212 pass
node harness/bootstrap.mjs: pass, NEXT uses wordpress-builder.mjs
```

线上（写入前自动创建备份 `2026-09-26T11-37-09-562Z`）：

1. Builder Core 安装/激活成功，版本 `1.0.2`；
2. `cms-audit --json` 通过，问题列表为空，page-template 清单为 5；
3. `builder status --json` 返回 plugin active、两个 CPT ready、renderingSystem hybrid；
4. 四个 ACF 字段 live 返回 `show_in_rest=true` 且 instructions 非空；
5. `page` 与 `builder_service` 的官方模板清单包含 `builder-templates/canvas.php` 和 `builder-templates/landing.php`；
6. Builder page 前台 marker、Builder CPT marker 和历史 Elementor marker 均 HTTP 200 并保持可见。

发布后再次从 GitHub 克隆 `v2.20.1`（commit `617b0e4`）到干净目录：

1. bootstrap 输出 canonical WordPress Builder 入口；
2. typecheck / lint / tests 212/212 通过；
3. `sites list` 列出 7 个网站；
4. `init fresh-starter-final --from-starter` 成功；
5. Starter `check` 通过；
6. 使用该干净 clone 对 external regression 项目运行 `cms-audit` 通过，问题列表为空。

## 经验沉淀

- `.agents/skills/wordpress-content/references/acf.md`：新增 field 级 REST 与 instructions 规则。
- `.agents/skills/wordpress-content/references/pages-posts.md`：模板分配必须按 WordPress 官方模板清单验证，不能用路径前缀猜测。
- `.agents/skills/wordpress-setup/references/builder-core.md`：记录 Builder Core 字段契约。
- `tests/harness/builder-core.test.mjs` 与 `tests/harness/cms-audit.test.mjs`：把本次失败固化为回归。

## 遗留

- 当时遗留的 remote/local 项目关联已在 `process_docs/0926-09_sites_status.md` 对应版本中实现。
- Block/FSE 形状诊断与 external-to-source custody promotion 仍未实施。
- 本次只验证 Hello Elementor 外部站和 Starter 本地检查；不做跨主机商回归。
