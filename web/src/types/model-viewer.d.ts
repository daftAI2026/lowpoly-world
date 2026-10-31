/**
 * [INPUT]: 依赖 @google/model-viewer 导出的 Web Component 类型和 React JSX。
 * [OUTPUT]: 扩展 JSX 对 `<model-viewer>` 官方常用属性的类型声明。
 * [POS]: 浏览器组件声明边界；不注册自定义元素或执行运行时代码。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import type { ModelViewerElement } from '@google/model-viewer';
import type { DetailedHTMLProps, HTMLAttributes } from 'react';

type ModelViewerAttributes = DetailedHTMLProps<
  HTMLAttributes<ModelViewerElement>,
  ModelViewerElement
> & {
  src: string;
  alt?: string;
  poster?: string;
  loading?: 'eager' | 'lazy';
  reveal?: 'auto' | 'manual';
  'camera-controls'?: boolean;
  'auto-rotate'?: boolean;
  'auto-rotate-delay'?: string | number;
  'rotation-per-second'?: string;
  'interaction-prompt'?: 'auto' | 'none';
  'touch-action'?: 'pan-y' | 'pan-x' | 'none';
  'camera-orbit'?: string;
  'camera-target'?: string;
  'field-of-view'?: string;
  exposure?: string | number;
};

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': ModelViewerAttributes;
    }
  }
}
