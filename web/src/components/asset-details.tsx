/**
 * [INPUT]: 依赖已验证资产、唯一查看器、元数据与官方文件动作按钮。
 * [OUTPUT]: 导出面板和独立页面共享的资产内容、下载与事实。
 * [POS]: 资产展示的唯一组合器；不创建导航、筛选或第三方仿真能力。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import type { CatalogAsset } from '@/lib/catalog';
import { getAssetDisplayName, type Locale } from '@/lib/locale';
import { ModelViewerPanel } from './model-viewer-panel';
import { AssetMetadataPanel } from './asset-metadata-panel';

export function AssetDetails({
  asset,
  locale,
  compact = false,
}: {
  asset: CatalogAsset;
  locale: Locale;
  compact?: boolean;
}) {
  const { t } = useTranslation();
  const assetName = getAssetDisplayName(asset, locale);
  return (
    <>
      {!compact && (
        <header className="asset-detail-heading">
          <span className="asset-id">{asset.id}</span>
          <h1>{assetName}</h1>
          {locale === 'zh' && asset.name_zh.trim() && (
            <p className="detail-local-name">{asset.name_en}</p>
          )}
        </header>
      )}

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
              <Button
                variant="default"
                nativeButton={false}
                render={<a href={asset.glb_url} download />}
              >
                {t('asset.downloadGlb')}
              </Button>
            )}
            {asset.blend_url && (
              <Button
                variant="outline"
                nativeButton={false}
                render={<a href={asset.blend_url} download />}
              >
                {t('asset.downloadBlend')}
              </Button>
            )}
            {!asset.glb_url && !asset.blend_url && (
              <span className="detail-note">{t('asset.filesNotSupplied')}</span>
            )}
          </div>
        </aside>
      </div>

      <AssetMetadataPanel asset={asset} />
    </>
  );
}
