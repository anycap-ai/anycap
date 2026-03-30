# AGENTS.md

> Guidance for AI agents working in this repository.

## What is AnyCap

AnyCap is an AI Agent capability runtime. This repo contains:

- **`anycap-server`** — HTTP server that exposes capabilities (image, login, system, etc.)
- **`anycap` CLI** — Agent-facing CLI that talks to the server over HTTP
- **Skill files** — Discovery files that tell agents how to install, authenticate, and invoke capabilities

## Repository Layout

```
cmd/
  anycap/            # CLI binary entry point
  anycap-server/     # Server binary entry point

internal/
  app/               # Bootstrap and dependency wiring
  application/       # Use-case orchestration (image/, login/, system/)
  cli/
    command/
      cap/           # Capability commands: image, video, music, …
      infra/         # Infrastructure commands: drive, browser, sandbox, …
      meta/          # Management commands: login, status, config, skill
      extension/     # Dynamic extension commands: run
    config/          # CLI config parsing
    httpclient/      # HTTP client wrapping server calls
    output/          # JSON-first stdout formatting
  config/            # Server config loading
  domain/
    model/           # Core domain models (ServiceStatus, ImageModel, …)
    port/            # Interface definitions (no external deps here)
  infrastructure/    # Concrete adapters (auth, apikey, credit, nexushub, ratelimit)
  middleware/        # Cross-cutting HTTP concerns (request_id, auth, rate limit, logging)
  transport/http/    # HTTP router, handlers, response format

pkg/
  api/               # Shared contract types between server and CLI
  buildinfo/         # Version, commit, build time
  version/           # Version constants

configs/
  cli/               # CLI config examples

deploy/docker/       # Dockerfiles for server and CLI

docs/
  plans/             # Design and implementation plans
  *.md               # Architecture and vision docs

scripts/
  dev/               # Local dev scripts (run-server.sh, run-cli.sh)
  release/           # Release build scripts

npm/
  anycap/            # npm main package template (@anycap/cli)

skills/
  anycap-cli/         # CLI skill for agent consumption
    SKILL.md          # Main skill entry point
    references/       # Detailed capability docs (loaded on demand)

test/
  integration/       # Integration and smoke tests

web/
  src/app/           # Next.js App Router pages (dashboard, landing, auth, i18n)
  docs/              # Web docs (including design guideline)
```

## Architecture Layers (server)

| Layer | Path | Responsibility |
|---|---|---|
| Transport | `internal/transport/http/` | Routing, request parsing, response formatting |
| Middleware | `internal/middleware/` | request_id, auth, rate limit, logging |
| Application | `internal/application/` | Use-case orchestration |
| Domain | `internal/domain/` | Core models and port interfaces |
| Infrastructure | `internal/infrastructure/` | Concrete adapters (external systems) |

**Rule:** dependencies flow inward only. Infrastructure implements domain ports. Application uses domain ports. Transport calls application.

## Local Development

```bash
# Start local Postgres + Redis
make infra-up

# Start server (connects to local infra)
make dev

# Use the CLI
go run ./cmd/anycap --endpoint http://127.0.0.1:8080 status
scripts/dev/run-cli.sh status

# Stop infra (keep data)
make infra-down

# Reset infra (destroy volumes and restart fresh)
make infra-reset
```

## Web Design Guideline

When developing any page under `web/`, always follow `web/docs/design-guideline.md`. It defines the full visual language — colors, typography, spacing, backgrounds, borders, effects, and component patterns. All web pages must be visually consistent with this guideline.

## External ID — CRITICAL RULES (MUST READ)

> **NEVER expose internal auto-increment `int64` IDs to any external interface.**
> This is a **non-negotiable, zero-tolerance** rule. Violations are security incidents.

### What counts as "external"

Any surface a client (CLI, web, third-party) can observe: HTTP JSON responses, URL path parameters, request/response bodies, CLI stdout, WebSocket messages, error messages containing IDs.

### The architecture

```
Inbound (client → server):  external string ID  →  IDResolver  →  internal int64
Outbound (server → client): internal int64       →  IDMapper    →  external string ID (via presenter DTO)
```

| Layer | Package | Role |
|---|---|---|
| **IDResolver** | `internal/transport/http/handlers` | Parses external IDs from requests → internal int64 |
| **IDMapper** | `internal/transport/http/presenter` | Batch-resolves internal int64 → external string IDs |
| **Presenter** | `internal/transport/http/presenter` | Builds DTOs with external IDs; the ONLY path to serialize resources |
| **PassthroughIDResolver / PassthroughIDMapper** | handlers / presenter | For stub mode and tests — converts int64 ↔ string without DB |

### Rules you MUST follow

