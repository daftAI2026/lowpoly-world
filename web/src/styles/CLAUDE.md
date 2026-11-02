# styles/
> L2 | 父级: ../CLAUDE.md

## 成员清单

app.css: 导入 Tailwind、Fumadocs 和本地 CSS 分层，不直接承载业务规则。
tokens.css: 本地官网字体与资产色别名；不覆盖原生字号、圆角和主题底色。
shell.css: 展示页对齐原生 Home 导航；文档只复用回退提示。
catalog.css: 定义搜索、分类树、facet、资产卡、虚拟网格和目录状态。
workspace-controls.css: 工具栏、条件条、选择集与下载会话的低噪声控制样式。
workspace.css: 资产结果与可停靠预览共享区域；不改文档原生几何。
detail.css: 定义单件查看器、下载按钮、元数据和预览布局。
responsive.css: 依据内容容器宽度统一维护窄屏断点、筛选折叠和减少动态规则。
fumadocs.css: 保留无覆盖入口；模板几何、排版与外观全部归上游。

每层保持单一视觉职责。样式不含远端图像或模型内容。单文件不超过 800 行。

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
