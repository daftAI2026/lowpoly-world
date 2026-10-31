/**
 * [INPUT]: 依赖 i18next 业务资源、公开目录状态、真实资产卡片与 URL locale。
 * [OUTPUT]: 导出共享的英文根入口和 `/en/`、`/zh/` 画廊首页。
 * [POS]: 首页唯一业务视图；数据只来自已验证 Dataset 目录。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useTranslation } from 'react-i18next';
import { AssetCard } from '@/components/asset-card';
import { CatalogStateView } from '@/components/catalog-state';
import { baseOptions } from '@/lib/layout.shared';
import { localizedPath, type Locale } from '@/lib/locale';
import { useCatalog } from '@/lib/use-catalog';
import { HomeLayout } from 'fumadocs-ui/layouts/home';

export function HomePage({ locale }: { locale: Locale }) {
  const { t } = useTranslation();
  const { state, retry } = useCatalog();
  const publishedCount =
    state.status === 'ready' ? String(state.catalog.count).padStart(2, '0') : '—';

  return (
    <HomeLayout {...baseOptions(locale)}>
      <main className="site-main">
        <section className="home-hero">
          <div className="hero-copy">
            <span className="eyebrow">{t('home.eyebrow')}</span>
            <h1>
              {t('home.titleFirst')}
              <br />
              <em>{t('home.titleSecond')}</em>
            </h1>
            <p>{t('home.description')}</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#catalog">
                {t('home.browse')} <span aria-hidden="true">↗</span>
              </a>
              <a className="button button-secondary" href={localizedPath('/docs', locale)}>
                {t('home.readDocs')}
              </a>
            </div>
          </div>
          <aside className="hero-index" aria-label={t('home.datasetLabel')}>
            <span className="index-label">{t('home.datasetLabel')}</span>
            <strong>{t('home.datasetName')}</strong>
            <span className="index-divider" />
            <span className="index-label">{t('home.verifiedIds')}</span>
            <strong className="index-count">{publishedCount}</strong>
            <span className="index-note">{t('home.noBundledModels')}</span>
          </aside>
        </section>

        <section id="catalog" className="catalog-section" aria-labelledby="catalog-heading">
          <header className="section-heading">
            <div>
              <span className="eyebrow">{t('home.collectionEyebrow')}</span>
              <h2 id="catalog-heading">{t('home.collectionTitle')}</h2>
            </div>
            {state.status === 'ready' && (
              <span className="result-count">
                {t('home.assetCount', { count: state.catalog.count })}
              </span>
            )}
          </header>

          {state.status !== 'ready' && (
            <CatalogStateView state={state} onRetry={retry} />
          )}
          {state.status === 'ready' && (
            <div className="asset-grid">
              {state.catalog.assets.map((asset) => (
                <AssetCard key={asset.id} asset={asset} locale={locale} />
              ))}
            </div>
          )}
        </section>

        <footer className="site-footer">
          <span>{t('home.footer')}</span>
          <a
            href="https://huggingface.co/datasets/daftAI2026/3d-assets"
            target="_blank"
            rel="noreferrer"
          >
            {t('home.datasetSource')} <span aria-hidden="true">↗</span>
          </a>
        </footer>
      </main>
    </HomeLayout>
  );
}
