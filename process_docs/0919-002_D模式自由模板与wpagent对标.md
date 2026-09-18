# 0919-002 D 模式自由模板落地与 wpagent 项目对标

- 时间：2026-09-19 07:14 Asia/Shanghai
- 触发原因：用户确认产品详情与产品分类页改用自定义自由模板（D 模式），随后要求研究 `/Users/Zhuanz1/MyProject/wpagent/wordpress-projects/` 的文档经验对本方案做启发。

## 主要工作

1. **docs/14 补充 D 模式架构**：Block Theme 主题根目录 PHP 自由模板（完整文档壳 + `block_template_part()` + `get_field()`），四种页面生成模式对照，管线接入规则。
2. **TerraLift 主题落地**：
   - `single-oct_product.php`（自由 HTML 产品详情：hero/规格带/卖点/详情图/长文/CTA）
   - `taxonomy-oct_product_category.php`（分类 hero/分类 rail/产品卡片网格）
   - `templates/product-dynamic.html`（区块绑定版 B 模式，注册 customTemplates 供逐篇切换）
   - `theme.json` 注册 product-dynamic；`style.css` 追加 `tl-fx-*` 自由模板样式（复用 token，约 300 行）
   - 删除 `templates/single-oct_product.html`、`templates/taxonomy.html`（实测区块模板优先级压过 PHP，必须移除）
   - octopus-site 插件：taxonomy rewrite slug 改 `product-category`
3. **本地站实测**（WP Playground 127.0.0.1:9462）：
   - 创建 3 个产品分类；6 个产品全部填充 15 个 ACF 字段 + gallery 图 + 分类归属
   - 详情页/分类页/归档/首页 200；绑定与自由模板渲染逐项验证
4. **关键实测结论**：
   - `resolve_block_template()`：区块模板（任意层级）总是优先于 PHP fallback → 同名/泛化 `.html` 必须删除
   - `get_header()` 不会解析 Block Theme 的 `parts/header.html`，会落到 theme-compat 兜底壳 → 必须 `block_template_part()` + 手动 `wp_head()/wp_footer()`
   - ACF 图片字段 REST GET 返回原始附件 ID（不是 URL），REST 写入校验要求整数 ID；`get_field()`/绑定渲染层按 `return_format: url` 自动转 URL → 文档修正：图片绑定前台输出 URL 正确，REST 读写以 ID 为准
5. **wpagent 项目研究**：管线（HTML 预览 → 模板+ACF → SSH 部署）、页面级字段组成对输出、版本化设计系统、部署分层、Fluent Forms、前端可视化编辑器；对标结论写入 docs/14 第 10 节。
6. **SKILL.md 更新**：阶段 5 新增 D 模式默认规则与 ACF 字段组输出规范。

## 关键文件

- `docs/14-模板驱动字段绑定页方案.md`（+58 行：D 模式 + wpagent 对标）
- `examples/terralift-ui-theme/single-oct_product.php`、`taxonomy-oct_product_category.php`、`templates/product-dynamic.html`（新增）
- `examples/terralift-ui-theme/style.css`（tl-fx 自由模板层）
- `examples/terralift-ui-theme/theme.json`（customTemplates）
- `source-snapshot/wordpress-site/plugin/octopus-site/octopus-site.php`（0.2.0，taxonomy rewrite）
- `.agents/skills/wordpress-builder/SKILL.md`（阶段 5 D 模式）

## 验证结果

- `npm run typecheck`、`npm run lint` 通过；`npm test` 23/23 通过
- 前台 4 路由 200；Chrome 视觉 QA：详情页/分类页桌面截图质量达标（暗色 hero、规格带、卖点卡、CTA 带），spec 溢出问题已修
- 区块绑定版：heading/paragraph/image/button 四类绑定全部命中 ACF 值

## 遗留问题

1. 分批提交尚未完成（工作区含上一轮 UI 重构 + 本轮 D 模式改动，需按工具层/主题层/Skill 层/文档层分开提交）
2. `templates/taxonomy.html` 删除后 `oct_case_industry` 回落 `archive.php`/`index.html`，后续如需可补 PHP 模板
3. mu-plugin `oct-flush-rewrites.php` 是一次性 rewrite flush 工具，不入库
4. HTML 预览中间层（wpagent 启发）尚未接入管线，作为下一步 skill 迭代项
