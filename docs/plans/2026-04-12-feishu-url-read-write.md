# Feishu URL Read/Write Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let the personal Feishu bot read Feishu docx/wiki/sheet/bitable URLs into local artifacts for Codex and support constrained online writes when the user explicitly asks to modify a Feishu resource.

**Architecture:** Keep all Feishu credentialed operations in the local daemon path. Extend the direct Feishu adapter with resource readers/writers, store resource reads under `.anycap/feishu-downloads/resources/`, and inject structured `<feishu-resource>` blocks into Codex input. Implement writes as constrained operations against explicit current-turn Feishu URLs, without a confirmation gate and without exposing Feishu App Secret to Codex.

**Tech Stack:** Go, Lark/Feishu Go SDK, personal Feishu long-connection daemon, existing `internal/infrastructure/im` normalization/enrichment, local workspace artifacts.

**Design References:**
- `docs/plans/2026-04-12-feishu-url-read-write-design.md`
- Reference only: `/Users/sczhao/dev/Projects/converge-ai/ai-infra/clify/clis/lark-cli`

---

### Task 1: Add Feishu Resource URL Parser

**Files:**
- Modify: `internal/infrastructure/im/adapter.go`
- Add: `internal/infrastructure/im/feishu_resource_url.go`
- Add: `internal/infrastructure/im/feishu_resource_url_test.go`

**Step 1: Write the failing tests**

Add tests for:

- `https://xxx.feishu.cn/docx/<token>` -> kind `docx`
- `https://xxx.larksuite.com/docx/<token>` -> kind `docx`
- `https://xxx.feishu.cn/wiki/<node_token>` -> kind `wiki`
- `https://xxx.feishu.cn/sheets/<spreadsheet_token>` -> kind `sheet`
- `https://xxx.feishu.cn/base/<app_token>` -> kind `bitable`
- a message with two resource URLs returns two refs in order
- non-Feishu URLs are ignored

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/infrastructure/im -run 'FeishuResourceURL|ExtractFeishuResource' -count=1 -v
```

Expected: FAIL because parser/types do not exist.

**Step 3: Implement minimal parser**

Add:

```go
type FeishuResourceKind string

const (
    FeishuResourceKindDocx    FeishuResourceKind = "docx"
    FeishuResourceKindWiki    FeishuResourceKind = "wiki"
    FeishuResourceKindSheet   FeishuResourceKind = "sheet"
    FeishuResourceKindBitable FeishuResourceKind = "bitable"
)

type FeishuResourceRef struct {
    URL   string
    Kind  FeishuResourceKind
    Token string
    Query map[string]string
}
```

Implement `ExtractFeishuResourceRefs(message string) []FeishuResourceRef`.

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/infrastructure/im -run 'FeishuResourceURL|ExtractFeishuResource' -count=1 -v
```

Expected: PASS.

### Task 2: Add Local Resource Artifact Writer

**Files:**
- Add: `internal/infrastructure/im/feishu_resource_artifact.go`
- Add: `internal/infrastructure/im/feishu_resource_artifact_test.go`

**Step 1: Write the failing tests**

Add tests for:

- writes Markdown artifact under `<download_dir>/resources/`
- sanitizes file names by kind/token
- updates `manifest.json`
- records read error in manifest when content cannot be fetched

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/infrastructure/im -run 'FeishuResourceArtifact' -count=1 -v
```

Expected: FAIL because artifact writer does not exist.

**Step 3: Implement minimal artifact writer**

Add a writer that accepts:

```go
type FeishuResourceArtifact struct {
    Ref       FeishuResourceRef
    Title     string
    ReadMode  string
    Content   string
    ErrorCode string
    ErrorText string
    FetchedAt time.Time
}
```

Return absolute local path and update manifest.

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/infrastructure/im -run 'FeishuResourceArtifact' -count=1 -v
```

Expected: PASS.

### Task 3: Add Direct Feishu Resource Readers

**Files:**
- Modify: `internal/infrastructure/im/feishu_adapter.go`
- Add: `internal/infrastructure/im/feishu_resource_reader.go`
- Add: `internal/infrastructure/im/feishu_resource_reader_test.go`

**Step 1: Write the failing tests**

Use injectable function fields on `FeishuAdapter` similar to existing `getMessage`, `listMessages`, and `downloadMessageResource`.

Add tests for:

- docx raw-content result is returned
- wiki node with `obj_type=docx` delegates to docx token
- sheet preview reads sheet metadata and bounded ranges
- bitable preview reads tables, fields, and bounded records
- permission/API error returns classified read error

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/infrastructure/im -run 'FeishuResourceReader|ReadDocx|ReadWiki|ReadSheet|ReadBitable' -count=1 -v
```

Expected: FAIL because reader methods do not exist.

**Step 3: Implement minimal readers**

Use the API patterns from `clify/lark-cli`:

- docx: `client.Docx.Document.RawContent`
- wiki: `client.Wiki.Space.GetNode`, then inspect `obj_token` and `obj_type`
- sheet: `client.Sheets.Spreadsheet.Get`, `client.Sheets.SpreadsheetSheet.Query`, plus values read/batch-get
- bitable: `client.Bitable.App.Get`, `client.Bitable.AppTable.List`, `client.Bitable.AppTableField.List`, `client.Bitable.AppTableRecord.List`

For sheet values, preserve the `clify` range encoding rule if a raw HTTP path is required: encode `!` as `%21`, not `:`.

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/infrastructure/im -run 'FeishuResourceReader|ReadDocx|ReadWiki|ReadSheet|ReadBitable' -count=1 -v
```

Expected: PASS.

