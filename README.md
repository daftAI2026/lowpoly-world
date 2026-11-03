<!--
[INPUT]: 依赖 web/ 的网站源码、构建配置与公开使用说明。
[OUTPUT]: 提供网站运行入口与代码、资产边界。
[POS]: 网站源码仓入口；不承载模型生产或内部工程知识。
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->
# Lowpoly World

Browse low-poly 3D assets, preview GLB models, and download GLB or Blender files.

低多边形资产展示应用。Fumadocs 提供原生全屏布局和文档，官方 shadcn Base UI 提供展厅控件与资产卡。模型库与使用文档分别进入，使用同一套主题。
项目包含两个交付：HF Dataset 与 HF Static Space 应用。模型库、3D 查看与使用文档都在应用内。
网站只读取公开 Dataset，不接触私人 Drive 或审核目录。

[中文页面](https://daftai2026-gallery.static.hf.space/zh/index.html)
[English](https://daftai2026-gallery.static.hf.space/en/index.html)
[Hugging Face Space](https://huggingface.co/spaces/daftAI2026/gallery)
[Dataset](https://huggingface.co/datasets/daftAI2026/3d-assets)
[使用文档](https://daftai2026-gallery.static.hf.space/zh/docs/index.html)
[Documentation](https://daftai2026-gallery.static.hf.space/en/docs/index.html)

## 本地开发

```bash
cd web
npm ci
npm run dev
```

构建、检查和部署边界见[网站说明](web/README.md)。网站提供中英双语资产浏览、模型详情，以及 10 个帮助主题的中英版本。

网站已部署到 HF Static Space。已发布模型数量以[公开 Dataset](https://huggingface.co/datasets/daftAI2026/3d-assets) 的当前目录为准，不按源文件数量或最大编号推算。

模型库支持搜索、分类筛选、网格与列表、3D 预览和多选下载。下载前可审阅选择，保存到文件夹或复制固定版本命令。

合格新增或修订模型由独立的 Colab 流水线发布，展厅自动读取新目录，无需重新部署网站。同一资产保留编号，修订版按源文件摘要分版。源码更新与模型发布彼此独立。

## 公开范围

- 网站源码、依赖锁文件与构建配置。
- 网站需要的测试、部署配置与公开说明。
- 不包含 Colab、模型生产工具、私人审核记录或模型文件。

模型与网站分离。只有经过质量和权利审核的资产才进入公开 Dataset。网站代码公开不代表资产获准再分发。

网站源码采用 [MIT](LICENSE)。自有模型逐件审核后按 CC BY 4.0 发布，以资产记录为准。
10,000 是规划目标，不是已发布数量。
