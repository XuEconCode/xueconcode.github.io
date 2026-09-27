import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/ui';
import { otherLang, tx } from '../i18n/utils';

export type Project = CollectionEntry<'projects'>;
export type Post = CollectionEntry<'writing'>;
export type Publication = CollectionEntry<'publications'>;
export type PubType = Publication['data']['type'];

/** 内容文件放在 zh/ 或 en/ 子目录：'zh/some-slug' → { lang: 'zh', slug: 'some-slug' } */
export function parseId(id: string): { lang: Lang; slug: string } {
  const [lang, ...rest] = id.split('/');
  if ((lang !== 'zh' && lang !== 'en') || rest.length === 0) {
    throw new Error(`内容文件需放在 zh/ 或 en/ 子目录下：${id}`);
  }
  return { lang, slug: rest.join('/') };
}

/** 草稿只在本地开发时显示 */
const isVisible = (entry: { data: { draft: boolean } }) => import.meta.env.DEV || !entry.data.draft;

export async function getProfile() {
  const entry = await getEntry('profile', 'profile');
  if (!entry) throw new Error('缺少 src/data/profile.yaml');
  return entry.data;
}
export type Profile = Awaited<ReturnType<typeof getProfile>>;

/** 印章文字：profile.yaml 的 seal 字段，默认取中文名 */
export const sealText = (profile: Profile) => profile.seal ?? tx(profile.name, 'zh');

/** 论文按类型分组显示；同一类型内保持 YAML 文件中的顺序 */
export const pubTypeOrder: PubType[] = ['publication', 'working-paper', 'in-progress', 'report'];

export async function getPublications(): Promise<Publication[]> {
  const all = await getCollection('publications');
  return all.sort(
    (a, b) => pubTypeOrder.indexOf(a.data.type) - pubTypeOrder.indexOf(b.data.type) || a.data.order - b.data.order,
  );
}

export async function getProjects(lang: Lang): Promise<Project[]> {
  const all = await getCollection('projects', isVisible);
  return all
    .filter((entry) => parseId(entry.id).lang === lang)
    .sort((a, b) => a.data.order - b.data.order || b.data.date.valueOf() - a.data.date.valueOf());
}

/** 某语言下的文章（不含只有另一语言版本的文章），按日期倒序 */
export async function getPosts(lang: Lang): Promise<Post[]> {
  const all = await getCollection('writing', isVisible);
  return all
    .filter((entry) => parseId(entry.id).lang === lang)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export interface PostListItem {
  entry: Post;
  slug: string;
  /** 这篇文章实际使用的语言 */
  lang: Lang;
  /** 当前语言没有这篇，列出的是另一语言版本 */
  isFallback: boolean;
}

/** 文章列表：当前语言的文章，加上只有另一语言版本的文章（会标注语言） */
export async function getPostList(lang: Lang): Promise<PostListItem[]> {
  const all = await getCollection('writing', isVisible);
  const bySlug = new Map<string, Partial<Record<Lang, Post>>>();
  for (const entry of all) {
    const { lang: entryLang, slug } = parseId(entry.id);
    bySlug.set(slug, { ...bySlug.get(slug), [entryLang]: entry });
  }
  const items: PostListItem[] = [];
  for (const [slug, versions] of bySlug) {
    const native = versions[lang];
    const entry = native ?? versions[otherLang(lang)];
    if (!entry) continue;
    items.push({ entry, slug, lang: native ? lang : otherLang(lang), isFallback: !native });
  }
  return items.sort((a, b) => b.entry.data.date.valueOf() - a.entry.data.date.valueOf());
}

/** 同一篇内容是否有另一语言版本 */
export async function hasVersion(collection: 'projects' | 'writing', slug: string, lang: Lang): Promise<boolean> {
  const entries = await getCollection(collection, isVisible);
  return entries.some((entry) => entry.id === `${lang}/${slug}`);
}
