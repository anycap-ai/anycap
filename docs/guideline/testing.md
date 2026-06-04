# Testing Guidelines

## Purpose

Use this when deciding what tests to run or where to add tests.

## Source of Truth

- Go test entry point: `go test ./...`
- Repository Makefile: `Makefile`
- CLI tests: `internal/cli/command/**/*_test.go`
- Server/router tests: `internal/transport/http/**/*_test.go`
- Integration tests: `test/integration/`
- E2E tests: `test/e2e/`
- Repository layout tests: `test/repository_layout_test.go`
- Web scripts: `web/package.json`
- Edge worker scripts: `workers/edge/package.json`

## General Rule

Test coverage should scale with risk:

- Narrow helper changes need focused unit tests.
- Handler/API changes need route or handler tests.
- CLI behavior changes need command tests.
- Cross-layer behavior needs integration or e2e tests.
- Web route/SEO changes need web build/check scripts when feasible.
- Worker changes need worker typecheck/tests.

## Go Tests

Use package-local `_test.go` files for unit tests. Use `test/integration/` and
`test/e2e/` for broader flows.

The Makefile may build embedded local UIs and sync embedded skills before
running all tests. If you run raw `go test ./...` instead of `make test`, report
that distinction when it matters.

## CLI Tests

Prefer constructing commands with injected stdin/stdout/stderr and mock HTTP
servers. Assert command output, request path/method, payload shape, and error
behavior.

## Web and Worker Tests

Use the scripts in each package as the source of truth:

- `web/package.json` for web build and SEO checks.
- `workers/edge/package.json` for worker typecheck and tests.

Report unrun checks clearly in final responses.

## When Not Running Tests

If tests are too expensive, blocked by environment, or unrelated to a docs-only
change, say that explicitly and explain the remaining risk.
