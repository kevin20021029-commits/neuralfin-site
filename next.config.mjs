/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /* /download 是自包含静态页(public/download/index.html)，Next 不会自动把目录当路由 */
  async rewrites() {
    return {
      beforeFiles: [{ source: "/download", destination: "/download/index.html" }],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
