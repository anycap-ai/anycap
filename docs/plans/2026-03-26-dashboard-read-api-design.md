# Dashboard Read API Design

> Date: 2026-03-26
> Status: Draft
> Scope: Server-side read-only APIs for dashboard user info, credit balance, and unified activity timeline
> References: [2026-03-25-dashboard-payment-credit-gap.md](2026-03-25-dashboard-payment-credit-gap.md), [2026-03-25-anycap-user-credit-integration-plan.md](2026-03-25-anycap-user-credit-integration-plan.md), [2026-03-26-web-auth-flows.md](2026-03-26-web-auth-flows.md)

## Goal

Provide a minimal set of protected server APIs so the dashboard can show:

1. current user information
2. current credit balance
3. a unified activity timeline including AnyCap operations and credit-related records

This phase is intentionally **read-only**. It does not include payment, top-up, admin actions,
or complex analytics.

---

## Dashboard Display Priorities

The dashboard should be implemented in phases so product value appears quickly without
waiting for payment or analytics systems.

### P0 — First useful dashboard

These are the first items that should be visible:

1. user information card
2. credit balance card
3. recent unified activity timeline

This directly maps to the initial server API set:

- `GET /v1/me`
- `GET /v1/credits/balance`
- `GET /v1/logs`

### P1 — High-value summaries

After P0 is stable, add lightweight summary blocks derived from the same data:

4. recent capability usage summary
5. recent error summary

These can initially be computed from recent `call_logs` without introducing separate
analytics infrastructure.

### P2 — Nice-to-have account/billing context

Later additions can include:

6. recent credit inflow / outflow summary
7. recent login / session info summary

These are useful, but not required for the first dashboard release.

---

## Design Principles

- **Server remains the single backend gateway.** Dashboard calls AnyCap Server only.
- **Keep the first iteration small.** Prefer a small number of stable, read-only APIs over a broad dashboard surface.
- **Unify logs at the server layer.** Dashboard should receive one timeline format instead of merging multiple sources client-side.
- **Reuse existing integrations.** Credit balance and credit transaction data should come from the existing Credit Service integration; operation logs should come from AnyCap `call_logs`.
- **Authenticated user only.** All endpoints are protected and operate on the current authenticated user from API key / session context.

---

## Recommended API Set

The recommended MVP uses three protected endpoints, plus one convenience summary endpoint
for dashboard first paint:

1. `GET /v1/me`
2. `GET /v1/credits/balance`
3. `GET /v1/logs`
4. `GET /v1/dashboard/summary`

The three base endpoints remain the source of truth because:

- it maps directly to the three product needs
- it keeps payloads simple and independently evolvable
- it is easier for dashboard developers to consume incrementally

The summary endpoint is an optimization layer for dashboard first screen load. It should
be derived from the same underlying reads, not introduce separate persistence or business
rules.

---

## Endpoint 1: `GET /v1/me`

### Purpose

Return the current local AnyCap user profile for dashboard display.

### Auth

- Protected
- Uses current authenticated principal

### Data Source

- `users` table via local user repository

### Response

```json
{
  "id": "2000000000",
  "email": "user@example.com",
  "name": "Sichen Zhao",
  "avatar_url": "https://...",
  "status": "active",
  "created_at": "2026-03-25T10:00:00Z",
  "updated_at": "2026-03-26T09:30:00Z"
}
```

### Notes

- This endpoint returns the AnyCap local user, not the raw Auth0 userinfo payload.
- `avatar_url` should come from the normalized local user model if present.
- Future profile fields can be added without changing endpoint shape.

---

## Endpoint 2: `GET /v1/credits/balance`

### Purpose

Return the current user's available credit balance for dashboard display.

### Auth

- Protected
- Uses current authenticated principal

### Data Source

- Credit Service
- Existing `GetBalance` integration

### Response

```json
{
  "available": 12,
  "currency": "credit",
  "credit_cent_balance": 1200
}
```

### Field Semantics

- `available`
  - integer credit units already used inside AnyCap
- `currency`
  - currently always `"credit"`
- `credit_cent_balance`
  - raw cent balance from Credit Service
  - included for dashboard precision and future formatting flexibility

### Notes

- This endpoint is a read-only projection over Credit Service balance.
- It should not contain billing, package, or payment metadata in this phase.

---

## Endpoint 3: `GET /v1/logs`

### Purpose

Return a unified timeline for dashboard display. The timeline should combine:

1. AnyCap capability operation logs
2. Credit transaction logs

### Auth

- Protected
- Uses current authenticated principal

### Query Parameters

Initial MVP:

- `limit`
  - optional
  - default: `20`
  - max: `100`
- `cursor`
  - optional
  - reserved for future cursor pagination

For the first implementation, offset-based or simple top-N fetch is acceptable as long as the
response shape leaves room for future cursor pagination.

### Data Sources

#### A. AnyCap operation logs

- source: local `call_logs`
- examples:
  - image generation
  - future capability invocations

#### B. Credit transaction logs

- source: Credit Service `transaction/list`
- examples:
  - consume
  - signup reward
  - promotional grants
  - future purchases / subscription grants

### Response Shape

```json
{
  "items": [
    {
      "type": "capability_call",
      "occurred_at": "2026-03-26T10:30:00Z",
      "request_id": "req_123",
      "capability": "image.generate",
      "model": "flux-1.1-pro",
      "status": "success",
      "credit_cost": 1
    },
    {
      "type": "credit_transaction",
      "occurred_at": "2026-03-26T10:29:30Z",
      "transaction_type": "CONSUME",
      "credit_cent_amount": 100,
      "description": "image.generate | model:flux-1.1-pro",
      "source_id": "image.generate-req_123"
    }
  ],
  "next_cursor": ""
}
```

