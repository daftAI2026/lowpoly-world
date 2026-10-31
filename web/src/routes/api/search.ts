/**
 * [INPUT]: 依赖 server-only Fumadocs 页面源与 Orama 静态搜索索引生成器。
 * [OUTPUT]: 导出所有 locale 共用的 `/api/search` 静态 GET 响应。
 * [POS]: 多语言搜索构建端点；静态 Space 只托管生成文件，不运行 API 服务。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { createFileRoute } from '@tanstack/react-router';
import { createServerOnlyFn } from '@tanstack/react-start';
import { createFromSource } from 'fumadocs-core/search/server';
import { source } from '@/lib/source.server';

const getSearchResponse = createServerOnlyFn(() =>
  createFromSource(source).staticGET(),
);

export const Route = createFileRoute('/api/search')({
  server: {
    handlers: {
      GET: () => getSearchResponse(),
    },
  },
});
