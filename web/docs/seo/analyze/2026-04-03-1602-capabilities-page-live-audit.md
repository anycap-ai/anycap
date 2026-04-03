# [SEO-20260403-1602] `/en/capabilities` live SEO audit

- Time: `2026-04-03 16:02 CST`
- Node: `SEO-20260403-1602`
- Type: `analyze`
- Status: `done`
- Scope: `https://anycap.ai/en/capabilities`, `capability hub`, `live crawl`, `metadata`, `schema`, `llms.txt`, `capability claim alignment`
- Related:
  - [`../index.md`](../index.md)
  - [`2026-04-01-2021-current-seo-keyword-window-under-agents-guardrails.md`](2026-04-01-2021-current-seo-keyword-window-under-agents-guardrails.md)
  - [`2026-03-30-1545-narrative-ia-audit-and-nav-keyword-mapping.md`](2026-03-30-1545-narrative-ia-audit-and-nav-keyword-mapping.md)
  - [`2026-03-30-2342-anycap-live-geo-audit-refresh.md`](2026-03-30-2342-anycap-live-geo-audit-refresh.md)

## Executive Summary

`/en/capabilities` is live, indexable, included in `sitemap.xml`, and already has a solid SSR baseline:

- `200 OK` on `2026-04-03`
- canonical: `https://anycap.ai/en/capabilities`
- `robots`: `index, follow`
- included in live sitemap
- JSON-LD present: `Organization`, `WebSite`, `BreadcrumbList`, `TechArticle`, `ItemList`
- strong internal-link coverage to the four early-access capability leaves

The page is not failing technical SEO. The main problem is **message alignment**.

Right now the capability hub is relatively disciplined about public claims, but the rest of the public surface is not. Shared metadata, `llms.txt`, pricing copy, and about-page copy all describe a broader capability set than `/capabilities` does. That weakens entity clarity for both search engines and AI systems.

Estimated SEO Health Score for this route and its supporting signals: **75 / 100**

## Score Breakdown

| Category | Weight | Score | Notes |
| --- | --- | --- | --- |
| Technical SEO | 25 | `22/25` | Crawlable, indexable, canonicalized, sitemap + robots healthy |
| Content Quality | 25 | `16/25` | Clear narrative, but still thin for search intent and citability |
| On-Page SEO | 20 | `15/20` | Good title/description and heading structure, but keyword targeting is still abstract |
| Schema / Structured Data | 10 | `8/10` | Good baseline, but missing stronger page-type / FAQ support |
| Performance | 10 | `6/10` | Edge SSR is good, but lab verification was blocked and the page still shows client-render bailout markers |
| Images | 5 | `5/5` | No missing-image-alt exposure on this page |
| AI Search Readiness | 5 | `3/5` | `llms.txt` is live, but capability claims are not aligned across surfaces |

## Method

This audit used:

1. live fetches of:
   - `https://anycap.ai/en/capabilities`
   - `https://anycap.ai/robots.txt`
   - `https://anycap.ai/sitemap.xml`
   - `https://anycap.ai/llms.txt`
2. source review of:
   - `web/src/app/(seo)/capabilities/page.tsx`
   - `web/src/lib/site.ts`
   - `web/src/content/landing.ts`
   - `web/src/app/(seo)/pricing/page.tsx`
   - `web/src/app/(seo)/about/page.tsx`
3. cross-check against the current keyword guardrail and IA memos

Limitations:

- Google PageSpeed API returned `429 quota exceeded`
- local Lighthouse verification was blocked because no local Chrome binary was available
- performance scoring is therefore an estimate based on HTML response characteristics, not a fresh lab run

## What Is Working

### 1. Technical crawlability is healthy

- live response is `200`
- canonical resolves to the localized URL
- `robots.txt` allows crawling and explicitly includes major AI crawlers
- the route is present in live `sitemap.xml`
- the four early-access child pages linked from the hub also return `200`

### 2. Metadata and structure are already decent

