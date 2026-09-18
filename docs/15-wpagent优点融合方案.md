# wpagent 优点融合方案

研究样本：`/Users/Zhuanz1/MyProject/wpagent/wordpress-projects/`（详细分析见 docs/14 第 10 节）。

## 1. 融合原则

用户确认：对方所有优点与启发点全部借鉴。执行原则是**架构转译，不是实现照搬**——每个优点先翻译成「原生 Block Theme + ACF + REST 管线」里的等价物，再落进对应阶段；与架构红线冲突的项明确拒绝并记录理由。融合后我们的方案保持一条真源链：`theme.json` token → 模板/Pattern → ACF 字段 → REST 工具链。

## 2. 逐项融合映射

| # | 对方优点 | 原生等价物（我们的形态） | 落点 | 状态 |
| --- | --- | --- | --- | --- |
| 1 | HTML 预览中间层（`preview-*-v{n}.html` + `data-field` 标记，浏览器确认后再转模板） | 阶段 4.5 预览门：复杂视觉页面先产出 `design/preview-[page]-v{n}.html`（静态 HTML、引用设计 token、每个待编辑元素带 `data-field`），浏览器 QA 通过后才写 WordPress 模板；`data-field` 名与 ACF 字段一一对应 | SKILL.md 阶段 4 | ✅ 本轮接入管线 |
| 2 | 页面级字段组跟随模板成对输出（`page-*.php` + `acf-*.php`，location 绑 `page_template`） | 主题 `functions.php` 自动加载 `acf/*.php` 目录；自由页面模板与字段组同名成对；CPT 字段组仍集中注册（octopus-site 模式）并保持 `show_in_rest` + `allow_in_bindings` | 主题 functions.php + SKILL.md 阶段 5 | ✅ 本轮落地机制 |
| 3 | 版本化页面模板（`v1/v2/v3` 并存，切换验证后删旧） | 自由页面模板命名带版本号；迭代出 `page-x-v2.php` 而非覆盖 v1；新版本页面切换验证通过后再删旧文件。模板层级模板（single/taxonomy）不受此约束，由 git 管版本 | SKILL.md 阶段 5 | ✅ 本轮接入管线 |
| 4 | 版本化设计系统文档（组件片段 + 避免清单 + 更新记录） | `references/design.md` 增补「视觉避免清单」与「版本历史」节；组件以 token 化 Pattern 片段沉淀 | references/design.md | ✅ 本轮补齐 |
| 5 | 分层部署（单文件热更 / 文件夹同步 / 全量备份） | `scripts/deploy-lab.mjs`：`file <路径>` 单模板热更、`theme` 全主题同步、`backup` 先备份再同步；生产 SSH 部署记录约定，等真实目标再实现 | scripts/deploy-lab.mjs | ✅ 本轮落地 |
| 6 | Fluent Forms 承接所有表单 | 新项目必装清单加入 Fluent Forms；询盘表单一律 `do_shortcode('[fluentform id="N"]')`，表单字段不建 ACF 字段 | SKILL.md + 必装清单 | ✅ 已在阶段 5，本轮固化进必装清单 |
| 7 | ACF `load_field` 全局默认值过滤器 | **不采纳全局过滤器**：它会把「未填」静默变成「有值」，掩盖空状态。保留模板内 `get_field() ?: '默认值'` 显式回退，空值行为可审计 | — | ❌ 已有更优等价物 |
| 8 | 前端可视化编辑器（contenteditable + AJAX `update_field`） | **暂不采纳**：ACF 后台表单已覆盖同能力且零维护成本；自研编辑器重复 ACF 能力、引入 nonce/权限/同步面。若未来用户强需求，作为独立插件立项而非主题内置 | — | ❌ 暂缓，记录触发条件 |
| 9 | Prompts 作为上下文文档体系 | 已有等价物：`SKILL.md` 8 阶段 + `references/*.md`。对方「每个文档指定输入输出路径」的纪律值得保留，已在阶段条目中体现 | 已存在 | ✅ 已有等价物 |
| 10 | expect/sshpass 密码进 git（config.py 明文） | 拒绝。生产部署凭证走本地 credential 文件（同 `.lab/artifacts/connection.json` 模式），永不入库 | — | ❌ 安全红线 |
| 11 | CDN 运行时框架（Tailwind CDN + Alpine CDN）、classic child theme、无 REST 管道、图片 `return_format: array` | 拒绝或已有更优解：构建期 CSS；原生 Block Theme；REST `acf` 读写；`return_format: url`（实测 REST 写入需传附件 ID，渲染层自动出 URL） | docs/14 §10.3 | ❌ 架构红线 |

