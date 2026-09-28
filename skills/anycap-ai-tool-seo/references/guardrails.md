# Guardrails

Use Google's public documentation for Google-specific rules, and label other SEO tactics as hypotheses. Check current documentation when guidance may have changed.

## Indexing and measurement

- Google's [Search Essentials](https://developers.google.com/search/docs/essentials) say meeting technical requirements does not guarantee crawling, indexing, or serving. A live URL test and a clear manual-action report do not establish that previous algorithmic visibility loss has ended.
- A [sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap) helps discovery but does not guarantee indexing. Use `<lastmod>` only for significant, real changes; do not repeatedly resubmit an unchanged sitemap as a growth tactic.
- [Recrawl requests](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl) can take days to weeks and do not guarantee inclusion. Repeating the request does not make Google crawl faster.
- Compare complete GSC dates and URL cohorts. Do not equate third-party estimated traffic with observed GSC traffic.

## Content and search appearance

- Follow [people-first content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content). There is no preferred word count; changing a date without meaningful changes is not a freshness strategy. “E-E-A-T” is a useful way to assess credibility, not a single direct ranking factor.
- [Scaled content abuse](https://developers.google.com/search/docs/essentials/spam-policies) can apply regardless of whether text is produced by humans or AI. Do not mass-publish keyword variants, doorway pages, or lightly rewritten pages.
- Google [retired the FAQ rich result feature in May 2026](https://developers.google.com/search/updates) and removed its documentation in June 2026. A useful FAQ may still help readers, but `FAQPage` markup is not a Google Search enhancement tactic. Follow [structured-data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies) and current feature eligibility; markup does not guarantee a rich result.
- Google's [generative AI Search guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) applies core SEO to AI Overviews and AI Mode. Google Search does not use `llms.txt` as a ranking or visibility signal, requires no special AI schema or “chunking,” and warns against separate pages for fan-out query variants. Maintain `llms.txt` only if another intended consumer needs it.
- For international pages, follow [localized-version guidance](https://developers.google.com/search/docs/specialty/international/localized-versions): localize the main content, make alternate references reciprocal, and use a suitable canonical per language. Do not remove a locale merely because a short observation period is quiet.

## Links and trust

- Prefer relevant editorial mentions and user-serving internal links. Do not recommend paid link schemes, bulk exchanges, or low-quality directory volume. Qualify paid placements with [appropriate link attributes](https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links).
- Do not fabricate testimonials, logos, benchmark results, or product demonstrations. Do not claim dwell time, bounce rate, “last click,” or Chrome data are official standalone ranking factors.

## Programmatic SEO gate

Proceed only when each page serves a distinct task with substantive unique data, accurate and maintainable content, working internal navigation, and a quality review process. Pilot a small set and check real index/performance outcomes before scale. A pruning plan is useful for future maintenance, but `noindex` is not a substitute for deciding whether low-value pages should be published at all.

Stop when templates merely swap city, model, brand, or keyword names; when the page exists only to funnel elsewhere; or when facts cannot be verified and updated.
