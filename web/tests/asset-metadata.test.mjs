/**
 * [INPUT]: 依赖可选元数据解析器与测试专用本地 fixture。
 * [OUTPUT]: 覆盖权利确认、资源失败隔离和 JSON recipe 边界。
 * [POS]: 详情第二数据边界回归；不请求真实 Dataset 或私人资源。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { describe, expect, it } from 'vite-plus/test';
import {
  loadAssetDetails,
  parsePromptContent,
  parseRecipeContent,
  parseReleaseMetadata,
} from '../src/lib/asset-metadata.ts';

const baseUrl = 'https://huggingface.co/datasets/daftAI2026/lowpoly-world-assets/resolve/main/';
const sourceUrl = `${baseUrl}source-input/LPW-00001.png`;

function catalogAsset(overrides = {}) {
  return {
    id: 'LPW-00001',
    name_en: 'Fixture Asset',
    name_zh: '',
    category: null,
    revision: null,
    source_sha256: 'a'.repeat(64),
    license: null,
    source: null,
    tags: [],
    triangles: null,
    vertices: null,
    dimensions_m: null,
    file_size_bytes: null,
    published_at_utc: null,
    glb_url: null,
    blend_url: null,
    preview_url: null,
    preview_urls: [],
    metadata_url: `${baseUrl}metadata/LPW-00001/release.json`,
    prompt_url: `${baseUrl}metadata/LPW-00001/prompt.md`,
    settings_url: `${baseUrl}metadata/LPW-00001/recipe.json`,
    ...overrides,
  };
}

describe('optional asset metadata', () => {
  it('shows source input only with a safe Dataset URL and explicit rights evidence', () => {
    const confirmed = parseReleaseMetadata({
      id: 'LPW-00001',
      source_input_image: {
        url: sourceUrl,
        rights_confirmed: true,
        rights_statement: 'The publisher confirms the image can be displayed.',
      },
    }, 'LPW-00001');
    const unconfirmed = parseReleaseMetadata({
      source_input_image: {
        url: sourceUrl,
        rights_confirmed: false,
        rights_statement: 'Not enough.',
      },
    }, 'LPW-00001');
    const external = parseReleaseMetadata({
      source_input_image: {
        url: 'https://example.org/image.png',
        rights_confirmed: true,
        rights_statement: 'Confirmed elsewhere.',
      },
    }, 'LPW-00001');

    expect(confirmed.source_input_image).toEqual({
      url: sourceUrl,
      rights_statement: 'The publisher confirms the image can be displayed.',
    });
    expect(unconfirmed.source_input_image).toBeNull();
    expect(external.source_input_image).toBeNull();
  });

  it('rejects mismatched metadata IDs and invalid timestamps', () => {
    expect(() => parseReleaseMetadata({ id: 'LPW-99999' }, 'LPW-00001'))
      .toThrow(/does not match/);
    expect(() => parseReleaseMetadata({ published_at_utc: 'not a date' }, 'LPW-00001'))
      .toThrow(/date string/);
    expect(() => parseReleaseMetadata({ preview_urls: ['https://example.org/preview.png'] }, 'LPW-00001'))
      .toThrow(/public Dataset/);
  });

  it('preserves false and zero metadata values instead of calling them missing', () => {
    const release = parseReleaseMetadata({ id: 'LPW-00001', quality: false, recipe: 0 }, 'LPW-00001');
    expect(release.quality).toBe(false);
    expect(release.recipe).toBe(0);
  });

  it('parses optional prompt and recipe content without inventing defaults', () => {
    expect(parsePromptContent('  ')).toBeNull();
    expect(parsePromptContent('  make a lowpoly stone  ')).toBe('make a lowpoly stone');
    expect(parseRecipeContent('')).toBeNull();
    expect(parseRecipeContent('{"steps":2}')).toEqual({ steps: 2 });
    expect(() => parseRecipeContent('{broken')).toThrow(/valid JSON/);
  });

  it('loads detail resources independently and retains unavailable state', async () => {
    const asset = catalogAsset();
    const fetcher = async (input) => {
      const url = String(input);
      if (url === asset.metadata_url) {
        return Response.json({ id: asset.id, recipe: false, quality: 0 });
      }
      if (url === asset.prompt_url) return new Response('  prompt text  ');
      return new Response(null, { status: 503 });
    };

    const details = await loadAssetDetails(asset, fetcher);
    expect(details.release.status).toBe('available');
    expect(details.release.value.recipe).toBe(false);
    expect(details.release.value.quality).toBe(0);
    expect(details.prompt).toEqual({ status: 'available', value: 'prompt text' });
    expect(details.recipe).toEqual({ status: 'unavailable' });
  });

  it('marks absent metadata URLs as not supplied without fetching', async () => {
    const fetcher = async () => {
      throw new Error('unexpected request');
    };
    const details = await loadAssetDetails(catalogAsset({
      metadata_url: null,
      prompt_url: null,
      settings_url: null,
    }), fetcher);
    expect(details).toEqual({
      release: { status: 'not-supplied' },
      prompt: { status: 'not-supplied' },
      recipe: { status: 'not-supplied' },
    });
  });
});
