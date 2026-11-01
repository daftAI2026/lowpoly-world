# components/
> L2 | 父级: ../CLAUDE.md

## 成员清单

asset-card.tsx: 扩展 Fumadocs Card 展示正方形完整预览、名称和编号；原生链接适配静态路径。
asset-metadata-panel.tsx: 按需呈现发布元数据；缺字段不推断许可、质量或权利。
asset-page.tsx: 组合模型文件入口、查看器与 metadata；返回链接指向当前语言 index.html。
catalog-browser.tsx: 维护搜索、排序和筛选状态，组合 facets 与虚拟结果网格。
catalog-filters.tsx: 展示分类树与有值筛选项；空标签组隐藏，窄屏通过原生 details 折叠。
catalog-grid.tsx: 按行虚拟化筛选结果；没有记录时呈现无匹配状态。
catalog-state.tsx: 共用双语加载、空目录和目录校验失败视图；只保留必要重试入口。
home-page.tsx: HomeLayout 内的双语资产内容；导航交给共享模板配置。
hugging-face-icon.tsx: CC0 品牌路径，使用 currentColor，不加载外部图片。
model-viewer-panel.tsx: 当前详情页唯一 3D viewer；加载失败时回退同资产预览。
mdx.tsx: 合并 Fumadocs 默认组件与文档覆盖组件。
not-found.tsx: 提供未知静态路径的站点级 404 内容。
search.tsx: 使用静态搜索索引渲染 Fumadocs 搜索对话框。
ui/: Base UI 原语和 shadcn 风格的 Button、Checkbox、Input。

页面只渲染 Dataset 记录；空目录不生成演示资产。文案由 i18next 资源提供。

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
