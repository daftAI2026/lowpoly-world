/**
 * [INPUT]: 依赖 shadcn/ui 官方源码、React 原生 textarea 与本地 cn。
 * [OUTPUT]: 导出只读下载命令文本的官方组件组合接口。
 * [POS]: 受控上游源码副本；来源与外观差异见 registry.sources.json，不包含业务状态。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import * as React from 'react';
import { cn } from '@/lib/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex field-sizing-content min-h-16 w-full rounded-lg border-[0.5px] border-input bg-transparent px-2.5 py-2 text-sm transition-none outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline focus-visible:outline-[0.5px] focus-visible:outline-ring  disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
