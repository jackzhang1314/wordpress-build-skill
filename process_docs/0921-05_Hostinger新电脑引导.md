# Hostinger 新电脑工具引导

时间：2026-09-21T07:00:34.860798+08:00。用户要求克隆后按需安装 Hostinger CLI/MCP。

新增随 Skill 分发 hostinger-setup.mjs 与 npm hostinger:setup；默认检测，--install 仅缺失时安装官方 Brew formula，--connect 只读账户检查且不输出订单。CLI/MCP 二选一能力即可，默认 CLI。Skill/AGENTS/部署 reference 接入工具缺失、认证、支持范围与用户本人登录边界。

实际发现 auth 子命令不存在；官方文档确认账户命令自动打开浏览器登录。入口初版 URL 对象和字符串比较导致 CLI 静默退出，已修正 .href，并补入口回归。未安装、Brew 安装/复验、已有版本不覆盖、失败不泄露、Windows 未实现分支通过模拟测试；本机已有 CLI 实际只读检查另行记录。无 Homebrew/Windows 自动安装器和 MCP 自动配置未完成，不宣称全平台零操作部署。

本次不改变线上内容或主机资源。完整通用远端部署执行器仍未完成；提供已实测发布流程与工具初始化不等于任意机器一键部署全部通过。

## 扩展为完整 Harness 依赖入口

时间：2026-09-21T07:03:00.413473+08:00。用户进一步要求 WordPress/Skill/CLI/MCP 全链路按需配置。新增 scripts/harness-doctor.mjs、harness:doctor 和 harness:setup：检查 Node/npm、实际 npm 依赖树、Skill runtime/固定上游完整性、Docker CLI/Compose/引擎；显式 setup 安装 npm 依赖并构建。macOS 有 Brew 时显式 --install-system 可安装 Docker Desktop；其首次 UI/服务启动仍须复检。Hostinger 仅 --deploy 时加入，账户仅 --connect 时读取。不会因缺少本机 wp 或 MCP 重复安装容器已有能力。

9 个初始化测试通过（包括缺失模拟、已有工具不覆盖、引擎不可用、Node 不满足及命令入口），本机 CLI 3.35.0/账户读取与本机 doctor 实跑通过，无新站/线上写入。用户未认证的浏览器授权和全平台系统安装未实跑。依赖检查不代表整站验收；浏览器/PHPStan 等可选工具以及通用远端部署仍有单独缺口。更新 AGENTS/SKILL/快速开始和 Hostinger 规范后同步私人仓库。
