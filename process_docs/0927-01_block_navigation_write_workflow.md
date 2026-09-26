# 2026-09-27 00:45（Asia/Shanghai）— Block Navigation 安全写入工作流方案

## 触发原因

`v2.22.0` 已能可靠判断某个路由的导航归属。下一步的自然增量是把**只读诊断**变成**可回滚的受控写入**，但不能直接放开所有 Block/FSE 模板编辑。

选择第一个写入对象为 `wp_navigation` post：

1. 它是 WordPress 官方的 Navigation block 数据对象；
2. 不需要修改 theme 文件或 template part 代码；
3. 修改会影响所有引用该导航的模板，因此必须先由路由诊断证明当前 route 的 owner；
4. 适合作为 Block/FSE 写入的第一条安全通道。

## 目标

新增两阶段命令：

```bash
node wordpress-builder.mjs --project . nav block plan \
  --route / \
  --file content/block-nav.json \
  [--navigation <wp_navigation-id>]

node wordpress-builder.mjs --project . nav block apply \
  --plan <plan-id>
```

输入文件格式：

```json
{
  "links": [
    {"label": "Home", "path": "/"},
    {"label": "Products", "path": "/products/"}
  ]
}
```

### Plan 阶段

Plan 只写本地忽略目录，不写 WordPress：

1. 读取真实 `siteurl`、active stylesheet、FSE templates/parts、`wp_navigation` posts；
2. 用 `_wp-find-template` 探测 `--route` 实际选中的 template；
3. 解析 template → template part → `wp_navigation` 所有权；
4. 只允许修改当前 route 正在引用的 `wp_navigation`；
5. 多个候选导航时必须显式传 `--navigation`；
6. inline Navigation block 没有 `wp_navigation` ref 时拒绝，不伪装成可编辑；
7. 只允许替换扁平 `wp:navigation-link` 列表；
8. 子菜单、锁定区块、自定义 block、空内容一律拒绝；
9. 计算影响面：哪些 template/template part 引用该导航；
10. 保存 immutable plan 和 SHA-256 plan id 到 `.wordpress-builder/block-nav-plans/`。

### Apply 阶段

Apply 必须在写入前后都验证：

1. plan hash、site URL、active theme、route owner 不变；
2. 选中的 template/part source 与 plan 一致；
3. `wp_navigation` before hash 未漂移；
4. 写入前创建本地 restore snapshot；
5. 通过 WP-CLI `wp_update_post()` 更新 `wp_navigation`；
6. 读回内容并验证 hash；
7. 带 cache-busting 参数请求原始 route，验证每个新 label 出现在前台 HTML；
8. 若前台验证失败，立即恢复 before 内容并复核回滚；
9. 保存 apply receipt，不修改 immutable plan。

## 非目标

- 不修改 theme 文件；
- 不修改 `wp_template` / `wp_template_part` 内容；
- 不把 inline Navigation block 自动转换成 `wp_navigation`；
- 不覆盖子菜单或复杂 Navigation block；
- 不做 Elementor `_elementor_data` 编辑；
- 不把 external 项目变成 source 项目。

## 技术设计

新增模块：

```text
harness/lib/block-navigation.mjs
```

职责：

- 读取远端 FSE/navigation inventory；
- 探测当前 route；
- 复用 `shape-diagnosis.mjs` 的模板摘要与所有权解析；
- 生成/验证扁平 navigation-link markup；
- 管理 immutable plan 与 receipt；
- 执行 update、readback、前台验证和自动回滚。

`shape-diagnosis.mjs` 增加纯函数：

- `parseNavigationPostContent(content)`：识别扁平 navigation links；
- `buildNavigationPostContent(links, siteUrl)`：生成官方 block markup；
- 两者都不接触远程状态。

## 测试计划

新增：

```text
tests/harness/block-navigation.test.mjs
```

覆盖：

1. 扁平 navigation post 可解析；
2. 子菜单/未知 block/空内容拒绝；
3. route owner 正确时生成 plan；
4. 未引用的 `wp_navigation` 不能作为 target；
5. 多导航候选必须显式选择；
6. inline-only navigation 拒绝；
7. apply 前 route owner 漂移时拒绝；
8. apply 前 navigation hash 漂移时拒绝；
9. 正常 apply 更新、读回并验证前台；
10. 前台验证失败自动回滚；
11. plan 文件不含完整模板内容，只含必要导航内容与摘要；
12. receipt 不改变原 plan hash。

## 真实 E2E 计划

使用本地一次性原生 Block/FSE WordPress：

1. 保留 custom `front-page` 与 custom header part；
2. header part 引用 `wp_navigation`；
3. 用新命令生成 plan；
4. 检查 plan 归属、影响面和 before/after hash；
5. apply；
6. 验证前台新 labels；
7. 构造前台验证失败，确认自动回滚；
8. 恢复测试导航。

