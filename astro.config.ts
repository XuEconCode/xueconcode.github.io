import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeBlocks from './src/lib/rehype-blocks';
import cjkSubset from './src/integrations/cjk-subset';
import { SITE } from './src/site.config';

export default defineConfig({
  site: SITE.url,
  // GitHub Pages 会把 /research 重定向到 /research/，统一带斜杠可省去一次跳转
  trailingSlash: 'always',
  // 本地预览时不显示 Astro 开发工具栏，所见即线上效果
  devToolbar: { enabled: false },
  i18n: {
    locales: ['zh', 'en'],
    defaultLocale: 'zh',
    routing: { prefixDefaultLocale: false },
  },
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [[rehypeKatex, { throwOnError: false }], rehypeBlocks],
    }),
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
    },
  },
  integrations: [
    mdx(),
    sitemap({
      i18n: { defaultLocale: 'zh', locales: { zh: 'zh-CN', en: 'en' } },
      filter: (page) => !/\/404\/?$/.test(page),
    }),
    // 构建后按全站用字裁剪中文字体，大幅减少访客下载量
    cjkSubset(),
  ],
});
