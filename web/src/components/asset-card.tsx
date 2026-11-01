/**
 * [INPUT]: 依赖 Fumadocs Card、已验证目录与 URL locale。
 * [OUTPUT]: 导出原生卡片扩展，展示完整预览、名称、编号和格式。
 * [POS]: 虚拟网格的图片卡片；不自建卡片壳，不加载 GLB。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { Card } from 'fumadocs-ui/components/card';
import type { CatalogAsset } from '@/lib/catalog';
import { getAssetDisplayName, localizedPath, type Locale } from '@/lib/locale';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

export function AssetCard({ asset, locale }: { asset: CatalogAsset; locale: Locale }) {
  const { t } = useTranslation();
  const [previewFailed, setPreviewFailed] = useState(false);
  const assetName = getAssetDisplayName(asset, locale);
  const formats = [asset.glb_url ? 'GLB' : null, asset.blend_url ? 'BLEND' : null].filter(Boolean);
  const href = `${localizedPath('/asset/', locale)}?id=${encodeURIComponent(asset.id)}`;

  return (
    <article className="asset-tile" role="listitem">
      <Card href={href} title={assetName} description={asset.id} className="asset-card">
        <span className="asset-preview">
          {asset.preview_url && !previewFailed ? (
            <img src={asset.preview_url} alt="" loading="lazy" decoding="async" onError={() => setPreviewFailed(true)} />
          ) : (
            <span className="asset-preview-empty">{t('asset.noPreview')}</span>
          )}
          {formats.length > 0 && <span className="asset-format">{formats.join(' + ')}</span>}
        </span>
      </Card>
    </article>
  );
}
