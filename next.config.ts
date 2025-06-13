import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_USE_MOCK_API: process.env.NEXT_PUBLIC_USE_MOCK_API || "true",
    NEXT_PUBLIC_API_BASE_URL:
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8080/api/v1",
  },
  eslint: {
    // 在生产构建期间忽略 ESLint 错误
    ignoreDuringBuilds: true,
  },
  // 配置反向代理解决跨域问题
  async rewrites() {
    return [
      {
        source: "/api/proxy/:path*",
        // 在 Docker 环境中，后端地址需要是可配置的。
        // 我们使用一个环境变量 `INTERNAL_API_URL`。
        // 如果该变量未设置，则回退到本地开发地址。
        destination: `${
          process.env.INTERNAL_API_URL || "http://127.0.0.1:8080"
        }/api/v1/:path*`,
      },
    ];
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
};

export default nextConfig;
