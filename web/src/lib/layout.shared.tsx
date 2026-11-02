/**
 * [INPUT]: 依赖 Fumadocs 原生 links、URL locale、站点身份和 HF 图标。
 * [OUTPUT]: 导出右上角页面互跳、原生明暗切换与 GitHub/HF 外链。
 * [POS]: 展示应用唯一导航配置；不替换模板 header 或菜单。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { BookOpen, Boxes } from 'lucide-react';
import { HuggingFaceIcon } from '@/components/hugging-face-icon';
import { DATASET_REPO_ID } from './catalog';
import { localizedHomePath, localizedPath, type Locale } from './locale';
import { messages } from './messages';
import { appName, gitConfig } from './shared';

export function baseOptions(
  locale: Locale,
  surface: 'gallery' | 'docs' = 'gallery',
): BaseLayoutProps {
  const labels = messages[locale].navigation;
  return {
    themeSwitch: { enabled: true, mode: 'light-dark' },
    nav: { title: <span className="text-sm">{appName}</span>, url: localizedHomePath(locale) },
    links: [
      {
        type: 'icon',
        label: surface === 'docs' ? labels.assets : labels.docs,
        text: surface === 'docs' ? labels.assets : labels.docs,
        icon:
          surface === 'docs' ? (
            <Boxes aria-hidden="true">
              <title>{labels.assets}</title>
            </Boxes>
          ) : (
            <BookOpen aria-hidden="true">
              <title>{labels.docs}</title>
            </BookOpen>
          ),
        url: surface === 'docs' ? localizedHomePath(locale) : localizedPath('/docs', locale),
      },
      {
        type: 'icon',
        label: 'Hugging Face',
        text: 'Hugging Face',
        icon: <HuggingFaceIcon />,
        url: `https://huggingface.co/datasets/${DATASET_REPO_ID}`,
        external: true,
      },
    ],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
