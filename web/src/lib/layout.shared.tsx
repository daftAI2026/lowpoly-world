/**
 * [INPUT]: 依赖 URL locale 路径 helper、站点身份常量与 Fumadocs 布局类型。
 * [OUTPUT]: 导出保留语言前缀的首页和文档导航配置。
 * [POS]: Fumadocs 展示层配置；仅提供品牌与公开源码入口。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { localizedHomePath, type Locale } from './locale';
import { appName, gitConfig } from './shared';

export function baseOptions(locale: Locale): BaseLayoutProps {
  return {
    nav: {
      title: appName,
      url: localizedHomePath(locale),
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
