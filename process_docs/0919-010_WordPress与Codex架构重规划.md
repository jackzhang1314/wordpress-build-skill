# WordPress 与 Codex 架构重规划

时间：2026-09-19 23:43:06 Asia/Shanghai（UTC+08:00）。

触发：用户认可先前架构判断，要求进一步搜索 WordPress/Codex 建站最佳实践，再规划整套架构与 Skill；当前范围为调研和规划。

主要工作：查阅 WordPress、Automattic、ACF 的官方文档及维护者代码；研究 WordPress/agent-skills、Automattic/build-with-wordpress、Studio、MCP、PHP 混合主题、contentOnly、ACF schema 与环境验证。发现 Automattic 主题生成明确采用 Block Theme，纳入反证；将 PHP 默认候选与区块对照、运行工具选择和 Skill 组织分成独立决策。

关键文件：`docs/18-WordPress与Codex调研及架构重规划.md` 是规划真源，包含来源、数据/代码所有权、工具保留与缺口、Skill 任务路由、A/B 与第二站验证、P0–P4 实施门槛。README 增加入口并澄清历史路线；旧 12 号报告添加来源不足说明，原文保留。当前 Skill 与网站源码未在本轮重写。

验证：核对现有 src、Skill、业务插件及 main/HEAD/未提交状态；查阅官方来源及上游 Skill 源码。4 份文档本地链接检查通过，22 项来源编号均可解析，新增文档空白与已跟踪文件 diff 检查通过；已复核规划/已实现边界。首次来源编号检查只匹配半角冒号，修正校验器后通过，文档无缺失来源。没有运行与纯文档变更无关的代码测试。GitHub API 初次元数据批量请求超时，后续读取目录树成功；未声称已锁定全部上游提交或安装验证。

遗留与下一步：P0 固定并核对实际环境版本；P1 公平比较 PHP 混合主题和受限区块方案，再单独评估 Studio 复用；后续重构 Skill、迁移现有演示站、通过第二行业及目标数据库验证。前轮测试不算新架构验收。不提交、不推送、不部署，保留全部前轮未提交工作。