- title and meta description clearly describe the page topic
- the page has one strong `h1` and a clean `h2` hierarchy
- breadcrumb markup and visual breadcrumb both exist
- `ItemList` schema gives Google and AI systems a readable list of early-access capabilities

### 3. Internal linking is not the bottleneck

The live HTML exposes the capability leaves and several supporting routes. This route already acts as a real hub, not a dead-end marketing page.

## Priority Findings

## High

### 1. Public capability claims are inconsistent across surfaces

This is the biggest SEO problem around `/capabilities`.

The capability hub itself keeps the public list relatively tight:

- early access: image generation, video generation, image understanding, video analysis
- coming soon: music, speech, search, crawl

Evidence:

- [`web/src/app/(seo)/capabilities/page.tsx` line 43](/Users/tyluo/go/src/engineering/anycap/web/src/app/(seo)/capabilities/page.tsx#L43)
- [`web/src/app/(seo)/capabilities/page.tsx` line 77](/Users/tyluo/go/src/engineering/anycap/web/src/app/(seo)/capabilities/page.tsx#L77)

But shared site copy and machine-readable copy describe a broader live set:

- shared site description includes `music generation` and `audio understanding`
- live `llms.txt` includes `Music Generation`, `Audio Understanding`, `Drive`, `Page`, and `Download`
- pricing metadata also claims `music generation`, `web search`, and `web crawl`
- about-page metadata inherits the broader shared capability summary

Evidence:

- [`web/src/lib/site.ts` line 27](/Users/tyluo/go/src/engineering/anycap/web/src/lib/site.ts#L27)
- [`web/src/content/landing.ts` line 13](/Users/tyluo/go/src/engineering/anycap/web/src/content/landing.ts#L13)
- [`web/src/content/landing.ts` line 55](/Users/tyluo/go/src/engineering/anycap/web/src/content/landing.ts#L55)
- [`web/src/app/(seo)/pricing/page.tsx` line 19](/Users/tyluo/go/src/engineering/anycap/web/src/app/(seo)/pricing/page.tsx#L19)
- [`web/src/app/(seo)/about/page.tsx` line 12](/Users/tyluo/go/src/engineering/anycap/web/src/app/(seo)/about/page.tsx#L12)

Why it matters:

- search engines and AI systems do better when one product entity makes one stable public claim set
- the capability hub cannot become the canonical ranking page for `agent capabilities` if neighboring surfaces keep widening the definition
- this inconsistency is especially risky for AI citations, because `llms.txt` is likely to be read as authoritative

### 2. The page underuses its intended search language

The current title is acceptable, but the page body is still more narrative than query-serving.

The repo’s own keyword memo frames `/capabilities` as the bridge for:

- `ai agent capabilities`
- `installable capabilities for agents`
- `agent capabilities`
- `capability runtime`

But the page body leans on a brand-forward hook:

- eyebrow: `Capability runtime`
- `h1`: `Your agent can reason. It still needs capabilities.`

Evidence:

- [`web/src/app/(seo)/capabilities/page.tsx` line 229](/Users/tyluo/go/src/engineering/anycap/web/src/app/(seo)/capabilities/page.tsx#L229)
- [`web/src/app/(seo)/capabilities/page.tsx` line 233](/Users/tyluo/go/src/engineering/anycap/web/src/app/(seo)/capabilities/page.tsx#L233)

What is missing:

- a direct definition block for what “agent capabilities” means
- stronger repetition of the install/search phrase set
- a short “how to add these capabilities” section that connects the hub to CLI/onboarding intent

This means the page is readable, but not yet maximally rankable.

## Medium

### 3. The hub gives too much space to roadmap capabilities

The page spends a full section on `Coming soon`, and the comparison table also groups `Music, speech, search, crawl` into the product narrative.

Evidence:

- [`web/src/app/(seo)/capabilities/page.tsx` line 179](/Users/tyluo/go/src/engineering/anycap/web/src/app/(seo)/capabilities/page.tsx#L179)
- [`web/src/app/(seo)/capabilities/page.tsx` line 395](/Users/tyluo/go/src/engineering/anycap/web/src/app/(seo)/capabilities/page.tsx#L395)

This is not a direct policy violation because the page labels them as future work, but it still creates two problems:

1. it dilutes the currently available value proposition
2. it pulls the page away from the cleaner “installable capabilities you can use now” intent

For a category hub that still needs stronger authority, current capability proof should take more space than future capability teasers.

### 4. The body does not do enough to bridge category intent into install intent

Main-article links currently emphasize:

- capability leaves
- models
- context engineering
- `/start`
- `/for/claude-code`
- `/learn/what-agents-cant-do`

Evidence:

- [`web/src/app/(seo)/capabilities/page.tsx` line 279](/Users/tyluo/go/src/engineering/anycap/web/src/app/(seo)/capabilities/page.tsx#L279)
- [`web/src/app/(seo)/capabilities/page.tsx` line 322](/Users/tyluo/go/src/engineering/anycap/web/src/app/(seo)/capabilities/page.tsx#L322)
- [`web/src/app/(seo)/capabilities/page.tsx` line 366](/Users/tyluo/go/src/engineering/anycap/web/src/app/(seo)/capabilities/page.tsx#L366)
- [`web/src/app/(seo)/capabilities/page.tsx` line 426](/Users/tyluo/go/src/engineering/anycap/web/src/app/(seo)/capabilities/page.tsx#L426)

What is still weak inside the article body:

- no inline CLI snippet
- no direct link block for `/cli`
- no direct link block for `/guides/install-anycap`
- no direct link block for `/skills`

Navigation and footer do expose some of these routes, but body-level internal linking would help both relevance and conversion.

### 5. Schema is good enough, but not yet shaped for richer search answers

Current schema:

- `Organization`
- `WebSite`
- `BreadcrumbList`
- `TechArticle`
- `ItemList`

This is a solid baseline, but the page is functioning more like a category or collection hub than a technical article. It also answers an obvious question set:

- what capabilities do agents usually miss
- which ones are available now
- how do I add them

That suggests room for:

- `CollectionPage` or stronger page-type alignment
- a short FAQ section with `FAQPage` schema
- tighter linkage from the hub to the product / install path entity

## Low

### 6. Technical hardening and performance verification still have gaps

Observed live response headers did not show:

- `content-security-policy`
- `strict-transport-security`
- `x-content-type-options`
- `referrer-policy`

This is more best-practice than direct ranking risk, but it is still worth tightening.

Also, the live HTML shows client-render bailout markers and heavy font preloading. That does not prove bad CWV, but it is enough to keep performance from receiving a top score until a fresh Lighthouse run is available.

## Top Quick Wins

1. Align the public capability inventory across `/capabilities`, `site.ts`, `llms.txt`, pricing metadata, and about metadata.
2. Rewrite the hero section so the `h1` and intro explicitly cover `AI agent capabilities` and `installable capabilities for agents`.
3. Replace or shrink the current `Coming soon` section so it does not compete with present-day capabilities.
4. Add a short install bridge section with links to `/cli`, `/guides/install-anycap`, and `/skills`.
5. Add a small FAQ block for capability intent and installation intent, then emit `FAQPage` schema.

## Recommended Next Move

The next SEO change on this route should not start with styling or micro-copy.

It should start with **claim consolidation**:

1. decide the public canonical capability list
2. make `site.ts`, `/capabilities`, `/llms.txt`, `/pricing`, and `/about` say the same thing
3. only then refine `/capabilities` copy around the chosen keyword window

If that sequence is reversed, the page may improve locally while the overall site entity remains fuzzy.

## Verification Notes

Verified live on `2026-04-03`:

- `https://anycap.ai/en/capabilities`
- `https://anycap.ai/robots.txt`
- `https://anycap.ai/sitemap.xml`
- `https://anycap.ai/llms.txt`

Blocked verifications:

- fresh PageSpeed API run: blocked by Google `429 quota exceeded`
- local Lighthouse run: blocked because no local Chrome binary was available in the current environment
