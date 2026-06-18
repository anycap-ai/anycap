# Prediction (for fun)

Turn the factual matchup layers into an optional, lighthearted call: a likely
winner, a playful scoreline, and a confidence label. This is the entertainment
layer of the skill -- it sits **after** the data, never replaces it.

> Predictions inform fun, not outcomes. They are data-informed guesses, not
> statements of fact, odds, or betting advice. Surface the reasoning; let the
> reader enjoy and judge.

## When to use

- The user explicitly wants a "prediction", "who will win", "scoreline", "your
  call", or similar.
- You have already gathered the factual layers (squad quality, current form,
  historical context, head-to-head) for the matchup. Do not predict from
  nothing -- run the matchup workflow first.

## Method: weigh the signals, then call it

Base every prediction on the data you already retrieved. Weigh, in rough order:

1. **Quality gap** -- FIFA ranking and squad strength (key players, club level).
2. **Current form** -- recent results; a hot/cold streak shifts the call.
3. **Head-to-head** -- prior meetings, especially recent or competitive ones.
4. **Context** -- World Cup pedigree, availability/injuries, venue if relevant.

Translate the balance into a scoreline that matches the lean:

- **Lopsided** (big ranking + form gap): a comfortable margin, e.g. `2-0`, `3-1`.
- **Edge** (one side slightly ahead): a tight scoreline, e.g. `2-1`, `1-0`.
- **Even** (signals cancel out): a draw is a legitimate, honest call, e.g.
  `1-1`. Do not force a winner when the data does not support one.

Attach a **confidence** label -- `Low` / `Medium` / `High` -- reflecting how
strongly the signals agree. Conflicting signals = lower confidence.

## Custom dimensions (user-defined)

The four signals above are the **default** model. Let the user shape the call by
adding, removing, or re-weighting dimensions. Treat any dimension the user names
as a first-class input.

How to handle a user-supplied dimension:

1. **Capture it.** Restate the dimension(s) and any weight the user gave (e.g.
   "home advantage = high", "ignore head-to-head", "weight form 50%").
2. **Get the data if you don't have it.** If the dimension needs a fact you have
   not retrieved, pull it with one grounding call before predicting -- do not
   guess. Example:

   ```bash
   anycap search --prompt 'For the <TEAM A> vs <TEAM B> match, summarize as JSON: {"home_advantage":{"host":string,"note":string},"injuries":[{"team":string,"player":string,"status":string}],"rest_days":{"team_a":int,"team_b":int},"weather":{"venue":string,"forecast":string}}. JSON only.' \
     | jq -r '.data.content'
   ```

3. **Fold it into the weighing.** Apply the user's weights when you balance the
   signals. If the user gives explicit weights (percentages or High/Med/Low),
   honor them; otherwise weight reasonably and say how you weighted.
4. **Show the dimensions used.** List the final dimension set (defaults + custom)
   so the reader sees what drove the call.

Common custom dimensions users ask for:

| Dimension | Typical signal |
|-----------|----------------|
| Home / host advantage | Host nation, venue familiarity, crowd, altitude |
| Injuries / availability | Key players out or doubtful |
| Rest & fatigue | Days since last match, travel, fixture congestion |
| Weather / climate | Heat, humidity, rain at the venue |
| Head coach / tactics | Managerial quality, style matchup |
| Stakes / motivation | Must-win, already qualified, dead rubber |
| Set-piece threat | Aerial strength, dangerous takers |
| "Vibes" / gut feel | Explicitly non-scientific; label it as such |

Rules for custom dimensions:

- A dimension must map to something observable. If it cannot be sourced or
  reasoned about, say so and exclude it rather than inventing data.
- The user can override or drop defaults (e.g. "don't use FIFA ranking"). Respect
  that, and note which defaults were dropped.
- More custom dimensions do not mean higher confidence. If user-weighted signals
  conflict, lower the confidence accordingly.
- The disclaimer below is still mandatory, no matter which dimensions are used.

## Output shape

Render the prediction as its own block, separate from the factual tables:

```text
Prediction (for fun): <Winner> to win, <scoreline>  ·  Confidence: <Low|Medium|High>
Dimensions: <defaults used> [+ <custom dimensions / weights, if any>]
Why: <one or two sentences tying the call to the dimensions above>
```

For a draw call, write `Draw, <scoreline>` instead of a winner.

## Required disclaimer

Every response that contains a prediction MUST end with this disclaimer (or a
close paraphrase in the user's language):

> **Disclaimer:** This prediction is for entertainment only. It is a
> data-informed guess, not a statement of fact, odds, or betting advice. Real
> matches are unpredictable -- please don't wager based on it.

A prediction without this disclaimer is incomplete output. Do not omit it, even
if the user asks you to.

## Guardrails

- Keep the factual layers intact and clearly labeled; the prediction is additive.
- Do not invent stats to justify a call -- use what was retrieved.
- Do not output probabilities or odds as if they were measured facts.
- Do not give betting/wagering instructions or encourage gambling.
- If asked for confidence as a percentage, you may give a casual, clearly
  non-scientific number (e.g. "~60%, just vibes") and still attach the
  disclaimer.
