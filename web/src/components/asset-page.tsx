/**
 * [INPUT]: 依赖已验证目录、查询资产编号、本地化路径和详情子组件。
 * [OUTPUT]: 导出资产查看器、下载入口、元数据和诚实缺失状态。
 * [POS]: 资产详情唯一组合视图；只挂载当前记录的一个模型查看器。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useTranslation } from 'react-i18next';
import { AssetMetadataPanel } from '@/components/asset-metadata-panel';
import { CatalogStateView } from '@/components/catalog-state';
import { ModelViewerPanel } from '@/components/model-viewer-panel';
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
        <main id="main-content" className="detail-main">
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
      <main id="main-content" className="detail-main">
        <a className="back-link" href={galleryUrl}>{t('asset.backGallery')}</a>
        {!id && (
          <section className="detail-empty" role="status">
            <span className="section-kicker">{t('asset.detailTitle')}</span>
            <h1>{t('asset.chooseTitle')}</h1>
            <p>{t('asset.chooseDescription')}</p>
            <a className="button-link" href={galleryUrl}>{t('asset.openGallery')}</a>
          </section>
        )}
        {id && !asset && (
          <section className="detail-empty" role="status">
            <span className="section-kicker">{t('asset.notFoundEyebrow')}</span>
            <h1>{t('asset.notFoundTitle')}</h1>
            <p>{t('asset.notFoundDescription', { id })}</p>
            <a className="button-link" href={galleryUrl}>{t('asset.returnGallery')}</a>
          </section>
        )}
        {asset && assetName && (
          <>
            <header className="asset-detail-heading">
              <span className="asset-id">{asset.id}</span>
              <h1>{assetName}</h1>
              {locale === 'zh' && asset.name_zh.trim() && (
                <p className="detail-local-name">{asset.name_en}</p>
              )}
            </header>

            <div className="asset-detail">
              <ModelViewerPanel
                modelUrl={asset.glb_url}
                previewUrl={asset.preview_url}
                assetName={assetName}
              />
              <aside className="asset-detail-copy" aria-label={t('asset.detailTitle')}>
                <span className="section-kicker">{t('asset.metadataKicker')}</span>
                <p className="detail-category">{asset.category || t('home.uncategorized')}</p>
                <div className="detail-actions">
                  {asset.glb_url && (
                    <a className="button-link button-link-primary" href={asset.glb_url} download>
                      {t('asset.downloadGlb')}
                    </a>
                  )}
                  {asset.blend_url && (
                    <a className="button-link" href={asset.blend_url} download>
                      {t('asset.downloadBlend')}
                    </a>
                  )}
                  {!asset.glb_url && !asset.blend_url && (
                    <span className="detail-note">{t('asset.filesNotSupplied')}</span>
                  )}
                </div>
                <p className="detail-note">{t('asset.fileNote')}</p>
              </aside>
            </div>

            <AssetMetadataPanel asset={asset} />
          </>
        )}
      </main>
    </HomeLayout>
  );
}
