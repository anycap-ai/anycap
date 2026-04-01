# Payment Events MQ Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a minimal RocketMQ consumer in AnyCap that consumes Payment callback events for top-up flows, records them idempotently, and establishes a correct payment-event foundation without duplicating the credit ledger.

**Architecture:** Keep Payment as the authority for checkout, Stripe webhook handling, and credit granting. Add an AnyCap-side event inbox/receipt table plus a background RocketMQ consumer that subscribes to top-up callback events, validates and deduplicates them, persists processing results, and leaves Billing UI reading balance and transaction history from Credit as it does today.

**Tech Stack:** Go, Hertz bootstrap wiring, PostgreSQL migrations, background workers in `internal/app/bootstrap.go`, new RocketMQ consumer based on `github.com/apache/rocketmq-clients/golang/v5`, existing Credit HTTP client and system billing/log aggregation.

**Design References:**
- `docs/plans/2026-04-01-payment-events-mq-integration-design.md`

---

### Task 1: Add config support for Payment event MQ consumer

**Files:**
- Modify: `internal/config/config.go`
- Modify: `internal/config/config_test.go`
- Modify: `configs/server/dev.env.example`

**Step 1: Write the failing config tests**

- Add config coverage for:
  - `ANYCAP_PAYMENT_EVENTS_ENABLED`
  - `ANYCAP_PAYMENT_EVENTS_ENDPOINT`
  - `ANYCAP_PAYMENT_EVENTS_TOPIC`
  - `ANYCAP_PAYMENT_EVENTS_ACCESS_KEY`
  - `ANYCAP_PAYMENT_EVENTS_SECRET_KEY`
  - `ANYCAP_PAYMENT_EVENTS_CONSUMER_GROUP`
  - `ANYCAP_PAYMENT_EVENTS_BIZ_ID`
  - optional `ANYCAP_PAYMENT_EVENTS_TAGS`

**Step 2: Run the targeted config tests**

Run:

```bash
go test ./internal/config -run 'TestLoadFromEnv_.*Payment.*Event' -v
```

Expected: missing config fields or compile failures.

**Step 3: Implement minimal config loading**

- Add a `PaymentEventsConfig` struct to `internal/config/config.go`
- Add it to the root `Config`
- Load env values with safe defaults:
  - disabled by default
  - explicit topic required in real deployments

**Step 4: Update example env documentation**

- Add commented example values to `configs/server/dev.env.example`
- Note that topic must match deployed Payment config and must not be hardcoded by assumption

**Step 5: Re-run the targeted config tests**

Run:

```bash
go test ./internal/config -run 'TestLoadFromEnv_.*Payment.*Event' -v
```

Expected: PASS.

**Step 6: Commit**

```bash
git add internal/config/config.go internal/config/config_test.go configs/server/dev.env.example
git commit -m "feat: add payment events mq config"
```

### Task 2: Add domain types and repository port for inbound payment event receipts

**Files:**
- Modify: `internal/domain/model/system.go` or add a dedicated model file under `internal/domain/model/`
- Modify: `internal/domain/port/`
- Add: `internal/application/billingevents/` tests if using a dedicated application package

**Step 1: Write the failing tests**

- Add tests covering:
  - deriving event keys for `credits_granted`
  - deriving event keys for `payment_failed`
  - rejecting unsupported event types for phase 1

**Step 2: Run the targeted tests**

Run:

```bash
go test ./internal/application/... -run 'Test.*Payment.*Event|Test.*Billing.*Event' -v
```

Expected: missing types or missing service/package.

**Step 3: Add minimal domain models**

- Add event envelope model(s), for example:
  - `PaymentInboundEvent`
  - `PaymentEventReceipt`
- Add repository port methods such as:
  - `CreateIfAbsent`
  - `MarkProcessed`
  - `MarkIgnored`
  - `MarkFailed`
  - `GetByEventKey`

Keep the model minimal and focused on:

- event key
- event type
- biz id
- user id
- payload
- processing status

**Step 4: Re-run the targeted tests**

Run:

```bash
go test ./internal/application/... -run 'Test.*Payment.*Event|Test.*Billing.*Event' -v
```

Expected: tests move forward and now fail at missing repo/application logic.

**Step 5: Commit**

```bash
git add internal/domain/model internal/domain/port internal/application
git commit -m "feat: add payment event receipt domain types"
```

