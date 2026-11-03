# components/

> L2 | 父级: ../CLAUDE.md

## 成员清单

catalog-search.tsx: 原生搜索插槽组合 shadcn 输入和移动弹层，共用 URL 查询，不查询文档。

gallery-shell.tsx: 官网 Spacious 全屏壳，原生侧栏接收筛选内容，主区禁用章节目录。

workspace-toolbar.tsx: 单排结果工具、图标视图、三档密度与条件条，不加载模型。
download-selection.tsx: 选择计数与锚定审阅，组合独立下载确认和持久任务入口。
download-dialog.tsx: 下载确认、目录能力与固定版本命令；不拥有任务生命周期。
download-tasks.tsx: 任务计数、进度、取消和失败重试；关闭面板不停止下载。
copy-button.tsx: 组合官方 Button 与真实 Clipboard 反馈，不重造按钮。

asset-card.tsx: 组合 shadcn Card 展示正方形完整预览、同排名称与编号；原生链接适配静态路径。角落勾选内移；紫色下载勾选区别于预览当前项。
asset-metadata-panel.tsx: 按需呈现发布元数据；缺字段不推断许可、质量或权利。
asset-page.tsx: 组合模型文件入口、查看器与 metadata；返回链接指向当前语言 index.html。
catalog-browser.tsx: 原生侧栏承载筛选，主区组合 URL 与官方 Resizable 分栏，不重造拖拽交互。
catalog-filters.tsx: 展示分类树与有值筛选项；统一双语分类和折叠选项；不提供固定许可与存储来源选择。
catalog-grid.tsx: 真实滚动宿主的行虚拟化，支持网格、列表、密度与结果定位。
catalog-state.tsx: 共用双语加载、空目录和目录校验失败视图；只保留必要重试入口。
docs-shell.tsx: 文档侧栏只放正文树；右上角提供返回模型页入口。
asset-details.tsx: 共用模型与事实；紧凑元数据归事实列，独立详情保留整页位置。
asset-preview.tsx: 结果工作区内部的可关闭预览，名称菜单与图标停靠对齐同一栏，支持左右下停靠和应用内展开。
home-page.tsx: GalleryShell 承载模型浏览和加载状态；隐藏重复视觉标题，保留语义标题。
hugging-face-icon.tsx: 本地 HF 官方彩色 SVG，不改黄颜色与比例。
model-viewer-panel.tsx: 当前选中资产唯一 3D viewer；加载失败时回退同资产预览。
mdx.tsx: 合并 Fumadocs 默认组件与文档覆盖组件。
not-found.tsx: 提供未知静态路径的站点级 404 内容。
search.tsx: 使用静态搜索索引渲染 Fumadocs 搜索对话框。
ui/: shadcn/ui 官方 Base Nova 控件与来源摘要；FU 仍负责导航和文档。

页面只渲染 Dataset 记录；空目录不生成演示资产。文案由 i18next 资源提供。

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
