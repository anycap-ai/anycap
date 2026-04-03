# Credit Billing Consistency Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Introduce a local `billing_intents` ledger, synchronous finalize flow, and crash-recovery worker so AnyCap can close the main credit bad-debt window for NexusHub-backed capabilities while keeping current CLI/server behavior unchanged.

**Architecture:** Keep the user-facing request path synchronous. Each billed request first creates a local billing intent keyed by `trace_id`, then calls the provider, persists provider outcome, performs `credit.Deduct`, and finally marks the intent as deducted. A background billing worker recovers uncertain intents by using either a persisted `provider_task_id` or the new NexusHub `trace_id + biz_id=anycap -> task_id` lookup, while `usage_events` and `provider_runs` remain projection/audit tables rather than the billing truth source.

**Tech Stack:** Go, Hertz, PostgreSQL, existing migration runner, existing Credit Service integration, existing NexusHub client, common-go trace middleware.

**Design References:**
- `docs/plans/2026-04-03-credit-billing-consistency-design.md`

---

### Task 1: Add billing domain types and port contracts

**Files:**
- Create: `internal/domain/model/billing_intent.go`
- Create: `internal/domain/port/billing.go`
- Create: `internal/application/billing/service.go`
- Create: `internal/application/billing/service_test.go`
- Modify: `internal/domain/port/nexushub.go`

**Step 1: Write the failing tests**

- In `internal/application/billing/service_test.go`, add table-driven tests for:
  - generating `deduct_source_id` as `anycap-<capability>-<trace_id>`
  - creating a billing intent from `trace_id`
  - transitioning `created -> provider_succeeded_pending_deduct -> deducted`
  - transitioning uncertain intents to `released` after the 30-minute recovery window

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/application/billing -run 'Test(BuildDeductSourceID|BillingIntentStateTransitions)' -v
```

Expected: package/types/methods missing.

**Step 3: Write minimal implementation**

- Define `BillingIntent` record/update/query models, including:
  - `provider`
  - `capability`
  - `trace_id`
  - `provider_task_id`
  - `credit_cost`
  - `billing_status`
  - `provider_status`
  - `deduct_source_id`
  - `recovery_attempts`
  - `next_retry_at`
  - `deducted_at`
  - `released_at`
- Define status constants:
  - `created`
  - `uncertain_retryable`
  - `provider_succeeded_pending_deduct`
  - `deducted`
  - `provider_failed`
  - `released`
- Add a NexusHub trace lookup method to `internal/domain/port/nexushub.go`, for example:
  - `GetTaskIDByTrace(ctx context.Context, traceID, bizID string) (string, error)`
- Add the minimal pure-logic helpers in `internal/application/billing/service.go`:
  - source-id builder
  - recovery-window expiration check
  - simple state transition helpers

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/application/billing -run 'Test(BuildDeductSourceID|BillingIntentStateTransitions)' -v
```

Expected: PASS.

**Step 5: Commit**

```bash
git add internal/domain/model/billing_intent.go internal/domain/port/billing.go internal/application/billing/service.go internal/application/billing/service_test.go internal/domain/port/nexushub.go
git commit -m "feat: add billing intent domain model"
```

### Task 2: Add the `billing_intents` schema

**Files:**
- Create: `internal/infrastructure/migration/migrations/0025_billing_intents.sql`
- Modify: `internal/infrastructure/migration/migrator_test.go`

**Step 1: Write the failing migration coverage**

- Extend migration test coverage so the new migration file is discovered.
- Add assertions for idempotency expectations if the current migration tests already check them.

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/infrastructure/migration -v
```

Expected: missing migration file or expectation mismatch.

**Step 3: Write minimal implementation**

- Add `0025_billing_intents.sql` with idempotent DDL.
- Include columns for:
  - primary key
  - `user_id`
  - `api_key_id`
  - `provider`
  - `capability`
  - `trace_id`
  - `provider_task_id`
  - `credit_cost`
  - `billing_status`
  - `provider_status`
  - `deduct_source_id`
  - `last_error`
  - `recovery_attempts`
  - `next_retry_at`
  - `created_at`
  - `updated_at`
  - `deducted_at`
  - `released_at`
- Add indexes/constraints for:
  - `UNIQUE(provider, trace_id)`
  - `UNIQUE(deduct_source_id)`
  - recovery scan fields such as `billing_status`, `next_retry_at`, `created_at`

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/infrastructure/migration -v
```

Expected: PASS.

**Step 5: Commit**

