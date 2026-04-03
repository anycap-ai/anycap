# Web Search

Search the web with two modes: `--query` for structured web search results, or `--prompt` for LLM-synthesized answers with citations.

## Quick Reference

| I want to... | Command | Credits |
|---|---|---|
| Find pages about a topic | `anycap search --query "topic"` | 1 |
| Get just URLs (no page content) | `anycap search --query "topic" --no-crawl` | 1 |
| Filter by recent time window | `add --time-range week` | |
| Filter by exact date range | `add --after 2025-01-01 --before 2025-06-30` | |
| Limit to specific domains | `add --include github.com` | |
| Get a synthesized answer | `anycap search --prompt "question?"` | 5 |
| Read a specific known URL | `anycap crawl <url>` (see crawl.md) | 1 |

**Use exactly one of `--query` or `--prompt`.** Passing both is an error. Passing neither shows usage help.

## General Search (--query)

Returns a list of web search results with title, URL, description, and optionally full page content.

```bash
anycap search --query "Go programming language"
anycap search --query "AI agent framework" --max-results 3

# Fast mode: titles and URLs only (no page content fetching)
anycap search --query "Go error handling" --no-crawl

# Recent results only (relative time window)
anycap search --query "Go 1.25 release" --time-range month

# Exact date range (automatically uses precise date search)
anycap search --query "Claude Code release" --after 2025-06-01
anycap search --query "AI news" --after 2025-01-01 --before 2025-06-30

# Domain filtering
anycap search --query "Go context" --include github.com --include stackoverflow.com
anycap search --query "React hooks" --exclude w3schools.com --exclude pinterest.com

# Extract titles and URLs
anycap search --query "Go error handling" --no-crawl | jq -r '.data.results[] | "\(.title) -- \(.url)"'

# Get content of first result
anycap search --query "Go context" | jq -r '.data.results[0].content'
```

### Options

| Flag | Default | Description |
|------|---------|-------------|
| `--max-results` | 5 | Max results 1-20 |
| `--time-range` | | Relative recency filter: `day`, `week`, `month`, `year` |
| `--after` | | Only results published after this date (YYYY-MM-DD) |
| `--before` | | Only results published before this date (YYYY-MM-DD) |
| `--include` | | Only search within these domains (repeatable) |
| `--exclude` | | Exclude these domains from results (repeatable) |
| `--no-crawl` | false | Skip full content crawling, return titles/URLs/descriptions only |

### Date Filtering: --time-range vs --after/--before

These are two different mechanisms and should not be combined:

- **`--time-range`** uses relative recency filtering (e.g. "past week"). Good for general freshness.
- **`--after` / `--before`** use precise date-based filtering with the exact dates you specify. Good for researching a specific time period.

If both are provided, `--after`/`--before` take priority and `--time-range` is ignored.

The `published_at` field in results is reliably populated when using `--after`/`--before`. With `--time-range` or no date filter, `published_at` may be empty.

### Response

```json
{
  "status": "success",
  "data": {
    "mode": "general",
    "query": "Go programming language",
    "results": [
      {
        "title": "The Go Programming Language",
        "url": "https://go.dev/",
        "description": "An open-source programming language...",
        "content": "Full page content in markdown...",
        "published_at": ""
      }
    ],
    "credit_cost": 1
  },
  "request_id": "trc_abc123"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `data.query` | string | Echo of the original search query |
| `data.results` | []object | List of search results |
| `data.results[].title` | string | Page title |
| `data.results[].url` | string | Page URL |
| `data.results[].description` | string | Short description/snippet (may be empty for some results) |
| `data.results[].content` | string | Full page content in markdown. Empty string when `--no-crawl` is used. |
| `data.results[].published_at` | string | Publication date (reliably set with `--after`/`--before`; may be empty otherwise) |
| `data.credit_cost` | int | Credits consumed (always 1) |

## Grounding Search (--prompt)

LLM-powered search with citations grounded in real-time web data. The model generates search queries, retrieves results, and produces a synthesized answer with per-segment source attribution.

Best for: complex questions, comparisons, "what is X", "how does X compare to Y".

```bash
anycap search --prompt "What are the latest changes in Go 1.25?"
anycap search --prompt "Compare React vs Vue in terms of performance"

