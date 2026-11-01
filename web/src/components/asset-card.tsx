/**
 * [INPUT]: 依赖目录快照、URL locale、本地化资源与静态 href helper。
 * [OUTPUT]: 导出单张本地化资产卡片，显示真实预览、编号、格式和面数。
 * [POS]: 画廊唯一卡片视图；详情链接保留查询参数并指向静态文件。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import type { CatalogAsset } from '@/lib/catalog';
import { getAssetDisplayName, localizedPath, type Locale } from '@/lib/locale';
import { toStaticHref } from '@/lib/static-href';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

export function AssetCard({ asset, locale }: { asset: CatalogAsset; locale: Locale }) {
  const { t } = useTranslation();
  const assetName = getAssetDisplayName(asset, locale);
  const [previewFailed, setPreviewFailed] = useState(false);
  const detailUrl = `${localizedPath('/asset/', locale)}?id=${encodeURIComponent(asset.id)}`;
  const formats = [asset.glb_url ? 'GLB' : null, asset.blend_url ? 'BLEND' : null]
    .filter((format): format is string => Boolean(format));

  return (
    <article className="asset-card" role="listitem">
      <a className="asset-card-link" href={toStaticHref(detailUrl, import.meta.env.PROD)}>
        <div className="asset-preview">
          {asset.preview_url && !previewFailed ? (
            <img
              src={asset.preview_url}
              alt={t('asset.previewAlt', { name: assetName })}
              loading="lazy"
              decoding="async"
              onError={() => setPreviewFailed(true)}
            />
          ) : (
            <span className="asset-preview-empty">{t('asset.noPreview')}</span>
          )}
          {formats.length > 0 && <span className="asset-format">{formats.join(' + ')}</span>}
        </div>
        <div className="asset-card-copy">
          <div>
            <span className="asset-id">{asset.id}</span>
            <h3>{assetName}</h3>
          </div>
          <span className="asset-category">{asset.category || t('home.uncategorized')}</span>
        </div>
        <div className="asset-card-foot">
          {asset.triangles === null ? (
            <span>{t('asset.triangles')}: {t('asset.notSupplied')}</span>
          ) : (
            <span>{asset.triangles.toLocaleString()} {t('asset.trianglesShort')}</span>
          )}
          <span className="asset-card-tags">
            {asset.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}
          </span>
        </div>
      </a>
    </article>
  );
}