## 3. 本轮落地明细

1. **HTML 预览门**（SKILL.md 阶段 4 第 5 条）：复杂视觉页面先做静态预览，QA 通过再进 WordPress；预览文件存任务目录 `design/`，随任务归档。
2. **主题 `acf/` 自动加载器**：`functions.php` 按文件名顺序 require `acf/*.php`；每文件一个字段组，`location` 绑定 `page_template`；文件头注释声明对应模板与版本。
3. **版本化页面模板**（SKILL.md 阶段 5 第 7 条）：自由页面模板 `page-*.php` 带 `-v{n}` 后缀；同 slug 迭代不覆盖。
4. **分层部署脚本** `scripts/deploy-lab.mjs`：
   - `node scripts/deploy-lab.mjs file examples/.../single-oct_product.php` → 单文件 2 秒热更
   - `node scripts/deploy-lab.mjs theme` → 全主题同步
   - `node scripts/deploy-lab.mjs backup` → 先拷贝运行站主题到 `.lab/backups/<时间戳>/` 再执行变更
5. **design.md 补「视觉避免清单」与「版本历史」**，吸收对方设计系统的演进纪律。
6. **联系页示例闭环**：`page-contact-v1.php` + `acf/page-contact-v1.php` 成对落地并切换 `/terralift-contact/`；Fluent Forms 缺装时优雅降级为 mailto CTA，装表单插件后同一模板自动渲染短代码表单。桌面截图 `.lab/design-02/qa-contact-v1.png`。

## 4. 新项目必装清单（固化）

| 插件 | 定位 | 用途 |
| --- | --- | --- |
| ACF | 必装 | 唯一字段真源：CPT 字段组 + 页面字段组 + Block Bindings 源 |
| Fluent Forms | 询盘场景必装 | 全部表单（询盘、订阅、联系），短代码嵌入，不建表单类 ACF 字段 |
| SEO 插件（Rank Math / YoSE 二选一） | 必装 | 元标题/描述/站点地图；字段走插件自身接口，不重复造 meta |

不装：页面构建器（Elementor/Beaver）、多字段管理插件、静态缓存之外的优化全家桶。缺装时管线在内容模型阶段停止并提示，而不是绕过。

## 5. 生产部署约定（等真实目标启用）

1. 凭证：本地 `connection.json` 或 SSH key，不入库、不输出。
2. 粒度：单模板热更（日常改稿）→ 主题目录同步（批量）→ 全量发布（带备份与回滚点）。
3. 顺序：备份 → 同步 → 前台冒烟（首页 + 抽样详情/分类 200 + 关键区块存在）→ 记录。
4. 回滚：用备份目录反向 rsync；数据库模板覆盖问题靠「AI 只写文件模板」纪律规避。

## 6. 验收清单

1. HTML 预览门在 SKILL.md 可执行：有输出位置、data-field 规则、QA 通过标准。
2. 主题 `acf/` 目录存在且自动加载；示例字段组能在后台看到并 REST 读到。
3. 版本化模板命名规则写进管线；不存在「直接覆盖旧版页面模板」的路径。
4. `deploy-lab.mjs` 三种粒度命令全部可用且有输出确认。
5. 必装清单、拒绝清单在文档中可追溯（本文件 + docs/14 §10）。

## 7. 下一步

1. Fluent Forms 装机验证：在真实站点安装后回归联系页表单渲染与提交。
2. 生产 SSH 部署脚本：拿到真实服务器后把 §5 约定实现成 `deploy-prod.mjs`。
3. 预览门工具化：把 `design/preview-*.html` 的 token 引用检查做成 lint 规则（预览中禁止裸色值）。
