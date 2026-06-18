feat(skills): add anycap-worldcup-predict skill

- Add anycap-worldcup-predict: World Cup pre-match intel that turns
  player names, squads, and matchups into structured, verifiable
  profiles, current form, stats, and tournament history using AnyCap
  web search and crawl.
- Add an optional for-fun prediction layer (likely winner, scoreline,
  and confidence) that weighs FIFA ranking, recent form, head-to-head,
  and key players, and always ships an entertainment-only disclaimer.
- Support user-defined prediction dimensions such as home advantage,
  injuries, rest, and weather, honoring user weights and fetching any
  missing data before making a call.
- Add references/predict.md describing the prediction method and
  required disclaimer, and a README for skill discoverability.
