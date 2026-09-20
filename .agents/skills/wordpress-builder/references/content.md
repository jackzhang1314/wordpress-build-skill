# 新站内容模型与维护

录入/生成公开内容前按 [搜索质量](search-quality.md) 核验目的、来源和责任；批量内容先验证代表页，mock 可供预览但不能冒充真实企业证据。

适用于新建站及本方案创建站点的内容更新。业务 schema 由插件持有，运营修改字段值；旧站/第三方 builder 导入迁移暂不支持。以下 REST 命令是执行工具，不能替代插件/主题生成。

# 内容模型、字段绑定与 CSV

先用业务插件注册本项目需要的 CPT，再读取实际公开模型。`content-type --type <实际类型>` 读取 `/wp/v2/types` 声明及真实 OPTIONS；只支持有 title/editor 的公开编辑内容，不能用它管理插件、用户或内部 wp_* 类型。ACF 字段组需要显式开放 REST；没有 schema 的字段拒绝写入。测试站用的 Octopus 插件只是一种已有模型示例，不是客户站必装组件。

## 单条内容

```json
{
  "type": "oct_product",
  "title": "基于资料的产品名称",
  "slug": "verified-product-slug",
  "acf": {"oct_material": "资料确认的材质"},
  "blocks": [
    {"type":"heading","text":"Material","level":2},
    {"type":"meta","key":"oct_material","fallback":"Material pending"}
  ]
}
```

`content-plan --plan 文件 --task 目录` 返回 planId/patch；核对后 `content-apply --id planId --task 同目录`。新内容必须提供 title/slug，默认且仅创建 draft；已存在 slug 不自动覆盖。发布前完成实际草稿与原生编辑器检查。

修改先 `read-content --type oct_product --id 123` 获取 version，然后输入 `{"type":"oct_product","id":123,"expectedVersion":"实际version","acf":{"oct_material":"新材质"}}`。省略 blocks 保留原文，包括工具不认识的区块。提供 blocks 将完整替换正文；不要用不完整区块数组做局部修改。发布用同一流程，仅设 `status:"publish"`，会保留正文。已有发布授权无需重复询问。

可选字段：title、slug、status(draft/publish)、excerpt、featuredMedia（实际图片 ID；0 清除）、meta、acf。未提供字段保持；特色图参数已实现，尚需独立视觉验收。不能同时通过 meta/acf 写同名字段。保护字段、schema 未声明字段、只读字段、null 删除均拒绝。空文本是明确值，不自动跳过。

**ACF 图片字段实测语义（image 类型，`return_format: url`）**：REST GET 返回原始附件 ID（不是 URL）；REST 写入校验要求整数附件 ID，传 URL 字符串会被 `rest_invalid_param` 拒绝；`get_field()` 前台与 `acf/field` Block Bindings 渲染层自动按 return_format 转 URL。模板需要控制尺寸时取原始 ID 后用 `wp_get_attachment_image_url()`。关系/重复器等复杂类型仍需先单独确认读写转换。

元数据绑定要求目标类型真实注册非下划线开头的 REST string meta，ACF 字段存在本身不保证符合此条件。生成 core/paragraph + core/post-meta binding，fallback 只是缺值文字。验证时只改字段，比较正文哈希不变，并从匿名前台确认新值。若前台仍显示 fallback，检查 WordPress 绑定支持、字段注册和模板上下文；不能称为动态展示已完成。

`{"type":"catalog","postType":"实际公开类型","perPage":9}` 生成原生 Query Loop，可在标准页面中使用。必须核对实际产品链接、草稿不公开、手机布局和原生区块有效性。内容类型公开不等于主题已有合适的产品详情模板。先看真实详情页；若出现文章作者行、“更多文章”或其他不适配内容，区块路线可用 `templates` 找实际 header/footer ID，再用 `single-template-plan/single-template-apply` 创建或更新 `single-<type>` 专用模板，并匿名复查前台。它会立即影响该类型全部默认详情页，不能用成通用文章/页面模板适配器。

## CSV 草稿导入

```json
{
  "file":"products.csv",
  "type":"oct_product",
  "keyColumn":"SKU",
  "titleColumn":"Name",
  "excerptColumn":"Summary",
  "fields":[{"column":"Material","group":"acf","key":"oct_material"}],
  "blocks":[{"type":"meta","key":"oct_material","fallback":"Material pending"}]
}
```

用 `import-plan` 核对全批记录后 `import-apply`。CSV 最多 1 MiB、20 条，支持 BOM、逗号引号与单元格内换行。所有单元格保持字符串，不猜测数字、日期或 JSON；数值字段需另行明确转换流程。稳定键会去除前后空格，必须唯一，前导零保留；默认 slug 来自内容类型及稳定键摘要，可用 slugColumn 明确指定。表头、键及目的 slug 不得重复。

计划固定源文件绝对路径、字节哈希、字段映射及每条草稿。修改源文件后不能应用旧计划。重复 apply 复用已保存 ID；跨任务遇到相同 slug 会拒绝覆盖。首次开始需校验全批；执行中仍逐条重新检查 schema、远端 slug 和回执。失败即停，已完成条目保留，没有自动回滚或删除；同一目录和 planId 继续，不能清空日志重跑。后续人工改稿会被识别，避免用旧导入覆盖。批量更新现有产品尚未提供，应逐条 read-content 和显式更新计划。

官方依据：[ACF REST](https://www.advancedcustomfields.com/resources/wp-rest-api-integration/)、[原生 Block Bindings](https://developer.wordpress.org/block-editor/reference-guides/block-api/block-bindings/)。执行以当前站点实际结果为准。

PHP 路线的产品详情使用主题 PHP single 模板，不调用 single-template-plan。分类 term 字段和复杂 ACF 类型需按实际接口验证，当前内容 CLI 不宣称覆盖全部类型。


## 区块主题中的 ACF 数据消费

CPT、字段与多模板组合共享一个产品记录。原生字段、ACF 业务值、块实例装饰属性各有所有者；换模板不复制型号、价格、规格或媒体。原生正文中可编辑的叙事不必全部转换成 ACF。

优先核验现有 `acf/field` 或目标版本可用的原生绑定；不因实验有自定义 binding source 就每站重新开发。注册存在、服务器正确读取、Query Loop 当前对象、编辑器预览、原位双向写回分别验证。复杂数组、表格或条件展示优先动态块；必要的自定义 source 用公开字段白名单和明确上下文，不能通过重复 meta 绕过 ACF 所有权。

ACF 官方完整绑定 UI/实时编辑目前有版本、PRO 和 datastore 配置要求，见 [官方绑定指南](https://www.advancedcustomfields.com/resources/block-bindings/)。这不等于免费版不存在基础绑定源；以实际安装代码与注册结果判断。免费字段 + 自建原生动态块也不需要宣称已购买 ACF Blocks。
