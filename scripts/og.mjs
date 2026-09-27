// 生成社交分享卡片 public/og.png（1200×630），书卷风格：宣纸底、双线框、朱砂名章。
// 读取 src/data/profile.yaml，用本机 Chrome 无头截图：npm run og
// Chrome 不在默认位置时，用环境变量 CHROME_PATH 指定。
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parse } from 'yaml';

const root = resolve(import.meta.dirname, '..');
const profile = parse(readFileSync(join(root, 'src/data/profile.yaml'), 'utf8'));
const githubUser = readFileSync(join(root, 'src/site.config.ts'), 'utf8').match(/const githubUser = '([^']+)'/)?.[1] ?? '';

const tx = (value, lang) => (value == null ? '' : typeof value === 'string' ? value : (value[lang] ?? value.zh ?? value.en ?? ''));
const esc = (value) => String(value).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const fileUrl = (path) => pathToFileURL(path).href;

const name = tx(profile.name, 'zh');
const altName = tx(profile.name, 'en');
const role = [tx(profile.title, 'zh'), tx(profile.affiliation, 'zh')].filter(Boolean).join(' · ');
const interests = (profile.interests ?? []).map((item) => tx(item, 'zh')).join('　');

// 名章：与网站相同的规则（三字名补「印」，两字名补「之印」，右列先读）
const sealChars = Array.from(String(profile.seal ?? name).replace(/\s+/g, ''));
const four =
  sealChars.length >= 4 ? sealChars.slice(0, 4) : sealChars.length === 3 ? [...sealChars, '印'] : [...sealChars, '之', '印'];
const cells = [four[2], four[0], four[3], four[1]].map((c) => `<span>${esc(c ?? '')}</span>`).join('');

const fontCss = [
  '@fontsource-variable/noto-serif-sc/index.css',
  '@fontsource-variable/eb-garamond/index.css',
  '@fontsource-variable/eb-garamond/wght-italic.css',
].map((pkg) => `<link rel="stylesheet" href="${fileUrl(join(root, 'node_modules', pkg))}">`);

const html = `<!doctype html>
<html lang="zh-CN">
<meta charset="utf-8">
${fontCss.join('\n')}
<style>
  html, body { margin: 0; width: 1200px; height: 630px; background: #f3eee3; color: #2a2521; }
  body {
    position: relative; box-sizing: border-box; padding: 0 110px;
    display: grid; grid-template-columns: 210px 1fr; align-items: center; gap: 80px;
    font-family: "Noto Serif SC Variable", serif;
  }
  .frame { position: absolute; inset: 22px; border: 1px solid #d6cbb8; }
  .frame.inner { inset: 29px; border-color: #e4dccb; }
  .seal { width: 210px; height: 210px; box-sizing: border-box; padding: 12px; border-radius: 14px; background: #a93a2b; }
  .seal div {
    display: grid; grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(2, 1fr); height: 100%;
    box-sizing: border-box; border: 3px solid rgba(251, 248, 241, 0.92); border-radius: 8px;
    color: #fbf8f1; font-size: 70px; font-weight: 900; line-height: 1;
  }
  .seal span { display: grid; place-items: center; }
  .name { margin: 0; font-size: 78px; font-weight: 900; line-height: 1.15; letter-spacing: 0.12em; }
  .alt { margin: 8px 0 0; color: #6f6358; font-family: "EB Garamond Variable", serif; font-size: 34px; font-style: italic; }
  .ornament { display: flex; align-items: center; gap: 14px; margin: 28px 0 26px; }
  .ornament i { width: 64px; height: 1px; background: #cbbfa9; }
  .ornament b { width: 9px; height: 9px; background: #a93a2b; transform: rotate(45deg); }
  .role { margin: 0; font-size: 26px; letter-spacing: 0.1em; }
  .interests { margin: 12px 0 0; color: #6f6358; font-size: 21px; letter-spacing: 0.24em; }
  .url { position: absolute; right: 70px; bottom: 58px; color: #a93a2b; font-family: "EB Garamond Variable", serif; font-size: 24px; font-style: italic; }
</style>
<div class="frame"></div>
<div class="frame inner"></div>
<div class="seal"><div>${cells}</div></div>
<div>
  <h1 class="name">${esc(name)}</h1>
  ${altName && altName !== name ? `<p class="alt">${esc(altName)}</p>` : ''}
  <div class="ornament"><i></i><b></b><i></i></div>
  ${role ? `<p class="role">${esc(role)}</p>` : ''}
  ${interests ? `<p class="interests">${esc(interests)}</p>` : ''}
</div>
${githubUser ? `<div class="url">${esc(githubUser.toLowerCase())}.github.io</div>` : ''}
</html>`;

const chrome =
  process.env.CHROME_PATH ??
  [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ].find(existsSync);
if (!chrome) throw new Error('找不到 Chrome，请用环境变量 CHROME_PATH 指定浏览器路径');

const work = mkdtempSync(join(tmpdir(), 'og-'));
const page = join(work, 'card.html');
const out = join(root, 'public', 'og.png');
writeFileSync(page, html);
try {
  execFileSync(
    chrome,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--no-first-run',
      '--force-device-scale-factor=1',
      '--allow-file-access-from-files',
      `--user-data-dir=${join(work, 'profile')}`,
      '--window-size=1200,630',
      '--virtual-time-budget=5000',
      `--screenshot=${out}`,
      fileUrl(page),
    ],
    { stdio: 'ignore' },
  );
} finally {
  rmSync(work, { recursive: true, force: true });
}
console.log(`已生成 ${out}`);
