# Feishu Reaction Ack Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the generic immediate text acknowledgment for daemon-first personal Feishu bot chat messages with a reaction on the triggering message, while keeping command replies and text fallback behavior intact.

**Architecture:** Extend the daemon-first Feishu inbound path so normalized events carry the triggering `message_id`, add a direct Feishu reaction API to the adapter, and let the local daemon run a constrained reaction selector before deciding whether to send the existing immediate text acknowledgment. The server-side conversation/session flow remains unchanged.

**Tech Stack:** Go, Cobra CLI, AnyCap daemon-first IM flow, Lark/Feishu OpenAPI Go SDK, existing AnyCap agentcontrol application layer.

**Design References:**
- `docs/plans/2026-04-10-feishu-reaction-ack-design.md`

---

### Task 1: Add message ID to normalized inbound events

**Files:**
- Modify: `internal/infrastructure/im/adapter.go`
- Modify: `internal/infrastructure/im/feishu_longconn_bot.go`
- Modify: `internal/infrastructure/im/feishu_adapter.go`
- Test: `internal/infrastructure/im/feishu_longconn_bot_test.go`

**Step 1: Write or update failing tests**

Update the Feishu long-connection normalization test so it expects `NormalizedInboundEvent.MessageID` to be set from the incoming Feishu event.

**Step 2: Run targeted test to verify failure**

Run:

```bash
go test ./internal/infrastructure/im -run 'FeishuLongConnBot' -count=1
```

Expected: a failure or missing-field mismatch for `message_id`.

**Step 3: Implement minimal code**

