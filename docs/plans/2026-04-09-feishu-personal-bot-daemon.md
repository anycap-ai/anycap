# Feishu Personal Bot Daemon Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Move the recommended Feishu IM flow from server-owned shared bot ingress to daemon-owned personal bot ingress, while keeping conversation/session state on AnyCap server.

**Architecture:** The local daemon owns Feishu bot credentials, maintains the Feishu long connection, forwards normalized inbound chat events to AnyCap server, executes local agent work, and sends replies back to Feishu. The server remains the durable source of truth for conversation/session/mailbox state and control actions.

**Tech Stack:** Go server, Go CLI daemon, Postgres-backed conversation runtime, Feishu long-connection SDK, existing codex runner executor, existing AnyCap CLI auth/session model.

**Design References:**
- `docs/plans/2026-04-09-feishu-personal-bot-daemon-design.md`
- `docs/plans/2026-04-09-agent-daemon-primary-runner-design.md`

---

### Task 1: Add a daemon-authenticated inbound IM chat API

**Files:**
- Modify: `internal/transport/http/handlers/agentcontrol/runner_handler.go` or create a dedicated inbound handler file
- Modify: `internal/application/agentcontrol/conversation_service.go`
- Modify: `pkg/api/paths.go`
- Test: `internal/transport/http/handlers/agentcontrol/handler_test.go`
- Test: `internal/application/agentcontrol/conversation_service_test.go`

**Step 1: Write the failing tests**

Add tests proving:

- an authenticated daemon can submit a normalized inbound Feishu chat event
- the server resolves the user from the authenticated principal instead of IM binding
- the normal conversation/session path is still created and persisted

**Step 2: Run the tests to verify failure**

Run:

```bash
go test ./internal/application/agentcontrol ./internal/transport/http/handlers/agentcontrol -run 'InboundChat|DaemonIM|Conversation' -v
```

Expected: FAIL because no daemon-authenticated inbound IM endpoint exists.

**Step 3: Implement minimal server support**

Add:

- a daemon-authenticated inbound IM route
- a conversation-service entry point that accepts owner user context directly
- no dependence on IM binding for this path

**Step 4: Run the tests to verify pass**

Run:

```bash
go test ./internal/application/agentcontrol ./internal/transport/http/handlers/agentcontrol -run 'InboundChat|DaemonIM|Conversation' -v
```

Expected: PASS

**Step 5: Commit**

```bash
git add internal/application/agentcontrol/conversation_service.go internal/application/agentcontrol/conversation_service_test.go internal/transport/http/handlers/agentcontrol pkg/api/paths.go
git commit -m "feat: add daemon-authenticated im inbound api"
```

### Task 2: Move Feishu long-connection ingress into the daemon path

**Files:**
- Modify: `internal/infrastructure/im/feishu_longconn_bot.go`
- Modify: `internal/cli/command/meta/agent_daemon.go`
- Modify: `internal/cli/command/meta/agent_runner_serve.go`
- Modify: `internal/cli/httpclient/...` as needed for the new inbound API client
- Test: `internal/cli/command/agent_test.go`
- Test: `internal/infrastructure/im/..._test.go` if present

**Step 1: Write the failing tests**

Add tests proving:

- `daemon start` accepts personal Feishu bot config
- daemon long-connection handling forwards inbound messages to server through the new API
- replies still go back through the Feishu adapter

**Step 2: Run the tests to verify failure**

Run:

```bash
go test ./internal/cli/command ./internal/infrastructure/im -run 'AgentDaemon|Feishu|LongConn' -v
```

Expected: FAIL because daemon does not yet own Feishu ingress.

**Step 3: Implement minimal daemon ingress**

Change the daemon path so that:

- personal Feishu bot config is accepted on `daemon start`
- the local long-connection bot no longer calls conversation service directly
- it calls the daemon -> server inbound IM API instead

**Step 4: Run the tests to verify pass**

Run:

```bash
go test ./internal/cli/command ./internal/infrastructure/im -run 'AgentDaemon|Feishu|LongConn' -v
```

Expected: PASS

**Step 5: Commit**

```bash
git add internal/infrastructure/im/feishu_longconn_bot.go internal/cli/command/meta/agent_daemon.go internal/cli/command/meta/agent_runner_serve.go internal/cli/command/agent_test.go
git commit -m "feat: run personal feishu bot ingress in daemon"
```

### Task 3: Add personal Feishu bot configuration to daemon start

**Files:**
- Modify: `internal/cli/command/meta/agent_daemon.go`
- Modify: `skills/anycap-cli/SKILL.md`
- Modify: `internal/cli/skill/embedded/anycap-cli/SKILL.md`
- Modify: `skills/anycap-cli/references/cli-reference.md`
- Test: `internal/cli/command/agent_test.go`

