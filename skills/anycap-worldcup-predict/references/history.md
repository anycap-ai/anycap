# Historical World Cup Context

Use past-tournament history to add context to a matchup: format, group-stage and knockout results, and the key players who decided each edition. Curated high-confidence facts are baked in; full brackets and standings are pulled live to stay accurate.

> History informs context, not outcomes. Past performance does not determine future results. Surface the data; let the user judge.

## Tournament format

- **Group stage**: teams are drawn into groups and play a round-robin; the top finishers advance. Points: win 3, draw 1, loss 0. Tiebreakers: goal difference, goals scored, then head-to-head / fair-play / draw depending on the edition's rules.
- **Knockout stage**: single-elimination from the round of 16 (or round of 32 in the 48-team era) through quarter-finals, semi-finals, third-place play-off, and final. Draws go to extra time, then penalties.
- **Format changes by edition** -- the 1998-2022 editions used 32 teams in 8 groups of 4 (top 2 advance to a round of 16). The **2026 edition expands to 48 teams** with a new group/knockout structure (round of 32). Confirm the exact format for the edition in question via live retrieval below rather than assuming.

## Baked-in: finals & podium (high confidence)

| Year | Host | Champion | Runner-up | Third | Final |
|------|------|----------|-----------|-------|-------|
| 2022 | Qatar | Argentina | France | Croatia | 3-3 (4-2 pens) |
| 2018 | Russia | France | Croatia | Belgium | 4-2 |
| 2014 | Brazil | Germany | Argentina | Netherlands | 1-0 (a.e.t.) |
| 2010 | South Africa | Spain | Netherlands | Germany | 1-0 (a.e.t.) |
| 2006 | Germany | Italy | France | Germany | 1-1 (5-3 pens) |

All-time titles: Brazil 5; Germany 4; Italy 4; Argentina 3; France 2; Uruguay 2; England, Spain 1 each.

## Baked-in: key players per edition (high confidence)

| Year | Golden Ball (best player) | Golden Boot (top scorer) | Best Young Player |
|------|---------------------------|--------------------------|-------------------|
| 2022 | Lionel Messi (Argentina) | Kylian Mbappé (France, 8) | Enzo Fernández (Argentina) |
| 2018 | Luka Modrić (Croatia) | Harry Kane (England, 6) | Kylian Mbappé (France) |
| 2014 | Lionel Messi (Argentina) | James Rodríguez (Colombia, 6) | Paul Pogba (France) |
| 2010 | Diego Forlán (Uruguay) | Thomas Müller (Germany, 5) | Thomas Müller (Germany) |
| 2006 | Zinedine Zidane (France) | Miroslav Klose (Germany, 5) | Lukas Podolski (Germany) |

For editions before 2006, or any detail not in these tables, verify via live retrieval rather than relying on memory.

## Live: full group-stage standings

Baking every group's table for every edition is large and error-prone -- pull it on demand and verify:

```bash
anycap search --prompt 'Final group-stage standings for the <YEAR> World Cup, group <X>, as JSON array of {team, played, won, drawn, lost, goals_for, goals_against, points, advanced(boolean)}. JSON only.' \
  | jq -r '.data.content'
```

Verify the advancing teams against Wikipedia's tournament page (see [verify.md](verify.md)).

## Live: knockout bracket & results

```bash
anycap search --prompt 'Knockout-stage results for the <YEAR> World Cup as JSON: round_of_16, quarter_finals, semi_finals, third_place, final -- each an array of {team_a, team_b, score, winner, decided_by(regulation|extra_time|penalties)}. JSON only.' \
  | jq -r '.data.content'
```

Caveats:

- Scores for matches decided on penalties should record the regulation score plus the shootout result.
- For a single team's run, ask for "the <COUNTRY> knockout path in the <YEAR> World Cup" instead of the full bracket.

## Live: key players for a tournament or team

Go beyond the baked-in awards (full top-scorer lists, standout performers, a team's decisive players):

```bash
anycap search --prompt 'Key players of the <YEAR> World Cup as JSON: golden_ball, golden_boot{player,goals}, top_scorers[{player,team,goals}], standout_performers[{player,team,note}]. JSON only.' \
  | jq -r '.data.content'
```

```bash
anycap search --prompt 'The <COUNTRY> key players at the <YEAR> World Cup as JSON array of {player, position, goals, assists, note}. JSON only.' \
  | jq -r '.data.content'
```

Verify any player figure you will present as fact against Wikipedia (see [verify.md](verify.md)).

## Live: team tournament history

```bash
anycap search --prompt 'World Cup history for the <COUNTRY> national football team as JSON: titles, last_title_year, best_finish, total_appearances, current_world_ranking. Numbers only, JSON only.' \
  | jq -r '.data.content'
```

## Live: head-to-head between two teams

```bash
anycap search --prompt 'Head-to-head record between <TEAM A> and <TEAM B> national football teams as JSON: total_meetings, team_a_wins, team_b_wins, draws, last_meeting_date, last_meeting_result, world_cup_meetings. JSON only.' \
  | jq -r '.data.content'
```

Caveats:

- H2H aggregates vary by source (friendlies vs competitive matches counted differently). Note the ambiguity rather than presenting one number as definitive.
- For a World Cup-only record, say so explicitly in the prompt.

## Folding history into matchup intel

When sizing up Team A vs Team B (see [batch.md](references/batch.md)):

1. Build both squads (profiles + form/stats).
2. Add each team's tournament history and recent World Cup runs (group + knockout above).
3. Add the head-to-head record and any shared knockout history.
4. Note key players on each side (baked-in awards + live per-team key players).
5. Present the layers side by side -- **squad quality**, **current form**, **historical context (group + knockout + key players)**. Then optionally finish with a for-fun winner + scoreline call per [predict.md](predict.md), kept separate from the factual layers and always followed by its disclaimer.
