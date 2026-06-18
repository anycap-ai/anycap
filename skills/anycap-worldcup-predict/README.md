# AnyCap World Cup Predict

> Predict who will win and the likely scoreline for any World Cup match -- backed by
> structured, verifiable pre-match intel. An [AnyCap](https://anycap.ai) agent skill
> for football (soccer) fans.

**World Cup match prediction + pre-match intel.** This skill turns a matchup (or a
player name, or a whole squad) into clean, sourced data -- profiles, current form,
head-to-head records, squad dossiers, and past-tournament history -- and then,
optionally, makes a **for-fun call**: likely winner, a playful scoreline, and a
confidence level, always shipped with a disclaimer.

Keywords: World Cup prediction, predicted score, who will win, match prediction,
football/soccer prediction, head-to-head, squad lineup, player stats, AI agent skill.

## What it does

- **Match prediction (for fun)** -- weighs FIFA ranking, recent form, head-to-head,
  and key players to call a winner + scoreline with a confidence label.
- **User-defined dimensions** -- add, drop, or re-weight what matters: home
  advantage, injuries, rest/fatigue, weather, head coach, "vibes", and more.
- **Verifiable pre-match intel** -- structured player profiles, squad/roster tables,
  current form, and career/World Cup stats.
- **Historical context** -- tournament track record, group + knockout results, and
  head-to-head between two teams.
- **Honest sourcing** -- grounded search first, cross-checked against authoritative
  sources (e.g. Wikipedia) when accuracy matters.

> **Predictions are for entertainment only** -- data-informed guesses, not statements
> of fact, odds, or betting advice. See [`references/predict.md`](references/predict.md).

## Requirements

- The [`anycap`](https://anycap.ai) CLI, installed and authenticated (`anycap status`).
- `jq` for parsing JSON output.
- Any agent that can run shell commands.

## Quick start

Ask your agent things like:

- "Predict France vs Brazil at the World Cup -- who wins and the score?"
- "Predict Mexico vs Korea, and weight home advantage and heat heavily."
- "Give me Jude Bellingham's profile as structured data."
- "Build the England 2026 World Cup squad as a table."

Or call the underlying CLI directly:

```bash
anycap search --prompt 'Give the basic profile of footballer Jude Bellingham as JSON with fields: full_name, date_of_birth, nationality, height, position, current_club, shirt_number, national_team. Only the JSON.' \
  | jq -r '.data.content'
```

## How it works

The full workflow lives in [`SKILL.md`](SKILL.md). References:

- [`references/lookup.md`](references/lookup.md) -- single player lookup & disambiguation
- [`references/batch.md`](references/batch.md) -- whole squad / matchup tables
- [`references/stats.md`](references/stats.md) -- career & World Cup stats
- [`references/history.md`](references/history.md) -- past-tournament context & head-to-head
- [`references/verify.md`](references/verify.md) -- cross-checking against authoritative sources
- [`references/predict.md`](references/predict.md) -- the for-fun prediction method + disclaimer

## License

MIT -- see [LICENSE](../LICENSE).
