/**
 * [INPUT]: 依赖 i18next 资源、公开目录状态、URL locale 与静态 href helper。
 * [OUTPUT]: 导出紧凑资产库首页，由原生壳承载目录状态与资产浏览。
 * [POS]: 首页内容区；导航归共享配置，资产浏览由 CatalogBrowser 补充。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useTranslation } from 'react-i18next';
import { CatalogBrowser } from '@/components/catalog-browser';
import { CatalogStateView } from '@/components/catalog-state';
import { baseOptions } from '@/lib/layout.shared';
import type { Locale } from '@/lib/locale';
import { useCatalog } from '@/lib/use-catalog';
import { HomeLayout } from 'fumadocs-ui/layouts/home';

export function HomePage({ locale }: { locale: Locale }) {
  const { t } = useTranslation();
  const { state, retry } = useCatalog();

  return (
    <HomeLayout {...baseOptions(locale)}>
      <main id="main-content" className="site-main">
        <header className="gallery-heading">
          <h1>{t('home.collectionTitle')}</h1>

        </header>

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
