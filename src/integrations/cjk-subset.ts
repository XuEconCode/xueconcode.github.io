/**
 * 构建后裁剪中文字体：统计全站实际用到的字符，把思源宋体的每个分片裁剪到只含这些字。
 * 字形不变，访客下载量大幅减少；没有用到的分片直接删除。
 * 只在 astro build 时运行，本地开发预览仍使用完整字体。
 */
import type { AstroIntegration } from 'astro';
import { readFile, readdir, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import subsetFont from 'subset-font';

const FAMILY = 'Noto Serif SC Variable';

async function listFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true });
  return entries.filter((e) => e.isFile()).map((e) => join(e.parentPath, e.name));
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

/** HTML 中会显示出来的文字（去掉脚本、样式与标签，解码实体） */
function visibleText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(Number(dec)))
    .replace(/&([a-z]+);/gi, (match, name: string) => ENTITIES[name] ?? match);
}

/** CSS 里 content: "…" 生成的文字（如「·」「◇」），含 \201C 这类转义 */
function cssContentText(css: string): string {
  return [...css.matchAll(/content:\s*(["'])(.*?)\1/g)]
    .map((m) => m[2].replace(/\\([0-9a-f]{1,6})\s?/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16))))
    .join('');
}

/** 解析 unicode-range：U+4E00-9FFF, U+3001 … */
function parseRanges(value: string): [number, number][] {
  return value.split(',').map((part) => {
    const [start, end] = part.trim().replace(/^U\+/i, '').split('-');
    if (start.includes('?')) {
      return [parseInt(start.replace(/\?/g, '0'), 16), parseInt(start.replace(/\?/g, 'F'), 16)];
    }
    const first = parseInt(start, 16);
    return [first, end ? parseInt(end, 16) : first];
  });
}

const kb = (bytes: number) => `${Math.round(bytes / 1024)} KB`;

export default function cjkSubset(): AstroIntegration {
  return {
    name: 'cjk-font-subset',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const files = await listFiles(root);
        const cssFiles = files.filter((f) => f.endsWith('.css'));

        // 1. 全站用到的字符
        const used = new Set<number>();
        const add = (text: string) => {
          for (const ch of text) used.add(ch.codePointAt(0)!);
        };
        for (const file of files.filter((f) => f.endsWith('.html'))) {
          const html = await readFile(file, 'utf8');
          add(visibleText(html));
          add(cssContentText(html));
        }
        for (const file of cssFiles) add(cssContentText(await readFile(file, 'utf8')));

        // 2. 逐个裁剪思源宋体分片
        const done = new Set<string>();
        let before = 0;
        let after = 0;
        let kept = 0;
        let removed = 0;
        for (const cssFile of cssFiles) {
          const css = await readFile(cssFile, 'utf8');
          for (const [block] of css.matchAll(/@font-face\s*\{[^}]*\}/g)) {
            if (!block.includes(FAMILY)) continue;
            const url = block.match(/url\(\s*["']?([^"')]+)["']?\s*\)/)?.[1];
            const range = block.match(/unicode-range:\s*([^;}]+)/)?.[1];
            // 小于 4 KB 的分片已被 Vite 以 base64 内联进 CSS，体积很小，不必处理
            if (!url || !range || url.startsWith('data:') || done.has(url)) continue;
            done.add(url);

            const fontPath = join(root, url.replace(/^\//, ''));
            const original = await readFile(fontPath);
            before += original.length;
            const ranges = parseRanges(range);
            const chars = [...used].filter((cp) => ranges.some(([a, b]) => cp >= a && cp <= b));
            if (chars.length === 0) {
              await unlink(fontPath);
              removed++;
              continue;
            }
            const subset = await subsetFont(original, String.fromCodePoint(...chars), { targetFormat: 'woff2' });
            await writeFile(fontPath, subset);
            after += subset.length;
            kept++;
          }
        }
        logger.info(
          `思源宋体按全站 ${used.size} 个字符裁剪：保留 ${kept} 个分片、删除 ${removed} 个，${kb(before)} → ${kb(after)}`,
        );
      },
    },
  };
}
