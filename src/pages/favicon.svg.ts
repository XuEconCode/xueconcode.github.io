import type { APIRoute } from 'astro';
import { getProfile, sealText } from '../lib/content';

/** 网站图标：朱砂小印，取印文首字（默认为中文名的第一个字），随 profile.yaml 自动更新 */
export const GET: APIRoute = async () => {
  const profile = await getProfile();
  const first = Array.from(sealText(profile).trim())[0] ?? '印';
  const letter = first.replace(/[<>&"']/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="#a93a2b"/>
  <rect x="5" y="5" width="54" height="54" rx="7" fill="none" stroke="#fbf8f1" stroke-opacity="0.9" stroke-width="2.5"/>
  <text x="32" y="44" text-anchor="middle" font-family="'Songti SC', STSong, SimSun, 'Noto Serif SC', serif" font-size="34" font-weight="900" fill="#fbf8f1">${letter}</text>
</svg>
`;
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' } });
};