- Add `MessageID string` to `NormalizedInboundEvent`
- Populate it in the personal-bot Feishu long-connection normalization path
- Optionally populate it in webhook normalization for consistency

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/infrastructure/im -run 'FeishuLongConnBot' -count=1
```

Expected: PASS

**Step 5: Commit**

```bash
git add internal/infrastructure/im/adapter.go internal/infrastructure/im/feishu_longconn_bot.go internal/infrastructure/im/feishu_adapter.go internal/infrastructure/im/feishu_longconn_bot_test.go
git commit -m "feat: carry feishu message ids in normalized inbound events"
```

### Task 2: Add direct Feishu reaction support

**Files:**
- Modify: `internal/infrastructure/im/feishu_adapter.go`
- Test: `internal/infrastructure/im/feishu_longconn_bot_test.go`

**Step 1: Write the failing test**

Add a test covering:

- reaction creation is attempted with `message_id`
- if reaction succeeds, no immediate text message is sent

Also add a failure-path test covering:

- reaction create error falls back to sending the original text ack

**Step 2: Run targeted tests to verify failure**

Run:

```bash
go test ./internal/infrastructure/im -run 'FeishuLongConnBot|Reaction' -count=1
```

Expected: FAIL because the adapter has no reaction API yet.

**Step 3: Implement minimal code**

- Add a direct adapter method like:
  - `CreateReaction(ctx context.Context, binding model.IMBinding, messageID string, emojiType string) error`
- Use the Lark direct client
- Return explicit errors for missing message ID, missing client, or unsuccessful response

**Step 4: Re-run tests**

Run:

```bash
go test ./internal/infrastructure/im -run 'FeishuLongConnBot|Reaction' -count=1
```

Expected: PASS

**Step 5: Commit**

```bash
git add internal/infrastructure/im/feishu_adapter.go internal/infrastructure/im/feishu_longconn_bot_test.go
git commit -m "feat: add feishu reaction support for daemon acknowledgments"
```

### Task 3: Add a constrained reaction selector

**Files:**
- Create: `internal/application/agentcontrol/reaction_ack.go`
- Test: `internal/application/agentcontrol/reaction_ack_test.go`

**Step 1: Write the failing tests**

Add table-driven tests for:

- allowed emoji values are accepted
- whitespace is trimmed
- disallowed values are rejected
- command messages are excluded from reaction-only path

**Step 2: Run test to verify failure**

Run:

```bash
go test ./internal/application/agentcontrol -run 'ReactionAck' -count=1
```

Expected: FAIL because the selector helpers do not exist yet.

**Step 3: Implement minimal code**

Create a small helper layer that provides:

- allowlist constants
- command detection
- selector output validation

Keep this package-local and deterministic except for the actual selector call integration.

**Step 4: Re-run tests**

Run:

```bash
go test ./internal/application/agentcontrol -run 'ReactionAck' -count=1
```

Expected: PASS

**Step 5: Commit**

```bash
git add internal/application/agentcontrol/reaction_ack.go internal/application/agentcontrol/reaction_ack_test.go
git commit -m "feat: add constrained reaction ack selection rules"
```

### Task 4: Integrate reaction-first immediate ack in the personal daemon bot

**Files:**
- Modify: `internal/infrastructure/im/feishu_longconn_bot.go`
- Modify: `internal/cli/command/meta/agent_daemon.go`
- Test: `internal/infrastructure/im/feishu_longconn_bot_test.go`
- Test: `internal/cli/command/meta/agent_runner_serve_test.go`

**Step 1: Write the failing tests**

Cover:

- normal personal-bot chat message:
  - tries reaction first
  - suppresses immediate text ack on success
- command message:
  - skips reaction
  - keeps current text behavior
- invalid selector output:
  - falls back to text ack
- reaction API failure:
  - falls back to text ack

**Step 2: Run targeted tests**

Run:

```bash
go test ./internal/infrastructure/im ./internal/cli/command/meta -run 'FeishuLongConnBot|AgentRunnerServe' -count=1
```

Expected: FAIL because the bot still always sends the immediate text reply.

**Step 3: Implement minimal code**

- Extend the bot config with a reaction-selection hook or selector dependency
- In `handleNormalizedEvent`, only for daemon-first personal-bot messages:
  - inspect the returned immediate reply text
  - decide whether the event is eligible for reaction-only ack
  - run reaction selection
  - validate the selected emoji
  - create reaction
  - suppress text ack when successful
  - fallback to text ack on any failure

**Step 4: Re-run tests**

Run:

```bash
go test ./internal/infrastructure/im ./internal/cli/command/meta -run 'FeishuLongConnBot|AgentRunnerServe' -count=1
```

Expected: PASS

**Step 5: Commit**

```bash
git add internal/infrastructure/im/feishu_longconn_bot.go internal/cli/command/meta/agent_daemon.go internal/infrastructure/im/feishu_longconn_bot_test.go internal/cli/command/meta/agent_runner_serve_test.go
git commit -m "feat: use reactions for personal feishu bot immediate acknowledgments"
```

### Task 5: Preserve server-side behavior and add fallback coverage

**Files:**
- Modify: `internal/transport/http/handlers/agentcontrol/handler_test.go`
- Modify: `internal/application/agentcontrol/chat_reply.go` only if needed for clearer branching
- Test: `internal/application/agentcontrol/conversation_service_test.go`

**Step 1: Add or update tests**

Confirm:

- server inbound result generation is unchanged
- queued reply strings are still available for fallback
- command reply strings remain unchanged

**Step 2: Run tests**

Run:

```bash
go test ./internal/application/agentcontrol ./internal/transport/http/handlers/agentcontrol -run 'HandleOwnedInboundMessage|Queued|ChatReply' -count=1
```

Expected: PASS after any necessary small adjustments.

**Step 3: Keep implementation minimal**

Only touch server-side code if needed to keep fallback and tests clear. Do not re-architect the server path.

**Step 4: Commit**

```bash
git add internal/application/agentcontrol/chat_reply.go internal/application/agentcontrol/conversation_service_test.go internal/transport/http/handlers/agentcontrol/handler_test.go
git commit -m "test: cover reaction ack fallback and preserved chat reply behavior"
```

### Task 6: Update daemon-first docs and operator guidance

**Files:**
- Modify: `skills/anycap-cli/SKILL.md`
- Modify: `internal/cli/skill/embedded/anycap-cli/SKILL.md`
- Modify: `skills/anycap-cli/references/cli-reference.md`
- Modify: `docs/anycap-current-status.md`

**Step 1: Update docs**

Document:

- normal personal Feishu bot messages now use reaction-first acknowledgments
- commands still use text replies
- fallback behavior still exists

**Step 2: Verify docs stay aligned with CLI behavior**

Quickly inspect:

```bash
rg -n "reaction|acknowledg|Feishu" skills/anycap-cli internal/cli/skill/embedded/anycap-cli docs/anycap-current-status.md
```

Expected: updated wording appears in all relevant docs.

**Step 3: Commit**

```bash
git add skills/anycap-cli/SKILL.md internal/cli/skill/embedded/anycap-cli/SKILL.md skills/anycap-cli/references/cli-reference.md docs/anycap-current-status.md
git commit -m "docs: describe reaction-first feishu acknowledgments"
```

### Task 7: Run focused verification before pushing

**Files:**
- No code changes required unless failures appear

**Step 1: Run focused test suite**

```bash
go test ./internal/application/agentcontrol ./internal/transport/http/handlers/agentcontrol ./internal/infrastructure/im ./internal/cli/command/meta -run 'ReactionAck|HandleOwnedInboundMessage|Queued|FeishuLongConnBot|AgentRunnerServe' -count=1
```

Expected: PASS

**Step 2: Spot-check CLI help if any user-facing flag or command text changed**

```bash
go run ./cmd/anycap agent daemon start --help
```

Expected: daemon help still renders cleanly.

**Step 3: Final commit if needed**

If verification required any small fixes, commit them with a narrow message.

