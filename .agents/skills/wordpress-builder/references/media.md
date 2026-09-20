# 图片和 PDF

`upload-media --plan media.json --task <原任务目录>` 使用文件内容哈希持久化操作；同一任务重复相同请求复用媒体ID。请求结果未知不重发，已知ID回读失败只继续回读。

```json
{
  "file": "/absolute/path/product-photo.png",
  "title": "资料中的产品名称",
  "alt": "准确说明画面中的产品和可见特征",
  "caption": "需要时提供来源或说明"
}
```

支持PNG/JPEG/WebP/PDF，文件非空且不超过10MiB，扩展名与签名匹配。只上传当前任务明确提供或生成的素材；不要批量扫描用户目录找图。保留真实来源，不编造照片中的认证、性能或产线归属。

成功返回id、url、mime及metadataMatches；这是媒体库证据。图片用`{"type":"image","mediaId":123,"alt":"描述"}`加入页面计划。PDF使用返回的真实url作为下载按钮链接。上传前确认账号拥有upload_files。

页面预览还必须检查图片加载、显示比例、手机端布局及alt。内容更新计划支持 `featuredMedia` 设置特色图（见 [content.md](content.md)），仍需检查主题是否正确显示。当前未提供既有媒体元数据改写；更改同文件的元数据会拒绝复用旧上传操作，不能换task目录绕过造成重复媒体。后续应按已有ID开发独立更新接口。

官方接口：[WordPress Media REST API](https://developer.wordpress.org/rest-api/reference/media/)。PDF字段与图片字段同属媒体接口，但实际站点允许的MIME类型、上传限制与权限仍以响应为准。
