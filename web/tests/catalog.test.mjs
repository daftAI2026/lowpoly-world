/**
 * [INPUT]: 依赖 Vite+ Vitest、Node crypto 与目录客户端公共读取函数。
 * [OUTPUT]: 覆盖目录指针、快照摘要、schema、计数、唯一 ID 和 URL 边界。
 * [POS]: web 数据协议离线回归；替换 fetch，不访问真实 Dataset。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { afterEach, describe, expect, it } from 'vite-plus/test';
import { createHash } from 'node:crypto';
import { loadPublicCatalog } from '../src/lib/catalog.ts';

const baseUrl = 'https://huggingface.co/datasets/daftAI2026/3d-assets/resolve/main/';
const pointerUrl = new URL('catalog/v1/latest.json', baseUrl).href;
const originalFetch = globalThis.fetch;

function requestUrl(input) {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

function makeAsset(overrides = {}) {
  const assetPrefix = `${baseUrl}assets/LPW-00001/`;
  return {
    id: 'LPW-00001',
    name_en: 'Lowpoly Cairn',
    name_zh: '低多边形石堆',
    category: 'Environment',
    revision: 'r1',
    source_sha256: 'a'.repeat(64),
    license: 'CC-BY-4.0',
    source: 'publisher note',
    tags: ['stone', 'environment'],
    triangles: 124,
    vertices: 96,
    dimensions_m: null,
    file_size_bytes: null,
    published_at_utc: null,
    glb_url: `${assetPrefix}model.glb`,
    blend_url: `${baseUrl}sources/LPW-00001/model.blend`,
    preview_url: `${baseUrl}previews/LPW-00001/cover.png`,
    preview_urls: [],
    metadata_url: `${baseUrl}metadata/LPW-00001/release.json`,
    prompt_url: `${baseUrl}metadata/LPW-00001/prompt.md`,
    settings_url: `${baseUrl}metadata/LPW-00001/recipe.json`,
    ...overrides,
  };
}

function makeSnapshot({ schema_version = 2, assets = [makeAsset()], count = assets.length } = {}) {
  return { schema_version, count, assets };
}

function installFixture({
  snapshot = makeSnapshot(),
  pointerOverrides = {},
  servedIndexBytes,
  pointerStatus = 200,
  indexStatus = 200,
} = {}) {
  const indexBytes = Buffer.from(JSON.stringify(snapshot));
  const indexSha256 = createHash('sha256').update(indexBytes).digest('hex');
  const pointer = {
    schema_version: 2,
    count: snapshot.count,
    index_path: `catalog/v1/releases/${indexSha256.slice(0, 20)}/catalog.json`,
    index_sha256: indexSha256,
    ...pointerOverrides,
  };
  const indexUrl = new URL(pointer.index_path, baseUrl).href;
  const calls = [];

  globalThis.fetch = async (input) => {
    const url = requestUrl(input);
    calls.push(url);
    if (url === pointerUrl) return Response.json(pointer, { status: pointerStatus });
    if (url === indexUrl) {
      return new Response(servedIndexBytes ?? indexBytes, { status: indexStatus });
    }
    return new Response(null, { status: 404 });
  };

  return { calls, indexBytes, pointer, indexUrl };
}

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe('public catalog contract', () => {
  it('treats a missing public pointer as an empty catalog', async () => {
    const calls = [];
    globalThis.fetch = async (input) => {
      calls.push(requestUrl(input));
      return new Response(null, { status: 404 });
    };

    expect(await loadPublicCatalog()).toBeNull();
    expect(calls).toEqual([pointerUrl]);
  });

  it('reports non-404 pointer HTTP failures', async () => {
    installFixture({ pointerStatus: 503 });
    await expect(loadPublicCatalog()).rejects.toThrow(/pointer request failed \(503\)/);
  });

  it('reports snapshot HTTP failures', async () => {
    installFixture({ indexStatus: 502 });
    await expect(loadPublicCatalog()).rejects.toThrow(/snapshot request failed \(502\)/);
  });

  it('rejects unsupported pointer schema versions', async () => {
    installFixture({ pointerOverrides: { schema_version: 1 } });
    await expect(loadPublicCatalog()).rejects.toThrow(/Unsupported catalog schema version/);
  });

  it('rejects unsupported snapshot schema versions', async () => {
    installFixture({ snapshot: makeSnapshot({ schema_version: 1 }) });
    await expect(loadPublicCatalog()).rejects.toThrow(/Unsupported catalog schema version/);
  });

  it('rejects missing required asset identity and source hash fields', async () => {
    const invalidAssets = [
      makeAsset({ id: '' }),
      makeAsset({ name_en: '' }),
      makeAsset({ source_sha256: 'not-a-hash' }),
      makeAsset({ name_zh: 12 }),
    ];

    for (const asset of invalidAssets) {
      installFixture({ snapshot: makeSnapshot({ assets: [asset] }) });
      await expect(loadPublicCatalog()).rejects.toThrow();
    }
  });

  it('rejects pointer and snapshot count mismatches', async () => {
    installFixture({ pointerOverrides: { count: 2 } });
    await expect(loadPublicCatalog()).rejects.toThrow(/count does not match/);
  });

  it('rejects a count that does not match the asset array', async () => {
    installFixture({ snapshot: makeSnapshot({ count: 2, assets: [makeAsset()] }) });
    await expect(loadPublicCatalog()).rejects.toThrow(/count does not match/);
  });

  it('rejects duplicate asset IDs', async () => {
    const first = makeAsset();
    const second = makeAsset({ name_en: 'Duplicate ID' });
    installFixture({ snapshot: makeSnapshot({ assets: [first, second] }) });
    await expect(loadPublicCatalog()).rejects.toThrow(/duplicate asset IDs/);
  });

  it('rejects an index path outside its content hash', async () => {
    installFixture({ pointerOverrides: { index_path: 'catalog/v1/releases/unsafe/catalog.json' } });
    await expect(loadPublicCatalog()).rejects.toThrow(/unsafe index path/);
  });

  it('rejects a snapshot whose bytes do not match the pointer SHA256', async () => {
    const fixture = installFixture();
    const tamperedBytes = Buffer.concat([fixture.indexBytes, Buffer.from(' ')]);
    installFixture({ servedIndexBytes: tamperedBytes });
    await expect(loadPublicCatalog()).rejects.toThrow(/SHA256 does not match/);
  });

  it('rejects asset URLs outside HTTPS and the configured Dataset', async () => {
    const invalidUrls = [
      'http://huggingface.co/datasets/daftAI2026/3d-assets/resolve/main/model.glb',
      'https://huggingface.co:8443/datasets/daftAI2026/3d-assets/resolve/main/model.glb',
      'https://user:secret@huggingface.co/datasets/daftAI2026/3d-assets/resolve/main/model.glb',
      'https://huggingface.co/datasets/daftAI2026/3d-assets/resolve/main/%2e%2e%2fother/model.glb',
      'https://example.org/model.glb',
      'https://huggingface.co/datasets/other/assets/resolve/main/model.glb',
    ];

    for (const glbUrl of invalidUrls) {
      installFixture({ snapshot: makeSnapshot({ assets: [makeAsset({ glb_url: glbUrl })] }) });
      await expect(loadPublicCatalog()).rejects.toThrow(/must point to the public Dataset/);
    }
  });

  it('treats missing optional metadata as not supplied without weakening URL checks', async () => {
    installFixture({
      snapshot: makeSnapshot({
        assets: [makeAsset({
          category: undefined,
          revision: undefined,
          license: undefined,
          source: undefined,
          tags: undefined,
          triangles: undefined,
          dimensions_m: undefined,
          file_size_bytes: undefined,
          published_at_utc: undefined,
          preview_url: undefined,
          preview_urls: undefined,
          metadata_url: undefined,
          prompt_url: undefined,
          settings_url: undefined,
        })],
      }),
    });

    const catalog = await loadPublicCatalog();
    expect(catalog?.assets[0]).toMatchObject({
      category: null,
      revision: null,
      license: null,
      source: null,
      tags: [],
      triangles: null,
      dimensions_m: null,
      file_size_bytes: null,
      published_at_utc: null,
      preview_url: null,
      preview_urls: [],
      metadata_url: null,
      prompt_url: null,
      settings_url: null,
    });
  });

  it('rejects invalid dimensions, file sizes, timestamps and preview URLs', async () => {
    const invalidAssets = [
      makeAsset({ dimensions_m: [1, 2] }),
      makeAsset({ file_size_bytes: -1 }),
      makeAsset({ published_at_utc: 'not a timestamp' }),
      makeAsset({ preview_urls: ['https://example.org/image.png'] }),
    ];

    for (const asset of invalidAssets) {
      installFixture({ snapshot: makeSnapshot({ assets: [asset] }) });
      await expect(loadPublicCatalog()).rejects.toThrow();
    }
  });

  it('treats a valid zero-asset snapshot as empty', async () => {
    installFixture({ snapshot: makeSnapshot({ assets: [], count: 0 }) });
    expect(await loadPublicCatalog()).toBeNull();
  });

  it('returns a correctly hashed and validated public catalog', async () => {
    const snapshot = makeSnapshot();
    const fixture = installFixture({ snapshot });

    expect(await loadPublicCatalog()).toEqual(snapshot);
    expect(fixture.calls).toEqual([pointerUrl, fixture.indexUrl]);
  });
});
