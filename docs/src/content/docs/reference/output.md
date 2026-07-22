---
title: JSON Output and Error Handling
description: Parse AnyCap JSON responses, preserve diagnostic identifiers, and handle partial output failures.
---

## Success responses

Commands write one final JSON document to stdout:

```json
{"status":"success","data":{},"request_id":"req_abc123"}
```

Generation commands promote useful fields such as `local_path`, `outputs`, `model`, and `credits_used` to the top level.

## Errors

```json
{"error":"RATE_LIMITED","message":"rate limit exceeded","hint":"retry after 60s","request_id":"req_abc123"}
```

Keep every diagnostic field returned by a failed invocation:

- `trace_id`
- `request_id`
- `task_id`
- `upstream_request_id`
- `stage`

## Common `jq` patterns

```bash
# Confirm success
anycap status | jq -e '.status == "success"'

# Extract a generated file
anycap image generate --prompt "..." --model <model-id> \
  | jq -r '.local_path'

# Extract all music outputs
anycap music generate --prompt "..." --model <model-id> \
  | jq -r '.outputs[].local_path'

# Read action content
anycap actions image-read --file ./screen.png \
  | jq -r '.content'

# Print an error message when present
anycap ... | jq -r '.message // empty'
```

## Stream contract

Validated model invocations emit one `invocation_started` JSON event to stderr before the server request. Stdout remains one final document, making it safe to pipe into `jq` or redirect to a file.

## Partial audio download failures

Audio generation can produce multiple artifacts. If provider generation succeeds but an individual local download fails, that output contains an `error` field. Inspect every `outputs[]` item instead of treating one missing local path as total provider failure.
