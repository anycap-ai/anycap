# Buy Credits and Billing Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a dashboard-native `Buy credits` page, wire one-time checkout creation through AnyCap Server, and extend Billing so users can move cleanly between purchasing credits and reviewing purchase state.

**Architecture:** Keep the web app calling AnyCap Server only. Add a server-owned credit-pack catalog and one-time checkout action that maps stable `pack_id` values to Payment Service `price_id` values. Reuse the existing dashboard visual system so the new purchase surface and Billing remain visually consistent.

**Tech Stack:** Go, Hertz, existing service/bootstrap wiring, Next.js App Router, SWR hooks, dashboard Tailwind styling, Payment Service HTTP integration behind server-owned configuration.

**Design References:**
- `docs/plans/2026-03-31-buy-credits-billing-design.md`
- `docs/plans/2026-03-31-buy-credits-billing-ui-design.md`

---

### Task 1: Add domain models and port shape for credit-pack catalog and checkout

**Files:**
- Modify: `internal/domain/model/system.go`
- Modify: `internal/domain/port/payment.go`
- Modify: `internal/application/system/service_test.go`

**Step 1: Write the failing tests**

- Add tests covering:
  - list available credit packs for the current product
  - create one-time checkout from a stable `pack_id`
  - reject unknown `pack_id`

**Step 2: Run targeted tests to verify the gap**

Run:

```bash
go test ./internal/application/system -run 'Test.*Billing|Test.*CreditPack|Test.*Checkout' -v
```

Expected: compile failures or missing methods for pack catalog and checkout creation.

**Step 3: Add minimal domain types and interface changes**

- Add model types for:
  - `CreditPack`
  - `CreditPackListResult`
  - `CreateCheckoutInput`
  - `CreateCheckoutResult`
- Extend `PaymentClient` with the minimum method needed for one-time checkout using `price_id`

**Step 4: Re-run the targeted tests**

Run:

```bash
go test ./internal/application/system -run 'Test.*Billing|Test.*CreditPack|Test.*Checkout' -v
```

Expected: tests compile further and fail at service/bootstrap/infrastructure boundaries.

**Step 5: Commit**

```bash
git add internal/domain/model/system.go internal/domain/port/payment.go internal/application/system/service_test.go
git commit -m "feat: add credit pack checkout domain models"
```

### Task 2: Add server configuration for `pack_id -> price_id` mapping

**Files:**
- Modify: `internal/config/*.go`
- Modify: `internal/app/bootstrap.go`
- Test: `internal/config/*.go`

**Step 1: Write failing configuration tests**

- Add coverage for:
  - loading pack catalog config from environment or config file
  - validating required fields such as `pack_id`, `price_id`, `credits`, `price_cent`

**Step 2: Run the targeted tests**

Run:

```bash
go test ./internal/config -v
```

Expected: missing config fields or loader behavior.

**Step 3: Implement minimal config support**

- Add config shape for a list/map of credit packs
- Ensure bootstrap can inject that catalog into the system/payment path
- Keep endpoint and secrets server-side only

**Step 4: Re-run the targeted tests**

Run:

```bash
go test ./internal/config -v
```

Expected: PASS.

**Step 5: Commit**

```bash
git add internal/config internal/app/bootstrap.go
git commit -m "feat: add credit pack payment config"
```

### Task 3: Implement Payment client path for one-time order checkout

**Files:**
- Modify: `internal/infrastructure/...` payment-related adapter files
- Modify: `internal/application/system/service.go`
- Modify: `internal/application/system/service_test.go`

**Step 1: Write failing service tests**

- Cover:
  - service maps `pack_id` to `price_id`
  - service passes current user ID to Payment client
  - service returns checkout URL for redirect
  - service handles upstream payment errors cleanly

**Step 2: Run targeted tests**

Run:

```bash
go test ./internal/application/system -run 'Test.*Checkout|Test.*CreditPack' -v
```

Expected: failures from missing integration behavior.

**Step 3: Implement minimal payment path**

- Add or extend the payment HTTP adapter
- Call Payment `order/checkout`
- Keep Payment-specific headers and endpoint handling in infrastructure, not in handlers
- Reuse the existing app/service pattern

**Step 4: Re-run the targeted tests**

Run:

```bash
go test ./internal/application/system -run 'Test.*Checkout|Test.*CreditPack' -v
```

Expected: PASS.

**Step 5: Commit**

```bash
git add internal/application/system/service.go internal/application/system/service_test.go internal/infrastructure
git commit -m "feat: wire one-time payment checkout"
```

### Task 4: Add protected server endpoints for credit packs and checkout

**Files:**
- Modify: `internal/transport/http/handlers/system/handler.go`
- Modify: `internal/transport/http/router_test.go`
- Modify: relevant DTO files under `internal/transport/http/`

**Step 1: Write failing HTTP tests**

- Add route coverage for:
  - `GET /v1/pricing/credit-packs`
  - `POST /v1/billing/checkout`
- Cover auth required, happy path, unknown pack, and upstream failure mapping

**Step 2: Run targeted router tests**

Run:

```bash
go test ./internal/transport/http -run 'Test.*credit.*pack|Test.*billing.*checkout|TestProtectedRoutes' -v
```

