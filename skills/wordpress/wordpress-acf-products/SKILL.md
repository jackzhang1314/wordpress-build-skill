---
name: wordpress-acf-products
description: 读取 Excel 或 CSV，映射已有 ACF 字段并分批创建产品草稿。
---

# ACF 产品批量导入

先读取 references/wordpress-api.md。凭据在设置 → 连接器 → WordPress统一配置，Skill不存密码。

1. wpRead site 查内容类型，wpRead schema（type=实际CPT名）读取OPTIONS。站点必须已建产品CPT且REST开放；ACF字段组需Show in REST API。不要假设存在products端点，不创建PHP或WooCommerce商品。
2. 从任务文件读取固定版本CSV/TSV；XLSX通过附件导入会转换工作表。列从0开始，第1条是表头。选择稳定唯一产品编号与标题列；一字段映射一列，类型按实时ACF schema选择text/number/boolean/json。
3. 图片/PDF先按媒体Skill上传，把真实媒体ID填入新版本表格的图片字段或特色图列。禁止将本地路径、假ID写入ACF。
4. wpPreviewProducts验证全表并保存当前批次（默认5，最多20）预览。readFile检查映射、总数、首批内容。未公开字段、重号、空标题、错误值先修正文件并重新预览。
5. wpImportProducts使用完全相同固定版本、映射、offset和limit；只创建草稿。每下一批须再次预览。遇已存在稳定键停止，不覆盖；未知提交先wpWorkflowStatus和后台核对，不改键绕过防重。
6. 读逐行report并核对acfMatches、草稿状态、ID和实际数量。失败按nextOffset恢复；不能只报processed即当成功。前台产品呈现依赖站点已有模板，实际预览后报告。

交付前核验实际回执和任务文件。网络未知结果不自动重发；插件版本/权限不足明确报告，不把计划写成已完成。
