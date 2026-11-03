/**
 * [INPUT]: 依赖公开资产、分组导航与官方 shadcn 动作与锚定菜单。
 * [OUTPUT]: 导出紧凑身份栏、同实例预览和固定文件下载底栏。
 * [POS]: 只以 CSS 重排同一 viewer；不把检查行为混成下载选择。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Maximize2,
  Minimize2,
  MapPin,
  X,
  PanelRight,
  PanelLeft,
  PanelBottom,
  ChevronDown,
  Check,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { CatalogAsset } from '@/lib/catalog';
import { parseWorkspace, serializeWorkspace } from '@/lib/workspace-state';
import { useRouterState } from '@tanstack/react-router';
import type { PreviewDock } from '@/lib/workspace-state';
import { getAssetDisplayName, localizedPath, type Locale } from '@/lib/locale';
import { toStaticHref } from '@/lib/static-href';
import { AssetDetails, AssetFileActions } from './asset-details';
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
  const [dockOpen, setDockOpen] = useState(false);
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
        <Popover>
          <h2>
            <PopoverTrigger
              render={
                <Button
                  variant="ghost"
                  className="preview-identity"
                  title={`${name} (${asset.id})`}
                />
              }
            >
              <span>{name}</span>
              <ChevronDown aria-hidden="true" />
            </PopoverTrigger>
          </h2>
          <PopoverContent align="start" className="preview-identity-menu" aria-label={name}>
            <code>{asset.id}</code>
            <CopyButton value={name} label={t('workspace.copyName')} />
            <CopyButton value={asset.id} label={t('workspace.copyID')} />
            <CopyButton
              value={
                typeof window === 'undefined' ? href : new URL(href, window.location.href).href
              }
              label={t('workspace.copyLink')}
            />
            <Button variant="ghost" onClick={n.onFind}>
              <MapPin aria-hidden="true" />
              {t(n.inResults ? 'workspace.findResults' : 'workspace.allAssets')}
            </Button>
            <Button variant="ghost" nativeButton={false} render={<a href={href} />}>
              <ExternalLink aria-hidden="true" />
              {t('asset.openDetails')}
            </Button>
          </PopoverContent>
        </Popover>
        <div className="preview-panel-actions">
          <Button
            size="icon"
            variant="ghost"
            aria-label={t('asset.previousAsset')}
            title={t('asset.previousAsset')}
            disabled={!n.previous}
            onClick={() => n.previous && n.onSelect(n.previous)}
          >
            <ArrowLeft aria-hidden="true" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            aria-label={t('asset.nextAsset')}
            title={t('asset.nextAsset')}
            disabled={!n.next}
            onClick={() => n.next && n.onSelect(n.next)}
          >
            <ArrowRight aria-hidden="true" />
          </Button>
          {!p.expanded && (
            <Popover open={dockOpen} onOpenChange={setDockOpen}>
              <PopoverTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t('asset.previewPlacement')}
                    title={t('asset.previewPlacement')}
                  />
                }
              >
                {p.dock === 'left' ? (
                  <PanelLeft aria-hidden="true" />
                ) : p.dock === 'bottom' ? (
                  <PanelBottom aria-hidden="true" />
                ) : (
                  <PanelRight aria-hidden="true" />
                )}
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="preview-dock-menu"
                aria-label={t('asset.previewPlacement')}
              >
                {(['right', 'left', 'bottom'] as const).map((dock) => (
                  <Button
                    key={dock}
                    variant="ghost"
                    aria-pressed={p.dock === dock}
                    className="justify-between"
                    onClick={() => {
                      p.onDock(dock);
                      setDockOpen(false);
                    }}
                  >
                    <span>
                      {t(
                        dock === 'right'
                          ? 'asset.pinRight'
                          : dock === 'left'
                            ? 'workspace.pinLeft'
                            : 'asset.pinBottom',
                      )}
                    </span>
                    {p.dock === dock && <Check aria-hidden="true" />}
                  </Button>
                ))}
              </PopoverContent>
            </Popover>
          )}
          <Button
            variant="ghost"
            size="icon"
            aria-label={t(p.expanded ? 'workspace.backResults' : 'workspace.expandPreview')}
            title={t(p.expanded ? 'workspace.backResults' : 'workspace.expandPreview')}
            onClick={() => p.onExpand(!p.expanded)}
          >
            {p.expanded ? <Minimize2 aria-hidden="true" /> : <Maximize2 aria-hidden="true" />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            aria-label={t('asset.closePreview')}
            title={t('asset.closePreview')}
            onClick={p.onClose}
          >
            <X aria-hidden="true" />
          </Button>
        </div>
      </header>
      <div className="preview-panel-body">
        <AssetDetails key={asset.id} asset={asset} locale={locale} compact />
      </div>
      <footer className="preview-file-footer">
        <AssetFileActions asset={asset} />
      </footer>
    </aside>
  );
}
