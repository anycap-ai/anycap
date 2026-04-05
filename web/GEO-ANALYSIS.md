# GEO Analysis for anycap.ai

Audit date: 2026-04-03
Scope: live site (`https://anycap.ai`) plus local Next.js app in `web/`

## Implementation Update (local code): 2026-04-05

Since the original audit, the local Next.js app has already implemented several of the highest-value GEO content changes:

- `/models` was upgraded from a light index into a comparison-style hub with a dated answer-first summary, model comparison tables, FAQ content, FAQ schema, and a visual guide.
- `/models/*` detail pages now expose visible “Last updated” labels more consistently, and the weaker pages such as `/models/nano-banana-pro` and `/models/veo-3-1` were brought closer to the rest of the model template with comparison blocks and FAQ schema.
- `/capabilities/image-generation`, `/capabilities/video-generation`, and `/capabilities/music-generation` now include visible freshness cues, answer-first blocks, and stronger model-selection guidance.
- Several stale CLI examples were normalized to current model IDs and flags, reducing trust friction between page copy and the actual product surface.

Implication:

- The “visible freshness” and “comparison-style answer blocks” gaps are materially smaller in local code than they were at audit time.
- The biggest remaining GEO gaps are now more concentrated in homepage/`llms.txt` extraction quality, off-site entity corroboration, and source-backed evidence rather than in the model/capability page templates themselves.
## 1. GEO Readiness Score: 72/100

This site is already ahead of most early-stage GEO implementations on technical accessibility:

- Server-rendered HTML is available for key pages.
- AI crawlers are explicitly allowed in `robots.txt`.
- `/llms.txt` exists and is populated.
- Important pages already ship structured data.

The main ceiling is not crawlability. It is authority density and citation readiness:

- weak off-site entity/brand signals,
- uneven visible authorship and freshness cues,
- some passages are persuasive but not source-backed,
- the best answer blocks are concentrated in `/llms.txt` and a few integration pages rather than spread across all commercial landing pages.

## 2. Platform Breakdown

| Platform | Score | Why |
| --- | --- | --- |
| Google AI Overviews | 78/100 | Strong SSR, indexable pages, clean metadata, schema, and a large footprint of targeted landing pages. |
| ChatGPT web search | 69/100 | Good crawl access and `llms.txt`, but limited external entity corroboration and thin sameAs coverage. |
| Perplexity | 66/100 | Structured pages help, but Perplexity tends to reward community validation and linked evidence more heavily than the site currently shows. |

## 3. AI Crawler Access Status

Observed live at `https://anycap.ai/robots.txt` on 2026-04-03:

- `GPTBot`: allowed, `/dashboard` blocked
- `OAI-SearchBot`: allowed, `/dashboard` blocked
- `ChatGPT-User`: allowed, `/dashboard` blocked
- `ClaudeBot`: allowed, `/dashboard` blocked
- `PerplexityBot`: allowed, `/dashboard` blocked
- `*`: allowed, `/dashboard` blocked

Implementation matches the live output in [robots.ts](/Users/tyluo/go/src/engineering/anycap/web/src/app/robots.ts).

Assessment: strong.

## 4. llms.txt Status

Observed live at `https://anycap.ai/llms.txt` on 2026-04-03.

Current strengths:

- Present at the correct root path.
- Human-readable and agent-readable.
- Includes install steps, commands, capability table, pricing summary, and key links.
- Shares one source of truth with the landing markdown in [landing.ts](/Users/tyluo/go/src/engineering/anycap/web/src/content/landing.ts).

Current weaknesses:

- It reads more like product copy than a fact sheet in a few places.
- It has no compact “key facts” block for easy extraction.
- It does not cite primary sources for claims like pricing parity or product usage.
- It does not expose machine-readable licensing guidance beyond a plain “MIT License” line.

Assessment: good foundation, but not yet optimized for citation extraction.

## 5. Brand Mention Analysis

What is clearly present:

- GitHub presence via `https://github.com/anycap-ai/anycap`
- On-site organization schema with GitHub in `sameAs`

What I could not confirm through web search during this audit:

