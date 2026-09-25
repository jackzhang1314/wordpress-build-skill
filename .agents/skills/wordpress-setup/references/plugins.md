# 新站插件基线与初始化

适用于本方案的新建 B2B 询盘站。不兼容旧插件，不迁移历史插件数据。插件能力与环境服务分开，避免同一能力安装多个插件。

## 必装基线

机器清单为随包 [plugin-profile.json](../assets/plugin-profile.json)；仓库真源为 config/wordpress-plugins.json。版本字段表示验收基线，不是“永远安装最新版”或安全状态声明。部署前核对维护与安全更新，更新后复验再调整清单。

| 插件 | 职责 | 必须完成的配置/检查 |
| --- | --- | --- |
| ACF Free | 结构化字段、后台编辑、官方字段绑定 | 业务插件注册字段；后台保存、前台值及 Query Loop 上下文正确 |
| Fluent Forms Free | 询盘字段、验证、记录与通知 | 创建本项目表单；必填/成功提示/通知收件人；绑定表单 ID；校验产品上下文；实际提交、入库与邮件收件 |
| Rank Math Free | 唯一 SEO 输出负责人 | 账户连接可跳过；CPT/分类、索引、sitemap、schema 按 seo.md 配置；实际 HTML 唯一输出 |
| 项目业务插件 | CPT、分类、字段定义、动态块、询盘规则 | 依赖先安装；模型注册、编辑与回显、询盘校验。site-model 是设备样板实现，客户按 Brief 改模型 |

ACF、Fluent Forms、Rank Math 均使用免费版；不默认安装 Pro，不为激活免费功能创建外部账户。主题独立安装，不算第五个插件。

## 按环境落实的能力

- **邮件投递**：正式询盘必须有明确 SMTP/API/主机邮件通道。已有可靠通道就不叠加邮件插件；否则选择一个邮件适配实现。From、Reply-To、真实收件人、失败处理和送达实测必须明确。密钥留私有环境。
- **防垃圾**：公开表单前确定表单原生保护及必要的边缘限流；挑战验证按项目配置。实际测试正常访客与拒绝路径，不把“插件有该功能”写成已启用。
- **备份恢复**：数据库与 uploads 必须有备份及恢复证据，优先主机/部署设施；缺能力才加插件。
- **缓存/图片优化**：按实际性能诊断选择主机/CDN或插件，避免叠加整页缓存。登录、预览、表单 nonce/POST 与更新失效必须回归。
- **多语言**：明确进入范围后选一个方案，不默认安装。
- 不默认添加 Elementor、第三方编辑器、WooCommerce、第二个 SEO/表单插件、ACF Pro、批量功能合集。

本地 SMTP 捕获 MU 插件、收件检查 MU 插件及 Mailpit 仅用于测试；Mailpit 本身不是 WordPress 插件。它们不能进入客户发布包，也不能当作生产投递/反垃圾已经验收。

## Harness 执行顺序

在 discover 阶段确认新站、PHP/WordPress、路径和权限，进入 model 前完成依赖引导；沿用现有里程碑，不另造一套状态机。

1. **读取清单**：来源、版本、免费/项目插件、职责；明确可选能力的实现与环境。
2. **安装**：来源可为官方目录的固定版本、厂商官方固定 ZIP 或本项目源码。禁止用裸 latest、错误缓存或自动 --force 覆盖代替版本决策。
3. **验证再激活**：所有必装插件的实际版本匹配后按清单顺序激活，再读回激活状态；发现额外 active 插件先定位，不自行删未知插件。
4. **配置**：ACF/业务模型 → 本项目询盘表单和通知 → Rank Math → 环境服务。安装成功不能直接记为配置成功。
5. **验收**：版本/状态、字段与模型、真实表单/通知、SEO 输出；公开前另验邮件、防垃圾、恢复与性能。证据不含凭据或私有询盘。
6. **记录**：记录实际来源、版本、配置入口和验收结果。后续维护只改需要的项，不重新执行一次性内容 seed，不做旧插件兼容。

## 当前可执行范围

仓库 start.mjs 已读取统一清单，安装/校验全部四个依赖，保存 plugins.json，再运行既有表单与 SEO 配置。scripts/plugins.mjs 是启动器调用的依赖模块，不是任意生产主机的自动安装器。

`npm run test:starter:plugins` 只读检查当前 9490/9491 的版本、激活状态及基本配置；表单真实提交和完整 SEO 回归分别用 test:starter:design、test:starter:seo。额外 active 插件须更新经过评估的项目清单，不能静默忽略。

自有插件完整性由项目 manifest 校验；第三方来源和版本记录不等于文件签名验证。官方目录插件可用 WP-CLI verify-checksums 核验；厂商包按厂商来源及项目保存的包哈希管理，不假设厂商包均适用 WordPress.org 校验库。

官方依据：[WP-CLI 固定版本安装](https://developer.wordpress.org/cli/commands/plugin/install/)、[目录插件校验](https://developer.wordpress.org/cli/commands/plugin/verify-checksums/)、[ACF 官方安装](https://www.advancedcustomfields.com/resources/installation/)、[ACF 版本下载](https://www.advancedcustomfields.com/downloads/)。

## Hostinger 环境接入

当前公网目标见 [Hostinger 部署规范](hostinger.md)。Hostinger CLI/MCP 属于开发及运维工具，不属于 WordPress 必装插件；不默认添加 Hostinger AI 插件。缓存、邮件与安全服务按实际套餐核对，避免重复安装。主机预装插件先盘点并明确处置，不自行删除未知插件。
