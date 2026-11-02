/**
 * [INPUT]: 依赖搜索绑定、原生侧栏模式、i18next 与官方 shadcn Input、Popover 和 Button。
 * [OUTPUT]: 导出原生搜索插槽与 CatalogSearchContext，宽窄屏共享同一查询。
 * [POS]: 替换模型页的文档搜索入口；不读取文档索引，不新增搜索状态。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { createContext, useContext } from 'react';
import { useSidebar } from 'fumadocs-ui/components/sidebar/base';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';

export type CatalogSearchBinding = { query: string; onQueryChange: (query: string) => void };
export const CatalogSearchContext = createContext<CatalogSearchBinding | null>(null);

function CatalogSearchField() {
  const binding = useContext(CatalogSearchContext);
  const { t } = useTranslation();
  if (!binding) return null;
  return (
    <Label className="catalog-search">
      <Search aria-hidden="true" />
      <Input
        type="search"
        aria-label={t('home.searchLabel')}
        placeholder={t('workspace.searchModels')}
        value={binding.query}
        onChange={(event) => binding.onQueryChange(event.currentTarget.value)}
      />
    </Label>
  );
}
function CatalogSearchTrigger() {
  const { t } = useTranslation();
  const { mode } = useSidebar();
  if (mode !== 'drawer') return null;
  return (
    <Popover>
      <PopoverTrigger
        render={<Button variant="ghost" size="icon" aria-label={t('home.searchLabel')} />}
      >
        <Search aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent align="end">
        <CatalogSearchField />
      </PopoverContent>
    </Popover>
  );
}
export const catalogSearchSlots = { full: CatalogSearchField, sm: CatalogSearchTrigger };
