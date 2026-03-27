import "server-only";

import type { Metadata } from "next";

const DEFAULT_SOCIAL_IMAGE_ALT =
  "AnyCap gives AI agents image, video, music, speech, search, and crawl capabilities through one command.";

export const defaultSocialImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: DEFAULT_SOCIAL_IMAGE_ALT,
} as const;

function isCloudflarePagesPreviewDeployment() {
  return (process.env.CF_PAGES_URL || "").toLowerCase().includes(".pages.dev");
}

function isCloudflareProductionBranch() {
  const branch = (process.env.CF_PAGES_BRANCH || "").toLowerCase();
  return !branch || branch === "main";
}

function isVercelProductionDeployment() {
  const env = (process.env.VERCEL_ENV || "").toLowerCase();
  return !env || env === "production";
}

export function shouldAllowIndexing() {
  if (process.env.NODE_ENV !== "production") {
    return false;
  }

  if (!isVercelProductionDeployment()) {
    return false;
  }

  if (!isCloudflareProductionBranch()) {
    return false;
  }

  if (isCloudflarePagesPreviewDeployment()) {
    return false;
  }

  return true;
}

export function createRobotsMetadata(): Metadata["robots"] {
  const allowIndexing = shouldAllowIndexing();

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
