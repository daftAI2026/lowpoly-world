/**
 * [INPUT]: Fumadocs MDX、Tailwind CSS 4 与 TanStack Start 的 Vite 插件。
 * [OUTPUT]: 导出只生成静态页面的 Vite 配置。
 * [POS]: web 构建入口；将 SPA shell 固定输出为 index.html。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import react from '@vitejs/plugin-react';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { fumadocsMdx } from 'fumadocs-mdx/vite';

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    fumadocsMdx(),
    tailwindcss(),
    tanstackStart({
      spa: {
        enabled: true,
        prerender: {
          enabled: true,
          outputPath: '/index.html',
          crawlLinks: true,
        },
      },
      prerender: {
        failOnError: true,
      },
      pages: [
        { path: '/en/' },
        { path: '/zh/' },
        { path: '/en/asset/' },
        { path: '/zh/asset/' },
        { path: '/en/docs' },
        { path: '/zh/docs' },
        { path: '/api/search' },
      ],
    }),
    react(),
  ],
  resolve: {
    tsconfigPaths: true,
    alias: {
      tslib: 'tslib/tslib.es6.js',
    },
  },
});
