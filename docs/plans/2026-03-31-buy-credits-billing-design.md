# Buy Credits and Billing Dashboard Design

Date: 2026-03-31

## Problem

The dashboard already has a basic Billing page, but it currently behaves like a read-only balance and transaction view. The product now needs a clear purchase entry for credits without introducing subscription strategy, pricing-table complexity, or a dashboard visual style that diverges from the existing shell.

The immediate goal is to support a simple user journey:

1. understand current credit balance
2. choose a credit pack
3. start checkout
4. return to Billing and see updated state or feedback

## Scope

This design covers:

- a new dashboard page for buying credits
- the relationship between the new purchase page and the existing Billing page
- server API boundaries needed for one-time credit purchase
- payment-service integration for one-time checkout only

This design does not cover:

- subscription strategy
- subscription UI
- plan comparison across recurring tiers
- invoice portal design beyond a placeholder action entry
- MQ consumer implementation details

## Product Decisions

### D1: First release is `Buy credits`, not a generic `Pricing` page

The new page should be explicitly framed as a one-time credit purchase surface. The first release should use naming such as `Buy credits` or `Top up`, not `Pricing`, because the product does not yet have a stable subscription strategy and should not imply one.

Recommendation: use `Buy credits` in the UI because it is clearer than `Top up` for first-time users.

### D2: Billing remains the account state page

The existing Billing page should remain the place where users inspect:

- current credit balance
- recent billing-related activity
- purchase success or failure feedback
- future account billing controls

It should not become the primary pack-selection surface. The purchase action should point users from Billing to the new `Buy credits` page.

### D3: The first purchase flow supports one-time credit packs only

The purchase surface should initially present a small number of fixed credit packs. No subscription cards, monthly/yearly toggle, or recurring-plan language should appear in the first release.

Recommended card set:

- 3 packs for MVP
- optionally 4 packs if a clear "best value" tier is needed

The pack definitions should be server-owned, not frontend-hardcoded.

### D4: Web talks only to AnyCap Server

The web app should never call the Payment Service directly. The flow should be:

1. Web requests pack catalog from AnyCap Server
2. Web asks AnyCap Server to create checkout for a selected pack
3. AnyCap Server calls Payment Service with the mapped `price_id`
4. Web redirects the user to the returned checkout URL

This keeps `price_id`, payment endpoint, and `X-Biz-Token` fully server-side.

### D5: Payment success is event-driven, not polled from the browser

The frontend may show return-state feedback such as `checkout=success`, but that is only user-facing feedback. Actual balance updates must come from the system-of-record flow:

1. Stripe completes payment
2. Payment Service handles webhook
3. Payment Service emits `payment_events`
4. AnyCap consumes the event and updates internal state / credit state
5. Billing reflects the new balance

The browser should not poll Payment Service to verify completion.

### D6: Dashboard navigation should separate purchase from account management

The dashboard navigation should include a dedicated purchase entry. Recommended structure for this phase:

- Overview
- Buy credits
- Logs
- Billing

`Buy credits` is action-oriented. `Billing` is state-oriented.

## Page Responsibilities

### Buy credits

Purpose: help the user buy more credits with minimal friction.

Primary content:

- page title and short explanation
- current balance summary
- grid of credit pack cards
- lightweight explanation of how credits work

Primary actions:

- select a pack
- start checkout

### Billing

Purpose: help the user understand their current account payment state.

Primary content:

- current balance
- recent billing activity
- return-state banners from checkout
- shortcut actions

Primary actions:

- navigate to `Buy credits`
- later: open billing portal, view receipts, manage subscriptions

## API Boundaries

### `GET /v1/pricing/credit-packs`

Purpose: return the pack catalog used by the `Buy credits` page.

Response shape should be normalized for dashboard use and must not expose raw payment product complexity.

Suggested response:

