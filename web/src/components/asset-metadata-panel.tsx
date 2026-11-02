/**
 * [INPUT]: 依赖公开 metadata、统一分类与官方 shadcn 控件。
 * [OUTPUT]: 展示本地化分类与资产事实；许可保留，存储来源不进入界面。
 * [POS]: 共享 AssetDetails 的元数据视图；缺字段与质量状态不推断。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { CatalogAsset } from '@/lib/catalog';
import { classifyCategory, categoryDisplayPath } from '@/lib/category-taxonomy.ts';
import { assetHasFormat } from '@/lib/catalog-view';
import type { JsonValue, ReleaseMetadata } from '@/lib/asset-metadata';
import { useAssetDetails } from '@/lib/use-asset-details';

type AssetMetadataPanelProps = {
  asset: CatalogAsset;
};

function formattedJson(value: JsonValue): string {
  return JSON.stringify(value, null, 2);
}

function displayValue(value: string | number | null, fallback: string): string {
  return value === null || value === '' ? fallback : String(value);
}

function hasJsonValue(value: JsonValue | null | undefined): value is JsonValue {
  return value !== null && value !== undefined;
}

function MetadataBlock({
  title,
  status,
  value,
  notSupplied,
  unavailable,
}: {
  title: string;
  status: 'loading' | 'not-supplied' | 'available' | 'unavailable';
  value?: string;
  notSupplied: string;
  unavailable: string;
}) {
  return (
    <Collapsible className="metadata-block">
      <CollapsibleTrigger render={<Button variant="ghost" className="justify-start" />}>
        {title}
      </CollapsibleTrigger>
      <CollapsibleContent>
        {status === 'available' && <pre className="metadata-text">{value}</pre>}
        {status === 'loading' && (
          <p className="metadata-note" role="status">
            …
          </p>
        )}
        {status === 'not-supplied' && <p className="metadata-note">{notSupplied}</p>}
        {status === 'unavailable' && (
          <p className="metadata-note" role="status">
            {unavailable}
          </p>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

function PreviewGallery({
  asset,
  release,
}: {
  asset: CatalogAsset;
  release: ReleaseMetadata | null;
}) {
  const { t } = useTranslation();
  const previewUrls = useMemo(
    () =>
      [
        ...new Set([asset.preview_url, ...asset.preview_urls, ...(release?.preview_urls ?? [])]),
      ].filter((url): url is string => Boolean(url)),
    [asset.preview_url, asset.preview_urls, release?.preview_urls],
  );

  if (previewUrls.length === 0) {
    return <p className="metadata-note">{t('asset.notSupplied')}</p>;
  }

  return (
    <div className="preview-gallery">
      {previewUrls.map((url, index) => (
        <figure key={url}>
          <img src={url} loading="lazy" alt={t('asset.previewImageAlt', { index: index + 1 })} />
          <figcaption>{t('asset.previewLabel', { index: index + 1 })}</figcaption>
        </figure>
      ))}
    </div>
  );
}

export function AssetMetadataPanel({ asset }: AssetMetadataPanelProps) {
  const { t, i18n } = useTranslation();
  const { state, retry } = useAssetDetails(asset);
  const release =
    state.status === 'ready' && state.details.release.status === 'available'
      ? state.details.release.value
      : null;
  const notSupplied = t('asset.notSupplied');
  const metadataUnavailable = t('asset.metadataUnavailable');
  const prompt = state.status === 'ready' ? state.details.prompt : null;
  const directRecipe = state.status === 'ready' ? state.details.recipe : null;
  const releaseRecipe = release?.recipe;
  const releaseQuality = release?.quality;
  const recipeValue =
    directRecipe?.status === 'available'
      ? formattedJson(directRecipe.value)
      : hasJsonValue(releaseRecipe)
        ? formattedJson(releaseRecipe)
        : undefined;
  const recipeAvailable = directRecipe?.status === 'available' || hasJsonValue(releaseRecipe);
  const recipeUnavailable =
    directRecipe?.status === 'unavailable' ||
    state.status === 'error' ||
    (state.status === 'ready' && state.details.release.status === 'unavailable');
  const recipeStatus = recipeAvailable
    ? 'available'
    : state.status === 'loading'
      ? 'loading'
      : recipeUnavailable
        ? 'unavailable'
        : 'not-supplied';
  const qualityValue = hasJsonValue(releaseQuality) ? formattedJson(releaseQuality) : undefined;
  const qualityStatus =
    state.status === 'loading'
      ? 'loading'
      : state.status === 'error' || state.details.release.status === 'unavailable'
        ? 'unavailable'
        : hasJsonValue(releaseQuality)
          ? 'available'
          : 'not-supplied';

  return (
    <section className="asset-metadata" aria-labelledby="asset-metadata-heading">
      <header className="metadata-heading">
        <div>
          <h2 id="asset-metadata-heading">{t('asset.metadataTitle')}</h2>
        </div>
        {state.status === 'error' && (
          <Button variant="link" type="button" onClick={retry}>
            {t('catalog.retry')}
          </Button>
        )}
      </header>

      <dl className="asset-facts">
        <div>
          <dt>{t('asset.category')}</dt>
          <dd>
            {categoryDisplayPath(
              classifyCategory(asset).path,
              i18n.resolvedLanguage === 'zh' ? 'zh' : 'en',
            )}
          </dd>
        </div>
        <div>
          <dt>{t('asset.triangles')}</dt>
          <dd>{displayValue(asset.triangles, notSupplied)}</dd>
        </div>
        <div>
          <dt>{t('asset.vertices')}</dt>
          <dd>{displayValue(asset.vertices, notSupplied)}</dd>
        </div>
        <div>
          <dt>{t('asset.dimensions')}</dt>
          <dd>{asset.dimensions_m ? `${asset.dimensions_m.join(' × ')} m` : notSupplied}</dd>
        </div>
        <div>
          <dt>{t('asset.fileSize')}</dt>
          <dd>
            {asset.file_size_bytes === null
              ? notSupplied
              : `${asset.file_size_bytes.toLocaleString()} B`}
          </dd>
        </div>
        <div>
          <dt>{t('asset.formats')}</dt>
          <dd>
            {[
              assetHasFormat(asset, 'glb') ? 'GLB' : null,
              assetHasFormat(asset, 'blend') ? 'BLEND' : null,
            ]
              .filter(Boolean)
              .join(', ') || notSupplied}
          </dd>
        </div>
        <div>
          <dt>{t('asset.license')}</dt>
          <dd>{displayValue(asset.license, notSupplied)}</dd>
        </div>
        <div>
          <dt>{t('asset.revision')}</dt>
          <dd>{displayValue(release?.revision ?? asset.revision, notSupplied)}</dd>
        </div>
        <div>
          <dt>{t('asset.publishedAt')}</dt>
          <dd>{displayValue(release?.published_at_utc ?? asset.published_at_utc, notSupplied)}</dd>
        </div>
        <div>
          <dt>{t('asset.sourceHash')}</dt>
          <dd className="hash-value">{asset.source_sha256}</dd>
        </div>
        <div>
          <dt>{t('asset.tags')}</dt>
          <dd>{asset.tags.length > 0 ? asset.tags.join(', ') : notSupplied}</dd>
        </div>
      </dl>

      <div className="metadata-sections">
        <MetadataBlock
          title={t('asset.prompt')}
          status={
            prompt?.status ??
            (state.status === 'loading'
              ? 'loading'
              : state.status === 'error'
                ? 'unavailable'
                : 'not-supplied')
          }
          value={prompt?.status === 'available' ? prompt.value : undefined}
          notSupplied={notSupplied}
          unavailable={metadataUnavailable}
        />
        <MetadataBlock
          title={t('asset.recipe')}
          status={recipeStatus}
          value={recipeValue}
          notSupplied={notSupplied}
          unavailable={metadataUnavailable}
        />
        <MetadataBlock
          title={t('asset.quality')}
          status={qualityStatus}
          value={qualityValue}
          notSupplied={notSupplied}
          unavailable={metadataUnavailable}
        />
        <Collapsible className="metadata-block">
          <CollapsibleTrigger render={<Button variant="ghost" className="justify-start" />}>
            {t('asset.previews')}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <PreviewGallery asset={asset} release={release} />
          </CollapsibleContent>
        </Collapsible>
      </div>

      <Collapsible className="metadata-scope">
        <CollapsibleTrigger render={<Button variant="ghost" className="justify-start" />}>
          {t('asset.metadataScope')}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <p className="metadata-note">{t('asset.metadataAsPublished')}</p>
        </CollapsibleContent>
      </Collapsible>

      {release?.source_input_image && (
        <figure className="source-input-image">
          <img
            src={release.source_input_image.url}
            alt={t('asset.sourceInputImageAlt')}
            loading="lazy"
          />
          <figcaption>
            <strong>{t('asset.sourceInputImage')}</strong>
            <span>{release.source_input_image.rights_statement}</span>
          </figcaption>
        </figure>
      )}
    </section>
  );
}
