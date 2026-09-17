# 内容模型、字段绑定与 CSV

复用站点实际公开 CPT。`content-type --type <实际类型>` 读取 `/wp/v2/types` 声明及真实 OPTIONS；只支持有 title/editor 的公开编辑内容，不能用它管理插件、用户或内部 wp_* 类型。ACF 字段组需要显式开放 REST；没有 schema 的字段拒绝写入。测试站用的 Octopus 插件只是一种已有模型示例，不是客户站必装组件。

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

可选字段：title、slug、status(draft/publish)、excerpt、featuredMedia（实际图片 ID；0 清除）、meta、acf。未提供字段保持；特色图参数已实现，尚需独立视觉验收。不能同时通过 meta/acf 写同名字段。保护字段、schema 未声明字段、只读字段、null 删除均拒绝。空文本是明确值，不自动跳过。复杂关系/图片/重复器等 ACF 类型必须先单独确认读写转换，当前真实验收覆盖文本字段。

元数据绑定要求目标类型真实注册非下划线开头的 REST string meta，ACF 字段存在本身不保证符合此条件。生成 core/paragraph + core/post-meta binding，fallback 只是缺值文字。验证时只改字段，比较正文哈希不变，并从匿名前台确认新值。若前台仍显示 fallback，检查 WordPress 绑定支持、字段注册和模板上下文；不能称为动态展示已完成。

`{"type":"catalog","postType":"实际公开类型","perPage":9}` 生成原生 Query Loop，可在标准页面中使用。必须核对实际产品链接、草稿不公开、手机布局和原生区块有效性。内容类型公开不等于主题已有合适的产品详情模板。先看真实详情页；若出现文章作者行、“更多文章”或其他不适配内容，用 `templates` 找实际 header/footer ID，再用 `single-template-plan/single-template-apply` 创建或更新 `single-<type>` 专用模板，并匿名复查前台。它会立即影响该类型全部默认详情页，不能用成通用文章/页面模板适配器。

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
