/**
 * [INPUT]: 依赖 shadcn/ui 官方源码、Base UI Input 与 React 表单属性。
 * [OUTPUT]: 导出文本与搜索输入的官方组件组合接口。
 * [POS]: 受控上游源码副本；来源与外观差异见 registry.sources.json，不包含业务状态；边线读取可见控件角色。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import * as React from 'react';
import { Input as InputPrimitive } from '@base-ui/react/input';
import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        'h-10 w-full min-w-0 rounded-lg border-[0.5px] border-control-border bg-transparent px-2.5 py-1 text-sm transition-none outline-none file:inline-flex file:h-10 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline focus-visible:outline-[0.5px] focus-visible:outline-ring  disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
