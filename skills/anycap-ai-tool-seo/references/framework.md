# Framework

Use this file to keep the stable, reusable parts of the method while separating hard constraints from heuristics.

## Core Model

Treat AI tool SEO as five linked systems:

1. ICP and task definition
2. Search-Fit Product
3. Information Gain
4. Technical visibility
5. Trust distribution

### 1. ICP and task definition

Define the searcher before the keyword. Use this 6-field template:

| Field | What to capture |
| --- | --- |
| Role | User, buyer, learner, developer, team lead |
| Industry | Who the tool is primarily for |
| Task | What the searcher wants to finish after searching |
| Intent stage | Informational, Commercial, Transactional, Navigational |
| Evidence preference | Price, privacy, quality, speed, API, examples, benchmarks |
| Conversion path | Demo -> signup -> trial -> paid, or another real path |

If the user did not provide ICP details, infer them from the site, but mark the inference clearly.

### 2. Search-Fit Product

Ask whether the page helps the user finish the job on-page or move naturally into the product.

Common mapping:

- transactional intent -> tool page, feature page, demo page, pricing page
- commercial intent -> comparison page, alternatives page, buyer guide
- informational intent -> tutorial, workflow guide, glossary page, template explainer
- navigational intent -> homepage, login page, docs page, API page, brand page

### 3. Information Gain

Prefer evidence that cannot be cheaply cloned:

- original screenshots
- tested outputs
- benchmarks
- before / after examples
- real workflows
- product constraints and trade-offs
- proprietary data or carefully structured data

Treat information gain as a content standard, not as a magic ranking formula.

### 4. Technical visibility

Technical work should make pages crawlable, indexable, renderable, and understandable.

Minimum baseline:

- `robots.txt`
- `sitemap.xml` with useful `lastmod` values
- canonical handling
- correct status codes and redirects
- clear titles and snippets
- image alt text
- appropriate structured data
- acceptable page experience and Core Web Vitals

### 5. Trust distribution

Do not reduce this to "get backlinks."

- internal links from hubs to money pages
- mentions or placements in directories, review sites, communities, and resource pages
- sponsored exposure when it is genuinely useful and compliant
- on-page trust blocks: customer logos, reviews, editor picks, media mentions

## Support Levels

Use this table to control certainty and tone in the final plan:

| Concept | Support level | How to use it |
| --- | --- | --- |
| people-first, original, useful content | High | Treat as a hard rule |
| crawl / index / render basics | High | Treat as a hard rule |
| search intent -> page type mapping | Medium-high | Validate with the live SERP |
| SEO as a system rather than isolated tricks | Medium-high | Use as the planning frame |
| Information Gain | Medium-high | Require concrete evidence blocks |
| Last-Click | Medium | Use as a user-satisfaction heuristic only |
| AI directories and citations | Medium | Use as a strategy backlog, not a universal answer |
| prove value before scaling pSEO | Medium-high | Treat as a rollout precondition |

## Default Prioritization

Default order:

1. pages closest to conversion
2. pages that win commercial investigation
3. tutorial content that supports trust and internal linking
4. pSEO only after a small set of hard pages has proven itself
