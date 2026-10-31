/**
 * [INPUT]: 依赖 URL locale、validated search ID 与共享资产详情视图。
 * [OUTPUT]: 导出 `/en/asset/`、`/zh/asset/` 查询详情路由。
 * [POS]: URL 参数适配层；查询 ID 不生成额外静态 HTML 路径。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { createFileRoute } from '@tanstack/react-router';
import { AssetPage as AssetPageView } from '@/components/asset-page';
import { resolveLocale } from '@/lib/locale';

export const Route = createFileRoute('/$lang/asset/')({
  validateSearch: (search: Record<string, unknown>) => ({
    id: typeof search.id === 'string' && search.id.trim() ? search.id.trim() : undefined,
  }),
  component: AssetPageRoute,
});

function AssetPageRoute() {
  const { id } = Route.useSearch();
  const { lang } = Route.useParams();
  return <AssetPageView id={id} locale={resolveLocale(lang)} />;
}
