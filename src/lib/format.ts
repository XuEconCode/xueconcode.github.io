import type { Lang } from '../i18n/ui';

const monthYear = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });

/** '2024-09' → 中文 2024.09 / 英文 Sep 2024；'present' → 至今 / Present */
export function formatYearMonth(value: string, lang: Lang): string {
  if (value === 'present') return lang === 'zh' ? '至今' : 'Present';
  const [year, month] = value.split('-');
  if (!month) return year;
  return lang === 'zh' ? `${year}.${month}` : monthYear.format(new Date(Date.UTC(Number(year), Number(month) - 1, 1)));
}

export function formatPeriod(start: string, end: string | undefined, lang: Lang): string {
  return end ? `${formatYearMonth(start, lang)} – ${formatYearMonth(end, lang)}` : formatYearMonth(start, lang);
}

/** 文章日期：long → 2026 年 7 月 11 日 / July 11, 2026；short → 2026.07.11 / Jul 11, 2026 */
export function formatDate(date: Date, lang: Lang, style: 'long' | 'short' = 'long'): string {
  if (lang === 'zh') {
    const y = date.getUTCFullYear();
    const m = date.getUTCMonth() + 1;
    const d = date.getUTCDate();
    return style === 'long'
      ? `${y} 年 ${m} 月 ${d} 日`
      : `${y}.${String(m).padStart(2, '0')}.${String(d).padStart(2, '0')}`;
  }
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: style === 'long' ? 'long' : 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export const isoDate = (date: Date) => date.toISOString().slice(0, 10);

const HAN = /[㐀-鿿豈-﫿]/g;

/** 阅读时长：中文按每分钟 400 字、英文按每分钟 220 词估算 */
export function readingMinutes(source: string): number {
  const han = source.match(HAN)?.length ?? 0;
  const words = source.replace(HAN, ' ').match(/[A-Za-z0-9][\w'-]*/g)?.length ?? 0;
  return Math.max(1, Math.round(han / 400 + words / 220));
}

/** 文本主要是中文还是英文（用于给回退内容标注 lang 属性） */
export const detectLang = (value: string): Lang => (/[㐀-鿿]/.test(value) ? 'zh' : 'en');

/** 人名列表：中文用顿号，英文用 "A, B and C" */
export function joinNames(names: string[], lang: Lang): string {
  if (lang === 'zh') return names.join('、');
  return new Intl.ListFormat('en', { style: 'long', type: 'conjunction' }).format(names);
}
