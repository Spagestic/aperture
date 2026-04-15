import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["deepagents", "@langchain/mistralai"],
  cacheComponents: true,
};

export default nextConfig;
