/**
 * [INPUT]: 依赖 shadcn/ui 官方源码、Base UI Checkbox 与 Lucide 图标。
 * [OUTPUT]: 导出独立勾选与筛选布尔值的官方组件组合接口。
 * [POS]: 受控上游源码副本；来源与外观差异见 registry.sources.json，不包含业务状态；边线读取可见控件角色。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
'use client';

import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox';
import { cn } from '@/lib/utils';

import { CheckIcon, MinusIcon } from 'lucide-react';

function Checkbox({ className, indeterminate, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      indeterminate={indeterminate}
      className={cn(
        'peer relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border-[0.5px] border-muted-foreground transition-none outline-none group-has-disabled/field:opacity-50 group-has-[:focus-visible]/field-label:ring-0 group-has-[:focus-visible]/field-label:not-data-checked:border-control-border after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:outline focus-visible:outline-[0.5px] focus-visible:outline-ring  disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground data-indeterminate:border-primary data-indeterminate:bg-primary data-indeterminate:text-primary-foreground group-has-[:focus-visible]/field-label:data-checked:border-primary dark:data-checked:bg-primary dark:data-indeterminate:bg-primary',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none [&>svg]:size-3.5"
      >
        {indeterminate ? <MinusIcon /> : <CheckIcon />}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
