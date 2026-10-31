# components/
> L2 | 父级: ../CLAUDE.md

## 成员清单

asset-card.tsx: 展示目录快照中的真实预览与资产编号；缺少中文名时回退英文名。
asset-page.tsx: 展示已校验资产详情；返回与空态入口指向当前语言的目录首页。
catalog-state.tsx: 共用双语加载、空目录和目录校验失败视图。
home-page.tsx: 共用双语首页；浏览按钮定位本页资产列表。
mdx.tsx: 合并 Fumadocs 默认组件与文档覆盖组件。
not-found.tsx: 提供未知静态路径的站点级 404 内容。
search.tsx: 使用构建期搜索索引渲染文档搜索对话框。

卡片只渲染 Dataset 记录；空目录不生成演示资产。文案由 i18next 资源提供。

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
