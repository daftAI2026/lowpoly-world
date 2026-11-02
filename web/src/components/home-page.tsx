/**
 * [INPUT]: 依赖 Fumadocs HomeLayout、公开目录和双语资源。
 * [OUTPUT]: 导出模型库页面；不携带文档侧栏或阅读面板。
 * [POS]: 首页内容区；导航归共享配置，资产浏览由 CatalogBrowser 补充。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useTranslation } from 'react-i18next';
import { CatalogBrowser } from '@/components/catalog-browser';
import { CatalogStateView } from '@/components/catalog-state';
import type { Locale } from '@/lib/locale';
import { useCatalog } from '@/lib/use-catalog';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';

export function HomePage({ locale }: { locale: Locale }) {
  const { t } = useTranslation();
  const { state, retry } = useCatalog();

  return (
    <HomeLayout {...baseOptions(locale)}>
      <main id="main-content" className="site-main gallery-main">
        <h1 className="gallery-title">{t('home.collectionTitle')}</h1>

        <section className="catalog-section" aria-label={t('home.assetResults')}>
          {state.status === 'ready' && state.catalog.count > 0 ? (
            <CatalogBrowser catalog={state.catalog} locale={locale} />
          ) : (
            <CatalogStateView state={state} onRetry={retry} />
          )}
        </section>
      </main>
    </HomeLayout>
  );
}
