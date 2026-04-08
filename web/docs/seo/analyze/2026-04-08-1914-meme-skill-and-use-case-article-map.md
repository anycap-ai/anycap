# Meme skill and use-case article map

Date: 2026-04-08

## Summary

Yes, this can be turned into a credible AnyCap workflow, but it should be framed as:

- a **workflow skill** for meme-style and captioned-image creation
- a **use-case article cluster** under `learn`

It should **not** be framed as:

- a meme-template database
- a blank-template hub
- a generic caption-generator product page

The strongest product truth is:

1. AnyCap can generate or edit the base visual through `image.generate`
2. the exact caption text should be rendered locally, not delegated to the model
3. the final asset can be shared through Drive or packaged into a Page

This keeps the workflow honest and reproducible.

## Capability check

Validated locally on 2026-04-08:

- `anycap status` shows `image.generate`, `image.edit`, `drive`, `page`, `video.generate`, and `image.read` enabled
- image models available: `seedream-5`, `nano-banana-pro`, `nano-banana-2`
- image schemas confirm both `text-to-image` and `image-to-image` modes

## Best page shape

Use the existing `learn` motion already present on the site:

- explain the workflow
- show why agent plus capability layer is better than a shallow web tool
- link into the concrete capability page
- close with installation or skill adoption

That matches the current site pattern used by pages like `smart-goal-generator`.

## Recommended skill

Skill name:

- `anycap-social-meme-workflows`

Why this shape:

- broader than a single meme format
- still narrow enough to feel like a real workflow
- covers captioned images, reaction remixes, and short meme-video concepts
- fits AnyCap's current positioning better than a pure consumer meme-tool story

## Recommended article cluster

### Cluster anchor

- URL: `/learn/how-to-make-memes-online`
- Angle: how an AI agent plus AnyCap can generate a base meme image, apply exact caption text, and share the result
- CTA: `/capabilities/image-generation`, `/skills`, `/guides/install-anycap`

### Supporting pages

- URL: `/learn/how-to-create-memes-on-instagram`
  - Angle: create Instagram-friendly square or vertical meme assets without switching between separate tools
  - CTA: `/capabilities/image-generation`, `/for/cursor`

- URL: `/learn/how-to-make-a-meme-video`
  - Angle: generate the frame or clip with AnyCap, then add exact subtitle or punchline text locally
  - CTA: `/capabilities/video-generation`, `/skills`

- URL: `/learn/how-to-add-text-to-a-photo`
  - Angle: use AnyCap for background generation or cleanup, then render exact copy deterministically
  - CTA: `/capabilities/image-generation`, `/guides/install-anycap`

## Keyword triage from the CSV

### Keep

- `how to make memes online`
- `how to create memes on instagram`
- `how to make a meme video`
- `add caption to photo`
- `add caption to image`
- `how to add captions to pictures`

### Merge

- `add caption to photo`
- `add caption to image`
- `how to add captions to pictures`
- `how do you put captions on photos`

These should become one page, not four.

### Drop

- specific meme names such as `4 hand meme`
- high-volume generic head terms like `caption generator`
- vague or unstable variants that do not map cleanly to a repeatable AnyCap workflow

## Product guardrails

- Do not claim the model is dependable for exact caption rendering.
- Use local deterministic text overlay for final copy.
- Keep the article focused on agent workflow, not consumer meme culture.
- Avoid pages that would require constant maintenance of meme lore.

## Recommendation

If the goal is to test this space, start with only two production candidates:

1. `/learn/how-to-make-memes-online`
2. `/learn/how-to-add-text-to-a-photo`

That is enough to test:

- whether the workflow story converts
- whether the skill framing resonates
- whether searchers accept the agent-plus-capability angle

If those work, add:

3. `/learn/how-to-make-a-meme-video`
4. `/learn/how-to-create-memes-on-instagram`

## Style expansion roadmap

The useful way to expand this space is not "write one page per meme trend."

It is:

1. define a small number of repeatable visual presets
2. map each preset to a workflow the product can honestly support
3. only spin out pages where the search intent still looks tutorial-like or workflow-friendly

### Current verdict by style

| Style | Example look | Search-fit | Best page role | Recommendation |
| --- | --- | --- | --- | --- |
| Classic stick figure / doodle | simple line characters, blob people, low-fi reaction scenes | high | cluster page + examples across other tutorials | build on this first |
| Bad drawing meme | intentionally clumsy or awkward art | medium | supporting page or section | add after the main doodle page proves itself |
| Rage-comic-adjacent | black-and-white comic panel reaction format | low-medium | side article or trend piece | do not make this the main SEO bet |

### Why the split looks like this

Live SERP checks on April 8, 2026 suggest:

- `funny meme drawings` is still close enough to a workflow query that AnyCap can explain and demonstrate it
- `bad drawing meme` and `stick figure meme` skew toward Pinterest, Reddit, Tenor, and meme-sharing results, so they are better as style variants than as isolated money pages
- `rage comic` skews heavily toward Wikipedia, fandom pages, archives, and meme-lore results, so it is weaker as a product-led tutorial target

## Recommended preset-to-page map

| Preset | Suggested URL | Page type | Primary keyword direction | Priority | Notes |
| --- | --- | --- | --- | --- | --- |
| `classic-doodle` | `/learn/funny-meme-drawings` | tutorial / workflow guide | `funny meme drawings`, `meme drawings`, `drawn memes` | P1 | strongest long-tail cluster for this style family |
| `classic-doodle` | `/learn/easy-memes-to-draw` | tutorial / list-led workflow page | `easy memes to draw`, `funny meme drawings easy` | P2 | good extension if the anchor page gets traction |
| `bad-drawing` | `/learn/how-to-make-bad-drawing-memes` | tutorial / style explainer | `bad drawing meme`, `poorly drawn meme` | P2 | should inherit links from the doodle anchor |
| `rage-comic-adjacent` | `/learn/how-to-make-rage-comic-style-memes` | style explainer | `rage comic` adjacent intent only | P3 | only if you can keep it workflow-led and avoid pure meme-history framing |

## How this should show up inside the skill

The skill should expose these as style presets, not as separate products:

- `classic-doodle`
- `bad-drawing`
- `rage-comic-adjacent`

That gives the site three advantages:

- article screenshots and skill outputs stay visually consistent
- new pages can reuse tested prompt directions instead of inventing a new style every time
- the SEO cluster grows from a stable workflow foundation instead of trend-chasing

## Practical rollout

Recommended order:

1. keep `/learn/how-to-make-memes-online` as the cluster anchor
2. add `/learn/funny-meme-drawings` as the first style-specific supporting page
3. expand to `easy memes to draw` or `bad drawing meme` only if the first page shows impressions and engagement
4. treat rage-comic-adjacent content as optional heat capture, not as the core of the cluster
