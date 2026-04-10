# 2026-04-10 Feishu Media Entity Download Design

## Goal

Let the personal Feishu daemon download image/file message resources locally before forwarding the turn to Codex, so Codex can read a real local file path instead of only `image_key` / `file_key`.

## Scope

- First version supports `image` and `file` only.
- The daemon downloads Feishu message resources with `message_id + image_key/file_key`.
- Downloaded media is saved under `<workspace>/.anycap/feishu-downloads/`.
- Structured Feishu context includes `local_path` after a successful download.
- `quoted_message`, `thread_history`, and `chat_history` media entries should also include `local_path` when the download succeeds.
- On download failure, keep the current metadata-only behavior.

## Out Of Scope

- `audio` / `video` downloads
- Server-side media proxying
- Cleanup / TTL policy
- Turn merge

## Approach

Use Feishu's message-resource download API instead of `GetImage`.

Why:

- `GetImage` only works for bot-uploaded images.
- User-sent images/files need the message-resource API.
- `present` also uses the message-resource API shape for user-shared media.

## Implementation Notes

1. Add a message-resource download method to `FeishuAdapter`.
2. Add local media metadata to normalized inbound events/context messages.
3. In the local Feishu bot ingress, download `image` / `file` resources into the workspace download directory.
4. Render `local_path` in the structured Feishu context passed to Codex.

## Success Criteria

- When the user sends a Feishu image or file, Codex receives a local file path in the structured context.
- When the user later says "看看这个图", the quoted/history media context also includes the local file path.
- If download fails, the old `image_key/file_key` metadata path still works and nothing breaks.
