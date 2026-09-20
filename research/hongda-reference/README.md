# HONGDA Cloudflare 部署参考包

来源：https://hongda-machinery.pages.dev/

下载日期：2026-09-20（Asia/Shanghai）。用户要求通过 Cloudflare CLI 获取参考站代码，以参考其页面结构和视觉并实施 WordPress 新站。

## 获取范围与证据

通过已登录 Wrangler 4.114.0 的 `pages deployment list --project-name hongda-machinery --json` 确认生产部署，再使用 Wrangler 当前认证对 Cloudflare 官方 API 发起只读请求，取得项目元数据。项目未返回 Git `source`；当前 Wrangler `pages download` 仅支持配置下载。没有得到原始 React/TSX 工程、构建配置或服务器源码。

实际下载的是线上 HTML、编译后的 JavaScript 与 CSS，文件 SHA-256 与固定部署 `b0401c2b-3986-48ad-9d7a-2830ccfa77ed` 的相同文件逐项比对一致。未修改 Cloudflare 项目，未提交询盘，未保存认证令牌。

- `deployment/`：下载的原始发布文件，保留外部资源引用；不是完全离线网站。
- `bundle-readable.js`、`styles-readable.css`：格式化后的发布代码，便于研究，不能冒充原始开发源码。
- `content.json`：安全 AST 字面量提取的公司、导航、产品、行业、文章和页面数据，未执行下载的 JS。
- `routes.json`：14 个路由模式（含通配符）、65 个具体路径；这是从代码提取的清单，不代表逐页浏览器验收通过。
- `project-metadata.json`：仅保留非敏感项目与生产部署元数据。
- `download-manifest.json`：下载时间、大小、SHA-256、固定部署比对结果。
- `asset-checks.json`：5 个 `/api/assets/` 引用的实际响应检查。
- `extract-content.mjs`：在本仓库依赖环境运行 `node research/hongda-reference/extract-content.mjs` 可重新提取内容。

提取结果：5 个设备分类、19 个产品、11 个行业、9 篇文章、7 个企业介绍子页、7 个联系主题子页。顶级导航并未列出全部数据，以完整数据集为准。

## 已核实的实现问题

1. `bundle-readable.js` 中 `dt` 表单组件的提交处理仅 `preventDefault()` 与本地 `n(true)` 状态更新，随后显示 Inquiry Sent，没有提交接口。此结论针对原生询盘表单，不评价独立 Tidio 服务。
2. 5 个 `/api/assets/UUID` 均返回 HTTP 200、`text/html`、876 字节首页，不能当作图片下载成功。页面依赖其他图像及 SVG 回退维持显示。
3. `referencePhotos` 的 9 个 Wikimedia 图片引用包含 JCB、Case、Caterpillar、Liebherr、Bobcat、John Deere、Zoomlion 等品牌；不应作为 HONGDA 的产品或工厂事实证据。这里只保留引用，未打包外部图像。新站需真实素材或明确标注的示意素材。
4. 英文页面入口 HTML 的语言标记是 `zh-CN`。
5. 页脚包含 `#social` 占位链接；当前数据中的公司、联系方式、认证、业绩和规格均为参考站原文，尚未独立核实。
6. HTML 含真实第三方聊天脚本。原始证据文件保持原样；WordPress 实施时不能自动继承该站的聊天账户或邮件去向。

## 对 WordPress 新站的映射

沿用项目最新架构，参考站提供信息架构、配色、排版和模块安排。页面数据由 WordPress 管理，不把整个 React bundle 嵌入主题。

| 参考页面 | WordPress 实施 | 页面重点 |
| --- | --- | --- |
| 首页 | 专用 PHP 模板、品牌字段、动态产品/行业查询 | 品牌定位、设备入口、制造与服务证据、询盘 |
| Equipment 总览 | 产品 archive | 类别导航和推荐设备 |
| 设备分类 | 原生 taxonomy 与 term 字段 | 应用范围、规格比较、关联产品 |
| 设备详情 | 产品 CPT、ACF 参数字段、原生正文 | 图片、型号规格、工况、附件、带产品上下文询盘 |
| Industry 总览/详情 | 行业 CPT、产品分类关联 | 工况问题、选型逻辑、推荐设备、FAQ |
| Our Story 及子页 | 原生层级 Page、用途对应的模板 | 公司、制造、质量、团队、服务事实 |
| Contact 及主题 | 原生层级 Page、成熟表单插件 | 按购买/代理/售后意图分流、实际入库与发送验收 |
| Blog | 原生 Post、分类、文章模板 | 选型与采购内容、产品内链 |

保留红/炭黑主色、清晰设备导航、工业图片版面及各类页面不同的信息顺序。正式内容、素材替换及 WordPress 页面开发尚待完成；这个包是研究输入，不是新站交付。
