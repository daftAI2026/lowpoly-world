/**
 * [INPUT]: 依赖公开目录内 release.json、prompt 文本和 recipe JSON 的可选 URL。
 * [OUTPUT]: 导出经过边界校验的发布元数据、资源状态和静态读取函数。
 * [POS]: 资产详情的第二数据边界；不把缺失字段解释成质量或权利结论。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { requireDatasetUrl, type CatalogAsset } from './catalog';

export type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue };

export type OptionalResource<T> =
  | { status: 'not-supplied' }
  | { status: 'available'; value: T }
  | { status: 'unavailable' };

export type SourceInputImage = {
  url: string;
  rights_statement: string;
};

export type ReleaseMetadata = {
  id: string | null;
  source: string | null;
  revision: string | null;
  published_at_utc: string | null;
  quality: JsonValue | null;
  recipe: JsonValue | null;
  preview_urls: string[];
  source_input_image: SourceInputImage | null;
};

export type AssetDetails = {
  release: OptionalResource<ReleaseMetadata>;
  prompt: OptionalResource<string>;
  recipe: OptionalResource<JsonValue>;
};

type JsonRecord = Record<string, unknown>;
type Fetcher = typeof fetch;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isJsonValue(value: unknown): value is JsonValue {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (Array.isArray(value)) return value.every(isJsonValue);
  return isRecord(value) && Object.values(value).every(isJsonValue);
}

function optionalText(value: unknown, field: string): string | null {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string') throw new Error(`Metadata field "${field}" must be a string or null.`);
  return value.trim() || null;
}

function optionalJson(value: unknown, field: string): JsonValue | null {
  if (value === undefined || value === null) return null;
  if (!isJsonValue(value)) throw new Error(`Metadata field "${field}" must contain JSON data.`);
  return value;
}

function parseSourceInputImage(value: unknown): SourceInputImage | null {
  if (!isRecord(value) || value.rights_confirmed !== true) return null;
  const url = optionalText(value.url, 'source_input_image.url');
  const rightsStatement = optionalText(value.rights_statement, 'source_input_image.rights_statement');
  if (!url || !rightsStatement) return null;

  try {
    return {
      url: requireDatasetUrl(url, 'source_input_image.url'),
      rights_statement: rightsStatement,
    };
  } catch {
    return null;
  }
}

function parsePreviewUrls(value: unknown): string[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) throw new Error('Metadata field "preview_urls" must be an array.');
  return value.map((url, index) => requireDatasetUrl(url, `preview_urls[${index}]`));
}

export function parseReleaseMetadata(value: unknown, expectedId: string): ReleaseMetadata {
  if (!isRecord(value)) throw new Error('Release metadata must be a JSON object.');

  const id = optionalText(value.id, 'id');
  if (id && id !== expectedId) throw new Error('Release metadata ID does not match the asset.');
  const publishedAt = optionalText(value.published_at_utc, 'published_at_utc');
  if (publishedAt && Number.isNaN(Date.parse(publishedAt))) {
    throw new Error('Metadata field "published_at_utc" must be a date string.');
  }

  return {
    id,
    source: optionalText(value.source, 'source'),
    revision: optionalText(value.revision, 'revision'),
    published_at_utc: publishedAt,
    quality: optionalJson(value.quality, 'quality'),
    recipe: optionalJson(value.recipe, 'recipe'),
    preview_urls: parsePreviewUrls(value.preview_urls),
    source_input_image: parseSourceInputImage(value.source_input_image),
  };
}

export function parsePromptContent(value: string): string | null {
  const prompt = value.trim();
  return prompt || null;
}

export function parseRecipeContent(value: string): JsonValue | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    throw new Error('Recipe metadata is not valid JSON.');
  }
  if (!isJsonValue(parsed)) throw new Error('Recipe metadata must contain JSON data.');
  return parsed;
}

async function readResource<T>(
  url: string | null,
  parse: (text: string) => T | null,
  fetcher: Fetcher,
  signal?: AbortSignal,
): Promise<OptionalResource<T>> {
  if (!url) return { status: 'not-supplied' };

  try {
    const response = await fetcher(url, { signal });
    if (!response.ok) return { status: 'unavailable' };
    const text = await response.text();
    if (text.length > 1_000_000) return { status: 'unavailable' };
    const value = parse(text);
    return value === null ? { status: 'not-supplied' } : { status: 'available', value };
  } catch {
    if (signal?.aborted) throw new DOMException('Metadata read aborted.', 'AbortError');
    return { status: 'unavailable' };
  }
}

/** Detail-only reads stay optional and fail independently from the primary catalog. */
export async function loadAssetDetails(
  asset: CatalogAsset,
  fetcher: Fetcher = fetch,
  signal?: AbortSignal,
): Promise<AssetDetails> {
  const [release, prompt, recipe] = await Promise.all([
    readResource(
      asset.metadata_url,
      (text) => parseReleaseMetadata(JSON.parse(text), asset.id),
      fetcher,
      signal,
    ),
    readResource(asset.prompt_url, parsePromptContent, fetcher, signal),
    readResource(asset.settings_url, parseRecipeContent, fetcher, signal),
  ]);

  return { release, prompt, recipe };
}
