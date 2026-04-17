# Feishu URL Read/Write Design

## Context

Personal Feishu bot ingress already runs inside the local daemon with the user's Feishu App ID/App Secret. The daemon can receive Feishu messages, enrich IM context, download message images/files into `.anycap/feishu-downloads/`, and forward structured local paths to Codex.

The next useful IM capability is to let a user paste a Feishu resource URL and ask the agent to analyze or modify it:

```text
帮我分析这个飞书文档 <docx-url>
把结论追加到这个文档末尾 <docx-url>
看这个表，帮我补一列结论 <sheets-url>
把这些结果写回这个多维表格 <base-url>
```

The feature should stay in the personal bot path first. It should not require AnyCap Server to store Feishu App Secret, and it should not depend on an external `lark-cli` binary at runtime.

## Goals

- Detect Feishu document resource URLs in normal personal-bot messages.
- Read supported Feishu resources into local artifacts that Codex can inspect on demand.
- Let Codex request constrained write operations back to the explicitly referenced Feishu resource when the user asks for online modifications.
- Support these resource types:
  - `docx`
  - `wiki` nodes whose underlying object is `docx`, `sheet`, or `bitable`
  - `sheets`
  - `bitable`
- Keep read/write behavior inside the local daemon and direct Feishu adapter so Feishu credentials remain local.

## Non-Goals

- Do not build a generic IM resource system across Slack/Discord/etc. in this phase.
- Do not store Feishu App Secret or raw resource contents on AnyCap Server.
- Do not support arbitrary free-form block patching in docx as the first write primitive.
- Do not require a confirmation turn before writes. The user explicitly chose no confirmation gate.
- Do not read unbounded large sheets/bitables by default.

## References From `clify/lark-cli`

`/Users/sczhao/dev/Projects/converge-ai/ai-infra/clify` is a useful implementation reference:

- `clis/lark-cli/cmd/docx/document.go`: `docx document raw-content` uses `client.Docx.Document.RawContent`.
- `clis/lark-cli/cmd/docx/block.go`: docx block list/get/patch/batch-update patterns.
- `clis/lark-cli/cmd/wiki/node.go`: wiki node lookup and `obj_token` resolution.
- `clis/lark-cli/cmd/sheets/sheet.go`: sheet query for sheet IDs.
- `clis/lark-cli/cmd/sheets/values.go`: sheet values read/batch-get and the important range encoding rule, where only `!` is encoded as `%21`.
- `clis/lark-cli/cmd/bitable/table.go`, `field.go`, `record.go`: table/field/record listing patterns.
- `skills/lark-cli/references/docx.md`, `wiki.md`, `sheets.md`, `bitable.md`: agent-facing usage and output schema notes.

Important difference: `clify/lark-cli` uses Unified Proxy credentials. AnyCap should reuse the API patterns, not the proxy client. AnyCap already has a direct Feishu SDK client in `internal/infrastructure/im/feishu_adapter.go`.

## Architecture

### 1. URL Detection

Add a local Feishu URL detector for normalized inbound message text and rich Feishu history messages.

The detector should recognize URLs from Feishu/Lark domains such as:

- `*.feishu.cn/docx/<document_token>`
- `*.larksuite.com/docx/<document_token>`
- `*.feishu.cn/wiki/<node_token>` or wiki URLs containing node token query/path forms
- `*.feishu.cn/sheets/<spreadsheet_token>`
- `*.feishu.cn/base/<app_token>` for bitable

The parser should return a normalized resource descriptor:

```go
type FeishuResourceRef struct {
    URL string
    Kind string // docx, wiki, sheet, bitable
    Token string
    Query map[string]string
}
```

For `wiki`, the first token is a wiki node token. The underlying object type is discovered through the Wiki API.

### 2. Resource Readers

Extend the direct Feishu adapter with read methods:

```go
ReadDocxRawContent(ctx, documentID string) (*FeishuDocxReadResult, error)
ReadWikiNode(ctx, nodeToken string) (*FeishuWikiNodeResult, error)
ReadSheetPreview(ctx, spreadsheetToken string, options FeishuSheetReadOptions) (*FeishuSheetReadResult, error)
ReadBitablePreview(ctx, appToken string, options FeishuBitableReadOptions) (*FeishuBitableReadResult, error)
```

Reader behavior:

- `docx`: read title/metadata when available and raw content. Store full raw content unless it exceeds a configured cap.
- `wiki`: read node metadata, inspect `obj_type`, then delegate to docx/sheet/bitable reader with `obj_token`.
- `sheet`: query sheet tabs, then read a bounded preview range for each visible sheet. Default should be small, for example first 100 rows and 20 columns.
- `bitable`: list tables, list fields, and list a bounded record preview per table. Default should be small, for example first 100 records per table.

The default is preview for `sheet` and `bitable`. Full reads can come later behind an explicit operation such as "read full sheet" or "read this range/view".

### 3. Local Artifacts

Store resource reads under the existing daemon download root:

```text
.anycap/feishu-downloads/resources/
  docx_<token>.md
  wiki_<node_token>.md
  sheet_<token>.md
  bitable_<app_token>.md
  manifest.json
```

