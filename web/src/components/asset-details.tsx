/**
 * [INPUT]: 依赖已验证资产、唯一查看器、元数据与官方文件动作按钮。
 * [OUTPUT]: 导出 AssetDetails 与 AssetFileActions，分别组合事实和文件入口。
 * [POS]: 共享详情内容；预览把文件入口放在固定底部，独立页保留原位置。
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
  const metadata = <AssetMetadataPanel asset={asset} />;
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
          {!compact && (
            <>
              <h2 className="detail-actions-heading">{t('asset.filesTitle')}</h2>
              <AssetFileActions asset={asset} />
            </>
          )}
          {compact && metadata}
        </aside>
      </div>

      {!compact && metadata}
    </>
  );
}

export function AssetFileActions({ asset }: { asset: CatalogAsset }) {
  const { t } = useTranslation();
  return (
    <div className="detail-actions">
      {asset.glb_url && (
        <Button variant="default" nativeButton={false} render={<a href={asset.glb_url} download />}>
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
  );
}
