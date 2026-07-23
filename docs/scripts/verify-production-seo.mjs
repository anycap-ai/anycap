import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const docsOrigin = 'https://docs.anycap.ai';
const dist = resolve('dist');
const errors = [];

function extractLocs(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
}

async function getText(url, options) {
  const response = await fetch(url, options);
  return { response, text: await response.text() };
}

function report(label, condition, detail) {
  if (!condition) errors.push(`${label}: ${detail}`);
}

const localSitemap = await readFile(resolve(dist, 'sitemap-0.xml'), 'utf8');
const expectedUrls = extractLocs(localSitemap).sort();
const expectedUrlSet = new Set(expectedUrls);

const { response: robotsResponse, text: robots } = await getText(`${docsOrigin}/robots.txt`);
report('robots.txt', robotsResponse.ok, `expected 200, got ${robotsResponse.status}`);
report('robots.txt', robots.includes(`${docsOrigin}/sitemap-index.xml`), 'does not reference the canonical sitemap index');

const { response: indexResponse, text: sitemapIndex } = await getText(`${docsOrigin}/sitemap-index.xml`);
report('sitemap-index.xml', indexResponse.ok, `expected 200, got ${indexResponse.status}`);
const sitemapUrls = extractLocs(sitemapIndex);
report('sitemap-index.xml', sitemapUrls.length > 0, 'does not contain a sitemap shard');

const liveUrls = [];
for (const sitemapUrl of sitemapUrls) {
  const { response, text } = await getText(sitemapUrl);
  report(sitemapUrl, response.ok, `expected 200, got ${response.status}`);
  liveUrls.push(...extractLocs(text));
}

const liveUrlSet = new Set(liveUrls);
for (const url of expectedUrls) report('live sitemap', liveUrlSet.has(url), `missing expected URL ${url}`);
for (const url of liveUrls) report('live sitemap', expectedUrlSet.has(url), `contains stale or unexpected URL ${url}`);
report('live sitemap', liveUrlSet.size === expectedUrlSet.size, `expected ${expectedUrlSet.size} canonical URLs, got ${liveUrlSet.size}`);

for (const url of expectedUrls) {
  const { response, text } = await getText(url);
  report(url, response.ok, `expected 200, got ${response.status}`);
  const canonical = text.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i)?.[1];
  report(url, canonical === url, `expected self-canonical ${url}, got ${canonical ?? 'none'}`);
}

const legacyRedirects = [
  [`${docsOrigin}/capabilities/music/`, `${docsOrigin}/capabilities/audio/`],
  [`${docsOrigin}/capabilities/models/`, 'https://anycap.ai/models'],
];
for (const [source, destination] of legacyRedirects) {
  const response = await fetch(source, { redirect: 'manual' });
  report(source, response.status === 301, `expected 301, got ${response.status}`);
  report(source, response.headers.get('location') === destination, `expected redirect to ${destination}, got ${response.headers.get('location') ?? 'none'}`);
}

if (errors.length > 0) {
  console.error('Production Docs SEO verification failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Production Docs SEO verification passed for ${expectedUrls.length} canonical URLs.`);
}
