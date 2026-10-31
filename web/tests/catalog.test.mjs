/**
 * [INPUT]: 依赖 Node 内置测试器、crypto 与目录客户端的公共读取函数。
 * [OUTPUT]: 覆盖目录指针、快照摘要、schema、计数、唯一 ID 和 URL 边界。
 * [POS]: web 数据协议的离线回归；替换 fetch，不访问真实 Dataset。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { afterEach, it } from 'node:test';
import { loadPublicCatalog } from '../src/lib/catalog.ts';

const baseUrl = 'https://huggingface.co/datasets/daftAI2026/3d-assets/resolve/main/';
const pointerUrl = new URL('catalog/v1/latest.json', baseUrl).href;
const originalFetch = globalThis.fetch;

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
    source: 'google-drive',
    tags: ['stone', 'environment'],
    triangles: 124,
    vertices: 96,
    glb_url: `${assetPrefix}model.glb`,
    blend_url: `${baseUrl}sources/LPW-00001/model.blend`,
    preview_url: `${baseUrl}previews/LPW-00001/cover.png`,
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
    const url = String(input);
    calls.push(url);
    if (url === pointerUrl) {
      return Response.json(pointer, { status: pointerStatus });
    }
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

it('treats a missing public pointer as an empty catalog', async () => {
  const calls = [];
  globalThis.fetch = async (input) => {
    calls.push(String(input));
    return new Response(null, { status: 404 });
  };

  assert.equal(await loadPublicCatalog(), null);
  assert.deepEqual(calls, [pointerUrl]);
});

it('reports non-404 pointer HTTP failures', async () => {
  installFixture({ pointerStatus: 503 });
  await assert.rejects(loadPublicCatalog(), /pointer request failed \(503\)/);
});

it('reports snapshot HTTP failures', async () => {
  installFixture({ indexStatus: 502 });
  await assert.rejects(loadPublicCatalog(), /snapshot request failed \(502\)/);
});

it('rejects unsupported pointer schema versions', async () => {
  installFixture({ pointerOverrides: { schema_version: 1 } });
  await assert.rejects(loadPublicCatalog(), /Unsupported catalog schema version/);
});

it('rejects unsupported snapshot schema versions', async () => {
  installFixture({ snapshot: makeSnapshot({ schema_version: 1 }) });
  await assert.rejects(loadPublicCatalog(), /Unsupported catalog schema version/);
});

it('rejects pointer and snapshot count mismatches', async () => {
  installFixture({ pointerOverrides: { count: 2 } });
  await assert.rejects(loadPublicCatalog(), /count does not match/);
});

it('rejects a count that does not match the asset array', async () => {
  installFixture({ snapshot: makeSnapshot({ count: 2, assets: [makeAsset()] }) });
  await assert.rejects(loadPublicCatalog(), /count does not match/);
});

it('rejects duplicate asset IDs', async () => {
  const first = makeAsset();
  const second = makeAsset({ name_en: 'Duplicate ID' });
  installFixture({ snapshot: makeSnapshot({ assets: [first, second] }) });
  await assert.rejects(loadPublicCatalog(), /duplicate asset IDs/);
});

it('rejects an index path outside its content hash', async () => {
  installFixture({ pointerOverrides: { index_path: 'catalog/v1/releases/unsafe/catalog.json' } });
  await assert.rejects(loadPublicCatalog(), /unsafe index path/);
});

it('rejects a snapshot whose bytes do not match the pointer SHA256', async () => {
  const fixture = installFixture();
  const tamperedBytes = Buffer.concat([fixture.indexBytes, Buffer.from(' ') ]);
  installFixture({ servedIndexBytes: tamperedBytes });

  await assert.rejects(loadPublicCatalog(), /SHA256 does not match/);
});

it('rejects asset URLs outside HTTPS and the configured Dataset', async () => {
  const invalidUrls = [
    'http://huggingface.co/datasets/daftAI2026/3d-assets/resolve/main/model.glb',
    'https://example.org/model.glb',
    'https://huggingface.co/datasets/other/assets/resolve/main/model.glb',
  ];

  for (const glbUrl of invalidUrls) {
    installFixture({ snapshot: makeSnapshot({ assets: [makeAsset({ glb_url: glbUrl })] }) });
    await assert.rejects(loadPublicCatalog(), /must point to the public Dataset/);
  }
});

it('treats a valid zero-asset snapshot as empty', async () => {
  installFixture({ snapshot: makeSnapshot({ assets: [], count: 0 }) });
  assert.equal(await loadPublicCatalog(), null);
});

it('returns a correctly hashed and validated public catalog', async () => {
  const snapshot = makeSnapshot();
  const fixture = installFixture({ snapshot });

  assert.deepEqual(await loadPublicCatalog(), snapshot);
  assert.deepEqual(fixture.calls, [pointerUrl, fixture.indexUrl]);
});
