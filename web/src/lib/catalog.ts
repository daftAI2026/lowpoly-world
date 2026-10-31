/**
 * [INPUT]: 读取公开 Dataset 的 V2 latest 指针与不可变目录快照。
 * [OUTPUT]: 导出目录资产类型和带 SHA256 校验的浏览器读取函数。
 * [POS]: web 的唯一资产数据边界；不加载模型文件，不访问 Space 写接口。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
export const DATASET_REPO_ID = 'daftAI2026/3d-assets';

const DATASET_BASE_URL =
  `https://huggingface.co/datasets/${DATASET_REPO_ID}/resolve/main/`;
const DATASET_PATH_PREFIX = new URL(DATASET_BASE_URL).pathname;
const POINTER_URL = new URL('catalog/v1/latest.json', DATASET_BASE_URL).href;
const INDEX_PATH_PATTERN = /^catalog\/v1\/releases\/[a-f0-9]{20}\/catalog\.json$/;
const SHA256_PATTERN = /^[a-f0-9]{64}$/;

export type CatalogAsset = {
  id: string;
  name_en: string;
  name_zh: string;
  category: string;
  revision: string;
  source_sha256: string;
  license: string;
  source: string;
  tags: string[];
  triangles: number | null;
  vertices: number | null;
  glb_url: string;
  blend_url: string;
  preview_url: string;
  metadata_url: string;
  prompt_url: string;
  settings_url: string;
};

export type Catalog = {
  schema_version: 2;
  count: number;
  assets: CatalogAsset[];
};

type LatestPointer = {
  schema_version: 2;
  count: number;
  index_path: string;
  index_sha256: string;
};

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Catalog field "${field}" must be a non-empty string.`);
  }
  return value;
}

function requireCount(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) {
    throw new Error(`Catalog field "${field}" must be a non-negative integer.`);
  }
  return value;
}

function requireDatasetUrl(value: unknown, field: string): string {
  const url = requireString(value, field);
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`Catalog field "${field}" must be a valid URL.`);
  }

  if (
    parsed.protocol !== 'https:' ||
    parsed.hostname !== 'huggingface.co' ||
    !parsed.pathname.startsWith(DATASET_PATH_PREFIX)
  ) {
    throw new Error(`Catalog field "${field}" must point to the public Dataset.`);
  }
  return parsed.href;
}

function parsePointer(value: unknown): LatestPointer {
  if (!isRecord(value)) throw new Error('Catalog pointer must be a JSON object.');

  const schemaVersion = value.schema_version;
  const count = requireCount(value.count, 'count');
  const indexPath = requireString(value.index_path, 'index_path');
  const indexSha256 = requireString(value.index_sha256, 'index_sha256');

  if (schemaVersion !== 2) throw new Error('Unsupported catalog schema version.');
  if (!SHA256_PATTERN.test(indexSha256)) throw new Error('Catalog pointer has an invalid SHA256.');
  if (!INDEX_PATH_PATTERN.test(indexPath)) throw new Error('Catalog pointer has an unsafe index path.');
  if (indexPath !== `catalog/v1/releases/${indexSha256.slice(0, 20)}/catalog.json`) {
    throw new Error('Catalog pointer path does not match its SHA256.');
  }

  return {
    schema_version: 2,
    count,
    index_path: indexPath,
    index_sha256: indexSha256,
  };
}

function requireOptionalCount(value: unknown, field: string): number | null {
  if (value === null) return null;
  return requireCount(value, field);
}

function parseAsset(value: unknown): CatalogAsset {
  if (!isRecord(value)) throw new Error('Every catalog asset must be a JSON object.');

  const sha256 = requireString(value.source_sha256, 'source_sha256');
  if (!SHA256_PATTERN.test(sha256)) throw new Error('Catalog asset has an invalid source SHA256.');
  if (!Array.isArray(value.tags) || !value.tags.every((tag) => typeof tag === 'string')) {
    throw new Error('Catalog asset tags must be an array of strings.');
  }

  return {
    id: requireString(value.id, 'id'),
    name_en: requireString(value.name_en, 'name_en'),
    name_zh: typeof value.name_zh === 'string' ? value.name_zh : '',
    category: requireString(value.category, 'category'),
    revision: typeof value.revision === 'string' ? value.revision : '',
    source_sha256: sha256,
    license: requireString(value.license, 'license'),
    source: requireString(value.source, 'source'),
    tags: value.tags,
    triangles: requireOptionalCount(value.triangles, 'triangles'),
    vertices: requireOptionalCount(value.vertices, 'vertices'),
    glb_url: requireDatasetUrl(value.glb_url, 'glb_url'),
    blend_url: requireDatasetUrl(value.blend_url, 'blend_url'),
    preview_url: requireDatasetUrl(value.preview_url, 'preview_url'),
    metadata_url: requireDatasetUrl(value.metadata_url, 'metadata_url'),
    prompt_url: requireDatasetUrl(value.prompt_url, 'prompt_url'),
    settings_url: requireDatasetUrl(value.settings_url, 'settings_url'),
  };
}

function parseCatalog(value: unknown, pointerCount: number): Catalog {
  if (!isRecord(value)) throw new Error('Catalog snapshot must be a JSON object.');
  if (value.schema_version !== 2) throw new Error('Unsupported catalog schema version.');
  if (!Array.isArray(value.assets)) throw new Error('Catalog assets must be an array.');

  const count = requireCount(value.count, 'count');
  if (count !== pointerCount || count !== value.assets.length) {
    throw new Error('Catalog pointer count does not match the snapshot.');
  }

  const assets = value.assets.map(parseAsset);
  const ids = new Set(assets.map((asset) => asset.id));
  if (ids.size !== assets.length) throw new Error('Catalog contains duplicate asset IDs.');

  return { schema_version: 2, count, assets };
}

async function sha256Hex(bytes: ArrayBuffer): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    throw new Error('This browser cannot verify the catalog SHA256.');
  }
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function readJson(response: Response, label: string): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new Error(`${label} is not valid JSON.`);
  }
}

/** 缺少 latest 指针表示尚无可展示目录；其他失败都保留为错误态。 */
export async function loadPublicCatalog(signal?: AbortSignal): Promise<Catalog | null> {
  const pointerResponse = await fetch(POINTER_URL, {
    cache: 'no-store',
    signal,
  });
  if (pointerResponse.status === 404) return null;
  if (!pointerResponse.ok) {
    throw new Error(`Catalog pointer request failed (${pointerResponse.status}).`);
  }

  const pointer = parsePointer(await readJson(pointerResponse, 'Catalog pointer'));
  const indexUrl = new URL(pointer.index_path, DATASET_BASE_URL).href;
  const indexResponse = await fetch(indexUrl, { signal });
  if (!indexResponse.ok) {
    throw new Error(`Catalog snapshot request failed (${indexResponse.status}).`);
  }

  const bytes = await indexResponse.arrayBuffer();
  if ((await sha256Hex(bytes)) !== pointer.index_sha256) {
    throw new Error('Catalog snapshot SHA256 does not match its pointer.');
  }

  const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  let snapshot: unknown;
  try {
    snapshot = JSON.parse(text);
  } catch {
    throw new Error('Catalog snapshot is not valid JSON.');
  }

  const catalog = parseCatalog(snapshot, pointer.count);
  return catalog.count === 0 ? null : catalog;
}
