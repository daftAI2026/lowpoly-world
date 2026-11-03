# tests/
> L2 | 父级: ../CLAUDE.md

## 成员清单

download-ui.fixture.tsx: 真实组件的合成流浏览器装配，隔离文件权限、失败和重试。

catalog-layout.test.mjs: 紧凑名称编号、自然结果滚动与同排预览图标回归。

download-queue.test.mjs: 任务独立于弹层、排队取消、未完成文件重试与确认分层回归。

directory-download.test.mjs: 独立窗口能力检测与内存流回归，覆盖固定版本、取消和路径拒绝。

category-taxonomy.test.mjs: 分类别名归并、中英标签、保守名称推导与冲突回退回归。

gallery-shell.test.mjs: 全屏原生壳、唯一模型搜索、无章节列和静态详情链接回归。

catalog-header.test.mjs: 展厅单行工具栏、图标密度组、按需分类路径与唯一模型搜索回归。

preview-fit.test.mjs: 下方画布高度、紧凑工具栏与预览元数据事实列回归。

theme-selection.test.mjs: 角落遮挡、复选对比、用户主题与本地字体红绿回归。

component-reuse.test.mjs: 官方组件来源、禁止重复基础控件与 FU 主题桥接回归。

workspace-state.test.mjs: 验证完整浏览 URL、适用筛选与固定版本下载协议。

catalog.test.mjs: 验证指针、404 空态、摘要、schema、计数、ID、URL 和可选字段。
catalog-view.test.mjs: 验证分类/facet 数量、筛选组合、排序、计数和虚拟行。
asset-metadata.test.mjs: 验证可选资源、权利确认、错误隔离和 recipe JSON。
i18n.test.mjs: 验证 locale、路径、正文语言、回退、双语键对齐和组件文案引用完整性。
static-href.test.mjs: 验证语义路由与 index.html 双向映射、静态路径清单、query/hash、API 与未知路径边界。
content-boundary.test.mjs: 验证 MDX 集合排除地图、合法注释、免费静态部署边界、完整中文译稿、代码与 URL 一致性、MIT 托管通知与静态路由完整性。
workspace.test.mjs: 共用壳下的展示/文档内容分离、就地预览、普通链接、邻项与宽度边界。
layout.test.mjs: 验证官网 Spacious 壳、彩色标识、真实滚动宿主、双语右上角互链、HF/GitHub 入口与资产卡扩展边界。
ui-design.test.mjs: 验证资产字号、原生主题色别名、明暗对比边线、独立填充与焦点、圆角、动效和双语文案。

Vite+ Vitest 运行全部测试。测试替换 fetch，不访问 HF 网络或仓库资源。
合成目录记录只存在于测试模块。

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
