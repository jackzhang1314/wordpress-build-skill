# 2026-09-26 23:35（Asia/Shanghai）— Block/FSE 路由级形状诊断方案

## 触发原因

`project inspect` 目前只能回答站点级别的库存问题：是否存在 `wp_navigation`、是否存在 `wp_template` / `wp_template_part`、是否有 Classic menu。它不能回答某个前台路由实际由哪个模板渲染、导航由哪个 template part 持有。因此 Block/FSE 站点存在两个风险：

1. 一个存在但未被使用的 `wp_navigation` 会被误判为当前导航；
2. Site Editor 的 custom 数据库模板可能覆盖 theme 文件模板，只看文件或库存会误判修改入口。

目标是补一层**只读、按路由归属**的诊断，避免“写入成功但前台不变”或向错误的导航系统写入。

## 范围

### 必须做

- 为 `project inspect` 增加路由级形状输出：
  - 当前路由实际选中的 FSE template（slug/id/source/status）；
  - template 引用的 template parts；
  - template 或 template part 内的 Navigation block / `wp_navigation` 引用；
  - 导航归属（classic menu、block navigation、mixed、unknown）；
  - `theme` / `custom` 来源和置信度；
  - 写入能力建议（本阶段只读，不写 Block/FSE 模板）。
- 支持显式路由：
  - `project inspect --routes /,/about/,/blog/`
- 支持核心路由抽样：
  - `project inspect --route-set core`
  - 覆盖首页、普通 page、post single、CPT single、CPT archive、分类、搜索和 404。
- 将紧凑摘要保存到 `project.remote.routeShapes`，不保存大段模板内容。
- Classic/FSE 混合站点必须保留 Classic 写入安全边界；Block navigation 仍不得放行 Classic nav 写入。

### 不做

- 不做 Elementor `_elementor_data` 编辑或 adapter；
- 不转换、不覆盖任何 Elementor / Divi / Bricks 历史页面；
- 不自动修改 Block/FSE 模板、template part 或 `wp_navigation`；
- 不把 Starter 部署到 external/custom 项目；
- 不把“存在某个对象”当作“该路由正在使用它”。

## 技术设计

### 1. 权威路由模板探测

WordPress Core 在 `locate_block_template()` 中内置 `_wp-find-template` 探测协议：前台带 `_wp-find-template=1` 请求时返回当前查询实际选中的 `WP_Block_Template` JSON。该结果来自真实请求和真实模板层级，优先于在 Node 里重新猜测 WordPress hierarchy。

实现要求：

- 每个路由附加 `_wp-find-template=1` 和一次性 cache-busting 参数；
- 校验 HTTP 2xx、JSON `success === true`；
- 只保留结构化摘要、内容 hash 和引用，不把完整 content 写入 `project.json`;
- 返回 HTML、JSON error 或请求失败时输出 `unknown` / `low` confidence，不抛出写入风险结论。

### 2. Block markup 解析

新增纯函数模块 `harness/lib/shape-diagnosis.mjs`：

- `parseTemplateContent(content)`：解析 `wp:template-part`、`wp:navigation {"ref":...}`、`wp:navigation-ref`；
- `resolveNavigationOwnership(...)`：串起 template → template part → navigation 的所有权；
- `summarizeBlockTemplates(...)`：把模板和 part 压缩为 slug、source、hash、引用等摘要；
- 解析必须容忍 JSON 属性、空白、多层注释和普通 HTML 注释；
- 不确定时返回 `unknown` / `low`，不伪造高置信度。

### 3. template part / navigation 库存

远程 inspection 读取 `get_block_templates([], "wp_template_part")` 时保留：

- slug、id、area、source、modified/wp_id；
- `contentHash`;
- 直接 navigation refs。

`wp_navigation` 库存只作为候选集合；只有被当前路由的 template/part 引用时才标记为 selected/used。Classic menu 也同理，只有位置或路由证据支持时才进入归属结论。

### 4. route-set core

`--route-set core` 在远端只读抽样代表性 URL：

- `/`；
- 一个非首页 page；
- 一个 post single；
- 一个公开 CPT single（如存在）；
- 一个有 archive 的公开 CPT archive（如存在）；
- 一个分类；
- `/?s=<diagnostic>`；
- 一个极大概率不存在的 404 路径。

缺内容时记录 `skipped`，不虚构样本。

### 5. CLI 输出

增强现有入口，不新增并行入口：

```bash
node wordpress-builder.mjs --project <dir> project inspect --json
node wordpress-builder.mjs --project <dir> project inspect --routes /,/about/ --json
node wordpress-builder.mjs --project <dir> project inspect --route-set core --json
```

默认保留现有库存输出；带 routes/route-set 时增加 `routeShapes`。人类可读输出输出简短 summary，避免静默成功。

## 安全与回归

必须验证以下场景仍然安全：

1. Block navigation 路由下 classic `nav add` 仍被阻断；
2. mixed 且 owner 不明时不放行导航写入；
3. 只有未使用的 `wp_navigation` 不判定为 block navigation selected；
4. custom template 覆盖 theme template 时以 custom 为当前来源；
5. external 项目仍阻断 source deploy；
6. classic `template assign` 不被误报为可覆盖 FSE 模板。

## 测试计划

新增 `tests/harness/shape-diagnosis.test.mjs`，覆盖：

