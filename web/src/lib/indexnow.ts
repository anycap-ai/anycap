import "server-only";

import { siteConfig } from "@/lib/site";

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const canonicalSiteUrl = siteConfig.url.replace(/\/+$/, "");

function resolveIndexNowKey() {
  return process.env.INDEXNOW_KEY?.trim() ?? "";
}

function resolveIndexNowBaseUrl() {
  return new URL(canonicalSiteUrl);
}

function isCloudflarePreviewDeployment() {
  const branch = (process.env.CF_PAGES_BRANCH || "").toLowerCase();
  return Boolean(branch && branch !== "main");
}

function isVercelPreviewDeployment() {
  const env = (process.env.VERCEL_ENV || "").toLowerCase();
  return Boolean(env && env !== "production");
}

function isDeploymentContext() {
  if (process.env.INDEXNOW_PUBLISH === "1") {
    return true;
  }

  if (process.env.CF_PAGES_BRANCH || process.env.VERCEL_ENV) {
    return true;
  }

  return process.env.NODE_ENV === "production";
}

export function hasIndexNowKey() {
  return resolveIndexNowKey() !== "";
}

export function getIndexNowKey() {
  return resolveIndexNowKey();
}

export function getIndexNowKeyLocation() {
  const key = getIndexNowKey();
  if (!key) {
    return null;
  }

  return `${canonicalSiteUrl}/${key}.txt`;
}

export function shouldSubmitIndexNow() {
  if (isVercelPreviewDeployment() || isCloudflarePreviewDeployment()) {
    return false;
  }

  return isDeploymentContext() && hasIndexNowKey();
}

export function normalizeIndexNowUrls(urls: readonly string[]) {
  const baseURL = resolveIndexNowBaseUrl();
  const normalized = new Set<string>();

  for (const value of urls) {
    const raw = value.trim();
    if (!raw) {
      continue;
    }

    const resolved = new URL(raw, baseURL);
    if (resolved.origin !== baseURL.origin) {
      continue;
    }

    normalized.add(resolved.toString());
  }

  return [...normalized];
}

export type IndexNowSubmissionResult =
  | {
      submitted: false;
      reason: "disabled" | "empty";
      urlCount: number;
    }
  | {
      submitted: true;
      urlCount: number;
      responseStatus: number;
    };

export async function submitIndexNowUrls(
  urls: readonly string[],
): Promise<IndexNowSubmissionResult> {
  if (!shouldSubmitIndexNow()) {
    return { submitted: false, reason: "disabled", urlCount: 0 };
  }

  const normalizedUrls = normalizeIndexNowUrls(urls);
  if (normalizedUrls.length === 0) {
    return { submitted: false, reason: "empty", urlCount: 0 };
  }

  const keyLocation = getIndexNowKeyLocation();
  if (!keyLocation) {
    return { submitted: false, reason: "disabled", urlCount: 0 };
  }

  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      host: baseHost(),
      key: getIndexNowKey(),
      keyLocation,
      urlList: normalizedUrls,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `IndexNow submission failed (${response.status})${body ? `: ${body}` : ""}`,
    );
  }

  return {
    submitted: true,
    urlCount: normalizedUrls.length,
    responseStatus: response.status,
  };
}

function baseHost() {
  return resolveIndexNowBaseUrl().host;
}
