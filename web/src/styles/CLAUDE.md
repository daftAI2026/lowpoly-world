# styles/

> L2 | 父级: ../CLAUDE.md

## 成员清单

fonts.css: Inter、改名思源 SC 子集与 Geist Mono 的本地变体声明。

shadcn.css: Tailwind 工具类直连用户角色；FU 使用官方桥接，仅描边直连既有可见角色。

app.css: 导入 Tailwind、Fumadocs 和本地 CSS 分层，不直接承载业务规则。
tokens.css: 用户原始明暗色板、阴影与字体栈；描边直连 muted-foreground。
shell.css: 展示页只声明内容容器；全屏几何归 Spacious；展厅工具带对齐搜索、导航不透底，文档几何保持。
catalog.css: 定义分类整行命中、筛选、勾选资产卡与结果状态。
workspace-controls.css: 单一选择框与数量入口分组，视图、条件条和指针面板缓动。
downloads.css: 锚定选择审阅、独立确认、任务面板与进度排版，不挤占结果区。
workspace.css: 分栏停靠、固定文件底栏与按需拖拽提示；打开预览时结果与事实独立滚动；不实现拖拽事件。
detail.css: 三等分视角动作与整行元数据折叠；保留独立详情排版。
responsive.css: 依据内容容器宽度统一维护窄屏断点、详情换列和减少动态规则。
fumadocs.css: 侧栏透出外层背景；浮层不透底，主题轨道局部细边线，不改变全局描边或键盘焦点。

每层保持单一视觉职责。样式不含远端图像或模型内容。单文件不超过 800 行。

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
