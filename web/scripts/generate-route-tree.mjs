/**
 * [INPUT]: 依赖 web/vite.config.ts 中的 TanStack Start 路由插件。
 * [OUTPUT]: 生成 src/routeTree.gen.ts，供独立 TypeScript 检查读取。
 * [POS]: web/scripts 的类型检查前置步骤；复用开发与构建路由配置。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const configFile = fileURLToPath(new URL('../vite.config.ts', import.meta.url));
const server = await createServer({
  configFile,
  logLevel: 'error',
  mode: 'development',
  root: projectRoot,
});

// Vite configResolved 会运行 TanStack 路由生成器；本脚本不监听端口。
await server.close();
