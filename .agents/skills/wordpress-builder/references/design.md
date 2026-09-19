# 设计系统与视觉 QA

本文档规定 WordPress 工程落地规则：token、Pattern、评分卡与反 AI 味文案。阶段 4 先加载本地 `frontend-design` skill 获取美学方向，再把方向映射到本文件规则；两者互补，不重复维护。

## 设计 token 规则

`theme.json` 是唯一设计真源。色、字、距、形状只允许先定义 token，再由样式和 Pattern 引用；禁止在 `style.css`、区块内联样式或页面计划里散装硬编码。

### 基础档位

| 类别 | 最低档位 | 示例命名 |
| --- | --- | --- |
| 色板 | 8 档 | `base`、`surface`、`ink`、`steel`、`signal`、`safety`、`concrete`、`line` |
| 字号 | 6 档 | `x-small`、`small`、`body`、`large`、`heading`、`display` |
| 间距 | 8 档 | 按 8px 系命名，例如 `space-1` 到 `space-8` |

行高、圆角、阴影放入 `settings.custom`。命名必须表达用途或档位，不使用 `blue`、`big` 这类实现值命名。企业项目可增补档位，但不得绕过档位直接写裸值。

`settings.custom` 示例：

```json
{
  "settings": {
    "custom": {
      "lineHeight": { "body": 1.65, "heading": 1.15 },
      "radius": { "sm": "2px", "md": "4px" },
      "shadow": { "card": "0 1px 2px rgba(15, 23, 42, 0.16)" }
    }
  }
}
```

### 引用规则

- 颜色：只写 `var:preset|color|token`，例如 `var:preset|color|signal`。
- 字号：只写 `var:preset|font-size|token`，例如 `var:preset|font-size|body`。
- 间距：只写 `var:preset|spacing|token`，例如 `var:preset|spacing|40` 或项目定义的实际 token。
- 自定义值：只写 `var:custom|lineHeight.body`、`var:custom|radius.md` 等真实路径。
- 块样式、`style.css` 和 Pattern 不出现裸 HEX、RGB、HSL、px、rem 或 em；装饰值和常规布局值一律走 `var:` 引用。
- 图表、地图等第三方组件不能直接用 `var:` 时，先在构建层注入 token 值，不把裸色值复制进内容。

生成 token 化 Block Theme 只在现主题没有合适基础时进行。必须使用主题 slug 作为命名空间，保留可回退方式，并记录生成文件、激活状态和视觉验证。

## Pattern 库规范

Pattern 用主题命名空间注册：

```php
register_block_pattern(
    'theme-slug/hero-industrial',
    [
        'title'       => __( 'Industrial hero', 'theme-slug' ),
        'description' => __( 'Product model, measurable fact and RFQ action.', 'theme-slug' ),
        'content'     => '<!-- wp:group {"className":"tl-hero"} --> ... <!-- /wp:group -->',
    ]
);
```

基础 Pattern 库包含 10–15 个可组合项，最少覆盖：

1. `hero-industrial`
2. `section-intro`
3. `product-grid`
4. `spec-table`
5. `process-steps`
6. `faq-list`
7. `cta-band`
8. `trust-bar`
9. `case-grid`
10. `feature-split`
11. `contact-rfq`
12. `logo-strip`

要求：

- Pattern HTML 只引用 token 和语义 className；不允许散装硬编码颜色、字号、间距、阴影或圆角。
- 每个 Pattern 必须有语义根类名，如 `tl-hero`、`tl-product-grid`、`tl-contact-rfq`。CSS 按类选择，不依赖 `h2 + p` 这类脆弱结构选择器。
- 内容保持原生区块；文本占位必须可替换，图片位置只引用已上传且授权的媒体。
- 交互状态（hover、focus、active、disabled）由主题 CSS 和 token 控制，不写进重复的 Pattern 内联样式。
- Pattern 可在移动端自然堆叠；复杂列在 390px 必须降为单列或可横向滚动的数据表，不允许页面横向溢出。

## 视觉 QA 评分卡

每次 QA 对桌面和 390px 各检查一遍，取同一页面最差表现计分。满分 24 分，≥20 分才可交付；低于 20 分定点修后复测，最多 3 轮。

