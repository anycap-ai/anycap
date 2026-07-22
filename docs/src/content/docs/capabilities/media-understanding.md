---
title: Understand Images, Video, and Audio
description: Extract text, compare images, summarize video, and transcribe audio with AnyCap actions.
---

Understanding actions select a strong default model automatically. Specify `--model` only when you need a particular model.

## Read images

Analyze up to 10 local files and URLs in one request:

```bash
anycap actions image-read \
  --file ./before.png \
  --file ./after.png \
  --instruction "List every visible change" \
  | jq -r '.content'
```

## Read video

```bash
anycap actions video-read \
  --file ./demo.mp4 \
  --instruction "Summarize the flow and list all on-screen text" \
  | jq -r '.content'
```

Direct video URLs and public YouTube URLs are also supported. Exactly one `--url` or `--file` is required. Local video files must be no larger than 100 MB.

## Read audio

```bash
anycap actions audio-read \
  --file ./meeting.mp3 \
  --instruction "Transcribe the decisions and action items" \
  | jq -r '.content'
```

Direct audio URLs and YouTube URLs are supported.

## Response shape

```json
{"status":"success","content":"...model response...","request_id":"req_abc123"}
```

## Local-file rule

Pass local files directly with `--file`. Do not upload them to Drive first. The action handles its own upload and returns only the analysis text and diagnostics.
