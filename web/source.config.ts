/**
 * [INPUT]: 依赖 content/docs 中的公开 MDX 页面。
 * [OUTPUT]: 声明仅编译 `.mdx` 的 Fumadocs 文档集合。
 * [POS]: Vite 生成隔离的 server/browser adapter；GEB `.md` 地图不进入集合。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { defineDocs } from 'fumadocs-mdx/config';

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    files: ['**/*.mdx'],
    async: true,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
});
