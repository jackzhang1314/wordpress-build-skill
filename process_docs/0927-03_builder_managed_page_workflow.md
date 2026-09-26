# 2026-09-27 02:45（Asia/Shanghai）— Builder-managed 新页面工作流方案

## 触发原因

用户确认了核心产品边界：

1. 新建网站默认使用 Classic PHP Starter；
2. 已有第三方编辑器页面（Elementor/Divi/Bricks 等）不修改私有数据；
3. 老站新增内容时应使用 Builder Core 的独立内容层；
4. 第三方编辑器控制的导航/页头由用户在原编辑器维护。

当前 Builder Core 已提供 CPT、ACF 和插件模板，但“新建 Builder-managed 页面”的流程仍分散在：

```bash
builder install
post push
template assign
```

缺少一个面向用户故事的完整入口，也缺少统一 drift 检查、字段写入、模板绑定、前台验证和回滚。

## 目标

新增两阶段命令：

```bash
node wordpress-builder.mjs --project . builder page plan --file content/builder-page.json
node wordpress-builder.mjs --project . builder page apply --plan <plan-id>
```

## 输入契约

```json
{
  "type": "builder_project",
  "title": "Custom Excavator Solutions",
  "slug": "custom-excavator-solutions",
  "status": "publish",
  "template": "builder-templates/landing.php",
  "content": "<section><h2>Factory capability</h2><p>...</p></section>",
  "fields": {
    "wbc_subtitle": "OEM excavator attachments",
    "wbc_summary": "Custom buckets and quick couplers for export buyers.",
    "wbc_cta_label": "Request a quote",
    "wbc_cta_url": "https://example.com/contact/"
  },
  "verifyText": ["Custom Excavator Solutions", "Factory capability"]
}
```

规则：

1. `type` 只允许 `builder_project` / `builder_service`；
2. `template` 只允许 Builder Core plugin-owned 模板；
3. ACF 字段只允许 Builder Core 四个已定义字段；
4. `verifyText` 为 1-5 个必须在 live HTML 出现的文本；
5. 不允许提交 `_elementor_data`、Divi、Bricks 等第三方编辑器字段。

## Plan 阶段

Plan 只写本地：

1. 验证 Builder Core plugin active；
2. 验证 Builder CPT 已注册；
3. 验证 plugin template 出现在 WordPress 官方模板清单；
4. 读取当前同 slug Builder CPT 对象；
5. 保存 prior content/title/excerpt/status/template/ACF fields；
6. 保存 desired 状态与 hash；
7. 保存 live verifyText；
8. 输出 create/update 动作。

## Apply 阶段

1. 复查 plan hash；
2. 复查 Builder Core/CPT/template；
3. 复查 target 是否发生 drift；
4. 写入前创建 snapshot；
5. 一个远程 PHP action 同时写入：
   - post title/content/excerpt/status；
   - `_wp_page_template`;
   - ACF whitelist fields；
6. 读回 post/template/fields/hash；
7. 清理 cache；
8. 请求 `get_permalink()` 返回的原始 URL；
9. 验证 verifyText；
10. 失败自动 rollback：
    - existing post 恢复 prior 状态；
    - new post 删除；
11. 保存 receipt，不修改 immutable plan。

## 非目标

- 不修改 Elementor/Divi/Bricks 历史页面；
- 不把 Builder 页面转换成第三方编辑器页面；
- 不修改主题 header/footer；
- 不自动改导航；
- 不做通用 ACF字段导入。

## 测试计划

新增 `tests/harness/builder-page.test.mjs`：

1. 输入契约校验；
2. plugin/CPT/template preflight；
3. plan 本地写入且不改远端；
4. create apply 写入 post/template/fields；
5. update apply 替换内容和字段；
6. 前台验证失败自动恢复 existing；
7. 前台验证失败自动删除 newly created；
8. plan 后 drift 拒绝；
9. third-party editor payload 拒绝；
10. canonical CLI/command-map 集成。

## 发布计划

- 版本：`2.25.0`
- 完整 gate：typecheck / lint / test / build
- 更新 Skill、README、HARNESS-GUIDE、HANDOFF、RELEASES
- commit、tag、push、干净 clone 复测

---

# 实施与验证记录（2026-09-27 02:55 Asia/Shanghai）

## 已实现

- 新增 `harness/lib/builder-page.mjs`：
  - `builder page plan`；
  - `builder page apply`。
- CLI / command map 已接入：
  - `builder page plan`：本地 plan；
  - `builder page apply`：带回滚的远端写入。
- 输入只允许：
  - `builder_project` / `builder_service`；
  - Builder Core plugin-owned templates；
  - Builder Core 四个 ACF 字段；
  - 1-5 个 live verifyText。
- 显式拒绝 `_elementor_data`、Elementor/Divi/Bricks 等第三方编辑器字段。
- Plan 保存 prior/desired、字段、模板、verifyText 和 hash。
- Apply 复查 Builder Core、CPT、模板、site URL、target drift。
- Apply 一个远程 action 写入：
  - title；
  - slug；
  - status；
  - excerpt；
  - content；
  - `_wp_page_template`;
  - ACF whitelist fields。
- 读回后清 cache，访问 `get_permalink()` URL 并验证文本。
- 前台验证失败自动 rollback：
  - existing post 恢复 prior；
  - new post 删除。
- 保存 receipt，不修改 immutable plan。

## 单元/集成验证

新增 `tests/harness/builder-page.test.mjs`，8 项全部通过：

1. plan 本地-only；
2. create 写入 post/template/fields；
3. new post 前台失败自动删除；
4. existing post 前台失败自动恢复；
5. plan 后 drift 拒绝；
6. third-party editor payload 拒绝；
7. unknown ACF field 拒绝；
8. canonical CLI / command map 回归。

## 真实 Hostinger / Elementor 站 E2E

站点：

```text
yellow-koala-142147.hostingersite.com
```

项目：

```text
/Users/Zhuanz1/Documents/ChatGPT/wordpress-projects/hello-elementor-external
```

站点形态：

```text
external
Hello Elementor + Elementor
Builder Core active
builder_project / builder_service registered
```

流程：

1. `builder status` 确认 Builder Core active；
2. `builder page plan` 生成 create plan；
3. 目标为 `builder_project:builder-managed-e2e`;
4. 模板为 `builder-templates/landing.php`;
5. `builder page apply` 创建 post id 12；
6. live URL 验证 HTTP 200；
7. 以下文本均在前台出现：
   - `Builder Managed E2E`;
   - `Builder Managed Capability`;
   - `Parallel Builder content layer`;
8. 远端 meta 回读确认：
   - `_wp_page_template`;
   - `wbc_subtitle`;
   - `wbc_summary`;
   - `wbc_cta_label`;
   - `wbc_cta_url`。

公网结果：

```text
https://yellow-koala-142147.hostingersite.com/builder-projects/builder-managed-e2e/
```

历史 Elementor 页面未被转换或覆盖；Builder page 是并行新增内容层。

## 追加真实复放回归

- 首次真实 apply 后再次执行同一 plan，初版误判为 manual drift。
- 原因：create plan 的 prior 是“不存在”，复放时目标已经存在且等于 desired。
- 修正：
  - apply 先识别 already-applied 状态；
  - title/slug/status/excerpt/content/template/fields 全部匹配时执行 verified no-op；
  - 只有不是 desired 状态时才执行 prior hash drift 检查。
- 真实 Hostinger 复放结果：
  - action `noop`;
  - HTTP 200;
  - 三个 verifyText 全部再次验证通过。
