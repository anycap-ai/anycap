---
title: Music and Audio Generation
description: Generate music, speech, dialogue, and complete audio scenes through live AnyCap model schemas.
---

## Generate music

```bash
anycap music models
anycap music models <model-id> schema --mode text-to-music
anycap music generate \
  --prompt "warm lo-fi study beat" \
  --model <model-id> \
  --tags "lofi,warm,study" \
  --instrumental \
  -o study-beat.mp3
```

Use `--title`, `--lyrics`, and schema-advertised parameters when the selected model supports them. A request can return multiple clips under `outputs`.

```bash
anycap music generate --prompt "..." --model <model-id> \
  | jq -r '.outputs[].local_path'
```

## Generate audio scenes

Audio models may support text, audio, or image input:

```bash
anycap audio models
anycap audio models <model-id> schema --mode text-to-audio
anycap audio generate \
  --prompt 'A calm narrator says: "Welcome to AnyCap." Quiet studio ambience.' \
  --model <model-id> \
  --mode text-to-audio \
  -o welcome.mp3
```

Other schema-discovered modes can include:

- `audio-to-audio` for reference-guided performance or scene generation
- `image-to-audio` for a scene guided by an image

These are generation workflows, not claims of a general-purpose audio editor. Confirm formats, sample rates, reference limits, subtitles, and voice controls against the live schema.

## Output metadata

Audio outputs can include `local_path`, `mime_type`, duration, byte size, subtitle data, usage, and diagnostic IDs. If one local download fails after provider generation succeeds, that output reports its own `error` instead of hiding the successful provider result.
