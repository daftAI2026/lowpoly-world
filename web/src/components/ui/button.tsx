/**
 * [INPUT]: 依赖 Base UI Button、CVA 变体和本地 cn 样式组合。
 * [OUTPUT]: 导出统一的 shadcn/Base UI 按钮和语义化变体。
 * [POS]: 可复用交互底座；链接继续使用原生 anchor 保留导航语义。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = cva('ui-button', {
  variants: {
    variant: {
      primary: 'ui-button-primary',
      secondary: 'ui-button-secondary',
      ghost: 'ui-button-ghost',
    },
    size: {
      sm: 'ui-button-sm',
      md: 'ui-button-md',
      icon: 'ui-button-icon',
    },
  },
  defaultVariants: {
    variant: 'secondary',
    size: 'md',
  },
});

export type ButtonProps = Omit<ComponentProps<typeof ButtonPrimitive>, 'className'> &
  VariantProps<typeof buttonVariants> & { className?: string };

export function Button({
  className,
  variant = 'secondary',
  size = 'md',
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
