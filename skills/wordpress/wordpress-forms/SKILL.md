---
name: wordpress-forms
description: 设计询盘字段，创建表单并嵌入 WordPress 原生区块页面。
---

# WPForms 询盘表单

先读取 references/wordpress-api.md。凭据在设置 → 连接器 → WordPress统一配置，Skill不存密码。

1. wpRead site，然后wpRead ability读取wpforms/describe-editing-schema声明，再wpReadAbility获取站点真实编辑schema。需要WordPress6.9+、WPForms1.10.2+写能力和站点启用写权限；入口说明见references/wordpress-api.md。
2. 围绕询盘设计最少字段，如姓名、公司、商务邮箱、产品需求、数量。字段类型和选项依据schema与实际许可证，不假设有文件上传或高级字段。
3. wpReadAbility wpforms/list-forms查重。读取create-form、add-field、update-field、update-form-settings各自声明，按真实input_schema逐步wpWriteAbility。每步检查回读证据再继续；创建回执取实际form_id，不编造。
4. 设置只限安全开放字段。邮件通知、确认页、第三方集成并不由这组接口开放；需用户在WPForms后台配置，不能声称通知已设置或邮件已送达。
5. wpWriteContent blocks含{type:"form",formId:实际ID}，保留其他页面区块。通过原生shortcode区块嵌入。浏览器预览必填提示、样式及移动布局；真实提交测试会产生询盘，只在授权范围执行并核对接收结果。

交付前核验实际回执和任务文件。网络未知结果不自动重发；插件版本/权限不足明确报告，不把计划写成已完成。
