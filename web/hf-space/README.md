---
title: Lowpoly World
emoji: 🌱
colorFrom: green
colorTo: yellow
sdk: static
app_file: index.html
---
<!--
[INPUT]: 依赖本机或 CI 已验收的 dist/client 静态产物。
[OUTPUT]: 提供不调用远端构建的 HF Static Space 配置。
[POS]: 复制到静态产物根目录；不请求计算硬件或构建额度。
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->

# Lowpoly World

Build and verify the website locally or in GitHub Actions. Copy the contents of `dist/client/`
to this Space repository root, then add this README. Do not upload website source dependencies,
Python tools or Dataset assets. The gallery reads the public Dataset `daftAI2026/3d-assets`.

Do not add `app_build_command`: remote Static Space builds require account credits. This project
serves prebuilt HTML, JavaScript, CSS and static search data without a server or remote build.
