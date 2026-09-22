# Codex WordPress 建站工具与研究资料

## 正在开发的 Codex 入口

用户最新目标是用 Codex 完成自动 WordPress 建站并开发对应 Skill。新增独立工具位于 `src/`，项目 Skill 位于 [.agents/skills/wordpress-builder](.agents/skills/wordpress-builder/SKILL.md)。原始资料保留在下方目录；当前进展见 [实施与验收路线](docs/05-Codex实施与验收路线.md)。完整自主建站目标仍在进行。

```bash
npm ci
npm run typecheck && npm run lint && npm test
npm run build
node .agents/skills/wordpress-builder/scripts/wp.mjs --help
```

运行需要 Node.js 22+。构建后的 Skill 内执行文件包含运行依赖，可与 Skill 目录一起复制；Playground 只用于开发。项目内自动发现使用 `.agents/skills/wordpress-builder`，全局安装可将构建后的整个目录复制到个人 Codex skills 目录，避免覆盖已有同名 Skill。

连接凭据通过环境变量配置：`WP_URL`、`WP_USERNAME`、`WP_APP_PASSWORD`；特殊 REST 根用 `WP_REST_URL`。不在命令参数、文稿或 Git 文件中放密码。

```bash
node .agents/skills/wordpress-builder/scripts/wp.mjs doctor --task .wordpress-builder/my-site
node .agents/skills/wordpress-builder/scripts/wp.mjs build --plan my-site.json --task .wordpress-builder/my-site
# 在实际草稿预览完成，且已有发布授权后：
node .agents/skills/wordpress-builder/scripts/wp.mjs build --plan my-site.json --task .wordpress-builder/my-site --publish
```

当前工具支持新页面建站、保留原文发布、首页设置、简单区块导航、带前后稿的页面编辑及图片/PDF上传。新增实际 CPT/ACF schema 发现、字段更新、原生文本字段绑定和 CSV 草稿导入，已在隔离 WordPress 实测。复杂内容局部编辑、产品模板适配、表单送达与 SEO 插件仍待实现；特色图参数已接入但尚需实测。不要将阶段能力当作整套验收通过。

隔离测试：`npm run lab` 启动保存到 `.lab/` 的真实 WordPress；另一终端用 `npm run lab:wp -- doctor --task .lab/run-01`。`examples/` 是虚构企业资料，仅用于隔离测试。凭据和数据库不提交。实际 WP/PHP 版本须读运行证据；启动参数并非安装版本证明。

## 交接资料说明

从「章鱼外贸 AI 工具箱」项目及当前会话整理，2026-09-08 同步。

产品目标：**用户只使用浏览器 AI Agent，就能完成标准外贸网站建设和运营。** 用户已有 WordPress 站点、主题与授权；域名、主机和任意复杂定制不是已实现能力。

当前采用原生区块（Gutenberg）＋共享 WordPress 连接器＋场景 Skill。沿用用户现有主题，区块主题优先适配；ACF 与自定义内容类型按站点实际能力使用。**不把 WordPress 主题捆绑进浏览器扩展。**

## 从这里开始

1. [会话决策与研究经验](docs/01-会话决策与经验.md)：为什么选择这条路线、哪些旧方案已撤回。
2. [架构、场景与当前状态](docs/02-架构场景与当前状态.md)：能力边界、执行接口、通过及未通过的验收。
3. [Skill 清单与迁移说明](docs/03-Skill清单与迁移.md)：5 个 WordPress Skill、21 个相关 Skill，以及接入要求。
4. [新项目研究与实施路线](docs/04-新项目研究与实施路线.md)：接下来按什么顺序验证和开发。
5. [原始资料索引](docs/原始资料索引.md)：逐份查阅已复制的研究、方案、源码和过程记录。

## 资料组织

| 路径 | 内容 |
| --- | --- |
| `docs/` | 本次整合说明、原始资料索引、历史参考链接 |
| `skills/wordpress/` | 5 个按当前运行时实际导出的 WordPress Skill 包 |
| `skills/related/` | SEO、内容写作、网站规划、落地页等 21 个相关 Skill 包 |
| `skills/manifest.json` | Skill 名称、内容版本、产品元数据和文件列表 |
| `source-snapshot/docs/` | 原项目研究报告、架构方案、模块说明、截图与验收证据 |
| `source-snapshot/process_docs/` | 历史过程记录，保留成功、失败和方案变更 |
| `source-snapshot/src/` | 连接器、Skill 打包及关键执行代码参考 |
| `source-snapshot/tests/` | WordPress 与工具选择、审批等测试参考 |
| `source-snapshot/wordpress-site/` | 可选站点能力插件、开发测试夹具及已撤回主题实验源码 |
| `archive/skill-package-versions.json` | 55 个相关历史/当前包版本记录，用于追踪，不是全部启用清单 |
| `SYNC-MANIFEST.json` | 复制来源、逐文件 SHA-256、源分支与快照时间 |

以下交接内容是一次资料快照，不是自动双向同步。`source-snapshot` 本身不是独立应用，其中 TypeScript 依赖原扩展宿主和未全部复制的通用模块；不要运行快照内原项目的构建脚本。根目录新增工具使用自己的构建和测试命令。

## 交接快照中的历史验收结论

真实 WordPress API、原生区块、四页草稿、原生首页设置和简单导航分别有阶段验证；**完整真实模型自主建站尚未通过**。最后三轮模型测试已暂停，四页发布、首页与导航的完整自主执行没有完成。模型凭据已成功复用，阻塞不是用户没有配置 API。

最新边界见 [最后一轮结果](source-snapshot/docs/research/browser-wordpress-site-20260908/e2e/current-result.json)。历史文档中的“待配置模型”“已安装主题”“集成完成”等表述必须结合日期和阶段阅读，不能覆盖本说明。

上段属于原浏览器扩展交接状态。当前 Codex 独立工具的新进展见 [实施与验收路线](docs/05-Codex实施与验收路线.md)、[四页真实验收](docs/06-Codex首轮真实验收.md) 和 [CMS 验收](docs/07-CMS字段与导入验收.md)。

源工作区为 `codex/agent-workspace-sandbox`，核对 HEAD `44bf53176ef5fb3ec119046bb9fea660e1935d05`，包含大量未提交工作区内容；该 SHA 不代表已经提交了所有复制文件。目标仓库沿用现有 `main`，本次未提交、未推送、未发布 GitHub。

资料包不包含模型密钥、WordPress 应用密码、浏览器 Profile、登录 Cookie 或本地私有证书。各 Skill 和站点插件保留其原有许可证；没有为整个资料包重新授予统一许可证。第三方链接、安装量、版本与接口可用性均是历史研究信息，正式实施前重新核实。

校验复制文件：`node scripts/verify-snapshot.mjs`。