```json
{
  "packs": [
    {
      "id": "credits_500",
      "name": "500 credits",
      "description": "Good for trying a few runs",
      "price_cent": 500,
      "currency": "USD",
      "credits": 500,
      "featured": false,
      "badge": ""
    },
    {
      "id": "credits_2000",
      "name": "2,000 credits",
      "description": "Best for regular use",
      "price_cent": 1800,
      "currency": "USD",
      "credits": 2000,
      "featured": true,
      "badge": "Best value"
    }
  ]
}
```

### `POST /v1/billing/checkout`

Purpose: create a one-time order checkout session for the selected credit pack.

Suggested request:

```json
{
  "pack_id": "credits_2000",
  "quantity": 1,
  "success_url": "https://anycap.ai/dashboard/billing?checkout=success",
  "cancel_url": "https://anycap.ai/dashboard/buy-credits?checkout=cancel"
}
```

Suggested response:

```json
{
  "checkout_url": "https://checkout.stripe.com/...",
  "session_type": "order"
}
```

### `GET /v1/billing/summary`

Purpose: support the Billing header state.

This endpoint can be introduced as a follow-up to avoid overloading existing `GET /v1/credits/balance`.

Suggested response:

```json
{
  "balance": {
    "available": 120,
    "currency": "credit",
    "credit_cent_balance": 12000
  },
  "last_purchase": {
    "status": "paid",
    "title": "2,000 credits",
    "occurred_at": "2026-03-31T10:00:00Z"
  },
  "actions": {
    "can_buy_credits": true
  }
}
```

## Payment Integration Mapping

### D7: Server-owned `pack_id -> price_id` mapping

The frontend should use a stable AnyCap `pack_id`. The server should map that to Payment Service `price_id`.

Suggested internal mapping shape:

```json
{
  "credits_500": {
    "price_id": "price_xxx_500",
    "kind": "topup"
  },
  "credits_2000": {
    "price_id": "price_xxx_2000",
    "kind": "topup"
  }
}
```

For MVP, this mapping can live in server configuration. A future enhancement may derive it from Payment products while still preserving a stable AnyCap-facing `pack_id`.

### D8: Payment Service usage is limited to order checkout for MVP

AnyCap Server should use the Payment Service only for the one-time purchase path in this phase:

- `GET /api/v1/products` as optional catalog source
- `POST /api/v1/order/checkout` for checkout creation

The following APIs are explicitly out of scope for this phase:

- `POST /api/v1/subscription/checkout`
- `POST /api/v1/subscription/list`
- `POST /api/v1/subscription/cancel`
- `POST /api/v1/billing/stripe_customer_portal` as a user-facing feature

## User Flows

### Flow A: Purchase from Billing

1. User opens Billing
2. User sees low balance
3. User clicks `Buy more credits`
4. User lands on `Buy credits`
5. User selects a pack and starts checkout
6. User returns to Billing with `checkout=success` or `checkout=cancel`
7. Billing shows a banner and refreshed account state

### Flow B: Purchase directly from nav

1. User opens `Buy credits` from dashboard navigation
2. User reviews packs
3. User starts checkout
4. User returns to Billing for status and balance confirmation

## Copy Guidelines

The first release should use plain, operational language.

Prefer:

- `Buy credits`
- `Current balance`
- `Best value`
- `One-time purchase`
- `No automatic renewal`

Avoid:

- `Plan`
- `Subscription`
- `Monthly`
- `Annually`
- `Upgrade`

These terms can be introduced later once recurring products are defined.

## Rollout Phases

### Phase 1: Purchase surface

- Add `Buy credits` page
- Add server pack catalog endpoint
- Add one-time checkout endpoint

### Phase 2: Billing integration

- Add Billing CTA to `Buy credits`
- Add return-state banner on Billing
- Add improved Billing summary surface

### Phase 3: Post-purchase polish

- Improve purchase history labeling
- Add receipt links if available
- Add portal or invoice entry points when the backend supports them

## Success Criteria

The design is successful when:

- users can understand they are buying one-time credits
- the new page feels native to the existing dashboard
- Billing and purchase responsibilities are clearly separated
- server owns payment mapping and secrets
- the first iteration can ship without subscription policy work
