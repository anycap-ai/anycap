# Payment Events MQ Integration Design

## Context

AnyCap has already integrated the Payment HTTP API for one-time checkout initiation:

- `GET /v1/pricing/credit-packs`
- `POST /v1/billing/checkout`

The current flow stops at redirecting users to Stripe Checkout via the Payment Service. This is enough for starting a payment, but it is **not** a complete payment callback integration.

According to the local Payment documentation and implementation:

- Payment publishes business events to RocketMQ after Stripe webhooks are processed
- Business systems are expected to consume MQ events instead of polling Payment HTTP APIs
- Payment automatically grants credits after successful payment

Relevant upstream references:

- Payment MQ event documentation:
  - `/Users/sczhao/dev/Projects/converge-ai/ai-infra/payment/docs/ROCKETMQ_EVENTS.md`
- Payment RocketMQ publisher:
  - `/Users/sczhao/dev/Projects/converge-ai/ai-infra/payment/internal/eventbus/rocketmq.go`
- Payment runtime config:
  - `/Users/sczhao/dev/Projects/converge-ai/ai-infra/payment/internal/config/config.go`

## What We Learned

### 1. Credits are granted by Payment, not by AnyCap

The Payment documentation explicitly states:

- Stripe webhook arrives at Payment
- Payment automatically grants credits
- Payment then publishes RocketMQ events

This means AnyCap should **not** call Credit again in response to a successful top-up event. Doing so would risk double-granting credits.

### 2. MQ is the authoritative callback mechanism

The Payment skill and docs both state that business code should consume MQ events and should not poll Payment HTTP APIs for payment status updates.

### 3. The topic name must be confirmed from runtime config

There is a mismatch between the human-facing skill text and the local Payment code:

- skill text mentions `payment_events`
- local Payment code defaults to `payment-events`

AnyCap must not hardcode either assumption. The topic must be configurable and confirmed against the deployed Payment environment.

### 4. AnyCap already gets eventual top-up visibility from Credit

Today, AnyCap `Billing` and `/v1/logs` already merge:

- capability call logs from `call_logs`
- credit transactions from Credit Service via `ListTransactions`

So for one-time credit purchases, the UI can eventually see successful top-ups through Credit even without MQ.

That means MQ phase 1 does **not** need to duplicate a full billing ledger locally just to make the page work.

## Goal

Add a minimal but correct MQ consumer for Payment events so AnyCap can:

- react to payment callbacks in the platform-supported way
- record a durable processing trail with idempotency
- prepare for future subscription/billing features
- avoid polling Payment APIs

This design is intentionally scoped to **top-up payments first**. Subscription lifecycle handling can be added later on the same foundation.

## Recommended Scope

### Phase 1

Consume and process only:

- `credits_granted`
- `payment_failed`

### Why this is enough

- `credits_granted` is the strongest signal that a top-up is truly complete
- `payment_failed` covers user-facing failure handling and debugging
- `payment_success` is useful, but for AnyCap top-up state the real business completion signal is `credits_granted`

### Phase 2

Optionally add:

- `payment_success`
- subscription events:
  - `subscription_created`
  - `subscription_renewed`
  - `subscription_canceled`
  - `subscription_deleted`

## Events To Consume

### 1. `credits_granted`

This should be the primary event for AnyCap top-up completion.

Key payload fields from upstream:

- `type`
- `user_id`
- `biz_id`
- `timestamp`
- `data.credit_reward.id`
- `data.credit_reward.source_type`
- `data.credit_reward.source_id`
- `data.credit_reward.credit_cents`
- `data.credit_reward.status`
- `data.receiver_user_id`
- `data.credits_amount`
- `data.product_id`

Recommended idempotency key:

- `credits_granted:biz:{biz_id}:reward:{credit_reward.id}`

### 2. `payment_failed`

Useful for operational diagnosis and future user-facing failure states.

Key payload fields from upstream:

- `type`
- `user_id`
- `biz_id`
- `timestamp`
- `data.session_id`
- `data.amount`
- `data.currency`
- `data.payer_user_id`
- `data.receiver_user_id`

