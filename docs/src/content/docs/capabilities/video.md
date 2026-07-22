---
title: Video Generation
description: Generate video from text or animate a local image after discovering the current AnyCap model schema.
---

## Modes

| Mode | Use it for |
| --- | --- |
| `text-to-video` | Create a video from a prompt |
| `image-to-video` | Animate one or more supported image references |
| `edit-video` | Refine a supplied video using natural-language instructions |
| `first-last-frame-to-video` | Generate a transition between named first and last frames |
| `multi-shot-video` | Generate a sequence from shot-level prompts and durations |
| `multi-modal-reference` | Guide a video with supported image, video, or audio references |

A selected model supports only a subset of these modes. Query the live catalog instead of assuming a mode from this reference:

```bash
anycap video models \
  | jq -r '.models[] | .model as $model | .operations[]?.modes[]?.mode | [$model, .] | @tsv'
```

## Generate from text

```bash
anycap video models
anycap video models <model-id> schema --mode text-to-video
anycap video generate \
  --prompt "slow camera move through a quiet greenhouse" \
  --model <model-id> \
  --param aspect_ratio=16:9 \
  -o greenhouse.mp4
```

## Animate a local image

```bash
anycap video models <model-id> schema --mode image-to-video
anycap video generate \
  --prompt "gentle wind moves the leaves; slow camera push-in" \
  --model <model-id> \
  --mode image-to-video \
  --param images=./greenhouse.jpg \
  -o greenhouse-motion.mp4
```

The CLI validates and uploads the local reference, waits for generation, and downloads the result.

## Schema-driven controls

Duration, resolution, aspect ratio, reference limits, and other controls differ by model. Read the exact selected mode before passing parameters:

```bash
anycap video models <model-id> schema --mode image-to-video \
  | jq '.schemas[0].schema.model_params'
```

## Output

```json
{"status":"success","local_path":"/absolute/path/to/greenhouse-motion.mp4","model":"<model-id>","credits_used":5,"request_id":"req_abc123"}
```

For a complete workflow, see [Generate video from a local image](/guides/image-to-video/).