# Get just the answer text
anycap search --prompt "What is context engineering?" | jq -r '.data.content'

# Get sources
anycap search --prompt "latest Go releases" | jq -r '.data.search_metadata.sources[] | "\(.title): \(.uri)"'

# Get citations with source indices
anycap search --prompt "latest Go releases" | jq -r '.data.search_metadata.citations[] | "[\(.source_indices | join(","))] \(.text)"'
```

Note: `--prompt` means "ask a question and get a synthesized answer grounded in web search results." It is not an LLM system prompt.

### Response

```json
{
  "status": "success",
  "data": {
    "mode": "grounding",
    "query": "What are the latest changes in Go 1.25?",
    "content": "Go 1.25 introduces several changes...",
    "search_metadata": {
      "queries": ["Go 1.25 changes", "Go 1.25 release notes"],
      "sources": [
        {"index": 1, "title": "go.dev", "uri": "https://go.dev/doc/go1.25"},
        {"index": 2, "title": "github.com", "uri": "https://github.com/golang/go/milestone/..."}
      ],
      "citations": [
        {
          "start_index": 0,
          "end_index": 72,
          "text": "Go 1.25 introduces several changes...",
          "source_indices": [1, 2]
        }
      ]
    },
    "credit_cost": 5
  },
  "request_id": "trc_abc123"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `data.query` | string | Echo of the original prompt |
| `data.content` | string | The generated answer text |
| `data.search_metadata` | object/null | Structured grounding data (null if the model decided not to search) |
| `data.search_metadata.queries` | []string | Search queries the model generated and executed |
| `data.search_metadata.sources` | []object | Web sources used, each with 1-based `index`, `title`, and `uri` |
| `data.search_metadata.citations` | []object | Per-segment attribution: `start_index`/`end_index` in `content` mapped to `source_indices` |
| `data.credit_cost` | int | Credits consumed (always 5) |

## Error Responses

All errors return JSON with an `error` field:

```json
{"error": "INSUFFICIENT_CREDIT", "message": "insufficient credit", "request_id": "trc_abc123"}
```

```json
{"error": "missing_input", "message": "query is required", "request_id": "trc_abc123"}
```

```json
{"error": "RATE_LIMITED", "message": "rate limit exceeded, retry after 60s", "request_id": "trc_abc123"}
```

Common error codes: `INSUFFICIENT_CREDIT`, `RATE_LIMITED`, `FEATURE_DISABLED`, `FEATURE_NOT_ALLOWED`, `missing_input`, `invalid_param`, `auth_invalid`.

## jq Patterns

| Pattern | Purpose |
|---------|---------|
| `jq -r '.data.results[] \| "\(.title) -- \(.url)"'` | General: titles and URLs |
| `jq -r '.data.results[0].content'` | General: content of first result |
| `jq -r '.data.query'` | Echo back the query |
| `jq -r '.data.content'` | Grounding: answer text |
| `jq -r '.data.search_metadata.sources[] \| "\(.title): \(.uri)"'` | Grounding: list sources |
| `jq -r '.data.search_metadata.citations[] \| "[\(.source_indices \| join(","))] \(.text)"'` | Grounding: citations with sources |

## When to Use --query vs --prompt vs crawl

| Scenario | Use | Why |
|----------|-----|-----|
| Find pages/links on a topic | `--query` | Structured results list |
| Quick titles-only scan | `--query --no-crawl` | Fast, low token output |
| Get full page content for multiple results | `--query` | Results include crawled content |
| Direct question needing a synthesized answer | `--prompt` | LLM synthesizes across sources |
| Complex comparison or analysis | `--prompt` | LLM reasons over multiple sources |
| Read a specific known URL | `anycap crawl <url>` | Direct page-to-markdown |

## Limitations

- General search returns up to 20 results maximum.
- By default, general search crawls every result page for full content. Use `--no-crawl` if you only need titles and URLs.
- Grounding search may return `search_metadata: null` if the model decides the question does not need web search.
- Very large page content in results may be truncated by the upstream provider.
- `--include` / `--exclude` filter by domain name (e.g. `github.com`), not by URL path or content keywords.
- Non-English queries are supported but result quality may vary.