### Timeline Item Types

#### `capability_call`

Fields:

- `type`
- `occurred_at`
- `request_id`
- `capability`
- `model`
- `status`
- `credit_cost`
- `error_code` (optional)

#### `credit_transaction`

Fields:

- `type`
- `occurred_at`
- `transaction_type`
- `credit_cent_amount`
- `description` (optional)
- `source_id` (optional)
- `credit_batch_type` (optional, future-friendly)

### Sorting

- timeline is sorted by `occurred_at` descending
- server is responsible for merging the two sources

### Why unify on the server

- dashboard does not need source-specific merge logic
- operation and billing events appear in one consistent user timeline
- future event types can be added without changing the front-end merge model

---

## Error Handling

### `GET /v1/me`

- `401 AUTH_INVALID`
  - not authenticated
- `500 INTERNAL`
  - local user lookup failure

### `GET /v1/credits/balance`

- `401 AUTH_INVALID`
  - not authenticated
- `502` or mapped upstream error
  - Credit Service temporarily unavailable

### `GET /v1/logs`

- `401 AUTH_INVALID`
  - not authenticated
- `502` or mapped upstream error
  - Credit Service transaction list unavailable
- local `call_logs` query failure should surface as internal error

### Partial failure policy for `/v1/logs`

Recommended MVP policy:

- if one source fails and the other succeeds, **fail closed** for now
- return an error instead of returning a partial timeline

Reason:

- easier semantics for the first dashboard release
- avoids silently hiding billing or audit events

Future versions can revisit partial success if needed.

---

## Repository / Service Changes Required

The expected server work is:

### User profile

- add local user lookup by `user_id`

### Credit balance

- expose current `GetBalance` through a protected HTTP endpoint

### Credit transaction list

- extend credit client abstraction to support transaction listing
- implement the HTTP adapter against Credit Service
- provide a stub implementation for non-real-credit environments

### Call logs

- extend local call log repository with read/list capability
- fetch the latest N logs for the current user

### System/dashboard application layer

- add read-only service methods for:
  - current user
  - balance
  - merged timeline

---

## Suggested HTTP Contracts

### `GET /v1/me`

Envelope:

```json
{
  "status": "success",
  "data": {
    "id": "2000000000",
    "email": "user@example.com",
    "name": "Sichen Zhao",
    "avatar_url": "https://...",
    "status": "active"
  }
}
```

### `GET /v1/dashboard/summary`

Envelope:

```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "2000000000",
      "email": "user@example.com",
      "name": "Sichen Zhao",
      "avatar_url": "https://...",
      "status": "active"
    },
    "balance": {
      "available": 12,
      "currency": "credit",
      "credit_cent_balance": 1200
    },
    "recent_activity": [
      {
        "type": "capability_call",
        "occurred_at": "2026-03-26T10:30:00Z",
        "request_id": "req_123",
        "capability": "image.generate",
        "status": "success",
        "credit_cost": 1
      }
    ],
    "usage_summary": {
      "last_capability": "image.generate",
      "last_model": "flux-1.1-pro",
      "last_occurred_at": "2026-03-26T10:30:00Z"
    },
    "error_summary": {
      "last_error_capability": "image.generate",
      "last_error_code": "UPSTREAM_TIMEOUT",
      "last_error_occurred_at": "2026-03-25T08:00:00Z"
    }
  }
}
```

Purpose:

- allow `/dashboard` to render user card, balance card, recent activity, and lightweight
  usage/error summary from one request

Derivation rules:

- `user`
  - same payload shape as `GET /v1/me`
- `balance`
  - same payload shape as `GET /v1/credits/balance`
- `recent_activity`
  - latest timeline items, default top `5`
- `usage_summary`
  - derived from the most recent `capability_call` item
- `error_summary`
  - derived from the most recent failed `capability_call` item
  - omitted when no recent error exists

Notes:

- this endpoint is a convenience projection
- it should reuse the same application-layer reads as the base endpoints
- the base endpoints remain stable integration points for non-dashboard clients

### `GET /v1/credits/balance`

Envelope:

```json
{
  "status": "success",
  "data": {
    "available": 12,
    "currency": "credit",
    "credit_cent_balance": 1200
  }
}
```

### `GET /v1/logs?limit=20`

Envelope:

```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "type": "capability_call",
        "occurred_at": "2026-03-26T10:30:00Z",
        "request_id": "req_123",
        "capability": "image.generate",
        "status": "success",
        "credit_cost": 1
      }
    ],
    "next_cursor": ""
  }
}
```

---

## Dashboard Consumption Guidance

Dashboard developers can use the APIs like this:

- `/dashboard`
  - prefer `GET /v1/dashboard/summary` for first screen load
  - alternatively compose from `GET /v1/me`, `GET /v1/credits/balance`, and `GET /v1/logs`
- `/logs`
  - render the unified timeline from `GET /v1/logs`
- `/usage`
  - can temporarily reuse `GET /v1/logs` until dedicated aggregation exists
- `/billing`
  - can temporarily reuse `GET /v1/credits/balance`
  - may later show credit transaction items from `GET /v1/logs`

This keeps dashboard development moving without waiting for payment or analytics work.

---

## Out of Scope for This Phase

- payment methods
- invoices
- subscription state
- top-up actions
- admin mutation APIs
- complex filters
- chart aggregation / trend endpoints
- export APIs

---

## Recommendation

Implement the three base read-only endpoints first, then add the dashboard convenience
summary endpoint:

1. `GET /v1/me`
2. `GET /v1/credits/balance`
3. `GET /v1/logs`
4. `GET /v1/dashboard/summary`

This keeps the core API surface explicit while giving dashboard first paint a smaller
number of requests.