```bash
git add internal/infrastructure/migration/migrations/0025_billing_intents.sql internal/infrastructure/migration/migrator_test.go
git commit -m "feat: add billing intents schema"
```

### Task 3: Implement the billing repository

**Files:**
- Create: `internal/infrastructure/billing/repo.go`
- Create: `internal/infrastructure/billing/repo_test.go`
- Modify: `internal/domain/port/billing.go`

**Step 1: Write the failing repository tests**

- Cover:
  - insert/create intent
  - get by `provider + trace_id`
  - update provider success fields (`provider_task_id`, `provider_status`, `credit_cost`)
  - mark deducted
  - mark provider failed
  - claim recoverable intents ordered by `next_retry_at`
  - release expired uncertain intents after the 30-minute window
  - uniqueness on `provider + trace_id` and `deduct_source_id`

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/infrastructure/billing -v
```

Expected: compile failures or missing repository methods.

**Step 3: Write minimal implementation**

- Implement a PostgreSQL-backed billing repo on `sqlstore.DBTX`.
- Add methods for:
  - create/get intent
  - record provider success
  - record provider failure
  - mark uncertain
  - mark deducted
  - claim next recoverable intents
  - bump `recovery_attempts` and `next_retry_at`
  - release expired intents
- Keep write operations explicit and small; do not bury state changes behind generic “update all fields” methods.

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/infrastructure/billing -v
```

Expected: PASS.

**Step 5: Commit**

```bash
git add internal/infrastructure/billing/repo.go internal/infrastructure/billing/repo_test.go internal/domain/port/billing.go
git commit -m "feat: add billing intent repository"
```

### Task 4: Extend the NexusHub client for `trace_id` propagation and reverse lookup

**Files:**
- Modify: `internal/domain/port/nexushub.go`
- Modify: `internal/infrastructure/nexushub/client.go`
- Modify: `internal/infrastructure/nexushub/client_test.go`

**Step 1: Write the failing client tests**

- Add tests asserting that generate requests send:
  - `X-Trace-ID`
  - `X-Nexus-Extra` containing at least `trace_id`
- Add tests for the new reverse-lookup client method:
  - success returns `task_id`
  - `404` returns a recognizable not-found error path
  - malformed response surfaces a decode error

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/infrastructure/nexushub -run 'TestClient_(Generate|GetTaskIDByTrace)' -v
```

Expected: missing header assertions or missing lookup method.

**Step 3: Write minimal implementation**

- In each submit path (`GenerateImage`, `GenerateVideo`, `GenerateMusic`):
  - keep existing `X-Trace-ID`
  - set `X-Nexus-Extra` JSON with:
    - `trace_id`
    - `biz_id=anycap`
- Add the reverse-lookup HTTP method to `client.go` using the API shape confirmed with NexusHub.
- Map `404` to an error the billing worker can treat as “not visible yet,” not a hard fatal provider failure.

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/infrastructure/nexushub -run 'TestClient_(Generate|GetTaskIDByTrace)' -v
```

Expected: PASS.

**Step 5: Commit**

```bash
git add internal/domain/port/nexushub.go internal/infrastructure/nexushub/client.go internal/infrastructure/nexushub/client_test.go
git commit -m "feat: add nexushub trace lookup support"
```

### Task 5: Build the billing application service

**Files:**
- Modify: `internal/application/billing/service.go`
- Modify: `internal/application/billing/service_test.go`
- Modify: `internal/domain/port/billing.go`

**Step 1: Write the failing service tests**

- Cover:
  - `CreateOrGetIntent` uses `trace_id` and stable `deduct_source_id`
  - provider success path persists `provider_task_id`, `credit_cost`, and pending-deduct status
  - deduct success finalizes to `deducted`
  - deduct failure records `uncertain_retryable` and leaves recovery metadata for the worker

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/application/billing -run 'TestService_(CreateOrGetIntent|RecordProviderSuccess|FinalizeDeduct|MarkUncertain)' -v
```

Expected: failing assertions around missing orchestration logic.

**Step 3: Write minimal implementation**

- Add a repository-backed billing service that owns:
  - intent creation
  - provider success/failure recording
  - deduct finalize
  - uncertain/retry scheduling
- Keep credit calling outside DB transactions.
- Keep local state transitions inside explicit repository methods so the service reads like the design doc phases:
  - create intent
  - record provider result
  - deduct
  - finalize or mark uncertain

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/application/billing -run 'TestService_(CreateOrGetIntent|RecordProviderSuccess|FinalizeDeduct|MarkUncertain)' -v
```