**Step 1: Write the failing CLI tests**

Add tests proving:

- `daemon start` accepts `--feishu-app-id`
- `daemon start` accepts `--feishu-app-secret`
- help/usage reflects the personal bot model

**Step 2: Run the CLI tests to verify failure**

Run:

```bash
go test ./internal/cli/command -run 'AgentDaemon' -v
```

Expected: FAIL because the new flags/help text do not exist yet.

**Step 3: Implement the minimal CLI/config shape**

Add the Feishu personal bot flags and wire them into the daemon startup path.

Do not add OS keychain or config-file storage yet; explicit flags are enough for v1.

**Step 4: Run the CLI tests to verify pass**

Run:

```bash
go test ./internal/cli/command -run 'AgentDaemon' -v
```

Expected: PASS

**Step 5: Commit**

```bash
git add internal/cli/command/meta/agent_daemon.go internal/cli/command/agent_test.go skills/anycap-cli/SKILL.md internal/cli/skill/embedded/anycap-cli/SKILL.md skills/anycap-cli/references/cli-reference.md
git commit -m "feat: add personal feishu bot config to daemon start"
```

### Task 4: Keep server-side conversation/session persistence unchanged

**Files:**
- Modify: `internal/application/agentcontrol/conversation_service.go`
- Modify: `internal/application/agentcontrol/conversation_service_test.go`
- Modify: `internal/application/agentcontrol/task_service_test.go` only if regression coverage needs it

**Step 1: Write the regression tests**

Add tests proving:

- daemon-submitted inbound chat still produces the same conversation/session behavior as the old shared-bot path
- status/reset/stop/fork/fire remain server-side behaviors

**Step 2: Run the tests to verify failure**

Run:

```bash
go test ./internal/application/agentcontrol -run 'Conversation|Session|DaemonInbound' -v
```

Expected: FAIL until the new path reuses the same runtime semantics.

**Step 3: Implement the minimal runtime reuse**

Factor conversation entry points so the server can:

- keep existing binding-based ingress for legacy flow
- add daemon-owned ingress for the personal-bot flow

without duplicating the runtime logic.

**Step 4: Run the tests to verify pass**

Run:

```bash
go test ./internal/application/agentcontrol -run 'Conversation|Session|DaemonInbound' -v
```

Expected: PASS

**Step 5: Commit**

```bash
git add internal/application/agentcontrol/conversation_service.go internal/application/agentcontrol/conversation_service_test.go internal/application/agentcontrol/task_service_test.go
git commit -m "refactor: reuse conversation runtime for daemon-owned im ingress"
```

### Task 5: Update docs and current-status guidance

**Files:**
- Modify: `docs/anycap-current-status.md`
- Modify: `docs/plans/2026-04-09-agent-daemon-primary-runner-design.md` only if a cross-reference note is helpful
- Modify: `skills/anycap-cli/SKILL.md`
- Modify: `skills/anycap-cli/references/cli-reference.md`
- Modify: `internal/cli/skill/embedded/anycap-cli/SKILL.md`

**Step 1: Update the docs**

Make the new recommended path explicit:

- personal Feishu bot
- daemon-owned bot ingress
- server-owned state
- `/bind` is not the main user path anymore

**Step 2: Run the fastest relevant verification**

Run:

```bash
go test ./internal/cli/command ./internal/cli/command/meta -run 'AgentDaemon|AgentRunnerServe' -v
```

Expected: PASS

**Step 3: Commit**

```bash
git add docs/anycap-current-status.md skills/anycap-cli/SKILL.md internal/cli/skill/embedded/anycap-cli/SKILL.md skills/anycap-cli/references/cli-reference.md
git commit -m "docs: switch im guidance to personal bot daemon flow"
```

### Task 6: End-to-end focused verification

**Files:**
- No code changes expected unless a bug is found

**Step 1: Run the focused server/daemon tests**

Run:

```bash
go test ./internal/application/agentcontrol ./internal/transport/http/handlers/agentcontrol ./internal/infrastructure/im ./internal/cli/command ./internal/cli/command/meta ./internal/app ./internal/config -run 'AgentDaemon|Feishu|LongConn|InboundChat|Conversation|PrimaryRunner' -v
```

Expected: PASS

**Step 2: Manual smoke test**

Verify:

1. user creates a personal Feishu bot
2. user starts daemon with bot credentials
3. user sends a DM to the bot
4. daemon receives the message
5. daemon forwards it to server
6. server persists the conversation/session
7. daemon executes local codex / claude-code
8. daemon replies to the bot

**Step 3: Commit final fixups if needed**

```bash
git add <files>
git commit -m "test: verify personal feishu bot daemon flow"
```
