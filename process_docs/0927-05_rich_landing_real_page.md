# 2026-09-27 04:40（Asia/Shanghai）— Rich Landing 真实替代页面验收方案

## 触发原因

`v2.26.0` 已提供 Rich Landing 和九个后台可编辑字段，但测试内容仍是技术 E2E 文案。下一步要用一个完整的虚拟工业 B2B 页面验证：

1. 信息架构是否足够承接真实客户页面；
2. 文案是否符合外贸采购任务；
3. 视觉细节是否达到可交付基线；
4. 页面能否并行存在于 Elementor 老站；
5. 询盘表单能否进入 Builder-managed 页面。

## 测试站

```text
yellow-koala-142147.hostingersite.com
```

站点形态：

```text
external
Hello Elementor + Elementor
Builder Core 1.1.0
历史 Elementor 页面保持不动
```

## 表单准备

Rich Landing 需要能承接询盘。测试站未安装表单插件，因此先执行完整备份，然后安装并激活：

```text
fluentform 6.2.14
```

现有可渲染表单：

```text
Contact Form Demo (ID 1)
```

本阶段只验证 Builder-managed 页面能渲染真实 Fluent Forms 表单；邮件通知和提交流程后续用 `verify-form` 单独验收。

## 页面规划

虚拟主题：

```text
OEM excavator bucket supply for 20–35 tonne machines
```

明确标注为 prototype 内容，避免把虚拟企业资料冒充真实工厂证明。

### 页面任务

采购者在页面内完成：

1. 判断该供应商是否适合自己的机队；
2. 理解制造范围和交付边界；
3. 查看关键规格；
4. 解决常见采购疑问；
5. 提交机型与工况需求。

### 信息架构

1. Hero：
   - 精准标题；
   - 适用机型；
   - 采购动作。
2. Manufacturing scope：
   - 机队/机型适配；
   - 订制范围；
   - 交付边界。
3. Production and QC：
   - 制造流程；
   - 检验点；
   - 可要求文件。
4. Buyer benefits。
5. Specifications。
6. FAQ。
7. RFQ Fluent Form。
8. Bottom CTA。

## 设计迭代方向

1. Fluent Forms 输入框、按钮、焦点态与 Builder Landing 统一；
2. 询盘表单使用清晰边界和标题；
3. 桌面/移动无横向溢出；
4. 保持中性工业风，不使用蓝紫渐变；
5. 继续继承老站 header/footer。

## 验收

1. `builder page plan/apply` 成功；
2. 公网 HTTP 200；
3. 核心 verifyText 渲染；
4. Fluent Forms `<form>` 存在；
5. Chrome 桌面/移动截图；
6. 无横向溢出；
7. 标题层级正常；
8. CMS audit 通过；
9. 历史 Elementor 页面不变；
10. 明确保留 prototype 边界说明。

---

# 实施与验证记录（2026-09-27 04:55 Asia/Shanghai）

## 代码实施

- Builder Core：
  - `1.1.0 → 1.2.0`；
  - 新增 `wbc_form_shortcode` 字段；
  - Rich Landing 渲染顺序调整为：
    1. hero；
    2. main editor content；
    3. buyer benefits；
    4. specifications；
    5. FAQ；
    6. Fluent Forms RFQ；
    7. bottom CTA；
  - 增加 scoped Fluent Forms 样式：
    - 输入框；
    - textarea；
    - submit button；
    - focus ring；
    - 700px 以下单列表单。
- `builder page plan/apply`：
  - 字段白名单加入 `wbc_form_shortcode`；
  - 只允许单个数字 ID 的 Fluent Forms shortcode；
  - apply/readback/rollback 覆盖该字段。
- 初始实现把表单 shortcode 放进 `the_content()`，导致 RFQ 出现在 benefits/specifications/FAQ 之前。已改为独立 ACF 字段并由模板在 FAQ 后渲染，页面动线更符合 B2B 采购任务。

## 真实站点准备

在执行写入前后均保留备份/快照。

### Fluent Forms

- 安装并激活：

```text
fluentform 6.2.14
```

- 创建专用表单：

```text
Builder equipment RFQ
form ID: 3
```

字段：

```text
full_name
email
company
country_region
machine_model
requirements
```

- 通知目标：站点 `admin_email`;
- 主题：

```text
Builder equipment RFQ — {inputs.machine_model}
```

- 成功提示：

```text
Thank you. A technical buyer will respond with the next questions or a quotation.
```

第一次验证时发现表单入库成功但成功提示不显示；原因是测试用 `formSettings` 结构不完整。已改为 Fluent Forms 可识别的 `samePage` / `hide_form` / `messageToShow` 结构，复测通过。