Recommended idempotency key:

- `payment_failed:biz:{biz_id}:session:{session_id}`

## What AnyCap Should Do On Receipt

### `credits_granted`

AnyCap should:

1. validate the event envelope
2. ensure the event belongs to the configured business
3. deduplicate using the upstream business key
4. persist the raw event and processing result
5. mark it as processed

AnyCap should **not**:

- call Credit to grant credits again
- poll Payment for confirmation

### `payment_failed`

AnyCap should:

1. validate the event
2. deduplicate
3. persist it for audit/debugging
4. mark processing outcome

AnyCap can later use this data to enrich billing status UX, but phase 1 does not need to expose failed payments in the dashboard immediately.

## Storage Strategy

### Recommendation: phase 1 only stores an event inbox / receipt table

Because Billing already reads top-up history from Credit, the minimal useful local storage is:

- a durable inbox table for consumed payment events
- enough fields for idempotency, audit, and replay/debugging

This avoids introducing a duplicate source of truth for balances or top-up history.

### Proposed table

`payment_event_receipts`

Suggested columns:

- `id BIGSERIAL PRIMARY KEY`
- `event_key TEXT NOT NULL UNIQUE`
- `event_type TEXT NOT NULL`
- `biz_id TEXT NOT NULL`
- `user_id BIGINT`
- `payload JSONB NOT NULL`
- `status TEXT NOT NULL`
  - `received`
  - `processed`
  - `ignored`
  - `failed`
- `error_message TEXT`
- `processed_at TIMESTAMPTZ`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

Optional helper columns for easier querying:

- `source_type TEXT`
- `source_id TEXT`
- `reward_id TEXT`
- `session_id TEXT`

### Why no local billing table in phase 1

Current AnyCap billing UI already depends on Credit transactions for top-up visibility:

- `internal/application/system/service.go`
- `internal/infrastructure/credit/client_http.go`

Duplicating successful top-up rows locally would create a second ledger without immediate product benefit.

## Consumer Placement

### Proposed new infrastructure package

Create a dedicated MQ consumer implementation under:

- `internal/infrastructure/paymentevents/`

Suggested files:

- `consumer.go`
- `types.go`
- `decoder.go`
- `repo.go`
- `consumer_test.go`

### Why this package

- it keeps RocketMQ-specific logic in infrastructure
- it avoids overloading the existing HTTP payment adapter
- it isolates event transport concerns from application services

## Application Layer Integration

Add a small application service responsible for event processing decisions, for example:

- `internal/application/billingevents/service.go`

Responsibilities:

- validate supported event types
- derive idempotency keys
- decide whether event should be processed or ignored
- persist processing result via repository port

This keeps the consumer thin and testable.

## Domain Additions

### Proposed model

Add a new domain model for inbound payment events, for example:

- `model.PaymentInboundEvent`

Suggested fields:

- `Type`
- `BizID`
- `UserID`
- `Timestamp`
- `EventKey`
- `Payload`

### Proposed repository port

Add a repository port for the event inbox, for example:

- `port.PaymentEventReceiptRepo`

Suggested methods:

- `CreateIfAbsent(...)`
- `MarkProcessed(...)`
- `MarkIgnored(...)`
- `MarkFailed(...)`
- `GetByEventKey(...)`

## MQ Configuration

AnyCap currently has Payment HTTP config:

- `ANYCAP_PAYMENT_BASE_URL`
- `ANYCAP_PAYMENT_BIZ_TOKEN`

For MQ, add a separate config group.

### Proposed env vars

- `ANYCAP_PAYMENT_EVENTS_ENABLED`
- `ANYCAP_PAYMENT_EVENTS_ENDPOINT`
- `ANYCAP_PAYMENT_EVENTS_TOPIC`
- `ANYCAP_PAYMENT_EVENTS_ACCESS_KEY`
- `ANYCAP_PAYMENT_EVENTS_SECRET_KEY`
- `ANYCAP_PAYMENT_EVENTS_CONSUMER_GROUP`
- `ANYCAP_PAYMENT_EVENTS_BIZ_ID`

