---
title: Lowpoly World
emoji: 🌱
colorFrom: green
colorTo: yellow
sdk: static
app_build_command: npm ci && npm run build
app_file: dist/client/index.html
---
<!--
[INPUT]: 依赖仓库内 web/ 的锁文件、静态构建脚本和 Vite 客户端输出。
[OUTPUT]: 提供 Hugging Face Static HTML Space 的配置草案。
[POS]: 部署元数据模板；不代表已创建或已部署 Space。
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->

# Lowpoly World

Mirror the contents of `web/` to this Space repository root. Do not copy the Python publisher or
Dataset assets. The gallery reads the public Dataset `daftAI2026/3d-assets`.

Before deployment, verify that the build writes `dist/client/index.html`, all linked route
files, and static search data. This Space must not run a Node.js server or write to the Dataset.
