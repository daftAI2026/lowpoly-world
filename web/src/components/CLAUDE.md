# components/

> L2 | 父级: ../CLAUDE.md

## 成员清单

catalog-search.tsx: 原生搜索插槽组合 shadcn 输入和移动弹层，共用 URL 查询，不查询文档。

gallery-shell.tsx: 官网 Spacious 全屏壳，原生侧栏接收筛选内容，主区禁用章节目录。

workspace-toolbar.tsx: 排序、结果计数与按需分类路径、条件条和视图偏好，不加载模型。
download-selection.tsx: 独立下载选择集与固定版本文件、清单和命令，不追踪磁盘落盘。
copy-button.tsx: 组合官方 Button 与真实 Clipboard 反馈，不重造按钮。

asset-card.tsx: 组合 shadcn Card 展示正方形完整预览、名称和编号；原生链接适配静态路径。角落勾选内移，40px 透明点击区不遮图。
asset-metadata-panel.tsx: 按需呈现发布元数据；缺字段不推断许可、质量或权利。
asset-page.tsx: 组合模型文件入口、查看器与 metadata；返回链接指向当前语言 index.html。
catalog-browser.tsx: 原生侧栏承载筛选，主区组合 URL 与官方 Resizable 分栏，不重造拖拽交互。
catalog-filters.tsx: 展示分类树与有值筛选项；空标签组隐藏，宽窄屏开关由原生侧栏与抽屉负责。
catalog-grid.tsx: 真实滚动宿主的行虚拟化，支持网格、列表、密度与结果定位。
catalog-state.tsx: 共用双语加载、空目录和目录校验失败视图；只保留必要重试入口。
docs-shell.tsx: 文档专用 Spacious 阅读布局；展示页不读取文档树。
asset-details.tsx: 共用模型与事实；紧凑元数据归事实列，独立详情保留整页位置。
asset-preview.tsx: 结果工作区内部的可关闭预览，支持左右下停靠和应用内展开。
home-page.tsx: GalleryShell 承载模型浏览和加载状态；隐藏重复视觉标题，保留语义标题。
hugging-face-icon.tsx: 本地 HF 官方彩色 SVG，不改黄颜色与比例。
model-viewer-panel.tsx: 当前选中资产唯一 3D viewer；加载失败时回退同资产预览。
mdx.tsx: 合并 Fumadocs 默认组件与文档覆盖组件。
not-found.tsx: 提供未知静态路径的站点级 404 内容。
search.tsx: 使用静态搜索索引渲染 Fumadocs 搜索对话框。
ui/: shadcn/ui 官方 Base Nova 控件与来源摘要；FU 仍负责导航和文档。

页面只渲染 Dataset 记录；空目录不生成演示资产。文案由 i18next 资源提供。

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