Optional:

- `ANYCAP_PAYMENT_EVENTS_TAGS`

### Notes

- `ANYCAP_PAYMENT_EVENTS_TOPIC` should be set explicitly instead of assuming `payment_events` or `payment-events`
- `ANYCAP_PAYMENT_EVENTS_BIZ_ID` is recommended so AnyCap can ignore events for other businesses when sharing a topic

## Consumer Behavior

### Subscription

The consumer should subscribe to:

- topic: configured via env
- tags:
  - `credits_granted`
  - `payment_failed`

### Processing flow

For each MQ message:

1. decode JSON event envelope
2. verify `type` is supported
3. verify `biz_id` matches configured business
4. compute event key
5. insert inbox row if absent
6. if duplicate, ack and stop
7. process business logic
8. mark row as `processed` or `ignored`
9. on failure, mark `failed` and return retry behavior according to consumer policy

## Idempotency Strategy

Idempotency must be based on upstream business identifiers, not RocketMQ delivery metadata.

Recommended keys:

- `credits_granted`: `credits_granted:biz:{biz_id}:reward:{credit_reward.id}`
- `payment_failed`: `payment_failed:biz:{biz_id}:session:{session_id}`

Do not use only:

- message id
- timestamp
- raw payload hash

These are weaker than upstream domain identifiers.

## UI / Product Impact

### What changes immediately after MQ phase 1

No major user-facing UI change is required.

Billing can continue to render:

- balance from Credit
- top-up visibility from Credit transactions

### What phase 1 enables

- reliable callback handling aligned with Payment platform contract
- audit trail for top-up callbacks
- future support for:
  - failed payment visibility
  - subscription activation
  - operational replay
  - support tooling

## Why `credits_granted` Is Preferred Over `payment_success`

For AnyCap top-up completion, `credits_granted` is the safest event because it means:

- payment has already succeeded upstream
- credits have actually been granted
- the event is closest to what the user cares about: balance impact

`payment_success` is still useful, but it is a weaker signal for “user balance is ready”.

## Implementation Notes

### Go dependency

AnyCap currently does not include RocketMQ consumer dependencies. A new dependency will be required, likely aligning with the same client family used by Payment:

- `github.com/apache/rocketmq-clients/golang/v5`

### Startup wiring

The consumer worker should be initialized in:

- `internal/app/bootstrap.go`

Similar to existing background workers:

- `kvsync`
- `usage sync`

The worker should only start when MQ is explicitly enabled and fully configured.

## Risks

### 1. Topic name mismatch

The human-facing skill says `payment_events`, while the local Payment code defaults to `payment-events`.

Mitigation:

- require explicit topic config in AnyCap
- verify real deployed Payment env before rollout

### 2. Double-granting credits

If AnyCap mistakenly calls Credit on `credits_granted`, users may receive duplicate credits.

Mitigation:

- phase 1 must treat Payment as the credit-grant authority
- AnyCap only records/observes the event

### 3. Shared topic noise

If multiple businesses share one topic, AnyCap may receive events not belonging to it.

Mitigation:

- filter by configured `biz_id`

## Recommended Rollout

### Step 1

Add config parsing and consumer wiring with the worker disabled by default.

### Step 2

Add inbox table + repository + event decoding + idempotency.

### Step 3

Consume only `credits_granted` and mark processed events.

### Step 4

Add `payment_failed` handling.

### Step 5

Decide whether phase 2 should expose failed payment state in Billing UI or keep it operational-only.

## Summary

For AnyCap’s next payment phase, the right minimal design is:

- consume RocketMQ instead of polling Payment
- treat Payment as the authority for credit granting
- use `credits_granted` as the top-up completion signal
- store consumed events in a local idempotent inbox table
- keep Billing UI reading balances and top-up history from Credit for now

This gives AnyCap a correct payment callback foundation without prematurely building a duplicate billing ledger.
