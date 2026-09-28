# Framework

Use this evidence-led sequence: **measure → identify the existing URL owner → diagnose its status → research intent → act → measure again**.

## Site and searcher

Capture the searcher's role, task, intent stage, target country/language, needed evidence, and real conversion path. Infer unknowns from the product and label them as assumptions. Product fit matters: a page should help complete the task or take a natural next step.

## Evidence hierarchy

| Source | Good for | Limitation |
| --- | --- | --- |
| GSC Performance | Observed Google impressions, clicks, queries, and pages for this property | Recent data can be incomplete; low-volume rows may be withheld |
| GSC Page indexing and URL Inspection | Google's recorded indexing state and last crawl for a URL | Stored state can lag a recent deployment; live test checks current eligibility only |
| Live HTTP/render crawl | Current status, robots, canonical, links, and visible content | Does not prove Google has recrawled or indexed the URL |
| Ahrefs and similar tools | Keyword ideas, competitor URLs, link research, directional estimates | Not a substitute for first-party GSC performance or exact Google index state |
| Live SERP sample | Current result mix and searcher expectations | Varies by place, time, personalization, and query formulation |

Compare like-for-like GSC periods and note the last complete date. Segment branded/non-branded, homepage/non-homepage, active/retired URLs, and language when that changes the conclusion. A site-wide average can hide a page-level indexing problem.

## Decision gate

| Observation | Next action |
| --- | --- |
| Current URL is blocked, errors, redirects unexpectedly, or canonicalizes elsewhere | Fix or intentionally retire the URL; verify the live response and linking |
| Discovered or crawled, currently not indexed | Check last crawl, duplication, content value, internal links, and sitemap inclusion; improve or consolidate the existing owner where warranted; re-evaluate after recent changes are crawled |
| Indexed, few relevant impressions | Validate target demand and intent; improve the page's task fit and distribution; do not assume a penalty |
| Indexed with relevant impressions but weak clicks | Inspect query/page intent and search appearance; improve title and snippet if the result undersells the page |
| Strong existing owner for the same task | Update it; avoid a second near-duplicate URL |
| Distinct user task with no adequate owner | Brief a new page with original evidence and a measurable purpose |

No manual action is useful evidence, but it does not prove an algorithmic demotion has ended. Technical eligibility, sitemap submission, and an indexing request do not guarantee indexing or ranking.

## Page value and trust

Look for first-hand screenshots, tested outputs, reproducible workflows, meaningful examples, limitations, and accurate product facts. These are editorial standards, not a numeric “information gain” ranking formula. Use authentic customer proof and editorial mentions only when verified. Favor relevant internal links that help users navigate, and earn external mentions through useful work rather than volume targets.

## Prioritization

Prioritize a confirmed blocker affecting many useful URLs, then an existing page with demonstrated demand, then a distinct missing task with evidence ready to publish. Commercial intent can matter, but it does not override indexability, content value, or duplicate intent. Treat programmatic SEO as a later, quality-gated option rather than a default growth phase.
