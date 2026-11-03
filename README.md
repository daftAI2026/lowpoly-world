<!--
[INPUT]: 依赖 web/ 的网站源码、构建配置与公开使用说明。
[OUTPUT]: 提供项目介绍、展厅入口、开发步骤与许可。
[POS]: 网站源码仓入口；不承载模型生产或内部工程知识。
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->
# Lowpoly World

An open collection of low-poly 3D assets by daftAI, with GLB models and editable Blender files.

daftAI 开源的低多边形 3D 资产库，提供 GLB 模型和可编辑的 Blender 源文件。

[中文展厅](https://daftai2026-gallery.static.hf.space/zh/index.html) | [English gallery](https://daftai2026-gallery.static.hf.space/en/index.html) | [Dataset](https://huggingface.co/datasets/daftAI2026/3d-assets) | [Hugging Face Space](https://huggingface.co/spaces/daftAI2026/gallery)

## Browse and download / 浏览与下载

Search by name or asset ID, browse categories, preview models in 3D, and download individual files or a selection of assets. The gallery and documentation are available in English and Simplified Chinese.

按名称或编号搜索，按分类浏览，查看 3D 模型，下载单个文件或批量选择的资产。展厅和使用文档支持英文与简体中文。

[Documentation](https://daftai2026-gallery.static.hf.space/en/docs/index.html) | [使用文档](https://daftai2026-gallery.static.hf.space/zh/docs/index.html)

## Development / 本地开发

```bash
cd web
npm ci
npm run dev
```

Built with React, TanStack Start, Fumadocs and shadcn/ui. See [web/README.md](web/README.md) for build and test commands.

使用 React、TanStack Start、Fumadocs 和 shadcn/ui 构建。构建和测试命令见[网站开发说明](web/README.md)。

## License / 许可

3D assets: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Credit **daftAI / Lowpoly World** and indicate any changes.

Website source: [MIT](LICENSE).

3D 资产采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)，署名 **daftAI / Lowpoly World**，修改后请注明。网站源码采用 [MIT](LICENSE)。
