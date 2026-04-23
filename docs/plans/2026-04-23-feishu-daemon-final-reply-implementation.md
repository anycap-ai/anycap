# Feishu Daemon Final Reply Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make daemon-owned Feishu personal bots send Codex final replies locally instead of requiring server-owned Feishu credentials.

**Architecture:** The server remains the source of truth for session state and final message text. For daemon-owned Feishu sessions, the runner update request asks the server to return an outbound reply payload instead of publishing it; the daemon then sends that payload through its local Feishu adapter.

**Tech Stack:** Go, Hertz HTTP handlers, AnyCap agent-control application layer, existing Feishu adapter, existing CLI daemon runner loop.

---

### Task 1: Server Response Contract

**Files:**
- Modify: `internal/transport/http/dto/agent_control.go`
- Modify: `internal/transport/http/handlers/agentcontrol/handler_test.go`
- Modify: `internal/transport/http/handlers/agentcontrol/runner_handler.go`
- Modify: `internal/transport/http/handlers/agentcontrol/conversation_event_publisher.go`

**Step 1: Write the failing test**

Add a handler test that commits a session with `reply_delivery:"client"` and expects:
- HTTP 200
- response JSON contains `data.outbound_reply.message`
- `adapter.sentMessages` stays empty

**Step 2: Run test to verify it fails**

Run: `go test ./internal/transport/http/handlers/agentcontrol -run TestRunnerSessionUpdateReturnsClientOwnedOutboundReply -count=1`

Expected: FAIL because the response does not contain `outbound_reply` and the server still sends through the adapter.

**Step 3: Implement minimal server support**

- Add `ReplyDelivery string` to `RunnerSessionUpdateRequest`.
- Add an outbound reply DTO.
- Refactor `conversation_event_publisher.go` so building a reply binding/message is reusable without sending.
- In `UpdateSession`, when `reply_delivery=client`, return the outbound reply DTO and skip `publishSessionEvent`.
- Keep default behavior unchanged.

**Step 4: Run tests**

Run:
- `go test ./internal/transport/http/handlers/agentcontrol -run 'TestRunnerSessionUpdate(ReturnsClientOwnedOutboundReply|RepliesForOwnedInboundWithoutBinding)' -count=1`

### Task 2: Runner Client Contract

**Files:**
- Modify: `internal/application/agentcontrol/runner_loop.go`
- Modify: `internal/application/agentcontrol/runner_loop_test.go`
- Modify: `internal/cli/command/meta/agent_runner_serve.go`
- Modify: `internal/cli/command/meta/agent_runner_serve_test.go`

**Step 1: Write the failing tests**

- Runner loop test: a terminal `UpdateSession` result with outbound reply calls a configured handler.
- HTTP client test: a client configured with client-owned delivery sends `reply_delivery:"client"` and parses `outbound_reply`.

**Step 2: Run tests to verify they fail**

Run:
- `go test ./internal/application/agentcontrol -run TestRunnerLoopRunOnceHandlesOutboundReply -count=1`
- `go test ./internal/cli/command/meta -run TestRunnerServeHTTPClientUpdateSessionRequestsClientOwnedReply -count=1`

**Step 3: Implement minimal client support**

- Change `RunnerLoopClient.UpdateSession` to return `*RunnerSessionUpdateResult`.
- Add `OutboundIMReply` and `RunnerSessionUpdateResult` app-layer structs.
- Add a runner loop option for an outbound reply handler.
- Parse `outbound_reply` in `runnerServeHTTPClient.UpdateSession`.
- Add a `replyDelivery` field to `runnerServeHTTPClient` and include it when set.

**Step 4: Run tests**

Run:
- `go test ./internal/application/agentcontrol ./internal/cli/command/meta -run 'TestRunnerLoopRunOnceHandlesOutboundReply|TestRunnerServeHTTPClientUpdateSessionRequestsClientOwnedReply' -count=1`

### Task 3: Daemon Wiring

**Files:**
- Modify: `internal/cli/command/meta/agent_daemon.go`

**Step 1: Write or update test coverage if a lightweight daemon wiring test exists**

Prefer unit-level coverage around `runnerServeHTTPClient` and `RunnerLoop`; avoid introducing a brittle full daemon integration test unless needed.

**Step 2: Implement wiring**

- In `runDaemonForeground`, when Feishu personal bot credentials create a local adapter, set `httpClient.replyDelivery = "client"`.
- Add a loop outbound handler that converts the returned reply into `model.IMBinding` and calls `adapter.SendMessage`.
- Keep daemon behavior unchanged when local Feishu credentials are absent.

**Step 3: Run focused checks**

Run:
- `gofmt` on changed Go files.
- `go test ./internal/application/agentcontrol ./internal/cli/command/meta ./internal/transport/http/handlers/agentcontrol -count=1`

### Task 4: Documentation Snapshot

**Files:**
- Modify: `docs/anycap-current-status.md`

**Step 1: Update current state**

Revise the Feishu IM section to state that daemon-owned personal bot ingress also owns final reply egress, while server outbound remains fallback/legacy.

**Step 2: Verify docs and status**

Run: `git diff --stat`
