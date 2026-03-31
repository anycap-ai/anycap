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
    (seo)/           # SEO pages (non-localized fallback)
    [locale]/(seo)/  # SEO pages (localized, primary)
  src/lib/           # SEO infrastructure (site.ts, seo-metadata.ts, sitemap-routes.ts)
  src/components/
    ui/              # Generic UI primitives — no business logic (HoverDropdown, Modal, FadeIn, Spinner, …)
    layout/          # Page shells, header, footer, navigation (Header, Footer, SeoShell, NavDropdown, …)
    landing/         # Landing/marketing page components (EquipAgent, TerminalDemo, CapabilityGapTable, …)
    auth/            # Auth components (LoginButton, LogoutButton)
    brand/           # Brand assets (AnycapLogo, AnycapMark, AnycapWordmark)
    dashboard/       # Dashboard-specific components (DashboardShell, Drive modals, …)
    providers/       # Context providers (SWRProvider)
  public/            # Static assets (llms.txt, robots, manifests)
  docs/              # Web docs (design guideline, SEO workspace)
    seo/             # SEO documentation system (analyze/, todo/, change-log/)
  .agents/skills/    # SEO agent skills (18 specialized skills)
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

## Feature Flags

Capability availability is controlled by feature flags. Each flag can be overridden via environment variable. Login is always enabled and is not a feature flag.

### Server-side control

Feature defaults are derived from infrastructure configuration (e.g., NexusHub, AgentPlatform, Postgres). Override any feature with an environment variable:

```bash
# Disable music generation
ANYCAP_FEATURE_MUSIC_GENERATE=false
ANYCAP_FEATURE_MUSIC_MODELS=false

# Disable drive storage
ANYCAP_FEATURE_DRIVE=false
```

| Env var | Default | Controls |
|---|---|---|
| `ANYCAP_FEATURE_IMAGE_GENERATE` | true if NexusHub Core configured | `POST /v1/image/generate` |
| `ANYCAP_FEATURE_IMAGE_EDIT` | true if NexusHub Core configured | `POST /v1/image/edit` |
| `ANYCAP_FEATURE_IMAGE_MODELS` | true if catalog configured | `GET /v1/image/models` |
| `ANYCAP_FEATURE_IMAGE_READ` | true if AgentPlatform configured | `POST /v1/capabilities/image/read` |
| `ANYCAP_FEATURE_VIDEO_GENERATE` | true if NexusHub Core configured | `POST /v1/video/generate` |
| `ANYCAP_FEATURE_VIDEO_MODELS` | true if catalog configured | `GET /v1/video/models` |
| `ANYCAP_FEATURE_VIDEO_READ` | true if AgentPlatform configured | `POST /v1/capabilities/video/read` |
| `ANYCAP_FEATURE_AUDIO_READ` | true if AgentPlatform configured | `POST /v1/capabilities/audio/read` |
| `ANYCAP_FEATURE_MUSIC_GENERATE` | true if NexusHub Core configured | `POST /v1/music/generate` |
| `ANYCAP_FEATURE_MUSIC_MODELS` | true if catalog configured | `GET /v1/music/models` |
| `ANYCAP_FEATURE_DRIVE` | true | All `/v1/drive/*` endpoints |
| `ANYCAP_FEATURE_PAGE` | true | All `/v1/pages*` endpoints |

Values: `true`/`1` to force on, `false`/`0` to force off. Unset uses the infrastructure-derived default.

### Three-layer enforcement

1. **Server feature gate middleware** (`internal/middleware/feature_gate.go`): blocks requests to disabled features with `503 FEATURE_DISABLED`.
2. **Public features endpoint** (`GET /v1/features`): returns the resolved feature map, no auth required.
3. **CLI preflight** (`cmd/anycap/main.go`): fetches `/v1/features` before building the command tree. Disabled commands are hidden from help and unavailable. When the server is unreachable, all features are disabled so only local commands (config, credential, skill, login, update, feedback) remain visible.

### Adding a new feature flag

1. Add constant in `pkg/feature/feature.go`.
2. Add default in the `defaults` map (same file).
3. Add to `buildServerFeatures()` in `internal/app/bootstrap.go` with the infra-derived default.
4. The feature gate middleware resolves features dynamically from URL paths (`/v1/{cap}/{operation}` -> `{cap}.{operation}`), so no code change is needed in `feature_gate.go` for new capability operations.
5. Gate the CLI command with `feature.Enabled()` in the appropriate command constructor.

### Adding a new capability operation

Capability operations (generate, edit, upscale, etc.) are data-driven. The server handler uses a parameterized route (`/v1/{cap}/:operation`), and the service delegates to the model catalog for route selection. To add a new operation:

