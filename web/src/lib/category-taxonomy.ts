/**
 * [INPUT]: 依赖 category-taxonomy.json 的稳定ID、双语名称与明确匹配词。
 * [OUTPUT]: 提供来源别名归并、保守名称归类、路径标签和分类检索文本。
 * [POS]: 展厅分类唯一语义层；不改原始目录、模型或质量结论。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import taxonomy from './category-taxonomy.json';
import type { Locale } from './locale';
type ClassifiedAsset = {
  category: string | null;
  name_en: string;
  name_zh: string;
};
const normalize = (value: string) =>
  value
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/\s*[/>]\s*/g, '/');
const categories = new Map(taxonomy.categories.map((category) => [category.id, category]));
const aliases = new Map(
  taxonomy.categories.flatMap((category) =>
    [category.id, ...category.aliases].map((alias) => [normalize(alias), category.id] as const),
  ),
);

export function normalizeCategoryPath(value: string | null | undefined): string | null {
  return value ? (aliases.get(normalize(value)) ?? null) : null;
}

// ---- 匹配器随词表编译，不随查询重复创建 ----
function termMatcher(term: string): (name: string) => boolean {
  if (/\p{Script=Han}/u.test(term)) return (name) => name.includes(term);
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`, 'i');
  return (name) => pattern.test(name);
}
const rules = taxonomy.categories.map((category) => ({
  id: category.id,
  terms: category.terms.map(termMatcher),
  phrases: category.phrases.map(termMatcher),
}));

function commonCategory(paths: string[]): string | null {
  if (!paths.length) return null;
  // 同一分支取最具体节点，跨分支只保留共同父级。
  paths = paths.filter((path) => !paths.some((other) => other.startsWith(path + '/')));
  const parts = paths[0].split('/');
  while (
    parts.length &&
    !paths.every((path) => path === parts.join('/') || path.startsWith(parts.join('/') + '/'))
  )
    parts.pop();
  return parts.length ? parts.join('/') : null;
}

export function classifyCategory(asset: ClassifiedAsset): {
  path: string;
  reason: 'source' | 'name' | 'unresolved';
} {
  const supplied = normalizeCategoryPath(asset.category);
  if (supplied && supplied !== 'uncategorized' && supplied.includes('/'))
    return { path: supplied, reason: 'source' };
  const name = normalize(`${asset.name_en} ${asset.name_zh}`);
  const phraseMatches = rules
    .filter((c) => c.phrases.some((matches) => matches(name)))
    .map((c) => c.id);
  const matches = phraseMatches.length
    ? phraseMatches
    : rules.filter((c) => c.terms.some((matches) => matches(name))).map((c) => c.id);
  const inferred = commonCategory(matches);
  if (supplied && supplied !== 'uncategorized')
    return {
      path: inferred?.startsWith(supplied + '/') ? inferred : supplied,
      reason: 'source',
    };
  if (asset.category && !normalizeCategoryPath(asset.category))
    return { path: 'uncategorized', reason: 'unresolved' };
  return inferred
    ? { path: inferred, reason: 'name' }
    : { path: 'uncategorized', reason: 'unresolved' };
}

export function categoryLabel(path: string, locale: Locale): string {
  return (
    categories.get(normalizeCategoryPath(path) ?? 'uncategorized')?.[locale] ??
    categories.get('uncategorized')![locale]
  );
}

export function categoryDisplayPath(path: string, locale: Locale): string {
  const canonical = normalizeCategoryPath(path) ?? 'uncategorized';
  return canonical
    .split('/')
    .map((_, index, parts) => categoryLabel(parts.slice(0, index + 1).join('/'), locale))
    .join(' / ');
}

export function categorySearchText(asset: ClassifiedAsset): string {
  const { path } = classifyCategory(asset);
  return `${categoryDisplayPath(path, 'zh')} ${categoryDisplayPath(path, 'en')}`;
}
