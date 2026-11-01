/**
 * [INPUT]: 依赖公开 MDX 页面和 Stone、Teal 语义色。
 * [OUTPUT]: 声明 Fumadocs 文档集合和低多边形网站代码主题。
 * [POS]: 编译文档与代码高亮；GEB `.md` 地图不进入集合。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { defineConfig, defineDocs } from 'fumadocs-mdx/config';

const lowpolyCodeTheme = {
  name: 'lowpoly-world',
  type: 'light' as const,
  fg: 'var(--lpw-ink)',
  bg: 'var(--lpw-surface)',
  colors: {
    'editor.background': 'var(--lpw-surface)',
    'editor.foreground': 'var(--lpw-ink)',
  },
  tokenColors: [
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: 'var(--lpw-muted)' } },
    { scope: ['keyword', 'storage', 'storage.type', 'storage.modifier'], settings: { foreground: 'var(--lpw-accent)' } },
    { scope: ['string', 'constant.numeric', 'constant.language'], settings: { foreground: 'var(--color-teal-900)' } },
    { scope: ['entity.name.function', 'support.function'], settings: { foreground: 'var(--color-teal-700)' } },
  ],
};

export default defineConfig({
  mdxOptions: {
    rehypeCodeOptions: {
      themes: { light: lowpolyCodeTheme },
    },
  },
});

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
