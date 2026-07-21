---
title: Troubleshooting
description: Resolve AnyCap installation, authentication, local-file, model-schema, rate-limit, and output issues.
---

## `anycap` is not found

```bash
ls -la ~/.local/bin/anycap
export PATH="$HOME/.local/bin:$PATH"
command -v anycap
```

Reload your shell profile after confirming the binary exists.

## Authentication fails

```bash
anycap status
anycap login --headless
```

In CI, confirm `ANYCAP_API_KEY` exists in the process environment without printing it. Remember that an environment value takes precedence over persistent credentials.

## A model rejects a parameter

Model contracts evolve. Inspect the selected model and exact mode instead of copying parameters from another model:

```bash
anycap image models <model-id> schema --mode image-to-image
```

Pass only fields and enum values advertised by the current schema.

## A local file is not accepted

- Confirm the path exists.
- Use `--file` for media understanding and the documented `--param` field for generation.
- In MCP, confirm the canonical file path is under an effective allowed root.
- Do not upload to Drive merely to feed a local file into another AnyCap command.

## A local video is too large

`actions video-read --file` accepts files up to 100 MB. Compress an oversized file first:

```bash
ffmpeg -i input.mp4 -vcodec libx264 -crf 28 output.mp4
```

## Capture diagnostics

Keep `trace_id`, `request_id`, `task_id`, `upstream_request_id`, and `stage` fields from failed calls. Submit a focused report:

```bash
anycap feedback --type bug \
  -m "describe the unexpected result" \
  --request-id <request-id>
```

See [Feedback and diagnostics](/reference/feedback/) for structured failure reports.
