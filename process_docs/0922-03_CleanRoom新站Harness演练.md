# 0922-03 CleanRoom 新站 Harness 演练

- 时间：2026-09-22 20:09:08 +08:00
- 触发原因：执行 WordPress Harness v2 clean-room 新站交付测试，验证最小经典 PHP + ACF 流程并修复发现的问题。
- Harness：`/Users/Zhuanz1/.codex/worktrees/harness-cleanroom/wordpress-builder-skill`，分支 `codex/classic-acf-v2`。
- 测试项目：`/Users/Zhuanz1/Documents/ChatGPT/wordpress-projects/harness-cleanroom`。
- 测试站：`https://grey-salmon-695379.hostingersite.com`（保留，不删除）。
- 安全边界：WordPress 管理凭据只保存在项目忽略目录的 0600 文件；SSH 私钥只按项目配置引用；本记录、命令回执与 evidence 不保存密码或私钥。

## 基线检查

- 在指定 Harness worktree 执行 `npm ci`、`npm test`、`npm run lint`；初始 89 个测试全部通过，lint 通过。
- 使用中央 `harness/cli.mjs init` 创建全新项目，未参考或复用既有客户项目内容。
- 本地初始内容完成后，`harness config`、`harness check` 通过；`doctor` 的必需项 node/git/rsync/tar/gzip/Hostinger CLI 通过。系统本机无 PHP 属非必需项，Docker PHP 语法检查通过。

## 交付内容

- 经典 PHP 主题：首页、产品 archive/single、产品分类、指南 single、RFQ 页面、404/search 等基础模板。
- 业务插件：`cleanroom_product` CPT、`product_collection` taxonomy、私有 `cleanroom_rfq` CPT、ACF local fields、nonce + honeypot + consent 的 RFQ 处理器。
- 最小 seed：1 个产品分类、1 个产品、1 篇指南、首页和 RFQ 页、导航、1 张本任务生成的中性 PNG 媒体图。
- 六条验收 URL：`/`、`/products/`、产品 single、产品分类、指南、RFQ 页。
- `project.json` 声明内容 marker、Products/Guides/RFQ 期望计数、媒体源、SEO organization、post types 与 taxonomy。

## 中央 Harness 执行记录

- `provision` 生成并开通 `grey-salmon-695379.hostingersite.com`，随后自动进入首次部署流程。
- 手动完整执行 `deploy --with-media --with-content` 成功：插件基线、主题/插件同步、WordPress 核心配置、Rank Math Free 1.0.279、媒体导入、seed、Hostinger cache、页面/数据库验证全部通过。
- `verify` 成功：6 个 URL 均 HTTP 200，每页恰好 1 个 H1，0 个标题跳级；Products=1、Guides=1、RFQ=1；Rank Math Free 非 Pro、账户跳过、前台初始化、index 与全部配置的业务子 sitemap XML 通过。
- RFQ 端到端测试成功：前台读取 nonce，POST 返回 302 到 `/request-a-quote/?rfq=thank-you`，前台显示成功提示；WP-CLI 读到 private post ID 15，`status` 计数 RFQ=1。
- rollback 测试成功：先创建稳定快照 `2026-09-22T11-51-58-349Z`，部署仅用于观察的 1.0.1 主题版本并验证站点可用；回滚后 WP-CLI 与 style CSS 均确认 1.0.0，6 页验证、数据库计数、RFQ 行和 Rank Math/sitemap 验证继续通过。
- 修复后重新执行 `verify`：5 个 sitemap（index、post、page、`cleanroom_product`、`product_collection`）均 200/XML；最终项目本地 `check` 通过，版本与远端一致为 1.0.0。

## 发现问题与 Harness 修复

1. 全新项目没有 `project.hostinger` 时，provision 在回读 Hostinger user/admin defaults 前读取 undefined 属性失败。已改为 safe access，并补 2 个 new-account regression tests。
2. 全新 WordPress 安装刚就绪时后台仍在写入插件，首次 `tar` 备份报 `file changed as we read it`。已在 `backupProject` 增加有限重试，并补 regression test。
3. Seed 被移动到远端 staging 后，项目脚本若按原始项目路径读站点数据会失败。Harness 现显式按顺序传递 staged media map 与 site data 参数，并在模板 README 说明契约；补 ops regression test。
4. Rank Math 验收此前只硬编码 index/page sitemap。已从 `project.json` 派生所有启用的 post type/taxonomy 子 sitemap 并逐个验证 XML；补 seo regression test，并用于最终站点验证。

## 跨项目规范回写

