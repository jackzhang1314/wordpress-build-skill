# CMS 字段、原生绑定与 CSV 导入验收

2026-09-08，继续在现有本机隔离 WordPress 验证。完整自动建站目标仍未完成，本阶段覆盖 CMS 数据与原生动态展示。

2026-09-17 更新：本档末尾记录的“产品详情模板缺口”已在挖掘机演示中用 `single-template-plan/apply` 处理并匿名验收，见 [08-挖掘机原生方案演示验收](08-挖掘机原生方案演示验收.md)。下列 2026-09-08 证据保持历史原状。

## 已验证行为

使用交接快照中的可选 Octopus Site 0.1.0 注册产品/案例模型，使用官方 ACF 6.8.9 管理其文本字段。它们仅在本地测试站启用，客户站应优先复用实际 CPT/字段，不强制安装此插件。当前主题仍为 Twenty Twenty-Five。

- 新 CLI 能发现真实公开内容类型及其 REST 路由，按 OPTIONS 校验字段，生成带前稿/patch 的固定计划。创建只写草稿；后续发布与字段更新保留未指定正文、模板、分类及其他值。
- 产品 22 包含 9 个有效原生块，其中 4 个 paragraph 使用 core/post-meta binding。桌面 1440px、手机 390px 均显示实际 ACF 值，而非静态 fallback。
- 发布产品 22 后，仅将 acf.oct_material 从 `Sample stainless steel` 改成 `Sample brass — updated through ACF`。正文哈希保持 `b2e027dd928fd06db65c4c82b2d32443287ca8a58d494efc04b46b50b08c20c2`；匿名浏览器显示新值，其余三个字段保持原值。
- CSV 中两条记录创建草稿 24/25，键 `001`/`002` 的前导零保留，引号、逗号和单元格换行按原文解析。重复 apply 返回相同 ID，产品数仅从 1 增至 3。
- 导入产品各 5 个块、目录页 26 的 9 个块全部有效；三页共 6 组桌面/手机草稿预览单一 H1、无横向溢出。
- 目录页使用原生 Query Loop。初始只显示发布的产品 22；发布产品 24 后，无需修改目录正文便自动出现第二条。草稿 25 未公开出现在目录。匿名桌面/手机目录及两个产品链接均 HTTP200。

## 本地演示

服务运行时本机可访问：

- [产品字段联动示例](http://127.0.0.1:9462/products/sample-control-valve-cms-test/)
- [动态产品目录](http://127.0.0.1:9462/demo-product-catalog/)
- [CSV 导入后发布的产品](http://127.0.0.1:9462/products/import-oct-product-84924b7c2f4c3dd70447/)

全部内容为虚构测试资料，不是企业规格或客户生产站。目录没有加入原四页导航，原四页任务与计划保持各自记录。

## 证据与测试

[字段回读及正文哈希](acceptance/0908-cms/cms-field-evidence.json)、[字段更新后匿名预览](acceptance/0908-cms/field-browser.json)、[CSV 实际重复执行](acceptance/0908-cms/import-evidence.json)、[导入与目录草稿编辑器](acceptance/0908-cms/catalog-drafts.json)、[发布目录与链接](acceptance/0908-cms/catalog-public.json)。精选截图在同目录，完整截图及运行脚本在 output/playwright。

20 项测试、typecheck、lint、build、Skill 结构校验通过；511 个交接文件及 26 个原 Skill 哈希校验无失败。新增测试覆盖字段上限/只读/未知字段、同秒人工改稿、原文及其他字段保留、CSV 重复键与列、源文件变更阻止应用、第二条回读失败后恢复且不重复 POST。

实际兼容修正包括 supports.editor 的参数数组，以及 ACF 空字段属性映射返回 `[]`。代码基于当前响应与本机 WordPress 官方源码处理，没有将未知结构一律转成成功。

## 尚未完成

产品详情仍继承主题文章模板，出现空作者信息和无关“更多文章”；这是明确的设计缺口。需要基于实际主题做产品模板适配并再次验收。字段与目录数据链路通过不能代替产品详情设计完成。

复杂 ACF 图片/关系/重复器字段、批量更新已有内容、字段删除、分类管理、特色图视觉验收、表单与邮件送达、SEO 插件、其他主题、HTTPS 客户站及正式未知结果核对恢复仍需继续。CSV 创建完成后如果用户另行发布/改稿，旧导入回执会检测变化并停止，不会恢复旧草稿覆盖新状态。

依据：[ACF REST 官方说明](https://www.advancedcustomfields.com/resources/wp-rest-api-integration/)、[WordPress 原生绑定](https://developer.wordpress.org/block-editor/reference-guides/block-api/block-bindings/)。本项目验证的是实际隔离站结果，不能由官方能力直接推定其他站点已兼容。
