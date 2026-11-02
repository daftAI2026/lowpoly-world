# components/
> L2 | 父级: ../CLAUDE.md

## 成员清单

workspace-toolbar.tsx: URL 搜索、面包屑、条件条、视图密度与偏好，不加载模型。
download-selection.tsx: 独立下载选择集与固定版本文件、清单和命令，不追踪磁盘落盘。
copy-button.tsx: Clipboard 真实成功与失败反馈，预览和下载共用。

asset-card.tsx: 扩展 Fumadocs Card 展示正方形完整预览、名称和编号；原生链接适配静态路径。
asset-metadata-panel.tsx: 按需呈现发布元数据；缺字段不推断许可、质量或权利。
asset-page.tsx: 组合模型文件入口、查看器与 metadata；返回链接指向当前语言 index.html。
catalog-browser.tsx: 组合 URL 状态、筛选、结果、单实例预览与独立下载选择。
catalog-filters.tsx: 展示分类树与有值筛选项；空标签组隐藏，内容容器变窄时通过原生 details 折叠。
catalog-grid.tsx: 真实滚动宿主的行虚拟化，支持网格、列表、密度与结果定位。
catalog-state.tsx: 共用双语加载、空目录和目录校验失败视图；只保留必要重试入口。
docs-shell.tsx: 文档专用 Spacious 阅读布局；展示页不读取文档树。
asset-details.tsx: 预览面板与独立详情共用的模型、文件和元数据组合器。
asset-preview.tsx: 结果工作区内部的可关闭预览，支持左右下停靠和应用内展开。
preview-resize-handle.tsx: 指针捕获与键盘调整预览宽高，不注册全局监听。
home-page.tsx: HomeLayout 承载模型浏览；没有文档侧栏或阅读面板。
hugging-face-icon.tsx: 本地 HF 官方彩色 SVG，不改黄颜色与比例。
model-viewer-panel.tsx: 当前选中资产唯一 3D viewer；加载失败时回退同资产预览。
mdx.tsx: 合并 Fumadocs 默认组件与文档覆盖组件。
not-found.tsx: 提供未知静态路径的站点级 404 内容。
search.tsx: 使用静态搜索索引渲染 Fumadocs 搜索对话框。
ui/: 资产输入原语；按钮外观复用 Fumadocs，不负责全站布局。

页面只渲染 Dataset 记录；空目录不生成演示资产。文案由 i18next 资源提供。

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
