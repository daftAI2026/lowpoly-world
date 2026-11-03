---
title: Lowpoly World
emoji: 🌱
colorFrom: green
colorTo: yellow
sdk: static
license: mit
short_description: Browse and download low-poly 3D assets
app_file: index.html
---
<!--
[INPUT]: 依赖本机或 CI 已验收的 dist/client 静态产物。
[OUTPUT]: 提供双语功能、下载与版本说明、Dataset 互链及静态托管配置。
[POS]: 复制到静态产物根目录；不请求计算硬件或构建额度。
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->

# Lowpoly World

Browse low-poly 3D models, inspect them interactively, and download GLB or Blender files.
浏览低多边形模型，使用交互式 3D 查看器，下载 GLB 或 Blender 文件。

[English gallery](https://daftai2026-gallery.static.hf.space/en/index.html) | [中文展厅](https://daftai2026-gallery.static.hf.space/zh/index.html)

[Dataset and Data Studio](https://huggingface.co/datasets/daftAI2026/3d-assets) | [Documentation](https://daftai2026-gallery.static.hf.space/en/docs/index.html) | [使用文档](https://daftai2026-gallery.static.hf.space/zh/docs/index.html) | [GitHub](https://github.com/daftAI2026/lowpoly-world)

## Browse and download / 浏览与下载

Search and filter the published catalog, switch between grid and list views, and preview GLB models. Review a multi-asset selection before saving files to a folder or copying revision-pinned download commands. If folder selection is unavailable in an embedded page, open the gallery directly or use the commands.

搜索和筛选已发布目录，切换网格或列表，预览 GLB 模型。多选后先审阅，再保存到文件夹或复制固定版本下载命令。嵌入页面无法选择文件夹时，直接打开展厅或使用命令。

The gallery and guides share the native Fumadocs shell, with separate pages. This Space hosts only the prebuilt application. Model files and the current published count come from the Dataset.

展厅与使用文档共用 Fumadocs 原生壳，页面各自独立。本 Space 只托管预构建应用，模型文件和当前发布数量以 Dataset 为准。

## Updates / 增量更新

New and revised models enter the Dataset after release checks. The gallery reads catalog updates without a website rebuild. Revisions keep the asset ID and use versioned file paths. Pin a Dataset commit when reproducible downloads are required.

新增和修订模型通过发布检查后进入 Dataset，展厅读取更新目录，无需重建网站。修订版保留资产编号，使用版本化文件路径。需要可复现下载时，固定 Dataset commit。

Website code: MIT. Individually reviewed project-owned models: CC BY 4.0, as recorded per asset. Third-party reference images are excluded.
网站代码采用 MIT。逐件审核的自有模型采用 CC BY 4.0，以资产记录为准，不包含第三方参考图。

## Build and hosting

Build and verify locally or in GitHub Actions. Copy `dist/client/`, this README and the website LICENSE to the Space root. Do not upload private tools, credentials or Dataset assets.

Do not add `app_build_command`: remote builds require account credits. This Space serves prebuilt HTML, JavaScript, CSS and search data without a server or remote build.
