# AGENTS.md

> Mandatory rules for agents working in this repository.

This file is not a project status document. It contains the rules that must be
visible before an agent edits code. Detailed, area-specific guidance lives in
`docs/guideline/`.

## How to Use This File

Read the relevant guideline before editing an area:

| Task | Read first |
|---|---|
| Server/API/application work | `docs/guideline/architecture.md` |
| External IDs or externally visible resources | `docs/guideline/external-id.md` |
| Feature-gated or rate-limited endpoints | `docs/guideline/feature-gating.md` |
| Uploads or provider reference URLs | `docs/guideline/upload-refs.md` |
| SQL migrations or local seed SQL | `docs/guideline/migrations.md` |
| CLI commands or CLI output | `docs/guideline/cli.md` |
| Agent-facing skill files | `docs/guideline/skills.md` |
| Web UI or public website changes | `docs/guideline/web.md` |
| SEO pages, metadata, sitemap, robots, llms.txt | `docs/guideline/seo.md` |
| Tests | `docs/guideline/testing.md` |
| Releases or deploy flow | `docs/guideline/release.md` |

If a guideline conflicts with current code, treat current code as the source of
truth and update the guideline as part of the work. If a guideline conflicts
with the critical rules below, the critical rules win.

## Critical Rules

### Go

- Go code must be formatted with `gofmt`.
- When writing Go, use tabs for line prefixes. Do not hand-align Go blocks with
  leading spaces.
- Keep code simple. Prefer existing local patterns and small focused functions.
- Do not duplicate logic. Reuse established helpers, ports, presenters, and
  route utilities.

### Server Architecture

- Dependencies flow inward only:
  `transport/http` -> `application` -> `domain`; `infrastructure` implements
  domain ports.
- Keep handlers thin. Request parsing, auth principal extraction, response
  formatting, and HTTP status mapping belong in transport. Business logic
  belongs in application services.
- The domain layer must not depend on transport, middleware, infrastructure, or
  external providers.
- New capabilities should follow the existing shape: domain model/port,
  application service, infrastructure adapter, transport handler, CLI command
  when applicable.

### External IDs

- Never expose internal auto-increment `int64` IDs to any external surface:
  HTTP JSON, URL params, CLI stdout, web responses, WebSocket messages, logs
  shown to clients, or error messages returned to clients.
- Inbound client IDs must be external string IDs resolved through
  `IDResolver`.
- Outbound resource IDs must be produced through presenter DTOs and `IDMapper`.
- Do not directly serialize a domain/resource model that contains internal IDs,
  internal object keys, asset prefixes, storage paths, or other implementation
  details.
- Request body resource IDs must be strings. Do not accept numeric JSON values
  for client-provided resource IDs.
- External ID prefixes are code facts, not AGENTS.md facts. Use
  `pkg/externalid/externalid.go` as the source of truth.

### Internal Storage Paths

- Never expose internal storage paths to clients. This includes fields such as
  `ObjectKey`, `AssetPrefix`, and path strings containing internal IDs.
- Presenter DTOs may expose client-usable URLs such as `upload_url` or
  `object_url`, but not the server-side storage layout.

### Upload References

- Any flow that forwards user-supplied URLs, CLI-uploaded file references, or
  `anycap://upload/...` references to an upstream provider must resolve upload
  references first.
- Do not assume a new generate/edit/read flow is safe because a similar flow is
  safe. Check whether reference URLs can reach an upstream provider.

### Feature Access and Rate Limits

- Every externally callable capability endpoint must have an intentional
  capability name for feature access and rate limiting.
- Use the existing route helpers such as `CapabilityGET`, `CapabilityPOST`,
  `CapabilityPATCH`, and related utilities when registering capability routes.
- Do not maintain feature names by memory. Feature constants live in
  `pkg/feature/feature.go`; route capability names live at handler registration
  sites.
- When adding or changing a capability, consider all of: server feature access,
  rate limit capability name, CLI command behavior, skill documentation, and
  current product status.

### Migrations

- Embedded SQL migrations under `internal/infrastructure/migration/migrations/`
  must be idempotent.
- Once an embedded migration has been deployed to any environment, do not edit
  it. Add a new sequential migration instead.
- Local seed SQL under `deploy/sql/` is for local reset/dev data and can be
  rewritten to represent the intended current local schema.

### Web

- Before changing anything under `web/`, read `web/docs/design-guideline.md`
  and `docs/guideline/web.md`.
- Public web copy about available capabilities must use the web source files as
  the source of truth, not memory or stale docs.
- Do not rewrite landing page copy for SEO work. The landing page and
  `web/src/lib/landing-content.ts` are product-owned surfaces unless the task
  explicitly asks for landing copy changes.
- Components belong in a role-based subdirectory under `web/src/components/`.
  Do not add loose component files directly under `components/`.

### CLI and Skills

- CLI commands belong in the appropriate package under
  `internal/cli/command/`.
- CLI output must remain JSON-first for non-TTY and automation-friendly usage.
- After changing CLI behavior, test or otherwise verify the CLI first, then
  update relevant skill files under `skills/` to match actual behavior.
- Do not update skill documentation based only on intended behavior.

### Product Status

- After shipping a product-facing feature, update
  `docs/anycap-current-status.md`.
- That file is a current-state snapshot, not a changelog. Overwrite the
  relevant section with what exists now.

### Release Safety

- Do not push release branches, tags, or deploy branches unless the user has
  explicitly asked for a release/deploy action.
- CLI release notes require explicit user approval before pushing a release
  branch.
- Keep CLI and skills release flows aligned as described in
  `docs/guideline/release.md`.

## Current Source of Truth

Use these files to resolve facts that change frequently:

| Fact | Source |
|---|---|
| Feature constants | `pkg/feature/feature.go` |
| External ID prefixes | `pkg/externalid/externalid.go` |
| API paths used by CLI/server contracts | `pkg/api/paths.go` |
| HTTP route registration | `internal/app/bootstrap.go`, `internal/transport/http/handlers/**` |
| CLI command tree | `internal/cli/command/root.go` and command packages |
| Web capability language | `web/src/lib/site.ts`, `web/src/lib/capability-inventory.ts`, `web/public/llms.txt` |
| Web design language | `web/docs/design-guideline.md` |
| Current product surface | `docs/anycap-current-status.md` |
| CI behavior | `.gitlab-ci.yml` |

Do not copy large, fast-changing tables from those files into AGENTS.md.
