/**
 * [INPUT]: 依赖纯 URL、筛选与下载协议；仅使用离线合成记录。
 * [OUTPUT]: 验证状态往返、非法参数与固定 HF commit 下载。
 * [POS]: 完整浏览工作区的协议回归；不写远端或下载模型。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { describe, it, expect } from 'vite-plus/test';
import {
  parseWorkspace,
  serializeWorkspace,
  defaultWorkspace,
} from '../src/lib/workspace-state.ts';
import { downloadFiles, downloadCommands } from '../src/lib/asset-downloads.ts';
import { filterAndSortAssets } from '../src/lib/catalog-view.ts';
describe('Workspace URL contract', () => {
  it('round trips every browsing dimension independently from download selection', () => {
    const s = parseWorkspace(
      '?q=桌子&category=Props%2FFurniture&format=glb&format=blend&tag=wood&triangles=under-5k&license=cc-by-4.0&source=own&dimension=under-1m&preview=1&sort=name-asc&view=list&density=large&asset=LPW-00799&dock=left&expanded=1&selected=LPW-00800&selected=LPW-00801',
    );
    expect(parseWorkspace(serializeWorkspace(s))).toEqual(s);
    expect(s.selected).not.toContain(s.asset);
    expect(s.filters.query).toBe('桌子');
  });
  it('accepts TanStack JSON arrays and repeated query keys', () => {
    const s = parseWorkspace(
      '?format=%5B%22glb%22%2C%22blend%22%5D&selected=%5B%22LPW-00799%22%2C%22LPW-00800%22%5D',
    );
    expect(s.filters.formats).toEqual(['blend', 'glb']);
    expect(s.selected).toEqual(['LPW-00799', 'LPW-00800']);
  });
  it('compresses bulk selections without silently truncating the published scope', () => {
    const s = defaultWorkspace();
    s.selected = Array.from({ length: 988 }, (_, i) => `LPW-${String(i + 1).padStart(5, '0')}`);
    const url = serializeWorkspace(s);
    expect(url.length).toBeLessThan(40);
    expect(parseWorkspace(url).selected).toEqual(s.selected);
    expect(parseWorkspace('?selection=0-zzzzzzzz').selected).toEqual([]);
  });
  it('ignores invalid enums and IDs, deduplicates selection and gates expansion', () => {
    const s = parseWorkspace(
      '?view=evil&dock=x&sort=x&expanded=1&asset=private&selected=LPW-00799&selected=LPW-00799&selected=../../key',
    );
    expect(s.view).toBe('grid');
    expect(s.dock).toBe('right');
    expect(s.expanded).toBe(false);
    expect(s.selected).toEqual(['LPW-00799']);
    expect(serializeWorkspace(defaultWorkspace())).toBe('');
  });
});
describe('Published files only', () => {
  const asset = {
    id: 'LPW-00799',
    glb_url:
      'https://huggingface.co/datasets/daftAI2026/lowpoly-world-assets/resolve/main/assets/LPW-00799/abc/model.glb',
    blend_url: null,
  };
  const sha = 'b'.repeat(40);
  it('uses the Dataset commit, never the source hash or asset revision', () => {
    const files = downloadFiles([asset], sha);
    expect(files).toHaveLength(1);
    expect(files[0].url).toContain(`/resolve/${sha}/`);
    expect(downloadCommands(files, sha)).toContain(`--revision ${sha}`);
    expect(() => downloadFiles([asset], 'a'.repeat(64))).toThrow();
    expect(() =>
      downloadFiles([{ ...asset, glb_url: 'https://evil.test/model.glb' }], sha),
    ).toThrow();
  });
  it('refuses shell/glob paths and does not invent missing files', () => {
    expect(() =>
      downloadFiles([{ ...asset, glb_url: asset.glb_url.replace('model.glb', '*.glb') }], sha),
    ).toThrow();
    expect(downloadFiles([{ ...asset, glb_url: null }], sha)).toEqual([]);
  });
});
describe('Real metadata filters', () => {
  const base = {
    id: 'LPW-00001',
    name_en: 'x',
    name_zh: '',
    category: null,
    tags: [],
    license: 'cc-by-4.0',
    source: 'own',
    triangles: 5,
    dimensions_m: [0.5, 0.8, 0.3],
    glb_url: 'x',
    preview_url: null,
  };
  it('combines license, source, dimensions and preview without matching unknown data', () => {
    const f = {
      ...defaultWorkspace().filters,
      license: 'cc-by-4.0',
      source: 'own',
      dimension: 'under-1m',
      withPreview: true,
    };
    expect(
      filterAndSortAssets(
        [base, { ...base, id: 'LPW-00002', dimensions_m: null }],
        f,
        'id-asc',
        'en',
      ),
    ).toEqual([base]);
    expect(filterAndSortAssets([base], { ...f, dimension: '1m-plus' }, 'id-asc', 'en')).toEqual([]);
  });
  it('places unknown triangle counts last in descending order too', () => {
    expect(
      filterAndSortAssets(
        [
          { ...base, id: 'a', triangles: null },
          { ...base, id: 'b' },
        ],
        defaultWorkspace().filters,
        'triangles-desc',
        'en',
      )[1].triangles,
    ).toBeNull();
  });
});
