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

.skills/
  anycap-cli/         # Unified CLI skill file for all capabilities

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
- **Skill files:** unified CLI skill in `.skills/anycap-cli/SKILL.md`.

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
| `release/cli-v<semver>` | goreleaser cross-compile, GitHub release |
| `build/server` | Docker build server image only |
| `deploy/server-dev` | Docker build + deploy to kntech-dev |
| `deploy/server-prod` | Docker build + deploy to infra-prod |

**CLI Release flow:**
1. Write release notes in `releases/v<semver>.md` (hand-written, CLI-facing changes only).
2. **Review gate:** present the release notes to the user and get explicit approval before proceeding. Do NOT push the release branch until confirmed.
3. Push branch `release/cli-v0.1.0` (version extracted from branch name).
3. CI runs goreleaser to cross-compile and archive CLI binaries.
4. CI creates GitHub release with the release notes and uploads artifacts.
5. GitHub Actions auto-triggers: publishes npm packages via OIDC, runs post-release verification.

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

The CLI skill file lives in `.skills/anycap-cli/SKILL.md`. It documents all CLI commands and capabilities in a single file for agent consumption. This is distributed via the GitHub repo and served from the latest `main` branch.

## CLI Design and Implementation

### Design Docs

CLI spec documents live in `docs/cli/spec/`. These are **high-level design only** -- flow diagrams (mermaid), API contracts, design decisions, and rationale. No implementation code in spec files. Code lives in `internal/cli/`.

| Spec | Path | Covers |
|------|------|--------|
| Framework | `docs/cli/spec/framework.md` | Config resolution, HTTP client, output formatting, error handling, help grouping, command patterns |
| OAuth | `docs/cli/spec/oauth.md` | Login flows (localhost callback, device code polling), credential storage, security |
| Capabilities | `docs/cli/spec/capabilities.md` | Image understand, video read, file upload flow, API contracts |

### Key Architectural Decisions

- **CLI only talks to Server.** CLI never directly accesses external auth providers, Credit, NexusHub, or any other Infra service. Server is the sole gateway.
- **Server handles authentication.** CLI calls Server login APIs. The auth backend is a server implementation detail invisible to the CLI.
- **Config + Credential separation.** `~/.anycap/config.toml` for preferences (0644), `~/.anycap/credentials` for credential JSON (0600). Keychain is primary store; file is fallback.
- **DefaultEndpoint via ldflags.** Release builds default to `https://api.anycap.ai`, dev scripts inject `http://127.0.0.1:8080`.
- **JSON-first output.** Non-TTY = JSON to stdout; TTY = human-readable. `--json` / `--pretty` to override.
- **Release via goreleaser.** CLI binary and skill files will be hosted on GitHub. Use goreleaser for cross-platform builds and GitHub Releases.
- **npm via OIDC.** npm packages published from GitHub Actions using trusted publishing. No long-lived tokens. Platform packages use `os`+`cpu` fields for automatic platform selection.

### Testing

- Test commands through `NewRootCmd` with `httptest.NewServer` to mock the AnyCap server.
- Inject `Stdout` and `Stderr` as `bytes.Buffer` for assertion.
- Prefer function-style tests (no test classes).
