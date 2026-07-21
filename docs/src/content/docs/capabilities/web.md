---
title: Web Search and Crawl
description: Find structured web results, get grounded answers with citations, or convert a known webpage into Markdown.
---

## Choose the right operation

| Task | Command | Credit cost |
| --- | --- | --- |
| Find pages and inspect results | `anycap search --query` | 1 |
| Get a synthesized cited answer | `anycap search --prompt` | 5 |
| Read one known URL as Markdown | `anycap crawl <url>` | 1 |

## Structured search

```bash
anycap search --query "Go error handling" --no-crawl --max-results 10 \
  | jq -r '.data.results[] | "\(.title) — \(.url)"'
```

Remove `--no-crawl` when you need full Markdown content for every result. Filter by freshness, exact dates, or domains:

```bash
anycap search --query "agent releases" --time-range month
anycap search --query "language update" --after 2026-01-01 --before 2026-06-30
anycap search --query "context patterns" --include github.com --exclude pinterest.com
```

Do not combine `--time-range` with `--after` or `--before`; exact dates take precedence.

## Grounded search

```bash
anycap search --prompt "What changed in the latest Go release?" \
  | jq -r '.data.content'
```

Sources and per-segment citations are available under `data.search_metadata` when the grounding model decides to search.

## Crawl a page

```bash
anycap crawl https://go.dev/doc/ \
  | jq -r '.data.markdown'
```

Crawl extracts primary HTML content as Markdown. It does not download binary files and may not capture content rendered only after client-side JavaScript runs.
