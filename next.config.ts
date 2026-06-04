import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // outputFileTracingRoot: './', // 注释掉，避免警告
  serverExternalPackages: [
    "kysely",
    "@better-auth/kysely-adapter",
    "@better-auth/core",
    "@better-auth/drizzle-adapter",
  ],
};

export default nextConfig;
