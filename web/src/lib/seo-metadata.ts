import "server-only";

import type { Metadata } from "next";
import { defaultSocialImageAlt } from "@/lib/site";

export const defaultSocialImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: defaultSocialImageAlt,
} as const;

function isCloudflarePreviewDeployment() {
  const branch = (process.env.CF_PAGES_BRANCH || "").toLowerCase();
  return Boolean(branch && branch !== "main");
}

function isVercelPreviewDeployment() {
  const env = (process.env.VERCEL_ENV || "").toLowerCase();
  return Boolean(env && env !== "production");
}

export function shouldAllowIndexing() {
  if (process.env.NODE_ENV !== "production") {
    return false;
  }

  // Preview runtimes reliably expose branch/env markers, but Cloudflare production
  // deployments can still report a `.pages.dev` URL alongside the custom domain.
  if (isVercelPreviewDeployment()) {
    return false;
  }

  if (isCloudflarePreviewDeployment()) {
    return false;
  }

  return true;
}

export function createRobotsMetadata(options?: {
  allowIndexing?: boolean;
}): Metadata["robots"] {
  const allowIndexing = shouldAllowIndexing() && (options?.allowIndexing ?? true);

  return {
    index: allowIndexing,
    follow: allowIndexing,
    googleBot: {
      index: allowIndexing,
      follow: allowIndexing,
      "max-image-preview": allowIndexing ? "large" : "none",
      "max-snippet": allowIndexing ? -1 : 0,
      "max-video-preview": allowIndexing ? -1 : 0,
    },
  };
}
