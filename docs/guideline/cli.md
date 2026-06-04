# CLI Guidelines

## Purpose

Use this when changing `anycap` commands, flags, output, config, credentials,
local tools, or CLI-server contracts.

## Source of Truth

- CLI entry point: `cmd/anycap/`
- Root command: `internal/cli/command/root.go`
- Capability commands: `internal/cli/command/cap/`
- Infrastructure commands: `internal/cli/command/infra/`
- Meta/management commands: `internal/cli/command/meta/`
- Shared API paths: `pkg/api/paths.go`
- HTTP client: `internal/cli/httpclient/`
- Output helpers: `internal/cli/output/`
- CLI config/credentials: `internal/cli/config/`
- CLI tests: `internal/cli/command/**/*_test.go`

## Architecture Rules

- The CLI talks to AnyCap Server over HTTP. It must not call Auth0, Credit,
  NexusHub, storage, payment, or other server-side infrastructure directly.
- Keep CLI commands thin: parse flags, prepare request payloads, call the
  server, and format output.
- Shared endpoint paths should go through `pkg/api/paths.go`.
- Do not hide server errors that agents need. Preserve server error codes,
  hints, and request IDs where output helpers support them.

## Command Placement

- Media and capability commands belong under `internal/cli/command/cap/`.
- Drive, page, snapshot, annotate, draw, and similar infrastructure/local tools
  belong under `internal/cli/command/infra/`.
- Login, status, config, credential, feedback, update, skill, connect, and
  agent management commands belong under `internal/cli/command/meta/`.
- Dynamic extension command code belongs under `internal/cli/command/extension/`.

Follow existing command style before adding a new command shape.

## Output Rules

- CLI output is JSON-first for automation and non-TTY usage.
- Use `internal/cli/output` helpers for server JSON and content passthrough.
- Do not print human-only text to stdout when the command is expected to be
  machine-readable.
- Use stderr for progress, warnings, update notices, and verbose logs.
- Keep request IDs visible when server response helpers already support them.

## Config and Credentials

- Keep preference config separate from credentials.
- Do not print secrets, raw API keys, tokens, or provider credentials unless a
  command is explicitly designed to create/show a one-time secret.
- Credential files and local daemon credential stores must preserve restrictive
  permissions.

## File Uploads

- Local file inputs should use existing upload helpers.
- Schema-driven media params should use `resolveFileParams` rather than
  ad-hoc path detection.
- Server-side upload reference resolution is still required. CLI upload does
  not remove the server's obligation to resolve `anycap://upload/...` before
  provider calls.

## Testing CLI Changes

Prefer command tests through `NewRootCmd` or command constructors with injected
stdin/stdout/stderr and an `httptest.NewServer` or CLI mock server.

Verify:

- flags and args
- endpoint path and method
- JSON output shape
- error propagation
- request ID behavior when relevant
- local file upload paths when relevant

After CLI behavior is verified, update skill docs if the changed behavior is
agent-facing.
