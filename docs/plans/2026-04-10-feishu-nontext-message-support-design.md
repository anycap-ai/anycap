# Feishu Non-Text Message Support Design

Date: 2026-04-10

## 1. Goal

Make the personal-bot daemon stop silently dropping non-text Feishu messages.

The first step is not full resource download support. It is:

- accept non-text Feishu messages
- preserve their metadata
- forward a structured context block to the server
- include the original Feishu content JSON so Codex can see available resource identifiers

## 2. Problem

Today `normalizeEvent()` skips any Feishu message whose `message_type != text`.

That means:

- image messages disappear
- file messages disappear
- audio / video messages disappear
- the conversation history on the server never records that the user sent them

## 3. Scope

### In scope

- stop skipping non-text messages
- keep `message_type`, `message_id`, `chat_type`, `thread_id`, `parent_id`, `root_id`
- store the raw Feishu `content` JSON on the normalized event
- render a structured non-text message body for agent input
- keep the server API unchanged

### Out of scope

- downloading the actual image/file/audio/video bytes
- new HTTP APIs for resource access
- history fetch
- shared-bot legacy flow

## 4. Design

### 4.1 Normalization

For text messages:

- keep the current behavior
- still resolve mention placeholders in the human-readable message

For non-text messages:

- do not skip the event
- keep `message_type`
- keep raw `content` JSON as `ContentJSON`
- set a synthetic `Message` summary such as:
  - `User sent a Feishu image message. Inspect content_json for resource identifiers.`

This summary ensures:

- the event still counts as a normal conversation turn
- reaction selection still has some lightweight text to work with
- command parsing will not accidentally treat the event as empty

### 4.2 Structured agent input

For non-text messages, render:

```xml
<feishu-message message_id="om_xxx" chat_id="oc_xxx" chat_type="p2p" message_type="image" sender_open_id="ou_xxx">
  <resource_notice>User sent a non-text Feishu image message. Inspect content_json for resource identifiers.</resource_notice>
  <content_json>{"image_key":"img_123"}</content_json>
</feishu-message>
```

This gives Codex:

- message type
- message IDs and thread/reply linkage
- original Feishu resource keys from the event payload

## 5. Compatibility

- commands still use raw `event.Message`
- text messages still use the richer text-message context block
- non-text messages become normal continue turns with a synthetic summary plus `content_json`

## 6. Testing

Add focused tests for:

1. `normalizeEvent()` accepts image/file messages instead of skipping them
2. non-text normalized events keep `MessageType` and `ContentJSON`
3. `AgentInputText()` for non-text messages renders `resource_notice` and `content_json`
4. daemon inbound still sends a structured message for non-text events

## 7. Expected Outcome

After this change, non-text Feishu messages will no longer disappear.

Codex will not yet download or inspect the actual binary resource, but it will at least know:

- that a non-text message was sent
- what Feishu message type it was
- which resource identifiers were present in the original event payload
