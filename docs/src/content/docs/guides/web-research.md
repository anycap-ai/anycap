---
title: Research the Web with Search and Crawl
description: Build a focused AnyCap research workflow with result discovery, selective crawling, and source-aware synthesis.
---

## 1. Narrow the search space

Start with structured results and skip full-page crawling while you classify sources:

```bash
anycap search \
  --query "MCP protocol release notes" \
  --no-crawl \
  --max-results 10 \
  | jq -r '.data.results[] | "\(.title) — \(.url)"'
```

Add `--include <domain>` for authoritative sources or `--time-range month` when recency matters.

## 2. Read only the useful pages

```bash
anycap crawl https://example.com/relevant-page \
  | jq -r '.data.markdown' > source.md
```

Crawl known HTML pages; use a download tool for PDFs, images, archives, or other binary resources.

## 3. Use grounded search for synthesis

When the task needs an answer across multiple current sources:

```bash
anycap search \
  --prompt "What changed in the latest MCP specification, and what affects local stdio servers?" \
  > grounded-answer.json
```

Inspect both the answer and its source mapping:

```bash
jq -r '.data.content' grounded-answer.json
jq -r '.data.search_metadata.sources[] | "\(.index). \(.title): \(.uri)"' grounded-answer.json
```

## 4. Preserve evidence

Record the query, retrieval date, URLs, relevant excerpts, and diagnostic `request_id`. Treat synthesized output as an aid to analysis, not a substitute for checking high-impact claims against primary sources.
