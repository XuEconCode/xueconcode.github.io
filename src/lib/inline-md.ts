/**
 * YAML 里的简介、经历条目等支持极简行内 Markdown：**粗体**、*斜体*、[链接](https://…)。
 * 其余字符一律按 HTML 转义，避免意外注入标签。
 */
const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (c) => ESCAPES[c]);

export function inlineMd(source: string): string {
  return escapeHtml(source)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label: string, url: string) => {
      const href = /^(https?:|mailto:|\/|#)/i.test(url) ? url : '#';
      return `<a href="${href}">${label}</a>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*\w])\*([^*\s](?:[^*]*[^*\s])?)\*(?!\w)/g, '$1<em>$2</em>');
}

const CJK = '　-〿㐀-鿿＀-￯';
const CJK_LINE_BREAK = new RegExp(`([${CJK}])\\s*\\n\\s*(?=[${CJK}])`, 'g');

/** 多段文本（空行分段）→ 每段一个 HTML 片段；中文行内换行不产生多余空格 */
export function paragraphs(source: string): string[] {
  return source
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => inlineMd(p.replace(CJK_LINE_BREAK, '$1').replace(/\s*\n\s*/g, ' ')));
}
