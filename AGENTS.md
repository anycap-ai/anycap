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

skills/
  capabilities/      # Skill files per capability (e.g. image)

test/
  integration/       # Integration and smoke tests

web/
  dashboard/         # Dashboard (billing, usage, logs)
  landing/           # Landing page
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
# Start server
go run ./cmd/anycap-server
# or
scripts/dev/run-server.sh

# Use the CLI
go run ./cmd/anycap --endpoint http://127.0.0.1:18080 status
go run ./cmd/anycap --endpoint http://127.0.0.1:18080 image models
go run ./cmd/anycap --endpoint http://127.0.0.1:18080 image generate --prompt "paper crane"
# or
scripts/dev/run-cli.sh status
```

## Coding Conventions

- **Language:** Go. Follow standard Go idioms and `gofmt` formatting.
- **New commands:** add under the appropriate `internal/cli/command/` sub-package (`cap/`, `meta/`, `infra/`, `extension/`).
- **New capabilities:** add a use-case in `internal/application/`, define ports in `internal/domain/port/`, implement adapters in `internal/infrastructure/`.
- **No business logic in transport or middleware.** Keep handlers thin.
- **Domain layer has zero external dependencies.** Only standard library and internal models.
- **Stub first:** when a real adapter isn't ready, place a stub in the correct `internal/infrastructure/` sub-package.
- **Tests:** place unit tests alongside source (`_test.go`). Integration tests go in `test/integration/`.
- **Docs:** significant design decisions go in `docs/plans/` as dated markdown files.
- **Skill files:** one file per capability under `skills/capabilities/`.

## CI/CD

Pipeline is configured in `.gitlab-ci.yml`, using the shared `engineering/ci` Go workflow.

| Branch pattern | Action |
|---|---|
| `main` / MR to main | lint + test |
| `release/cli-v<semver>` | goreleaser cross-compile, GitHub release |
| `build/server` | Docker build server image only |
| `deploy/server-dev` | Docker build + deploy to kntech-dev |
| `deploy/server-prod` | Docker build + deploy to infra-prod |

**CLI Release flow:**
1. Write release notes in `releases/v<semver>.md` (hand-written, CLI-facing changes only).
2. Push branch `release/cli-v0.1.0` (version extracted from branch name).
3. CI runs goreleaser to cross-compile and archive CLI binaries.
4. CI creates GitHub release with the release notes and uploads artifacts (requires `GITHUB_TOKEN` in CI/CD variables).

**Server deploy flow:**
1. Merge to `deploy/server-dev` to build and deploy the server image to dev.
2. Merge to `deploy/server-prod` to deploy to production.

**Web (landing/dashboard):** deployed via Cloudflare Pages, not part of GitLab CI. See `web/Makefile`.

## CLI Design and Implementation

### Design Docs

CLI spec documents live in `docs/cli/spec/`. These are **high-level design only** -- flow diagrams (mermaid), API contracts, design decisions, and rationale. No implementation code in spec files. Code lives in `internal/cli/`.

| Spec | Path | Covers |
|------|------|--------|
| Framework | `docs/cli/spec/framework.md` | Config resolution, HTTP client, output formatting, error handling, help grouping, command patterns |
| OAuth | `docs/cli/spec/oauth.md` | Login flows (localhost callback, device code polling), credential storage, security |
| Capabilities | `docs/cli/spec/capabilities.md` | Image understand, video read, file upload flow, API contracts |

### Key Architectural Decisions

- **CLI only talks to Server.** CLI never directly accesses Auth0, Credit, NexusHub, or any other Infra service. Server is the sole gateway.
- **Auth0 is the auth provider.** Server wraps Auth0 flows. CLI calls Server login APIs which internally interact with Auth0.
- **Config + Credential separation.** `~/.anycap/config.toml` for preferences (0644), `~/.anycap/credentials` for credential JSON (0600). Keychain is primary store; file is fallback.
- **DefaultEndpoint via ldflags.** Release builds default to `https://api.anycap.ai`, dev scripts inject `http://127.0.0.1:8080`.
- **JSON-first output.** Non-TTY = JSON to stdout; TTY = human-readable. `--json` / `--pretty` to override.
- **Release via goreleaser.** CLI binary and skill files will be hosted on GitHub. Use goreleaser for cross-platform builds and GitHub Releases.

### Testing

- Test commands through `NewRootCmd` with `httptest.NewServer` to mock the AnyCap server.
- Inject `Stdout` and `Stderr` as `bytes.Buffer` for assertion.
- Prefer function-style tests (no test classes).
