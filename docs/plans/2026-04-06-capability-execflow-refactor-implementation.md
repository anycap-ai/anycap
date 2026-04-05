# Capability Execution Flow Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为 `image` / `video` / `music` 引入共享 capability execution flow，收口 billing、usage、credit deduct、call log 的重复执行外壳，并为 `web` / `capabilities` 留出后续接入路径。

**Architecture:** 新增 `internal/application/execflow` 作为共享执行层，只承载横切编排，不承载 route selection、upload resolution、artifact publish、task audit 等业务差异。第一阶段仅让 `image/video/music` 接入，确认公共执行模型成立后，再评估 `web` 和 `capabilities` 的渐进接入。

**Tech Stack:** Go, Hertz, existing application/domain/infrastructure layering, existing BillingCoordinator/CreditClient/UsageWriter/CallLogRepo contracts, existing unit test suite.

**Design References:**
- `docs/plans/2026-04-06-capability-execflow-refactor-design.md`

---

### Task 1: Define the shared execution flow contract

**Files:**
- Create: `internal/application/execflow/executor.go`
- Create: `internal/application/execflow/types.go`
- Create: `internal/application/execflow/executor_test.go`

**Step 1: Write the failing tests**

- In `internal/application/execflow/executor_test.go`, add table-driven tests for:
  - failing early when `MinCredit` is required and balance is insufficient
  - creating billing intent before provider invocation
  - marking billing intent uncertain when provider invocation fails
  - returning `model.ErrBillingUncertain` when credit deduct fails after provider success
  - tolerating usage / call log write failures without failing the main request

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/application/execflow -v
```

Expected: package/types/methods missing.

**Step 3: Write minimal implementation**

- Define an `Executor` type that owns:
  - `port.BillingCoordinator`
  - `port.CreditClient`
  - `port.UsageWriter`
  - `port.CallLogRepo`
  - `now func() time.Time`
- Define request metadata structs, for example:
  - `ExecutionInput`
  - `ProviderSuccessMeta`
  - `UsageRecords`
  - `ExecutionHooks`
- Implement a single `Run(...)` method that handles:
  - optional balance check
  - optional billing intent creation
  - provider invocation
  - provider success recording
  - optional usage persistence
  - credit deduction
  - billing finalize
  - optional call log persistence

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/application/execflow -v
```

Expected: PASS.

**Step 5: Commit**

```bash
git add internal/application/execflow/executor.go internal/application/execflow/types.go internal/application/execflow/executor_test.go
git commit -m "refactor: add shared capability execution flow"
```

### Task 2: Refactor image generation onto the shared executor

**Files:**
- Modify: `internal/application/image/service.go`
- Modify: `internal/application/image/service_test.go`

**Step 1: Write the failing regression tests**

- Add or extend tests covering:
  - billing intent is created before provider call
  - provider failure marks billing uncertain
  - usage and call log are still recorded on success
  - artifact publish still happens after successful provider response
  - upload reference resolution still happens before provider invocation

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/application/image -v
```

Expected: one or more assertions fail because the old implementation has not been adapted to the new executor contract.

**Step 3: Write minimal implementation**

- Add an `exec *execflow.Executor` field to `image.Service`
- Construct it in `NewService(...)` using existing dependencies
- Keep these steps in `image.Service.Execute(...)`:
  - request validation
  - model lookup
  - mode inference
  - route selection
  - upload ref resolution
- Move the shared billing / usage / call log / deduct path into `exec.Run(...)`
- Keep artifact publish in an `AfterSuccess` hook so media-specific logic remains local to image

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/application/image -v
```

Expected: PASS.

**Step 5: Commit**

```bash
git add internal/application/image/service.go internal/application/image/service_test.go
git commit -m "refactor: move image execution onto shared flow"
```

### Task 3: Refactor video generation onto the shared executor

**Files:**
- Modify: `internal/application/video/service.go`
- Modify: `internal/application/video/service_test.go`

**Step 1: Write the failing regression tests**

- Cover the same behavior family as image:
  - billing intent creation
  - uncertain billing on provider failure
  - usage and provider run persistence
  - artifact publish after provider success
  - upload ref resolution before provider invocation

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/application/video -v
```

Expected: FAIL until the service is migrated.

**Step 3: Write minimal implementation**

- Mirror the image refactor pattern
- Keep video-specific route selection and input preparation in `video.Service`
- Use `exec.Run(...)` for shared execution steps
- Keep artifact publish in a video-specific `AfterSuccess` hook

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/application/video -v
```

