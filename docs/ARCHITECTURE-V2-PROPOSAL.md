# Harness v2 架构重构蓝图

> 状态：提案（2026-09-22）。基于 0919-0922 多轮实测经验，针对部署、管理、内容维护全链路的架构级优化方案。
> 审批：待用户确认后分阶段实施。

## 一、现状问题（7 项）

| # | 问题 | 根因 | 影响 |
| --- | --- | --- | --- |
| 1 | 部署脚本碎片化（8+ 个） | 按场景临时编写，未统一设计 | 用户需选脚本、记参数、记顺序 |
| 2 | SSH 非一等公民 | TUS+cron 是原始设计，SSH 后补 | 代码量 3 倍、故障点 5 倍 |
| 3 | 无回滚机制 | deploy.php 无备份/恢复逻辑 | 生产事故恢复不可控 |
| 4 | 新站初始化无一体化流程 | 需要 5+ 个脚本按正确顺序手动执行 | 新站交付易遗漏 |
| 5 | 文档碎片化（17 个 reference） | 内容跨文件重复，无统一入口 | 新人需读全部才能理解 |
| 6 | 无 CI/CD | 全部手动测试和部署 | 质量依赖人工，不可持续 |
| 7 | 本地/线上环境无同步机制 | 修改后需手动跑多脚本 | 变更遗漏导致环境不一致 |

## 二、目标架构

### 2.1 统一 CLI

一个入口（`harness`）覆盖全部操作：

```
harness init <name>     # 创建新项目
harness env start      # 启动本地环境
harness env stop       # 停止
harness sync           # 代码→本地环境
harness check          # 全部质量关卡
harness content        # 内容录入
harness deploy         # 部署到 Hostinger
harness deploy:status  # 部署状态
harness rollback       # 回滚
harness status         # 站点状态
harness doctor         # 环境诊断
harness ssh            # SSH 会话
```

### 2.2 通道分工

| 通道 | 覆盖 | 用途 |
| --- | --- | --- |
| SSH | ~90% | 文件同步(rsync)、WP-CLI、数据库、调试、部署、回滚 |
| Hostinger CLI | ~10% | 站点创建/删除、缓存清除、SSL、PHP 版本 |
| MCP | 辅助 | AI 交互式探索、排错、自然语言操作 |
| REST API | 外部集成 | 第三方系统对接（非 Codex 管理通道） |

### 2.3 项目结构（标准化）

```
projects/<name>/
├── project.json           # 统一配置（域名、路径、认证、环境）
├── AGENTS.md              # 项目约定入口
├── theme/                 # 区块主题源码
├── plugin/                # 业务插件源码
├── content/               # 内容数据（JSON）
├── scripts/               # 项目专属脚本
├── docs/                  # Brief、过程文档、验收证据
├── .lab/                  # 本地环境（gitignored）
└── .credentials/          # 凭据（gitignored，0600）
```

### 2.4 部署流程（标准化）

```
harness deploy
  │
  ├─ [1] 前置检查
  │     ├─ SSH 可用
  │     ├─ 站点身份匹配
  │     └─ 变更文件列表
  │
  ├─ [2] 冲突检测
  │     ├─ 数据库模板覆盖 vs 文件变更
  │     └─ 有冲突 → 提示处置选项
  │
  ├─ [3] 备份
  │     ├─ 当前主题/插件文件 → 本地
  │     └─ 当前数据库快照 → 本地
  │
  ├─ [4] 传输
  │     ├─ rsync 变更文件到服务器
  │     └─ 或 TUS 上传 ZIP 包
  │
  ├─ [5] 后处理
  │     ├─ wp cache flush
  │     ├─ wp rewrite flush
  │     └─ 激活新模板
  │
  ├─ [6] 验证
  │     ├─ 关键页面 HTTP 200
  │     ├─ 内容标记命中
  │     ├─ 标题层级 0 跳级
  │     └─ 询盘表哈希不变
  │
  └─ [7] 完成
        ├─ 输出变更清单
        ├─ 保存部署记录
        └─ releaseApproval = false（需人工确认）
```

失败自动回滚：步骤 [4] 前备份的文件在步骤 [6] 验证失败时自动恢复。

## 三、实施计划（四阶段）

### Phase 1：统一部署 + 回滚（最急）
- 合并现有部署脚本为单一 `deploy` 命令
- SSH 为主通道（rsync + wp-cli）
- 内置备份/回滚
- 前置检查 + 后置验证
- 预估：1-2 个工作日

### Phase 2：质量关卡整合
- 合并散落的检查脚本为一个 `check` 命令
- 统一输出格式和退出码
- 集成到 deploy 前置步骤
- 预估：1 个工作日

### Phase 3：新站初始化向导
- `harness init` 交互式创建项目
- 自动生成 AGENTS.md、目录结构、compose、内容模板
- 从 Brief 到首次部署的完整引导
- 预估：1-2 个工作日

### Phase 4：文档重组
- 合并重复的 reference 内容
- 建立清晰的阅读顺序
- 统一术语和流程描述
- 预估：0.5 个工作日

## 四、当前已完成的基础

| 已验证能力 | 验证方式 |
| --- | --- |
| SSH 连接 + WP-CLI | brightdozer 实测 |
| TUS 文件上传 | mediumblue + brightdozer 实测 |
| 增量预检（基线+覆盖） | 本地 reuse + brightdozer 实测 |
| 冲突处置（备份+重置+恢复） | 本地 reuse 实测 |
| 询盘安全（更新窗口双时点） | 本地 reuse 实测 |
| 标题层级关卡 | 本地 reuse + brightdozer 实测 |
| REST 写通道 | brightdozer 实测（有限制） |
| FF 表单创建 + 询盘端到端 | 本地 reuse + brightdozer 实测 |

## 五、成功标准

- [ ] 一条命令完成部署（含前置检查+备份+验证+失败回滚）
- [ ] 一条命令完成全部质量关卡
- [ ] 新站初始化 ≤ 3 步
- [ ] 文档 ≤ 5 个核心 reference
- [ ] 全部操作有测试覆盖
- [ ] 72+ 现有测试不回归
