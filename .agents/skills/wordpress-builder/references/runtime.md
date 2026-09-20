# 独立执行接口

`wp` 下文指 `node "<Skill绝对目录>/scripts/wp.mjs"`。Node.js 22+；构建后无需浏览器扩展或另一个模型 API。

## 新站编排接口（不需要 REST 凭据）

| 命令 | 实际行为 |
| --- | --- |
| `wp capabilities` | 校验随包 10 个官方模块的文件哈希，列出入口与依赖；不探测远端能力 |
| `wp project-init --plan project.json --task run` | 创建不可静默改绑的新站契约；相同输入可恢复 |
| `wp project-inspect --task run` | 在 sourceRoot 实际执行官方只读 triage，保存 triage.json |
| `wp project-status --task run` | 检查阶段证据文件是否改变，返回下一未完成阶段；不是实时远端审计 |
| `wp project-record --plan receipt.json --task run` | 校验前置阶段、检查状态和任务目录内的证据，记录阶段回执 |

新站项目文件（sourceRoot 必须已存在，使用绝对路径；以下版本只是格式示例，不是支持矩阵）：

```json
{
  "schemaVersion": 1,
  "scope": "new-site",
  "name": "企业产品网站",
  "sourceRoot": "/absolute/path/to/new-site",
  "theme": "php-hybrid",
  "environment": "playground",
  "targets": {"wordpress":"7.1", "php":"8.3", "acf":"free"},
  "brief": "基于已核实企业资料，建立产品分类、详情和询盘网站。"
}
```

主题可选 php-hybrid/block，环境可选 playground/wp-env/managed-host。project-init 只建立本地契约，不创建 WordPress、不自动安装插件、不证明远端是新站，也不授予发布权限。旧站接管不在当前产品范围。

阶段回执（证据先保存到任务目录；实际完成后才写 verified/pass）：

```json
{
  "projectHash": "project-init 返回的 64 位哈希",
  "stage": "discover",
  "outcome": "verified",
  "summary": "已核对本地代码、干净站点和实际运行版本。",
  "checks": [{"name":"新站与环境核验","status":"pass"}],
  "evidence": ["triage.json", "environment.json"]
}
```

阶段：discover/model/theme/content/verify/release；outcome 可选 verified/failed；check status 可选 pass/fail/not-tested。verified 要求检查全部通过且前置阶段已记录验证。证据指向任务目录内实际文件，不能使用目录外路径或逃逸符号链接。文件变动会使记录 stale；已有后续阶段时不改写前置回执，保留该轮并新建迭代任务。记录是有证据的声明，真实性仍需审核，不会替你发布站点。

## WordPress 内容执行接口

这些命令服务于新站及本方案建成站点的维护，不代表兼容任意旧站。build 是有限区块页面适配器，PHP 主题生成与部署走专业工作流。

连接：私下配置环境变量 `WP_URL`（包含实际子目录）、`WP_USERNAME`、`WP_APP_PASSWORD`。非默认 REST 根可设置 `WP_REST_URL`，例如 `https://example.com/subdir/?rest_route=/`。当前不自动发现 REST 根；doctor 失败时读取网站公开 REST discovery 信息后明确指定，不能猜测外部 API 目的地。认证请求不跟随重定向。HTTP 只允许 `WP_ALLOW_LOCAL_HTTP=1` 的回环测试地址。

| 命令 | 作用 |
| --- | --- |
| `wp doctor --task run` | 真实连接与能力证据，保存 profile.json |
| `wp read-page --id 123 --task run` | 读取完整原文与指纹，保存 read-page-123.json |
| `wp build --plan site.json --task run` | 新页面草稿与实际地址补链，可恢复 |
| `wp build --plan site.json --task run --publish --evidence release.json` | 原文保留发布，设置标题/描述/首页 |
| `wp status --task run` | 查看保存状态；不冒充实时状态 |
| `wp template-parts --task run` | 当前可读的模板部件原文，最多100项 |
| `wp navigation-plan --plan nav.json --task run` | 生成固定版本计划；不写远端 |
| `wp navigation-apply --id <planId> --task run` | 精确替换、回读；拒绝依赖变化 |
| `wp page-edit-plan --plan edit.json --task run` | 检查当前指纹，保存完整原文和修改后正文 |
| `wp page-edit-apply --id <planId> --task run` | 应用固定改稿，保留原状态和模板，更新本任务进度 |
| `wp upload-media --plan media.json --task run` | 上传实际本地图片/PDF，回读元数据并保存实际ID |
| `wp content-type --type oct_product --task run` | 发现真实公开内容类型、REST 路由及写入 schema |
| `wp read-content --type oct_product --id 123 --task run` | 读取原文、字段及内容指纹 |
| `wp content-plan --plan product.json --task run` | 固定创建或部分字段更新计划，返回完整影响 |
| `wp content-apply --id <planId> --task run` | 应用固定计划，按字段回读并保留未改原文 |
| `wp import-plan --plan mapping.json --task run` | CSV 全批校验，固定文件哈希及稳定键 |
| `wp import-apply --id <planId> --task run` | 逐条创建草稿，可从已知回执继续 |

站点计划结构：

```json
{
  "title": "企业名称",
  "description": "真实业务描述",
  "sourceFiles": ["company.md"],
  "home": "home",
  "pages": [
    {"key":"home","title":"Home","slug":"home","blocks":[
      {"type":"heading","text":"页面主题","level":2},
      {"type":"paragraph","text":"基于资料的正文"},
      {"type":"button","text":"Contact","url":"page:contact"}
    ]},
    {"key":"contact","title":"Contact","slug":"contact","blocks":[
      {"type":"paragraph","text":"真实联系方式"}
    ]}
  ]
}
```

支持 heading（H2–H6）、paragraph、button、image（实际 mediaId 和 alt）、table（等列 rows）、faq（question/answer）、section（children）、columns（2–4列，各有children）、meta（key/fallback，真实文本字段绑定）、catalog（postType/perPage，真实公开类型查询）。section.style 支持六位HEX的 background/color、0–160的padding、0–80的radius。嵌套最多3层。列宽省略均分或全部指定且合计100。正文不接收任意 HTML。image用已核实或upload-media返回的媒体；form暂明确拒绝。CMS与CSV输入见 [内容模型与导入](content.md)。

导航输入：`{"templatePart":"实际主题//实际部件","markup":"完整且唯一的原导航片段","links":[{"pageId":123,"label":"Home"}]}`。当前只适配简单区块导航，复杂菜单或绑定必须先研究适配。

改稿输入：`{"id":123,"expectedVersion":"read-page返回的version","blocks":[完整修改后的区块]}`，可选title。该接口替换完整正文而非局部补丁；先逐项核对旧稿、保留无关内容。所有按钮须使用实际URL，不接收page:key。已发布页面改稿会立即更新前台，需处于用户授权范围；对同一计划重跑不会重复写入。与build使用相同task目录时，后续整站恢复会保留改稿。

任务目录包含固定计划、原始站点设置、每页完整回执、每次操作及导航计划。指纹包含原文，能发现同秒修改；仍是客户端写前检查，存在检查到写入之间的并发窗口，不宣称服务端原子锁。

发布前先完成草稿与真实验收，并按 [发布证据](release.md) 提供版本绑定的 JSON。缺失或陈旧证据会在发布写入前拒绝。
