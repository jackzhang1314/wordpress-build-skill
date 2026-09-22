# TerraLift 参考架构替代稿

2026-09-17 20:55 Asia/Shanghai。用户要求参考 `https://yufanmachinery.com/` 做像素级复刻。由于像素级复刻会复制对方受保护的品牌、图片、文案、CSS/HTML、产品资料和视觉资产，本轮没有执行克隆；改为构建一个可运行的原创替代稿，只参考同类 compact machinery 出口站的高层信息架构。

## 目标与边界

- 使用虚构品牌 **TerraLift Machinery — Demo**。
- 只复用一般外贸机械站的通用结构：设备家族、能力分级、应用场景、询盘清单、公司页、联系页。
- 不使用参考站品牌、logo、图片、文案、标题、型号、规格、认证声明、客户案例、CSS/HTML 或精确布局。
- 图片继续使用此前已记录的公有领域 BLM 设备照片，并作为 placeholder。
- 所有产品记录均为 demo profile；不声明真实库存、性能、排放、认证、交期或价格。
- 联系地址使用 `sales@example.com`，未接真实表单/邮件。

## 已发布内容

本机隔离站：`http://127.0.0.1:9462/`。WordPress 报告 7.1，PHP 响应头 8.5.8，主题 Twenty Twenty-Five 1.5。

| 页面 | ID | URL |
| --- | ---: | --- |
| Home | 67 | `/` |
| Equipment | 68 | `/terralift-equipment/` |
| Excavators | 69 | `/terralift-excavators/` |
| Loaders | 70 | `/terralift-loaders/` |
| Skid steer | 71 | `/terralift-skid-steer/` |
| Industries | 72 | `/terralift-industries/` |
| Company | 73 | `/terralift-company/` |
| Contact | 74 | `/terralift-contact/` |

2026-09-18 扩展后新增 6 个支持/转化页面：

| 页面 | ID | URL |
| --- | ---: | --- |
| Quality | 93 | `/terralift-quality/` |
| OEM | 94 | `/terralift-oem/` |
| Dealer | 95 | `/terralift-dealer/` |
| Payment & Delivery | 96 | `/terralift-payment-delivery/` |
| Support | 97 | `/terralift-support/` |
| FAQ | 98 | `/terralift-faq/` |

新增产品 CPT 记录 ID 55–60：

- TL-E08 Compact Excavator。
- TL-E20 Compact Excavator。
- TL-E35 Compact Excavator。
- TL-L10 Compact Wheel Loader。
- TL-B30 Backhoe Loader。
- TL-S50 Skid Steer Loader。

旧演示产品 ID 30–32 显式改为 draft，避免混入新 Query Loop；没有删除历史记录。

## 原生链路

1. 读取参考站高层信息架构，仅保存通用 section pattern 和菜单结构，不保存受保护资产。
2. 创建 `.lab/terralift-source/` 下的原创企业事实、CSV、产品导入计划和站点计划。
3. 用 `content-plan/content-apply` 将旧 TD 产品 30–32 改回 draft。
4. 用 `import-plan/import-apply` 创建 6 条 `oct_product` 草稿。
5. 用 `content-plan/content-apply` 显式发布 6 条新产品。
6. 用 `build --plan` 创建 8 个原生区块页面草稿，ID 67–74。
7. 浏览器检查首页草稿和原生编辑器。
8. `build --plan --publish` 发布 8 页并设置站点标题、描述和首页。
9. 用 `navigation-plan/navigation-apply` 更新 header 和两个 footer 导航 fragment。
10. 用 `page-edit-plan/page-edit-apply` 将正文按钮从 `?page_id=` 替换为最终 permalink。
11. 匿名检查桌面、手机、菜单、H1、溢出、产品 meta、Query Loop 和链接。

## 2026-09-18 信息架构扩展

在不复制参考站受保护内容的前提下，把通用外贸机械站常见的支持类信息补齐为 6 个原创页面：

