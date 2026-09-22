# 原生区块骨架

`theme/` 与 `plugin/` 由工具仓库 `examples/b2b-block-starter` 经 `scripts/build-block-starter.mjs` 生成。以 manifest.json 校验完整性；不要直接修改生成副本。客户复制后在自己的源码中开发。

安装目录名分别为 b2b-equipment 和 site-model，先安装并启用 ACF，询盘示例需 Fluent Forms，SEO 统一使用 Rank Math Free。实测版本与限制见 Skill 的 reference-site.md。这是设备内容模型，不是任意行业的无配置生成器。

先建立客户 AGENTS.md、Brief 与模型。ACF 产品字段归插件；原生标题/正文/主图归 WordPress；产品可选择 product-standard 或 product-editorial 模板，分类可选择两种布局。主题模板不内嵌 PHP，动态模块在插件中。

复制骨架后：创建 Home 与 Contact 等页面，Settings → Reading 指定首页；Settings → B2B destinations 选择已发布页面；配置实际询盘表单并写入 hd_enquiry_form_id；核对原生导航、CTA 网址与站点路径。首页正文由 Codex 按 Brief 和 Pattern 构建，本包不自动灌入演示数据库。

模板中预置 Equipment 等路径仅是示例路由，子目录安装/修改路由必须适配并检查。Rank Math 启用 Sitemap、Schema、ACF、Redirections 和 404 Monitor；可在设置流程跳过账户连接，无需 Pro。将产品/行业 CPT 和分类纳入实际 sitemap；询价产品不自动套带价格的 Schema。此骨架不兼容旧 SEO 插件或导入旧 SEO 数据。先保持预览隔离与 noindex；真实内容核验及发布授权完成后才设置正式可索引环境。

无生产凭据、实验 SMTP、数据库、演示 seed 或私有日志随包发布。复制模板不等于完成整站验收。
