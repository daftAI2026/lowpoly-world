/**
 * [INPUT]: 依赖目录快照、URL locale、本地化资源与静态详情路径。
 * [OUTPUT]: 导出单张本地化资产卡片，显示真实元数据与预览图。
 * [POS]: 画廊列表的唯一卡片视图；不嵌入模型查看器或本地模型。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import type { CatalogAsset } from '@/lib/catalog';
import { getAssetDisplayName, localizedPath, type Locale } from '@/lib/locale';
import { useTranslation } from 'react-i18next';

export function AssetCard({ asset, locale }: { asset: CatalogAsset; locale: Locale }) {
  const { t } = useTranslation();
  const assetName = getAssetDisplayName(asset, locale);
  const detailUrl = `${localizedPath('/asset/', locale)}?id=${encodeURIComponent(asset.id)}`;

  return (
    <article className="asset-card">
      <a className="asset-card-link" href={detailUrl}>
        <div className="asset-preview">
          <img
            src={asset.preview_url}
            alt={t('asset.previewAlt', { name: assetName })}
            loading="lazy"
          />
          <span className="asset-format">GLB · BLEND</span>
        </div>
        <div className="asset-card-copy">
          <div>
            <span className="asset-id">{asset.id}</span>
            <h3>{assetName}</h3>
          </div>
          <span className="asset-category">{asset.category}</span>
        </div>
      </a>
    </article>
  );
}
