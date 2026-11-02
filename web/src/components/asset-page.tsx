/**
 * [INPUT]: 依赖已验证目录、查询资产编号、本地化路径、HomeLayout 和共享资产内容。
 * [OUTPUT]: 导出资产查看器、模型文件入口、发布元数据和缺失状态。
 * [POS]: 独立详情页的状态边界；内容复用 AssetDetails，返回链接保留语言和规范浏览条件。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { Button } from '@/components/ui/button';
import { useRouterState } from '@tanstack/react-router';
import { parseWorkspace, serializeWorkspace } from '@/lib/workspace-state';
import { useTranslation } from 'react-i18next';
import { AssetDetails } from '@/components/asset-details';
import { CatalogStateView } from '@/components/catalog-state';
import { useCatalog } from '@/lib/use-catalog';
import { getAssetDisplayName, localizedHomePath, type Locale } from '@/lib/locale';
import { toStaticHref } from '@/lib/static-href';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';

export function AssetPage({ id, locale }: { id?: string; locale: Locale }) {
  const { t } = useTranslation();
  const { state, retry } = useCatalog();
  const search = useRouterState({ select: (s) => s.location.searchStr });
  const back = serializeWorkspace(parseWorkspace(new URLSearchParams(search).get('catalog') ?? ''));
  const galleryUrl = toStaticHref(
    `${localizedHomePath(locale)}${back ? `?${back}` : ''}`,
    import.meta.env.PROD,
  );

  if (state.status !== 'ready') {
    return (
      <HomeLayout {...baseOptions(locale)}>
        <main id="main-content" className="detail-main">
          <Button
            variant="link"
            className="back-link"
            nativeButton={false}
            render={<a href={galleryUrl} />}
          >
            {t('asset.backGallery')}
          </Button>
          <h1 className="detail-heading">{t('asset.detailTitle')}</h1>
          <CatalogStateView state={state} onRetry={retry} />
        </main>
      </HomeLayout>
    );
  }

  const asset = id ? state.catalog.assets.find((item) => item.id === id) : undefined;
  const assetName = asset ? getAssetDisplayName(asset, locale) : undefined;

  return (
    <HomeLayout {...baseOptions(locale)}>
      <main id="main-content" className="detail-main">
        <Button
          variant="link"
          className="back-link"
          nativeButton={false}
          render={<a href={galleryUrl} />}
        >
          {t('asset.backGallery')}
        </Button>
        {!id && (
          <section className="detail-empty" role="status">
            <h1>{t('asset.chooseTitle')}</h1>
            <p>{t('asset.chooseDescription')}</p>
          </section>
        )}
        {id && !asset && (
          <section className="detail-empty" role="status">
            <h1>{t('asset.notFoundTitle')}</h1>
            <p>{t('asset.notFoundDescription', { id })}</p>
          </section>
        )}
        {asset && assetName && <AssetDetails asset={asset} locale={locale} />}
      </main>
    </HomeLayout>
  );
}