- **Quality**：下单前、生产中、装柜前的审查清单；不虚构工厂产能或认证。
- **OEM**：把机械配置、品牌物料、文档责任和售后边界分开。
- **Dealer**：只描述经销商评估框架；不虚构区域、折扣或收益。
- **Payment & Delivery**：把付款、装运、目的港和现场接收检查分开。
- **Support**：把服务范围、保修证据和备件计划列为需确认事项。
- **FAQ**：用原生 details 区块回答常见采购澄清问题，并明示 demo 非真实库存。

header 当前为 Home / Equipment / Industries / Company / Support / Contact；footer 两组导航覆盖 Quality / OEM / Dealer / Payment / Support / FAQ 与既有产品页。

扩展页通过原生区块创建并逐页发布。发现 Quality 页的 Support 按钮仍是 `?page_id=97` 后，用 page-edit 计划替换为 `/terralift-support/`，再次检查通过。

## 2026-09-18 开放授权素材链路

继续测试图片素材链路时，不抓取参考站或阿里巴巴平台图片；改用 Wikimedia Commons 上明确标记为 **CC0** 的四张机械照片，并保留来源、作者、许可证和页面链接：

| 测试用途 | Commons 文件 | 许可证 |
| --- | --- | --- |
| Mini excavator | `File:IHI 9NX.JPG` | CC0 |
| Wheel loader | `File:Moscow, Shipilovsky Proezd, SDLG loader, Aug 2025 02.jpg` | CC0 |
| Backhoe loader | `File:Street repair backhoe digging Summit NJ.jpg` | CC0 |
| Skid steer | `File:ASV VT-70 High Output Posi-Track - Arlington, MA.jpg` | CC0 |

这些照片只作为测试 placeholder，不代表 TerraLift 产品或配置。来源记录在 `docs/acceptance/0917-terralift/open-assets-manifest.json`。

执行内容：

1. 通过 Commons API 读取原始授权与作者信息。
2. 下载 1600px 缩略图，上传到 WordPress 媒体库，实际媒体 ID 为 109–112。
3. 用 `content-plan/content-apply` 为产品 ID 55–60 设置 featured image。
4. 更新 `single-oct_product` block template，开启 featured image 展示。
5. 用 page-edit 更新首页和 Equipment 页的分类图卡。

验收：

- 首页 4 张图片实际加载，alt 均为 placeholder 说明。
- Equipment 页 4 张分类图片实际加载。
- 6 个产品详情页均渲染对应 featured image。
- 桌面与手机无横向溢出，首页仍保持单一 H1。

## 验收结果

- 8 个页面全部 publish。
- 6 个新产品全部 publish。
- 8 个页面均单一 H1。
- 桌面 1440px 和手机 390px 无横向溢出。
- 手机菜单可打开并显示 Home / Equipment / Industries / Company / Contact，可关闭。
- 首页图片实际加载，alt 为 placeholder 说明。
- 产品详情使用专用 `single-oct_product` 模板，meta 值正常显示。
- Query Loop 只显示 6 条新 TL 产品，不显示旧 TD 产品。
- 初始站内唯一 URL 检查通过：43 个请求全部 HTTP 200，无跳转，包含 8 个页面、6 个产品、feeds/oembed/assets。
- 扩展后 14 个页面站内唯一 URL 检查通过：67 个请求全部 HTTP 200，无跳转，无失败。
- 结构化记录：`docs/acceptance/0917-terralift/test-records.json`。

## 与“像素级复刻”的差距

这是刻意保留的差距：

- 不复用参考站的品牌和视觉资产；
- 不复制参考站文案和页面标题；
- 不复制参考站 CSS/HTML；
- 不复制参考站规格和认证声明；
- 不以像素级一致作为验收标准。

若用户拥有目标站权利，或能提供授权设计稿、品牌资产、产品资料与图片，下一步可以在授权范围内做真正的品牌化建站；但仍应避免直接抓取第三方站点的受保护资产。
