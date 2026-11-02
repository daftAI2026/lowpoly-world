/**
 * [INPUT]: 依赖目录下载执行器、合成流与内存目录，不使用模型或磁盘权限。
 * [OUTPUT]: 验证固定版本、流式关闭、失败隔离、取消和越界拒绝。
 * [POS]: 用户批量保存动作的离线执行契约。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { describe, it, expect } from 'vite-plus/test';
import { downloadToDirectory } from '../src/lib/directory-download.ts';
const revision = 'a'.repeat(40);
const file = (path) => ({
  id: 'LPW-00001',
  format: 'GLB',
  path,
  url: `https://huggingface.co/datasets/daftAI2026/3d-assets/resolve/${revision}/${path}`,
});
function memoryDirectory() {
  const written = [],
    folders = [];
  const directory = {
    async getDirectoryHandle(name) {
      folders.push(name);
      return directory;
    },
    async getFileHandle(name) {
      return {
        async createWritable() {
          return new WritableStream({
            close() {
              written.push(name);
            },
          });
        },
      };
    },
  };
  return { directory, written, folders };
}
describe('Streamed directory downloads', () => {
  it('writes each file at the pinned revision and records completion only after close', async () => {
    const { directory, written, folders } = memoryDirectory();
    const events = [];
    const result = await downloadToDirectory(
      [file('assets/a/model.glb')],
      revision,
      directory,
      new AbortController().signal,
      (progress) => events.push(progress),
      async (url, options) => {
        expect(url).toContain(`/resolve/${revision}/`);
        expect(options.credentials).toBe('omit');
        expect(written).toEqual([]);
        return new Response('fixture');
      },
    );
    expect(written).toEqual(['model.glb']);
    expect(folders[0]).toBe(`lowpoly-world-${revision}`);
    expect(result.completed).toEqual(['assets/a/model.glb']);
    expect(events.at(-1).completed).toEqual(result.completed);
  });
  it('continues after HTTP failure without marking it saved', async () => {
    const { directory, written } = memoryDirectory();
    let calls = 0;
    const result = await downloadToDirectory(
      [file('a.glb'), file('b.glb')],
      revision,
      directory,
      new AbortController().signal,
      () => {},
      async () => (++calls === 1 ? new Response('', { status: 503 }) : new Response('fixture')),
    );
    expect(result.failed).toEqual(['a.glb']);
    expect(result.completed).toEqual(['b.glb']);
    expect(written).toEqual(['b.glb']);
  });
  it('stops an aborted batch without claiming remaining files failed or completed', async () => {
    const { directory } = memoryDirectory();
    const controller = new AbortController();
    controller.abort();
    const result = await downloadToDirectory(
      [file('a.glb')],
      revision,
      directory,
      controller.signal,
      () => {},
      async () => {
        throw new Error('must not fetch');
      },
    );
    expect(result).toEqual({ completed: [], failed: [], cancelled: true });
  });
  it('rejects path traversal and foreign URLs before making any directory', async () => {
    for (const value of [
      file('../model.glb'),
      { ...file('a.glb'), url: 'https://example.com/a.glb' },
      { ...file('a.glb'), url: file('a.glb').url.replace('https://', 'https://user:pass@') },
    ]) {
      const { directory, folders } = memoryDirectory();
      await expect(
        downloadToDirectory([value], revision, directory, new AbortController().signal, () => {}),
      ).rejects.toThrow();
      expect(folders).toEqual([]);
    }
  });
});
