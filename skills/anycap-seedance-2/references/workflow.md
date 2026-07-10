# AnyCap Seedance Workflow

This workflow is adapted from the MIT-licensed Seedance 2.0 Skill OS by Iamemily2050, with the execution layer mapped to AnyCap CLI commands. Keep this reference concise: AnyCap schema is the source of truth for executable parameters.

## End-To-End Loop

1. Intake the user's scene goal, audience, aspect ratio, duration, references, safety/rights risk, and whether audio should be generated.
2. Choose `seedance-2-fast` for draft speed or `seedance-2` for final quality.
3. Choose mode: `text-to-video`, `image-to-video`, or `multi-modal-reference`.
4. Fetch schema for the selected model and mode.
5. Build a reference role map before prompt prose.
6. Compile one compact prompt for the current clip only.
7. Generate with `anycap video generate`.
8. Review the generated video manually or with `anycap actions video-read`.
9. Keep, fix in post, re-roll, rewrite, or continue from accepted footage.

## Prompt Assembly

Build the prompt as a contract, then a scene. Use this compact structure for most clips:

```text
[Reference contract if any]. [Subject lock]. [One visible action]. Camera: [one motivated move]. Light: [physical source or transition]. Sound: [audio intent or silence]. Stop when [endpoint]. Constraints: [do not change/transfer/replay].
```

Strong prompts spend words on concrete motion and endpoint control. Weak prompts spend words on generic quality boosters, abstract emotion, or future story beats that cannot happen in one short generation.

If an object could be interpreted in the wrong depth plane, anchor it physically. For example, prefer "a droplet stays attached to the windowpane behind the cup and slides downward on the glass" over "a droplet slides down the glass."

For stylized image references, drawn elements may remain graphic and scale with camera movement. If real motion matters, explicitly allow the element to become physical while preserving layout: "the drawn steam becomes soft moving vapor, but the cup, window, table, and composition stay fixed."

## Prompt Budget

Spend prompt words in this order:

1. Reference roles and exclusions.
2. Subject/product identity.
3. Current visible action.
4. Endpoint.
5. One camera move.
6. One physical light source or transition.
7. Audio timing or silence.
8. Safety, continuity, and no-transfer constraints.

Delete generic style boosters, duplicate adjectives, future story summary, and background details already visible in references.

## Reference Roles

Assign one main role per asset:

| Asset | Best role | Common mistake |
|---|---|---|
| Image | identity, product, pose, environment, first frame, last frame | asking a still to define detailed timing |
| Video | motion, camera rhythm, gesture timing, accepted previous clip | transferring identity, room, logo, or costume unintentionally |
| Audio | tempo, ambience, mood, music energy | treating audio as voice, song, or likeness authorization |

Always include both what transfers and what does not transfer.

If references compete, read `reference-consistency.md` and resolve the conflict before generating. Never ask Seedance to infer which reference owns identity, style, motion, tempo, or environment.

## Continuation

Do not continue from a plan when generated footage exists. Continue from the accepted clip or its final frame.

For AnyCap, prefer `multi-modal-reference` with the accepted clip as `videos=<path>`:

```text
[Video1] is the accepted previous clip and controls only the actual opening state, camera phase, motion phase, ambience, and environment arrangement. This clip only continues the same shot as [new action]. Do not replay completed action. Stop when [new endpoint].
```

If the clip is not available, ask for it or for the final frame before writing the continuation prompt.

## Review Prompt

Use `video-read` with the original prompt in the instruction. Ask for concrete evidence:

```bash
anycap actions video-read --file ./take.mp4 --instruction "Review this Seedance take against the prompt. Report visible action, camera movement, lighting, audio, final frame, what matched, what mismatched, and whether the next action should be keep, fix in post, re-roll, rewrite, or continue. Prompt: <prompt>"
```

Do not treat the review as taste alone. Tie the verdict to the primary spend: the product reveal, action beat, continuity handoff, camera move, or emotional turn the shot exists to deliver.

## Retake Economy

Use five verdicts:

| Verdict | Use when | Action |
|---|---|---|
| Keep | Primary goal is delivered | Lock the take |
| Fix in post | Flaw is trim, color, text, audio mix, or a few edge frames | Do not regenerate |
| Edit | Timing/composition works and one layer is wrong | Use edit mode if available |
| Re-roll | Prompt is right but sample is unlucky | Same prompt, new take |
| Rewrite | Same flaw appears twice | Change the prompt or mode |

Change one variable per retake. Draft cheaply with `seedance-2-fast`, then lock with `seedance-2`.

## Failure Fixes

| Symptom | Likely cause | Smallest retake |
|---|---|---|
| Action happens in the wrong place | Object/depth plane not anchored | Add physical anchor: "attached to the windowpane", "on the table surface", "behind the subject" |
| Reference identity drifts | Prompt re-described the subject or gave reference too many roles | State `[Image1] controls identity` and remove competing subject prose |
| Layout changes in I2V | Prompt describes scene instead of delta | Use `[Image1] preserved; only X changes` |
| Motion is static | Reference is graphic/stylized or action is too subtle | Allow physical conversion: "drawn steam becomes soft moving vapor" |
| Too much happens | Clip has multiple beats | Split into sequence clips |
| Product/logo/text is wrong | Video model is asked to generate exact text | Use post-production or image generation for text-heavy frame, then animate carefully |
| Same flaw appears twice | Systematic prompt issue | Rewrite one clause or change mode, not seed alone |
| Looks generic | Prompt has mood words but no action endpoint | Add visible beat, endpoint, camera, physical light |

## Smooth User Experience

Ask at most one concise question when a reasonable default is risky. Otherwise use defaults and tell the user what you chose:

- Draft: `seedance-2-fast`, 4 seconds, 16:9, 720p.
- Final: `seedance-2`, 6-10 seconds, target aspect ratio, 1080p or 4k when requested and available.
- Audio: off for tests unless the scene depends on sound; on for final narrative/audio-led clips.

Return the local video path, model, mode, key params, and a short take review. If a generated result is poor, recommend the smallest next retake.

## Test Scenarios

Use low-cost drafts for E2E checks:

1. Text-to-video smoke test:
   - Model: `seedance-2-fast`
   - Mode: `text-to-video`
   - Params: `duration=4`, `aspect_ratio=16:9`, `resolution=720p`, `generate_audio=false`
   - Prompt: `A small ceramic espresso cup on a rain-speckled cafe table. Steam curls upward as neon reflections ripple across the window behind it. Camera: slow push-in. Light: cool blue window light with warm counter glow. A single droplet stays attached to the windowpane behind the cup and slides downward on the glass. Stop as the droplet reaches the lower edge of the window reflection.`

2. Image-to-video smoke test:
   - Model: `seedance-2-fast`
   - Mode: `image-to-video`
   - Reference: a local static image
   - Params: `duration=4`, `aspect_ratio=16:9`, `resolution=720p`
   - Prompt: `[Image1] preserved; the drawn steam becomes soft moving vapor while the cup, window, table, and composition stay fixed. Camera: slow push-in. A warm morning highlight crosses the cup. Stop on the brightest highlight. Do not add text.`

3. Continuation test:
   - Model: `seedance-2-fast` for preview or `seedance-2` for final
   - Mode: `multi-modal-reference`
   - Reference: accepted previous clip as `videos=<path>`
   - Prompt: `[Video1] is the accepted previous clip and controls the actual opening state. Continue the same shot as the steam thins and the camera settles. Do not replay the droplet slide. Stop on stillness.`
