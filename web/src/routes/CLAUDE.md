# routes/
> L2 | 父级: ../CLAUDE.md

## 成员清单

__root.tsx: 从 URL 语言参数配置 HTML、i18next 与 Fumadocs Provider。
index.tsx: 将根路径映射到默认英文首页。
$lang/: 校验语言段并承载 `/en/` 与 `/zh/` 页面。
api/: 从 server-only Fumadocs source 将多语言搜索索引导出为静态 GET 响应。

资产详情的 ID 位于查询参数，不创建任意动态页面文件。
中文文档没有译稿时，Fumadocs 显示英文源文并标明回退。
文档正文从 browser adapter 加载；服务端页面树只经静态函数序列化。

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
