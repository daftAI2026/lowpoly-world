/**
 * [INPUT]: 依赖已验证目录、查询资产编号、本地化首页路径与双语资源。
 * [OUTPUT]: 导出本地化资产详情、空选择态和未找到状态。
 * [POS]: 资产详情唯一视图；所有退出入口回到当前语言的目录首页。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useTranslation } from 'react-i18next';
import { CatalogStateView } from '@/components/catalog-state';
import { useCatalog } from '@/lib/use-catalog';
import { baseOptions } from '@/lib/layout.shared';
import { getAssetDisplayName, localizedHomePath, type Locale } from '@/lib/locale';
import { HomeLayout } from 'fumadocs-ui/layouts/home';

export function AssetPage({ id, locale }: { id?: string; locale: Locale }) {
  const { t } = useTranslation();
  const { state, retry } = useCatalog();
  const galleryUrl = localizedHomePath(locale);

  if (state.status !== 'ready') {
    return (
      <HomeLayout {...baseOptions(locale)}>
        <main className="detail-main">
          <a className="back-link" href={galleryUrl}>{t('asset.backGallery')}</a>
          <h1 className="detail-heading">{t('asset.detailTitle')}</h1>
          <CatalogStateView state={state} onRetry={retry} />
        </main>
      </HomeLayout>
    );
  }

  const asset = id ? state.catalog.assets.find((item) => item.id === id) : undefined;
  const assetName = asset ? getAssetDisplayName(asset, locale) : undefined;

  return (
    <HomeLayout {...baseOptions(locale)}>
      <main className="detail-main">
        <a className="back-link" href={galleryUrl}>{t('asset.backGallery')}</a>
        {!id && (
          <section className="detail-empty">
            <span className="eyebrow">{t('asset.detailTitle')}</span>
            <h1>{t('asset.chooseTitle')}</h1>
            <p>{t('asset.chooseDescription')}</p>
            <a className="button button-primary" href={galleryUrl}>{t('asset.openGallery')}</a>
          </section>
        )}
        {id && !asset && (
          <section className="detail-empty" role="status">
            <span className="eyebrow">{t('asset.notFoundEyebrow')}</span>
            <h1>{t('asset.notFoundTitle')}</h1>
            <p>{t('asset.notFoundDescription', { id })}</p>
            <a className="button button-primary" href={galleryUrl}>{t('asset.returnGallery')}</a>
          </section>
        )}
        {asset && assetName && (
          <article className="asset-detail">
            <div className="detail-preview">
              <img src={asset.preview_url} alt={t('asset.previewAlt', { name: assetName })} />
            </div>
            <div className="detail-copy">
              <span className="asset-id">{asset.id}</span>
              <h1>{assetName}</h1>
              {locale === 'zh' && asset.name_zh.trim() && (
                <p className="detail-local-name">{asset.name_en}</p>
              )}
              <p className="detail-category">{asset.category}</p>
              <dl className="asset-facts">
                <div><dt>{t('asset.triangles')}</dt><dd>{asset.triangles ?? t('asset.notSupplied')}</dd></div>
                <div><dt>{t('asset.vertices')}</dt><dd>{asset.vertices ?? t('asset.notSupplied')}</dd></div>
                <div><dt>{t('asset.revision')}</dt><dd>{asset.revision || t('asset.notSupplied')}</dd></div>
                <div><dt>{t('asset.license')}</dt><dd>{asset.license}</dd></div>
                <div><dt>{t('asset.source')}</dt><dd>{asset.source}</dd></div>
                <div><dt>{t('asset.sourceHash')}</dt><dd className="hash-value">{asset.source_sha256}</dd></div>
              </dl>
              <div className="detail-actions">
                <a className="button button-primary" href={asset.glb_url}>{t('asset.openGlb')}</a>
                <a className="button button-secondary" href={asset.blend_url}>{t('asset.openBlend')}</a>
              </div>
              <p className="detail-note">{t('asset.fileNote')}</p>
            </div>
          </article>
        )}
      </main>
    </HomeLayout>
  );
}
