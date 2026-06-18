---
name: anycap-worldcup-predict
description: "World Cup match prediction and pre-match intel for football (soccer) fans: predict who will win and a likely scoreline, backed by structured, verifiable evidence -- player profiles, squad dossiers, current form, head-to-head records, and past-tournament history -- using AnyCap web search and crawl. Weighs FIFA ranking, recent form, head-to-head, and key players, plus any user-defined dimensions (home advantage, injuries, rest, weather, vibes), then makes a clearly-labeled for-fun call with a confidence level and a mandatory disclaimer. Built on the 'search less, not faster' strategy: narrow the search space first, retrieve only what matters, then verify against authoritative sources. Use when a fan wants a World Cup match prediction, predicted score, or who-will-win call; wants a player's profile, bio, form, or stats; wants a full World Cup squad or national-team lineup table; wants to size up two teams before a match; or wants head-to-head and past World Cup context. Trigger on: World Cup prediction, predict the score, who will win, match prediction, predicted scoreline, World Cup, World Cup squad, national team lineup, pre-match analysis, matchup, player form, footballer stats, player profile, head-to-head, or scout a team."
metadata:
  version: 0.4.0
  website: https://anycap.ai
license: MIT
compatibility: Requires anycap CLI (authenticated). Works with any agent that supports shell commands.
---

# AnyCap World Cup Predict

> **Read this entire file before starting.** It defines a reliable workflow for turning a player name (or a whole squad) into structured, verifiable World Cup pre-match intel using AnyCap, then optionally calling a winner and scoreline for fun.

World Cup match prediction and pre-match intel for serious football fans. Turn player names and lineups into structured, verifiable profiles, stats, and matchup briefings so you can read a World Cup matchup before kickoff -- then, if you want, finish with a for-fun prediction (likely winner + scoreline + confidence). Built for World Cup squads and national-team lineups, and works for any footballer.

This skill is about **how to retrieve and verify player data**. For CLI command reference (flags, output, jq), read the `anycap-cli` skill and its `references/search.md` / `references/crawl.md`.

> This skill surfaces **public information** (profiles, form, historical stats) and can finish with an optional **for-fun prediction** (likely winner + a playful scoreline) derived from that data. It does **not** set betting odds, output win probabilities as if they were facts, or place wagers. Every prediction must ship with the disclaimer in [predict.md](references/predict.md). Treat everything as informational and form your own judgment.

## Prerequisites

- `anycap` CLI installed and authenticated (`anycap status` to verify). Read the `anycap-cli` skill if setup is needed.
- `jq` for parsing JSON output.

## Core Principle: Search Less, Not Faster

Do not crawl the whole web for every player. Narrow the search space first, then retrieve only what matters:

1. **Grounding first** -- ask for a structured profile in one shot (`anycap search --prompt`). This is the fastest path to clean data.
2. **Disambiguate** -- when a name is shared by several players, add context (nationality, position, birth year, club) to lock onto the right one.
3. **Verify only when accuracy matters** -- cross-check against an authoritative, crawlable source (Wikipedia) instead of trusting a single answer.
4. **Prune, don't dump** -- in batch mode, fetch one structured profile per player; never crawl every search result.

## Workflow

| Goal | Route | Reference |
|------|-------|-----------|
| One player's basic info | Grounding structured JSON | [lookup.md](references/lookup.md) |
| Right player when name is shared | Add context / pre-scan with `--query` | [lookup.md](references/lookup.md) |
| High-accuracy, sourced profile | Cross-check vs Wikipedia | [verify.md](references/verify.md) |
| A whole squad / roster | Loop grounding, aggregate to table | [batch.md](references/batch.md) |
| Career + current World Cup stats | Grounding stats JSON (with caveats) | [stats.md](references/stats.md) |
| Size up a matchup (Team A vs Team B) | Build both squads via batch, compare side by side | [batch.md](references/batch.md) |
| Add past World Cup context | Format, group + knockout results, key players, team history, head-to-head | [history.md](references/history.md) |
| Call a winner + scoreline (for fun) | Weigh the gathered layers (plus any user-defined dimensions), then predict with a mandatory disclaimer | [predict.md](references/predict.md) |