## Rich Landing 真实替代页面

公网 URL：

```text
https://yellow-koala-142147.hostingersite.com/builder-projects/oem-excavator-buckets-20-35-tonne/
```

页面主题：

```text
OEM Excavator Buckets for 20–35 Tonne Machines
```

页面结构：

1. Hero：
   - 精准标题；
   - 适用机型；
   - RFQ CTA。
2. Manufacturing scope。
3. Production checkpoints。
4. Buyer benefits。
5. Specifications。
6. FAQ。
7. Fluent Forms RFQ。
8. Bottom CTA。

虚拟企业资料明确标注：

```text
Prototype validation page: Owl Industrial Works is a non-production demonstration profile.
```

因此没有把虚拟公司、产能或认证冒充真实业务证明。

## 公网与表单验证

- 页面 HTTP 200；
- Builder Core CSS `1.2.0` 加载；
- `fluentform_3` 渲染；
- 表单包含 full name、work email、company、country/region、machine model、requirements；
- `verify-form` 实测：
  - browser submission accepted；
  - visible success confirmation shown；
  - Fluent Forms entries `1 → 2`;
  - increment `1`;
  - entry ID `2`;
  - status `unread`。

### Chrome 视觉/可访问性检查

Desktop：

```text
viewport 1440
no horizontal overflow
heading order:
H1 → Manufacturing scope → Production checkpoints → Buyer Benefits → Specifications → Questions and Answers → Send your enquiry → Send machine details
CTA height 50px
form ID fluentform_3
```

Mobile：

```text
no horizontal overflow
visible input width 418px
CTA height 50px
single-column form
```

截图：

```text
/Users/Zhuanz1/Documents/ChatGPT/wordpress-builder-skill/.wordpress-builder/visual/oem-bucket-rich-landing-final-desktop.png
/Users/Zhuanz1/Documents/ChatGPT/wordpress-builder-skill/.wordpress-builder/visual/oem-bucket-rich-landing-final-mobile.png
```

## CMS 验收

`cms-audit` 通过：

```text
field group: group_wbc_content
fields: 10
page templates: 5
stored values checked: 1
problems: 0
```

## Elementor 历史页面保护

历史页面：

```text
Historical Elementor Page
ID 6
slug historical-elementor-page
```

验证：

```text
post status: publish
_elementor_edit_mode: builder
_elementor_data length: 371
template: empty/default
```

本轮没有执行任何针对该页面的写入；Builder page 是并行新增路由。

## 未完成 / 边界

1. SMTP 实际送达未在本轮验证；
2. 表单通知发送到站点 `admin_email`，尚未在真实邮箱确认；
3. 虚拟企业资料不能作为正式客户网站发布内容；
4. Rich Landing 的视觉质量已达到工程验收，但还需用户审美确认和真实客户资料替换。

## 本地完整 gate

在版本 `2.27.0` 上通过：

```text
npm run typecheck
npm run lint
npm test
npm run build
```

结果：

```text
tests: 256/256 pass
```

## 复用化：`builder form install`

发现的一次性流程风险：

- 本轮测试表单最初通过临时远程 PHP 创建；
- 如果只修当前网站，不沉淀成命令，下次用户仍需要手工建表单。

已新增复用命令：

```bash
node wordpress-builder.mjs --project . builder form install
```

行为：

1. 默认先备份，可用 `--skip-backup` 跳过；
2. 检测 Fluent Forms：
   - 未安装则安装并激活；
   - 已安装未激活则激活；
3. 创建或复用：

```text
Builder equipment RFQ
```

4. 字段：

```text
full_name
email
company
country_region
machine_model
requirements
```

5. 新表单配置：
   - same-page visible confirmation；
   - `samePageFormBehavior=hide_form`;
   - admin email notification；
   - subject 使用 `{inputs.machine_model}`。
6. 输出数字 shortcode，供 `wbc_form_shortcode` 使用。
7. 已存在同名表单时默认不覆盖字段和 meta，只返回现有 ID。

真实站点复测：

```json
{
  "id": 3,
  "title": "Builder equipment RFQ",
  "action": "existing",
  "metaActions": [],
  "shortcode": "[fluentform id=\"3\"]",
  "fluentFormsInstalled": false
}
```

新增测试：

```text
tests/harness/builder-form.test.mjs
```

## 最终本地 gate

在加入 `builder form install` 后重新执行完整 gate：

```text
typecheck ✅
lint ✅
tests ✅ 258/258
build ✅
```
