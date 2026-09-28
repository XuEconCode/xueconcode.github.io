# 个人学术主页

中英双语的个人学术主页，用 [Astro](https://astro.build) 生成静态网站，部署在 GitHub Pages。

- 「书卷人文」风格：宣纸底色、思源宋体排版、朱砂点缀，首页顶部是校徽，板块以壹、贰、叁编号
- 中文版在 `/`，英文版在 `/en/`，右上角可以切换语言
- 页面包括：首页、研究（论文与报告）、项目、文章、可打印简历
- 支持夜读（深色）模式和数学公式（KaTeX），代码自动高亮
- 不加载任何第三方资源；中文字体在构建时按全站用字自动裁剪，访客只下载用到的字

## 日常更新：只改这几个地方

| 想改什么 | 改哪里 |
| --- | --- |
| 姓名、简介、联系方式、教育、经历、荣誉、技能、动态 | `src/data/profile.yaml` |
| 论文、工作论文、报告 | `src/data/publications.yaml` |
| 项目 | `src/content/projects/zh/*.md` 与 `en/*.md` |
| 文章 | `src/content/writing/zh/*.md` 与 `en/*.md` |
| 校徽 | `src/assets/emblem.png`（透明底的单色图），显示在首页、简历页和分享卡片上；删掉这张图就换回朱砂名章。颜色由 `src/styles/tokens.css` 的 `--emblem` 决定（日间、夜读各一处） |
| 网站图标 | `public/favicon.ico`（16、32、48 像素）与 `public/apple-touch-icon.png`（180 像素，手机主屏幕用），由实心版校徽生成，直接替换这两个文件即可 |
| 名章文字 | 没有校徽图时，首页与简历页显示朱砂名章，默认取中文名（三字名补「印」，两字名补「之印」）；想自定义就在 `profile.yaml` 加一行 `seal: 四个字` |
| 简历 PDF | 放到 `public/cv/`，并在 `profile.yaml` 的 `cv` 中填写路径 |
| 论文 PDF | 放到 `public/papers/`，在 `publications.yaml` 的 `links.pdf` 中填写 `/papers/文件名.pdf` |
| 朱砂色（强调色） | `src/styles/tokens.css` 中的 `--seal`（日间、夜读各一处） |
| GitHub 用户名 | `src/site.config.ts`（全站只在这里配置） |

两个 YAML 文件开头都写有格式说明。字段写错时，构建会直接报错并指出是哪一行。

> ⚠️ 这是公开网站。请不要写入手机号、住址、身份证号、出生日期等个人敏感信息；上传的 PDF 也请先确认不含这些信息。

### 双语规则

- YAML 里的文本写成 `{ zh: 中文, en: English }`；两种语言相同的内容直接写字符串即可。只写一种语言时，另一种语言的页面会显示这一种。
- 项目和文章：`zh/` 与 `en/` 目录下的**同名文件**就是同一篇内容的两个版本。只写一种语言也可以：文章列表会列出另一种语言的文章并标注语言，语言切换按钮则会跳到对应的列表页。

### 新写一篇文章

在 `src/content/writing/zh/` 下新建一个文件，文件名就是网址，请用英文和短横线，例如 `my-new-post.md`：

```markdown
---
title: 文章标题
description: 一两句话的摘要，会显示在文章列表和搜索结果里
date: 2026-10-01
tags: [经济史, 数据]
draft: false # true 时只在本地预览中显示，不会发布
---

正文用 Markdown 书写。
```

项目的写法相同，放在 `src/content/projects/zh/`，字段可以参考已有的 `dhs-iodine-tazara.md`。常用字段如下：

- `summary`：一句话简介
- `keyResult`：主要发现（一句话），以「」引文的形式居中显示；`keyStats` 是它下方的一行统计量
- `cover`：封面插图，显示在首页与项目列表；配合 `coverCaption`（图注）和 `coverPosition`（裁切位置，如 `50% 60%`）
- `repo`：GitHub 仓库名，会自动生成〔代码〕链接
- `featured: true`：出现在首页

### Markdown 小技巧

- **带图注的图片**：`![替代文字](./图片.png "图 1　图注文字")`，图片可以和 Markdown 文件放在一起
- **公式**：行内 `$\beta_1 > 0$`，独立成行用 `$$ … $$`
- **表格**：自动排成学术三线表；数字列在分隔行写 `---:` 即右对齐
- **脚注**：`正文[^1]`，再在文末写 `[^1]: 脚注内容`

## 本地预览

需要 Node.js 22 或更高版本。

```bash
npm install        # 第一次运行前安装依赖
npm run dev        # 本地预览：http://localhost:4321 ，改完保存即自动刷新
npm run build      # 检查内容并生成网站到 dist/
npm run preview    # 预览 build 的结果
npm run og         # 重新生成社交分享卡片 public/og.png（改了姓名、身份或校徽后运行）
```

## 发布

推送到 `main` 分支后，`.github/workflows/deploy.yml` 会自动构建并发布，一两分钟后生效：

```bash
git add -A
git commit -m "更新内容"
git push
```

第一次发布前，需要在 GitHub 仓库的 **Settings → Pages → Source** 中选择 **GitHub Actions**。

## 打印简历

打开网站的「简历」页，用浏览器的「打印 → 另存为 PDF」就能得到排版干净的 A4 简历。导航、按钮等元素在打印时会自动隐藏。

## 目录结构

```
├─ .github/workflows/deploy.yml   自动发布
├─ public/                        原样发布的文件：分享卡片、网站图标、PDF 等
├─ scripts/og.mjs                 分享卡片生成脚本
└─ src/
   ├─ site.config.ts              GitHub 用户名与网址
   ├─ data/                       ★ profile.yaml、publications.yaml
   ├─ content/                    ★ 项目与文章（Markdown）
   ├─ assets/                     照片、校徽，以及项目与文章图片
   ├─ integrations/cjk-subset.ts  构建后按全站用字裁剪中文字体
   ├─ content.config.ts           内容字段校验规则
   ├─ i18n/                       界面文案（导航、按钮等）与语言工具
   ├─ components/  views/  layouts/  pages/   页面组件与路由
   └─ styles/                     设计令牌（颜色、字体、间距）与排版样式
```

## 许可

网站**代码**以 MIT 许可发布。**内容**（文字、照片、论文与简历 PDF 等）版权归作者所有，未经许可请勿转载。
