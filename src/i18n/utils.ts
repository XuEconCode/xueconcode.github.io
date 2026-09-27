import { defaultLang, type Lang } from './ui';

export const htmlLang: Record<Lang, string> = { zh: 'zh-CN', en: 'en' };
export const ogLocale: Record<Lang, string> = { zh: 'zh_CN', en: 'en_US' };

export const otherLang = (lang: Lang): Lang => (lang === 'zh' ? 'en' : 'zh');

/** 给站内路径加上语言前缀：('/research/', 'en') → '/en/research/' */
export function localizePath(path: string, lang: Lang): string {
  let clean = '/' + path.replace(/^\/+/, '');
  if (!clean.endsWith('/') && !/\.[a-z0-9]+$/i.test(clean)) clean += '/';
  return lang === defaultLang ? clean : `/${lang}${clean}`;
}

/** 去掉语言前缀：'/en/research/' → '/research/' */
export function stripLang(pathname: string): string {
  return pathname.replace(/^\/en(?=\/|$)/, '') || '/';
}

/** 双语文本：可写成字符串（两种语言相同），或 { zh, en }；缺一种语言时用另一种兜底。 */
export type I18nText = string | { zh?: string; en?: string };

export function tx(value: I18nText | undefined | null, lang: Lang): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  return value[lang] ?? value[otherLang(lang)] ?? '';
}

/** 资源链接的括号：中文页用〔〕，英文页用 [] */
export const bracket = (label: string, lang: Lang) => (lang === 'zh' ? `〔${label}〕` : `[${label}]`);

/** 题名引号：中文页的中文题名用《》，其余用 “ ” */
export const quoteTitle = (title: string, lang: Lang) =>
  lang === 'zh' && /\p{Script=Han}/u.test(title) ? `《${title}》` : `“${title}”`;

/** 文本在当前语言下是否缺译（用于给回退内容标注正确的 lang 属性）。 */
export function textLang(value: I18nText | undefined | null, lang: Lang): Lang {
  if (value == null || typeof value === 'string' || value[lang] != null) return lang;
  return otherLang(lang);
}
