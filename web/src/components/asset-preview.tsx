/**
 * [INPUT]: 依赖公开资产、分组导航与官方 shadcn 动作、下拉和折叠。
 * [OUTPUT]: 导出左右下停靠、应用内展开与返回的单实例预览。
 * [POS]: 只以 CSS 重排同一 viewer；不把检查行为混成下载选择。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { ArrowLeft, ArrowRight, ExternalLink, Maximize2, MapPin, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { CatalogAsset } from '@/lib/catalog';
import { parseWorkspace, serializeWorkspace } from '@/lib/workspace-state';
import { useRouterState } from '@tanstack/react-router';
import type { PreviewDock } from '@/lib/workspace-state';
import { getAssetDisplayName, localizedPath, type Locale } from '@/lib/locale';
import { toStaticHref } from '@/lib/static-href';
import { AssetDetails } from './asset-details';
import { CopyButton } from './copy-button';
import { Button } from './ui/button';
type Navigation = {
  previous: string | null;
  next: string | null;
  onSelect: (id: string) => void;
  onFind: () => void;
  inResults: boolean;
};
type Pane = {
  dock: PreviewDock;
  expanded: boolean;
  onDock: (dock: PreviewDock) => void;
  onExpand: (expanded: boolean) => void;
  onClose: () => void;
};
export function AssetPreview({
  asset,
  locale,
  navigation: n,
  pane: p,
}: {
  asset: CatalogAsset;
  locale: Locale;
  navigation: Navigation;
  pane: Pane;
}) {
  const { t } = useTranslation();
  const search = useRouterState({ select: (s) => s.location.searchStr });
  const back = serializeWorkspace(parseWorkspace(search));
  const name = getAssetDisplayName(asset, locale);
  const href = toStaticHref(
    `${localizedPath('/asset/', locale)}?id=${encodeURIComponent(asset.id)}&catalog=${encodeURIComponent(back)}`,
    import.meta.env.PROD,
  );
  return (
    <aside
      className="asset-preview-panel"
      aria-label={t('asset.detailTitle')}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && !document.fullscreenElement && !e.defaultPrevented) {
          e.stopPropagation();
          if (p.expanded) p.onExpand(false);
          else p.onClose();
        }
      }}
    >
      <header className="preview-panel-header">
        <h2>{name}</h2>
        <div className="preview-panel-actions">
          <Button
            size="icon"
            variant="ghost"
            aria-label={t('asset.previousAsset')}
            disabled={!n.previous}
            onClick={() => n.previous && n.onSelect(n.previous)}
          >
            <ArrowLeft aria-hidden="true" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            aria-label={t('asset.nextAsset')}
            disabled={!n.next}
            onClick={() => n.next && n.onSelect(n.next)}
          >
            <ArrowRight aria-hidden="true" />
          </Button>
          {p.expanded ? (
            <Button type="button" variant="link" onClick={() => p.onExpand(false)}>
              {t('workspace.backResults')}
            </Button>
          ) : (
            <>
              <NativeSelect
                aria-label={t('asset.previewPlacement')}
                value={p.dock}
                onChange={(e) => p.onDock(e.currentTarget.value as PreviewDock)}
              >
                <NativeSelectOption value="right">{t('asset.pinRight')}</NativeSelectOption>
                <NativeSelectOption value="left">{t('workspace.pinLeft')}</NativeSelectOption>
                <NativeSelectOption value="bottom">{t('asset.pinBottom')}</NativeSelectOption>
              </NativeSelect>
              <Button
                size="icon"
                variant="ghost"
                aria-label={t('workspace.expandPreview')}
                onClick={() => p.onExpand(true)}
              >
                <Maximize2 aria-hidden="true" />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            nativeButton={false}
            render={
              <a href={href} aria-label={t('asset.openDetails')} title={t('asset.openDetails')} />
            }
          >
            <ExternalLink aria-hidden="true" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            aria-label={t('asset.closePreview')}
            onClick={p.onClose}
          >
            <X aria-hidden="true" />
          </Button>
        </div>
        <Collapsible className="preview-more">
          <CollapsibleTrigger render={<Button variant="ghost" className="justify-start" />}>
            {asset.id}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div>
              <CopyButton value={name} label={t('workspace.copyName')} />
              <CopyButton value={asset.id} label={t('workspace.copyID')} />
              <CopyButton
                value={
                  typeof window === 'undefined' ? href : new URL(href, window.location.href).href
                }
                label={t('workspace.copyLink')}
              />
              <Button type="button" variant="link" onClick={n.onFind}>
                <MapPin aria-hidden="true" />
                {t(n.inResults ? 'workspace.findResults' : 'workspace.allAssets')}
              </Button>
              {!n.inResults && <p>{t('workspace.selectedOutside')}</p>}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </header>
      <div className="preview-panel-body">
        <AssetDetails key={asset.id} asset={asset} locale={locale} compact />
      </div>
    </aside>
  );
}
