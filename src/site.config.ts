/**
 * 全站配置。部署前只需要改 githubUser 这一行。
 */
const githubUser = 'XuEconCode';

const host = `${githubUser.toLowerCase()}.github.io`;

export const SITE = {
  githubUser,
  /** 站点网址，例如 https://your-username.github.io */
  url: `https://${host}`,
  /** GitHub 个人主页 */
  githubUrl: `https://github.com/${githubUser}`,
  /** 本站源码仓库 */
  repoUrl: `https://github.com/${githubUser}/${host}`,
} as const;

/** 由仓库名生成 GitHub 地址，账号改名或仓库转移后只需改上面的 githubUser。 */
export const repoUrl = (repo: string) => `${SITE.githubUrl}/${repo}`;
