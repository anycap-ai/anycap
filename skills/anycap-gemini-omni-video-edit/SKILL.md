---
name: anycap-gemini-omni-video-edit
description: "Use Gemini Omni Flash Preview through AnyCap for practical short-video editing workflows. Trigger when a user wants to edit or refine an existing video with natural-language instructions, especially product replacement, object removal or replacement, relighting, restyling, preserving a person/scene while changing one element, or using reference images with a source video. Covers model/schema discovery, prompt construction, AnyCap CLI command patterns, scenario-specific templates, video QA, and retry strategy for `gemini-omni-flash-preview` / `edit-video`."
metadata:
  version: 0.6.0
  website: https://anycap.ai
license: MIT
---

# AnyCap Gemini Omni Video Edit

Use this skill to edit short videos with `gemini-omni-flash-preview` via AnyCap. It is optimized for practical one-shot video edits where a source video should stay mostly unchanged and one element should change.

For CLI syntax, authentication, model discovery conventions, and delivery options, read the `anycap-cli` skill when needed.

## Evidence To Verify

Gemini Omni Flash Preview is a preview model, so verify the live surface before running:

```bash
anycap status
anycap video models gemini-omni-flash-preview
anycap video models gemini-omni-flash-preview schema --operation generate --mode edit-video
```

Also check official Google docs when model behavior matters:

- Gemini Omni Flash guide: https://ai.google.dev/gemini-api/docs/omni
- Gemini API video overview: https://ai.google.dev/gemini-api/docs/video
- Gemini Omni Flash model card: https://ai.google.dev/gemini-api/docs/models/gemini-omni-flash

Treat the AnyCap live schema as the source of truth for runnable CLI parameters. Treat official Google docs as the source of truth for model behavior, limitations, and prompting guidance.

## Fit Check

Use Gemini Omni Flash Preview when the task is:

- edit an existing short video from natural language
- preserve identity, camera motion, background, hands, lighting, timing, and audio while changing one visual element
- swap a product or prop using one or more reference images
- remove or hide a visible object
- make narrow scene-level edits such as relighting, restyling, or text/sign changes
- run fast preview iterations before considering a higher-control video model

Consider another video model or direct provider API when the task requires:

- scene extension, first/last-frame interpolation, or last-frame control
- precise multi-turn state using Google's `previous_interaction_id`
- strict multi-video reasoning
- long-form generation beyond the live AnyCap schema
- output quality/resolution not exposed by the live AnyCap schema

## Workflow

1. **Inspect inputs.** Confirm the source video path or URL, reference images, desired edit, aspect ratio, duration, and output filename.
2. **Check schema.** Run the live schema command above and use only supported params.
3. **Choose references.** Prefer one source video. Use reference images for product, subject, style, or material details. Avoid multi-video prompting unless the live docs and task strongly justify it.
4. **Write a narrow English prompt.** English is the safest default. Make the target edit explicit and tell the model what to preserve.
5. **Generate.** Use `anycap video generate` with `--mode edit-video` and a descriptive `-o`.
6. **QA the video.** Use `ffprobe`, frame samples, and `anycap actions video-read`; then manually review motion, hands, object stability, and unintended changes.
7. **Retry narrowly.** If the output drifts, shorten the prompt, isolate the edit, and add only the missing constraint.

## Command Pattern

```bash
anycap video generate \
  --model gemini-omni-flash-preview \
  --mode edit-video \
  --prompt "<narrow English editing instruction. Keep everything else the same.>" \
  --param videos=./source.mp4 \
  --param images=./reference.png \
  --param aspect_ratio=16:9 \
  --param duration=10 \
  --param resolution=720p \
  --param format=mp4 \
  -o ./edited-output.mp4
```

Rules:

- Always pass the source video with `--param videos=...`.
- Use JSON array syntax when the schema supports multiple references:

```bash
--param images='["./product-front.png","./product-side.png"]'
```

- Do not repeat the same `--param images=` key expecting it to append.
- Keep file names versioned: `brief-v1.mp4`, `brief-v2.mp4`, `brief-final.mp4`.
- For URLs or local files, let AnyCap upload/resolve references automatically.

## Prompt Formula

Use this structure for edits:

```text
<Action only on target>. Use <reference image(s)> as the exact reference for <product/subject/style/material>. Preserve <identity, hands, body, clothing, background, camera motion, lighting, shadows, audio, timing>. Make <physical integration details>. Keep everything else the same. Do not <common failure modes>.
```

Good edit prompts are short but specific. For targeted editing, include "Keep everything else the same." Put negatives in the regular prompt because model-level negative prompts are not exposed for this workflow.

For scenario templates, read [references/scenarios.md](references/scenarios.md).
For QA and retry patterns, read [references/qa.md](references/qa.md).

## Practical Defaults

- Default to one source video and one product/reference image.
- Match `aspect_ratio` to the source video unless the user explicitly wants a crop.
- Use the source video's duration when it fits the live schema; otherwise choose the nearest supported duration and tell the user.
- Use a stable, descriptive output path in the workspace.
- Ask for the smallest possible edit first. Big combined edits are more likely to change identity, hands, background, or camera motion.

## Output Expectations

Return:

- the local output video path
- the exact command used or a concise command summary
- the QA checks run and what they found
- any caveats, such as identity drift, hand artifacts, flicker, audio changes, or schema limits

If the edit is not good enough, provide a concrete next prompt rather than a vague "try again."
