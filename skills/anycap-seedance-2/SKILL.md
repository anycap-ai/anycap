---
name: anycap-seedance-2
description: "Compile user intent, scene beats, and reference assets into compact, controllable Seedance 2.0 prompts executed through the AnyCap CLI. Use when creating, testing, iterating, troubleshooting, or continuing Seedance 2 / Seedance 2 Fast video generations with AnyCap, especially when prompt structure, reference consistency, image/video/audio role mapping, product or character identity, multi-modal references, continuation, retakes, or generated-video review matter."
metadata:
  version: 0.3.6
  website: https://anycap.ai
license: MIT
---

# AnyCap Seedance 2

## Overview

Use this skill as a Seedance prompt compiler and reference consistency controller for `anycap video generate`. Its job is to turn user intent, scene beats, and reference files into a compact prompt contract that Seedance can follow without drifting, overloading the clip, or contaminating one reference with another.

Requires the AnyCap CLI binary, internet access, and AnyCap authentication.

For command details, read `skills/anycap-cli/SKILL.md` and `skills/anycap-cli/references/video-generation.md`. Read `references/reference-consistency.md` when references, identity, continuity, or role conflicts matter. Read `references/workflow.md` for review/retake logic. Read `references/patterns.md` when the user asks for an ad, product shot, UGC-style clip, character shot, transformation, motion-transfer, or continuation pattern.

## Operating Promise

Do not make the user become a prompt engineer. Convert their request into a prompt contract. If a default is reasonable, choose it and say what you chose. Ask only when the missing choice changes cost, safety, rights, aspect ratio, reference ownership, or the core creative direction.

Default to this low-friction path for a first draft:

```text
seedance-2-fast, text-to-video or image-to-video, 4 seconds, 16:9, 720p, generate_audio=false
```

After the draft lands, review whether the prompt contract held: beat, endpoint, reference identity, allowed motion, exclusions, and continuity. Offer the smallest next move: keep, final render, one-variable retake, continuation, or post-production fix.

## Quick Defaults

- Use `seedance-2-fast` for drafts, previewing, and low-friction user tests.
- Use `seedance-2` for final-quality takes, higher resolution, or when the user explicitly asks for best quality.
- Default draft settings: `duration=4`, `aspect_ratio=16:9`, `resolution=720p`, `generate_audio=false`.
- For final standard takes, prefer `resolution=1080p` unless the schema or user target says otherwise.
- Always run `anycap video models <model> schema --mode <mode>` before generation and follow the returned schema.
- Always use `-o` with a descriptive filename.
- Run `anycap status` first if authentication or connectivity is uncertain.

## Fast Routing

Choose the production path before writing prompt prose:

| User intent | Path |
|---|---|
| One simple idea, no references | Fast clip: `text-to-video` |
| Animate an uploaded/generated still | Image animation: `image-to-video` |
| Use product/identity plus motion/audio references | Reference-led clip: `multi-modal-reference` |
| Make another part from an accepted take | Continuation: `multi-modal-reference` with previous clip |
| Ad, UGC, product demo, transformation, character intro | Load `references/patterns.md` and choose a pattern |
| Bad or partial result came back | Load `references/workflow.md` and use Review/Retake |
| Reference role is ambiguous or several assets compete | Load `references/reference-consistency.md` |

## Mode Choice

- No references: use `text-to-video`.
- Image reference only: use `image-to-video` and pass `--param images=<path-or-url>`.
- Image plus video or audio references: use `multi-modal-reference`.
- Continuation from an accepted clip: use `multi-modal-reference` with the accepted clip as `videos=<path>`.
- If the user wants to animate a still image, keep the prompt focused on motion, camera, light, and endpoint instead of re-describing everything in the image.

## Prompt Compiler

Before writing the final prompt, form a short internal brief. Do not show this unless useful:

1. Reference contract: exact tags, primary roles, allowed transfer, exclusions.
2. Subject lock: what identity/product/character must remain stable.
3. Clip beat: one visible action that can happen inside the chosen duration.
4. Endpoint: what state the clip stops on.
5. Camera: one motivated movement.
6. Light: one physical source or atmospheric change.
7. Sound: ambience, silence, SFX, music energy, or `generate_audio=false`.
8. Continuity constraints: what must not change, transfer, appear, replay, or happen yet.

Then send only compact natural language to Seedance. Avoid generic boosters like "ultra cinematic" unless the user asked for that exact style. Keep the final prompt around 40-110 words for ordinary clips. When references exist, the reference contract comes first.

