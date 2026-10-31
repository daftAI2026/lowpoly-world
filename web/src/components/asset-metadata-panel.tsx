/**
 * [INPUT]: 依赖已验证目录字段和详情页按需读取的公开 metadata 资源。
 * [OUTPUT]: 展示资产事实、Prompt、recipe、质量声明、预览和权利确认输入图。
 * [POS]: AssetPage 的元数据子视图；不推断缺失值或认证质量状态。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { CatalogAsset } from '@/lib/catalog';
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
    <details className="metadata-block">
      <summary>{title}</summary>
      {status === 'available' && <pre className="metadata-text">{value}</pre>}
      {status === 'loading' && <p className="metadata-note" role="status">…</p>}
      {status === 'not-supplied' && <p className="metadata-note">{notSupplied}</p>}
      {status === 'unavailable' && <p className="metadata-note" role="status">{unavailable}</p>}
    </details>
  );
}

function PreviewGallery({ asset, release }: { asset: CatalogAsset; release: ReleaseMetadata | null }) {
  const { t } = useTranslation();
  const previewUrls = useMemo(
    () => [...new Set([asset.preview_url, ...asset.preview_urls, ...(release?.preview_urls ?? [])])]
      .filter((url): url is string => Boolean(url)),
    [asset.preview_url, asset.preview_urls, release?.preview_urls],
  );

  if (previewUrls.length === 0) {
    return <p className="metadata-note">{t('asset.notSupplied')}</p>;
  }

  return (
    <div className="preview-gallery">
      {previewUrls.map((url, index) => (
        <figure key={url}>
          <img
            src={url}
            loading="lazy"
            alt={t('asset.previewImageAlt', { index: index + 1 })}
          />
          <figcaption>{t('asset.previewLabel', { index: index + 1 })}</figcaption>
        </figure>
      ))}
    </div>
  );
}

export function AssetMetadataPanel({ asset }: AssetMetadataPanelProps) {
  const { t } = useTranslation();
  const { state, retry } = useAssetDetails(asset);
  const release = state.status === 'ready' && state.details.release.status === 'available'
    ? state.details.release.value
    : null;
  const notSupplied = t('asset.notSupplied');
  const metadataUnavailable = t('asset.metadataUnavailable');
  const prompt = state.status === 'ready' ? state.details.prompt : null;
  const directRecipe = state.status === 'ready' ? state.details.recipe : null;
  const releaseRecipe = release?.recipe;
  const releaseQuality = release?.quality;
  const recipeValue = directRecipe?.status === 'available'
    ? formattedJson(directRecipe.value)
    : hasJsonValue(releaseRecipe)
      ? formattedJson(releaseRecipe)
      : undefined;
  const recipeAvailable = directRecipe?.status === 'available' || hasJsonValue(releaseRecipe);
  const recipeUnavailable = directRecipe?.status === 'unavailable' || state.status === 'error' ||
    (state.status === 'ready' && state.details.release.status === 'unavailable');
  const recipeStatus = recipeAvailable
    ? 'available'
    : state.status === 'loading'
      ? 'loading'
      : recipeUnavailable
        ? 'unavailable'
        : 'not-supplied';
  const qualityValue = hasJsonValue(releaseQuality) ? formattedJson(releaseQuality) : undefined;
  const qualityStatus = state.status === 'loading'
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
          <span className="section-kicker">{t('asset.metadataKicker')}</span>
          <h2 id="asset-metadata-heading">{t('asset.metadataTitle')}</h2>
        </div>
        {state.status === 'error' && (
          <button className="text-button" type="button" onClick={retry}>
            {t('catalog.retry')}
          </button>
        )}
      </header>

      <dl className="asset-facts">
        <div><dt>{t('asset.category')}</dt><dd>{displayValue(asset.category, notSupplied)}</dd></div>
        <div><dt>{t('asset.triangles')}</dt><dd>{displayValue(asset.triangles, notSupplied)}</dd></div>
        <div><dt>{t('asset.vertices')}</dt><dd>{displayValue(asset.vertices, notSupplied)}</dd></div>
        <div>
          <dt>{t('asset.dimensions')}</dt>
          <dd>{asset.dimensions_m ? `${asset.dimensions_m.join(' × ')} m` : notSupplied}</dd>
        </div>
        <div>
          <dt>{t('asset.fileSize')}</dt>
          <dd>{asset.file_size_bytes === null ? notSupplied : `${asset.file_size_bytes.toLocaleString()} B`}</dd>
        </div>
        <div>
          <dt>{t('asset.formats')}</dt>
          <dd>{[
            assetHasFormat(asset, 'glb') ? 'GLB' : null,
            assetHasFormat(asset, 'blend') ? 'BLEND' : null,
          ].filter(Boolean).join(' · ') || notSupplied}</dd>
        </div>
        <div><dt>{t('asset.license')}</dt><dd>{displayValue(asset.license, notSupplied)}</dd></div>
        <div><dt>{t('asset.source')}</dt><dd>{displayValue(release?.source ?? asset.source, notSupplied)}</dd></div>
        <div>
          <dt>{t('asset.revision')}</dt>
          <dd>{displayValue(release?.revision ?? asset.revision, notSupplied)}</dd>
        </div>
        <div>
          <dt>{t('asset.publishedAt')}</dt>
          <dd>{displayValue(release?.published_at_utc ?? asset.published_at_utc, notSupplied)}</dd>
        </div>
        <div><dt>{t('asset.sourceHash')}</dt><dd className="hash-value">{asset.source_sha256}</dd></div>
        <div>
          <dt>{t('asset.tags')}</dt>
          <dd>{asset.tags.length > 0 ? asset.tags.join(', ') : notSupplied}</dd>
        </div>
      </dl>

      <div className="metadata-sections">
        <MetadataBlock
          title={t('asset.prompt')}
          status={prompt?.status ?? (
            state.status === 'loading'
              ? 'loading'
              : state.status === 'error'
                ? 'unavailable'
                : 'not-supplied'
          )}
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
        <details className="metadata-block">
          <summary>{t('asset.previews')}</summary>
          <PreviewGallery asset={asset} release={release} />
        </details>
      </div>

      {release?.source_input_image && (
        <figure className="source-input-image">
          <img src={release.source_input_image.url} alt={t('asset.sourceInputImageAlt')} loading="lazy" />
          <figcaption>
            <strong>{t('asset.sourceInputImage')}</strong>
            <span>{release.source_input_image.rights_statement}</span>
          </figcaption>
        </figure>
      )}

      <p className="metadata-note">{t('asset.metadataAsPublished')}</p>
    </section>
  );
}