- `.agents/skills/wordpress-builder/references/hostinger.md`：新项目 provisioning 参数、website 就绪不等于安装文件稳定、备份竞态处理。
- `.agents/skills/wordpress-builder/references/seo.md`：index 与全部业务子 sitemap 逐一 XML 验收，私有 RFQ 不进入派生列表。
- `.agents/skills/wordpress-builder/references/classic-acf-default.md`：seed staging 契约、业务 sitemap、rollback 后可用性验收。
- `docs/19-经典主题ACF生产部署与Harness.md`：clean-room 演练补充、新修正项与最终测试规模。
- `harness/templates/README.md`：明确 seed 参数契约。

## 最终质量结果

- 最终 Harness：`npm test` 94/94 通过；`npm run lint` 通过；`git diff --check` 通过。
- 最终项目：`harness check` 通过；本地主题版本与回滚后的远端一致。
- 保留站点最终验证通过：`https://grey-salmon-695379.hostingersite.com`。

## 证据与产物

- 项目验收证据：`/Users/Zhuanz1/Documents/ChatGPT/wordpress-projects/harness-cleanroom/evidence/`
  - `verify-after-deploy.json`、`status-after-deploy.json`
  - `rfq-form.html`、`rfq-form.headers`、`rfq-submit.headers`、`rfq-thankyou.html`、`rfq-thankyou.headers`、`rfq-db-row.txt`
  - `status-after-rfq.json`、`verify-after-rfq.json`
  - `sitemaps.txt` 及各子 sitemap XML
  - `rollback-baseline.json`、`rollback-console.log`、`style-before-rollback.txt`、`style-after-rollback-cachebust.txt`、`theme-version-after-rollback-wpcli.txt`、`verify-after-rollback.json`、`status-after-rollback.json`
  - `final-verify-after-harness-fix.json`
- Provision/deploy 回执：项目 `.wordpress-builder/provision-console.log`、`provision-deploy-console.log`、`deploy-console.log`。
- 回滚快照：项目 `.backups/2026-09-22T11-51-58-349Z/`（含 manifest、主题/插件 tar、database dump）。
- Harness 修复与测试：
  - `harness/lib/hostinger.mjs`
  - `harness/lib/ops.mjs`
  - `harness/lib/seo.mjs`
  - `harness/templates/README.md`
  - `tests/harness/hostinger.test.mjs`
  - `tests/harness/ops.test.mjs`
  - `tests/harness/seo.test.mjs`

## 遗留说明

- Hostinger 新站默认激活了 hostinger 相关助手/引导插件；本轮验收未依赖它们，也未删除主机自带插件。后续项目如要求插件白名单，应在 `disabledPlugins` 或独立插件基线 gate 中显式处理。
- 第一次 provision 失败生成的域名已通过原命令显式传入后成功恢复；为避免中断后只依赖人工记忆，后续可评估在生成子域后立即原子回写 project.json。

## 第二轮：B2B 全流程压测（20:55–21:20 +08:00）

- 升级为完整 B2B 信息架构（NOVALUX Industrial Lighting 演示品牌）：6 产品（ACF 规格 repeater）、4 产品分类、3 行业方案、3 知识指南、1 新闻、About/Contact 页、11 张媒体图、重建导航。
- 第 1 次部署失败：contentCounts 中 taxonomy 被当 post type 计数为 0 → 验证失败自动回滚（自动回滚按预期工作）。
- Harness 修复：`contentCounts` 支持 `kind: post|term`，`verifyDatabase` 分支使用 `wp term list`；新增回归测试（95/95）。
- 流程事故：手写重写 project.json 丢失 provisioned `domain/ssh/hostinger` 字段 → 远程命令被正确拒绝；已恢复字段并记录教训。
- 第 2 次部署成功：22/22 URL、6 项计数、7 个 sitemap 全过；新版 /contact/ 表单提交 RFQ（ID 83，302 → thank-you）。
- 证据：`evidence/verify-b2b-final.json`、`status-b2b-final.json`、`b2b-rfq-rows.txt`、`.wordpress-builder/deploy-b2b-console.log`。

## 第三轮：真实媒体素材替换（2026-09-22 21:50–22:20 +08:00）

