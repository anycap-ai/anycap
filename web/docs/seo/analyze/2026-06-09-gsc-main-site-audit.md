---
node_id: SEO-20260609-0900
date: 2026-06-09
scope: gsc-main-site-audit-excluding-hosted-pages
source: gsc-issues-anycap (4).csv
---

# GSC Main-Site SEO Audit (excluding `/page/`)

## Scope

- **Included:** `https://anycap.ai/*` routes outside `/page/`
- **Excluded:** 407 `/page/*` hosted CMS issues (84% of export)
- **Goal:** Improve main-site indexation and strengthen main-site ↔ hosted-page linkage

## Executive Summary

| Metric | Value |
|--------|-------|
| **Main-site SEO health (estimated)** | **64 / 100** |
| **Total GSC issues (main site)** | 78 |
| **Excluded hosted `/page/` issues** | 407 |
| **Business type** | B2B developer tool / AI agent capability runtime |

### Top 5 critical findings (main site)

1. **EN-only pages exposed as localized duplicates** — 28 `DUPLICATE_GOOGLE_CHOSE_DIFFERENT_CANONICAL` entries where Google prefers unprefixed EN URLs (`/for`, `/glossary`, `/compare/*`, locale homepages).
2. **Weak main-site internal links to discovered leaf pages** — `/for/claude-code/image-generation`, `/for/manus`, `/glossary/agent-capability-runtime` (dead slug), `/capabilities/video-generation`.
3. **Almost zero HTML internal links from main site to `/page/`** — only `robots.ts` sitemap reference and `llms.txt`; no footer/header/learn hub linkage before this batch.
4. **Localized learn/compare pages crawled but not indexed** — 29 URLs, concentrated in `pt-br/learn` (6) and `id/learn` (5).
5. **Broken legacy glossary slug** — `llms.txt` still linked `/glossary/agent-capability-runtime` after consolidation to `/glossary/agent-harness`.

### Top 5 quick wins (implemented in this batch)

1. Canonical + internal-link locale fallback for non-indexed localized shells.
2. Footer + Learn hub + Capabilities hub links to `/page/{locale}/ai|blog|news`.
3. `/for` hub entries for Claude Code image/video/opus leaf pages.
4. 308 redirect `agent-capability-runtime` → `agent-harness`.
5. `llms.txt` slug correction.

## GSC Issue Breakdown (main site only)

| Issue type | Count | Priority |
|------------|-------|----------|
| CRAWLED_CURRENTLY_NOT_INDEXED | 29 | High |
| DUPLICATE_GOOGLE_CHOSE_DIFFERENT_CANONICAL | 28 | Medium (many expected) |
| DISCOVERED_CURRENTLY_NOT_INDEXED | 14 | High |
| REDIRECT_ERROR | 3 | Low (expected `/models` → `/en/models`) |
| URL_UNKNOWN_TO_GOOGLE | 3 | Medium |
| EXCLUDED_BY_NOINDEX_TAG | 1 | Info |

### Locale distribution (main site)

| Locale | Issues |
|--------|--------|
| pt-br | 29 |
| id | 26 |
| root / EN-default | 13 |
| de | 10 |

## Technical SEO

### Crawlability / indexability

- `robots.ts` correctly lists both `sitemap.xml` and `/page/sitemap-index.xml`.
- Middleware strips trailing slashes and rewrites default-locale paths to `/en/*`.
- **Gap (fixed):** Localized shells for EN-only routes emitted localized canonicals and received localized internal links, inviting duplicate crawls.

### Canonical hygiene

Observed pattern in GSC duplicate cluster:

```
/pt-br/compare/anycap-vs-openclaw-image-generation → Google canonical: /compare/anycap-vs-openclaw-image-generation
/de/for → Google canonical: /for
/id/glossary → Google canonical: /glossary
```

Root cause: route exists in `[locale]/(seo)` but `seo-locale-rollout.ts` keeps default `["en"]` only. Page body is English; metadata is localized → near-duplicate.

