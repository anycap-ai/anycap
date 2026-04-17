# IM Chat Agent Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 把现有 `agent control` 从命令型 `task-first` 收敛为聊天式 `conversation/session-first`，让 Feishu 单聊机器人真正承载远程 codex / claude-code 对话。

**Architecture:** 保留既有 `binding`、`runner`、`webhook` 基础设施，新增 `conversation`、`session`、`mailbox` 作为新的主执行链。普通飞书消息默认走 `continue`，系统命令只处理 `/bind`、`/new`、`/reset`、`/status`、`/stop`、`/fork`。持久化与 external-id 先行，runner 复用会话后接真实 executor。

**Tech Stack:** Go, Hertz, PostgreSQL, AnyCap auth/feature-gate/idresolver/presenter conventions, existing runner loop and IM adapter scaffolding.

**Design References:**
- `docs/plans/2026-04-07-im-agent-control-design.md`

---

### Task 1: Extend external-id scaffolding for conversation and mailbox resources

**Files:**
- Modify: `pkg/externalid/externalid.go`
- Modify: `pkg/externalid/externalid_test.go`
- Modify: `internal/transport/http/presenter/presenter.go`
- Modify: `internal/transport/http/handlers/idresolver/resolver.go`
- Modify: `internal/transport/http/handlers/idresolver/resolver_test.go`

**Step 1: Write the failing tests**

- Extend existing external-id tests for:
  - `agc_` conversation prefix
  - `agm_` mailbox prefix
  - passthrough mapper / resolver methods for conversation, session, mailbox

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./pkg/externalid ./internal/transport/http/handlers/idresolver ./internal/transport/http/presenter -run 'ExternalID|Resolver|Mapper' -v
```

Expected: missing prefixes or missing mapper / resolver methods.

**Step 3: Write minimal implementation**

- Add:
  - `PrefixAgentConversation`
  - `PrefixAgentMailboxMessage`
- Extend `presenter.IDMapper` and passthrough mapper
- Extend `idresolver.IDResolver` and passthrough resolver

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./pkg/externalid ./internal/transport/http/handlers/idresolver ./internal/transport/http/presenter -run 'ExternalID|Resolver|Mapper' -v
```

Expected: PASS.

### Task 2: Add domain model for conversation, session, mailbox, and chat actions

**Files:**
- Modify: `internal/domain/model/agent_control.go`
- Modify: `internal/domain/model/agent_control_test.go`
- Modify: `internal/domain/port/agent_control.go`

**Step 1: Write the failing tests**

- Add tests for:
  - conversation status validation
  - session mode validation
  - session state transition rules
  - mailbox message source validation

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/domain/model -run AgentControl -v
```

Expected: new types and validation helpers are missing.

**Step 3: Write minimal implementation**

- Keep existing binding / runner / task types
- Add:
  - `AgentConversation`
  - `AgentConversationSession`
  - `AgentMailboxMessage`
  - chat command / action parsing result types
- Extend ports with repositories for:
  - conversation
  - session
  - mailbox

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/domain/model -run AgentControl -v
```

Expected: PASS.

### Task 3: Add durable persistence schema for conversation-first execution

**Files:**
- Modify: `internal/infrastructure/migration/migrations/0026_agent_control.sql`
- Modify: `internal/infrastructure/postgres/agent_control_repo.go`
- Modify: `internal/infrastructure/postgres/agent_control_repo_test.go`

**Step 1: Write the failing repo tests**

- Add coverage for:
  - create/find active conversation by user + platform + bot + chat
  - create session with parent session
  - update conversation `last_session_id`
  - create/list undelivered mailbox messages
  - mark mailbox messages delivered

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/infrastructure/postgres -run AgentControl -v
```

Expected: missing schema or missing repo methods.

**Step 3: Write minimal implementation**

- Add new tables:
  - `agent_conversations`
  - `agent_conversation_sessions`
  - `agent_mailbox_messages`
- Preserve existing `im_bindings`, `agent_runners`, and current task tables
- Implement repo methods for the new resources

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/infrastructure/postgres -run AgentControl -v
```

Expected: PASS.

### Task 4: Add presenter DTOs for conversation/session/mailbox responses

**Files:**
- Modify: `internal/transport/http/presenter/agent_control.go`
- Modify: `internal/transport/http/presenter/agent_control_test.go`

**Step 1: Write the failing presenter tests**

- Add tests for:
  - presenting conversation
  - presenting session
  - presenting mailbox message

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/transport/http/presenter -run AgentControl -v
```

Expected: DTOs or presenter helpers are missing.

**Step 3: Write minimal implementation**

- Add DTOs for:
  - conversation
  - conversation session
  - mailbox message
- Resolve outbound IDs through `presenter.IDMapper`

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/transport/http/presenter -run AgentControl -v
```

Expected: PASS.

### Task 5: Build conversation service for resolve/new/continue/reset

**Files:**
- Create: `internal/application/agentcontrol/conversation_service.go`
- Create: `internal/application/agentcontrol/conversation_service_test.go`

**Step 1: Write the failing tests**

- Add tests for:
  - resolve active conversation from inbound chat
  - create new conversation when none exists
  - append a continuation session on normal text
  - `/new` creates a fresh conversation
  - `/reset` archives old conversation and creates a new one

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/application/agentcontrol -run 'Conversation|Continue|Reset' -v
```

Expected: service is missing.

**Step 3: Write minimal implementation**

- Keep existing binding service
- Add conversation resolution and session append logic
- Do not yet wire mailbox `fire` or `fork`

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/application/agentcontrol -run 'Conversation|Continue|Reset' -v
```

