# Authoritative Source Verification

Use this when accuracy matters more than speed. Cross-check the grounding profile against a crawlable, authoritative source.

## Source reliability (verified)

| Source | Crawlable via `anycap crawl`? | Use for |
|--------|-------------------------------|---------|
| Wikipedia (`en.wikipedia.org/wiki/<Player>`) | Yes -- returns full Markdown | Primary verification |
| Transfermarkt | No -- returns a `Human Verification` page (~600 chars) | Avoid crawling; use grounding instead |
| Official FA / club sites | Sometimes; check `title` and length | Secondary confirmation |

Always inspect the crawl result before trusting it:

```bash
anycap crawl "<url>" | jq -r '{title:.data.title, len:(.data.markdown|length)}'
```

If `len` is small (a few hundred chars) or `title` looks like a challenge page (`Human Verification`, `Just a moment`, `Access denied`), the page is bot-blocked -- discard it and fall back to grounding or Wikipedia.

## Workflow

### Step 1 -- Find the exact Wikipedia URL

```bash
anycap search --query "<PLAYER NAME> footballer wikipedia" --no-crawl --max-results 3 \
  | jq -r '.data.results[]? | "\(.title) -- \(.url)"'
```

Pick the `en.wikipedia.org/wiki/<Player>` result (avoid disambiguation pages).

### Step 2 -- Crawl Wikipedia

```bash
anycap crawl "https://en.wikipedia.org/wiki/<Player>" | jq -r '.data.markdown' > /tmp/<player>.md
```

The infobox near the top contains date of birth, height, position, current team, and shirt number.

### Step 3 -- Reconcile

Compare the grounding profile (from [lookup.md](lookup.md)) against the Wikipedia infobox:

- **Match** -> mark field as `verified`.
- **Conflict** -> prefer the source that is more current for volatile fields (club/number); for stable fields (DOB, full name) Wikipedia is usually authoritative. Note the discrepancy.
- **Missing in grounding** -> fill from Wikipedia.

### Step 4 -- Annotate sources

For a verified profile, record where each value came from, e.g.:

```json
{
  "full_name": "Jude Victor William Bellingham",
  "date_of_birth": "2003-06-29",
  "current_club": "Real Madrid",
  "_sources": ["grounding", "https://en.wikipedia.org/wiki/Jude_Bellingham"],
  "_retrieved_at": "2026-06-18"
}
```

## Cost note

Verification adds ~2 credits per player (1 query + 1 crawl) on top of the grounding call. Only verify the fields/players that need it.
