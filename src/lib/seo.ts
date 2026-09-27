import type { Profile } from './content';
import { SITE } from '../site.config';
import type { Lang } from '../i18n/ui';
import { localizePath, otherLang, tx } from '../i18n/utils';

/** 首页的结构化数据（schema.org Person），帮助搜索引擎识别个人主页 */
export function personJsonLd(profile: Profile, lang: Lang) {
  const name = tx(profile.name, lang);
  const alternateName = tx(profile.name, otherLang(lang));
  const affiliation = tx(profile.affiliation, lang);
  const sameAs = [...new Set([SITE.githubUrl, ...profile.links.map((link) => link.url)])];
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    alternateName: alternateName !== name ? alternateName : undefined,
    url: new URL(localizePath('/', lang), SITE.url).href,
    jobTitle: tx(profile.title, lang) || undefined,
    affiliation: affiliation ? { '@type': 'Organization', name: affiliation } : undefined,
    email: profile.email ? `mailto:${profile.email}` : undefined,
    knowsAbout: profile.interests.map((item) => tx(item, lang)),
    sameAs,
  };
}
