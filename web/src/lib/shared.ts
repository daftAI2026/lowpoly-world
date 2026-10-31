/**
 * [INPUT]: 无运行期依赖；保存稳定的公开站点身份与文档路径。
 * [OUTPUT]: 导出 Fumadocs 导航使用的品牌、GitHub 与路径常量。
 * [POS]: 网站元数据单一来源；不包含私人部署凭据或 Dataset 写权限。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
export const appName = 'Lowpoly World';
export const docsRoute = '/docs';

export const gitConfig = {
  user: 'daftAI2026',
  repo: 'lowpoly-world',
  branch: 'main',
};
