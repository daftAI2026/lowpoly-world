<!--
[INPUT]: 依赖 HF 品牌页、Inter、Adobe 与 Fontsource 的 OFL 字体。
[OUTPUT]: 记录静态品牌与字体的来源、摘要和使用边界。
[POS]: 原生官网样式的素材来源，不将第三方商标纳入网站 MIT 许可。
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->
# 官方素材来源

HF 标识来自 https://huggingface.co/brand 。
原件为 https://huggingface.co/datasets/huggingface/brand-assets/resolve/main/hf-logo.svg 。
原件保留官方黄色、面部、手部和比例。
标识仅链接项目 Dataset，不表示 HF 背书。
Hugging Face 商标归其权利人所有，不纳入本项目 MIT 授权。

## 字体

英文采用 Inter 4.1，字体与许可取自官方 rsms.me/inter。
中文采用 Adobe 官方 Source Han Sans SC 2.005 的网页子集。
覆盖 GB2312 非拉丁字符和当前公开网站字符。
修改后的家族名为 LPW Han Sans SC，避免使用 OFL 保留名 Source。
罕见的未覆盖字符最后回退到系统字体，不宣称全 Unicode 覆盖。
子集约 3 MB，原始 SC VF 约 14 MB；保留 250 至 900 可变字重。
代码和编号使用 Geist Mono 5.3.0 的 Fontsource 可变拉丁文件。
所有字体本地托管，使用 font-display: swap。
字体采用各自 OFL，不纳入网站 MIT 再许可。
来源与 SHA256 见 fonts.sources.json 与 han-font-build.json。

## 子集复现

```bash
uv run --python 3.12 --with fonttools==4.60.1 --with brotli==1.2.0 python scripts/subset-han-font.py /path/to/official-sc-vf.woff2
```

参数使用 han-font-build.json 中 source_url 的原件。
常规 npm 构建不运行字体工具，不依赖私人文档。

## HF 标识 SHA256

hugging-face.svg: `942cad1ccda905ac5a659dfd2d78b344fccfb84a8a3ac3721e08f488205638a0`
