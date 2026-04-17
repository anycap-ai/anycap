# Feishu Context Enrichment Before Turn Merge

## Goal

Improve the personal Feishu bot path so Codex receives richer IM-native context before we attempt any heuristic multi-message turn merge.

## Scope

- local daemon personal-bot path only
- no server API shape changes
- no binary media download yet
- no time-window turn merge yet

## Implementation Steps

1. Add Feishu message-read helpers in the local adapter.
   - fetch one quoted message by `parent_id`
   - fetch recent thread messages by `thread_id` or `root_id`
   - fetch recent chat messages by `chat_id`

2. Normalize fetched Feishu messages into the same internal shape used for inbound events.
   - preserve `message_id`
   - preserve `message_type`
   - preserve `parent_id/root_id/thread_id`
   - preserve mentions
   - preserve media/file metadata

3. Enrich inbound events in `feishu_longconn_bot.go` before calling `/v1/agent/im/inbound`.
   - attach `quoted_message`
   - attach bounded `thread_history`
   - attach bounded `chat_history`
   - degrade gracefully on fetch failures

4. Extend the structured payload rendering.
   - keep the current message structure intact
   - add a `feishu-context` wrapper only when extra context exists
   - include media/file metadata so Codex can relate follow-up text to earlier media

5. Add focused tests.
   - quoted image + follow-up text
   - thread history enrichment
   - recent chat history enrichment
   - graceful fallback when Feishu history fetch fails

## Guardrails

- keep history small
- skip the current message when rendering history
- do not block normal processing on Feishu read failures
- keep command messages unchanged
