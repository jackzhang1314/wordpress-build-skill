---
name: wordpress-seo-settings
description: 依据实时站点能力检查并修改 SEO 设置，保留变更前后证据。
---

# Rank Math 站点 SEO 设置

先读取 references/wordpress-api.md。凭据在设置 → 连接器 → WordPress统一配置，Skill不存密码。

1. wpRead site检测能力，再wpReadAbility rank-math/get-system-status、get-settings了解启用模块和设置。能力未开放就说明站点需配置，不假设安装Rank Math即支持。
2. 使用浏览器inspectPage/readSeoResource检查title、description、canonical、robots、结构化数据。SEO数据分析继续使用DataForSEO，持续监测沿用已有有限次数监测工具，不能承诺后台永久抓取。
3. 生成原值→建议值→影响页面的计划。仅适配set-website-identity、set-global-seo-settings、set-homepage-seo、set-link-settings、set-sitemap-settings、set-post-type-seo-settings、set-breadcrumb-settings。
4. 对目标能力用wpRead ability取得实时input_schema，wpWriteAbility按schema提交；只改用户要求的设置。全站索引、链接、站点地图等说明实际影响。没有开放字段就记录未支持，不能伪造通用meta写接口。
5. 核对自动get-settings回读证据中的变更字段，再访问实际页面/robots/sitemap验证。接口成功不代表Google已重新索引。保留前值，恢复须重新核对当前值并按明确目标操作。

交付前核验实际回执和任务文件。网络未知结果不自动重发；插件版本/权限不足明确报告，不把计划写成已完成。
