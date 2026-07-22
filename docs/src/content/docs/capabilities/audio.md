---
title: Audio Generation
description: Generate audio scenes, speech, and dialogue through live AnyCap model schemas.
---

## Audio generation

Audio is a generation capability distinct from music. The selected model may expose one or more of these mode values; inspect the live catalog before choosing one:

| Mode | Use it for |
| --- | --- |
| `text-to-audio` | Create an audio scene, speech, or dialogue from a prompt |
| `audio-to-audio` | Guide a new result with supported audio references |
| `image-to-audio` | Guide an audio scene with a supported image reference |

```bash
# Print the modes advertised by every audio model right now.
anycap audio models \
  | jq -r '.models[] | .model as $model | .operations[]?.modes[]?.mode | [$model, .] | @tsv'
```

```bash
anycap audio models
anycap audio models <model-id> schema --mode text-to-audio
anycap audio generate \
  --prompt 'A calm narrator says: "Welcome to AnyCap." Quiet studio ambience.' \
  --model <model-id> \
  --mode text-to-audio \
  -o welcome.mp3
```

These are generation workflows, not claims of a general-purpose audio editor. Confirm formats, sample rates, reference limits, subtitles, and voice controls against the selected live schema.

## Output metadata

Audio outputs can include `local_path`, `mime_type`, duration, byte size, subtitle data, usage, and diagnostic IDs. If one local download fails after provider generation succeeds, that output reports its own `error` instead of hiding the successful provider result.

For composed tracks, see [Music generation](/capabilities/music/).