Expected: PASS.

**Step 5: Commit**

```bash
git add internal/application/billing/service.go internal/application/billing/service_test.go internal/domain/port/billing.go
git commit -m "feat: add billing orchestration service"
```

### Task 6: Implement the billing recovery worker

**Files:**
- Create: `internal/application/billing/worker.go`
- Create: `internal/application/billing/worker_test.go`
- Modify: `internal/application/billing/service.go`
- Modify: `internal/domain/port/billing.go`

**Step 1: Write the failing worker tests**

- Cover:
  - intent with `provider_task_id` recovers through `GetSubmitResult`
  - intent without `provider_task_id` recovers through `GetTaskIDByTrace`
  - `404` before 30 minutes only requeues
  - `404` after 30 minutes marks `released`
  - duplicate recovery attempts do not produce duplicate deduct calls when `source_id` is the same

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/application/billing -run 'TestWorker_' -v
```

Expected: missing worker and recovery methods.

**Step 3: Write minimal implementation**

- Add a polling worker similar in shape to `internal/application/usage/worker.go`, but dedicated to billing recovery.
- Default retry schedule:
  - 1 minute
  - 3 minutes
  - 5 minutes
  - 10 minutes
  - 20 minutes
  - 30 minutes
- Recovery order:
  1. if `provider_task_id` exists, query by task id
  2. otherwise query NexusHub by `trace_id + biz_id=anycap`
  3. if provider success, run deduct finalize
  4. if provider failed, mark `provider_failed`
  5. if not found and still inside 30 minutes, requeue
  6. if still not found after 30 minutes, mark `released`

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/application/billing -run 'TestWorker_' -v
```

Expected: PASS.

**Step 5: Commit**

```bash
git add internal/application/billing/worker.go internal/application/billing/worker_test.go internal/application/billing/service.go internal/domain/port/billing.go
git commit -m "feat: add billing recovery worker"
```

### Task 7: Integrate billing intents into image/video/music generation flows

**Files:**
- Modify: `internal/application/image/service.go`
- Modify: `internal/application/image/service_test.go`
- Modify: `internal/application/video/service.go`
- Modify: `internal/application/video/service_test.go`
- Modify: `internal/application/music/service.go`
- Modify: `internal/application/music/service_test.go`

**Step 1: Write the failing service tests**

- For each generate flow, cover:
  - create billing intent before provider submission
  - record provider success before deduct
  - deduct success finalizes the intent
  - deduct failure returns `model.ErrBillingUncertain` and leaves a recoverable intent
  - duplicate recovery does not double-deduct because `source_id` is stable

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/application/image ./internal/application/video ./internal/application/music -v
```

Expected: failing assertions around missing billing intent orchestration.

**Step 3: Write minimal implementation**

- Inject the billing service into image/video/music services.
- Replace the current “provider success then immediate `Deduct`” path with:
  1. create/get intent from `trace_id`
  2. call NexusHub
  3. record provider success (`provider_task_id`, `credit_cost`, status)
  4. call `credit.Deduct` using the persisted `deduct_source_id` semantics
  5. finalize deducted state
- Keep `usage_events`, `provider_runs`, and `call_logs` as projection/audit writes; do not let projection failures become the billing source of truth.

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/application/image ./internal/application/video ./internal/application/music -v
```

Expected: PASS.

**Step 5: Commit**

```bash
git add internal/application/image/service.go internal/application/image/service_test.go internal/application/video/service.go internal/application/video/service_test.go internal/application/music/service.go internal/application/music/service_test.go
git commit -m "feat: persist billing intents for generate flows"
```

### Task 8: Integrate billing intents into read flows

**Files:**
- Modify: `internal/application/capabilities/service_invoke.go`
- Modify: `internal/application/capabilities/service_test.go`
- Modify: `internal/application/capabilities/service.go`

**Step 1: Write the failing service tests**

- Cover:
  - `image.read`, `video.read`, `audio.read` create billing intents before finalize
  - successful reads finalize deducted state with the same `trace_id`
  - deduct failure returns `model.ErrBillingUncertain`
  - no fallback to ad-hoc source-id generation after intent creation

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/application/capabilities -v
```

Expected: failing assertions around missing billing intent flow.

**Step 3: Write minimal implementation**

- Refactor `finalizeSuccessfulRead` so it goes through the billing service instead of calling `s.credit.Deduct` directly.
- Keep read-cost constants unchanged.
- Keep `trace_id` as the only request key; remove any new logic that invents a second billing ID.
- Be explicit in code/comments that read flows now share the billing truth source, even though upstream recovery remains limited until that provider exposes a comparable lookup mechanism.

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/application/capabilities -v
```

