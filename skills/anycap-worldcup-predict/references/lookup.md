# Single Player Lookup & Disambiguation

The default path for one player's basic info. Optimize for a clean structured answer in as few calls as possible.

## Step 1 -- Grounding structured profile

Ask for JSON explicitly and parse with `jq`:

```bash
anycap search --prompt 'Give the basic profile of footballer <PLAYER NAME> as JSON with fields: full_name, date_of_birth, nationality, height, position, current_club, shirt_number, national_team. Only the JSON.' \
  | jq -r '.data.content'
```

Notes:

- Put **"Only the JSON."** at the end so the model does not wrap the answer in prose.
- The answer may arrive inside a ```json fenced block. Strip the fences before re-parsing if you need to `jq` the inner object.
- Costs 5 credits.

## Step 2 -- Disambiguation

Many footballers share names (e.g. multiple "Luis García", "Danilo", "Rodrigo"). Lock onto the right person:

**Option A -- add context to the prompt** (cheapest):

```bash
anycap search --prompt 'Basic profile as JSON for the footballer named Danilo who is a Brazilian defender currently at Juventus. Fields: full_name, date_of_birth, nationality, height, position, current_club, shirt_number, national_team. Only the JSON.' \
  | jq -r '.data.content'
```

Use any distinguishing context you have: nationality, position, birth year, current club, national team, World Cup squad.

**Option B -- pre-scan candidates with general search** (1 credit, no crawl):

```bash
anycap search --query "<PLAYER NAME> footballer profile club nationality" --no-crawl --max-results 6 \
  | jq -r '.data.results[]? | "\(.title) -- \(.url)"'
```

Inspect titles/URLs (Wikipedia disambiguation pages, club pages) to pick the correct player, then run Step 1 with the confirmed identity, or jump to [verify.md](verify.md) to read the exact Wikipedia page.

## Step 3 -- Normalize

Map the result onto the SKILL.md output schema:

- Convert dates to `YYYY-MM-DD`.
- Use `null` (not empty string) for unknown fields.
- Record the retrieval date for volatile fields (`current_club`, `shirt_number`).

## When to escalate to verification

Escalate to [verify.md](verify.md) when:

- The user needs guaranteed accuracy (publishing, official documents).
- Grounding returns a suspicious or internally inconsistent value.
- The player recently transferred and `current_club` may be stale.
