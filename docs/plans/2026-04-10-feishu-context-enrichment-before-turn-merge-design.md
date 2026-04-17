# Feishu Context Enrichment Before Turn Merge Design

## Goal

Before implementing message-turn merging for the personal Feishu bot path, first make each inbound message carry richer Feishu-native context so Codex can understand:

- what message is being replied to
- whether the message is inside a thread
- what recent messages were exchanged in the same chat
- what media/file metadata is associated with the current or quoted message

The goal is to get closer to the native Codex "upload image + ask a question" experience without immediately introducing heuristic message coalescing.

## Why This Order

The current AnyCap daemon already sends structured Feishu message wrappers, but each inbound event is still mostly isolated.

For the user pattern:

1. send an image
2. send "看看这个图"

we currently create two separate sessions. A pure time-window merge could reduce that, but it would still guess the relationship. A better first step is to explicitly preserve the relationship and surrounding context in the agent input.

This follows the stronger pattern already used in `present`:

- quoted message lookup
- thread history
- recent chat history
- file/media metadata

## Recommended Approach

Implement context enrichment first on the local personal-bot daemon path only.

### 1. Keep the current one-event-per-dispatch model

Do not change the server conversation/session contract yet.

Each inbound Feishu event still becomes one daemon -> server inbound request.

### 2. Enrich the message payload before sending it to server

For each inbound event, build a larger Feishu context block that can include:

- current message metadata
- current message media/file metadata
- quoted/parent message summary when `parent_id` is present
- small thread history summary when `thread_id` or `root_id` is present
- small recent chat history summary

### 3. Prefer structural context over heuristic merging

If the user replies to an image, the agent should learn that relationship from explicit context first, not from guessed timing.

### 4. Defer turn merge

After context enrichment is in place, we can re-evaluate whether explicit multi-message turn merge is still needed. It may still be useful later, but it should no longer be the first dependency.

## Scope

### In scope

- personal Feishu bot path only
- daemon-side context enrichment before `/v1/agent/im/inbound`
- quoted message fetch
- bounded thread history summary
- bounded chat history summary
- media/file metadata in structured input

### Out of scope

- server-side shared bot path
- changing server conversation persistence model
- downloading binary image/file payloads
- heuristic turn merge

## Input Shape

The current `AgentInputText()` format can be extended rather than replaced.

Example direction:

```xml
<feishu-context>
  <current_message message_id="om_text" chat_id="oc_xxx" chat_type="p2p" message_type="text" sender_open_id="ou_xxx">
    看看这个图
  </current_message>
  <quoted_message message_id="om_image" message_type="image" sender_open_id="ou_xxx">
    <resource_notice>User sent a Feishu image message.</resource_notice>
    <content_json>{"image_key":"img_123"}</content_json>
  </quoted_message>
  <chat_history>
    <message role="user" message_type="image" message_id="om_image">...</message>
  </chat_history>
</feishu-context>
```

The exact final rendering can stay compact, but the key is that the relationship becomes explicit.

## Data Sources

The daemon already has the current inbound event from the Feishu long-connection SDK.

To enrich context, the next step is to use Feishu message-read APIs via the local bot credentials to fetch:

- the quoted message by `parent_id`
- thread messages by `thread_id` / `root_id`
- recent chat messages by `chat_id`

## Guardrails

- keep history small and bounded
- exclude the current message from fetched history summaries
- if Feishu history fetch fails, continue with current behavior
- if quoted/thread/chat history is unavailable, degrade gracefully
- do not block normal text-only flows on context fetch failures

## Why This Is Better Than Starting With Turn Merge

- more accurate than timing guesses
- works for explicit reply/thread flows
- improves all downstream reasoning, not just image follow-ups
- aligns better with the `present` Lark context model
- keeps the server contract stable

## Success Criteria

1. A text message replying to an earlier image carries explicit quoted-image context to Codex.
2. A thread reply carries bounded thread history.
3. A normal chat message carries small recent chat history when available.
4. The daemon still works if Feishu history APIs fail.
5. No server API changes are required for this first step.