1. **Handler constructors require `IDResolver` + `presenter.IDMapper`** — they are mandatory parameters, never optional.
2. **NEVER add `if mapper == nil` fallback** — there is no nil-mapper code path. Every runtime mode (stub, dev, prod) injects a concrete implementation.
3. **NEVER `json.Marshal` a domain model with int64 ID fields** — domain models (`DriveNode`, `PageSite`, `PageVersion`, `ModelRoute`, `Space`, `UploadSession`, etc.) have **no `json` tags** on their ID fields. All external serialization goes through presenter DTOs.
4. **NEVER write `result.User.ID = externalID`** (mutate-then-serialize) — always use a presenter function (`presenter.PresentUser`, `presenter.PresentLoginUser`, etc.) to produce a DTO.
5. **NEVER accept numeric JSON values as IDs in request bodies** — `parseOptionalIDRaw` only accepts strings. Clients must send `"parent_id": "dn_abc123"`, not `"parent_id": 42`.
6. **New resources** that are externally visible must: add a prefix in `pkg/externalid/`, add an `external_id` column via migration, add resolve methods to `PostgresExternalIDMapper`, add a presenter DTO + present function.
7. **NEVER expose internal storage paths (object keys, asset prefixes) in API responses.** Storage paths like `page/spaces/{id}/sites/{id}/versions/{no}` and `drive/spaces/{id}/nodes/{id}/{uuid}` contain internal int64 IDs embedded in the path string. Even though the field itself is a `string`, returning it to the client leaks internal IDs. Presenter DTOs MUST NOT include `ObjectKey` or `AssetPrefix` fields. The client only needs `UploadURL` / `ObjectURL` — the server-side storage layout is an internal implementation detail that clients must never see.

### Prefixes

| Resource | Prefix | Example |
|---|---|---|
| User | `u_` | `u_aBcDeFgHiJkLmNoP` |
| Space | `sp_` | `sp_aBcDeFgHiJkLmNoP` |
| DriveNode | `dn_` | `dn_aBcDeFgHiJkLmNoP` |
| UploadSession | `upl_` | `upl_aBcDeFgHiJkLmNoP` |
| PageSite | `pg_` | `pg_aBcDeFgHiJkLmNoP` |
| PageVersion | `pv_` | `pv_aBcDeFgHiJkLmNoP` |
| CapsUpload | `cu_` | `cu_aBcDeFgHiJkLmNoP` |
| ModelRoute | `mr_` | `mr_aBcDeFgHiJkLmNoP` |
| LoginSession | `lsn_` | `lsn_aBcDeFgHiJkLmNoP` |
| APIKey ID | `akid_` | `akid_aBcDeFgHiJkLmNoP` |
| Feedback | `fb_` | `fb_aBcDeFgHiJkLmNoP` |

### Quick checklist for new handlers

- [ ] Constructor takes `IDResolver` and `presenter.IDMapper`
- [ ] Path params resolved via `h.resolver.ResolveXxxID(ctx, raw)`
- [ ] Request body IDs parsed via `parseOptionalIDRaw` / `parseRequiredIDRaw` (string only)
- [ ] Response built via `presenter.PresentXxx(ctx, h.mapper, domainModel)` — returns a DTO
- [ ] List endpoints return `[]SomeDTO`, never `[]model.SomeModel`
- [ ] Delete endpoints resolve external ID for response via `h.mapper.ResolveXxxExternalIDs`
- [ ] **No internal storage paths in responses** — DTO must NOT contain `ObjectKey`, `AssetPrefix`, or any field whose value embeds internal int64 IDs in a path string

## Coding Conventions

- **Language:** Go. Follow standard Go idioms and `gofmt` formatting.
- **New commands:** add under the appropriate `internal/cli/command/` sub-package (`cap/`, `meta/`, `infra/`, `extension/`).
- **Drive/Page CLI placement:** implement under `internal/cli/command/infra/`, and register in `root.go` as top-level commands (`anycap drive`, `anycap page`).
- **New capabilities:** add a use-case in `internal/application/`, define ports in `internal/domain/port/`, implement adapters in `internal/infrastructure/`.
- **No business logic in transport or middleware.** Keep handlers thin.
- **Domain layer has zero external dependencies.** Only standard library and internal models.
- **Migrations:** current runner does not track `schema_migrations`; all new SQL migrations must be idempotent (`IF NOT EXISTS` / guard checks).
- **Stub first:** when a real adapter isn't ready, place a stub in the correct `internal/infrastructure/` sub-package.
- **Tests:** place unit tests alongside source (`_test.go`). Integration tests go in `test/integration/`.
- **Docs:** significant design decisions go in `docs/plans/` as dated markdown files.
- **Skill files:** CLI skill in `skills/anycap-cli/` (SKILL.md + references/).

## CI/CD

### Source Repositories

| Repo | Purpose |
|------|---------|
| `gitlab.knoffice.tech/engineering/anycap` (origin) | Primary development, CI/CD pipelines, server deployment |
| `github.com/anycap-ai/anycap` (github) | Public distribution: CLI releases, web auto-deploy, skill files |

### GitLab CI

Pipeline is configured in `.gitlab-ci.yml`, using the shared `engineering/ci` Go workflow.

