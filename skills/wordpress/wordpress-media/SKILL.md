---
name: wordpress-media
description: 上传图片或 PDF，设置图片说明、特色图并插入文章。
---

# WordPress 图文素材与发布

先读取 references/wordpress-api.md。凭据在设置 → 连接器 → WordPress统一配置，Skill不存密码。

1. 用户通过附件选择原始PNG/JPEG/WebP/GIF/PDF，单个不超过10MB。任务中的提取文本不能代替原文件。读取文件列表取得path与固定version。
2. 为图片写真实alt、标题和caption；装饰图alt可为空。wpUploadMedia返回真实媒体ID、URL、altMatches及证据；失败先wpWorkflowStatus，禁止重复上传。
3. 需要关键词文章时，先加载SEO内容工作室，沿用DataForSEO连接器、预算/范围和证据流程。文章由当前模型结合企业事实写作，API只提供数据。
4. wpWriteContent type=post：原生blocks方式插入图片，featuredMedia设置特色图。PDF作为已上传URL的button链接；caption保存于媒体库，正文需要显示说明时显式加paragraph。文章分类/标签先wpRead terms。
5. 草稿默认draft；用户明确发布才publish；更新先wpRead content得到expectedModified。对照内容/标题/状态/特色图Matches及媒体证据，浏览器检查呈现后交付。

交付前核验实际回执和任务文件。网络未知结果不自动重发；插件版本/权限不足明确报告，不把计划写成已完成。
