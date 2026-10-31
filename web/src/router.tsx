/**
 * [INPUT]: 依赖 TanStack 文件路由树与站点 404 组件。
 * [OUTPUT]: 导出应用 Router 工厂，启用意图预加载与滚动恢复。
 * [POS]: 文件路由树唯一入口；不创建服务端 handler。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { createRouter as createTanStackRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import { NotFound } from '@/components/not-found';

export function getRouter() {
  return createTanStackRouter({
    routeTree,
    defaultPreload: 'intent',
    scrollRestoration: true,
    defaultNotFoundComponent: NotFound,
  });
}