**Remediation applied:** non-indexable localized requests now canonicalize to default-locale URL; `localizePublicPath()` links to EN path when locale is not in rollout.

### Redirect notes

| URL | GSC state | Assessment |
|-----|-----------|------------|
| `/models` | REDIRECT_ERROR | Expected 308 to `/en/models`; not blocking |
| `/cli` | REDIRECT_ERROR | Expected 308 to `/en/cli` |
| `/pricing` | REDIRECT_ERROR | Expected 308 to `/en/pricing` |

## Main site ↔ Hosted `/page/` linkage

### Before

| Signal | Main → `/page/` | `/page/` → Main |
|--------|-----------------|-----------------|
| Footer links | None | N/A (CMS) |
| Learn hub | None | Sparse |
| Capabilities hub | Text mention only | Sparse |
| `llms.txt` | Yes (AI crawler) | N/A |
| Sitemap cross-ref | `robots.ts` only | Separate sitemap index |

### After (this batch)

- Footer column **Published on AnyCap** → `/page/{locale}/ai`, `/blog`, `/news`
- Learn `/learn` adjacent hubs include hosted indexes per locale
- Capabilities related card → hosted blog index
- Central helper: `web/src/lib/seo/hosted-pages.ts`

Remaining gap (not in `web/` source): hosted CMS templates should reciprocate with prominent links back to `/capabilities`, `/for`, `/learn` — lives in Page/CMS layer.

## Content / On-Page (main site)

### Crawled-not-indexed clusters

| Path prefix | Count | Likely cause |
|-------------|-------|--------------|
| `pt-br/learn/*` | 6 | Quality / internal-link depth |
| `id/learn/*` | 5 | Same |
| `pt-br/compare/*` | 2 | EN-only compare shells |
| `id/compare/*` | 2 | EN-only compare shells |

Pages with real `pt-br`/`id` translations (e.g. influencer workflow cluster) need more inbound links from hub pages — not demotion.

### Discovered-not-indexed (needs crawl budget / links)

- `/for/claude-code/image-generation`
- `/for/claude-code/video-generation`
- `/for/manus`
- `/capabilities/video-generation`
- `/capabilities/web-search`

**Remediation applied:** `/for` hub now surfaces Claude Code leaf pages.

## Schema

- Organization + WebSite JSON-LD present sitewide.
- Previous batch fixed JSON-LD `url` locale mismatches (2026-04-29).
- Dead slug `agent-capability-runtime` removed from `llms.txt`; 308 redirect added.

## Prioritized action plan (remaining)

### Critical

_None blocking indexation on main site._

### High (next 1–2 weeks)

1. Monitor GSC duplicate cluster after canonical/link fallback deploys.
2. Request re-index for `/for/claude-code/image-generation` and `/for/manus` via Search Console.
3. Add CMS-side footer/header on `/page/*` templates linking to main hubs.

### Medium (next month)

1. Evaluate whether `compare-anycap-vs-openclaw-*`, `compare-anycap-vs-composio`, `learn-smart-goal-generator` need real translations or should stay EN-only with current fallback.
2. Reinforce `pt-br/learn` and `id/learn` orphan pages with hub `relatedLinks`.
3. Publish IndexNow for updated main-site URLs.

### Low / backlog

1. `BAILOUT_TO_CLIENT_SIDE_RENDERING` marker tracking (LoginButton).
2. Expand `sameAs` in Organization schema when profiles exist.

## Health score rationale

| Category | Weight | Score | Notes |
|----------|--------|-------|-------|
| Technical SEO | 25% | 72 | Canonical fix applied; redirects expected |
| Content quality | 25% | 58 | Localized learn pages need depth/links |
| On-page SEO | 20% | 65 | Hub linkage improved |
| Schema | 10% | 70 | Solid base; dead slug fixed |
| Performance | 10% | 70 | Edge SSR; not measured live |
| Images | 5% | 75 | CDN assets; not audited live |
| AI readiness | 5% | 55 | `llms.txt` fixed; claim consistency ongoing |

**Weighted total ≈ 64/100**
