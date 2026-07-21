---
title: Image Generation and Editing
description: Generate images from text or transform local and remote reference images with AnyCap.
---

## Supported workflows

| Mode | Use it for |
| --- | --- |
| `text-to-image` | Create a new image from a prompt |
| `image-to-image` | Edit, restyle, or transform reference images |

Support varies by model. Discover the current catalog before choosing one.

## Generate from text

```bash
anycap image models
anycap image models <model-id> schema --mode text-to-image
anycap image generate \
  --prompt "editorial product still life, warm daylight" \
  --model <model-id> \
  --param aspect_ratio=16:9 \
  -o editorial-hero.png
```

The `aspect_ratio` example is valid only when the selected schema advertises it.

## Edit a local image

```bash
anycap image models <model-id> schema --mode image-to-image
anycap image generate \
  --prompt "remove the background and preserve the subject" \
  --model <model-id> \
  --mode image-to-image \
  --param images=./photo.png \
  -o subject-transparent.png
```

Local files are uploaded automatically. You can also pass an HTTP(S) URL.

## Multiple references

When the schema allows multiple images, pass a JSON array. Repeating the same `--param images=` flag overwrites the previous value.

```bash
--param images='["./structure.png","./palette.png"]'
```

## Output

```json
{"status":"success","local_path":"/absolute/path/to/editorial-hero.png","model":"<model-id>","credits_used":1,"request_id":"req_abc123"}
```

Use `jq -r '.local_path'` to extract the downloaded file.

## Precise human-guided edits

Use [Annotate](/capabilities/collaboration/) to collect numbered spatial feedback, then pass the annotated image back to `image generate` in `image-to-image` mode.
