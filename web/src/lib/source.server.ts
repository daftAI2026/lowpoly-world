/**
 * [INPUT]: 依赖 `.source/server` 编译集合、Fumadocs locale 与 docs URL。
 * [OUTPUT]: 导出独立 en/zh 页面树；缺译时保留英文源文。
 * [POS]: SSR 搜索与静态函数唯一的数据源；不进入浏览器 bundle。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import { docs } from '../../.source/server';
import { fumadocsI18n } from './i18n.ts';
import { docsRoute } from './shared.ts';

export const source = loader({
  source: docs.toFumadocsSource(),
  baseUrl: docsRoute,
  i18n: fumadocsI18n,
  plugins: [lucideIconsPlugin()],
});
