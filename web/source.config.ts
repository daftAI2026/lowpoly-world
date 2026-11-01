/**
 * [INPUT]: 依赖公开 MDX 页面与 Fumadocs 默认代码主题。
 * [OUTPUT]: 声明文档集合，沿用官方代码高亮，不维护自定义调色板。
 * [POS]: 编译文档；GEB `.md` 地图不进入集合。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { defineConfig, defineDocs } from 'fumadocs-mdx/config';

export default defineConfig();

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    files: ['**/*.mdx'],
    async: true,
    postprocess: { includeProcessedMarkdown: true },
  },
});
