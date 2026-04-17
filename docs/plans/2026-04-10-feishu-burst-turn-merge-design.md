# 2026-04-10 Feishu Burst Turn Merge Design

## Goal

Reduce fragmented Codex turns for the personal Feishu bot path when the human sends:

- several short text messages back-to-back
- an image/file and then a follow-up text immediately after

The desired behavior is:

- only one immediate ack for the burst
- only one Codex turn for the burst
- the final turn should preserve the latest text as the primary message while earlier inputs remain available through existing Feishu chat history enrichment

## Scope

This design applies only to the local personal-bot daemon ingress.

Out of scope:

- shared-bot legacy Feishu ingress
- slash-style commands
- server-side conversation model changes
- semantic message merge in server/application layers

## Approach

### Recommended

Implement a small pending-turn aggregator in the local `FeishuLongConnBot`.

Rules:

- only `continue` chat turns are eligible
- key by `bot_id + chat_id + sender_id + thread/root scope`
- hold the first eligible event for a short debounce window
- if another eligible event arrives for the same key within the window:
  - replace the pending event with the latest one
  - reset the timer
- when the window closes:
  - dispatch only the latest event to the existing inbound handler

Why this works:

- the latest event still runs through the current Feishu context enrichment path
- earlier burst messages are visible through `chat_history` / `thread_history`
- no server protocol change is required

### Alternatives considered

1. Server-side turn merge
   - rejected because the server no longer owns the preferred Feishu ingress path

2. Semantic merge via Codex prompt
   - rejected because it would still create multiple sessions and introduce more model latency for a transport-layer problem

## Behavior details

- Commands bypass burst merging and dispatch immediately.
- If a command arrives while a pending burst exists for the same key, flush the pending burst first to preserve ordering.
- The daemon default enables burst merging with a small window (currently 1.2 seconds).
- Tests should cover:
  - two short text messages -> one inbound dispatch
  - image then text -> one inbound dispatch
  - daemon wiring enables the merge window in the personal Feishu bot path

## Risks

- A too-large window can make the bot feel slow.
- A too-small window can still fragment the turn.

The first version therefore keeps the merge local, bounded, and configurable in code without changing external APIs.