1. Add seed data to the catalog DB with the new operation name.
2. Add a feature flag constant and default (see "Adding a new feature flag" above).
3. Add a CLI subcommand using the `newImageOperationCmd` factory (one line in `NewImageCmd`).
4. **Before going live**, configure dconf:
   - `feature_access` JSON: add `{cap}.{operation}` with rollout rules.
   - `rate_limit` JSON: add `{cap}.{operation}` with RPM (otherwise falls back to `default_rpm`).

### Pre-launch checklist for new operations

Before enabling a new operation in production:

- [ ] Seed data deployed to catalog DB
- [ ] Feature flag added to `feature_access` dconf with appropriate rollout (start with `groups` for internal testing, then `all`)
- [ ] Rate limit configured in `rate_limit` dconf (unconfigured operations fall back to `default_rpm`)
- [ ] CLI subcommand added and tested
- [ ] Skill files updated to document the new command

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
- **Migrations:** current runner does not track `schema_migrations`; all SQL migrations must be idempotent (`IF NOT EXISTS` / guard checks).
  - **Embedded migrations** (`internal/infrastructure/migration/migrations/`): once a file is deployed to any environment (dev/prod), **NEVER modify it**. Always create a new sequentially numbered file (e.g., `0022_xxx.sql`) for further changes.
  - **Local seed SQL** (`deploy/sql/`): these are for local `make infra-reset` only. Can be rewritten in place to reflect the final correct schema — no incremental constraint.
- **Stub first:** when a real adapter isn't ready, place a stub in the correct `internal/infrastructure/` sub-package.
- **Tests:** place unit tests alongside source (`_test.go`). Integration tests go in `test/integration/`.
- **Docs:** significant design decisions go in `docs/plans/` as dated markdown files.
- **Skill files:** CLI skill in `skills/anycap-cli/` (SKILL.md + references/). After CLI changes, **test and verify the CLI first**, then update skill files to match actual behavior.
- **Product status:** after shipping any product feature (new capability, CLI command, dashboard page, etc.), update `docs/anycap-current-status.md` to reflect the current state. This file is a snapshot, not a changelog — overwrite the relevant section with what exists now, do not append "added X" or explain what changed.

### Frontend Component Organization (`web/src/components/`)

Components are organized by role, not by page. **No loose files in `components/` root** — every component belongs in a subdirectory.

| Directory | What goes here | Rule of thumb |
|---|---|---|
| `ui/` | Generic UI primitives with zero business logic | Could be copy-pasted into any project and still work (Modal, FadeIn, Spinner, HoverDropdown, LocalizedLink) |
| `layout/` | Page shells, header, footer, navigation | Structural components that define page chrome (Header, Footer, SeoShell, ForHumanShell, AuthNav, NavDropdown, BreadcrumbJsonLd) |
| `landing/` | Landing/marketing page-specific components | Feature content tied to the public site (EquipAgent, TerminalDemo, CapabilityGapTable, EarlyAccessBanner, ParticleAgent) |
| `auth/` | Authentication UI | LoginButton, LogoutButton |
| `brand/` | Brand assets | Logo, mark, wordmark |
| `dashboard/` | Dashboard-specific components | Components only used within `/dashboard` routes (DashboardShell, Drive modals, DashboardToast) |
| `providers/` | React context providers | SWRProvider |

**Placement rules:**
- If a component has no business logic and could work in any context → `ui/`.
- If it's only used in dashboard pages → `dashboard/`. If it becomes reused elsewhere, promote it to `ui/`.
- New animations/motion utilities → `ui/` (not a separate `animation/` directory).
- New page-specific marketing components → `landing/`.

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
| `feat*` / `fix*` / `chore*` | lint + test |
| `dev/cli` | nightly CLI build (goreleaser snapshot) + publish `anycap-cli-nightly` to NexusHub |
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

## SEO

### Architecture

SEO pages live under the `(seo)` route group with dual routing for i18n:

```
web/src/app/(seo)/                    # Non-localized SEO pages (fallback)
web/src/app/[locale]/(seo)/           # Localized SEO pages (primary)
```

Both share `SeoShell` (`web/src/components/SeoShell.tsx`) as the layout shell.

### Page Categories

| Category | Path pattern | Examples |
|---|---|---|
| Capabilities | `/capabilities/{slug}` | image-generation, video-generation, image-understanding, video-analysis |
| Agent-specific | `/for/{agent}` | claude-code, cursor, codex, manus |
| Guides | `/guides/{slug}` | install-anycap, context-engineering-for-agents, add-tools-to-claude-code |
| Glossary | `/glossary/{slug}` | context-engineering, agent-harness, agent-capability-runtime |
| Compare | `/compare/{slug}` | anycap-vs-composio, anycap-vs-openai-agent-builder |
| Models | `/models/{slug}` | seedream-5, nano-banana-pro, veo-3-1 |
| Learn | `/learn/{slug}` | what-agents-cant-do |
| Top-level | `/{slug}` | start, cli, skills, about, capabilities, models |

### Key Infrastructure Files

