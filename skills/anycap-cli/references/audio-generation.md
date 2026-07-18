# Audio Generation

Generate complete audio scenes and soundscapes from text, audio, or image inputs. Generated outputs are downloaded automatically and returned as JSON with their local paths and audio metadata.

## Discover Before Generating

Always use the live catalog. Model availability and supported controls come from the server's current NexusHub Discovery data.

```bash
anycap audio models
anycap audio models <model-id>
anycap audio models <model-id> schema --mode text-to-audio
anycap audio models <model-id> schema --mode audio-to-audio
anycap audio models <model-id> schema --mode image-to-audio
```

Do not guess formats, sample rates, numeric ranges, or reference limits. Read the selected mode's schema and pass only advertised parameters.

## Modes

### Text to Audio

Generate audio from a prompt. A model may expose an optional `speaker_ids` array; when present, follow its schema limit.

```bash
anycap audio generate \
  --prompt "wind moving through tall pine trees, distant birds, natural stereo ambience" \
  --model <model-id> \
  --mode text-to-audio \
  -o forest-wind.mp3
```

If the schema advertises speaker references:

```bash
anycap audio generate \
  --prompt "a calm spoken introduction over a quiet room tone" \
  --model <model-id> \
  --mode text-to-audio \
  --param speaker_ids=<speaker-id> \
  -o introduction.mp3
```

### Audio to Audio

Guide generation with reference audio. `audios` accepts a local path or an `http(s)` URL; local files are uploaded automatically.

```bash
anycap audio generate \
  --prompt "preserve the rhythm but make the texture warmer and more organic" \
  --model <model-id> \
  --mode audio-to-audio \
  --param audios=./reference.wav \
  -o warmer-version.mp3
```

For multiple references, pass a JSON array only when the live schema permits it:

```bash
--param audios='["./reference-a.wav","./reference-b.wav"]'
```

### Image to Audio

Generate a matching soundscape from an image reference. `images` accepts a local path or URL.

```bash
anycap audio generate \
  --prompt "create the natural environmental soundscape implied by this scene" \
  --model <model-id> \
  --mode image-to-audio \
  --param images=./scene.png \
  -o scene-soundscape.mp3
```

## Common Controls

Controls are schema-driven and can include `format`, `sample_rate`, `speech_rate`, `loudness_rate`, `pitch_rate`, and `enable_subtitle`.

```bash
anycap audio generate \
  --prompt "steady rain on a metal roof" \
  --model <model-id> \
  --param format=mp3 \
  --param sample_rate=24000 \
  --param enable_subtitle=true \
  -o metal-roof-rain.mp3
```

The example values are illustrative. Confirm them against the selected model and mode schema before use.

## Output

The command writes one final JSON document to stdout. Audio outputs can contain:

- `local_path`: absolute path of the downloaded file
- `url`: server-provided artifact URL
- `mime_type`
- `duration_seconds`
- `original_duration_seconds`
- `size_bytes`
- `subtitle`, when requested and returned

Root-level output can also include `usage`, `credits_used`, `task_id`, and invocation diagnostics.

```bash
anycap audio generate --prompt "..." --model <model-id> -o output.mp3 \
  | jq -r '.outputs[0].local_path'
```

If an individual download fails after provider generation succeeded, that output contains an `error` field instead of hiding the successful provider result.