### Task 4: Enrich Personal Bot Inbound Messages With Resource Artifacts

**Files:**
- Modify: `internal/infrastructure/im/adapter.go`
- Modify: `internal/infrastructure/im/feishu_longconn_bot.go`
- Modify: `internal/infrastructure/im/feishu_longconn_bot_test.go`

**Step 1: Write the failing tests**

Add tests for:

- text message containing docx URL writes a local artifact and includes `<feishu-resource>` in `AgentInputText()`
- sheet URL uses preview mode and includes local path
- resource read error includes structured `read_error`
- normal messages without resource URLs behave unchanged

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/infrastructure/im -run 'FeishuLongConnBot.*Resource|AgentInputText.*Resource' -count=1 -v
```

Expected: FAIL because resource enrichment is not wired.

**Step 3: Implement minimal enrichment**

Extend `NormalizedInboundEvent` with resource context:

```go
Resources []NormalizedInboundResource
```

During `FeishuLongConnBot.enrichContext`, detect URLs, read resources through adapter, write artifacts, and attach resource metadata. Keep existing message media download behavior unchanged.

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/infrastructure/im -run 'FeishuLongConnBot.*Resource|AgentInputText.*Resource' -count=1 -v
```

Expected: PASS.

### Task 5: Add Constrained Write Action Types

**Files:**
- Add: `internal/infrastructure/im/feishu_resource_write.go`
- Add: `internal/infrastructure/im/feishu_resource_write_test.go`

**Step 1: Write the failing tests**

Add tests for:

- parse `docx.append_section` action JSON
- parse `sheet.append_rows` action JSON
- parse `sheet.update_range` action JSON
- parse `bitable.create_records` action JSON
- parse `bitable.update_records` action JSON
- reject write action without explicit URL
- reject unsupported resource type

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/infrastructure/im -run 'FeishuResourceWrite|WriteAction' -count=1 -v
```

Expected: FAIL because write action types do not exist.

**Step 3: Implement minimal write action model**

Add action model and validation. Do not execute Feishu API calls yet.

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/infrastructure/im -run 'FeishuResourceWrite|WriteAction' -count=1 -v
```

Expected: PASS.

### Task 6: Execute Constrained Feishu Writes

**Files:**
- Modify: `internal/infrastructure/im/feishu_adapter.go`
- Modify: `internal/infrastructure/im/feishu_resource_write.go`
- Modify: `internal/infrastructure/im/feishu_resource_write_test.go`

**Step 1: Write the failing tests**

Use injected adapter functions. Add tests for:

- docx append creates converted blocks and appends them to document root
- wiki docx append resolves node to docx before writing
- sheet append rows calls append endpoint
- sheet update range calls update endpoint
- bitable create records calls batch create or repeated create
- bitable update records calls batch update or repeated update
- permission/API errors are classified and returned

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/infrastructure/im -run 'ExecuteFeishuResourceWrite|AppendDocx|AppendSheet|UpdateBitable' -count=1 -v
```

Expected: FAIL because write executor does not exist.

**Step 3: Implement minimal write executor**

Implement only these operations:

- `docx.append_section`
- `docx.append_markdown`
- `sheet.append_rows`
- `sheet.update_range`
- `bitable.create_records`
- `bitable.update_records`

Do not implement arbitrary docx block replacement.

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/infrastructure/im -run 'ExecuteFeishuResourceWrite|AppendDocx|AppendSheet|UpdateBitable' -count=1 -v
```

Expected: PASS.

### Task 7: Expose Local Write Helper For Codex Sessions

**Files:**
- Modify: `internal/cli/command/meta/agent_daemon.go`
- Add: `internal/infrastructure/im/feishu_resource_action_helper.go`
- Add: `internal/infrastructure/im/feishu_resource_action_helper_test.go`
- Modify: `docs/anycap-current-status.md`

**Step 1: Write the failing tests**

Add tests for:

- daemon session creates helper metadata/instructions in the workspace
- helper refuses writes to URLs not present in current turn context
- helper executes valid write action and writes a result JSON
- helper result is readable by Codex in the workspace

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/infrastructure/im ./internal/cli/command/meta -run 'FeishuResourceActionHelper|AgentDaemon.*Feishu.*Write' -count=1 -v
```

Expected: FAIL because helper is not exposed.

**Step 3: Implement minimal helper**

Prefer a local helper command or workspace-scoped action file protocol:

```text
.anycap/feishu-actions/context.json
.anycap/feishu-actions/outbox/<action_id>.json
.anycap/feishu-actions/results/<action_id>.json
```

Keep helper scoped to personal Feishu daemon sessions.

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/infrastructure/im ./internal/cli/command/meta -run 'FeishuResourceActionHelper|AgentDaemon.*Feishu.*Write' -count=1 -v
```

Expected: PASS.

### Task 8: Focused Verification

**Files:**
- Modify: `docs/anycap-current-status.md`

**Step 1: Run focused tests**

Run:

```bash
go test ./internal/infrastructure/im ./internal/cli/command/meta -count=1
```

Expected: PASS.

**Step 2: Run full Go tests**

Run:

```bash
go test ./...
```

Expected: PASS.

**Step 3: Update status docs**

Update `docs/anycap-current-status.md` to describe:

- Feishu URL resource read support
- local resource artifacts
- supported docx/wiki/sheet/bitable scope
- constrained write operations and no confirmation gate
- permission failure behavior

**Step 4: Commit**

Run:

```bash
git add internal/infrastructure/im internal/cli/command/meta docs/anycap-current-status.md
git commit -m "feat: support feishu url resources"
```

Expected: commit succeeds.
