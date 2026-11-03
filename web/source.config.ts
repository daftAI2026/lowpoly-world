/**
 * [INPUT]: 依赖公开 MDX 页面和 Fumadocs 的 Shiki none 主题。
 * [OUTPUT]: 声明文档集合；代码继承页面颜色，不引入语法调色板。
 * [POS]: 编译文档；GEB `.md` 地图不进入集合。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { defineConfig, defineDocs } from 'fumadocs-mdx/config';

export default defineConfig({
  mdxOptions: {
    rehypeCodeOptions: {
      themes: { light: 'none', dark: 'none' },
      icon: false,
    },
  },
});

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    files: ['**/*.mdx'],
    async: true,
    postprocess: { includeProcessedMarkdown: true },
  },
});
