import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts, getProfile, parseId } from './content';
import { useTranslations, type Lang } from '../i18n/ui';
import { htmlLang, localizePath, tx } from '../i18n/utils';

/** 每种语言一个 RSS：/rss.xml（中文）与 /en/rss.xml（英文） */
export async function feed(context: APIContext, lang: Lang) {
  const t = useTranslations(lang);
  const profile = await getProfile();
  const posts = await getPosts(lang);
  return rss({
    title: `${tx(profile.name, lang)} · ${t('writing.title')}`,
    description: t('writing.description'),
    site: context.site ?? '',
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: localizePath(`/writing/${parseId(post.id).slug}/`, lang),
    })),
    customData: `<language>${htmlLang[lang]}</language>`,
  });
}
