---
name: anycap-ai-tool-seo
description: "Audit and plan organic search for AI tool, SaaS, and product-led websites. Use for Search Console diagnosis, existing-page optimization, search intent and page ownership, technical indexing, content briefs, international SEO, citations, or programmatic SEO. Start with measured visibility and existing URLs before recommending new pages."
metadata:
  version: 0.6.5
  website: https://anycap.ai
license: MIT
compatibility: Works with a browser, SEO platform, or local site data. AnyCap CLI is an optional web research tool, not an SEO prerequisite.
---

# AnyCap AI Tool SEO

Audit search visibility and decide what to fix, improve, consolidate, or publish next. A technically valid page is only eligible for indexing; it is not guaranteed to be crawled, indexed, or ranked.

Read [framework.md](references/framework.md), [page-planning.md](references/page-planning.md), and [guardrails.md](references/guardrails.md) before recommending site-wide changes. Use the current site and first-party evidence as the source of truth for its status.

## Workflow

### 1. Establish the baseline

- Identify the site, searcher, target market, conversion path, current URL inventory, and recently changed or retired URLs. Infer missing context from the site when possible.
- In Google Search Console (GSC), compare complete date ranges and page/query cohorts. Separate branded from non-branded searches and current URLs from retired URLs. Record impressions, clicks, index coverage, and the last complete data date. Do not infer that a past algorithmic visibility loss has ended solely because manual actions and security issues are clear.
- Use Ahrefs or similar tools for competitor discovery and keyword estimates; use GSC for the site's observed Google Search performance. Label estimates and time windows.
- If GSC is unavailable, say which conclusions remain unverified and continue with public crawling and site evidence.

### 2. Map each intent to an existing URL

- Before proposing a page, identify its current owner. Check that URL's response code, robots directives, canonical, sitemap presence, internal links, rendered content, and GSC URL Inspection when available.
- Distinguish stored inspection data from a live test. Record Google's last crawl date. A live test showing eligibility does not mean the URL is indexed.
- Apply the decision table in [framework.md](references/framework.md). Fix a genuine technical blocker first; improve or consolidate an existing owner before adding a competing URL. Allow recent changes time to be recrawled before judging their effect.

### 3. Research demand and SERP intent

- Inspect current search results in the target country and language, preferably through a search interface that actually shows that engine's results. Record dominant intent, page types, evidence, and gaps. One query sample is not a stable ranking study.
- `anycap search --query "<topic>" --no-crawl --max-results 10` can find public pages for further reading. It is a general web search sample, not a Google rank tracker or source of search volume. Use it only when the CLI is available and helpful; authentication is not required for the rest of this workflow.
- Validate whether the product fulfills the searcher's task. Avoid keyword variants that duplicate the same intent and page owner.

### 4. Choose and execute the smallest useful change

- Improve an existing page when it already owns the intent: answer the task clearly, add verified first-hand evidence, state real limitations, make the product path useful, and link from relevant pages.
- Consolidate overlapping pages when they split the same intent. Create a new page only for a distinct task the current inventory does not serve.
- Use structured data only when the page and Google feature support it. Do not add FAQ sections or markup mechanically.
- For translated pages, verify that the main content is genuinely localized and that canonical and hreflang relationships are correct. Do not prune a language merely because a short GSC window has few impressions.

### 5. Prioritize and measure

- Rank opportunities by observed blocker or demand, user value, evidence readiness, implementation effort, and risk of duplicate intent. Fix shared crawl/index issues before scaling content.
- Publish a small, reviewable set. Track crawl/index status and page/query cohorts after Google processes the change; avoid fixed ranking deadlines or promises. Sitemap submission and recrawl requests are discovery aids, not indexing guarantees.
- Deliver a concise evidence table: query/task, current owner, GSC status/date, SERP finding, action (fix/update/consolidate/new/wait), priority, and measurement plan. Add page briefs only for justified new or substantial rewrite work.

## Optional AnyCap commands

For web research when the CLI is available, consult the `anycap-cli` skill for syntax and current behavior:

```bash
anycap crawl https://example.com
anycap search --query "image generation api" --no-crawl --max-results 10
```

These commands do not report Google Search Console metrics, Google index status, or exact Google SERP positions. Do not run unrelated model-generation tests as a prerequisite for SEO diagnosis.

## Evidence and privacy

- Separate official search guidance, observed site data, third-party estimates, and practitioner hypotheses.
- Do not fabricate product tests, testimonials, benchmarks, customer logos, or rankings.
- Keep authenticated GSC/Ahrefs exports, account identifiers, and private dashboard screenshots in a private ignored location; publish only sanitized conclusions when a repository record is needed.

## Resources

- [framework.md](references/framework.md) — baseline, indexing decisions, and prioritization
- [page-planning.md](references/page-planning.md) — intent ownership and page briefs
- [guardrails.md](references/guardrails.md) — Google guidance and quality boundaries
