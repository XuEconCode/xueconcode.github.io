import type { Element, ElementContent, Root, RootContent } from 'hast';

/**
 * Markdown 排版增强（rehype 插件）：
 * 1. 单独成段、带标题的图片 → 带图注的 <figure>：
 *      ![替代文字](./map.png "图 1　受访者分布")
 * 2. 表格外包一层 <div class="table-wrap">，窄屏时可横向滚动。
 */
export default function rehypeBlocks() {
  return (tree: Root) => {
    transform(tree);
  };
}

function transform(node: Root | Element) {
  node.children = node.children.map((child: RootContent) => {
    if (child.type !== 'element') return child;
    const replaced = toFigure(child) ?? wrapTable(child);
    if (replaced) return replaced;
    transform(child);
    return child;
  }) as typeof node.children;
}

const element = (tagName: string, className: string | null, children: ElementContent[]): Element => ({
  type: 'element',
  tagName,
  properties: className ? { className: [className] } : {},
  children,
});

function toFigure(p: Element): Element | null {
  if (p.tagName !== 'p') return null;
  const meaningful = p.children.filter((c) => !(c.type === 'text' && c.value.trim() === ''));
  const img = meaningful[0];
  if (meaningful.length !== 1 || img.type !== 'element' || img.tagName !== 'img') return null;
  const title = img.properties?.title;
  if (typeof title !== 'string' || title.trim() === '') return null;
  delete img.properties.title;
  return element('figure', null, [img, element('figcaption', null, [{ type: 'text', value: title }])]);
}

function wrapTable(table: Element): Element | null {
  if (table.tagName !== 'table') return null;
  return element('div', 'table-wrap', [table]);
}
