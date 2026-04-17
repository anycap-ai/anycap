# Feishu Rich Message Context Design

Date: 2026-04-10

## 1. Goal

Upgrade the personal-bot daemon path so Codex sees more than a raw text string.

The daemon should preserve Feishu message semantics such as:

- `message_id`
- `chat_type`
- `message_type`
- `thread_id`
- `parent_id`
- `root_id`
- mentions

without changing the server API shape.

## 2. Problem

Today the local daemon receives a structured Feishu event, but it forwards only:

- `platform`
- `bot_id`
- `chat_id`
- `sender_id`
- raw `message`

to `/v1/agent/im/inbound`.

This means Codex cannot tell:

- whether the message is in a thread
- whether the user mentioned someone
- whether the message replied to or continued a previous thread
- basic IM metadata needed for better Feishu-native behavior

Codex already has its own thread/context continuity through `executor_ref`, but that is different from message-level IM semantics.

## 3. Scope

### In scope

- enrich `NormalizedInboundEvent` with Feishu metadata
- resolve mention placeholders in text messages
- render a structured Feishu context block for normal chat messages
- keep the server API as-is (`message` remains a single string field)
- keep command parsing and reaction selection on the raw text message

### Out of scope

- platform-level conversation compression
- server API schema changes
- history fetch (`chat_history` / `thread_history`)
- non-text message resource access
- shared-bot legacy flow changes

## 4. Design

### 4.1 Event normalization

The daemon-side Feishu normalization should capture:

- `message_id`
- `chat_type`
- `message_type`
- `thread_id`
- `parent_id`
- `root_id`
- mention list (`key`, `open_id`, `name`, `tenant_key`)

For text messages, mention placeholders such as `@_user_1` should be resolved to `@Name` in the raw message text.

### 4.2 Structured agent input

Add a renderer on `NormalizedInboundEvent` that produces a structured text block similar to:

```xml
<feishu-message message_id="om_xxx" chat_id="oc_xxx" chat_type="p2p" message_type="text" sender_open_id="ou_xxx" thread_id="omt_xxx" parent_id="om_parent" root_id="om_root">
  <mentions>
    <mention key="@_user_1" open_id="ou_target" name="Tom" />
  </mentions>
帮 @Tom 看下这个问题
</feishu-message>
```

This string becomes the `message` field sent to the server for normal chat messages.

### 4.3 Command compatibility

The raw trimmed text remains the canonical input for:

- `/new`
- `/reset`
- `/status`
- `/stop`
- `/fork`
- `/fire`
- reaction selection

So the daemon should:

1. keep `event.Message` as raw human text
2. detect chat commands from `event.Message`
3. send:
   - raw `event.Message` for commands
   - structured `event.AgentInputText()` for normal chat messages

This preserves the existing server-side command parser and reply flow.

## 5. Testing

Add focused tests for:

1. `normalizeEvent()` extracts message metadata and resolves mentions
2. `AgentInputText()` renders the expected Feishu context block
3. daemon `HandleInbound` sends structured text for normal messages
4. daemon `HandleInbound` keeps raw text for commands

## 6. Expected Outcome

After this change:

- Codex keeps its own long-running thread context
- and also receives the IM-level structure of the triggering Feishu message

This is the smallest step that meaningfully improves Feishu-native context without changing the current server contract.