Expected: PASS.

### Task 6: Interpret Feishu messages as chat actions

**Files:**
- Modify: `internal/application/agentcontrol/parser.go`
- Modify: `internal/application/agentcontrol/parser_test.go`
- Modify: `internal/infrastructure/im/feishu_adapter.go`

**Step 1: Write the failing tests**

- Add tests for:
  - plain text -> `continue`
  - `/bind <token>`
  - `/new`
  - `/reset`
  - `/status`
  - `/stop`
  - `/fork`

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/application/agentcontrol ./internal/infrastructure/im -run 'Parser|Feishu' -v
```

Expected: parser only supports task-intent parsing.

**Step 3: Write minimal implementation**

- Introduce a chat-action parser
- Keep old task parser only if still needed by compatibility paths
- Ensure inbound Feishu text routes into action-based handling

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/application/agentcontrol ./internal/infrastructure/im -run 'Parser|Feishu' -v
```

Expected: PASS.

### Task 7: Replace webhook task creation with conversation/session creation

**Files:**
- Modify: `internal/transport/http/handlers/agentcontrol/webhook_handler.go`
- Modify: `internal/transport/http/handlers/agentcontrol/handler_test.go`
- Modify: `internal/app/bootstrap.go`

**Step 1: Write the failing handler tests**

- Add tests for:
  - bound plain-text message creates or continues a conversation session
  - `/new` and `/reset` change conversation state
  - unknown sender is rejected

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/transport/http/handlers/agentcontrol ./internal/app -run 'Webhook|Conversation' -v
```

Expected: webhook still creates tasks directly.

**Step 3: Write minimal implementation**

- Inject conversation service into webhook handling
- Keep webhook ingress path and Feishu signature verification unchanged
- Persist session before dispatch

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/transport/http/handlers/agentcontrol ./internal/app -run 'Webhook|Conversation' -v
```

Expected: PASS.

### Task 8: Add runner-facing session execution contract

**Files:**
- Modify: `internal/infrastructure/runner/client.go`
- Modify: `internal/application/agentcontrol/runner_loop.go`
- Modify: `internal/transport/http/handlers/agentcontrol/runner_handler.go`
- Modify: `internal/application/agentcontrol/task_service.go`

**Step 1: Write the failing tests**

- Add tests for:
  - runner pulls next session work item for a conversation
  - runner updates session status instead of only task status
  - same conversation keeps executor affinity

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/application/agentcontrol ./internal/infrastructure/runner ./internal/transport/http/handlers/agentcontrol -run 'Runner|Session' -v
```

Expected: runner path is task-only.

**Step 3: Write minimal implementation**

- Keep task update endpoints if needed for compatibility
- Add conversation-session-centric runner polling/update methods
- Prepare executor affinity hooks for codex / claude-code session reuse

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/application/agentcontrol ./internal/infrastructure/runner ./internal/transport/http/handlers/agentcontrol -run 'Runner|Session' -v
```

Expected: PASS.

### Task 9: Add protected APIs for conversation status and control

**Files:**
- Create: `internal/transport/http/handlers/agentcontrol/conversation_handler.go`
- Modify: `internal/transport/http/handlers/agentcontrol/handler_test.go`
- Modify: `internal/app/bootstrap.go`
- Modify: `pkg/api/paths.go`

**Step 1: Write the failing tests**

- Add tests for:
  - list conversations
  - get one conversation
  - list sessions
  - interrupt current conversation

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/transport/http/handlers/agentcontrol ./internal/app -run 'ConversationHandler|Interrupt' -v
```

Expected: routes and handlers are missing.

**Step 3: Write minimal implementation**

- Add protected HTTP surfaces for conversation inspection and control
- Leave mailbox `fire` and `fork` protected endpoints in place even if UI is not yet polished

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/transport/http/handlers/agentcontrol ./internal/app -run 'ConversationHandler|Interrupt' -v
```

Expected: PASS.

### Task 10: Update CLI surfaces and product status

**Files:**
- Modify: `internal/cli/command/meta/agent.go`
- Modify: `internal/cli/command/meta/agent_binding.go`
- Modify: `internal/cli/command/meta/agent_runner.go`
- Modify: `internal/cli/command/root.go`
- Modify: `docs/anycap-current-status.md`
- Modify: `configs/server/local.env.example`

**Step 1: Write the failing CLI tests**

- Add tests for:
  - conversation inspection commands
  - bind token command still works
  - runner serve remains compatible

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/cli/command -run 'Agent' -v
```

Expected: CLI lacks conversation surfaces or stale help text.

**Step 3: Write minimal implementation**

- Expose conversation-centric CLI management commands
- Keep legacy task commands only if still required for compatibility
- Update status docs and local env example

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/cli/command -run 'Agent' -v
```

Expected: PASS.

### Task 11: End-to-end verification

**Files:**
- Modify: `test/integration/agent_control_flow_test.go`

**Step 1: Write the failing integration test**

- Add one path:
  - create bind token
  - bind sender
  - inbound Feishu plain-text message
  - conversation/session created
  - runner pulls work
  - runner marks success

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./test/integration -run AgentControl -v
```

Expected: old task-first assumptions no longer match.

**Step 3: Write minimal implementation**

- Update the integration assertions to conversation/session-first behavior

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./test/integration -run AgentControl -v
```

Expected: PASS.