## 发布计划

- 版本：`2.23.0`
- 完整 gate：typecheck / lint / test / build
- 更新 Skill、README、HARNESS-GUIDE、HANDOFF、RELEASES
- commit、tag、push、干净 clone 复测

---

# 实施与验证记录（2026-09-27 01:05 Asia/Shanghai）

## 已实现

- 新增 `harness/lib/block-navigation.mjs`：
  - `nav block plan`：生成 immutable 本地计划，不写远端；
  - `nav block apply`：执行 `wp_navigation` 更新、读回、前台验证和自动回滚；
  - 计划保存于项目忽略目录 `.wordpress-builder/block-nav-plans/`；
  - receipt 单独保存，不修改原 plan 或 plan hash。
- `shape-diagnosis.mjs` 新增：
  - `parseNavigationPostContent()`；
  - `buildNavigationPostContent()`。
- `wordpress-builder.mjs` / `harness/cli.mjs` 接入：
  - `nav block plan`；
  - `nav block apply`。
- `command-map.mjs` 增加风险分级：
  - plan：`local-plan-write`；
  - apply：`remote-write-with-rollback`。
- 安全边界：
  - 必须先证明当前 route 的 template/part owner；
  - 只允许更新当前 route 引用的 `wp_navigation`；
  - 多候选必须显式 `--navigation`；
  - inline-only navigation 拒绝；
  - 子菜单/未知 block/非 whitespace 文本拒绝；
  - site/theme/template/part/nav 内容漂移都会拒绝；
  - 前台 label 缺失时自动恢复 before 内容；
  - WordPress cache flush 和前台验证都在回滚保护范围内。

## 单元/集成验证

新增 `tests/harness/block-navigation.test.mjs`，当前 12 项全部通过：

1. 扁平 navigation post 可解析/重建；
2. 子菜单拒绝；
3. locked/metadata-bound link 拒绝；
4. plan 记录 owner 与影响面且不写远端；
5. apply 更新并验证前台；
6. 前台验证失败自动回滚；
7. post-update readback 失败自动回滚；
8. manual drift 拒绝；
9. route template owner 漂移拒绝；
10. 未引用导航不能作为 target；
11. inline-only navigation 拒绝；
12. canonical command map / CLI 入口回归。

## 真实 WordPress E2E

在本地一次性原生 Block/FSE WordPress 上验证：

- route：`/`；
- selected template：custom `front-page`；
- owner：custom `header` template part；
- target：`wp_navigation 279`；
- before：`Shape Home`；
- after：`E2E Home`、`E2E Products`；
- 影响面报告：两个 custom header part 引用同一导航。

验证流程：

1. plan 正确识别 `template-part:header`；
2. 故意让前台验证返回 stale HTML；
3. apply 更新后检测 label 缺失；
4. 自动 rollback 恢复 `Shape Home`；
5. 再次正常 apply；
6. 原始前台 HTML 出现 `E2E Home` 与 `E2E Products`；
7. 清理后恢复原始导航内容。

结果：

```json
{
  "pass": true,
  "targetId": 279,
  "rollbackWorked": true,
  "liveLabelsVerified": true,
  "restored": true
}
```

## E2E 中发现的实现修正

- 将 `wp cache flush` 移入前台验证的 rollback 保护范围：如果 cache flush 抛错，不能留下一个未验证的远端写入。
- 本地容器 PHP warning 来自此测试环境的 `WP_HOME` 常量配置，不属于 Builder 代码路径；真实 WP-CLI 路径未出现该 warning。

## 追加回归

- 增加 CLI command map / canonical 入口回归。
- 增加post-update readback mismatch 回归：即使远程更新后读回 hash 不匹配，也必须进入自动回滚路径。
- 在真实 Hostinger 站点 `mediumblue-quail-505146.hostingersite.com` 上运行 canonical `nav block plan`：
  - 该路由没有引用 `wp_navigation`；
  - 命令以 exit 1 拒绝；
  - 未生成本地 plan；
  - 未写远端。

## 发布与干净克隆复测（2026-09-27 02:02 Asia/Shanghai）

- 功能提交：`74d3c63461fcf59e627a7d7cabbf715893b58c76`（`feat: add route-owned block navigation updates`）。
- 已推送 `main` 并发布 tag：`v2.23.0`。
- 从 GitHub 干净克隆 `v2.23.0` 后验证通过：
  - `node harness/bootstrap.mjs --fix`；
  - `npm run typecheck`；
  - `npm run lint`；
  - `npm test`：236/236；
  - `npm run build`；
  - `node wordpress-builder.mjs --help`。
- 干净克隆工作区保持干净（detached HEAD，无未提交文件）。