Each artifact should be Markdown with structured front matter, not raw SDK JSON by default:

```markdown
---
source_url: "https://..."
kind: "sheet"
token: "shtcn..."
fetched_at: "2026-04-12T..."
read_mode: "preview"
---

# Sheet: <title>

## Sheet: <tab title>

| A | B | C |
|---|---|---|
| ... |
```

For bitable:

```markdown
# Bitable: <name>

## Table: <table name>

### Fields

| field_id | name | type |

### Records Preview

| record_id | Name | Status |
```

Also update `manifest.json` with the last read status, local path, resource type, token, and error when present.

### 4. Codex Input Contract

When the daemon detects and reads resources, it should enrich the user message with a resource block:

```xml
<feishu-resource type="sheet" url="https://..." token="..." local_path="/abs/path/.anycap/feishu-downloads/resources/sheet_xxx.md" read_mode="preview">
Resource was fetched from Feishu and saved locally. Read local_path when you need the content.
</feishu-resource>
```

For failure:

```xml
<feishu-resource type="docx" url="https://..." read_error="permission_denied">
The Feishu app/bot cannot read this resource. Ask the user to share it with the bot or check app document permissions.
</feishu-resource>
```

The visible bot reply should remain the normal receipt. Codex can then decide how to inspect the local file and answer the user.

### 5. Write Operations

No confirmation gate is required, but writes must remain explicit and constrained.

Hard rules:

- Only write when the user's current message explicitly asks to modify/write/update/append/create records in a Feishu resource.
- Only write to a Feishu URL explicitly present in the current message or a structurally attached current turn.
- Never expose Feishu App Secret to Codex.
- Codex should request writes through a local daemon-controlled command/tool protocol, not by calling Feishu APIs directly with credentials.

Initial write primitives:

```text
docx.append_section(url, title, markdown)
docx.append_markdown(url, markdown)
sheet.append_rows(url, sheet_selector, values)
sheet.update_range(url, range, values)
bitable.create_records(url, table_selector, records)
bitable.update_records(url, table_selector, records)
```

`wiki` writes should delegate to the underlying object when `obj_type` is supported. For example, a wiki node whose `obj_type=docx` can use `docx.append_section`.

Do not start with arbitrary docx block replacement. Block patching can be added later after we have stable block location helpers.

### 6. Agent Write Invocation Protocol

There are two viable implementations:

1. Local daemon tool command, exposed in the Codex workspace:

```bash
anycap-internal-feishu-resource write docx-append --url ... --markdown-file ...
```

2. Structured action mailbox from Codex final/intermediate output to daemon.

Recommendation for MVP: use a local helper command or file-based action request that the daemon owns. It is easier to test locally and keeps the runner/server APIs unchanged.

For example:

```text
.anycap/feishu-actions/outbox/<action_id>.json
```

Codex writes a requested action there; the daemon observes/executes it; execution result is written back to:

```text
.anycap/feishu-actions/results/<action_id>.json
```

This should only be enabled for Feishu daemon sessions. If that is too much for MVP, implement the helper command first and let Codex call it explicitly.

### 7. Permission and Error Handling

Expected errors:

- app/bot has no permission to read the resource
- resource type is unsupported
- URL token parsing failed
- sheet/bitable too large for default preview
- write target is ambiguous
- write operation is unsupported for that resource type

Errors should be represented in both:

- the local manifest
- the structured Codex input

For permission failures, the user-facing guidance should be concrete:

```text
我没有这个飞书资源的读取/写入权限。请把文档/表格/多维表格分享给这个机器人，或检查应用的云文档权限。
```

### 8. Testing Strategy

Use TDD with injected Feishu adapter methods.

Unit tests:

- URL parser recognizes docx/wiki/sheets/base URLs.
- Resource enrichment inserts local artifact references into `NormalizedInboundEvent.AgentInputText()`.
- `docx` reader writes a local artifact and manifest.
- `wiki` reader delegates by `obj_type`.
- `sheet` preview reads sheet tabs and bounded ranges.
- `bitable` preview reads tables, fields, and bounded records.
- Permission errors create structured failure resources.
- Write operation parser accepts only explicit write requests.
- Write helpers reject ambiguous resource targets.

Focused package tests:

```bash
go test ./internal/infrastructure/im -run 'Feishu.*Resource|Feishu.*URL|Feishu.*Write' -count=1
go test ./internal/cli/command/meta -run 'AgentDaemon.*Feishu.*Resource' -count=1
```

Before completion:

```bash
go test ./internal/infrastructure/im ./internal/cli/command/meta -count=1
go test ./...
```

## Rollout

Phase 1:

- read-only URL enrichment for docx/wiki/sheet/bitable
- local artifacts
- structured input to Codex

Phase 2:

- constrained writes for docx append, sheet append/update-range, bitable create/update records
- local action helper or outbox/results protocol

Phase 3:

- full sheet/range/view selection
- richer docx block-to-Markdown and docx targeted block edits
- Feishu URL diagnostic surface in `daemon status --debug`
