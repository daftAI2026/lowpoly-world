# web/
> L2 | 父级: ../CLAUDE.md

## 成员清单

package.json: 锁定前端依赖；用 npm overrides 对齐 Vite+ core 与 Vitest 版本。
package-lock.json: 固定 npm 依赖解析结果，供离线可复现安装。
vite.config.ts: 接入 Vite+、TanStack Start、Fumadocs 与静态路由；预渲染预览固定绑定 127.0.0.1。
source.config.ts: 声明 `.mdx` 集合；Shiki none 使代码继承页面颜色。
components.json: 固定官方 shadcn Base Nova、Base UI 与导入别名。
tsconfig.json: 配置严格 TypeScript 与 `@/` 源码别名。
.gitignore: 排除构建产物、依赖目录、`.tanstack` 缓存和隔离 Playwright 会话。
README.md: 说明当前浏览与下载能力、Vite+命令和静态发布边界。
DESIGN.md: 展示与文档分离，固定工作区交互、原生视觉和免费托管边界。
src/: 双语路由、资产库、模型查看器、数据边界和分层样式。
content/: Fumadocs 编译期文档源。
hf-space/: 预构建静态产物的 Space 元数据模板，禁用需额度的远端构建。
tests/: Vite+ Vitest 离线测试；只用测试内合成 fixture。
scripts/: 路由生成、静态输出验证与本地字体子集生成。

Dataset 发布器不读写 Space。Space 只托管构建输出，不运行 Node 服务。

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
