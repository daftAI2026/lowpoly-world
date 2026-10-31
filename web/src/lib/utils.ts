/**
 * [INPUT]: 依赖 clsx 条件类名和 tailwind-merge 冲突合并。
 * [OUTPUT]: 导出供本地 shadcn/Base UI 组件使用的 cn 函数。
 * [POS]: 样式组合唯一入口；不保存业务状态或页面语义。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
