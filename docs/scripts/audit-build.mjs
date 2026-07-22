import { readFile, readdir, stat } from 'node:fs/promises';
import { extname, join, relative, resolve } from 'node:path';

const dist = resolve('dist');
const canonicalOrigin = 'https://docs.anyware.ai';
const expectedIndexablePages = 28;
const errors = [];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(path)));
    if (entry.isFile()) files.push(path);
  }
  return files;
}

function hasTag(html, tag, attributes) {
  const openingTags = html.match(new RegExp(`<${tag}\\b[^>]*>`, 'gi')) ?? [];
  return openingTags.some((openingTag) =>
    Object.entries(attributes).every(([name, value]) => {
      const match = openingTag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, 'i'));
      return match && (value instanceof RegExp ? value.test(match[1]) : match[1] === value);
    })
  );
}

async function pathExists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function internalTargetExists(href) {
  const url = new URL(href, canonicalOrigin);
  if (url.origin !== canonicalOrigin) return true;
  const pathname = decodeURIComponent(url.pathname);
  const target = join(dist, pathname.replace(/^\//, ''));
  return (
    (await pathExists(target)) ||
    (await pathExists(join(target, 'index.html'))) ||
    (extname(target) === '' && (await pathExists(`${target}.html`)))
  );
}

const allFiles = await walk(dist);
const htmlFiles = allFiles.filter((file) => file.endsWith('.html'));
const indexablePages = htmlFiles.filter((file) => relative(dist, file) !== '404.html');
const canonicals = new Set();

for (const file of htmlFiles) {
  const name = relative(dist, file);
  const html = await readFile(file, 'utf8');

  if (!/<title>[^<]+<\/title>/i.test(html)) errors.push(`${name}: missing title`);

  if (name !== '404.html') {
    if (!hasTag(html, 'meta', { name: 'description', content: /\S/ })) {
      errors.push(`${name}: missing meta description`);
    }
    if (!hasTag(html, 'meta', { property: 'og:image', content: /^https:\/\/docs\.anyware\.ai\// })) {
      errors.push(`${name}: missing absolute Open Graph image`);
    }
    const canonical = html.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i)?.[1];
    if (!canonical?.startsWith(`${canonicalOrigin}/`)) {
      errors.push(`${name}: missing canonical URL`);
    } else if (canonicals.has(canonical)) {
      errors.push(`${name}: duplicate canonical URL ${canonical}`);
    } else {
      canonicals.add(canonical);
    }

    const h1Count = (html.match(/<h1\b/gi) ?? []).length;
    if (h1Count !== 1) errors.push(`${name}: expected one h1, found ${h1Count}`);

    const schemaBlocks = [
      ...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
    ];
    if (schemaBlocks.length === 0) errors.push(`${name}: missing JSON-LD`);
    for (const [, schema] of schemaBlocks) {
      try {
        JSON.parse(schema);
      } catch (error) {
        errors.push(`${name}: invalid JSON-LD (${error.message})`);
      }
    }
  }

  for (const image of html.match(/<img\b[^>]*>/gi) ?? []) {
    if (!/\balt=["'][^"']*["']/i.test(image)) errors.push(`${name}: image is missing alt text`);
  }

  for (const match of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)) {
    const href = match[1];
    if (/^(#|mailto:|tel:|javascript:)/i.test(href)) continue;
    if (!(await internalTargetExists(href))) errors.push(`${name}: broken internal link ${href}`);
  }
}

const requiredArtifacts = [
  '404.html',
  '_headers',
  '_redirects',
  'assets/social-card.png',
  'llms.txt',
  'robots.txt',
  'sitemap-index.xml',
  'site.webmanifest',
];
for (const artifact of requiredArtifacts) {
  if (!(await pathExists(join(dist, artifact)))) errors.push(`missing release artifact: ${artifact}`);
}

const robots = await readFile(join(dist, 'robots.txt'), 'utf8');
if (!robots.includes(`${canonicalOrigin}/sitemap-index.xml`)) {
  errors.push('robots.txt does not reference the canonical sitemap');
}

const sitemapFiles = allFiles.filter((file) => /^sitemap-\d+\.xml$/.test(relative(dist, file)));
const sitemap = (await Promise.all(sitemapFiles.map((file) => readFile(file, 'utf8')))).join('\n');
for (const canonical of canonicals) {
  if (!sitemap.includes(`<loc>${canonical}</loc>`)) errors.push(`sitemap is missing ${canonical}`);
}

if (indexablePages.length !== expectedIndexablePages) {
  errors.push(
    `expected ${expectedIndexablePages} indexable pages, found ${indexablePages.length}; update the invariant intentionally when adding or removing content`
  );
}
if (canonicals.size !== indexablePages.length) {
  errors.push(`canonical count ${canonicals.size} does not match indexable page count ${indexablePages.length}`);
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(
    `SEO audit passed: ${indexablePages.length} indexable pages, ${htmlFiles.length} HTML files, and ${requiredArtifacts.length} release artifacts.`
  );
}
