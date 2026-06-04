# Architecture Guidelines

## Purpose

Use this when changing server code, capability flows, domain models, ports,
transport handlers, or infrastructure adapters.

## Source of Truth

- Server wiring: `internal/app/bootstrap.go` and `internal/app/compose_*.go`
- HTTP routes and handlers: `internal/transport/http/`
- Application services: `internal/application/`
- Domain models and ports: `internal/domain/`
- Concrete adapters: `internal/infrastructure/`
- Shared server/CLI API paths: `pkg/api/paths.go`

## Layer Rules

Dependencies flow inward:

```text
transport/http -> application -> domain
infrastructure -> domain ports
```

- Transport parses requests, resolves auth principals, resolves external IDs,
  selects HTTP status codes, and builds presenter DTO responses.
- Application services own use-case orchestration, validation that requires
  business context, billing/usage coordination, provider invocation, and storage
  lifecycle decisions.
- Domain contains core models, errors, and port interfaces. Domain must not
  depend on transport, middleware, infrastructure, or provider clients.
- Infrastructure implements domain ports and wraps external systems such as
  Postgres, object storage, Auth0, NexusHub, AgentPlatform, payment, IM, and
  rate-limit/dconf systems.
- Middleware owns cross-cutting HTTP concerns only: tracing, auth, feature gate,
  rate limit, CORS, recovery, request context.

## Handler Rules

Handlers should stay thin:

- Decode and validate request shape.
- Resolve external path/body IDs to internal IDs.
- Pull authenticated principal from middleware.
- Call one application service method.
- Convert domain/application results to client DTOs through presenters when
  resource IDs are involved.
- Map known errors to HTTP responses.

Handlers should not:

- Call infrastructure adapters directly.
- Implement provider-specific business logic.
- Construct object keys or asset prefixes.
- Mutate domain models to replace IDs for serialization.
- Return storage internals.

## Adding a Capability or Operation

For a new product capability or operation, review all of these surfaces:

- Domain model and port contracts.
- Application service behavior.
- Infrastructure adapter or stub.
- HTTP handler and route capability name.
- Feature access and rate limit capability names.
- Upload reference handling if any user-provided URL can reach an upstream
  provider.
- CLI command and output shape, if agent-facing.
- Skill docs after CLI behavior is verified.
- Product status snapshot if the feature is product-facing.

Do not add future-proof abstractions until the current operation needs them.
Prefer the existing capability patterns in image, video, music, web, drive,
page, and agent-control code.

## Shared Contracts

`pkg/api/paths.go` is the shared path contract used by CLI and server tests.
When changing endpoint paths, update this package and all callers together.

Request/response structs that are externally visible should be deliberately
owned by transport/presenter/API contract code. Do not expose internal storage
or database layout through convenience serialization.
