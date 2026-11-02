/**
 * [INPUT]: 依赖 shadcn Card、Checkbox/Badge、目录与普通链接规则。
 * [OUTPUT]: 导出资产卡；下载勾选与当前预览独立，修改键保留详情链接。
 * [POS]: 虚拟网格的图片卡片；只组合官方卡片与原生链接，不加载 GLB。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import type { CatalogAsset } from '@/lib/catalog';
import { getAssetDisplayName, localizedPath, type Locale } from '@/lib/locale';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { toStaticHref } from '@/lib/static-href';
import { parseWorkspace, serializeWorkspace } from '@/lib/workspace-state';
import { shouldOpenPreview } from '@/lib/catalog-selection';

export function AssetCard({
  asset,
  locale,
  selected = false,
  onSelect,
  checked = false,
  onCheck,
  view = 'grid',
  browsingSearch = '',
}: {
  asset: CatalogAsset;
  locale: Locale;
  selected?: boolean;
  onSelect?: (id: string) => void;
  checked?: boolean;
  onCheck?: (id: string, checked: boolean) => void;
  view?: 'grid' | 'list';
  browsingSearch?: string;
}) {
  const { t } = useTranslation();
  const [previewFailed, setPreviewFailed] = useState(false);
  const assetName = getAssetDisplayName(asset, locale);
  const formats = [asset.glb_url ? 'GLB' : null, asset.blend_url ? 'BLEND' : null].filter(Boolean);
  const back = serializeWorkspace(parseWorkspace(browsingSearch));
  const href = `${localizedPath('/asset/', locale)}?id=${encodeURIComponent(asset.id)}${back ? `&catalog=${encodeURIComponent(back)}` : ''}`;

  return (
    <article
      className="asset-tile"
      role="listitem"
      data-asset-id={asset.id}
      data-selected={selected}
      data-checked={checked}
    >
      {onCheck && (
        <Label className="asset-selection-toggle">
          <Checkbox
            className="asset-selection-checkbox size-5"
            checked={checked}
            onCheckedChange={(checked) => onCheck(asset.id, checked === true)}
            aria-label={t('workspace.selectAsset', { id: asset.id })}
          />
        </Label>
      )}
      <Card className="asset-card">
        <a
          href={toStaticHref(href, import.meta.env.PROD)}
          className="asset-card-link"
          aria-current={selected ? true : undefined}
          onClick={(event) => {
            if (
              onSelect &&
              shouldOpenPreview(event, window.matchMedia('(min-width: 900px)').matches)
            ) {
              event.preventDefault();
              onSelect(asset.id);
            }
          }}
        >
          <CardHeader className="asset-card-heading">
            <CardTitle>
              <h3>{assetName}</h3>
            </CardTitle>
            <CardDescription>{asset.id}</CardDescription>
          </CardHeader>
          <CardContent className="asset-card-media">
            <span className="asset-preview">
              {asset.preview_url && !previewFailed ? (
                <img
                  src={asset.preview_url}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  onError={() => setPreviewFailed(true)}
                />
              ) : (
                <span className="asset-preview-empty">{t('asset.noPreview')}</span>
              )}
              {formats.length > 0 && (
                <Badge variant="outline" className="asset-format">
                  {formats.join(' + ')}
                </Badge>
              )}
            </span>
            {view === 'list' && (
              <span className="index-facts">
                <span>
                  {asset.triangles?.toLocaleString(locale) ?? '—'} {t('asset.trianglesShort')}
                </span>
                <span>
                  {asset.file_size_bytes === null
                    ? '—'
                    : `${asset.file_size_bytes.toLocaleString(locale)} B`}
                </span>
                <span>{asset.license ?? '—'}</span>
              </span>
            )}
          </CardContent>
        </a>
      </Card>
    </article>
  );
}
