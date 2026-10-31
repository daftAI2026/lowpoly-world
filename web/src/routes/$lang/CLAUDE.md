# $lang/
> L2 | 父级: ../CLAUDE.md

## 成员清单

route.tsx: 校验 `en`、`zh` URL 段，并为该语言页面设置元数据。
index.tsx: 读取 URL 语言并渲染本地化首页。
asset/: 以语言前缀读取资产查询参数与公开目录记录。
docs/: 按同一语言构建 Fumadocs 页面树与明确的英文回退提示。

语言由 URL 唯一确定。路由不写 cookie，也不探测浏览器语言。

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