Use this final prompt shape:

```text
[Reference contract]. [Subject lock]. [One visible action]. Camera: [one move]. Light: [physical source/change]. Sound: [audio intent or silence]. Stop when [endpoint]. Constraints: [do not change/transfer/replay].
```

Translate abstract requests into visible direction:

| Abstract ask | Compile as |
|---|---|
| cozy | warm practical light, small hand motion, slower camera |
| premium | controlled product highlight, still endpoint, clean background |
| tense | held frame, delayed movement, narrower light, quieter sound |
| energetic | faster blocking, rhythmic cuts or push, brighter contrast |
| realistic | physical cause for motion, restrained camera, ordinary light |

## Reference Consistency Contract

Give every reference a single primary role and an explicit exclusion. Treat this as a contract, not decoration.

- Image: identity, product, pose, costume, environment, first frame, or last frame.
- Video: motion, camera rhythm, pacing, blocking, gesture timing, or accepted continuation source.
- Audio: tempo, mood, ambience, music texture, or delivery tone.

Write both transfer and exclusion clauses:

```text
[Image1] controls product identity. [Video1] controls camera pace only. Preserve the product from [Image1]; do not copy people, logos, room, or costume from [Video1].
```

Do not let a reference carry everything. If a user says "use this as style," decide whether they mean identity, environment, color, motion, or pacing, then state that role in the prompt.

Use these conflict rules:

- Identity beats style: product/character identity reference wins over mood/style references.
- Accepted footage beats plan: a generated accepted clip defines the next opening state.
- Motion references transfer timing and blocking only, not people, rooms, logos, costumes, or faces.
- Audio references transfer tempo/energy only unless the user has explicit rights for voice/song likeness.
- Exact text, logos, captions, and UI labels belong in source images or post-production, not newly invented by video generation.

## Quality Gates

Before generating, check:

- One visible beat fits the duration.
- Endpoint is explicit.
- Camera has one main move, not a list.
- Light has a physical source or transition.
- References have roles and exclusions.
- Reference tags are preserved exactly from prompt to command.
- Text/logos/subtitles are not expected to be generated perfectly inside the video.
- Any real person, brand, voice, song, or protected IP has been rewritten or confirmed as authorized.

## Commands

Text-to-video draft:

```bash
anycap video generate \
  --model seedance-2-fast \
  --mode text-to-video \
  --prompt "A compact scene prompt..." \
  --param duration=4 \
  --param aspect_ratio=16:9 \
  --param resolution=720p \
  --param generate_audio=false \
  -o seedance-scene-draft.mp4
```

Image-to-video:

```bash
anycap video generate \
  --model seedance-2-fast \
  --mode image-to-video \
  --prompt "[Image1] preserved; the drawn steam becomes soft moving vapor while the cup, window, table, and composition stay fixed. Camera: slow push-in. A warm morning highlight crosses the cup. Stop on the brightest highlight. Do not add text." \
  --param images=./reference.png \
  --param duration=4 \
  --param aspect_ratio=16:9 \
  --param resolution=720p \
  -o seedance-image-draft.mp4
```

Multimodal reference:

```bash
anycap video generate \
  --model seedance-2 \
  --mode multi-modal-reference \
  --prompt "[Image1] controls subject identity; [Video1] controls camera rhythm only; [Audio1] controls tempo only. Do not transfer people, logos, rooms, voices, or music identity from the references." \
  --param images='["./subject.png"]' \
  --param videos='["./motion-ref.mp4"]' \
  --param audios='["./tempo-ref.mp3"]' \
  --param duration=8 \
  --param aspect_ratio=16:9 \
  --param resolution=1080p \
  -o seedance-multimodal-final.mp4
```

## Review And Retake

After generation, inspect the file and, when useful, run:

```bash
anycap actions video-read --file ./seedance-scene-draft.mp4 --instruction "Describe the visible action, camera movement, lighting, audio, and final frame. Note mismatches against the prompt."
```

Classify the take as keep, fix in post, edit, re-roll, or rewrite. For retakes, change one variable at a time: prompt clause, mode, reference, duration, resolution, or model. Use `seedance-2-fast` for exploration and reserve `seedance-2` for the locked direction.

Return results in this compact form:

```text
Done: <local_path>
Model/mode: <model> / <mode>
Params: <duration>, <aspect_ratio>, <resolution>, audio <on/off>
Take: <one-sentence review>
Next: <keep/final render/retake/continue/post>
```
