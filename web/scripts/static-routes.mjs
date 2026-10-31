/**
 * [INPUT]: 依赖本地化路由、MDX 文档 slug 与静态搜索端点。
 * [OUTPUT]: 导出预渲染路径和 smoke 检查使用的文档清单。
 * [POS]: Vite 配置与构建断言共用的静态路由单一来源。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
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

const documentationRoutes = ['en', 'zh'].flatMap((locale) =>
  documentationPages.map(({ slug }) => ({
    path: `/${locale}/docs${slug ? `/${slug}` : ''}`,
  })),
);

export const staticPrerenderPages = [
  { path: '/en/' },
  { path: '/zh/' },
  { path: '/en/asset/' },
  { path: '/zh/asset/' },
  ...documentationRoutes,
  { path: '/api/search' },
];
