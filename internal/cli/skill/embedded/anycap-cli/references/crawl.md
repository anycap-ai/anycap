# Web Crawl

Convert any web page to clean Markdown. Useful for reading documentation, extracting article content, or getting structured text from a URL.

**Cost:** 1 credit per crawl.

## Command

```bash
anycap crawl <url>
```

Single argument: the URL to crawl. No flags needed.

## Examples

```bash
# Crawl a page and get the full response
anycap crawl https://example.com

# Extract just the Markdown content
anycap crawl https://example.com | jq -r '.data.markdown'

# Crawl documentation
anycap crawl https://docs.go.dev/ref/spec | jq -r '.data.markdown'

# Check credit cost
anycap crawl https://example.com | jq -r '.data.credit_cost'
```

## Response Format

```json
{
  "status": "success",
  "data": {
    "url": "https://example.com",
    "markdown": "# Example Domain\n\nThis domain is for use in...",
    "credit_cost": 1
  },
  "request_id": "trc_abc123"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `data.url` | string | The URL that was crawled |
| `data.markdown` | string | Page content converted to Markdown |
| `data.credit_cost` | int | Credits consumed (always 1) |

## jq Patterns

| Pattern | Purpose |
|---------|---------|
| `jq -r '.data.markdown'` | Get page content as Markdown |
| `jq -r '.data.url'` | Get the crawled URL |
| `jq -r '.data.credit_cost'` | Check credit cost |
| `jq -r '.request_id'` | Get request ID for feedback |

## When to Use Crawl vs Search

| Scenario | Use | Why |
|----------|-----|-----|
| Read a specific known URL | `anycap crawl <url>` | Direct page-to-markdown |
| Get documentation content | `anycap crawl <docs-url>` | Clean Markdown extraction |
| Save a page for processing | `anycap crawl <url>` then extract | Get clean markdown |
| Find pages on a topic | `anycap search` | Use search, not crawl |
| Download a binary file | `anycap download <url>` | Not crawl |

## Notes

- The crawler extracts main content and strips navigation, ads, and boilerplate.
- Output is Markdown, not raw HTML.
- Very large pages may be truncated.
- For binary files (PDFs, images, archives), use `anycap download` instead.