| File | Responsibility |
|---|---|
| `web/src/lib/site.ts` | Route definitions (`publicRouteDefinitions`) with priorities, locale config, capability descriptions |
| `web/src/lib/seo-metadata.ts` | Robots metadata, preview deployment no-index logic |
| `web/src/lib/sitemap-routes.ts` | Auto-discovery sitemap generation (walks `(seo)` directory for `page.tsx` files) |
| `web/src/lib/localized-metadata.ts` | Per-locale metadata generation |
| `web/src/lib/landing-content.ts` | Landing page copy with SEO-aligned messaging |
| `web/public/llms.txt` | AI-friendly route guide for LLM crawlers (GPTBot, ClaudeBot, PerplexityBot, etc.) |
| `web/src/app/robots.ts` | robots.txt with explicit AI crawler allow rules |
| `web/src/middleware.ts` | Legacy route redirects (e.g. `image-read` → `image-understanding`) |
| `web/src/app/opengraph-image.tsx` | Dynamic OG image generation |

### Adding a New SEO Page

1. Create `page.tsx` under `web/src/app/[locale]/(seo)/{category}/{slug}/` (localized) and optionally under `web/src/app/(seo)/{category}/{slug}/` (non-localized fallback).
2. Add the route to `publicRouteDefinitions` in `web/src/lib/site.ts` with an appropriate priority (0–1).
3. The sitemap auto-discovers `page.tsx` files — no manual sitemap entry needed.
4. If the page introduces a new capability claim, update `llms.txt` and the capability summary constants in `site.ts`.
5. If replacing a legacy route, add a redirect in `web/src/middleware.ts`.

### Landing Page Copy — Do Not Touch

The agent landing page (`web/src/app/[locale]/page.tsx` / `web/src/app/page.tsx`) and its content source (`web/src/lib/landing-content.ts`) are **off-limits for SEO-driven copy changes**. Landing page copy is maintained separately and must not be rewritten, reordered, or partially updated during SEO work. Other SEO pages (capabilities, guides, glossary, compare, models, learn, for/, etc.) can be freely modified.

### Capability-Availability Language

Site-wide capability descriptions are centralized in `web/src/lib/site.ts`:

- **Early access (now):** image generation, video generation, image understanding, video analysis
- **Roadmap:** music, speech, search, crawl

All pages, metadata, `llms.txt`, and agent-facing copy must use these canonical lists. Never describe roadmap capabilities as available.

### GEO (Generative Engine Optimization)

The site is optimized for AI search surfaces (AI Overviews, ChatGPT search, Perplexity):

- `llms.txt` provides a structured entry point for AI systems with best-entry pages, capability status, and usage notes.
- `robots.ts` explicitly allows GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, and PerplexityBot.
- Content is written for passage-level citability with clear claims, definitions, and structured data.

### SEO Documentation System

All SEO research, decisions, and changes are tracked in `web/docs/seo/`:

```
web/docs/seo/
├── index.md       # Rules, naming conventions, workflow
├── analyze/       # Research, diagnostics, hypotheses, evidence
├── todo/          # Prioritized actionable tasks (deduplicated)
└── change-log/    # Actual code/config/content changes with verification
```

**Rules:**
- `analyze/` records judgment and reasoning — not a changelog.
- `todo/` collects actionable items from multiple analyses — no copy-paste of analysis content.
- `change-log/` only records real changes (code, config, metadata, pages, sitemap, robots, `llms.txt`) with verification results.
- File naming: `YYYY-MM-DD-HHMM-topic-slug.md`
- Node ID: `SEO-YYYYMMDD-HHMM`

### SEO Agent Skills

Specialized agent skills for SEO work live in `web/.agents/skills/`:

| Skill | Purpose |
|---|---|
| keyword-research | Keyword discovery, intent taxonomy, topic clustering |
| seo-content-writer | SEO-optimized content with E-E-A-T checklist |
| schema-markup-generator | JSON-LD structured data generation and validation |
| technical-seo-checker | Technical audit across crawlability, security, Core Web Vitals |
| on-page-seo-auditor | Single-page scoring rubric and audit |
| meta-tags-optimizer | Title/description/OG formulas and CTR optimization |
| internal-linking-optimizer | Link architecture patterns and linking templates |
| geo-content-optimizer | AI citation readiness, quotable content patterns |
| entity-optimizer | Knowledge Graph, Wikidata, entity signal optimization |
| rank-tracker | Keyword ranking analysis and tracking setup |
| serp-analysis | SERP feature taxonomy and competitive SERP analysis |
| competitor-analysis | Positioning frameworks, battlecard templates |
| content-gap-analysis | Gap analysis frameworks and report templates |
| backlink-analyzer | Link quality rubric and outreach templates |
| domain-authority-auditor | Domain authority scoring and reporting |
| content-refresher | Content decay detection and refresh workflows |
| content-quality-auditor | Content quality scoring |
| performance-reporter | SEO KPI definitions and report templates |

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