- Wikipedia or Wikidata entity presence
- meaningful Reddit discussion footprint
- meaningful YouTube mention footprint
- company LinkedIn presence

Implication:

- For Google AIO, this is survivable if the pages rank and answer well.
- For ChatGPT and Perplexity, this is a real limiter because off-site corroboration is still thin.

Assessment: weak-to-moderate entity footprint outside owned properties.

## 6. Passage-Level Citability

Best current citation candidates:

1. `/llms.txt` “What Is AnyCap”
Why it works:
- direct problem/solution framing,
- concrete capability list,
- self-contained,
- easy for an LLM to lift.

2. `/llms.txt` “Pricing”
Why it works:
- concise,
- contains a specific offer and pricing model.

3. `/for/cursor` FAQ answers and HowTo schema
Why it works:
- strong query match,
- explicit question/answer format,
- visible publication dates in schema,
- includes a demo video and installation steps.

4. `/about` sections “What AnyCap is” and “What AnyCap is not”
Why it works:
- definitional language,
- clean conceptual positioning.

Main passage problems:

- Several passages are slightly too brand-voice heavy for citation engines.
- Some strong claims are not attributed to outside evidence.
- The homepage/`llms.txt` lacks a compact 134-167 word “definition + proof points + use cases” block that an AI system can quote cleanly.
- Pages like pricing and about are informative, but not all of them surface “last updated” or author signals as visibly as the best `/for/*` pages.

## 7. Server-Side Rendering Check

Assessment: strong.

Evidence:

- Root layout and SEO pages run on Edge runtime in [layout.tsx](/Users/tyluo/go/src/engineering/anycap/web/src/app/layout.tsx), [(seo)/layout.tsx](/Users/tyluo/go/src/engineering/anycap/web/src/app/(seo)/layout.tsx), [page.tsx](/Users/tyluo/go/src/engineering/anycap/web/src/app/page.tsx).
- Live requests return HTML with metadata and JSON-LD without requiring client-side execution.
- Locale routes resolve server-side with canonical output such as `/en/pricing`.

Risk:

- Some pages visibly include client-render bailout markers in streamed HTML. This does not block indexing, but it means you should keep critical answer content and metadata server-first.

## 8. Top 5 Highest-Impact Changes

1. Add a compact “Key Facts” section to `/llms.txt` and the homepage.
Suggested facts:
- what AnyCap is,
- supported capability categories,
- install paths,
- pricing model,
- license,
- official repo,
- last updated date.

2. Add visible author/editor and exact update dates across remaining commercial SEO pages that still do not surface them clearly.
Best next targets:
- `/about`
- `/pricing`
- homepage
- `/llms.txt`

3. Replace unsupported social-proof phrasing with verifiable evidence.
Example: the line “Agents like Claude Code, Codex, Cursor, and Manus use AnyCap and say it works” in [landing.ts](/Users/tyluo/go/src/engineering/anycap/web/src/content/landing.ts) should either link to proof or be rewritten into a neutral product statement.

4. Expand organization entity signals.
Add more `sameAs` destinations once real profiles exist:
- LinkedIn
- YouTube
- X/GitHub Discussions if maintained
- Product Hunt or docs hub if authoritative

5. Create source-backed comparison or benchmark blocks on pricing and remaining commercial pages.
AI systems cite pages more readily when they contain:
- exact model/provider coverage,
- precise operational constraints,
- dated tables,
- attribution to official provider docs.

## 9. Schema Recommendations

Already good:

- `Organization` and `WebSite` in [layout.tsx](/Users/tyluo/go/src/engineering/anycap/web/src/app/layout.tsx)
- `TechArticle`, `FAQPage`, `HowTo`, and `VideoObject` patterns on `/for/*` pages such as [page.tsx](/Users/tyluo/go/src/engineering/anycap/web/src/app/(seo)/for/cursor/page.tsx)
- `Product`/`Offer` style data on [page.tsx](/Users/tyluo/go/src/engineering/anycap/web/src/app/(seo)/pricing/page.tsx)

Recommended next:

- Add `SoftwareApplication` schema to the CLI install page and main CLI page.
- Add `Person` schema for real authors/editors if named humans are available.
- Add `sameAs` expansion to organization schema once external profiles exist.
- Add `datePublished` and `dateModified` systematically to all article-like pages.
- Consider `ItemList` schema for capability index pages and model index pages.

## 10. Content Reformatting Suggestions

### Rewrite candidate 1: homepage / llms.txt definition block

Current issue:
- strong voice, but not optimized as a neutral citation block.

Recommended shape:

“AnyCap is an agent-native capability runtime for AI coding agents. It gives tools like Claude Code, Cursor, and Codex one install path and one credential for image generation, video generation, music generation, image understanding, video analysis, web search, web crawl, cloud storage, and static page publishing. AnyCap exposes these capabilities through a CLI that returns structured outputs and deterministic error codes, so agents can call them inside terminal-based workflows without switching providers or managing separate SDKs.”

Why:
- definitional first sentence,
- dense capability list,
- clean extraction candidate,
- roughly ideal citation shape.

### Rewrite candidate 2: pricing proof block

Add a compact block near the top of `/pricing`:

“AnyCap uses prepaid credits. New accounts receive $5 in free credit. After that, usage is billed at the same rate as the official model provider for supported capabilities, with no subscription fee and no platform markup. Credit packages are one-time purchases, and larger packages include bonus credits.”

Why:
- short factual paragraph,
- easy for AI answers to quote,
- directly answers “How does AnyCap pricing work?”

### Rewrite candidate 3: about page authority block

Add a short “Company facts” section:

- Company: AnyCap
- Product: agent-native capability runtime
- Primary interface: CLI + skill files
- Official repository: GitHub
- License: MIT
- Last updated: exact date

Why:
- improves extraction,
- improves entity clarity,
- adds durable facts instead of only narrative copy.

## 11. Technical Notes

- `robots.txt` is well-configured for AI search visibility in [robots.ts](/Users/tyluo/go/src/engineering/anycap/web/src/app/robots.ts).
- `/llms.txt` is correctly implemented in [route.ts](/Users/tyluo/go/src/engineering/anycap/web/src/app/llms.txt/route.ts).
- Sitemap generation is present in [sitemap.ts](/Users/tyluo/go/src/engineering/anycap/web/src/app/sitemap.ts).
- Organization schema currently points only to GitHub in [layout.tsx](/Users/tyluo/go/src/engineering/anycap/web/src/app/layout.tsx).
- `TechArticle` schema uses organization authorship in [schema.ts](/Users/tyluo/go/src/engineering/anycap/web/src/lib/schema.ts), which is acceptable, but named authors would be stronger if available.
- Local schema helpers now support `datePublished`, `dateModified`, and reusable FAQ JSON-LD in [schema.ts](/Users/tyluo/go/src/engineering/anycap/web/src/lib/schema.ts).
- Local model hub and capability pages now include stronger answer-first blocks and visible update dates in [page.tsx](/Users/tyluo/go/src/engineering/anycap/web/src/app/(seo)/models/page.tsx), [page.tsx](/Users/tyluo/go/src/engineering/anycap/web/src/app/(seo)/capabilities/image-generation/page.tsx), [page.tsx](/Users/tyluo/go/src/engineering/anycap/web/src/app/(seo)/capabilities/video-generation/page.tsx), and [page.tsx](/Users/tyluo/go/src/engineering/anycap/web/src/app/(seo)/capabilities/music-generation/page.tsx).

## 12. Overall Verdict

AnyCap is technically ready for AI search discovery now.

The next gains will not come from more crawl plumbing. They will come from:

- stronger entity corroboration off-site,
- tighter answer blocks on key pages,
- more visible authorship/freshness signals,
- replacing marketing-only claims with verifiable facts and linked evidence.

If you want, the best next implementation sprint is:

1. tighten `landing.ts` and `/llms.txt` into a more citeable fact sheet,
2. add reusable author/date components across the remaining non-updated commercial pages,
3. expand schema and organization `sameAs`,
4. add a higher-signal `/about` facts block,
5. create one or two source-backed benchmark/comparison pages.
