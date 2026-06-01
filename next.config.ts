import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["kysely", "@better-auth/kysely-adapter"],
  turbopack: {
    root: "..",
  },
};

export default nextConfig;
