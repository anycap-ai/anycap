---
title: Feedback and Diagnostics
description: Submit actionable AnyCap bug reports and feature requests with request and trace diagnostics.
---

## Submit feedback

```bash
anycap feedback --type bug \
  -m "image generation returned no output" \
  --request-id <request-id>

anycap feedback --type feature \
  -m "describe the missing workflow and why it matters"
```

Supported types are `bug`, `feature`, and `other`.

## Structured diagnostics

For silent, timeout, empty-result, or provider failures, preserve the original invocation context:

```bash
anycap feedback --type bug \
  -m "generation returned no downloadable output" \
  --diagnostics '{
    "trace_id":"trc_...",
    "task_id":"task_...",
    "capability":"music.generate",
    "model":"<model-id>",
    "stage":"validate_result",
    "error_code":"UPSTREAM_EMPTY_RESULT"
  }'
```

Useful identifiers include `trace_id`, `request_id`, `task_id`, `upstream_request_id`, `stage`, capability, model, invocation time, and error code.

## Include enough evidence

A useful report states:

1. the intended outcome
2. the command shape without secrets
3. the observed response or missing output
4. diagnostic IDs from the original invocation
5. whether retrying changed the result

Never include API keys, credential files, private share passwords, or unrelated user content.

## Disable feedback commands

```bash
anycap config set feedback false
```
