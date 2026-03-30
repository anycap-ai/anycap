# AnyCap MVP Gap Review

> Date: 2026-03-25
> Status: Active
> Scope: Review current MVP readiness after `feat_setup` rebase and mainline integration

## 1. Summary

Current status is:

- `server` has a usable runtime skeleton for `stub/dev/prod/integration`
- `PostgreSQL` and `Redis` are wired into runtime for API key auth, call logs, rate limit, and migrations
- `CLI` and `server` login contract is now converging on `Server -> API Key` delivery
- `Auth0` authorize URL and authorization-code exchange have a real adapter path
- `catalog` and `capabilities` paths are closer to real infrastructure than `image generate`

However, the repository is **not yet at a fully usable end-to-end MVP** if the intended user flow is:

1. `anycap login`
2. `anycap image models`
3. `anycap image generate --prompt "..."`

The main blockers are now concentrated in **full Auth0 end-to-end completion**, **real image generation**, and **infra health visibility**.

## 2. What Is Already Usable

### 2.1 Server runtime foundation

The server can run with:

- `stub`
- `dev`
- `prod`
- `integration`

Implemented runtime capabilities include:

- API key auth middleware
- PostgreSQL-backed API key repository
- PostgreSQL-backed call log repository
- Redis-backed rate limiter
- PostgreSQL migration runner
- structured HTTP handlers and router composition

### 2.2 Catalog path

Model catalog is partially connected to real NexusHub platform metadata:

- `NEXUSHUB_BASE_URL` + `NEXUSHUB_TOKEN` can drive real model discovery
- `/v1/image/models`
- `/v1/image/models/:name/schema`

This path is backed by `CatalogRepository`, not the image generation runtime itself.

### 2.3 Capabilities path

The following server capabilities can use real infrastructure when configured:

- `POST /v1/capabilities/presign`
  - backed by real S3-compatible object storage client
- `POST /v1/capabilities/image/read`
- `POST /v1/capabilities/video/read`
  - backed by real Agent Platform client

This means:

- `anycap image read --url ...`
- `anycap image read --file ...`
- `anycap video read --url ...`
- `anycap video read --file ...`

are closer to real MVP capability than `image generate`, assuming upstream services are configured and reachable.

### 2.4 CLI credential injection

The CLI can already:

- load credentials from env / keychain / fallback file
- automatically send `Authorization: Bearer ...`
- store API key credentials
- store OAuth credentials
- attempt refresh on expired OAuth access tokens

So from a transport perspective, the CLI is ready for authenticated usage.

### 2.5 Auth login contract

The current MVP contract is now:

- `CLI -> POST /v1/login/init` or `/v1/auth/login`
- `CLI -> POST /v1/login/callback` or `/v1/auth/callback`
- `CLI -> POST /v1/login/poll` or `/v1/auth/device-poll`
- `server` returns `api_key` on successful completion

This is consistent with the Auth BFF design where:

- Auth0 proves user identity
- AnyCap Server creates or reuses local identity
- Server issues AnyCap API key
- CLI stores the API key locally

## 3. Main MVP Gaps

### 3.1 Auth0 flow is only partially finished end-to-end

The CLI/server contract now matches the API-key-based Auth BFF design, but the real Auth0 integration is only partially complete.

Implemented:

- real Auth0 authorize URL builder
- real authorization code exchange adapter
- login session persistence
- localhost callback and device-poll API shapes

Still missing or incomplete:

- real device flow with Auth0
- complete browser callback landing / relay story outside stub mode
- user provisioning beyond using Auth0 `sub` as the immediate local subject
- production-level end-to-end validation against real Auth0 tenant settings

### 3.2 Auth0 is partially integrated, not fully production-ready

Config supports Auth0-related fields:

- `ANYCAP_AUTH0_ENABLED`
- `ANYCAP_AUTH0_ISSUER`
- `ANYCAP_AUTH0_AUDIENCE`
- `ANYCAP_AUTH0_CLIENT_ID`
- `ANYCAP_AUTH0_CLIENT_SECRET`
- `ANYCAP_AUTH0_REDIRECT_URL`

Current status:

- when `ANYCAP_AUTH0_ENABLED=true`, runtime now injects a real Auth0 client for authorize URL generation and code exchange
- stub mode still exists intentionally as the local-development fallback

Still missing:

- real device-code flow implementation
- richer profile / management API integration
- deployment-level validation of redirect URI / browser callback behavior
- explicit operator guidance for Auth0 tenant configuration

### 3.3 Image generation is still stubbed

`image generate` is not connected to a real generation backend.

Today:

- `imageService` is still built with `nexushub.NewStubClient()`
- the stub returns a synthetic image URL
- credits are deducted through a stub balance client

So while the route exists and the request lifecycle works, the actual result is still placeholder output.

### 3.4 Credit / billing is still stubbed

The current implementation includes:

- credit lookup
- credit deduction
- idempotent-ish local stub behavior

