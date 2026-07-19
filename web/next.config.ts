import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  trailingSlash: false,
  // Keep crawler-visible metadata in the document head for every user agent.
  htmlLimitedBots: /.*/,
  async redirects() {
    return [
      {
        source: "/:path+/",
        destination: "/:path+",
        statusCode: 301,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
          },
        ],
      },
    ];
  },
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
