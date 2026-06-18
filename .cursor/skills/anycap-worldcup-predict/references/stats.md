# Career & World Cup Stats

Extend a basic profile with performance numbers. Stats are less stable than biographical fields -- treat them as best-effort and verify what matters.

## Grounding stats query

```bash
anycap search --prompt 'Career stats summary for footballer <PLAYER NAME>, return JSON with fields: senior_career_appearances, senior_career_goals, national_caps, national_goals, worldcup_2026_appearances, worldcup_2026_goals. Numbers only, JSON only.' \
  | jq -r '.data.content'
```

Returns (example, verified shape):

```json
{
  "senior_career_appearances": 300,
  "senior_career_goals": 72,
  "national_caps": 49,
  "national_goals": 7,
  "worldcup_2026_appearances": 1,
  "worldcup_2026_goals": 1
}
```

## Accuracy caveats

- Numeric totals can be **approximate or slightly stale** -- they depend on what the web surfaces at call time and how the model aggregates across competitions.
- Career totals shift after every match. Always attach `_retrieved_at`.
- For figures that must be correct (reports, official use), verify against Wikipedia (career-statistics table) per [verify.md](verify.md). Do not rely on Transfermarkt crawling -- it is bot-blocked.

## Position-aware fields

Tailor stat fields to the position so the output is meaningful:

- **Goalkeepers**: prefer `clean_sheets`, `appearances`, `goals_conceded` over `goals`.
- **Defenders / midfielders**: include `assists` alongside `goals`.
- **Forwards**: `goals`, `assists`, optionally `goals_per_90`.

Adjust the requested JSON fields in the prompt accordingly.

## Combining with the basic profile

Merge stats into the basic profile object so each player is a single record:

```bash
jq -s '.[0] * .[1]' profile.json stats.json > player_full.json
```

Keep biographical fields and stats clearly grouped, and preserve `_sources` / `_retrieved_at` from both calls.
