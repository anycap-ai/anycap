# Feishu Daemon Final Reply Design

## Goal

Move the recommended `anycap connect feishu` final-reply path from server-owned Feishu egress to daemon-owned Feishu egress, while keeping the existing server publish path for legacy and fallback runners.

## Current Behavior

- The local daemon owns Feishu LongConn ingress when the user configures personal bot credentials with `anycap connect credentials set feishu`.
- The daemon forwards inbound messages to `/v1/agent/im/inbound`; the immediate acknowledgement is returned by the server and sent by the daemon's local Feishu adapter.
- After Codex finishes, the daemon posts a session update with `final_message`.
- The server stores the final message and currently publishes the final Feishu reply through its configured adapter or reply relay.

## Proposed Behavior

- Add a runner session update delivery preference:
  - default/empty: server publishes as it does today.
  - `client`: server stores the session update, builds the final IM reply payload, returns it in the HTTP response, and skips server publish.
- Configure the local daemon to use `reply_delivery=client` only when it has a local Feishu adapter for the same LongConn bot.
- The runner loop invokes a local outbound handler for returned replies.
- The daemon sends the returned reply through its local `FeishuAdapter.SendMessage`, using the personal bot credentials already used for LongConn ingress.

## API Shape

Request:

```json
{
  "status": "committed",
  "final_message": "修复完成",
  "executor_ref": "codex-exec",
  "reply_delivery": "client"
}
```

Response data keeps the existing session fields and may add:

```json
{
  "outbound_reply": {
    "platform": "feishu",
    "bot_id": "cli_personal_bot",
    "channel_id": "oc_chat",
    "sender_id": "ou_owner",
    "message": "修复完成",
    "idempotency_key": "ags_123:committed"
  }
}
```

## Compatibility

- `anycap agent runner serve` and any older daemon that does not send `reply_delivery=client` keep the current server publish behavior.
- Server direct Feishu API and `ANYCAP_AGENT_CONTROL_FEISHU_REPLY_API` relay remain available as fallback egress paths.
- If client delivery is requested but no outbound reply can be built, the server still returns the stored session update without publishing. The daemon has no local message to send and can continue without duplicating messages.

## Server Visibility

- The server still records the final text in `agent_sessions.final_message`.
- This design does not add durable provider delivery receipts. The server can know what should be sent, but not whether Feishu accepted it unless a later delivery-report endpoint is added.

## Tests

- Handler test: `reply_delivery=client` returns `outbound_reply` and does not call the server adapter.
- Handler test: default request still publishes through the server adapter.
- HTTP client test: daemon-owned client sends `reply_delivery=client` and parses `outbound_reply`.
- Runner loop test: returned outbound replies are handed to the configured local handler after terminal session updates.
