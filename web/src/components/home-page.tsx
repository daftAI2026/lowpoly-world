/**
 * [INPUT]: 依赖官网同款 GalleryShell、公开目录和双语资源。
 * [OUTPUT]: 导出紧凑模型库页面；标题仅向辅助技术提供。
 * [POS]: 首页内容区；加载态与真实工作区共用全屏壳，不导入文档树。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useTranslation } from 'react-i18next';
import { CatalogBrowser } from '@/components/catalog-browser';
import { CatalogStateView } from '@/components/catalog-state';
import type { Locale } from '@/lib/locale';
import { useCatalog } from '@/lib/use-catalog';
import { GalleryShell } from './gallery-shell';

export function HomePage({ locale }: { locale: Locale }) {
  const { t } = useTranslation();
  const { state, retry } = useCatalog();

  if (state.status === 'ready' && state.catalog.count > 0) {
    return <CatalogBrowser catalog={state.catalog} locale={locale} />;
  }
  return (
    <GalleryShell locale={locale}>
      <h1 className="visually-hidden">{t('home.collectionTitle')}</h1>
      <section className="catalog-section" aria-label={t('home.assetResults')}>
        <CatalogStateView state={state} onRetry={retry} />
      </section>
    </GalleryShell>
  );
}