- 11 张 Unsplash 免费许可照片替换渐变占位图（6 产品 / 3 行业 / hero / factory），清理 v1 遗留 PNG；`--with-media` 重新导入 attachment 101–111，seed 刷新缩略图与 alt。
- 部署期 Hostinger 共享主机 SSH/HTTP 持续抖动：第 3 次部署页面验证因单页 15s 超时失败→回滚；第 4 次部署 SSH 连接超时失败；`harness verify` 两次随机单请求失败（index/分类 sitemap fetch failed）。
- 据此补两个验证层重试补丁并已提交：
  - `71eacc3` verifyPages 对 status 0 传输失败重试 2 次；deploy 失败时逐页打印失败原因（否则只报 "remote verification failed" 无法定位）。
  - `e432321` verifyRankMath sitemap 检查对 status 0 重试 2 次。
  - `9a300b3` verifyDatabase 对 SSH 瞬时超时重试（第 4 次部署中数据库计数被 SSH 断连打断）。
- 结论：SSH 层 `runWithRetry` 原本就覆盖 Connection timed out（3 次重试），第 4 次失败是主机持续 1 分钟以上不可达，属基础设施不稳定而非代码缺陷；当晚后续操作均以重试验证通过。
- 最终验证全绿：22/22 页、6 项计数（RFQ=2）、7 个 sitemap 200/XML；产品页 img 指向真实上传 JPEG（200 / image/jpeg / 188KB），media-map 指向 attachment 101–111。
- 证据：`evidence/verify-b2b-images-final.json`、`status-b2b-images-final.json`、`b2b-image-load-check.txt`、`.wordpress-builder/deploy-b2b-images-console.log`、`deploy-b2b-final-console.log`。
- Harness 最终提交链：`102ea2e → d347414 → 71eacc3 → 9a300b3 → e432321`（全部 ff 到 `codex/classic-acf-v2`，测试 97/97）。

## 第四轮：遗留欠债清偿（2026-09-22 22:40 +08:00）

- 沉淀审计：8 个已修问题均有代码+回归测试+文档四层落点；2 个"已记录未修"遗留项本轮闭环。
- 修复 1：provision 生成子域后立即原子写入 project.json（此前中断后域名只存终端输出）。测试：等待建站超时后盘上仍有域名。
- 修复 2：`--with-media` 幂等导入——只上传媒体地图缺失的键，不再整库重复导入（B2B 三轮已堆 6 套重复附件）。测试：已映射键跳过、仅上传新文件。
- 远端核对：本仓库未配置 git remote，`codex/classic-acf-v2` 目前为本地分支；如需异地固化需先添加 remote。
- 测试 99/99，lint 通过；分支链新增 `persist-domain`、`idempotent-media`、docs 共 3 个提交。

## 第五轮：维护层 + 通用性整改（2026-09-23）

- 通用性审计抓到 2 处中心代码过度拟合并修复：seo.mjs 硬编码 it_rfq（IRONTRACK 残迹）、ops.mjs 硬编码 Asia/Shanghai 时区（现由 project.timezone 声明，缺省不动）。
- 维护命令层（SSH-first、内容无关）：edit-page / post push（指纹 drift 检测 + --adopt-remote + readback + journal）、nav add|remove（外科手术式）、template assign（Template Name + the_content 校验 + meta readback）。seed 降级为首次开通专用。
- 线上实测：about 冲突拒绝→adopt 接管(id 42)→幂等 no-op；QA Flow Test 导航增删往返且兄弟项存活；qa-flow-article 草稿推送往返并清理。过程中抓到 WP 陷阱：post_status=any 不含 draft，指纹查询改为显式状态列表。
- 测试 107/107，lint 通过。用户故事 ①改首页 ②加导航 ③传文章 ④模板指派 全部一等命令闭环。

## 第六轮：视觉设计系统 v3（2026-09-23）

- 应用户"明亮简洁高级工业 B2B"要求，主题样式全量重写（v3.0.0）：设计令牌化（色板/字阶/圆角/阴影）、吸顶导航、双栏 hero + 数据条、eyebrow 分区标题、卡片 hover 体系、规格表、浅色 CTA 带、四栏页脚；响应式三档断点 + prefers-reduced-motion。
- 模板同步重构：front-page（hero 图取 hero 附件 + 四个分区 + Buyer guides）、archive 页头组件化、产品页双栏 + 规格表 + 询价 CTA 卡、行业页页头化。
- `deploy --skip-content` 全绿：22/22 URL、6 项计数。截屏核验首页与卡片区；发现并修复 LED Panel 摘要含 `UGR<19` 被截断问题（改写文案后 seed 重推，线上已确认）。
- 测试项目仓库完成首次提交 `de4e3b5`（38 个文件：主题/内容/seed/媒体/配置）。
- 待办：AI 产品渲染图替换库存照片（可选）、落地页模板 + template assign 实测、配 remote 推送。
