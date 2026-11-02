# styles/

> L2 | 父级: ../CLAUDE.md

## 成员清单

fonts.css: Inter、改名思源 SC 子集与 Geist Mono 的本地变体声明。

shadcn.css: Tailwind 语义角色与 FU 边线映射，不改原始色板。

app.css: 导入 Tailwind、Fumadocs 和本地 CSS 分层，不直接承载业务规则。
tokens.css: 用户黑白 OKLCH 明暗色板、对比边线与字体栈，唯一主题源。
shell.css: 展示页只声明内容容器；全屏几何归 Spacious，文档复用回退提示。
catalog.css: 定义业务排列、分类层级、资产卡与结果状态，不重造基础控件。
workspace-controls.css: 单排结果工具、视图密度图标分组、条件条与下载会话样式。
workspace.css: 官方分栏停靠与画布余高；下方事实列独立滚动，不实现拖拽事件。
detail.css: 定义单件查看器、下载按钮、元数据和预览布局。
responsive.css: 依据内容容器宽度统一维护窄屏断点、详情换列和减少动态规则。
fumadocs.css: 统一原生主面板 0.5px 边线并停用布局过渡；几何与排版归上游。

每层保持单一视觉职责。样式不含远端图像或模型内容。单文件不超过 800 行。

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
