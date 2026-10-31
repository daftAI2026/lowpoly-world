<!--
[INPUT]: 依赖 web/ 的网站源码、构建配置与公开使用说明。
[OUTPUT]: 提供网站运行入口与代码、资产边界。
[POS]: 网站源码仓入口；不承载模型生产或内部工程知识。
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->
# Lowpoly World

低多边形资产的静态展厅。网站只读取公开 Hugging Face Dataset，不接触私人 Drive 或审核目录。

[中文页面](https://daftai2026-gallery.static.hf.space/zh/index.html) · [English](https://daftai2026-gallery.static.hf.space/en/index.html) · [Hugging Face Space](https://huggingface.co/spaces/daftAI2026/gallery)

## 本地开发

```bash
cd web
npm ci
npm run dev
```

构建、检查和部署边界见[网站说明](web/README.md)。网站提供中英双语资产浏览、模型详情和 10 篇双语文档。
51 项离线测试、类型检查、静态构建和本地浏览器验收通过。
HF 线上部署与真实模型发布仍单独验收。

## 公开范围

- 网站源码、依赖锁文件与构建配置。
- 网站需要的测试、部署配置与公开说明。
- 不包含 Colab、模型生产工具、私人审核记录或模型文件。

模型与网站分离。只有经过质量和权利审核的资产才进入公开 Dataset。网站代码公开不代表资产获准再分发。

代码许可证尚待所有者确定。10,000 是规划目标，不是已发布数量。
