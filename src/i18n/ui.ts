/**
 * 界面文案（导航、板块标题、按钮等）。正文内容不在这里，在 src/data 与 src/content。
 */
export const languages = { zh: '中文', en: 'English' } as const;
export type Lang = keyof typeof languages;
export const defaultLang: Lang = 'zh';

const zh = {
  'site.homepage': '个人主页',
  'nav.label': '主导航',
  'nav.research': '研究',
  'nav.projects': '项目',
  'nav.writing': '文章',
  'nav.cv': '简历',
  'skip': '跳到正文',
  'theme.toggle': '切换深色模式',
  'lang.switch': '切换到英文版',

  'hero.interests': '研究兴趣',
  'section.news': '动态',
  'section.research': '研究',
  'section.projects': '精选项目',
  'section.education': '教育背景',
  'section.experience': '经历',
  'section.honors': '荣誉奖项',
  'section.skills': '技能',
  'section.writing': '最新文章',
  'section.curriculum': '履历',
  'section.grants': '科研课题',
  'section.educationShort': '教育',
  'section.experienceHonors': '经历与荣誉',
  'link.email': '邮箱',
  'link.cvPdf': '简历 PDF',
  'more': '查看全部',

  'research.title': '研究',
  'research.description': '论文、工作论文与研究报告',
  'pub.type.working-paper': '工作论文',
  'pub.type.publication': '发表论文',
  'pub.type.in-progress': '进行中的研究',
  'pub.type.report': '研究报告',
  'pub.label.working-paper': '工作论文',
  'pub.label.publication': '已发表',
  'pub.label.in-progress': '进行中',
  'pub.label.report': '报告',
  'pub.with': '与 {names} 合作',
  'pub.abstract': '摘要',
  'pub.bibtex': '引用',
  'link.pdf': '全文 PDF',
  'link.code': '代码',
  'link.data': '数据',
  'link.slides': '幻灯片',
  'link.paper': '论文',
  'link.url': '链接',

  'projects.title': '项目',
  'projects.description': '研究项目与数据工具',
  'projects.back': '全部项目',
  'project.keyResult': '主要发现',

  'writing.title': '文章',
  'writing.description': '研究笔记与方法复盘',
  'writing.back': '全部文章',
  'writing.minutes': '约 {n} 分钟读完',
  'writing.toc': '目录',
  'writing.updated': '更新于 {date}',
  'writing.prev': '上一篇',
  'writing.next': '下一篇',
  'writing.empty': '暂时还没有文章。',
  'writing.otherLang': '英文',

  'cv.title': '简历',
  'cv.download': '下载 PDF 版',
  'cv.print': '打印本页',
  'cv.website': '主页',

  'date.present': '至今',
  'footer.updated': '更新于 {date}',
  'footer.source': '网站源码',
  'footer.rss': 'RSS',

  'notFound.title': '页面不存在',
  'notFound.body': '你要找的页面可能已经移动或删除。',
  'notFound.home': '回到首页',
} as const;

type Key = keyof typeof zh;

const en: Record<Key, string> = {
  'site.homepage': 'Homepage',
  'nav.label': 'Main',
  'nav.research': 'Research',
  'nav.projects': 'Projects',
  'nav.writing': 'Writing',
  'nav.cv': 'CV',
  'skip': 'Skip to content',
  'theme.toggle': 'Toggle dark mode',
  'lang.switch': 'Switch to Chinese',

  'hero.interests': 'Research interests',
  'section.news': 'News',
  'section.research': 'Research',
  'section.projects': 'Selected Projects',
  'section.education': 'Education',
  'section.experience': 'Experience',
  'section.honors': 'Honors & Awards',
  'section.skills': 'Skills',
  'section.writing': 'Recent Writing',
  'section.curriculum': 'Curriculum',
  'section.grants': 'Research Grants',
  'section.educationShort': 'Education',
  'section.experienceHonors': 'Experience & Honors',
  'link.email': 'Email',
  'link.cvPdf': 'CV (PDF)',
  'more': 'View all',

  'research.title': 'Research',
  'research.description': 'Papers, working papers and reports',
  'pub.type.working-paper': 'Working Papers',
  'pub.type.publication': 'Publications',
  'pub.type.in-progress': 'Work in Progress',
  'pub.type.report': 'Reports',
  'pub.label.working-paper': 'Working paper',
  'pub.label.publication': 'Published',
  'pub.label.in-progress': 'Work in progress',
  'pub.label.report': 'Report',
  'pub.with': 'with {names}',
  'pub.abstract': 'Abstract',
  'pub.bibtex': 'BibTeX',
  'link.pdf': 'PDF',
  'link.code': 'Code',
  'link.data': 'Data',
  'link.slides': 'Slides',
  'link.paper': 'Paper',
  'link.url': 'Link',

  'projects.title': 'Projects',
  'projects.description': 'Research projects and data tools',
  'projects.back': 'All projects',
  'project.keyResult': 'Key finding',

  'writing.title': 'Writing',
  'writing.description': 'Research notes and method write-ups',
  'writing.back': 'All writing',
  'writing.minutes': '{n} min read',
  'writing.toc': 'Contents',
  'writing.updated': 'Updated {date}',
  'writing.prev': 'Previous',
  'writing.next': 'Next',
  'writing.empty': 'Nothing here yet.',
  'writing.otherLang': 'Chinese',

  'cv.title': 'CV',
  'cv.download': 'Download PDF',
  'cv.print': 'Print this page',
  'cv.website': 'Website',

  'date.present': 'Present',
  'footer.updated': 'Updated {date}',
  'footer.source': 'Source',
  'footer.rss': 'RSS',

  'notFound.title': 'Page not found',
  'notFound.body': 'The page you are looking for may have moved or no longer exists.',
  'notFound.home': 'Back to home',
};

export const ui: Record<Lang, Record<Key, string>> = { zh, en };

export function useTranslations(lang: Lang) {
  return (key: Key, vars: Record<string, string | number> = {}) =>
    ui[lang][key].replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? ''));
}