Expected: PASS.

**Step 5: Commit**

```bash
git add internal/application/capabilities/service_invoke.go internal/application/capabilities/service_test.go internal/application/capabilities/service.go
git commit -m "feat: route read billing through billing intents"
```

### Task 9: Wire the billing repo/service/worker into server bootstrap

**Files:**
- Modify: `internal/app/bootstrap.go`
- Modify: `internal/application/billing/worker.go`
- Modify: `internal/application/billing/service.go`

**Step 1: Write the failing bootstrap/worker tests**

- Add or extend tests asserting:
  - billing dependencies are constructed when Postgres + Credit + NexusHub are enabled
  - the billing worker starts alongside existing workers
  - nil/disabled paths do not panic in stub or partial-config modes

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/app -run 'Test(BuildServerDependencies|NewServer)' -v
```

Expected: missing billing dependency wiring.

**Step 3: Write minimal implementation**

- Add billing repo/service/worker construction in `buildServerDependencies`.
- Start the billing worker similarly to `usageSyncWorker` and `paymentEventsWorker`.
- Reuse existing polling defaults unless the codebase already has a clearer config home for worker intervals.
- Do not add new product-facing flags in this task unless wiring absolutely requires them.

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/app -run 'Test(BuildServerDependencies|NewServer)' -v
```

Expected: PASS.

**Step 5: Commit**

```bash
git add internal/app/bootstrap.go internal/application/billing/worker.go internal/application/billing/service.go
git commit -m "feat: wire billing recovery into server"
```

### Task 10: Update projections, status docs, and run end-to-end verification

**Files:**
- Modify: `internal/application/usage/service.go`
- Modify: `internal/application/usage/worker.go`
- Modify: `internal/application/usage/service_test.go`
- Modify: `internal/application/usage/worker_test.go`
- Modify: `docs/anycap-current-status.md`

**Step 1: Write the failing tests and checklist**

- Add coverage proving:
  - usage sync still works after billing-intent introduction
  - billing recovery and usage sync do not fight over the same provider result fields
  - released/unbilled billing intents do not imply successful credit transactions

**Step 2: Run the targeted verification commands**

Run:

```bash
go test ./internal/application/billing ./internal/application/usage ./internal/application/image ./internal/application/video ./internal/application/music ./internal/application/capabilities ./internal/infrastructure/billing ./internal/infrastructure/nexushub ./internal/app -v
```

Expected: at least one failure before the remaining glue is fixed.

**Step 3: Write the minimal finishing changes**

- Adjust usage sync only where the billing-intent source of truth changes assumptions.
- Update `docs/anycap-current-status.md` so it describes the post-change billing behavior accurately:
  - `billing_intents` is the truth source
  - generate flows recover by `provider_task_id` or `trace_id + biz_id`
  - read flows use the same local billing ledger
- Keep documentation factual; do not write changelog prose into the status snapshot.

**Step 4: Run full verification**

Run:

```bash
go test ./...
```

Expected: PASS.

If `go test ./...` is too slow or flakes on unrelated packages, record the failing package and re-run the narrow set plus the relevant integration tests before claiming success.

**Step 5: Commit**

```bash
git add internal/application/usage/service.go internal/application/usage/worker.go internal/application/usage/service_test.go internal/application/usage/worker_test.go docs/anycap-current-status.md
git commit -m "feat: finalize credit billing consistency flow"
```

## Notes For The Implementer

- Use `trace_id` as the only billing recovery key. Do not re-introduce a parallel `request_id` identity for billing.
- Persist `deduct_source_id` when the intent is created; do not recompute it later from mutable request objects.
- Keep DB transactions local to AnyCap state changes only. Never keep a SQL transaction open across NexusHub or Credit HTTP calls.
- Treat NexusHub reverse-lookup `404` as “not visible yet” inside the 30-minute window.
- Keep `usage_events` and `provider_runs` as projections; do not make billing correctness depend on those writes succeeding.
- For read flows, make the billing ledger consistent immediately, but do not invent unsupported upstream recovery guarantees.

## Suggested Execution Order

1. Tasks 1-3
2. Task 4
3. Tasks 5-6
4. Task 7
5. Task 8
6. Task 9
7. Task 10

