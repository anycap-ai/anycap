---
title: Video Generation
description: Generate video from text or animate a local image after discovering the current AnyCap model schema.
---

## Modes

| Mode | Input |
| --- | --- |
| `text-to-video` | Prompt |
| `image-to-video` | Prompt plus one or more supported image references |

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
