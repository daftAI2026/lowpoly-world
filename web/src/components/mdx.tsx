/**
 * [INPUT]: 依赖 Fumadocs 默认 MDX 组件和可选内容覆盖。
 * [OUTPUT]: 导出共享 MDX 组件集与 Fumadocs 全局组件类型。
 * [POS]: 文档页面的呈现适配层；不加入资产业务或站点状态。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
