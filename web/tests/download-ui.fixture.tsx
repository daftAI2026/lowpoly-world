/**
 * [INPUT]: 依赖真实下载组件与合成流，不读取模型或写入本机文件。
 * [OUTPUT]: 导出浏览器专用测试装配与恢复函数。
 * [POS]: 仅供本地Vite交互验收；网站路由和构建不引用此文件。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { DownloadSelection } from '../src/components/download-selection';
import { createBusinessI18n } from '../src/lib/i18n';
import type { CatalogAsset } from '../src/lib/catalog';
import type { DownloadDirectory } from '../src/lib/directory-download';
export function mountDownloadFixture() {
  const originalFetch = window.fetch,
    originalPicker = Object.getOwnPropertyDescriptor(window, 'showDirectoryPicker');
  const writes: string[] = [],
    requests: string[] = [];
  let failedOnce = false;
  const directory = (parts: string[] = []): DownloadDirectory => ({
    async getDirectoryHandle(name) {
      return directory([...parts, name]);
    },
    async getFileHandle(name) {
      return {
        async createWritable() {
          return new WritableStream<Uint8Array>({
            async write() {
              await new Promise((resolve) => setTimeout(resolve, 100));
            },
            close() {
              writes.push([...parts, name].join('/'));
            },
          });
        },
      };
    },
  });
  Object.defineProperty(window, 'showDirectoryPicker', {
    configurable: true,
    value: async () => directory(),
  });
  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    if (url.includes('/api/datasets/daftAI2026/3d-assets/revision/main'))
      return new Response(JSON.stringify({ sha: 'a'.repeat(40) }), {
        headers: { 'content-type': 'application/json' },
      });
    if (/LPW-9000[12]/.test(url)) {
      requests.push(url);
      if (url.includes('LPW-90001') && url.endsWith('.blend') && !failedOnce) {
        failedOnce = true;
        return new Response('', { status: 503 });
      }
      const chunks = url.endsWith('.glb') ? 32 : 2;
      return new Response(
        new ReadableStream<Uint8Array>({
          start(controller) {
            for (let i = 0; i < chunks; i++) controller.enqueue(new Uint8Array([1, 2, 3]));
            controller.close();
          },
        }),
        { headers: { 'content-length': String(chunks * 3) } },
      );
    }
    return originalFetch(input, init);
  };
  const source = (n: number): CatalogAsset => ({
    id: `LPW-9000${n}`,
    name_en: `Fixture ${n}`,
    name_zh: `合成测试 ${n}`,
    glb_url: `https://huggingface.co/datasets/daftAI2026/3d-assets/resolve/main/assets/LPW-9000${n}/model.glb`,
    blend_url: `https://huggingface.co/datasets/daftAI2026/3d-assets/resolve/main/assets/LPW-9000${n}/model.blend`,
    preview_url: null,
    preview_urls: [],
    category: null,
    tags: [],
    triangles: null,
    vertices: null,
    dimensions_m: null,
    file_size_bytes: null,
    license: 'CC BY 4.0',
    source: null,
    source_sha256: 'b'.repeat(64),
    revision: null,
    published_at_utc: null,
    metadata_url: null,
    prompt_url: null,
    settings_url: null,
  });
  const host = document.createElement('div');
  host.id = 'download-ui-fixture';
  host.style.cssText =
    'position:fixed;inset:0;z-index:40;background:var(--background);padding:80px 24px;';
  document.body.appendChild(host);
  const root = createRoot(host);
  function Fixture() {
    const [assets, setAssets] = useState([source(1), source(2)]);
    return (
      <I18nextProvider i18n={createBusinessI18n('zh')}>
        <h1>TEST FIXTURE: 合成流，零模型和磁盘写入</h1>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <DownloadSelection
            assets={assets}
            locale="zh"
            onRemove={(id) => setAssets((value) => value.filter((asset) => asset.id !== id))}
            onClear={() => setAssets([])}
            onInspect={() => {}}
          />
        </div>
      </I18nextProvider>
    );
  }
  root.render(<Fixture />);
  return {
    writes,
    requests,
    restore() {
      root.unmount();
      host.remove();
      window.fetch = originalFetch;
      if (originalPicker) Object.defineProperty(window, 'showDirectoryPicker', originalPicker);
      else Reflect.deleteProperty(window, 'showDirectoryPicker');
    },
  };
}
