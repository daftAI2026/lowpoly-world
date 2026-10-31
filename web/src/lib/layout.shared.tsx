/**
 * [INPUT]: 依赖 URL locale 路径 helper、站点身份常量与 Fumadocs 布局类型。
 * [OUTPUT]: 导出保留语言前缀的导航配置并关闭未设计的主题切换。
 * [POS]: Fumadocs 展示层配置；提供品牌、公开源码和单一浅色主题。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { localizedHomePath, type Locale } from './locale';
import { appName, gitConfig } from './shared';

export function baseOptions(locale: Locale): BaseLayoutProps {
  return {
    themeSwitch: { enabled: false },
    nav: {
      title: appName,
      url: localizedHomePath(locale),
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
