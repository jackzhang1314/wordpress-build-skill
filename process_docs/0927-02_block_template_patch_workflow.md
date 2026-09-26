# 2026-09-27 02:15（Asia/Shanghai）— Block/FSE Template Patch 安全写入方案

## 触发原因

`v2.22.0` 已能判断路由实际选中的 FSE template/template part，`v2.23.0` 已能安全更新路由引用的 `wp_navigation`。剩余的关键写入场景是：

1. 修改当前路由选中的 `wp_template`；
2. 修改当前路由选中的 template part；
3. 尤其是处理 inline Navigation block，它没有独立 `wp_navigation` post，只能修改所在 template part。

不能直接开放“任意模板全文覆盖”。第一个安全增量应是**精确片段替换**。

## 目标

新增两阶段命令：

```bash
node wordpress-builder.mjs --project . block-template plan \
  --route / \
  --part header \
  --file content/template-patch.json

node wordpress-builder.mjs --project . block-template apply \
  --plan <plan-id>
```

也可以修改当前路由选中的顶层模板：

```bash
node wordpress-builder.mjs --project . block-template plan \
  --route / \
  --template front-page \
  --file content/template-patch.json
```

输入格式：

```json
{
  "find": "<!-- wp:site-title /-->",
  "replace": "<!-- wp:site-title {"level":1} /-->",
  "verifyText": ["My Factory"]
}
```

## 安全设计

### Plan 阶段

Plan 只写本地，不写远端：

1. 读取 site URL、active theme、所有 FSE templates/parts；
2. 用 `_wp-find-template` 探测 `--route` 实际选中的 template；
3. `--part` 必须是当前 selected template 正在引用的 part；
4. `--template` 必须就是当前 selected template；
5. low confidence、missing part、invalid markup 不允许 plan；
6. `find` 必须在目标内容中唯一出现；
7. `replace` 不能等于 `find`；
8. patch 后的完整内容必须通过基本 block markup 结构校验；
9. 每个 `verifyText` 必须出现在 replacement 中；
10. plan 记录 before/after hash、source、route owner、影响面和回滚策略。

### Source custody

- 如果目标已是 `source: custom`：更新现有数据库 override；
- 如果目标是 `source: theme`：不修改 theme 文件，创建同 slug 的 Site Editor custom override；
- rollback 时：
  - existing custom 恢复 before content；
  - newly created custom 删除 override，让 theme source 重新生效。

这让 external 项目仍不部署本地 theme/plugin 代码，同时能安全处理 WordPress 原生的用户模板覆盖层。

### Apply 阶段

1. 复查 plan hash；
2. 复查 site/theme/route/template/part/hash 是否漂移；
3. 创建 restore snapshot；
4. 更新或创建 `wp_template` / `wp_template_part`;
5. 通过 WordPress `get_block_templates()` 读回；
6. 清理 cache；
7. 带 cache-busting 参数请求原始 route；
8. 验证每个 `verifyText` 出现在前台 HTML；
9. 验证失败自动 rollback，并复核 rollback hash/delete 结果；
10. 保存 receipt，不修改 immutable plan。

## 非目标

- 不修改 theme.json / global styles；
- 不修改 PHP theme 文件；
- 不支持任意全文覆盖；
- 不支持模糊/多匹配替换；
- 不解析或转换 Elementor 数据；
- 不宣称视觉质量已完成，只验证文本与路由渲染归属。

## 技术设计

新增：

```text
harness/lib/block-template.mjs
```

复用：

- `shape-diagnosis.mjs` 的模板摘要与所有权解析；
- route `_wp-find-template` 探测模式；
- immutable plan / receipt / snapshot 模式。

`shape-diagnosis.mjs` 新增纯函数：

- `validateBlockMarkup(content)`：校验 block comment 开闭结构；
- `patchBlockTemplateContent(content, find, replace)`：唯一替换并返回 hash。

远程 PHP 动作：

- `update`：更新现有 custom override；
- `create`：创建同 slug custom override；
- `rollback-update`：恢复原内容；
- `rollback-create`：删除新创建 override。

## 测试计划

新增：

```text
tests/harness/block-template.test.mjs
```

覆盖：

1. block markup 开闭校验；
2. 唯一 patch；
3. 多匹配/零匹配拒绝；
4. theme source plan 生成 create 策略；
5. custom source plan 生成 update 策略；
6. 非当前 route part 拒绝；
7. apply 创建 override 并验证前台；
8. apply 更新 override 并验证前台；
9. 前台验证失败自动 rollback；
10. newly created override rollback 后删除；
11. route/template/part/hash 漂移拒绝；
12. plan/receipt hash 不变。

## 真实 E2E 计划

使用本地一次性原生 Block/FSE WordPress：

1. custom `front-page` + custom header part；
2. 对 header part 做唯一文本 patch；
3. plan 检查 owner/source/before/after；
4. apply 后前台出现 verifyText；
5. 构造前台验证失败，确认 rollback；
6. 对 theme source part 生成 custom override，再 rollback 删除；
7. 恢复原始测试环境。

## 发布计划

