# Hostinger 本地只读预检

时间：2026-09-20T08:53:02+08:00（Asia/Shanghai）。

触发：用户要求继续，并明确尚无 Hostinger 主机，先完成本地工具。沿用 main / a49821fa88311b5fa59f4d0298b8a6f5b71bd7a1，保留既有修改，未提交。

## 成果

新增 scripts/hostinger/preflight.mjs、config/hostinger-staging.example.json、tests/hostinger-preflight.test.mjs，接入 npm run hostinger:preflight。默认只做离线配置与本地工具检测；--connect 才读目标测试站。SSH 严格指纹验证、禁交互认证与 Agent/端口转发；不执行数据库导入、主题插件加载、写入、部署或自动购买。

新增实现支持读取 PHP/WP-CLI/核心版本、表前缀、数据库站点 URL 与 noindex、wp-content 权限。远端执行尚未实测；结果不代表主机账户归属、空站授权、版本兼容、恢复或部署能力。当前未安装官方 Hostinger CLI，报告明确 unavailable-or-not-working；SSH 路径可用。

## 经验沉淀

在 Hostinger Skill reference 增补配置和命令、凭据/指纹管理、只读能力边界及防误连规则；同步架构/上手文档。输入拒绝 shell 注入、额外凭据字段和 production；占位样例拒绝 --connect；远端不匹配/可索引/不可写拒绝通过。配置校验、SSH 连接、站点身份和可部署性分别记录，不合并为准备就绪。

## 验证与遗留

示例离线执行通过，证据 docs/acceptance/hostinger-preflight/local.json 绑定源码哈希。npm run lint、npm test（43/43）、git diff --check 通过。未连接任何远端、未安装/登录 CLI、未更改预览站。用户没有主机，真实 Hostinger 验证尚不可进行；远程部署执行器仍未实现。本轮不把本地逻辑测试作为 SSH 集成测试。
