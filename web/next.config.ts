import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.anycap.ai",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["@lobehub/icons"],
  },
};

export default nextConfig;
