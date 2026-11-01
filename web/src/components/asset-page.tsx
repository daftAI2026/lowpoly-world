/**
 * [INPUT]: 依赖已验证目录、查询资产编号、本地化路径、静态 href helper 和详情子组件。
 * [OUTPUT]: 导出资产查看器、模型文件入口、发布元数据和缺失状态。
 * [POS]: 资产详情唯一组合视图；返回链接指向当前语言文件，且只挂载一个查看器。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useTranslation } from 'react-i18next';
import { AssetMetadataPanel } from '@/components/asset-metadata-panel';
import { CatalogStateView } from '@/components/catalog-state';
import { ModelViewerPanel } from '@/components/model-viewer-panel';
import { useCatalog } from '@/lib/use-catalog';
import { baseOptions } from '@/lib/layout.shared';
import { getAssetDisplayName, localizedHomePath, type Locale } from '@/lib/locale';
import { toStaticHref } from '@/lib/static-href';
import { HomeLayout } from 'fumadocs-ui/layouts/home';

export function AssetPage({ id, locale }: { id?: string; locale: Locale }) {
  const { t } = useTranslation();
  const { state, retry } = useCatalog();
  const galleryUrl = toStaticHref(localizedHomePath(locale), import.meta.env.PROD);

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
            <h1>{t('asset.chooseTitle')}</h1>
            <p>{t('asset.chooseDescription')}</p>
          </section>
        )}
        {id && !asset && (
          <section className="detail-empty" role="status">
            <h1>{t('asset.notFoundTitle')}</h1>
            <p>{t('asset.notFoundDescription', { id })}</p>
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
                <h2 className="detail-actions-heading">{t('asset.filesTitle')}</h2>
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
              </aside>
            </div>

            <AssetMetadataPanel asset={asset} />
          </>
        )}
      </main>
    </HomeLayout>
  );
}
