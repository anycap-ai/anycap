# Video QA And Retry

Do not judge a video edit from a single preview frame. Check file properties, sampled frames, semantic preservation, and manual playback.

## File Checks

Use `ffprobe` if available:

```bash
ffprobe -hide_banner -v error \
  -show_entries format=duration:stream=index,codec_type,codec_name,width,height,r_frame_rate \
  -of json ./edited-output.mp4
```

Confirm:

- video exists and is playable
- duration matches the requested or nearest supported value
- resolution and aspect ratio match the live schema request
- audio presence matches the user's expectation

## Frame Contact Sheet

Sample early, middle, and late frames. If `ffmpeg` is available:

```bash
mkdir -p ./qa-frames
ffmpeg -hide_banner -y -i ./edited-output.mp4 \
  -vf "fps=1,scale=480:-1,tile=5x2" \
  -frames:v 1 ./qa-frames/contact-sheet.jpg
```

Inspect:

- first two seconds for target-object transition errors
- hand contact and occlusion
- product silhouette, color, and logo stability
- face and identity preservation
- background drift
- added text, graphics, or unintended props

## Video Understanding Check

Use AnyCap video-read for a second pass:

```bash
anycap actions video-read \
  --file ./edited-output.mp4 \
  --instruction "Check whether the requested edit was applied. Describe any identity changes, hand artifacts, object flicker, background changes, extra text/graphics, audio changes, and whether the result is usable."
```

For product replacement:

```bash
anycap actions video-read \
  --file ./edited-output.mp4 \
  --instruction "Evaluate this as a product replacement edit. Does the product match the reference description, stay stable across frames, appear naturally held with realistic hand occlusion, and preserve everything else in the original scene?"
```

## Manual Playback Checklist

Watch the output at normal speed and scrub frame by frame around the edited region.

Pass criteria:

- the requested edit is visible and stable
- the unedited scene remains recognizably the same
- hands, faces, and body geometry are plausible
- no obvious flicker, smearing, or object popping
- no unintended overlays, captions, logos, or scene cuts
- audio is acceptable for the deliverable

## Retry Strategy

When a result fails, change one thing at a time.

| Failure | Next prompt change |
|---------|--------------------|
| Edited too much | Shorten prompt and add "Keep everything else the same." |
| Identity changed | Add "preserve the exact same face, identity, body, clothing, and pose." |
| Product is generic | Add 3-5 concrete reference details: shape, material, label, color, handle, lid, logo placement. |
| Product flickers | Add "stable silhouette, stable color, stable size, stable logo placement across all frames." |
| Hands warp | Add "preserve hand pose, finger positions, grip, and occlusion." Consider a simpler edit. |
| Background changes | Add "preserve the exact background layout and camera motion." |
| Text is wrong | Reduce to only the text edit, quote the exact text, and QA frames. |
| Audio changed | Add "preserve the original audio" or specify the desired audio. |
| Output crops wrong | Match the source aspect ratio or change only `aspect_ratio` if the user asked for a format conversion. |

If two retries fail on the same artifact, tell the user the specific blocker and propose either a narrower edit, a different reference image, or a different video model.
