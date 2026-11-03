/**
 * [INPUT]: 依赖真实资产、locale、容器宽度、滚动模式、选中编号与实际滚动元素。
 * [OUTPUT]: 导出按卡片最小宽度排列的虚拟网格与无结果状态。
 * [POS]: 首页唯一资产列表；虚拟化只挂载视窗附近的 AssetCard。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { Button } from '@/components/ui/button';
import { useVirtualizer, useWindowVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AssetCard } from '@/components/asset-card';
import { groupIntoRows } from '@/lib/catalog-view';
import type { CatalogAsset } from '@/lib/catalog';
import type { Locale } from '@/lib/locale';

// ---- 估算文字区与行间距；实际行高由 virtualizer.measureElement 校正 ----
const CARD_DETAILS_ESTIMATE = 64;

type CatalogGridProps = {
  assets: CatalogAsset[];
  locale: Locale;
  onClearFilters: () => void;
  hasFilters: boolean;
  selectedId?: string | null;
  onSelectAsset?: (id: string) => void;
  checkedIds?: readonly string[];
  onCheck?: (id: string, checked: boolean) => void;
  view?: 'grid' | 'list';
  density?: 'small' | 'medium' | 'large';
  browsingSearch?: string;
  find?: { id: string; request: number } | null;
  scrollScope?: 'page' | 'panel';
};

function columnCountForWidth(width: number, density: string): number {
  if (width <= 0) return 2;
  const minCardWidth =
    density === 'small' ? 120 : density === 'large' ? 260 : width < 600 ? 140 : 180;
  return Math.max(1, Math.floor((width + 18) / (minCardWidth + 18)));
}

export function CatalogGrid({
  assets,
  locale,
  onClearFilters,
  hasFilters,
  selectedId,
  onSelectAsset,
  checkedIds = [],
  onCheck,
  view = 'grid',
  density = 'medium',
  browsingSearch,
  find,
  scrollScope = 'page',
}: CatalogGridProps) {
  const { t } = useTranslation();
  const gridRef = useRef<HTMLDivElement>(null);
  const lastFind = useRef(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [scrollMargin, setScrollMargin] = useState(0);
  const [scrollElement, setScrollElement] = useState<HTMLElement | null>(null);
  const columns = view === 'list' ? 1 : columnCountForWidth(containerWidth, density);
  const rows = useMemo(() => groupIntoRows(assets, columns), [assets, columns]);
  const options = {
    count: rows.length,
    estimateSize: () => {
      if (view === 'list') return 100;
      const cardWidth = Math.max(150, containerWidth / columns - 18);
      return Math.ceil(cardWidth + CARD_DETAILS_ESTIMATE);
    },
    getItemKey: (index: number) => rows[index]?.[0]?.id ?? index,
    overscan: 2,
    scrollMargin,
  };
  const windowVirtualizer = useWindowVirtualizer({ ...options, enabled: !scrollElement });
  const elementVirtualizer = useVirtualizer({
    ...options,
    enabled: Boolean(scrollElement),
    getScrollElement: () => scrollElement,
  });
  const virtualizer = scrollElement ? elementVirtualizer : windowVirtualizer;

  useEffect(() => {
    const element = gridRef.current;
    if (!element) return;

    const updateMeasurements = () => {
      setContainerWidth(element.clientWidth);
      let ancestor = element.parentElement;
      while (ancestor && !['auto', 'scroll'].includes(getComputedStyle(ancestor).overflowY)) {
        ancestor = ancestor.parentElement;
      }
      setScrollElement(ancestor);
      // ---- 记录滚动宿主偏移，不改变模板的 overflow 几何 ----
      setScrollMargin(
        ancestor
          ? element.getBoundingClientRect().top -
              ancestor.getBoundingClientRect().top +
              ancestor.scrollTop
          : element.getBoundingClientRect().top + window.scrollY,
      );
    };
    updateMeasurements();
    const observer = new ResizeObserver(updateMeasurements);
    observer.observe(element);
    window.addEventListener('resize', updateMeasurements);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateMeasurements);
    };
  }, [assets.length, scrollScope]);

  useEffect(() => {
    virtualizer.measure();
  }, [columns, virtualizer]);

  useEffect(() => {
    if (!find || lastFind.current === find.request) return;
    const index = assets.findIndex((asset) => asset.id === find.id);
    if (index < 0) return;
    virtualizer.scrollToIndex(Math.floor(index / columns), { align: 'center' });
    const timer = setTimeout(() => {
      const target = gridRef.current?.querySelector<HTMLAnchorElement>(
        `[data-asset-id="${find.id}"] a`,
      );
      if (target) {
        target.focus({ preventScroll: true });
        lastFind.current = find.request;
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [find, assets, columns, virtualizer]);

  if (assets.length === 0) {
    return (
      <div className="no-results" role="status">
        <h3>{t('home.noMatchesTitle')}</h3>
        <p>{t('home.noMatchesDescription')}</p>
        {hasFilters && (
          <Button variant="link" type="button" onClick={onClearFilters}>
            {t('home.clearFilters')}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      ref={gridRef}
      className="asset-grid"
      data-view={view}
      data-density={density}
      role="list"
      aria-label={t('home.assetResults')}
    >
      <div className="virtual-grid-space" style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            ref={virtualizer.measureElement}
            data-index={virtualRow.index}
            className="virtual-grid-row"
            role="presentation"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              transform: `translateY(${virtualRow.start - scrollMargin}px)`,
            }}
          >
            {rows[virtualRow.index].map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                locale={locale}
                selected={asset.id === selectedId}
                onSelect={onSelectAsset}
                checked={checkedIds.includes(asset.id)}
                onCheck={onCheck}
                view={view}
                browsingSearch={browsingSearch}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