| 维度 | 分值 | 判定要点 |
| --- | ---: | --- |
| 视觉层级 | 0–4 | 首屏 3 秒内能识别主信息与 CTA；H1/H2/正文比例清晰；次级内容不抢主动作。 |
| 排版纪律 | 0–4 | 使用至少 3 档字号层级；正文行高 1.5–1.75，标题 1.0–1.2；主流文行宽约 45–75ch。 |
| 色彩系统 | 0–4 | ≤3 个主色加中性档；主色只用于 CTA 与关键强调；文本/组件对比满足 AA。 |
| 布局节奏 | 0–4 | 间距来自 8px 系且有节奏；同类区块留白一致；桌面与移动端无横向溢出。 |
| 细节完成度 | 0–4 | 图片比例统一且真实加载；按钮 hover/focus/active/disabled 完整；焦点可见；无孤立元素和死链。 |
| 反模板感 | 0–4 | 字体配对不是平台默认；无 AI 通用蓝紫渐变；有行业语境，重型机械不套 SaaS 圆角卡片。 |

### 迭代记录

每轮迭代在任务目录保存一份记录，至少包含：

1. 截图路径（桌面与 390px）。
2. 六个维度得分和总分。
3. 定位到的问题及其所在页面、区块或类名。
4. 修改内容。
5. 复测截图路径和复测得分。

三轮后仍低于 20 分时停止发布准备，报告具体失败维度、证据和待用户决策项。不能把“截图已保存”当作检查通过，也不能只报总分不写维度证据。

## 反 AI 味文案规则

### 首屏公式

首屏主句使用：具体产品型号 + 具体数字（吨位、功率、效率、产能、工况）+ 动词。

- 通过示例：`08 机型 0.8 吨级，巷道狭窄工况一次通过。`
- 拒绝示例：`我们提供优质产品，助力企业降本增效。`

数字必须来自企业资料；没有可验证数字时，用具体场景和动作替代，不发明参数。

### 禁用词

中英文首屏、标题、按钮和正文不使用：

`enterprise-grade`、`cutting-edge`、`seamless`、`world-class`、`revolutionary`、`leverage`、`synergy`，以及其中文对应或近义套话，如“顶级”“赋能”“无缝”“颠覆性”“世界一流”。

### 行业语调

- B2B 重型机械：参数精确、场景具体、克制不夸张；写工况、通过性、维护间隔、安全边界和采购风险。
- 服务与工程：写交付范围、验收标准、响应方式和责任边界。
- 不堆叠形容词；不用空泛口号替代证据；不需要每句都营销。

### 结构纪律

- 段落不超过 3 句。
- 标题不用冒号堆叠；每个标题只表达一个可扫描的主题。
- CTA 写实际动作，如“获取报价”“下载规格表”“预约现场评估”，不写“了解更多”当唯一主按钮。

## 与 frontend-design skill 的组合

阶段 4 加载 `frontend-design` 获取美学方向，包括字体角色、版式概念、签名元素和自批评；本文件负责工程落地规则：`theme.json` token、Pattern 命名、原生区块约束、视觉 QA 和文案红线。若两者冲突，以企业事实、可访问性和本文件工程约束为底线，再在不越界前提下采纳美学方向。

## 视觉避免清单

生成或评审任何页面时逐条排除：

1. 平台默认感：Inter/Roboto 单字体系统、蓝紫渐变 hero、SaaS 圆角卡片阵列套在非 SaaS 行业。
2. AI 均质节奏：每个区块都是「标题 + 三列卡片」，缺少宽度、密度、明暗对比变化。
3. 装饰压过信息：大面积模糊光斑、无意义 3D 线框图、纯装饰图标列。
4. 假证据：把 Figma 占位截图、AI 生成图冒充实拍；参数表没有来源。
5. 空洞 CTA：只有「了解更多」，没有实际动作和承接路径。
6. 对比度不足：灰色小字放在浅底色上、按钮 hover 无反馈。
7. 移动端塌陷：列宽依赖 `width:auto` 的区块列、390px 下横向溢出、触控目标小于 44px。
8. 裸值漂移：`style.css` 或内联样式出现 token 外的 HEX、字号、间距。

发现即计为对应维度扣分点；同一问题跨页面重复出现按 2 倍扣。

## 版本历史

设计系统是活文档：视觉方向变更、新增组件档位、避免清单条目、评分卡调整，都记录在案并保留原因，向后兼容已有页面。

| 版本 | 变更 | 原因 |
| --- | --- | --- |
| v1 | token 档位、Pattern 库、6×4 评分卡、反 AI 味规则 | 首版工程落地规范 |
| v2 | 增补视觉避免清单与版本历史节；吸收 wpagent 设计系统「避免事项 + 演进记录」纪律 | 用户确认融合外部项目优点（docs/15） |
| v3 | 新增自由模板工程规范引用（[theme-code.md](theme-code.md)）；对比度实测修正（品牌亮橙仅限大装饰，按钮/小字用深一档 token）；卡片图 lazy 属性、无图占位、reduced-motion、fontDisplay swap 纳入避免清单执行项 | 全站自由模板重构与架构审计实测（docs/16） |