### Task 3: Add migration and Postgres repository for event receipts

**Files:**
- Add: `internal/infrastructure/migration/migrations/0023_payment_event_receipts.sql`
- Add: `internal/infrastructure/paymentevents/repo.go`
- Add: `internal/infrastructure/paymentevents/repo_test.go`

**Step 1: Write failing repository tests**

- Cover:
  - insert new event receipt
  - reject duplicates by `event_key`
  - mark processed
  - mark failed
  - fetch by `event_key`

**Step 2: Run the targeted repository tests**

Run:

```bash
go test ./internal/infrastructure/paymentevents -v
```

Expected: package or repo missing.

**Step 3: Add idempotent migration**

- Create `0023_payment_event_receipts.sql`
- Include:
  - `event_key` unique index
  - `status`
  - `payload JSONB`
  - helper columns such as `reward_id` / `session_id` if included
- Keep the migration idempotent

**Step 4: Implement Postgres repository**

- Use existing repo style from `internal/infrastructure/usage/` and other Postgres repos
- Keep repo concerns strictly persistence-only

**Step 5: Re-run the targeted repository tests**

Run:

```bash
go test ./internal/infrastructure/paymentevents -v
```

Expected: PASS.

**Step 6: Commit**

```bash
git add internal/infrastructure/migration/migrations/0023_payment_event_receipts.sql internal/infrastructure/paymentevents
git commit -m "feat: add payment event receipt repository"
```

### Task 4: Add application service for event validation, filtering, and idempotency

**Files:**
- Add: `internal/application/billingevents/service.go`
- Add: `internal/application/billingevents/service_test.go`

**Step 1: Write the failing service tests**

- Cover:
  - accept `credits_granted`
  - accept `payment_failed`
  - ignore unsupported event types
  - ignore mismatched `biz_id`
  - deduplicate using upstream business keys
  - mark processing result in the receipt repo

**Step 2: Run the targeted application tests**

Run:

```bash
go test ./internal/application/billingevents -v
```

Expected: package/service missing.

**Step 3: Implement minimal service behavior**

- Parse only the fields needed in phase 1
- Build event keys from upstream business identifiers:
  - `credits_granted:biz:{biz_id}:reward:{credit_reward.id}`
  - `payment_failed:biz:{biz_id}:session:{session_id}`
- Treat Payment as the authority for credit grant completion
- Do not call Credit grant APIs

**Step 4: Re-run the targeted application tests**

Run:

```bash
go test ./internal/application/billingevents -v
```

Expected: PASS.

**Step 5: Commit**

```bash
git add internal/application/billingevents
git commit -m "feat: add payment event processing service"
```

### Task 5: Add RocketMQ consumer infrastructure

**Files:**
- Add: `internal/infrastructure/paymentevents/consumer.go`
- Add: `internal/infrastructure/paymentevents/decoder.go`
- Add: `internal/infrastructure/paymentevents/types.go`
- Add: `internal/infrastructure/paymentevents/consumer_test.go`
- Modify: `go.mod`

**Step 1: Write the failing consumer tests**

- Cover:
  - decode valid event envelope
  - reject invalid JSON
  - route `credits_granted` to the application service
  - route `payment_failed` to the application service

**Step 2: Run the targeted tests**

Run:

```bash
go test ./internal/infrastructure/paymentevents -run 'Test.*Consumer|Test.*Decode' -v
```

Expected: compile failure until MQ dependency and consumer package exist.

**Step 3: Add RocketMQ client dependency**

- Add `github.com/apache/rocketmq-clients/golang/v5`
- Match the same client family used by the local Payment project where practical

**Step 4: Implement the consumer**

- Subscribe to configured topic
- Subscribe to tags:
  - `credits_granted`
  - `payment_failed`
- Decode the message body into the common envelope
- Hand off to the application service

Do not:

- embed business logic in the consumer
- derive completion state by polling Payment HTTP APIs

**Step 5: Re-run the targeted tests**

Run:

```bash
go test ./internal/infrastructure/paymentevents -run 'Test.*Consumer|Test.*Decode' -v
```

Expected: PASS.

**Step 6: Commit**

```bash
git add go.mod go.sum internal/infrastructure/paymentevents
git commit -m "feat: add payment events mq consumer"
```

### Task 6: Wire the background worker into server bootstrap

