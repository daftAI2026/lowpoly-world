/**
 * [INPUT]: 依赖独立下载队列、合成资产与可控执行器，不请求网络或磁盘。
 * [OUTPUT]: 验证弹层解绑后继续、取消排队任务、局部重试与真实完成状态。
 * [POS]: 下载行为的生命周期回归，不把UI关闭当作任务取消。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { describe, it, expect } from 'vite-plus/test';
import { createDownloadQueue } from '../src/lib/download-queue.ts';
const revision = 'a'.repeat(40);
const asset = (id) => ({
  id,
  name_en: id,
  name_zh: '',
  glb_url: `https://huggingface.co/datasets/daftAI2026/3d-assets/resolve/main/assets/${id}/model.glb`,
  blend_url: `https://huggingface.co/datasets/daftAI2026/3d-assets/resolve/main/assets/${id}/model.blend`,
});
describe('Persistent download task store', () => {
  it('keeps downloading after the review subscriber closes', async () => {
    let finish, signal;
    const queue = createDownloadQueue(async (files, _revision, _directory, s) => {
      signal = s;
      await new Promise((resolve) => {
        finish = resolve;
      });
      return { completed: files.map((f) => f.path), failed: [], cancelled: false };
    });
    const initial = queue.getSnapshot();
    const off = queue.subscribe(() => {});
    const pending = queue.enqueue([asset('LPW-00001')], revision, {});
    expect(initial).toEqual([]);
    expect(queue.getSnapshot()[0].status).toBe('active');
    off();
    expect(signal.aborted).toBe(false);
    finish();
    await pending;
    expect(queue.getSnapshot()[0].status).toBe('complete');
  });
  it('does not execute cancelled queued assets', async () => {
    let finish,
      calls = 0;
    const queue = createDownloadQueue(async (files) => {
      calls++;
      await new Promise((r) => {
        finish = r;
      });
      return { completed: files.map((f) => f.path), failed: [], cancelled: false };
    });
    const pending = queue.enqueue([asset('LPW-00001'), asset('LPW-00002')], revision, {});
    queue.cancel(queue.getSnapshot()[1].key);
    finish();
    await pending;
    expect(calls).toBe(1);
    expect(queue.getSnapshot()[1].status).toBe('cancelled');
  });
  it('retries only files that did not complete', async () => {
    const seen = [];
    const queue = createDownloadQueue(async (files) => {
      seen.push(files.map((f) => f.path));
      return seen.length === 1
        ? { completed: [files[0].path], failed: [files[1].path], cancelled: false }
        : { completed: files.map((f) => f.path), failed: [], cancelled: false };
    });
    await queue.enqueue([asset('LPW-00001')], revision, {});
    const key = queue.getSnapshot()[0].key;
    expect(queue.getSnapshot()[0].status).toBe('failed');
    await queue.retry(key);
    expect(seen[1]).toEqual(['assets/LPW-00001/model.blend']);
    expect(queue.getSnapshot()[0].completed).toHaveLength(2);
    expect(queue.getSnapshot()[0].status).toBe('complete');
    queue.clearFinished();
    expect(queue.getSnapshot()).toEqual([]);
  });
});

describe('Reference interaction layers', () => {
  it('opens anchored review and a separate download dialog without an inline result panel', async () => {
    const { readFile } = await import('node:fs/promises');
    const read = (p) => readFile(new URL(p, import.meta.url), 'utf8');
    const review = await read('../src/components/download-selection.tsx');
    const browser = await read('../src/components/catalog-browser.tsx');
    expect(review).toContain('PopoverTrigger');
    expect(review).toContain('DownloadDialog');
    expect(review).toContain('DownloadTasks');
    expect(browser).not.toContain('review && !expanded');
  });
});

describe('Queued retry scheduling', () => {
  it('does not execute the original queued turn after a cancelled item is retried', async () => {
    let release;
    const calls = [];
    const queue = createDownloadQueue(async (files) => {
      calls.push(files[0].id);
      if (files[0].id === 'LPW-00001')
        await new Promise((resolve) => {
          release = resolve;
        });
      return { completed: files.map((file) => file.path), failed: [], cancelled: false };
    });
    const pending = queue.enqueue([asset('LPW-00001'), asset('LPW-00002')], revision, {});
    const second = queue.getSnapshot()[1].key;
    queue.cancel(second);
    await queue.retry(second);
    release();
    await pending;
    expect(calls).toEqual(['LPW-00001', 'LPW-00002']);
  });
});
