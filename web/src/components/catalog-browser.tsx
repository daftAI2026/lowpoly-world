/**
 * [INPUT]: 依赖公开目录、URL 浏览状态与独立结果、预览、下载视图及输入方式。
 * [OUTPUT]: 导出只读工作区，全局动作投影到FU插槽，下载队列独立常驻。
 * [POS]: 首页交互组合边界；筛选交给原生侧栏；主区只保留结果与预览。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { GalleryShell } from './gallery-shell';
import { usePanelRef } from 'react-resizable-panels';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from './ui/resizable';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CatalogFilters as CatalogFiltersPanel } from './catalog-filters';
import { CatalogGrid } from './catalog-grid';
import { AssetPreview } from './asset-preview';
import { WorkspaceToolbar } from './workspace-toolbar';
import { DownloadSelection } from './download-selection';
import { DownloadTasks } from './download-tasks';
import { WorkspacePreferences } from './workspace-preferences';
import { useDownloadQueue } from '@/lib/use-download-queue';
import { previewNeighbors } from '@/lib/catalog-selection';
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
  const queue = useDownloadQueue();
  const [tasksOpen, setTasksOpen] = useState(false);
  const savedSize = useRef({ width: 400, height: 360 });
  useEffect(() => {
    // ---- 键盘操作即时响应，指针动作才使用面板缓动 ----
    const root = document.documentElement;
    const pointer = () => {
      root.dataset.workspaceInput = 'pointer';
    };
    const keyboard = () => {
      delete root.dataset.workspaceInput;
    };
    window.addEventListener('pointerdown', pointer, true);
    window.addEventListener('keydown', keyboard, true);
    return () => {
      window.removeEventListener('pointerdown', pointer, true);
      window.removeEventListener('keydown', keyboard, true);
      delete root.dataset.workspaceInput;
    };
  }, []);
  const previewPanel = usePanelRef();
  const [hiddenGroups, setHiddenGroups] = useState<string[]>([]);
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
  const selectedIds = new Set(s.selected);
  const checked = catalog.assets.filter((a) => selectedIds.has(a.id));
  const selectedVisible = visibleAssets.filter((asset) => selectedIds.has(asset.id)).length;
  const neighbors = previewNeighbors(visibleAssets, s.asset);
  const compact = size.width < 1000;
  const bottom = s.dock === 'bottom' || compact;
  const maximum = Math.max(320, Math.min(600, size.width - 280));

  const maxHeight = Math.max(240, size.height - 180);

  const desktop = typeof window !== 'undefined' && window.matchMedia('(min-width: 900px)').matches;
  const left = s.dock === 'left' && !bottom;
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
      const page = host.closest<HTMLElement>('.site-main');
      const scroller = page?.parentElement;
      const bottomEdge = scroller?.getBoundingClientRect().bottom ?? window.innerHeight;
      const visibleTop = Math.max(
        host.getBoundingClientRect().top,
        toolbar.getBoundingClientRect().bottom + 8,
      );
      const availableHeight = Math.max(320, bottomEdge - visibleTop - 8);
      const width = host.clientWidth;
      setSize((current) =>
        current.width === width && current.height === availableHeight
          ? current
          : { width, height: availableHeight },
      );
      host.style.setProperty('--workspace-height', `${availableHeight}px`);
      host.parentElement?.style.setProperty(
        '--workspace-toolbar-height',
        `${toolbar.getBoundingClientRect().height}px`,
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
  useEffect(() => {
    let resizeFrame = 0;
    // ---- 等待上游 ResizeObserver 更新轴尺寸，再恢复该停靠轴的大小 ----
    const frame = requestAnimationFrame(() => {
      resizeFrame = requestAnimationFrame(() => {
        if (!selected) previewPanel.current?.resize(0);
        else if (expanded) previewPanel.current?.resize('100%');
        else
          previewPanel.current?.resize(bottom ? savedSize.current.height : savedSize.current.width);
      });
    });
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(resizeFrame);
    };
  }, [selected?.id, expanded, bottom, left, desktop, maximum, maxHeight, previewPanel]);
  const sidebar = (
    <>
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
        onTriangleBandChange={(band, enabled) => filter({ triangleBand: enabled ? band : null })}
        onClear={clear}
        hasFilters={hasCatalogFilters(s.filters)}
      />
    </>
  );
  // ---- 沿用现有测量，窄屏只保留一份任务入口，队列不随插槽迁移 ----
  const useHeaderActions = size.width > 0 && window.matchMedia('(min-width: 768px)').matches;
  const globalActions = (
    <>
      <DownloadTasks queue={queue} locale={locale} open={tasksOpen} onOpenChange={setTasksOpen} />
      <WorkspacePreferences
        withPreview={Boolean(s.filters.withPreview)}
        onWithPreview={(withPreview) => filter({ withPreview })}
        hiddenGroups={hiddenGroups}
        onHiddenGroups={setHiddenGroups}
      />
    </>
  );
  return (
    <GalleryShell
      locale={locale}
      sidebar={sidebar}
      actions={useHeaderActions ? globalActions : undefined}
      search={{
        query: s.filters.query,
        onQueryChange: (query) => update({ filters: { ...s.filters, query } }, true),
      }}
    >
      <h1 className="visually-hidden">{t('home.collectionTitle')}</h1>
      <section className="catalog-browser" aria-label={t('home.collectionTitle')}>
        <div ref={toolbarRef} className="workspace-toolbar-host" hidden={expanded}>
          <WorkspaceToolbar
            state={s}
            update={update}
            visible={visibleAssets.length}
            total={catalog.count}
            allResultsSelected={
              Boolean(visibleAssets.length) && selectedVisible === visibleAssets.length
            }
            someResultsSelected={selectedVisible > 0}
            onDeselectResults={() => {
              const visibleIds = new Set(visibleAssets.map((asset) => asset.id));
              update({ selected: s.selected.filter((id) => !visibleIds.has(id)) });
            }}
            onSelectResults={() =>
              update({ selected: [...new Set([...s.selected, ...visibleAssets.map((a) => a.id)])] })
            }
            downloadControls={
              <DownloadSelection
                assets={checked}
                locale={locale}
                onRemove={(id) => update({ selected: s.selected.filter((value) => value !== id) })}
                onClear={() => update({ selected: [] })}
                onInspect={inspect}
                queue={queue}
                onStarted={() => setTasksOpen(true)}
              />
            }
            globalActions={useHeaderActions ? null : globalActions}
            onReopen={!selected && lastPreview ? () => inspect(lastPreview) : null}
          />
        </div>
        <div
          ref={workspaceRef}
          className="catalog-workspace"
          data-preview={Boolean(selected)}
          data-dock={s.dock}
          data-bottom={bottom}
          data-expanded={expanded}
        >
          <ResizablePanelGroup
            className="browse-main"
            data-left={left}
            orientation={bottom ? 'vertical' : 'horizontal'}
            disabled={!selected || expanded || !desktop}
            onLayoutChanged={(_, meta) => {
              if (meta.isUserInteraction && !expanded) {
                const value = previewPanel.current?.getSize().inPixels;
                if (value) {
                  if (bottom) savedSize.current.height = value;
                  else savedSize.current.width = value;
                }
              }
            }}
          >
            <ResizablePanel
              id="results"
              minSize={expanded ? 0 : bottom ? 160 : 240}
              defaultSize="70%"
              collapsible
            >
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
                  scrollScope={selected && bottom ? 'panel' : 'page'}
                />
              </div>
            </ResizablePanel>
            <ResizableHandle
              className="workspace-splitter"
              disabled={!selected || expanded || !desktop}
              style={{ order: 1 }}
              aria-label={t(bottom ? 'workspace.previewHeight' : 'asset.resizePreview')}
            />
            <ResizablePanel
              id="preview"
              panelRef={previewPanel}
              minSize={!selected || expanded ? 0 : bottom ? 240 : 320}
              maxSize={!selected ? 0 : expanded ? '100%' : bottom ? maxHeight : maximum}
              defaultSize={400}
              collapsible
            >
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
                  }}
                />
              )}
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </section>
    </GalleryShell>
  );
}
