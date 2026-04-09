# Agent Daemon Primary Runner Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 让用户只需要执行 `anycap agent daemon start --platform feishu --executor codex --workspace ...`，就能把本地机器自动设成当前用户的 Feishu 主执行节点，无需手动处理 `runner_id` 和 server env。

**Architecture:** 服务端新增 `user_id + platform -> runner_id` 的 primary-runner 绑定，并暴露 `claim-primary` API。Feishu 路由从固定 env runner 改成根据 IM binding 找用户，再查该用户当前 primary runner。CLI 新增 `agent daemon` 主路径，内部复用现有 runner loop，并在启动前自动 claim primary。

**Tech Stack:** Go, Hertz, PostgreSQL, existing agent-control repositories/services/handlers, Cobra CLI, AnyCap auth/http client, current IM long-connection flow.

**Design References:**
- `docs/plans/2026-04-09-agent-daemon-primary-runner-design.md`

---

### Task 1: Add domain and persistence for primary runner binding

**Files:**
- Modify: `internal/domain/model/agent_control.go`
- Modify: `internal/domain/port/agent_control.go`
- Add: `internal/infrastructure/migration/migrations/0027_agent_primary_runners.sql`
- Modify: `internal/infrastructure/postgres/agent_control_repo.go`
- Modify: `internal/infrastructure/postgres/agent_control_repo_test.go`

**Step 1: Write the failing tests**

- Add repo tests for:
  - upsert primary runner by user+platform
  - get primary runner by user+platform
  - overwrite existing primary runner on second claim

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/infrastructure/postgres -run 'AgentControl|PrimaryRunner' -v
```

Expected: missing schema/repo methods.

**Step 3: Write minimal implementation**

- Add internal model for primary runner binding
- Extend runner repository interface with:
  - `ClaimPrimaryRunner(...)`
  - `GetPrimaryRunner(...)`
- Add migration and postgres implementation

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/infrastructure/postgres -run 'AgentControl|PrimaryRunner' -v
```

Expected: PASS.

### Task 2: Route Feishu conversations by bound user primary runner

**Files:**
- Modify: `internal/application/agentcontrol/conversation_service.go`
- Modify: `internal/application/agentcontrol/conversation_service_test.go`
- Modify: `internal/app/bootstrap.go`
- Modify: `internal/app/bootstrap_test.go`

**Step 1: Write the failing tests**

- Add service tests for:
  - normal inbound chat resolves runner via binding user + platform
  - missing primary runner returns offline/not-configured error
  - offline primary runner returns offline/not-configured error

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/application/agentcontrol ./internal/app -run 'ConversationService|PrimaryRunner|Build' -v
```

Expected: service still depends on fixed runner resolver.

**Step 3: Write minimal implementation**

- Remove conversation-path dependence on fixed env runner resolver
- Resolve binding first, then primary runner by user+platform
- Update bootstrap wiring accordingly
- Keep legacy fixed runner resolver only where still needed outside chat-first path

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/application/agentcontrol ./internal/app -run 'ConversationService|PrimaryRunner|Build' -v
```

Expected: PASS.

### Task 3: Add claim-primary HTTP API on runner handler

**Files:**
- Modify: `pkg/api/paths.go`
- Modify: `internal/transport/http/dto/agent_control.go`
- Modify: `internal/transport/http/handlers/agentcontrol/runner_handler.go`
- Modify: `internal/transport/http/handlers/agentcontrol/handler_test.go`

**Step 1: Write the failing tests**

- Add handler tests for:
  - owner can claim a runner as primary
  - claim overwrites existing primary for same user+platform
  - non-owner is rejected

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/transport/http/handlers/agentcontrol -run 'Runner.*ClaimPrimary|ProtectedRoutesRequireAuth' -v
```

Expected: route or handler missing.

**Step 3: Write minimal implementation**

- Add `POST /v1/agent/runners/:id/claim-primary`
- Verify principal ownership
- Upsert primary binding
- Return runner DTO

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/transport/http/handlers/agentcontrol -run 'Runner.*ClaimPrimary|ProtectedRoutesRequireAuth' -v
```

Expected: PASS.

### Task 4: Add daemon CLI that wraps runner serve and auto-claims primary runner