- template-part / navigation / navigation-ref 解析；
- 多层 template → part → navigation；
- custom 覆盖 theme source；
- front page、post/page、CPT、taxonomy、search、404 抽样；
- 未使用 navigation、无导航、多导航、mixed；
- 请求失败 / 非 JSON / JSON error 的低置信度输出；
- 摘要不包含完整 content；
- `--routes` 与 `--route-set core` CLI 集成；
- `project.remote.routeShapes` schema 与保存。

## 实施步骤

1. 落盘本方案；
2. 实现纯解析器与单元测试；
3. 接入 `external.mjs` inspection 和 `config.mjs` schema；
4. 接入 `cli.mjs` 参数、route-set 和输出；
5. 跑 typecheck / lint / 全量测试 / build；
6. 在真实原生 Block/FSE WordPress 站点做 E2E：
   - theme source；
   - Site Editor custom override；
   - header template part 引用 `wp_navigation`;
   - 未使用 `wp_navigation`;
   - 前台 HTML/截图与诊断一致；
7. 更新 Skill、README、HARNESS-GUIDE、HANDOFF、RELEASES；
8. 版本 `2.22.0`，commit/tag/push，并做干净 clone 复测。

---

# 实施与验证记录（2026-09-27 00:30 Asia/Shanghai）

## 已实施

- 新增 `harness/lib/shape-diagnosis.mjs`：
  - 解析 `wp:template-part`、`wp:navigation {"ref":...}`、`wp:navigation-ref` 和 inline Navigation block；
  - 输出模板/part 摘要、稳定 hash、候选层级、导航归属与 route capabilities；
  - custom 数据库模板优先于 theme source；
  - missing part、无效 block attributes、探测失败均降低 confidence，不转成写入能力。
- `project inspect` 支持：
  - `--routes /,/about/`（最多 20 条）；
  - `--route-set core`；
  - WordPress Core `_wp-find-template` 只读探测协议，获取当前路由实际选中的模板；
  - 紧凑 `project.remote.routeShapes` 保存，不保存完整 block content。
- 站点库存改为一次 WP-CLI `eval` 请求返回 theme、plugins、menus/items、`wp_navigation`、Classic/FSE templates、CPT/taxonomy 和计数；旧多命令路径保留为 fallback。
- 修正安全边界：
  - 未被模板引用的 `wp_navigation` 不再让站点变成 block navigation；
  - Block/FSE 站点中 assigned Classic menu 不再自动证明当前导航可写；
  - mixed navigation 阻断 classic nav 写入；
  - Classic/FSE hybrid 在未证明路由 owner 前阻断 classic template assignment；
  - route 级 `classicMenuWrite` / `classicPageTemplateAssign` 只在 Classic PHP 渲染下为 true。
- 更新 Content/Design/Router Skill、README、使用手册和本记录。

## 验证

### 单元/集成

新增 `tests/harness/shape-diagnosis.test.mjs`，覆盖：

- block markup parser；
- 紧凑摘要与稳定 hash；
- custom source 覆盖 theme source；
- template → template part → `wp_navigation` 所有权；
- missing part low confidence；
- authoritative route 输出且无原始 content；
- 探测失败不伪造 owner；
- Block rendering 中 assigned Classic menu 不证明 classic 写入；
- Classic 场景仍允许 classic menu 写入。

并更新 maintenance 回归：

- block navigation 阻断 classic menu 写入；
- mixed navigation 阻断 classic menu 写入；
- Classic/FSE hybrid 阻断 classic template assignment。

### 真实 WordPress E2E

1. **本地原生 Block/FSE WordPress + Site Editor custom override**
   - 创建 `wp_navigation`；
   - 将 header template part 改为引用该导航；
   - 创建 custom `front-page` 数据库模板；
   - `_wp-find-template` 返回 `twentytwentyfive//front-page`，`source: custom`；
   - Builder 诊断输出：
     - selected template: `front-page` / `custom`;
     - selected part: `header` / `custom`;
     - `wpNavigationIds: [279]`;
     - owner: `template-part:header`;
     - route confidence: high;
     - classic menu write / classic template assign: false；
   - 前台 HTML 同步出现 `Shape Home` 与 `Diagnostic custom template`，证明诊断与真实渲染一致；
   - 再新增一个未引用的 `wp_navigation`：库存计数为 2，但 `usedBlockNavigationIds` 仍只有 279。

2. **Hostinger 真实站点只读回归：`brightdozer-482910.hostingersite.com`**
   - `--route-set core` 抽样 10 条路由；
   - 首页、page、post、CPT archive/single、category、search 均得到高置信度 FSE template 与 header/footer part 归属；
   - 404 路由未返回 FSE JSON，输出 `fseTemplate: null`、low confidence 和问题说明，不伪造归属；
   - 未写任何 Hostinger 线上数据，只更新本地 `project.json` 的 route 摘要。

### 性能修正

初版沿用了 13 次以上串行 SSH/WP-CLI 库存请求，在当前 Hostinger 网络环境下单路由 inspection 耗时 **7 分 41 秒**。这属于实际可用性缺陷。改为一次远程库存请求后：

- 单路由：约 **5.7 秒**；
- core route-set（10 条路由）：约 **62 秒**。

结论：远程库存必须优先合并请求；路由 HTTP 探测仍按路由逐个执行，以免缓存/插件/模板上下文互相污染。

## 当前边界

- Block/FSE template、template part、`wp_navigation` 写入仍是下一步，需要单独授权、备份和 source custody；
- 404 或无法被 `_wp-find-template` 返回 JSON 的路由保持 low confidence；本次不猜测 Classic PHP 文件名；
- `--route-set core` 只选择代表性内容，不代表全站每个 permalink 都已诊断。
