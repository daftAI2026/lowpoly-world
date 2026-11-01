# web/
> L2 | 父级: ../CLAUDE.md

## 成员清单

package.json: 锁定前端依赖；用 npm overrides 对齐 Vite+ core 与 Vitest 版本。
package-lock.json: 固定 npm 依赖解析结果，供离线可复现安装。
vite.config.ts: 接入 Vite+、TanStack Start、Fumadocs 与静态路由；预渲染预览固定绑定 127.0.0.1。
source.config.ts: 声明 Fumadocs `.mdx` 集合，沿用原生代码高亮。
components.json: 声明 shadcn Base UI 风格、Tailwind CSS 与组件导入别名。
tsconfig.json: 配置严格 TypeScript 与 `@/` 源码别名。
.gitignore: 排除构建产物、依赖目录、`.tanstack` 缓存和隔离 Playwright 会话。
README.md: 说明 Vite+ 命令、数据边界和静态输出目标。
DESIGN.md: 固定官网 Spacious 基线、原生样式边界与资产专属扩展。
src/: 双语路由、资产库、模型查看器、数据边界和分层样式。
content/: Fumadocs 编译期文档源。
hf-space/: 预构建静态产物的 Space 元数据模板，禁用需额度的远端构建。
tests/: Vite+ Vitest 离线测试；只用测试内合成 fixture。
scripts/: 路由生成、静态路由清单和静态输出 smoke 断言。

Dataset 发布器不读写 Space。Space 只托管构建输出，不运行 Node 服务。

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