But it is still an in-memory stub, not a real billing or credit system.

This affects:

- available balance correctness
- persistence across instances
- real business billing confidence

### 3.5 Health/status is not infra-aware

Current `/ping`, `/healthz`, `/v1/status` expose service metadata and auth principal information.

They do **not** verify real dependency readiness for:

- PostgreSQL
- Redis
- S3/object storage
- Agent Platform
- NexusHub

So:

- a server can report healthy while a critical dependency is broken

## 4. Infra Integration Status

### 4.1 PostgreSQL

Status: **partially integrated**

Implemented:

- SQL DB adapter
- API key repository
- call log repository
- migration runner
- runtime wiring for `dev/prod/integration`

Missing / not yet proven in product sense:

- startup ping / readiness verification
- full production operational validation in deployed environment
- broader persistence coverage beyond current MVP data paths

### 4.2 Redis

Status: **partially integrated**

Implemented:

- Redis client adapter
- fixed-window rate limiter
- runtime wiring for `dev/prod/integration`

Missing / not yet proven:

- explicit startup connectivity check
- richer observability / rate-limit diagnostics
- deployment-level validation under SAE traffic

### 4.3 NexusHub

Status: **partially integrated**

What is real:

- `platform_client.go` can fetch model metadata from NexusHub Platform
- catalog-related model discovery and schema lookup can use real NexusHub config

What is not real:

- `image generate` does not use this client
- real generation execution is still stubbed

Important distinction:

- **Catalog path is real-capable**
- **Generation path is not yet real**

### 4.4 S3 / Object Storage

Status: **integrated and likely MVP-capable**

Implemented:

- presigned PUT generation
- key prefix support
- TTL clamping
- public URL support
- delete API on storage adapter

Open items:

- real environment validation in deployed SAE runtime
- lifecycle/cleanup operational verification

### 4.5 Agent Platform

Status: **integrated and likely MVP-capable**

Implemented:

- real HTTP client
- image read request mapping
- video read request mapping
- upstream error translation

Open items:

- production credentials and connectivity validation
- throughput / timeout validation in real environment

### 4.6 Auth0

Status: **not integrated**

Implemented:

- config surface only
- stub auth client

Missing:

- real authorize URL generation
- real code exchange
- refresh token support
- device code support
- callback proxy flow described in CLI OAuth spec

### 4.7 Payment

Status: **not integrated**

Current repository only defines the domain port boundary. No real implementation is wired.

## 5. CLI/Server Compatibility Matrix

### 5.1 `anycap status`

Status: **usable with API key**

Requirements:

- server running
- valid API key available to CLI

Limitation:

- not a proof of infra health

### 5.2 `anycap image models`

Status: **usable with API key**

If `NEXUSHUB_BASE_URL` is set:

- can use real catalog metadata

If not:

- falls back to stub catalog metadata

### 5.3 `anycap image generate`

Status: **transport-usable but result still stubbed**

Requirements:

- valid API key
- server running
- credit stub / repo chain functioning

Limitation:

- still returns stub generation output

### 5.4 `anycap image read`

Status: **closer to real MVP**

With real Agent Platform + S3:

- can be meaningfully usable

Remaining risk:

- deployment-level validation still needed

### 5.5 `anycap video read`

Status: **closer to real MVP**

With real Agent Platform + S3:

- can be meaningfully usable

### 5.6 `anycap login`

Status: **not truly usable as current primary login path**

`--with-token`:

- works for direct API key input

OAuth / headless:

- not aligned with current server implementation

## 6. Recommended Priority

### Priority 1: Fix auth contract mismatch

Implement server-side support for:

- `POST /v1/auth/device-code`
- `POST /v1/auth/device-poll`
- `POST /v1/auth/refresh`

And change auth callback responses to match the CLI OAuth contract.

This is the single most important end-to-end blocker.

### Priority 2: Decide what the first true MVP capability is

Two realistic options:

1. `Auth + models + image generate`
2. `Auth + upload + image read + video read`

Recommendation:

- if real generation backend is not ready, formally define MVP around `understand/read/upload` first

### Priority 3: Add infra-aware readiness checks

Extend health/readiness to validate:

- PostgreSQL
- Redis
- optional S3
- optional Agent Platform
- optional NexusHub

### Priority 4: Replace remaining stubs strategically

In order:

1. Auth0
2. generation backend
3. credit/billing
4. payment

## 7. Practical MVP Definition Right Now

If we define MVP very narrowly, the current repository can support:

- server deployment
- API key-protected requests
- real PostgreSQL/Redis wiring
- real upload + presign
- real image read
- real video read
- real model catalog metadata

But it does **not yet** support the more user-facing promise of:

- “run `anycap login` and then use the CLI normally”
- “generate real images through the server”
- “use real Auth0-backed identity and refresh lifecycle”

That means the repository is best described as:

> **Infrastructure-ready, partially integrated MVP foundation with one major auth contract gap and one major generation-backend gap.**
jor generation-backend gap.**
