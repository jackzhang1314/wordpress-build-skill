---
name: apify-google-maps-leads
description: 使用已连接的 Apify 按地区和商家类型从 Google Maps 主动开发客户，获取官网、电话和可选的官网邮箱，整理带来源的客户 CSV。适用于本地商家找客，不用于判断真实采购意向或自动发送邮件。
---
# Google Maps 地图找客

本技能使用产品内置 Apify 工具。API Token 在设置 → 连接器 → Apify 统一配置，不要索取聊天中的密钥，也不执行上游 CLI 或安装其他工具。

## 开始前

明确目标地区（推荐城市与国家）、搜索词、每词商家数量、是否采集官网联系方式、用户允许的本次 Apify 美元费用上限。没有预算时询问用户，不自行猜测。官网联系方式补全可能另外计费，默认关闭；不自动开启员工个人信息、评论和社媒资料付费补全。每次最多 5 个词、每词 100 家，一个对话只提交一个采集任务。

用 apifyConnectionStatus 检查连接，缺失时引导统一连接器设置。已配置不代表余额充足或特定 Actor 可用。先 readMapsProgress 检查本对话是否已有任务。

## 采集与恢复

1. 确认范围后 startMapsSearch；保存返回的编号。费用由用户的 Apify 账户承担，按产品确认流程提交。
2. 用 readMapsProgress 等待已有任务，每次可等待 20–30 秒；不能把运行中当作采集失败后重新提交。任务耗时较长时告知用户进度。停止对话不停止云端，返回的 Apify 控制台链接可用于检查或停止。
3. 提交状态未知时停止自动提交，说明需要在 Apify 控制台核对；不要通过新建任务绕过重复保护。
4. SUCCEEDED、FAILED、TIMED-OUT、ABORTED 后可以 collectMapsResults。失败或超时任务的结果标为部分结果；读取范围达到数量上限不等于穷尽整个地区。

## 筛查与交付

读取返回的来源 JSON 和 CSV，再按用户的产品与客户类型判断候选相关性。Maps 商家信息是候选线索，不证明其是进口商、采购决策人或有采购意向。需要官网背调时使用实际可访问网页和客户调研方法，注明新增事实来源。

采集器按 Place ID 或地图 URL 去重，不按相似公司名或共享官网合并不同分店。邮箱缺失保持空白；官网提取的邮箱不等于已验证可送达。不要猜姓名、邮箱或补造数量。保留商家、地址、官网、电话、邮箱和地图来源；说明实际读取数量、去重、截断或未完成范围。

用 publishFile 发布生成的客户 CSV，需要筛选时另存结果并核验数量，保留采集来源。可继续起草开发信，但本技能没有发信能力。

## 适配来源

这是本产品编写的浏览器插件适配版，不是上游原包。参考工作流：https://github.com/apify/awesome-skills/tree/main/skills/apify-google-maps-leads 。已适配为共享连接器和内置工具，没有照搬上游 CLI、员工补全与多 Actor 级联。
参数与行为依据：https://apify.com/compass/crawler-google-places/input-schema 、https://docs.apify.com/api/v2/actors-runs-post 。
