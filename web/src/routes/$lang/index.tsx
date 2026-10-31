/**
 * [INPUT]: 依赖已验证的 URL locale 与共享首页视图。
 * [OUTPUT]: 导出 `/en/`、`/zh/` 的静态本地化首页。
 * [POS]: 语言路由的首页入口；文案由根级 i18next Provider 提供。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { createFileRoute } from '@tanstack/react-router';
import { HomePage } from '@/components/home-page';
import { resolveLocale } from '@/lib/locale';

export const Route = createFileRoute('/$lang/')({
  component: LocalizedHome,
});

function LocalizedHome() {
  const { lang } = Route.useParams();
  return <HomePage locale={resolveLocale(lang)} />;
}
