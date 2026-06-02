import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["kysely", "@better-auth/kysely-adapter", "@better-auth/core"],

};

export default nextConfig;
