# Hostinger 部署方案

决策：2026-09-20，Asia/Shanghai。当前唯一计划支持的公网托管目标为 Hostinger Managed WordPress；暂不开发 SiteGround 或多供应商适配，不要求使用 VPS。选择支持 SSH/WP-CLI、文件传输及所需备份/测试环境能力的套餐，购买前以实际账户及套餐核对。

状态：参考仓库已实现 `npm run test:starter:release`，完成当前区块样板的私有完整发布包、隔离空白安装、询盘与 MySQL 恢复验收；详见 [完整包复验](verification.md#完整发布包的隔离复验)。它不是任意客户站的通用安装器，已另外通过真实账户的空白站创建和 WordPress 安装验证；当前参考站已通过官方 CLI TUS + 受限一次性 cron/WP-CLI 完成真实首次部署；通用远程部署执行器仍未完成。现有本地部署/恢复测试及 `build --publish` 不代表远程部署通过。

## 工具与责任

| 层 | 采用方式 | 职责 |
| --- | --- | --- |
| 网站 | 原生区块主题、业务插件、ACF、Fluent Forms Free、Rank Math Free | 沿用插件基线，不因主机选择更换编辑架构 |
| 托管管理 | Hostinger 官方 CLI/API；MCP 可选 | 查询资源与权限、执行实际接口支持的托管操作；脚本优先 CLI 的结构化输出 |
| 文件与 WordPress | SSH/SFTP；确认可用后采用 rsync；远端 WP-CLI | 部署代码和媒体、插件配置、数据库导入、序列化安全的 URL 替换、缓存和重写规则 |
| 编排与验收 | wordpress-builder + 官方 wp-wpcli-and-ops | 目标核对、阶段执行、失败停止、回执、恢复与页面业务验收 |

CLI 和 MCP 使用同一供应商 API，不重复封装同一操作。必须查询当前版本及真实接口；主题/插件 deploy API 的“已上传目录”前提不能省略，也不能当成整站数据库发布。异步操作返回已排队后须查询完成状态再执行依赖步骤。

Hostinger AI/WordPress MCP 插件不是部署必需项，不加入统一必装清单。缓存与安全能力按实际主机评估，避免与主机服务重叠；发现主机预装插件先列清单、说明归属，不自动批量删除。Rank Math 保持唯一 SEO 输出负责人。

## Harness v2 首次开通

新站授权后使用中央 Harness，不用临时脚本：

```bash
node harness/cli.mjs --project <site-dir> provision
```

它按官方 CLI 执行：website list → 必要时 free subdomain/website create → installation list → 必要时 WP install → 轮询异步结果 → 回写目标路径。新管理员凭据只写入项目忽略目录的 0600 JSON；CLI 回执只允许出现路径，不允许出现密码。SSH host/port/key 不能从 Hostinger website API 假设时，必须用 `--ssh-host/--ssh-port/--ssh-user/--ssh-key` 显式提供；缺失时不冒充可部署。

已存在网站/安装时命令必须幂等：只回读和补齐 project.json，不重复建站，不覆盖已有 WordPress。创建成功后默认进入首次 deploy；如只做开通，用 `--no-deploy`。

## 项目配置

客户项目 AGENTS.md 链接本规范，记录实际部署配置位置与已实现命令。私有目标配置放项目忽略目录（本仓库为 `.wordpress-builder/`），至少区分：

- provider=hostinger、环境 staging/production、站点资源标识、实际套餐和权限。
- SSH 别名、已核对的主机指纹、WordPress 绝对路径、源 URL、目标 HTTPS URL。
- 源码版本/未提交变更摘要、构建产物哈希、插件清单、媒体/数据库快照位置。
- 凭据来源引用、备份位置、邮件配置来源、发布授权范围及验收记录位置。

密钥放本机安全存储或部署环境 secret，不写进 Git、AGENTS.md、命令回执或聊天。不能把上述字段直接塞入现有 `project-init` schema：该接口尚未支持部署目标配置。目标域名、账户与路径未知时只准备本地产物，不猜测远端参数。

## 首次发布：本方案新建网站

1. **本地准备**：完成实际页面/编辑/询盘/SEO 检查，生成文件清单及哈希。生产包排除本地 wp-config、测试账户凭据、Mailpit 配置、邮件捕获/测试检查 MU 插件、缓存和日志。演示内容与图片需单独确认商业发布适用性。
2. **远端预检**：核对账户、站点、绝对路径、PHP/数据库/WordPress/WP-CLI 版本、配额与权限。确认是授权的新站目标；空白主题页不等于空数据库。目标非空或状态不符则停止写入并报告差异。
3. **快照**：保存目标原有文件与数据库的可恢复快照。保存回执与恢复方法，不能仅依赖“主机有备份”的营销声明。
4. **传输和安装**：发布已验收主题/业务插件及媒体，按插件基线验证第三方依赖。生产 wp-config 采用目标环境数据库及独立密钥，不复制本地凭据。首次数据库导入包含页面、导航、模板覆盖、产品、ACF、表单及 SEO 设置；检查测试用户和测试询盘的处理结果。
5. **配置切换**：导入后重新应用目标环境的邮件、账户和索引策略，防止本地设置覆盖正式配置。URL 替换按官方 WP-CLI 流程先备份、dry-run，再执行；正确处理序列化字段、明确表范围并保留 GUID 语义，禁止 SQL 文本全局替换。刷新重写与适用缓存。
6. **预发布验证**：测试环境保持访问限制和 noindex；检查上传图片、全部关键路由、编辑回显、表单入库与收件、canonical/站点地图、导航、移动端及恢复。线上邮件测试须使用授权的测试收件人。
7. **正式上线**：按已有授权范围完成 DNS/TLS 和最终域名配置；核对公开环境索引状态、邮件、防垃圾与缓存。保存远端实测结果，不把本地通过直接复制成远端 pass。

DNS 不一定由 Hostinger 托管；外部 DNS 的变更能力单独核对。当前方案不承诺零停机、原子发布或自动回滚，须在真实主机实测后才能声明。

## 后续更新与失败恢复

首次发布和后续维护是两条操作路径。后续默认只发布批准的主题/插件文件及明确的数据变更；保留线上产品编辑、媒体、用户和询盘，禁止再次全量导入本地数据库或重跑 demo seed。不要用 rsync --delete 同步整个 wp-content。

执行器应逐阶段记录 started/completed/failed/unknown 和产物身份；未知结果先查远端，不自动重放导入、安装或发送动作。文件回退和数据库恢复分别规划，出现新询盘后不能无评估恢复旧数据库。实际恢复演练是上线验收的一部分。

## 实施顺序与验收边界

当前参考站本地发布包与排除规则已完成实跑。Hostinger 只读预检工具已完成本地实现与测试；用户已购买套餐，现已通过官方 CLI 创建真实临时 WordPress，并完成当前参考站的首次整站部署、资源完整性和询盘入库验收；SSH 路径尚未验收。同主机独立数据库/非公网目录的 CLI 恢复已验证；下一阶段为真实邮件配置/送达、正式域名发布及增量更新验收。尚未提供账户/套餐/目标时，可继续本地打包和模拟环境验证，不能把模拟结果标为 Hostinger 验收。

不增加第二套项目里程碑：沿用 discover 至 release 的现有编排；`project-record` 只记录证据，不执行部署。现有 `build --publish` 是内容发布门禁，与托管发布不同。

## 官方依据

2026-09-20 已查阅：

- [Hostinger 官方 API MCP](https://github.com/hostinger/api-mcp-server)：含 WordPress 主题/插件管理与从已上传目录部署的接口。
- [Hostinger 官方 CLI](https://www.hostinger.com/support/11679133-how-to-use-hostinger-api-cli/)：安装、认证、JSON 输出及 API 命令参考。
- [Hostinger 文件传输与服务器访问](https://www.hostinger.com/support/which-file-transfer-and-server-access-options-are-supported-at-hostinger/)：SSH/SFTP/rsync 能力随套餐变化。
- [Hostinger SSH](https://www.hostinger.com/support/1583245-how-to-connect-to-a-hosting-plan-via-ssh-in-hostinger/)：账户启用与连接方式。

这些资料证明工具接口存在，不证明我们的账户权限、整站发布脚本或线上业务已经验收。

## 本地预检工具（参考仓库）

当前提供 `scripts/hostinger/preflight.mjs`，不包含部署写入功能。无需账户即可运行：

```sh
npm run hostinger:preflight -- config/hostinger-staging.example.json
```

这只校验配置和检测本地 CLI，输出 remote=not-tested；不是远端预检通过。Hostinger CLI 缺失会单独报告，不妨碍 SSH 预检代码开发。本项目本机现已安装官方 CLI 3.35.0，并验证已有账户授权可读订单及开通站点；其他用户环境仍须实际检测。

有测试站后，将样例复制到忽略目录 `.wordpress-builder/hostinger/target.json`，填写实际 Hostinger 测试站的 SSH 别名、WordPress 绝对路径和 HTTPS 地址。别名在本机 SSH 配置中管理密钥与连接端口；主机指纹通过可信渠道核验并写入 known_hosts，不关闭 StrictHostKeyChecking，也不把首次扫描自动当作可信身份。目标 JSON 不接受密码、Token 或额外字段。

```sh
npm run hostinger:preflight -- .wordpress-builder/hostinger/target.json --connect
```

`--connect` 才连接远端；样例占位值拒绝连接。当前仅支持 staging，不接受 production。SSH 使用 BatchMode、严格主机身份检查、超时、禁用 Agent/端口转发；读取 PHP/WP-CLI/核心版本、配置中的表前缀，再通过数据库 SELECT 核对 home/siteurl/blog_public，并检查 wp-content 可写性。不启动 WordPress 主题/插件/MU 生命周期，不安装或导入任何内容。读取 wp-config 本身仍依赖目标可信配置，不将未知站点当作沙箱。

远端检查报告仅保存在 `.wordpress-builder/hostinger/`，失败时不输出可能包含配置的原始 stderr。结果为 preflight-passed-not-deploy-authorized 也只代表这些检查通过：Hostinger 账户归属、套餐、目标是否可覆盖、备份、运行版本兼容性、邮件、DNS/TLS、文件传输与部署仍须分别验证。报告不自动触发下一步写入。

经验规则：配置格式正确、SSH 连接成功、WordPress 站点身份匹配及能够部署是不同状态，不能合并为“部署准备就绪”。本地单元测试覆盖输入注入、凭据混入、错误域名/noindex/目录权限、样例防误连；尚未在真实 Hostinger 验证远端执行。


## 从已购买套餐自动开通（真实验证）

2026-09-20：官方 Homebrew CLI 3.35.0（ae73453）实测完成读取订单、生成免费子域名、首次开通站点、安装 WordPress 7.1.1、HTTPS 与管理员登录检查。不要因为本地预检工具只支持只读就让用户自行建站；已有开通授权时，先检查官方 CLI/MCP 能力及已有认证。未授权才使用官方登录流程，不让用户把 Token 发到聊天。

可复用顺序：

1. `hostinger version`；缺失时按官方 `brew install hostinger/tap/hostinger` 安装，再读取命令 help。先执行 `hostinger hosting orders list --format json` 判断实际认证，不能先假定没有凭据，也不重复要求用户授权。
2. 列出 websites 和可用 datacenters，核对已购订单及站点是否存在。用户界面套餐名称与 API 内部 plan 名可能不同，绑定实际订单，不按营销名称硬编码。此次用户称 Unlimited，实际订单内部名称为 hostinger_business_v5；不据此推导其他账户权益。
3. 没有正式域名时用 `hosting domains generate-free-subdomain` 获取平台提供的域名，再调用 `hosting websites create`。首站必须提供接口返回的 datacenter_code；它会影响同套餐后续站点。按目标市场选择，未指定且适合时说明采用平台首选项。本轮为 boston。
4. 创建响应 Request accepted 只代表排队。私有日志先记 started/目标，再记 submitted；查询 websites 找到匹配域名及订单后继续。超时或结果未知时先查询，不重复创建。
5. `wordpress installations list --username ... --domain ...` 确认目标没有安装。`wordpress installations install <username>` 的 credentials JSON 字段是 **email、login、password**；不是 username/admin_password。必须看当前官方接口类型；本轮 CLI 的 JSON 参数不支持 @file。密码在脚本内随机生成，私有文件权限 0600，禁止把生成值打印到日志/聊天或写入仓库。管理员邮箱属于必要配置，可询问用户，不需要用户手动建站。
6. 以 overwrite=false 安装，使用独立新管理员，语言按项目要求；本轮 en_US、核心 minor 自动更新、平台默认兼容版本。随后查询 installations 的有效状态及实际核心版本；不能将本地 WP 7.1 的验收自动套到远端 7.1.1。
7. 查 SSL 实际状态和 HTTP/HTTPS 响应，再核对 WordPress home/siteurl。安装列表一度报告 http，但实际后台已为 https，不能只依赖列表中的 URL 做错误修复。预览站设 blog_public=0，读回后台并检查前台 robots；noindex 不是访问密码保护。
8. 私有配置保存订单、域名、账户路径、安装标识及状态；公开报告只保存必要的验证结果，不包含邮箱、密码、Token 或自动登录链接。本轮 provision.json 和 wordpress-admin.json 位于仓库忽略的 .wordpress-builder/hostinger/。

如果 CLI 未提供某个 WordPress 设置接口，可用已授权的后台会话读取实际表单和 nonce，保留原字段后提交并读回，不猜字段、不从其他页面复用 nonce。不要为了一个设置随意安装额外插件。

边界：此次已证明真实空白站可以自动开通，未证明自定义整站包部署、SSH、业务插件基线、真实询盘邮件或主机备份恢复完成。官方 MCP 还提供封装上传的 import/deploy helpers，应按真实接口评估复用，不因底层 deploy API 要求“已上传目录”就断言所有官方工具都不能完成上传。

后台会话实现经验：Python CookieJar 内有线程锁，不能直接 pickle。需要跨步骤保留会话时使用标准 MozillaCookieJar/LWPCookieJar 的 save/load，文件放私有忽略目录并设 0600；会话过期重新登录，不把缓存 cookie、nonce 或 HTML 当作可公开证据。此为本轮实际失败后修复并完成设置回读的做法。

## 真实首次整站部署：CLI 文件传输 + 一次性 WP-CLI 任务

2026-09-20 已在当前授权的新站验证，证据见仓库 `docs/acceptance/hostinger-deployment/`。这是特定新站的已验证操作路径，尚不是任意客户站一键部署命令，不可用于后续更新时覆盖线上询盘。

- 官方 MCP 1.61.1 的 `hosting_importWordpressWebsite` 会先检查 `is_empty`；已装默认 WordPress 不能当作空目录。不要为了使用该助手自动删除已有安装。当前通过官方 CLI TUS 传输、cron API 调用主机 WP-CLI 完成部署，保留平台 wp-config、核心、HTTPS 和已有插件文件。
- 上传前先创建受保护的临时目录，上传 `.htaccess`（`Require all denied`）和无敏感内容的探针，用实际 HTTPS 请求确认 403 后才传 SQL/归档。保护文件和目录不能放进后续解包覆盖范围。上传凭据仅存在进程内，禁写日志。
- 本地脱敏包没有用户且 active_plugins 为空；在隔离数据库建立目标管理员、通过 WP-CLI 执行序列化安全的 URL dry-run/替换、设置目标邮箱和 noindex，再导出。禁止直接导入未经目标初始化的脱敏数据库，也不从本地复制 wp-config 或测试邮件 MU。
- 远端没有 SSH 时，可在明确授权范围内使用官方 cron API 执行固定任务脚本；不建立 Web 公共执行接口。先做只读预检，明确目标 URL、表前缀、原有内容、运行版本及插件。任务须原子锁防重放、持久阶段日志、记录 uid，结束删除 cron。API accepted/空 output 都不能证明执行成败，需核对持久日志与站点实态。
- 当前 cron PATH 没有 wp；上传已验证的 WP-CLI phar，通过 `/usr/bin/php` 调用。PHP 8.3.33 默认 CLI 禁用 proc_open/proc_close；本次仅为 CLI 调用指定 `-d disable_functions=` 后通过，不改变 Web PHP 配置。其他主机须重新确认，不把这一覆盖项无条件用于所有环境。
- 首次覆盖前将数据库、wp-content、wp-config 和 .htaccess 备份到 document root **外**的私有路径，保留校验和与恢复路径；首次部署时完成备份；后续已通过同主机隔离 CLI 恢复，原位回滚及跨主机恢复未验。校验上传包 SHA-256 后再进入维护模式、解包、导入、更新数据库版本、刷新重写和缓存，最后退出维护模式。
- **实际故障：`umask 077` 会影响非 root tar 解包目录权限，即使归档目录原本为 0755。** 本次 wp-content、themes、plugins 变成 0700，PHP 能读取并渲染页面，但静态资源 404。解包后显式恢复公开资源路径的父目录及内容目录 0755、文件 0644；私有备份/SQL/临时目录仍保持私有或访问拒绝。不要对整个主机 HOME 做递归 chmod。
- 退出维护模式不等于验收通过。验证关键页面/404、CSS/JS/图片的状态与 MIME、移动导航、内嵌和弹窗询盘、后台实际记录、管理员登录及所有发布文件哈希。仓库新增只读资源检查器：`node scripts/hostinger/check-assets.mjs URL report.json / /equipment/ /contact-us/`；这只验证指定页面引用的同源资源，不代替浏览器、完整文件或邮件验收。
- 验收后删除该轮 SQL、归档、WP-CLI phar 和任务脚本，删除 cron 并复查列表；备份保留在公网目录外。保留 mock/noindex 和未完成项目的真实状态，不因网站已可访问就宣称正式商业上线或邮件送达。

### HTML 缓存与旧首页

本次主机默认 .htaccess 把 ExpiresDefault 设为一周，导致新站旧首页在浏览器继续缓存，即使 CDN 已清理且新的 CLI/浏览器会话均正确。部署验收必须检查**HTML Cache-Control**，并覆盖既有访问会话；不能凭清缓存 API accepted 或新会话正常否定用户截图。当前 mock 预览开启平台 cacheless，并给 PHP 响应显式 no-store/no-cache/must-revalidate/max-age=0；两个 DNS A 地址经有效 TLS 实测返回新首页。既有浏览器缓存需要一次强制刷新或带新查询参数重新获取。生产站应制定 HTML 重验证和 CDN 清理策略，静态指纹资源可长缓存；不要无条件复制预览禁缓存策略到所有正式站。

### 发布后差异诊断顺序与自动检查

1. 先保留用户看到的 URL/截图/时机和原地址的响应头，区分“观察到旧页”与“已确认原因”。用户反馈未解释前，不用自己新会话的成功否定差异。
2. 比较同一不带参数 URL 在已有会话、无痕/新会话、无 Cookie 的网络请求中的站点内容标识；带参数只作诊断，不替代原地址交付。用户确认无痕正常与原会话旧页，加上旧 HTML 长缓存头，才形成这次浏览器缓存问题的完整证据。
3. 再检查 HTTP/HTTPS 跳转、DNS/CDN 节点及源站身份，先证据后修复，不因旧页面自动改 DNS，也不以清 CDN 代替清浏览器缓存。
4. 修复后复验原始地址与资源。预览自动检查：`node scripts/hostinger/check-preview.mjs HTTPS_URL EXPECTED_MARKER report.json / /contact-us/`，要求预览 HTML no-store、内容标识匹配、无查询参数或跨站跳转。正式站不套用此 no-store 门槛，另验 HTML 重验证策略。该命令不能读取或清除用户已有浏览器缓存。
5. 完成清理与交付：明确后台入库/邮件送达/恢复演练各自状态，记录剩余事项；临时任务 uid、脚本和敏感上传产物逐一清理，备份继续留在 document root 外。

邮件前置查询须区分已配置域名与未使用权益：portfolio 中 domain=null、pending_setup 的 free_domain/free_domain_transfer 不代表可用域名；mail orders 为空不证明整个主机没有发信能力，但不能声称已存在配置好的邮箱/邮件服务。管理员通知收件邮箱不等于经认证的 From 发件身份。

### 隔离恢复实测与证据时效

2026-09-20 在独立数据库与非公网目录恢复线上快照，11 张业务表与 8879 文件校验一致，19 产品和 2 询盘保留。恢复环境关闭 cron/自动更新、隔离平台 MU 插件并使用独立配置，不在生产库演练。此结论仅覆盖当时快照、同主机 CLI 启动及数据/文件一致性，不覆盖浏览器恢复站、原位回滚、跨主机或快照后的代码修复。详见仓库 docs/acceptance/hostinger-deployment/recovery.json。

发布包完整性、部署后变更、恢复快照分别绑定时间和产物身份；定点修复通过后不沿用旧全量哈希宣称最新版本已全量恢复。初次部署与保留线上新询盘的增量更新必须分别验收。

### 只读线上主题基线

官方 CLI files list-website-and-directories + website-content 可读取主题文本，无须上传远端脚本。参考仓库命令：`node scripts/hostinger/theme-baseline.mjs USER DOMAIN THEME CANDIDATE_DIR REPORT.json`。目录分页、重复项、符号链接、深度边界及内容长度必须检查；当前接口最大目录深度为 10。读前后目录清单核对只能发现部分并发变化，不提供原子快照。

实测文件内容接口可能去掉末尾 LF：此时仅在本地完整字节数相同、仅末尾 LF 差异且余下内容完全一致时标记 normalizedFinalNewlineMatches，不能声称远端字节哈希完全一致。未知截断直接失败；字体等二进制明确 unverified。结果只检查主题文本，不包括插件、数据库覆盖或自动发布授权；releaseApproval 始终 false。

### 远端只读冲突预检（真实验证）

`npm run hostinger:remote-preflight [CANDIDATE_THEME_DIR]` 串联远端冲突检测的只读部分：CLI 基线 → 离线派生变更路径 → 登录后 REST 盘点已发布模板/部件/全局样式覆盖 → 求交集出冲突。全程零写入，凭据只从项目私有目录读取，报告必须 grep 校验不含凭据、密码、nonce 与私有用户标识；旧基线报告按日期归档，不静默覆盖。

- CLI 只读调用加有界重试（至多 3 次、指数退避），仅匹配瞬态网络错误（deadline exceeded、TLS handshake timeout、connection reset、EOF 等）；认证被拒或接口拒绝不是瞬态，不得重试掩盖。
- 后台 REST 会话：wp-login.php 先 GET 拿 testcookie，再 POST `log/pwd/testcookie=1`（302 即成功），用 `admin-ajax.php?action=rest-nonce` 取 REST nonce；nonce 12–24 小时过期，过期重新登录，不把旧 nonce 或缓存 HTML 当证据。
- 覆盖判定语义：REST 模板项 `source==='custom'` 且 `status==='publish'` 才是数据库覆盖；`source==='theme'` 且 origin 为空表示解析到主题文件，不构成冲突。用户自建模板 source=custom、无主题文件，同样参与冲突交集。
- 当前参考站 `/wp/v2/global-styles` 列表路由不可用：theme.json 数据库覆盖的远端检测是明确缺口，报告以 globalStylesViaRest=false 记录，不冒充已覆盖。
- 错误输出禁止回显私有状态字段（用户名、域名路径、凭据键名）：一次调试把 hpanel 用户名打进错误日志，此后私有状态值一律不进异常信息。
- 预检冲突是只读信号，不等于处置完成；远端处置（备份/reset/restore 写路径）须另行设计授权、备份落点与失败回退后单独验收。

### 远端冲突处置：REST 写路径（真实验证）

`npm run hostinger:remote-resolve`：`reset --backup OUT.json PATH...` 与 `restore BACKUP.json`，语义与本地 `starter:template-resolve` 一致，通道为后台 REST 写接口（cookie+nonce）。远端特有语义：

- 备份先写本地私有目录并读回校验，之后才允许远端删除；删除用 `?force=true`，响应 `previous.content.raw` 哈希与备份逐条核对，再 GET 确认 404。删除前重读远端内容哈希，拦截「预检到处置之间覆盖被编辑」的并发写入（本地同语义）。
- restore 前置检查：目标 id 必须不存在（404）才允许 POST 重建；重建后 GET 哈希与备份一致才记成功。备份带 domain 字段，跨站恢复拒绝。template-parts 重建时回填 `area`。
- REST 只触模板/部件文章表，询盘表在结构上不可达；DB 层询盘哈希核对留给 WP-CLI 通道，不冒称已验。
- REST 写接口的前提与边界：站点已设 noindex、操作者拥有站点、操作窗口内无真实业务写入；正式域名或已接真实询盘后，写路径要走维护窗口与备份流程，不得直接套用本节命令。
- 演练脚本 `test:hostinger:remote-resolve` 创建唯一 `harness-rresolve-*` 夹具走完 backup→reset→404→restore→哈希一致→负路径拒绝→清理，finally 与 CLI 均使用同一重试会话；一次清理阶段网络断连曾使夹具短暂残留（DELETE 已成功、验证 GET 失败），重试加固后三轮通过、零残留。教训：演练脚本的清理路径本身也要走带重试的会话，且「验证键失败」与「操作失败」必须区分——连接未建立可安全重试，已发出请求的失败按结果未知处理，先查证再补偿。

### 真实增量发布：文件传输（真实验证）

`node scripts/hostinger/incremental-deploy.mjs [CANDIDATE_THEME_DIR]` 把增量链路串成一次真实发布：新鲜预检（有数据库覆盖冲突即退出 2，须先处置）→ 远端变更文件备份到私有目录 → 官方 CLI generate-upload-url + TUS（POST create 201 → PATCH 204）逐文件上传 → website-content 读回哈希核对（归一化末尾 LF 后逐字节一致）→ `cache clear-website` 清站点与 CDN 缓存 → 复检收敛（变更归零）。仅传输文本模板/部件文件；二进制与删除类变更明确拒绝。

实测教训（2026-09-22 首次真实发布，6 文件）：**基线工具的末尾 LF 归一化兜底曾隐含「远端≈候选」假设**——候选真有变更（基线工具的本职场景）时断言崩溃。修正语义：远端哈希按「剥掉末尾 LF 的字节」记录并标记 normalized；派生层对称比较（候选剥 LF 或补 LF 后与远端一致都算未变），数学上精确且不掩盖真变更。该教训适用于一切「读接口有已知截断、用比对工具判断差异」的场景：截断补丁必须在**差异判定层**实现，不能依赖与候选的巧合相等。

### @hostinger/mcp 接入（2026-09-22 已完成）

`@hostinger/mcp` 官方 MCP 服务器（npm 包，401 工具）已安装并 OAuth 授权。接入步骤：

1. `npx @hostinger/mcp --login` → 浏览器授权（一次即可，凭据持久化）。
2. Codex 设置 → MCP Servers → 添加：command=`npx`, args=[`-y`,`@hostinger/mcp`,`--stdio`]。
3. 添加后 AI 可直接用自然语言操作 Hostinger 全部 API 端点（372+ 工具），无需脚本调 CLI。

适用场景：交互式排错、配置核对、状态查询。批量部署仍用 CLI 脚本（确定性+可预演）。

### WordPress REST API 认证（2026-09-22 实测教训）

WordPress 5.6+ 的 REST API **不接受管理员密码做 Basic Auth**——必须使用 Application Passwords。且 Application Passwords 要求服务器将 Authorization 头传递给 PHP。

**Hostinger 共享主机的限制**：部分配置不传递 Authorization 头到 PHP，导致 REST API 始终返回 401。.htaccess 修复（`RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]`）在部分配置下有效但不保证所有环境生效。此为服务器级限制，不可由用户禁用。

**正确架构：Application Password 的创建必须包含在 deploy.php 内**——部署完成时自动产出凭据，Codex 立刻获得 REST 管理权限。不得部署后单独补创建（会反复遇到权限和安全策略障碍）。

**注意**：SQL 导入会覆盖整个用户表（包括 Application Passwords）。因此 Application Password 必须在 SQL 导入**之后**创建，不能在导入之前。

### CLI vs MCP：场景路由（2026-09-22 确认）

| 场景 | 工具 | 理由 |
| --- | --- | --- |
| 批量部署（文件/SQL/插件） | CLI（TUS + cron） | 确定性、可重试、可脚本化预演 |
| 交互式管理（查状态/排错/配置） | MCP | AI 读返回值→推理→决定下一步 |
| 文件传输 | CLI（TUS） | 可靠、支持 override、有进度 |
| 内容读写 | MCP 或 REST | 取决于一次性脚本还是持续维护 |
| 定时/自动化 | CLI（cron 触发脚本） | 确定性执行，不依赖 AI 会话存活 |

路由规则：**知道每一步做什么 → CLI；需要 AI 看返回值决定下一步 → MCP**。两者互补，不竞争。批量部署前用 MCP 探索确认状态，确认后用 CLI 脚本执行。

**WP-CLI via SSH 实测确认（2026-09-22）**：SSH + WP-CLI 可完成 REST API 的全部内容管理功能，且无需 Application Password、无 Cloudflare 限制。已实测通过：发布文章（wp post create）、创建页面、管理导航（wp_navigation）、上传图片（wp media import）、修改 CSS。对于 Codex + SSH 场景，WP-CLI 是内容管理的首选通道。REST API 保留给外部系统集成使用。

### 部署架构决策（2026-09-22 全面复盘）

**核心教训：第二次部署（brightdozer）比第一次（mediumblue-quail）出了更多问题，根因是没有复用已验证的整包流程，而是在目标站上现场发明了新路径。**

正确流程（0920 已验证）：
1. 本地环境录入全部内容并验收 → 2. 导出发布包（SQL + wp-content tar）→ 3. TUS 上传 3 个大文件 → 4. 一次性 cron 执行 bash 脚本（解压 + SQL 导入 + URL 替换 + 缓存清）→ 5. 线上逐页验收

第二次部署的错误路径：
- 逐个上传 85 个小文件（触发 Cloudflare 挑战 + 速率限制）
- 现场编写 deploy.php 内嵌 base64 内容（转义翻倍 bug）
- 用 cookie session 而非 Application Password（额外的复杂度）

**修正后的统一规范**：
- 新站部署和增量更新都使用同一套发布管线（打包→上传→执行→验收）
- 交互式排错用 MCP（401 工具），批量操作用 CLI
- 部署脚本写入项目 `scripts/hostinger-release.mjs`，可重复执行
- 所有经验回写到本文件对应段落

### 部署前置清单（2026-09-22 实测教训）

任何对 Hostinger 的部署执行前，逐项回答：

1. **API 速率**：确认调用次数在 90/min 以内。多文件部署必须打包为 ZIP 少量上传，不得逐个小文件密集调用（触发 Cloudflare 挑战 + IP 临时封禁）。
2. **脚本排练**：新部署脚本必须在本地 reuse 站或隔离环境完整排练通过后才能触达目标站。禁止在生产目标上首跑新脚本。
3. **重试内置**：所有 API 调用的重试逻辑在写脚本时就内置（指数退避 + 瞬态错误匹配），不得事后补。
4. **错误通道**：Hostinger CLI/API 错误信息可能在 stdout 或 stderr——分类检查必须覆盖两者。
5. **前置常量**：SMTP 捕获 MU 插件依赖 `NEW_SITE_REFERENCE_LAB` 常量。compose 缺该 define 时 wp_mail 静默失败且无报错——本地询盘验收前先发探针邮件核对。
6. **命名空间偏移**：渲染回调里的块类型提取禁用 `substr(name,N)` 硬编码偏移——命名空间改名后全部静默渲染为空。用 `explode('/', name)[1]`。
7. **docker cp 嵌套**：目标目录已存在时 `docker cp dir container:/dst` 嵌套拷贝，同步静默失效。用 `dir/.` 后缀。
8. **语义重命名调用点**：函数定义改名后用全仓 grep 核对调用点，500 fatal 先看 debug.log。


### 增量传输泛化：插件目录与二进制（真实验证）

`incremental-deploy.mjs --plugin` 把同一门禁链用于业务插件（远端根 wp-content/plugins/site-model，身份标记 site-model.php）。主题模式的未验二进制在收敛后经**公网 URL 哈希核对**（字体等静态资源可公开读取，读回哈希与候选一致即关闭未验状态）。两类新的远端读取边界按「unverified」处理、不进变更集：凭据类文件被托管 API 明确拒绝读取（settings.php 实测，托管侧安全策略）；内容接口偶发返回空 path 的 JSON 异常响应（退出码 0 的服务端抖动）。

- CLI 错误信息可能打在 stdout 而非 stderr：错误分类必须同时检查 stdout/stderr/message 三个通道，否则敏感拒绝分类失效。
- API 响应形状异常（空 path、缺字段）按瞬态处理加有界重试，持续异常才失败；async 回调内禁用 continue（迭代语义），用 return。
- settings.php 等凭据文件无法经任何通道读取/备份，其变更对管道不可见——这是明确接受的覆盖缺口，站点凭据轮换须走托管后台人工流程。

## 新电脑按需引导（先于部署预检）

首次进入已授权的部署任务时执行 Skill 随包 `scripts/hostinger-setup.mjs`；完整仓库可用 `npm run hostinger:setup`。无 CLI 时运行 `npm run hostinger:setup -- --install`，在 macOS/Linux 且已有 Homebrew 的机器安装官方 `hostinger/tap/hostinger`，不升级或覆盖已有可用版本。再运行 `npm run hostinger:setup -- --connect`，以只读 hosting orders list 验证账户访问；不打印订单内容。当前 CLI 无 auth/login 子命令，首次账户命令会触发官方浏览器登录，用户本人完成授权后重新检查。登录失败也可能是网络/API 或旧环境 Token 优先级问题，不直接断言无账户。

Windows/无 Homebrew：当前脚本返回 official-release-required，并非安装完成。Codex 应继续按官方 releases 下载与实际 OS/架构匹配的文件，核验该 release 校验和，安装到用户可写目录并确认 PATH，运行 version 和 --help 后重跑 setup。未知架构或无法验证下载则明确报告，不执行不明来源安装脚本。这个分支尚未实现为自动安装器或完成跨平台实测；不要要求用户安装 MCP 来绕过缺失 CLI。

CLI 是默认路径；已有可用官方 Hostinger MCP 时可以复用，但无需两套都安装。配置 MCP 要按当前 Codex 客户端支持方式完成连接/授权验证，不把配置文件存在称为连接成功。读取 Skill 本身不触发安装、登录或资源创建。账户能读取也不证明套餐支持 WordPress、目标可覆盖或发布已通过。

官方认证依据：https://www.hostinger.com/support/11679133-how-to-use-hostinger-api-cli/ 。本机实测与缺工具模拟分开报告；客户端未授权时需要用户官方登录这一步，不应代用户购买或索取密码。

### 2026-09-22 全面复盘：Hostinger 自动化部署完整经验

#### 已验证的工具组合
| 操作 | 工具 | 状态 |
| --- | --- | --- |
| 站点创建 | CLI websites create | ✅ 两次实测 |
| WP 安装 | CLI wordpress install | ✅ 两次实测 |
| 文件上传 | CLI files generate-upload-url + TUS | ✅ 多次实测 |
| 文件读取 | CLI files website-content | ✅（文本文件）|
| 目录列表 | CLI files list-website-and-directories | ✅ |
| 缓存清除 | CLI cache clear-website | ✅ |
| 定时执行 | CLI cron-jobs create/delete/output | ✅ |
| 主题切换 | WP-CLI / PHP theme activate | ✅ |
| SQL 导入 | mysql CLI（读 wp-config 凭据）| ✅ 两次实测 |
| REST 管理 | Application Password + Basic Auth | ⏳ 待完整验证 |
| MCP 交互 | @hostinger/mcp 401 tools | ✅ 已安装 OAuth |

#### API 限制与对策
| 限制 | 值 | 对策 |
| --- | --- | --- |
| 速率限制 | 90 req/min | 批量操作打包为 ZIP，减少调用次数 |
| Cloudflare 挑战 | 快速连续小请求触发 | 退避重试 + 文件间隔 ≥2s |
| 内容 API 文件类型 | 仅 php/html/css/js/json/txt/md | 二进制标记为 unverified |
| 凭据文件拒读 | settings.php 等被拒绝 | 标记 unverified，不冒充已验证 |
| 末尾 LF 剥离 | 归一化处理 | 派生层对称比较 |
| 网络抖动 | socket/TLS 断连 | 有界退避重试（内置非事后）|

#### 脚本编写规范
1. 所有 Hostinger API 调用的重试逻辑在函数定义时内置，不事后补。
2. 正则表达式中的反斜杠：RegExp 构造器字符串中每个字面反斜杠需要双写（BS.repeat(N)），不得手动拼接。
3. async 回调（Promise.all map）内没有 continue，用 return。
4. 语义重命名后用全仓 grep 核对调用点，500 fatal 看 debug.log。
5. PHP 变量在 shell 命令中必须转义或使用文件中转，不得直接内嵌。
6. 错误信息可能在 stdout 或 stderr——分类检查必须覆盖两者。
7. no-op（0 变更）是收敛成功，不得当作异常退出。
8. 部署完成输出必须包含唯一标记（如 DEPLOY_DONE），供轮询检测。

#### hPanel 快捷链接

需要用户在浏览器操作时，自动打开对应 hPanel 页面（从域名可直接推导）：

- SSH 设置：`https://hpanel.hostinger.com/websites/{domain}/advanced/ssh-access`（已从截图确认）
- 文件管理、数据库、SSL 等其他页面按 hPanel 侧边栏结构推导，未逐个验证

#### SSH 启用限制（2026-09-22 确认）

共享主机的 SSH 启用/禁用**没有 API/CLI 端点**，只能通过 hPanel UI 操作。Hostinger API 的 SSH key 管理仅限 VPS。 harness 应在首次部署时检测 SSH 可用性，不可用则自动打开 hPanel SSH 页面引导用户启用（一次性操作，启用后永久生效）。
