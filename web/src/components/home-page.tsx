/**
 * [INPUT]: 依赖 i18next 资源、公开目录状态、URL locale 与静态 href helper。
 * [OUTPUT]: 导出紧凑资产库首页，提供目录状态、筛选工作台和项目入口。
 * [POS]: 首页唯一业务入口；数据集与文档各有一个入口，目录由 CatalogBrowser 本地浏览。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useTranslation } from 'react-i18next';
import { CatalogBrowser } from '@/components/catalog-browser';
import { CatalogStateView } from '@/components/catalog-state';
import { baseOptions } from '@/lib/layout.shared';
import { localizedPath, type Locale } from '@/lib/locale';
import { toStaticHref } from '@/lib/static-href';
import { DATASET_REPO_ID } from '@/lib/catalog';
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
          <nav className="gallery-links" aria-label={t('home.publicLinks')}>
            <a href={`https://huggingface.co/datasets/${DATASET_REPO_ID}`} target="_blank" rel="noreferrer">
              {t('home.datasetSource')}
            </a>
            <a href={toStaticHref(localizedPath('/docs', locale), import.meta.env.PROD)}>{t('home.readDocs')}</a>
          </nav>
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
