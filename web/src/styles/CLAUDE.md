# styles/
> L2 | 父级: ../CLAUDE.md

## 成员清单

app.css: 导入 Tailwind、Fumadocs 和本地 CSS 分层，不直接承载业务规则。
tokens.css: 定义暖白、青绿、字体、边线和 Fumadocs 语义色阶。
shell.css: 定义首页头部、项目链接、内容宽度和无障碍隐藏文本。
catalog.css: 定义搜索、分类树、facet、资产卡、虚拟网格和目录状态。
detail.css: 定义单件查看器、下载按钮、元数据和预览布局。
responsive.css: 统一维护窄屏断点、筛选折叠和减少动态规则。
fumadocs.css: 收敛文档和代码色阶，并设置全站焦点、侧栏、静态搜索与边线。

每层保持单一视觉职责。样式不含远端图像或模型内容。单文件不超过 800 行。

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
