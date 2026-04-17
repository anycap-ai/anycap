# Feishu Structured Session Reuse Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 让 personal Feishu bot 的连续 follow-up 优先按 thread/reply/quoted 结构复用当前活跃 conversation，并通过 server-side follow-up inbox 串行进入下一次 Codex 执行，而不是主要依赖 fixed-window burst merge。

**Architecture:** 保留现有 daemon 侧富上下文补全和媒体下载能力，把“这是不是当前活跃会话的 follow-up”收敛到 server conversation 层判断。新增 conversation follow-up inbox 持久化；活跃 session 结束后，conversation service 从 inbox 生成下一条 continue session。daemon 侧 fixed-window 只保留为兜底，不再承担主语义。

**Tech Stack:** Go, PostgreSQL, current agent-control conversation/session repositories, Feishu personal daemon ingress, existing runner polling model.

**Design References:**
- `docs/plans/2026-04-10-feishu-structured-session-reuse-design.md`

---

### Task 1: Add follow-up inbox domain model and persistence

**Files:**
- Modify: `internal/domain/model/agent_control.go`
- Modify: `internal/domain/port/agent_control.go`
- Add: `internal/infrastructure/migration/migrations/00xx_agent_conversation_followups.sql`
- Modify: `internal/infrastructure/postgres/agent_control_repo.go`
- Modify: `internal/infrastructure/postgres/agent_control_repo_test.go`

**Step 1: Write the failing tests**

- Add repo tests for:
  - create follow-up item for a conversation
  - list undelivered follow-up items ordered by creation time
  - mark follow-up items delivered to a session
  - dedupe by conversation + platform message id

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/infrastructure/postgres -run 'AgentControl|Followup' -v
```

Expected: missing migration, model, and repo methods.

**Step 3: Write minimal implementation**

- Add a new domain model for conversation follow-up inbox items
- Add repository interface methods for create/list/mark-delivered
- Add idempotent SQL migration and postgres implementation

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/infrastructure/postgres -run 'AgentControl|Followup' -v
```

Expected: PASS.

### Task 2: Detect structurally-related follow-ups in ConversationService

**Files:**
- Modify: `internal/application/agentcontrol/conversation_service.go`
- Modify: `internal/application/agentcontrol/conversation_service_test.go`

**Step 1: Write the failing tests**

- Add service tests for:
  - busy active conversation + matching `root_id` -> enqueue follow-up, no new session
  - busy active conversation + matching `parent_id` -> enqueue follow-up, no new session
  - busy active conversation + no structural relation -> current separate-session behavior stays
  - duplicate follow-up `message_id` is ignored

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/application/agentcontrol -run 'ConversationService.*Followup|ConversationService.*Structured' -v
```

Expected: follow-up inbox path missing.

**Step 3: Write minimal implementation**

- Extend `continueConversation()`:
  - keep current active conversation lookup
  - keep duplicate `message_id` protection
  - if conversation is busy, evaluate structural relation from `message_id/root_id/thread_id/parent_id`
  - enqueue follow-up inbox item instead of creating a new session when relation matches
- Return a result that indicates:
  - queued
  - follow-up inboxed
  - no immediate new session

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/application/agentcontrol -run 'ConversationService.*Followup|ConversationService.*Structured' -v
```

Expected: PASS.

### Task 3: Drain follow-up inbox when active session reaches terminal state

**Files:**
- Modify: `internal/application/agentcontrol/conversation_service.go`
- Modify: `internal/application/agentcontrol/conversation_service_test.go`

**Step 1: Write the failing tests**

- Add tests for:
  - committing a session with pending follow-ups creates the next continue session
  - the new session message includes ordered follow-up inputs
  - delivered follow-up items are marked with `delivered_to_session_id`
  - follow-up drain happens before mailbox auto-fire

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/application/agentcontrol -run 'ApplyRunnerSessionUpdate.*Followup|ConversationService.*DrainFollowup' -v
```

Expected: no follow-up drain path yet.

**Step 3: Write minimal implementation**

- Add a helper to build the next continue-session message from pending follow-up inputs
- In terminal session update flow, check undelivered follow-ups first
- Create the next continue session and update `conversation.last_session_id`
- Mark follow-up items delivered
- Keep existing mailbox auto-fire logic, but run it after human follow-up drain

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/application/agentcontrol -run 'ApplyRunnerSessionUpdate.*Followup|ConversationService.*DrainFollowup' -v
```

Expected: PASS.

### Task 4: Thread/reply metadata extraction helpers for server-side matching

**Files:**
- Modify: `internal/application/agentcontrol/conversation_service.go`
- Modify: `internal/application/agentcontrol/conversation_service_test.go`

**Step 1: Write the failing tests**

- Add helper-level tests for extracting from structured Feishu message payload:
  - `message_id`
  - `thread_id`
  - `root_id`
  - `parent_id`
- Add matching tests against prior session user messages

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/application/agentcontrol -run 'ExtractFeishu.*|MatchFeishu.*' -v
```

Expected: missing helpers.

**Step 3: Write minimal implementation**

- Add deterministic extraction helpers similar to existing `extractFeishuMessageID`
- Reuse them in structural follow-up matching
- Do not introduce a separate message-mapping table in phase 1 unless tests force it

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/application/agentcontrol -run 'ExtractFeishu.*|MatchFeishu.*' -v
```

Expected: PASS.

### Task 5: Demote daemon fixed-window merge to fallback

**Files:**
- Modify: `internal/infrastructure/im/feishu_longconn_bot.go`
- Modify: `internal/infrastructure/im/feishu_longconn_bot_test.go`
- Modify: `internal/cli/command/meta/agent_daemon.go`
- Modify: `docs/anycap-current-status.md`

**Step 1: Write the failing tests**

- Add tests verifying:
  - thread/reply structured follow-ups can be sent immediately and rely on server-side reuse
  - daemon merge window only applies when no structure is available
  - commands still bypass fallback merge

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/infrastructure/im ./internal/cli/command/meta -run 'FeishuLongConnBot.*Fallback|AgentDaemon' -v
```

Expected: daemon still treats timer merge as primary path.

**Step 3: Write minimal implementation**

- Change daemon logic so explicit thread/reply/quoted relationships do not depend on timer merge
- Keep a narrow fallback merge path only for transport-level local bursts
- Update docs to describe timer as fallback only

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/infrastructure/im ./internal/cli/command/meta -run 'FeishuLongConnBot.*Fallback|AgentDaemon' -v
```

Expected: PASS.

### Task 6: Run focused verification and document rollout

**Files:**
- Modify: `docs/anycap-current-status.md`

**Step 1: Run focused verification**

Run:

```bash
go test ./internal/application/agentcontrol ./internal/infrastructure/im ./internal/cli/command/meta -count=1
```

Expected: relevant suites pass.

**Step 2: Manual verification checklist**

- Send image, then reply to that image with text
- Send thread follow-up in the same thread
- Send quoted-message follow-up
- Confirm:
  - only one active conversation path is reused
  - follow-up input becomes the next Codex run after the active session finishes
  - fixed-window fallback is no longer the main reason behavior works

**Step 3: Commit**

```bash
git add docs/anycap-current-status.md \
  internal/domain/model/agent_control.go \
  internal/domain/port/agent_control.go \
  internal/application/agentcontrol/conversation_service.go \
  internal/infrastructure/im/feishu_longconn_bot.go
git commit -m "feat: reuse feishu conversations via structured follow-up inbox"
```
