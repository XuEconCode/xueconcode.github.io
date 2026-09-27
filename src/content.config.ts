/**
 * 内容字段校验：YAML 或 Markdown 里的字段写错时，构建会直接报错并指出位置。
 */
import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { parse as parseYaml } from 'yaml';

/** 双语文本：字符串（两种语言相同），或 { zh, en }（至少填一项） */
const text = z.union([
  z.string(),
  z
    .object({ zh: z.string().optional(), en: z.string().optional() })
    .refine((v) => Boolean(v.zh || v.en), '至少填写 zh 或 en 其中一项'),
]);

/** 年月：2024、2024-09 或 present（至今） */
const yearMonth = z
  .union([z.string(), z.number()])
  .transform(String)
  .pipe(z.string().regex(/^(\d{4}(-(0[1-9]|1[0-2]))?|present)$/, '日期请写成 2024、2024-09 或 present'));

/** 论文 / 项目的资源链接 */
const resourceLinks = z
  .object({
    paper: z.string().optional(),
    pdf: z.string().optional(),
    code: z.string().optional(),
    data: z.string().optional(),
    slides: z.string().optional(),
    url: z.string().optional(),
  })
  .default({});

export const linkKinds = ['github', 'scholar', 'orcid', 'linkedin', 'researchgate', 'ssrn', 'x', 'website'] as const;

const profile = defineCollection({
  loader: file('src/data/profile.yaml', { parser: (raw) => ({ profile: parseYaml(raw) }) }),
  schema: z.object({
    name: text,
    /** 印章文字，默认取中文名（三字名补「印」，两字名补「之印」） */
    seal: z.string().optional(),
    title: text.optional(),
    affiliation: text.optional(),
    interests: z.array(text).default([]),
    bio: text.optional(),
    email: z.string().optional(),
    links: z.array(z.object({ kind: z.enum(linkKinds), url: z.string(), label: text.optional() })).default([]),
    cv: z.object({ zh: z.string().optional(), en: z.string().optional() }).optional(),
    news: z.array(z.object({ date: yearMonth, text })).default([]),
    education: z
      .array(
        z.object({
          start: yearMonth,
          end: yearMonth.optional(),
          school: text,
          degree: text,
          details: z.array(text).default([]),
        }),
      )
      .default([]),
    experience: z
      .array(
        z.object({
          start: yearMonth,
          end: yearMonth.optional(),
          org: text,
          role: text,
          details: z.array(text).default([]),
        }),
      )
      .default([]),
    honors: z
      .array(
        z
          .object({
            year: yearMonth.optional(),
            /** 跨年份时直接写时间段，如 2020–2025 */
            when: z.string().optional(),
            title: text,
            org: text.optional(),
          })
          .refine((h) => Boolean(h.year || h.when), '荣誉请填写 year（如 2024-11）或 when（如 2020–2025）'),
      )
      .default([]),
    /** 科研课题：role 写「主持 / 参与」 */
    grants: z.array(z.object({ role: text, title: text, funder: text })).default([]),
    skills: z.array(z.object({ group: text, items: z.array(text) })).default([]),
  }),
});

const publications = defineCollection({
  // 记下每条在文件中的位置，页面按「类型 → 文件顺序」排列
  loader: file('src/data/publications.yaml', {
    parser: (raw) => ((parseYaml(raw) ?? []) as Record<string, unknown>[]).map((item, order) => ({ ...item, order })),
  }),
  schema: z.object({
    order: z.number().default(0),
    type: z.enum(['working-paper', 'publication', 'in-progress', 'report']),
    title: text,
    /** 完整作者列表（按署名顺序，自己的名字会自动加粗）；只想写合作者时改用 coauthors */
    authors: z.array(text).default([]),
    coauthors: z.array(z.string()).default([]),
    venue: text.optional(),
    status: text.optional(),
    year: z.union([z.string(), z.number()]).transform(String).optional(),
    abstract: text.optional(),
    links: resourceLinks,
    bibtex: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      date: z.coerce.date(),
      role: z.string().optional(),
      tags: z.array(z.string()).default([]),
      /** 主要发现：一句话，显示为「」引文 */
      keyResult: z.string().optional(),
      /** 主要发现下方的统计量，如 β = +0.045 · p < 0.001 · N = 4,234 */
      keyStats: z.string().optional(),
      /** GitHub 仓库名：自动生成 github.com/<用户名>/<仓库名> 的「代码」链接 */
      repo: z.string().optional(),
      links: resourceLinks,
      cover: image().optional(),
      coverAlt: z.string().optional(),
      coverCaption: z.string().optional(),
      /** 封面裁切位置（CSS object-position），如 "50% 60%" */
      coverPosition: z.string().default("50% 50%"),
      featured: z.boolean().default(false),
      order: z.number().default(0),
      draft: z.boolean().default(false),
    }),
});

const writing = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/writing' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { profile, publications, projects, writing };
