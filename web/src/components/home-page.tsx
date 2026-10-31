/**
 * [INPUT]: 依赖 i18next 业务资源、公开目录状态与 URL locale。
 * [OUTPUT]: 导出紧凑资产库首页，提供目录状态、筛选工作台和公开入口。
 * [POS]: 首页唯一业务入口；已发布记录由 CatalogBrowser 本地浏览。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CatalogBrowser } from '@/components/catalog-browser';
import { CatalogStateView } from '@/components/catalog-state';
import { baseOptions } from '@/lib/layout.shared';
import { localizedPath, type Locale } from '@/lib/locale';
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
          <div className="gallery-heading-copy">
            <span className="section-kicker">{t('home.datasetLabel')}</span>
            <h1>{t('home.collectionTitle')}</h1>
            <p>{t('home.catalogDescription')}</p>
          </div>
          <nav className="gallery-links" aria-label={t('home.publicLinks')}>
            <a href={`https://huggingface.co/datasets/${DATASET_REPO_ID}`} target="_blank" rel="noreferrer">
              {t('home.datasetSource')} <ExternalLink aria-hidden="true" />
            </a>
            <a href={localizedPath('/docs', locale)}>{t('home.readDocs')}</a>
            <a href="https://github.com/daftAI2026/lowpoly-world" target="_blank" rel="noreferrer">
              GitHub <ExternalLink aria-hidden="true" />
            </a>
          </nav>
        </header>

        <section className="catalog-section" aria-labelledby="catalog-heading">
          <header className="catalog-section-heading">
            <div>
              <span className="section-kicker">{t('home.collectionEyebrow')}</span>
              <h2 id="catalog-heading">{t('home.assetLibrary')}</h2>
            </div>
            {state.status === 'ready' && (
              <span className="catalog-total">
                {t('home.assetCount', { count: state.catalog.count })}
              </span>
            )}
          </header>

          {state.status === 'ready' && state.catalog.count > 0 ? (
            <CatalogBrowser catalog={state.catalog} locale={locale} />
          ) : (
            <CatalogStateView state={state} onRetry={retry} />
          )}
        </section>

        <footer className="site-footer">
          <span>{t('home.footer')}</span>
          <span>{DATASET_REPO_ID}</span>
        </footer>
      </main>
    </HomeLayout>
  );
}
