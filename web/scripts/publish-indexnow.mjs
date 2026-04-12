import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const seoManifestPath = path.join(rootDir, "src", "generated", "seo-route-manifest.json");
const canonicalSiteUrl = (process.env.INDEXNOW_SITE_URL || "https://anycap.ai").replace(
  /\/+$/,
  "",
);
const indexNowKey = process.env.INDEXNOW_KEY?.trim() ?? "";

function isCloudflarePreviewDeployment() {
  const branch = (process.env.CF_PAGES_BRANCH || "").toLowerCase();
  return Boolean(branch && branch !== "main");
}

function isVercelPreviewDeployment() {
  const env = (process.env.VERCEL_ENV || "").toLowerCase();
  return Boolean(env && env !== "production");
}

function shouldAllowIndexing() {
  if (isVercelPreviewDeployment()) {
    return false;
  }

  if (isCloudflarePreviewDeployment()) {
    return false;
  }

  if (process.env.INDEXNOW_PUBLISH === "1") {
    return true;
  }

  if (process.env.CF_PAGES_BRANCH || process.env.VERCEL_ENV) {
    return true;
  }

  if (process.env.NODE_ENV === "production") {
    return true;
  }

  return false;
}

function loadRoutes() {
  const manifest = JSON.parse(readFileSync(seoManifestPath, "utf8"));
  const routes = new Set(["/", "/agent", ...(manifest.routes ?? [])]);
  return [...routes].sort();
}

async function submitIndexNow(urls) {
  const response = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      host: new URL(canonicalSiteUrl).host,
      key: indexNowKey,
      keyLocation: `${canonicalSiteUrl}/${indexNowKey}.txt`,
      urlList: urls,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`IndexNow submission failed (${response.status})${body ? `: ${body}` : ""}`);
  }

  return response;
}

async function main() {
  if (!shouldAllowIndexing()) {
    console.log("IndexNow skipped: non-production deployment.");
    return;
  }

  if (!indexNowKey) {
    console.log("IndexNow skipped: missing INDEXNOW_KEY.");
    return;
  }

  const urls = loadRoutes().map((route) => new URL(route, canonicalSiteUrl).toString());
  if (urls.length === 0) {
    console.log("IndexNow skipped: no URLs to submit.");
    return;
  }

  await submitIndexNow(urls);
  console.log(`IndexNow submitted ${urls.length} URLs for ${canonicalSiteUrl}.`);
}

try {
  await main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.warn(`IndexNow publish skipped: ${message}`);
}
