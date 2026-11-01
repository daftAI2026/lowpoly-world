/**
 * [INPUT]: 依赖真实资产、locale、容器宽度与原生页面滚动元素。
 * [OUTPUT]: 导出响应式行虚拟化网格与无匹配结果状态。
 * [POS]: 首页唯一资产列表；虚拟化只挂载视窗附近的 AssetCard。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useVirtualizer, useWindowVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AssetCard } from '@/components/asset-card';
import { groupIntoRows } from '@/lib/catalog-view';
import type { CatalogAsset } from '@/lib/catalog';
import type { Locale } from '@/lib/locale';

// ---- 估算文字区与行间距；实际行高由 virtualizer.measureElement 校正 ----
const CARD_DETAILS_ESTIMATE = 96;

type CatalogGridProps = {
  assets: CatalogAsset[];
  locale: Locale;
  onClearFilters: () => void;
  hasFilters: boolean;
};

function columnCountForWidth(width: number): number {
  if (width <= 0) return 2;
  const minCardWidth = width < 360 ? 280 : width < 600 ? 140 : 180;
  return Math.max(1, Math.min(6, Math.floor((width + 18) / (minCardWidth + 18))));
}

export function CatalogGrid({ assets, locale, onClearFilters, hasFilters }: CatalogGridProps) {
  const { t } = useTranslation();
  const gridRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [scrollMargin, setScrollMargin] = useState(0);
  const [scrollElement, setScrollElement] = useState<HTMLElement | null>(null);
  const columns = columnCountForWidth(containerWidth);
  const rows = useMemo(() => groupIntoRows(assets, columns), [assets, columns]);
  const options = {
    count: rows.length,
    estimateSize: () => {
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
      setScrollMargin(ancestor
        ? element.getBoundingClientRect().top - ancestor.getBoundingClientRect().top + ancestor.scrollTop
        : element.getBoundingClientRect().top + window.scrollY);
    };
    updateMeasurements();
    const observer = new ResizeObserver(updateMeasurements);
    observer.observe(element);
    window.addEventListener('resize', updateMeasurements);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateMeasurements);
    };
  }, [assets.length]);

  useEffect(() => {
    virtualizer.measure();
  }, [columns, virtualizer]);

  if (assets.length === 0) {
    return (
      <div className="no-results" role="status">
        <h3>{t('home.noMatchesTitle')}</h3>
        <p>{t('home.noMatchesDescription')}</p>
        {hasFilters && (
          <button className="text-button" type="button" onClick={onClearFilters}>
            {t('home.clearFilters')}
          </button>
        )}
      </div>
    );
  }

  return (
    <div ref={gridRef} className="asset-grid" role="list" aria-label={t('home.assetResults')}>
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
              <AssetCard key={asset.id} asset={asset} locale={locale} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
