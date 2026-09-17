# 宿主适配合同

Skill 只描述任务方法，不拥有网络、账户或持久化权限。宿主需实现以下能力，并在所需数据缺失时明确返回错误。

| 工具 | 合同 |
|---|---|
| dataForSeoConnectionStatus / dataForSeoMarkets | 凭据状态与可用 Google 国家/语言，不回传凭据 |
| dataForSeoQuery | keywords/ideas/serp/domain/ranked/competitors/gap；范围、市场、单次付费确认；固定结果文件 |
| dataForSeoResearch | Backlinks、引用域、锚文本、交集、变化、内容发现、instantPage、Lighthouse |
| startSeoAudit / readSeoAudit / stopSeoAudit | 有界异步抓取，状态、taskId、分页、停止与持久恢复 |
| inspectPage | 固定的渲染 DOM 读取，包括图片、JSON-LD、Microdata 属性、hreflang；不执行网页代码 |
| readSeoResource | 不携带登录凭据的原始 HTTP 响应与头，明确重定向和截断 |
| googleSearchConsole / seoFieldPerformance | OAuth 站点权限、真实搜索/索引；CrUX API Key 和采集周期 |
| readSeoCorrespondence / sendSeoEmail / checkSeoDelivery | 限定联系人往来、可审阅完整邮件、稳定 Message-ID、发送未知不重试 |
| seoContact / listSeoFollowUps | 停止联系阻止发送；到期记录不等于发送授权 |
| readSeoPost / writeSeoPost | WordPress 原文/修改时间、默认草稿、明确发布与前后回读 |
| createSeoMonitor / seoMonitorStatus / pauseSeoMonitor | 明确间隔与次数、有限计划授权、浏览器重启恢复、未知暂停 |
| snapshot / navigate / listTabs / switchTab | 仅任务授权网页，最新观察及实际链接 |
| readFile / writeFile / editFile / publishFile / runJavaScript | 对话专属版本化文件、可下载成果、无网络的同步 QuickJS 计算 |

完整参数和行为见各包 `references/seo-api.md`。没有相应工具时只能分析用户提供的材料，不得用文字模拟已执行的 API、发送、发布或定时任务。

状态必须区分：已创建/执行中/已完成/部分结果/未知/停止；未知操作不能默认视为失败并自动重试。付费请求结果绑定连接器账户和规范化请求；数据文件被改写时不复用缓存。外联接受发送与送达、现场上线外链与候选发现分开。

Google OAuth 使用 Chrome identity 浏览器授权回调，按所选服务请求权限；本地不保存 Google 密码。浏览器扩展需要 identity 和 alarms 权限。WordPress 更新前校验最近 modified 值，但服务本身不提供本文工具可保证的跨客户端原子锁；有并发编辑时需回读核查。
