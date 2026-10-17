const isGithubPages = process.env.GITHUB_PAGES === 'true';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath: isGithubPages ? '/markdown-studio' : '',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
