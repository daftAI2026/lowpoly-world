/**
 * [INPUT]: 依赖官网 Spacious Page、公开目录和双语资源。
 * [OUTPUT]: 导出模型库页面；父路由提供唯一原生壳。
 * [POS]: 首页内容区；导航归共享配置，资产浏览由 CatalogBrowser 补充。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useTranslation } from 'react-i18next';
import { CatalogBrowser } from '@/components/catalog-browser';
import { CatalogStateView } from '@/components/catalog-state';
import type { Locale } from '@/lib/locale';
import { useCatalog } from '@/lib/use-catalog';
import { DocsPage, DocsTitle } from 'fumadocs-ui/layouts/spacious/page';

export function HomePage({ locale }: { locale: Locale }) {
  const { t } = useTranslation();
  const { state, retry } = useCatalog();

  return (
    <DocsPage full breadcrumb={{ enabled: false }} footer={{ enabled: false }}>
      <div id="main-content" className="site-main">
        <DocsTitle>{t('home.collectionTitle')}</DocsTitle>

        <section className="catalog-section" aria-label={t('home.assetResults')}>
          {state.status === 'ready' && state.catalog.count > 0 ? (
            <CatalogBrowser catalog={state.catalog} locale={locale} />
          ) : (
            <CatalogStateView state={state} onRetry={retry} />
          )}
        </section>
      </div>
    </DocsPage>
  );
}
