# Web Crawl

Convert any web page to clean Markdown with title extraction. Useful for reading documentation, extracting article content, or getting structured text from a URL.

## Quick Reference

| I want to... | Command | Credits |
|---|---|---|
| Read a web page as markdown | `anycap crawl <url>` | 1 |
| Get just the page title | `anycap crawl <url> \| jq -r '.data.title'` | 1 |
| Get just the markdown content | `anycap crawl <url> \| jq -r '.data.markdown'` | 1 |
| Find pages first, then read | Use `anycap search` first, then `crawl` specific URLs | 1+1 |

## Command

```bash
anycap crawl <url>
```

Single argument: the URL to crawl. No flags needed.

## Examples

```bash
# Crawl a page (returns title + markdown + url)
anycap crawl https://go.dev

# Extract just the markdown content
anycap crawl https://docs.go.dev/ref/spec | jq -r '.data.markdown'

# Get the page title
anycap crawl https://go.dev | jq -r '.data.title'

# Crawl documentation
anycap crawl https://docs.python.org/3/library/asyncio.html | jq -r '.data.markdown'
```

## Response Format

```json
{
  "status": "success",
  "data": {
    "url": "https://go.dev",
    "title": "The Go Programming Language",
    "markdown": "# The Go Programming Language\n\nBuild simple, secure, scalable systems...",
    "credit_cost": 1
  },
  "request_id": "trc_abc123"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `data.url` | string | The URL that was crawled |
| `data.title` | string | Page title extracted from metadata (may be empty if unavailable) |
| `data.markdown` | string | Page content converted to Markdown |
| `data.credit_cost` | int | Credits consumed (always 1) |

## Error Responses

```json
{"error": "missing_input", "message": "url is required", "request_id": "trc_abc123"}
```

```json
{"error": "INSUFFICIENT_CREDIT", "message": "insufficient credit", "request_id": "trc_abc123"}
```

Common error codes: `INSUFFICIENT_CREDIT`, `RATE_LIMITED`, `FEATURE_DISABLED`, `missing_input`, `auth_invalid`.

## jq Patterns

| Pattern | Purpose |
|---------|---------|
| `jq -r '.data.markdown'` | Get page content as Markdown |
| `jq -r '.data.title'` | Get page title |
| `jq -r '.data.url'` | Get the crawled URL |
| `jq -r '.data.credit_cost'` | Check credit cost |
| `jq -r '.request_id'` | Get request ID for feedback |

## When to Use Crawl vs Search

| Scenario | Use | Why |
|----------|-----|-----|
| Read a specific known URL | `anycap crawl <url>` | Direct page-to-markdown |
| Read documentation from a URL | `anycap crawl <docs-url>` | Clean markdown extraction |
| Find pages on a topic | `anycap search --query` | Search first, then crawl selectively |
| Get a quick answer to a question | `anycap search --prompt` | LLM synthesizes from web data |
| Download a binary file | Use other download tools | Crawl is for HTML pages only |

## Limitations

- The crawler extracts main content and strips navigation, ads, and boilerplate.
- Output is Markdown, not raw HTML.
- Very large pages may be truncated by the upstream provider.
- JavaScript-rendered content (SPAs) may not be fully captured; the crawler processes the initial HTML response.
- Paywalled or login-protected pages will return only the publicly accessible content.
- Binary files (PDFs, images, archives) are not supported; use appropriate download tools instead.
