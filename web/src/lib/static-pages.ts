/**
 * [INPUT]: 依赖 locale.ts 的语言白名单和公开 MDX 文档约定。
 * [OUTPUT]: 导出双语文档元数据、显式预渲染路径和规范化页面白名单。
 * [POS]: 静态页面唯一注册表；URL 转换与构建从同一数据派生。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { supportedLocales } from './locale.ts';

export const documentationPages = [
  { slug: '', title: 'Getting Started', titleZh: '快速开始' },
  { slug: 'download', title: 'Download', titleZh: '下载' },
  { slug: 'license', title: 'License', titleZh: '许可协议' },
  { slug: 'formats', title: '3D Formats', titleZh: '3D 格式' },
  { slug: 'blender', title: 'Use in Blender', titleZh: '在 Blender 中使用' },
  { slug: 'threejs', title: 'Use in Three.js', titleZh: '在 Three.js 中使用' },
  { slug: 'dataset-schema', title: 'Dataset Schema', titleZh: '数据集结构' },
  { slug: 'contributing', title: 'Contributing', titleZh: '参与贡献' },
  { slug: 'release-notes', title: 'Release Notes', titleZh: '发布说明' },
  { slug: 'faq', title: 'FAQ', titleZh: '常见问题' },
];

export const staticDocumentRoutes = supportedLocales.flatMap((locale) => [
    `/${locale}/`,
    `/${locale}/asset/`,
    ...documentationPages.map(({ slug }) => `/${locale}/docs${slug ? `/${slug}` : ''}`),
  ]);

export const staticPagePaths = ['/', ...staticDocumentRoutes.map((path) => path.replace(/\/+$/, ''))];