**Files:**
- Modify: `internal/app/bootstrap.go`
- Modify: `internal/app/bootstrap_test.go`

**Step 1: Write the failing bootstrap tests**

- Cover:
  - consumer is not started when disabled
  - consumer is built when config is enabled
  - startup tolerates missing MQ config by staying disabled

**Step 2: Run the targeted bootstrap tests**

Run:

```bash
go test ./internal/app -run 'Test.*Payment.*Event|Test.*Bootstrap' -v
```

Expected: failures from missing worker wiring.

**Step 3: Implement minimal startup wiring**

- Build the receipt repo in prod/dev modes
- Build the billing event service
- Build the MQ consumer when config is enabled
- Start it similarly to existing background workers in `bootstrap.go`

**Step 4: Re-run the targeted bootstrap tests**

Run:

```bash
go test ./internal/app -run 'Test.*Payment.*Event|Test.*Bootstrap' -v
```

Expected: PASS.

**Step 5: Commit**

```bash
git add internal/app/bootstrap.go internal/app/bootstrap_test.go
git commit -m "feat: wire payment events worker into bootstrap"
```

### Task 7: Add operational visibility and status reporting

**Files:**
- Modify: `internal/domain/model/system.go`
- Modify: `internal/application/system/service.go`
- Modify: `internal/transport/http/handlers/system/handler.go` only if status surface needs extension
- Add/Modify tests under `internal/application/system/` or `internal/transport/http/`

**Step 1: Write the failing tests**

- Cover:
  - server status includes MQ worker/config health when enabled
  - failures can be diagnosed without reading raw MQ logs only

**Step 2: Run targeted tests**

Run:

```bash
go test ./internal/application/system ./internal/transport/http -run 'Test.*Status|Test.*Health' -v
```

Expected: missing worker observability.

**Step 3: Add minimal observability**

- Expose whether Payment events MQ is enabled/configured
- Optionally expose last processing time / last error only if easy and low-risk
- Keep public surfaces concise and non-sensitive

**Step 4: Re-run targeted tests**

Run:

```bash
go test ./internal/application/system ./internal/transport/http -run 'Test.*Status|Test.*Health' -v
```

Expected: PASS.

**Step 5: Commit**

```bash
git add internal/domain/model/system.go internal/application/system/service.go internal/transport/http/handlers/system/handler.go
git commit -m "feat: expose payment event worker status"
```

### Task 8: Verify migration, consumer logic, and non-regression paths

**Files:**
- No new product files unless fixing breakages
- Update tests as needed

**Step 1: Run focused backend tests**

Run:

```bash
go test ./internal/config ./internal/app ./internal/application/billingevents ./internal/infrastructure/paymentevents ./internal/transport/http -v
```

Expected: PASS.

**Step 2: Run a broader non-regression pass**

Run:

```bash
go test ./...
```

Expected: PASS, or document unrelated existing failures before proceeding.

**Step 3: Manual verification checklist**

- start server with payment event MQ disabled and confirm normal startup
- start server with MQ enabled but invalid credentials and confirm controlled failure/disable behavior
- insert or replay a sample `credits_granted` payload into the processor path and confirm:
  - inbox row created
  - duplicate processing skipped
  - no Credit grant call is attempted
- insert or replay a sample `payment_failed` payload and confirm:
  - inbox row created
  - event marked processed/ignored according to design

**Step 4: Update status documentation**

- Update `docs/anycap-current-status.md` to reflect that Payment checkout is live and MQ callback consumption is supported or gated behind config, depending on actual implementation state

**Step 5: Final commit**

```bash
git add docs/anycap-current-status.md
git commit -m "docs: update payment event integration status"
```

### Task 9: Optional phase-2 follow-up tasks (do not block phase 1)

**Files:**
- Future-only; do not implement in the first pass

**Step 1: Decide whether Billing UI needs local failed-payment visibility**

- If yes, add a read path over the receipt table or a projected table
- If no, keep failures operational-only

**Step 2: Decide whether to consume `payment_success`**

- Only add if there is a concrete product or support need distinct from `credits_granted`

**Step 3: Plan subscription event support**

- `subscription_created`
- `subscription_renewed`
- `subscription_canceled`
- `subscription_deleted`

These should be a follow-up plan, not phase 1 scope.

---

Plan complete and saved to `docs/plans/2026-04-01-payment-events-mq-integration-implementation.md`. Two execution options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

Which approach?
