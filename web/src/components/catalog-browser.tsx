/**
 * [INPUT]: 依赖公开目录、URL 浏览状态与独立结果、预览、下载视图。
 * [OUTPUT]: 导出完整只读资产工作区；一个 viewer 随停靠与展开保留。
 * [POS]: 首页交互组合边界；预览选择与下载选择互不隐式修改。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CatalogFilters as CatalogFiltersPanel } from './catalog-filters';
import { CatalogGrid } from './catalog-grid';
import { AssetPreview } from './asset-preview';
import { WorkspaceToolbar } from './workspace-toolbar';
import { DownloadSelection } from './download-selection';
import { previewNeighbors, clampPreviewWidth } from '@/lib/catalog-selection';
import {
  buildCatalogFacets,
  filterAndSortAssets,
  hasCatalogFilters,
  type CatalogFilters,
} from '@/lib/catalog-view';
import { serializeWorkspace, emptyFilters } from '@/lib/workspace-state';
import { useWorkspace } from '@/lib/use-workspace';
import type { Catalog } from '@/lib/catalog';
import type { Locale } from '@/lib/locale';
const toggle = <T,>(values: readonly T[], value: T, enabled: boolean) =>
  enabled ? [...new Set([...values, value])] : values.filter((v) => v !== value);
export function CatalogBrowser({ catalog, locale }: { catalog: Catalog; locale: Locale }) {
  const { t } = useTranslation();
  const { state: s, update } = useWorkspace();
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [previewWidth, setPreviewWidth] = useState(400);
  const [previewHeight, setPreviewHeight] = useState(360);
  const [hiddenGroups, setHiddenGroups] = useState<string[]>([]);
  const [review, setReview] = useState(false);
  const [lastPreview, setLastPreview] = useState<string | null>(null);
  const [find, setFind] = useState<{ id: string; request: number } | null>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const facets = useMemo(() => buildCatalogFacets(catalog.assets), [catalog.assets]);
  const visibleAssets = useMemo(
    () => filterAndSortAssets(catalog.assets, s.filters, s.sort, locale),
    [catalog.assets, s.filters, s.sort, locale],
  );
  const selected = catalog.assets.find((a) => a.id === s.asset);
  const checked = catalog.assets.filter((a) => s.selected.includes(a.id));
  const neighbors = previewNeighbors(visibleAssets, s.asset);
  const compact = size.width < 1000;
  const bottom = s.dock === 'bottom' || compact;
  const maximum = Math.max(320, Math.min(600, size.width - (s.dock === 'left' ? 280 : 512)));
  const width = clampPreviewWidth(previewWidth, maximum);
  const maxHeight = Math.max(240, size.height - 180);
  const height = Math.max(240, Math.min(maxHeight, previewHeight));
  const expanded = Boolean(selected && s.expanded);
  const filter = (next: Partial<CatalogFilters>) => update({ filters: { ...s.filters, ...next } });
  const clear = () => update({ filters: { ...emptyFilters } });
  const inspect = (id: string) => {
    setLastPreview(id);
    update({ asset: id });
  };
  const findAsset = (id: string) => {
    setFind({ id, request: Date.now() });
  };
  const close = () => {
    if (s.asset) {
      setLastPreview(s.asset);
      findAsset(s.asset);
    }
    update({ asset: null, expanded: false });
  };
  useEffect(() => {
    const host = workspaceRef.current;
    const toolbar = toolbarRef.current;
    if (!host || !toolbar) return;
    const measure = () => {
      setSize({ width: host.clientWidth, height: host.clientHeight });
      host.style.setProperty(
        '--workspace-height',
        `${Math.max(420, window.innerHeight - host.getBoundingClientRect().top - 16)}px`,
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    observer.observe(toolbar);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);
  useEffect(() => {
    if (!expanded) return;
    const timer = requestAnimationFrame(() =>
      workspaceRef.current
        ?.querySelector<HTMLButtonElement>('.preview-panel-actions button')
        ?.focus(),
    );
    return () => cancelAnimationFrame(timer);
  }, [expanded]);
  return (
    <section className="catalog-browser" aria-label={t('home.collectionTitle')}>
      <div ref={toolbarRef} hidden={expanded}>
        <WorkspaceToolbar
          state={s}
          update={update}
          visible={visibleAssets.length}
          total={catalog.count}
          selectedCount={checked.length}
          onSelectResults={() =>
            update({ selected: [...new Set([...s.selected, ...visibleAssets.map((a) => a.id)])] })
          }
          onReview={() => setReview((v) => !v)}
          hiddenGroups={hiddenGroups}
          onHiddenGroups={setHiddenGroups}
          onReopen={!selected && lastPreview ? () => inspect(lastPreview) : null}
        />
      </div>
      {review && !expanded && (
        <DownloadSelection
          assets={checked}
          locale={locale}
          onRemove={(id) => update({ selected: s.selected.filter((v) => v !== id) })}
          onClear={() => update({ selected: [] })}
          onInspect={(id) => {
            setReview(false);
            inspect(id);
          }}
          onClose={() => setReview(false)}
        />
      )}
      <div
        ref={workspaceRef}
        className="catalog-workspace"
        data-preview={Boolean(selected)}
        data-dock={s.dock}
        data-bottom={bottom}
        data-expanded={expanded}
        style={
          {
            '--preview-width': `${width}px`,
            '--preview-height': `${height}px`,
          } as React.CSSProperties
        }
      >
        <div className="workspace-filter-rail">
          <CatalogFiltersPanel
            facets={facets}
            assets={catalog.assets}
            filters={s.filters}
            onExtraChange={filter}
            hiddenGroups={hiddenGroups}
            onCategoryChange={(categoryPath) => filter({ categoryPath })}
            onFormatChange={(format, enabled) =>
              filter({ formats: toggle(s.filters.formats, format, enabled) })
            }
            onTagChange={(tag, enabled) => filter({ tags: toggle(s.filters.tags, tag, enabled) })}
            onTriangleBandChange={(band, enabled) =>
              filter({ triangleBand: enabled ? band : null })
            }
            onClear={clear}
            hasFilters={hasCatalogFilters(s.filters)}
          />
          <a
            className="text-button"
            href={`/${locale}/docs/contributing${import.meta.env.PROD ? '/index.html' : ''}`}
          >
            {t('workspace.contribute')}
          </a>
        </div>
        <div className="browse-main">
          <div className="catalog-results">
            <CatalogGrid
              assets={visibleAssets}
              locale={locale}
              onClearFilters={clear}
              hasFilters={hasCatalogFilters(s.filters)}
              selectedId={s.asset}
              onSelectAsset={inspect}
              checkedIds={s.selected}
              onCheck={(id, enabled) => update({ selected: toggle(s.selected, id, enabled) })}
              view={s.view}
              density={s.density}
              browsingSearch={serializeWorkspace(s)}
              find={find}
            />
          </div>
          {selected && (
            <AssetPreview
              asset={selected}
              locale={locale}
              navigation={{
                previous: neighbors.previous,
                next: neighbors.next,
                onSelect: inspect,
                inResults: neighbors.index >= 0,
                onFind: () => {
                  update({
                    ...(neighbors.index < 0 ? { filters: { ...emptyFilters } } : {}),
                    expanded: false,
                  });
                  findAsset(selected.id);
                },
              }}
              pane={{
                dock: s.dock,
                expanded,
                onDock: (dock) => update({ dock }),
                onExpand: (expanded) => {
                  update({ expanded });
                  if (!expanded) findAsset(selected.id);
                },
                onClose: close,
                size: bottom
                  ? {
                      value: height,
                      minimum: 240,
                      maximum: maxHeight,
                      onChange: setPreviewHeight,
                      axis: 'y',
                      direction: -1,
                    }
                  : {
                      value: width,
                      minimum: 320,
                      maximum,
                      onChange: setPreviewWidth,
                      axis: 'x',
                      direction: s.dock === 'left' ? 1 : -1,
                    },
              }}
            />
          )}
        </div>
      </div>
    </section>
  );
}
