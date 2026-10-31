/**
 * [INPUT]: Fumadocs MDX、Tailwind CSS 4 与 TanStack Start 的 Vite 插件。
 * [OUTPUT]: 导出静态页面配置与仅供预渲染使用的回环预览主机。
 * [POS]: web 构建入口；固定 SPA shell 输出，并消除 localhost 地址族歧义。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import react from '@vitejs/plugin-react';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import { defineConfig } from 'vite-plus';
import tailwindcss from '@tailwindcss/vite';
import { fumadocsMdx } from 'fumadocs-mdx/vite';
import { staticPrerenderPages } from './scripts/static-routes.mjs';

export default defineConfig({
  preview: {
    host: '127.0.0.1',
  },
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
          autoSubfolderIndex: true,
          crawlLinks: true,
        },
      },
      prerender: {
        failOnError: true,
      },
      pages: staticPrerenderPages.map((page) => page.path === '/api/search'
        ? page
        : { ...page, prerender: { autoSubfolderIndex: true } }),
    }),
    react(),
  ],
  resolve: {
    tsconfigPaths: true,
    alias: {
      tslib: 'tslib/tslib.es6.js',
    },
  },
  check: {
    fmt: false,
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  test: {
    include: ['tests/**/*.test.mjs'],
    environment: 'node',
  },
});