Expected: missing handlers/routes.

**Step 3: Implement minimal handler behavior**

- Register new protected routes
- Parse request body
- Call system service
- Return normalized DTOs only

**Step 4: Re-run the targeted router tests**

Run:

```bash
go test ./internal/transport/http -run 'Test.*credit.*pack|Test.*billing.*checkout|TestProtectedRoutes' -v
```

Expected: PASS.

**Step 5: Commit**

```bash
git add internal/transport/http/handlers/system/handler.go internal/transport/http/router_test.go internal/transport/http
git commit -m "feat: expose credit pack and checkout endpoints"
```

### Task 5: Add web API types and hooks for Buy credits

**Files:**
- Modify: `web/src/lib/api/types.ts`
- Modify: `web/src/lib/api/hooks.ts`
- Modify: `web/src/lib/api/client.ts` if needed

**Step 1: Write the failing UI-facing expectations**

- Add or update component-level tests if available, or define the expected shapes in TODO comments/tests for:
  - credit pack list
  - checkout mutation result
  - billing return-state banner inputs

**Step 2: Run the narrowest relevant frontend checks**

Run:

```bash
cd web && pnpm test -- --runInBand
```

Expected: failures or skipped coverage depending on current test setup.

**Step 3: Implement minimal hook/type support**

- Add `CreditPack` types
- Add hook for credit-pack fetch
- Add async function for checkout creation

**Step 4: Re-run the frontend checks**

Run:

```bash
cd web && pnpm test -- --runInBand
```

Expected: PASS or the same unrelated skips as before.

**Step 5: Commit**

```bash
git add web/src/lib/api/types.ts web/src/lib/api/hooks.ts web/src/lib/api/client.ts
git commit -m "feat: add buy credits api hooks"
```

### Task 6: Add dashboard navigation entry and build the Buy credits page

**Files:**
- Modify: `web/src/components/dashboard/DashboardShell.tsx`
- Create: `web/src/app/dashboard/buy-credits/page.tsx`
- Create: any small local components only if needed under `web/src/components/dashboard/`

**Step 1: Write the failing page/component tests**

- Cover:
  - navigation entry appears
  - Buy credits page renders pack cards
  - featured pack styling is distinct but dashboard-consistent
  - loading and empty states render without layout shift

**Step 2: Run the narrowest frontend checks**

Run:

```bash
cd web && pnpm test -- --runInBand
```

Expected: failures from missing page/components.

**Step 3: Implement the Buy credits page**

- Follow the UI draft exactly:
  - header
  - balance summary strip
  - pack card grid
  - credits explainer block
- Keep colors, border radius, and shadows aligned with dashboard tokens
- Ensure focus states and touch targets meet the UI draft requirements

**Step 4: Re-run the frontend checks**

Run:

```bash
cd web && pnpm test -- --runInBand
```

Expected: PASS or only unrelated failures outside this scope.

**Step 5: Commit**

```bash
git add web/src/components/dashboard/DashboardShell.tsx web/src/app/dashboard/buy-credits/page.tsx web/src/components/dashboard
git commit -m "feat: add dashboard buy credits page"
```

### Task 7: Extend Billing with purchase CTAs and return-state feedback

**Files:**
- Modify: `web/src/app/dashboard/billing/page.tsx`
- Modify: any shared UI helpers used by Billing

**Step 1: Write failing page tests**

- Cover:
  - Billing shows `Buy more credits` action
  - Billing reads query-state banner such as `checkout=success`
  - summary cards remain responsive
  - transaction table continues to render existing data

**Step 2: Run the narrowest frontend checks**

Run:

```bash
cd web && pnpm test -- --runInBand
```

Expected: failures from missing CTA/banner/summary treatment.

**Step 3: Implement Billing enhancements**

- Add return-state banner
- Expand top section into summary/action cards
- Link CTAs to `/dashboard/buy-credits`
- Keep the existing transaction table style intact

**Step 4: Re-run the frontend checks**

Run:

```bash
cd web && pnpm test -- --runInBand
```

Expected: PASS or only unrelated failures outside this scope.

**Step 5: Commit**

```bash
git add web/src/app/dashboard/billing/page.tsx web/src/components/dashboard
git commit -m "feat: extend billing with buy credits flow"
```

### Task 8: Verify end-to-end behavior and document configuration

**Files:**
- Modify: `configs/` examples as needed
- Modify: relevant docs under `docs/`

**Step 1: Add or update documentation/tests for operator setup**

- Document:
  - payment endpoint env
  - biz token env
  - credit pack mapping config
  - success/cancel URL expectations

**Step 2: Run final verification**

Run:

```bash
go test ./internal/application/system ./internal/transport/http -v
cd web && pnpm test -- --runInBand
```

Expected: PASS for touched backend tests; frontend checks pass or clearly identify unrelated pre-existing failures.

**Step 3: Manual verification**

Run:

```bash
make dev
cd web && pnpm dev
```

Check:

- `/dashboard/buy-credits` matches the UI draft
- pack CTA creates a redirect URL
- Billing shows success/cancel banner on return
- layout works on desktop and mobile widths

**Step 4: Commit**

```bash
git add configs docs
git commit -m "docs: add buy credits billing setup notes"
```