- 版本：`2.24.0`
- 完整 gate：typecheck / lint / test / build
- 更新 Skill、README、HARNESS-GUIDE、HANDOFF、RELEASES
- commit、tag、push、干净 clone 复测

---

# 实施与验证记录（2026-09-27 02:35 Asia/Shanghai）

## 已实现

- 新增 `harness/lib/block-template.mjs`：
  - `block-template plan`；
  - `block-template apply`。
- `shape-diagnosis.mjs` 新增：
  - `fullContentHash()`；
  - `validateBlockMarkup()`；
  - `patchBlockTemplateContent()`。
- CLI / command map 已接入：
  - `block-template plan`：本地 plan；
  - `block-template apply`：带回滚的远端写入。
- 支持目标：
  - 当前 route 选中的顶层 `wp_template`；
  - 当前 route 选中的 template part。
- 支持来源：
  - `custom`：更新现有数据库 override；
  - `theme`：创建同 slug Site Editor custom override，不修改 theme 文件。
- 回滚：
  - existing custom 恢复 before content；
  - newly created custom 删除 override，让 theme source 恢复生效。
- 安全边界：
  - `find` 必须唯一；
  - `replace` 必须不同；
  - patched 全文必须通过 block markup 开闭校验；
  - `verifyText` 必须出现在 replacement；
  - site/theme/route/template/part/hash 漂移拒绝；
  - cache flush 和前台验证在 rollback 保护范围内；
  - 前台验证失败自动回滚；
  - plan/receipt 分离，plan hash 不变。

## 单元/集成验证

新增 `tests/harness/block-template.test.mjs`，当前 10 项全部通过：

1. block markup 开闭校验；
2. 唯一 patch 与 hash；
3. plan 精准选中 custom part 且不写远端；
4. apply 更新 custom part 并验证前台；
5. custom part 前台验证失败自动恢复；
6. completed plan 重放为 verified no-op，route owner 漂移时拒绝；
7. theme source 创建 custom override，失败后自动删除；
8. 非当前 route part 拒绝；
9. target drift 拒绝；
10. canonical command map / CLI 入口回归。

## 真实 WordPress E2E

### 1. custom template part

在本地一次性原生 Block/FSE WordPress 上验证：

- route：`/`；
- selected template：custom `front-page`；
- target：custom `header`；
- owner：`template-part:header`；
- patch：在保留 Navigation block 前追加 `Template Patch OK` 段落。

流程：

1. plan 识别 `custom -> custom`；
2. 故意让前台验证失败；
3. 自动 rollback 恢复原 header；
4. 正常 apply；
5. 原始前台 HTML 出现 `Template Patch OK`；
6. 清理后恢复原内容。

结果：

```json
{
  "pass": true,
  "rollbackWorked": true,
  "liveTextVerified": true,
  "restored": true
}
```

### 2. theme source override

继续在同一本地 WordPress 验证：

1. 临时删除 custom header，暴露 theme header；
2. 对 theme header 生成 patch plan；
3. plan 正确显示 `theme -> custom`；
4. apply 创建 custom override；
5. 前台验证故意失败；
6. 自动 rollback 删除 newly created override；
7. 恢复原有 custom header fixture。

结果：

```json
{
  "pass": true,
  "source": "theme",
  "createdAndRolledBack": true,
  "originalCustomRestoredId": 293
}
```

## 发现并修正的实现问题

- selected part plan 初版未携带 `wpId`，导致 custom override 更新找不到目标；已补齐。
- rollback existing custom 时，PHP drift 校验应使用 after hash，而不是 before hash；已修正。
- theme source create 失败后，rollback 需要定位刚创建的 custom post ID 并删除；已实现 inventory fallback。

## 真实 Hostinger canonical CLI 安全回归

在 `mediumblue-quail-505146.hostingersite.com` 上执行：

```bash
node wordpress-builder.mjs --project <site> block-template plan \\
  --route / \\
  --part footer \\
  --file content/template-patch.json
```

该 route 确实选中 footer，但提供的 `find` 不存在于 footer 原文。命令拒绝：

```text
FAIL template patch target was not found
```

验证结果：

- exit 1；
- 未生成本地 plan；
- 未写远端。

## 追加防护

- `create` 动作若在 PHP 读回阶段失败，会先删除刚创建的 override 再退出，避免 readback 异常留下 slug 被 uniquify 的孤儿 custom post。

## 发布与干净克隆复测（2026-09-27 02:26 Asia/Shanghai）

- 功能提交：`4f0c6f30ab0a87c648230ca5ee39785163b770fe`（`feat: add rollback-safe FSE template patches`）。
- 已推送 `main` 并发布 tag：`v2.24.0`。
- 从 GitHub 干净克隆 `v2.24.0` 后验证通过：
  - `node harness/bootstrap.mjs --fix`；
  - `npm run typecheck`；
  - `npm run lint`；
  - `npm test`：246/246；
  - `npm run build`；
  - `node wordpress-builder.mjs --help`。
- 干净克隆工作区保持干净（detached HEAD，无未提交文件）。