**Files:**
- Modify: `internal/cli/command/meta/agent.go`
- Add: `internal/cli/command/meta/agent_daemon.go`
- Modify: `internal/cli/command/meta/agent_runner_serve.go`
- Modify: `internal/cli/command/agent_test.go`

**Step 1: Write the failing tests**

- Add CLI tests for:
  - `agent daemon start` registers and claims runner before entering loop
  - `agent daemon status` reads primary-runner state
  - help output shows daemon as the preferred path

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/cli/command ./internal/cli/command/meta -run 'AgentDaemon|AgentRunnerServe' -v
```

Expected: daemon command missing.

**Step 3: Write minimal implementation**

- Add `agent daemon start`
- Reuse existing runner loop client/logic
- Add claim-primary call before loop starts
- Add lightweight `status`
- Keep `stop` honest and minimal if full local-process management is not yet available

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/cli/command ./internal/cli/command/meta -run 'AgentDaemon|AgentRunnerServe' -v
```

Expected: PASS.

### Task 5: Update docs and skill files to make daemon the main user path

**Files:**
- Modify: `skills/anycap-cli/SKILL.md`
- Modify: `skills/anycap-cli/references/cli-reference.md`
- Modify: `internal/cli/skill/embedded/anycap-cli/SKILL.md`
- Modify: `docs/anycap-current-status.md`

**Step 1: Write the failing checks**

- Review help/docs for stale guidance that still tells users to copy `runner_id` or edit fixed runner env.

**Step 2: Run targeted verification**

Run:

```bash
go test ./internal/cli/command -run 'AgentDaemon|AgentConversation|AgentRunner' -v
```

Expected: command output exists and docs can now be updated to match reality.

**Step 3: Write minimal documentation updates**

- Document:
  - `anycap login`
  - `anycap agent daemon start --platform feishu --executor codex --workspace ...`
  - automatic primary-runner claim
  - Feishu bot talks to the user’s local machine
- Keep `agent runners serve` documented as low-level/debug only

**Step 4: Run focused verification**

Run:

```bash
go test ./internal/cli/command ./internal/transport/http/handlers/agentcontrol ./internal/application/agentcontrol ./internal/app -run 'AgentDaemon|Runner.*ClaimPrimary|ConversationService|PrimaryRunner' -v
```

Expected: PASS.

### Task 6: Final regression pass for daemon-first Feishu flow

**Files:**
- Verify only

**Step 1: Run focused regression suite**

Run:

```bash
go test ./internal/config ./internal/application/agentcontrol ./internal/infrastructure/postgres ./internal/infrastructure/im ./internal/transport/http/handlers/agentcontrol ./internal/cli/command ./internal/cli/command/meta ./internal/app -run 'AgentControl|Conversation|PrimaryRunner|Runner.*ClaimPrimary|AgentDaemon|Feishu|LongConn|AgentRunnerServe' -v
```

Expected: PASS.

**Step 2: Commit**

```bash
git add docs/plans/2026-04-09-agent-daemon-primary-runner-design.md docs/plans/2026-04-09-agent-daemon-primary-runner.md internal/domain/model/agent_control.go internal/domain/port/agent_control.go internal/infrastructure/migration/migrations/0027_agent_primary_runners.sql internal/infrastructure/postgres/agent_control_repo.go internal/infrastructure/postgres/agent_control_repo_test.go internal/application/agentcontrol/conversation_service.go internal/application/agentcontrol/conversation_service_test.go internal/app/bootstrap.go internal/app/bootstrap_test.go pkg/api/paths.go internal/transport/http/dto/agent_control.go internal/transport/http/handlers/agentcontrol/runner_handler.go internal/transport/http/handlers/agentcontrol/handler_test.go internal/cli/command/meta/agent.go internal/cli/command/meta/agent_daemon.go internal/cli/command/meta/agent_runner_serve.go internal/cli/command/agent_test.go skills/anycap-cli/SKILL.md skills/anycap-cli/references/cli-reference.md internal/cli/skill/embedded/anycap-cli/SKILL.md docs/anycap-current-status.md
git commit -m "feat: add daemon-first primary runner routing"
```
