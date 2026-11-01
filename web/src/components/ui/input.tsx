/**
 * [INPUT]: 依赖 React 原生 input 类型与本地 cn 样式组合。
 * [OUTPUT]: 导出资产筛选输入框外观和标准 HTML 表单属性。
 * [POS]: 搜索与筛选表单底座；不创建输入状态或数据请求。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type InputProps = ComponentProps<'input'>;

export function Input({ className, type = 'text', ...props }: InputProps) {
  return (
    <input
      data-slot="input"
      type={type}
      className={cn('ui-input', className)}
      {...props}
    />
  );
}
