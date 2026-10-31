/**
 * [INPUT]: 依赖 locale.ts 的 URL 语言契约、messages.ts 资源和 Fumadocs UI 标签。
 * [OUTPUT]: 导出 Fumadocs 路由配置、双语 UI 标签和隔离的 i18next 实例工厂。
 * [POS]: 将同一 URL 语言交给文案系统与文档框架；显式 `.ts` 导入兼容 Node 离线测试。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { createInstance } from 'i18next';
import { defineI18n } from 'fumadocs-core/i18n';
import { uiTranslations } from 'fumadocs-ui/i18n';
import { defaultLocale, supportedLocales, type Locale } from './locale.ts';
import { messages } from './messages.ts';

export const fumadocsI18n = defineI18n({
  defaultLanguage: defaultLocale,
  languages: [...supportedLocales],
  hideLocale: 'never',
  fallbackLanguage: defaultLocale,
});

export const fumadocsTranslations = fumadocsI18n
  .translations()
  .extend(uiTranslations())
  .add({
    en: { displayName: 'English' },
    zh: {
      displayName: '简体中文',
      'Ask AI(AI chat button)': '询问 AI',
      'Back to Home(404 not found page)': '返回首页',
      'Choose a language(language switcher)': '选择语言',
      'Choose a language(language switcher)(aria-label)': '选择语言',
      'Close Banner(banner)(aria-label)': '关闭通知',
      'Close Search(search dialog)(aria-label)': '关闭搜索',
      'Close Sidebar(aria-label)': '关闭侧边栏',
      'Close Sidebar(sidebar)(aria-label)': '关闭侧边栏',
      'Close(image zoom)(aria-label)': '关闭图片',
      'Collapse Sidebar(sidebar)(aria-label)': '收起侧边栏',
      'Copied Anchor Link(heading anchor)(aria-label)': '已复制标题链接',
      'Copied Link(accordion)(aria-label)': '已复制链接',
      'Copied Markdown(page actions)': '已复制 Markdown',
      'Copied Text(code block)(aria-label)': '已复制代码',
      'Copy Anchor Link(heading anchor)(aria-label)': '复制标题链接',
      'Copy Link(accordion)(aria-label)': '复制链接',
      'Copy Markdown(page actions)': '复制 Markdown',
      'Copy Text(code block)(aria-label)': '复制代码',
      'Default(type table)': '默认',
      'Dark(theme switcher)(aria-label)': '深色',
      'Edit on GitHub(edit page)': '在 GitHub 上编辑',
      'Hide Sidebar(sidebar)': '隐藏侧边栏',
      'Image Viewer(image zoom)(aria-label)': '图片查看器',
      'Last updated on(page footer)': '最后更新于',
      'Layout Tab(layout tab trigger)': '布局标签',
      'Language(language switcher)': '语言',
      'Light(theme switcher)(aria-label)': '浅色',
      'Next Image(image zoom)(aria-label)': '下一张图片',
      'No Headings(table of contents)': '没有标题',
      'No results found(search dialog)': '没有找到结果',
      'On this page(table of contents)': '本页内容',
      'Open Search(search trigger)(aria-label)': '打开搜索',
      'Open Sidebar(aria-label)': '打开侧边栏',
      'Open Sidebar(sidebar)(aria-label)': '打开侧边栏',
      'Open in ChatGPT(page actions)': '在 ChatGPT 中打开',
      'Open in Claude(page actions)': '在 Claude 中打开',
      'Open in Cursor(page actions)': '在 Cursor 中打开',
      'Open in GitHub(page actions)': '在 GitHub 中打开',
      'Open in Scira AI(page actions)': '在 Scira AI 中打开',
      'Open(page actions)': '打开',
      'Options(aria-label)': '选项',
      'Page Not Found(404 not found page)': '页面未找到',
      'Parameters(type table)': '参数',
      'Previous Image(image zoom)(aria-label)': '上一张图片',
      'Next Page(pagination)': '下一页',
      'Previous Page(pagination)': '上一页',
      'Prop(type table)': '属性',
      'Read {url}, I want to ask questions about it.(page actions)': '阅读 {url}，我想询问相关问题',
      'Returns(type table)': '返回值',
      'Search(search dialog)': '搜索',
      'Search(search trigger)': '搜索文档',
      'Search failed(search dialog)': '搜索失败',
      'Search failed, showing results for {query}(search dialog)': '搜索失败，显示“{query}”的结果',
      'Show Sidebar(sidebar)': '显示侧边栏',
      'System(theme switcher)(aria-label)': '跟随系统',
      'Table of Contents(inline table of contents)': '目录',
      'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.(404 not found page)': '页面可能已删除、已更名，或暂时无法访问。',
      'Theme(site menu)': '主题',
      'Toggle Menu(home layout header)(aria-label)': '切换菜单',
      'Toggle Theme(theme switcher)(aria-label)': '切换主题',
      'Type(type table)': '类型',
      'View as Markdown(page actions)': '以 Markdown 查看',
    },
  });

const businessResources = {
  en: { translation: messages.en },
  zh: { translation: messages.zh },
} as const;

/** Each SSR tree gets its own instance. Inline resources initialize synchronously. */
export function createBusinessI18n(locale: Locale) {
  const instance = createInstance();
  void instance.init({
    lng: locale,
    fallbackLng: defaultLocale,
    supportedLngs: [...supportedLocales],
    resources: structuredClone(businessResources),
    defaultNS: 'translation',
    ns: ['translation'],
    initAsync: false,
    interpolation: { escapeValue: false },
  });
  return instance;
}