Expected: PASS.

**Step 5: Commit**

```bash
git add internal/application/video/service.go internal/application/video/service_test.go
git commit -m "refactor: move video execution onto shared flow"
```

### Task 4: Refactor music generation onto the shared executor

**Files:**
- Modify: `internal/application/music/service.go`
- Modify: `internal/application/music/service_test.go`

**Step 1: Write the failing regression tests**

- Cover:
  - billing and deduct flow still behaves the same
  - provider failure still marks uncertain
  - usage and call log still persist
  - artifact publish still runs after provider success

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/application/music -v
```

Expected: FAIL until the service is migrated.

**Step 3: Write minimal implementation**

- Add shared executor wiring to `music.Service`
- Keep music-specific validation, model lookup, mode inference, and route selection local
- Route the billing / usage / log path through `exec.Run(...)`
- Keep artifact publish in a music-specific `AfterSuccess` hook

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/application/music -v
```

Expected: PASS.

**Step 5: Commit**

```bash
git add internal/application/music/service.go internal/application/music/service_test.go
git commit -m "refactor: move music execution onto shared flow"
```

### Task 5: Run shared regression coverage for the migrated services

**Files:**
- Modify: `internal/application/execflow/executor_test.go` if gaps are found

**Step 1: Run the focused test suite**

Run:

```bash
go test ./internal/application/execflow ./internal/application/image ./internal/application/video ./internal/application/music -v
```

Expected: PASS.

**Step 2: Fill test gaps**

- If any cross-service regression case is still only tested indirectly, add a focused test in:
  - `internal/application/execflow/executor_test.go`
  - or the relevant service test file

**Step 3: Re-run tests**

Run:

```bash
go test ./internal/application/execflow ./internal/application/image ./internal/application/video ./internal/application/music -v
```

Expected: PASS.

**Step 4: Commit**

```bash
git add internal/application/execflow/executor_test.go internal/application/image/service_test.go internal/application/video/service_test.go internal/application/music/service_test.go
git commit -m "test: strengthen shared capability execution coverage"
```

### Task 6: Prepare follow-up plan for web integration

**Files:**
- Modify: `docs/plans/2026-04-06-capability-execflow-refactor-design.md`
- Modify: `docs/plans/2026-04-06-capability-execflow-refactor-implementation.md`

**Step 1: Re-evaluate `web` after phase-one code lands**

- Inspect:
  - `internal/application/web/service.go`
  - `internal/application/capabilities/service_invoke.go`
- Confirm whether `web` should:
  - use the full executor
  - or only reuse a subset of billing/deduct helpers

**Step 2: Update the docs with the chosen follow-up direction**

- Record which parts of the executor are safe for `web`
- Record why `capabilities` still should not be fully migrated yet

**Step 3: Commit**

```bash
git add docs/plans/2026-04-06-capability-execflow-refactor-design.md docs/plans/2026-04-06-capability-execflow-refactor-implementation.md
git commit -m "docs: update execflow follow-up plan"
```

### Task 7: Full verification before merge

**Files:**
- No code changes required unless verification fails

**Step 1: Run the relevant application and app-layer tests**

Run:

```bash
go test ./internal/application/... ./internal/app ./internal/middleware
```

Expected: PASS.

**Step 2: If verification fails, fix the smallest failing slice**

- Prefer fixing the specific failing service or executor behavior
- Do not broaden scope into `web` / `capabilities` / `bootstrap` during this phase

**Step 3: Re-run verification**

Run:

```bash
go test ./internal/application/... ./internal/app ./internal/middleware
```

Expected: PASS.

**Step 4: Commit**

```bash
git add .
git commit -m "refactor: complete capability execution flow phase one"
```

### Notes for execution

- Do not change public HTTP handlers or DTOs in this plan.
- Do not move route selection into `execflow`.
- Do not migrate `web` or `capabilities` in phase one.
- Keep the first phase focused on reducing duplication in `image/video/music`.

Plan complete and saved to `docs/plans/2026-04-06-capability-execflow-refactor-implementation.md`. Two execution options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
