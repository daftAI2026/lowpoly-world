/**
 * [INPUT]: 依赖 URL 状态、真实分类与官方 shadcn 表单、弹层和导航。
 * [OUTPUT]: 导出排序、结果计数、按需分类路径与视图控制。
 * [POS]: 工作区工具栏；只发状态变更，不加载目录或模型。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { Label } from '@/components/ui/label';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Button } from '@/components/ui/button';
import { Fragment } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useTranslation } from 'react-i18next';
import type { WorkspaceState } from '@/lib/workspace-state';
import { emptyFilters } from '@/lib/workspace-state';
import { hasCatalogFilters, isCatalogSort, type CatalogFilters } from '@/lib/catalog-view';
type Props = {
  state: WorkspaceState;
  update: (s: Partial<WorkspaceState>, replace?: boolean) => void;
  visible: number;
  total: number;
  selectedCount: number;
  onSelectResults: () => void;
  onReview: () => void;
  hiddenGroups: string[];
  onHiddenGroups: (groups: string[]) => void;
  onReopen: (() => void) | null;
};
export function WorkspaceToolbar({
  state: s,
  update,
  visible,
  total,
  selectedCount,
  onSelectResults,
  onReview,
  hiddenGroups,
  onHiddenGroups,
  onReopen,
}: Props) {
  const { t } = useTranslation();
  const f = s.filters;
  const filter = (patch: Partial<CatalogFilters>, replace = false) =>
    update({ filters: { ...f, ...patch } }, replace);
  const parts = f.categoryPath?.split('/') ?? [];
  const chips: { key: string; label: string; clear: () => void }[] = [];
  if (f.query)
    chips.push({
      key: 'q',
      label: f.query,
      clear: () => filter({ query: '' }),
    });
  for (const format of f.formats)
    chips.push({
      key: format,
      label: format.toUpperCase(),
      clear: () => filter({ formats: f.formats.filter((v) => v !== format) }),
    });
  for (const tag of f.tags)
    chips.push({
      key: 'tag-' + tag,
      label: tag,
      clear: () => filter({ tags: f.tags.filter((v) => v !== tag) }),
    });
  if (f.triangleBand)
    chips.push({
      key: 'triangles',
      label: t(
        f.triangleBand === 'under-5k'
          ? 'home.triangleBandMinimal'
          : f.triangleBand === '5k-to-25k'
            ? 'home.triangleBandLight'
            : 'home.triangleBandDense',
      ),
      clear: () => filter({ triangleBand: null }),
    });
  for (const key of ['license', 'source'] as const)
    if (f[key]) chips.push({ key, label: f[key], clear: () => filter({ [key]: null }) });
  if (f.dimension)
    chips.push({
      key: 'dimension',
      label: t(f.dimension === 'under-1m' ? 'workspace.under1m' : 'workspace.over1m'),
      clear: () => filter({ dimension: null }),
    });
  if (f.withPreview)
    chips.push({
      key: 'preview',
      label: t('workspace.onlyPreviews'),
      clear: () => filter({ withPreview: false }),
    });
  return (
    <div className="workspace-toolbar">
      <div className="workspace-heading">
        <div className="catalog-toolbar">
          <Label className="sort-control">
            <span>{t('home.sortLabel')}</span>
            <NativeSelect
              value={s.sort}
              onChange={(e) => {
                if (isCatalogSort(e.currentTarget.value)) update({ sort: e.currentTarget.value });
              }}
            >
              <NativeSelectOption value="id-asc">{t('home.sortId')}</NativeSelectOption>
              <NativeSelectOption value="name-asc">{t('home.sortName')}</NativeSelectOption>
              <NativeSelectOption value="triangles-asc">
                {t('home.sortTriangles')}
              </NativeSelectOption>
              <NativeSelectOption value="triangles-desc">
                {t('home.sortTrianglesDesc')}
              </NativeSelectOption>
            </NativeSelect>
          </Label>
          <p className="catalog-result-count" aria-live="polite">
            {t('home.resultCount', { visible, total })}
          </p>
        </div>
      </div>
      <div className="workspace-controls">
        <ToggleGroup
          className="view-controls"
          variant="outline"
          spacing={0}
          value={[s.view]}
          onValueChange={(values) => {
            const view = values[0];
            if (view === 'grid' || view === 'list') update({ view });
          }}
          aria-label={t('home.assetResults')}
        >
          {(['grid', 'list'] as const).map((view) => (
            <ToggleGroupItem key={view} value={view}>
              {t(`workspace.${view}`)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <Label className="density-control">
          {t('workspace.density')}
          <NativeSelect
            value={s.density}
            disabled={s.view === 'list'}
            onChange={(e) =>
              update({
                density: e.currentTarget.value as WorkspaceState['density'],
              })
            }
          >
            {(['small', 'medium', 'large'] as const).map((d) => (
              <NativeSelectOption value={d} key={d}>
                {t(`workspace.${d}`)}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Label>
        <Popover>
          <PopoverTrigger render={<Button variant="outline" />}>
            {t('workspace.preferences')}
          </PopoverTrigger>
          <PopoverContent align="start" className="workspace-preferences-content">
            <Label>
              <Checkbox
                checked={Boolean(f.withPreview)}
                onCheckedChange={(checked) => filter({ withPreview: checked === true })}
              />
              {t('workspace.onlyPreviews')}
            </Label>
            <fieldset>
              <legend>{t('workspace.filterGroups')}</legend>
              {(['format', 'triangle', 'tag', 'license', 'source', 'dimension'] as const).map(
                (group) => (
                  <Label key={group}>
                    <Checkbox
                      checked={!hiddenGroups.includes(group)}
                      onCheckedChange={(checked) =>
                        onHiddenGroups(
                          checked === true
                            ? hiddenGroups.filter((g) => g !== group)
                            : [...hiddenGroups, group],
                        )
                      }
                    />
                    {t(
                      group === 'format'
                        ? 'home.formats'
                        : group === 'triangle'
                          ? 'home.lowPolyLevel'
                          : group === 'tag'
                            ? 'home.tags'
                            : `workspace.${group}`,
                    )}
                  </Label>
                ),
              )}
            </fieldset>
          </PopoverContent>
        </Popover>
        <Button type="button" variant="link" disabled={!visible} onClick={onSelectResults}>
          {t('workspace.selectResults', { count: visible })}
        </Button>
        <Button type="button" variant="link" onClick={onReview}>
          {t('workspace.reviewSelection')} ({selectedCount})
        </Button>
        {onReopen && (
          <Button type="button" variant="link" onClick={onReopen}>
            {t('workspace.reopenPreview')}
          </Button>
        )}
      </div>
      {(chips.length > 0 || f.categoryPath) && (
        <div className="filter-chips">
          {f.categoryPath && (
            <Breadcrumb className="asset-breadcrumb" aria-label={t('workspace.allAssets')}>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    render={
                      <Button
                        variant="link"
                        onClick={() => update({ filters: { ...emptyFilters } })}
                      />
                    }
                  >
                    {t('workspace.allAssets')}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {parts.map((part, index) => (
                  <Fragment key={index}>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      {index === parts.length - 1 ? (
                        <BreadcrumbPage>
                          {part === 'Uncategorized' ? t('home.uncategorized') : part}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink
                          render={
                            <Button
                              variant="link"
                              onClick={() =>
                                filter({
                                  categoryPath: parts.slice(0, index + 1).join('/'),
                                })
                              }
                            />
                          }
                        >
                          {part === 'Uncategorized' ? t('home.uncategorized') : part}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          )}
          {chips.map((chip) => (
            <Button
              variant="ghost"
              key={chip.key}
              type="button"
              aria-label={t('workspace.removeFilter', { label: chip.label })}
              onClick={chip.clear}
            >
              {chip.label}
              <span aria-hidden="true">×</span>
            </Button>
          ))}
          {hasCatalogFilters(f) && (
            <Button
              type="button"
              variant="link"
              onClick={() =>
                filter({
                  ...emptyFilters,
                  license: null,
                  source: null,
                  dimension: null,
                  withPreview: false,
                })
              }
            >
              {t('home.clearFilters')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