| Branch pattern | Action |
|---|---|
| `main` / MR to main | lint + test |
| `main` | + CLI dev build (goreleaser snapshot, GitLab artifacts only) |
| `release/cli-v<semver>` | goreleaser cross-compile, GitHub release |
| `build/server` | Docker build server image only |
| `deploy/server-dev` | Docker build + deploy to kntech-dev |
| `deploy/server-prod` | Docker build + deploy to infra-prod |

**CLI Release flow:**
1. Write release notes in `releases/v<semver>.md` (hand-written, CLI-facing changes only).
2. **Review gate:** present the release notes to the user and get explicit approval before proceeding. Do NOT push the release branch until confirmed.
3. Push branch `release/cli-v0.1.0` (version extracted from branch name).
4. CI runs goreleaser to cross-compile and archive CLI binaries.
5. CI creates GitHub release with the release notes and uploads artifacts.
6. GitHub Actions auto-triggers: publishes npm packages via OIDC, runs post-release verification.

**GitHub authentication (GitLab CI -> GitHub):**
- Primary: GitHub App (`GITHUB_APP_ID` + `GITHUB_APP_PRIVATE_KEY` as File-type variable)
- Fallback: `GITHUB_TOKEN` (personal/machine token)
- Shared logic: `scripts/release/github-auth.sh`
- Commits appear as `anycap-bot[bot]` when using GitHub App

**npm distribution:**
- Main package: `@anycap/cli` (JS wrapper + optionalDependencies)
- Platform packages: `@anycap/cli-{darwin,linux,win32}-{x64,arm64}` (Go binaries)
- Publishing: GitHub Actions OIDC trusted publishing (no NPM_TOKEN needed)
- Workflow: `anycap-github/.github/workflows/publish-npm.yml`
- Post-release verification: `anycap-github/.github/workflows/post-release.yml`

**Server deploy flow:**
1. Merge to `deploy/server-dev` to build and deploy the server image to dev.
2. Merge to `deploy/server-prod` to deploy to production.

### Web (landing/dashboard)

Deployed via **Cloudflare Pages** connected to the GitHub repo `anycap-ai/anycap`.

| Environment | Trigger | Domain |
|-------------|---------|--------|
| Production | Push to `main` branch on GitHub | `anycap.ai` |
| Preview | Push to any other branch on GitHub | `*.anycap-web.pages.dev` |

CF Pages build configuration (set in Cloudflare Dashboard):

| Setting | Value |
|---------|-------|
| Framework preset | None |
| Root directory | `web` |
| Build command | `pnpm install && pnpm build && npx @cloudflare/next-on-pages` |
| Build output directory | `.vercel/output/static` |

Manual deploy is also available via `web/Makefile` as a fallback (see `make cf-deploy`).

**Workflow:** develop on GitLab -> push to GitHub -> CF Pages auto-deploys.

### Skills

The CLI skill lives in `skills/anycap-cli/`. `SKILL.md` is the main entry point; detailed capability docs are in `references/` and loaded on demand. Distributed via the GitHub repo from the latest `main` branch.

## CLI Design and Implementation

### Design Docs

CLI spec documents live in `docs/cli/spec/`. These are **high-level design only** -- flow diagrams (mermaid), API contracts, design decisions, and rationale. No implementation code in spec files. Code lives in `internal/cli/`.

| Spec | Path | Covers |
|------|------|--------|
| Framework | `docs/cli/spec/framework.md` | Config resolution, HTTP client, output formatting, error handling, help grouping, command patterns |
| OAuth | `docs/cli/spec/oauth.md` | Login flows (localhost callback, device code polling), credential storage, security |
| Capabilities | `docs/cli/spec/capabilities.md` | Image generation, model discovery, schema fetch, API contracts |

### Key Architectural Decisions

- **CLI only talks to Server.** CLI never directly accesses external auth providers, Credit, NexusHub, or any other Infra service. Server is the sole gateway.
- **Server handles authentication.** CLI calls Server login APIs. The auth backend is a server implementation detail invisible to the CLI.
- **Config + Credential separation.** `~/.anycap/config.toml` for preferences (0644), `~/.anycap/credentials` for credential JSON (0600). Keychain is primary store; file is fallback.
- **DefaultEndpoint via ldflags.** Release builds default to `https://api.anycap.ai`, local development defaults use `http://127.0.0.1:8080`.
- **JSON-first output.** Non-TTY = JSON to stdout; TTY = human-readable. `--json` / `--pretty` to override.
- **Release via goreleaser.** CLI binary and skill files will be hosted on GitHub. Use goreleaser for cross-platform builds and GitHub Releases.
- **npm via OIDC.** npm packages published from GitHub Actions using trusted publishing. No long-lived tokens. Platform packages use `os`+`cpu` fields for automatic platform selection.

### Testing

- Test commands through `NewRootCmd` with `httptest.NewServer` to mock the AnyCap server.
- Inject `Stdout` and `Stderr` as `bytes.Buffer` for assertion.
- Prefer function-style tests (no test classes).
