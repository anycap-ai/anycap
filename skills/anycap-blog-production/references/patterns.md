# Patterns

Use this file when choosing prompts, filenames, captions, and proof blocks for blog-style content pages. The workflow is reusable; the topic should come from the actual task, not from this file.

## Blog Block Shapes

### Answer-first box
- Best near the top
- Answers the page's main promise in 3-5 sentences
- Should explain why the shallow default approach is not enough

### Workflow section
- Best for tutorials, guides, and operational pages
- Usually 3-6 steps
- Each step should move the reader closer to a usable result

### Comparison or options block
- Best when the input data includes alternatives, tradeoffs, or choices
- Use tables or short cards, not long prose

### FAQ
- Best when the query has repeated objections or high-intent clarifications
- Answers should stay specific and operational

### Proof block
- Only add when the article benefits from a real artifact
- Good forms: hero, before/after, variation board, keyframe, cover visual, step illustration

## Asset Shapes

### Single hero or showcase
- Goal: one polished hero or showcase image
- File shape: `<page-slug>-hero.jpg`
- Good fit: landing pages, intros, strong answer-first sections

### Before/after proof
- Goal: prove the revision loop with the same subject
- File shape:
  - `<page-slug>-before.jpg`
  - `<page-slug>-after.jpg`
- Good fit: workflows, case studies, transformation claims

### Variation board
- Goal: prove throughput with a triptych or review board
- File shape: `<page-slug>-variants.jpg`
- Good fit: ideation pages, option selection, comparison sections

### Step illustration
- Goal: make a process section easier to scan
- File shape: `<page-slug>-step-<n>.jpg`
- Good fit: guides, tutorials, docs, workflows

### Companion still
- Goal: show a companion still that matches the motion brief
- File shape: `<page-slug>-keyframe.jpg`
- Good fit: video workflows or any time-based process

### Companion cover visual
- Goal: show a mood visual or cover image for the soundtrack brief
- File shape: `<page-slug>-cover.jpg`
- Good fit: audio workflows or mood-driven sections

## Prompt Patterns

### Polished hero

Use language like:

`clear subject, premium hero composition, soft editorial lighting, crisp layout, no readable text, no watermark`

### Before/after edit proof

Source image prompt:

`rough draft version of the same subject, mixed lighting, everyday context, realistic image, no readable text, no watermark`

Edit prompt:

`preserve the same subject, clean the background, center the product, improve lighting, launch-ready marketing photo, no text, no watermark`

### Variation board

Use language like:

`triptych, three side-by-side panels, same subject in three visual directions, clean review board layout, no labels, no sticky notes, no text, no watermark`

### Step illustration

Use language like:

`clean process illustration, one clear step, uncluttered composition, readable without text overlay, no watermark`

### Companion still

Use language like:

`cinematic still, motion implication, atmospheric scene, no storefront signs, no billboards, no text, no watermark`

Important:
- explicitly remove signs, labels, and typography
- caption it as a companion still, not the video output itself

### Companion cover visual

Use language like:

`abstract cover visual, mood-first composition, no readable text, no watermark`

Caption it as a companion cover visual, not as primary output.

## Caption Patterns

### Safe factual caption for static image pages

`This visual was generated through AnyCap for this page.`

### Safe factual caption for edit pages

`The left image is the rough source draft. The right image is the AnyCap revision generated from that source asset.`

### Safe factual caption for companion stills

`This still was generated through AnyCap as a visual proxy for the kind of scene or motion brief discussed in this section.`

### Safe factual caption for cover visuals

`This companion cover visual was generated through AnyCap to anchor the prompt or mood described on this page.`

## Verification Checklist

Before shipping an asset, confirm:

- the subject matches the page claim
- there is no visible watermark
- there is no stray readable text unless intentionally allowed
- for before/after pages, the subject identity is preserved
- the alt text describes what is actually visible
- the caption does not over-claim what the artifact proves
- the workflow stays generic even though the prompt is page-specific