For a matchup, run the squad workflow for both teams, then layer in historical context (tournament track record + head-to-head from [history.md](references/history.md)). Present three layers side by side -- **squad quality**, **current form**, **historical context** -- and highlight differences in key positions and availability. Then, if a prediction is wanted, finish with an optional **for-fun call** (likely winner + playful scoreline + confidence) per [predict.md](references/predict.md). Always keep the factual layers clearly separated from the prediction, and always attach the disclaimer.

### Fast path (single player)

```bash
anycap search --prompt 'Give the basic profile of footballer Jude Bellingham as JSON with fields: full_name, date_of_birth, nationality, height, position, current_club, shirt_number, national_team. Only the JSON.' \
  | jq -r '.data.content'
```

Returns (verified):

```json
{
  "full_name": "Jude Victor William Bellingham",
  "date_of_birth": "2003-06-29",
  "nationality": "English",
  "height": "1.86 m",
  "position": "Midfielder",
  "current_club": "Real Madrid",
  "shirt_number": 5,
  "national_team": "England"
}
```

Grounding search costs 5 credits per call. General search (`--query`) and crawl cost 1 credit each.

## Output Schema

Normalize every profile to this schema so single-player and batch results are consistent:

| Field | Type | Notes |
|-------|------|-------|
| `full_name` | string | Legal/full name |
| `date_of_birth` | string | `YYYY-MM-DD`; use `null` if unknown |
| `nationality` | string | Primary nationality |
| `height` | string | e.g. `1.86 m`; `null` if unknown |
| `position` | string | e.g. `Midfielder`, `Goalkeeper` |
| `current_club` | string | Club as of retrieval date |
| `shirt_number` | int/null | Club or national-team number |
| `national_team` | string | National team |

Rules:

- Use `null` for missing fields. Never invent values.
- `current_club` and `shirt_number` change frequently -- treat them as point-in-time and note the retrieval date.
- When a field cannot be confirmed, mark it and (if accuracy matters) verify via [verify.md](references/verify.md).

## Important: Source Reliability (verified)

- **Wikipedia is reliably crawlable** (`anycap crawl https://en.wikipedia.org/wiki/<Player>` returns full Markdown). Use it as the primary verification source.
- **Transfermarkt blocks crawling** -- `anycap crawl` returns a short `Human Verification` page, not data. Do not rely on crawling it; use grounding search or Wikipedia instead.
- Other stats sites may also bot-block. Always check the crawled `title`/length before trusting content.

## Prediction (for fun)

After the factual layers, you may add an optional, clearly-labeled prediction so the briefing is fun to read. See [predict.md](references/predict.md) for the method and the required disclaimer. Non-negotiable rules:

- **Facts first, prediction last.** Never blend the guess into the data tables; put it in its own clearly-marked block.
- **Always attach the disclaimer** from [predict.md](references/predict.md). A prediction without the disclaimer is incomplete output.
- **Entertainment, not betting.** Do not present win probabilities or odds as facts, do not give wagering advice, and do not tell anyone to bet.
- **Show the reasoning.** Base the call on the gathered signals (ranking, form, head-to-head, key players), not a coin flip.
- **Let the user steer.** Users can add, drop, or re-weight prediction dimensions (e.g. home advantage, injuries, rest, weather, "vibes"). Honor their weights, retrieve any missing data first, and list the final dimension set used. See [predict.md](references/predict.md).

## Limitations

- Live data (current club, shirt number, latest stats) reflects whatever the web returns at call time and can lag real events.
- Grounding stats numbers are best-effort and can be approximate; verify critical figures against Wikipedia.
- Generic player names need disambiguation context or the wrong person may be returned.
- This skill retrieves data on demand; it is not a stored database of all players.

## Quick Reference

| Tool | Purpose |
|------|---------|
| `anycap search --prompt "...JSON..."` | Structured profile / stats in one shot (5 cr) |
| `anycap search --query "..." --no-crawl` | Find/disambiguate the right player page (1 cr) |
| `anycap crawl https://en.wikipedia.org/wiki/<Player>` | Authoritative verification source (1 cr) |
| `anycap status` | Check auth before a batch run |
