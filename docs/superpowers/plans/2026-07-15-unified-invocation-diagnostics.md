# Unified Invocation Diagnostics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Return trace IDs, downstream task/request IDs, and stable failure stages for every current product-facing model invocation, and preserve those diagnostics in CLI output and Feishu feedback.

**Architecture:** Add provider-neutral invocation metadata and typed errors to the domain layer. Provider adapters populate metadata, application services validate meaningful results and preserve metadata through later failures, HTTP transport presents an additive diagnostics object, and the CLI promotes that object into automation-friendly output and feedback. Feedback stores normalized diagnostics in existing JSON metadata, so no migration is required.

**Tech Stack:** Go 1.24, Hertz HTTP handlers, Cobra CLI, common-go trace transport, PostgreSQL JSONB repositories, Go `testing`/`httptest`.

## Global Constraints

- Preserve the dependency direction `transport/http -> application -> domain`; infrastructure implements domain ports.
- Never expose internal numeric IDs, storage paths, provider ability keys, credentials, prompts, or raw provider payloads.
- Keep current `data.id` media task-ID behavior compatible while making `diagnostics.task_id` authoritative and consistent.
- Keep non-TTY CLI stdout as exactly one final JSON document; the default invocation-start event goes to stderr.
- Public stages are limited to `prepare`, `submit`, `poll`, `decode_result`, `validate_result`, `publish`, and `billing`.
- General web search with zero results is valid; all other scoped capabilities require their approved meaningful result.
- Use `gofmt` after every Go edit and do not modify deployed migration files.

---

### Task 1: Domain invocation primitives and error semantics

**Files:**
- Create: `internal/domain/model/invocation.go`
- Create: `internal/domain/model/invocation_test.go`

- [x] Write tests proving that `InvocationError` preserves `Code` and `Meta`, unwraps its cause through `errors.Is`/`errors.As`, and that metadata merging never erases a known task/request ID.
- [x] Run `go test ./internal/domain/model -run 'TestInvocation'` and confirm the tests fail because the new types do not exist.
- [x] Add `InvocationStage`, the seven stage constants, `InvocationMeta`, `InvocationResult[T]`, and `InvocationError` with `Error()` and `Unwrap()`.
- [x] Add focused helpers `InvocationMetaFromError`, `WrapInvocationError`, and `MergeInvocationMeta`; the latter fills missing fields from the newer metadata and lets a non-empty newer stage/status advance execution state.
- [x] Run `gofmt` and the focused test until green.

The core contracts are:

```go
type InvocationResult[T any] struct {
	Value T
	Meta  InvocationMeta
}

type InvocationError struct {
	Code  string
	Cause error
	Meta  InvocationMeta
}
```

### Task 2: Public HTTP diagnostics envelope and error mapping

**Files:**
- Modify: `internal/transport/http/dto/error.go`
- Create: `internal/transport/http/dto/error_test.go`
- Modify: `internal/transport/http/handlers/response.go`
- Create: `internal/transport/http/handlers/response_test.go`

- [x] Add failing DTO tests for success and error envelopes containing `diagnostics.trace_id`, `request_id`, optional `task_id`, optional `upstream_request_id`, and controlled `stage`; verify omitted optional fields do not serialize.
- [x] Add failing mapping tests for `UPSTREAM_TIMEOUT` and `UPSTREAM_EMPTY_RESULT`, including preservation of wrapped domain errors.
- [x] Implement `InvocationDiagnostics` and add `Diagnostics *InvocationDiagnostics` to `Envelope` without changing existing fields.
- [x] Implement a single mapper from trace/request ID plus `model.InvocationMeta` to public diagnostics. Do not serialize `ProviderStatus` unless it maps to an approved public value.
- [x] Add `WriteInvocationSuccess` and `WriteInvocationError`; keep existing helpers unchanged for non-invocation endpoints.
- [x] Map timeout to HTTP 504 and empty result to HTTP 502 while keeping existing error mappings intact.
- [x] Run `go test ./internal/transport/http/dto ./internal/transport/http/handlers`.

### Task 3: NexusHub media metadata preservation

**Files:**
- Modify: `internal/domain/port/nexushub.go`
- Modify: `internal/infrastructure/nexushub/client.go`
- Modify: `internal/infrastructure/nexushub/stub.go`
- Modify: `internal/infrastructure/nexushub/client_test.go`
- Modify: `internal/infrastructure/nexushub/client_extended_test.go`
- Modify interface fakes in: `internal/application/{image,video,music,billing,usage}/*_test.go`

- [x] Change the three generation port methods to return `model.InvocationResult[model.Generate*Result]` and update compile-only fakes.
- [x] Add failing adapter tests for inline success metadata, accepted tasks with empty inline payload, provider failure, and malformed result. Every failure after task acceptance must expose the same task ID and the correct stage.
- [x] Confirm the focused tests fail before implementation.
- [x] Return immediately after submit for image/video/music; do not add result polling when `resp_payload` is empty.
- [x] Wrap submit and decode failures with `InvocationError`; return `InvocationResult` with task ID and provider status.
- [x] Keep the legacy business result `ID` equal to `Meta.TaskID` for API compatibility and billing/provider-run logic.
- [x] Run `gofmt` and `go test ./internal/infrastructure/nexushub ./internal/application/image ./internal/application/video ./internal/application/music ./internal/application/billing ./internal/application/usage`.

### Task 4: NexusHub web invocation metadata

**Files:**
- Modify: `internal/domain/port/web.go`
- Modify: `internal/infrastructure/nexushub/web_client.go`
- Modify: `internal/infrastructure/nexushub/web_client_test.go`
- Modify: `internal/application/web/service.go`
- Create: `internal/application/web/service_test.go`

- [x] Change general search and crawl provider ports to return `InvocationResult`; update `CrawlOutput` callers.
- [x] Add failing adapter tests showing inline/polled task IDs on success and preservation through poll/decode failures without changing the pre-existing web polling behavior.
- [x] Add failing application tests proving zero general-search results succeed, while blank crawl markdown returns `UPSTREAM_EMPTY_RESULT` at `validate_result` with the task ID.
- [x] Implement the provider wrappers and application validation without exposing NexusHub-specific fields.
- [x] Run `go test ./internal/infrastructure/nexushub ./internal/application/web`.

### Task 5: Media application validation and post-provider failure preservation

**Files:**
- Modify: `internal/application/image/service.go`
- Modify: `internal/application/image/service_test.go`
- Modify: `internal/application/video/service.go`
- Modify: `internal/application/video/service_test.go`
- Modify: `internal/application/music/service.go`
- Modify: `internal/application/music/service_test.go`
- Modify: `internal/application/execflow/types.go`
- Modify: `internal/application/execflow/executor.go`
- Modify: `internal/application/execflow/executor_test.go`

- [x] Add failing tests for empty/blank output URLs for image, video, and music. Expect `UPSTREAM_EMPTY_RESULT`, `validate_result`, and the accepted task ID.
- [x] Add failing tests for artifact publication and billing-finalization errors after provider acceptance; expect the same task ID with `publish` or `billing`.
- [x] Update service return types to `InvocationResult[model.Generate*Result]` through the application-facing interfaces and preserve metadata immediately after the provider call.
- [x] Add a small shared meaningful-media-output validator instead of duplicating URL checks.
- [x] Wrap all later errors with the retained metadata and stage while preserving `errors.Is` compatibility.
- [x] Run the three application package tests plus `go test ./internal/application/execflow`.

### Task 6: Agent Platform response IDs and read/grounding validation

**Files:**
- Modify: `internal/domain/port/capabilities.go`
- Modify: `internal/domain/port/web.go`
- Modify: `internal/infrastructure/agentplatform/client.go`
- Modify: `internal/infrastructure/agentplatform/stub.go`
- Create: `internal/infrastructure/agentplatform/client_test.go`
- Modify: `internal/application/capabilities/service_invoke.go`
- Modify: `internal/application/capabilities/service_test.go`
- Modify: `internal/application/web/service.go`
- Modify: `internal/application/web/service_test.go`

- [x] Change Agent Platform provider methods to return invocation wrappers.
- [x] Add `httptest` coverage proving `X-Request-ID`/`X-Trace-ID` response headers are captured only as `upstream_request_id` when distinct from the AnyCap trace, and transport/decode errors carry `submit`/`decode_result`.
- [x] Add failing application tests for whitespace-only image/video/audio read content and grounding content; expect `UPSTREAM_EMPTY_RESULT` at `validate_result` with any upstream request ID preserved.
- [x] Implement a shared non-whitespace content validator and wrap later balance/usage failures at `billing`.
- [x] Run `go test ./internal/infrastructure/agentplatform ./internal/application/capabilities ./internal/application/web`.

### Task 7: Invocation-aware HTTP handlers

**Files:**
- Modify: `internal/transport/http/handlers/image/handler.go`
- Modify: `internal/transport/http/handlers/video/handler.go`
- Modify: `internal/transport/http/handlers/music/handler.go`
- Modify: `internal/transport/http/handlers/web/handler.go`
- Modify: `internal/transport/http/handlers/capabilities/handler.go`
- Modify: `internal/transport/http/router_test.go`

- [x] Add failing router tests for one success and one diagnostic failure per invocation family, asserting trace/request IDs and optional downstream IDs in the envelope.
- [x] Route scoped successes through `WriteInvocationSuccess` and failures through `WriteInvocationError` while leaving unrelated endpoints unchanged.
- [x] Verify current response bodies remain additive and media `data.id` remains present.
- [x] Run `go test ./internal/transport/http/...`.

### Task 8: CLI progress, final output, errors, and feedback handoff

**Files:**
- Modify: `internal/cli/httpclient/client.go`
- Modify: `internal/cli/httpclient/client_test.go`
- Modify: `internal/cli/output/json.go`
- Modify: `internal/cli/output/json_test.go`
- Modify: `internal/cli/command/cap/{image.go,video.go,music.go,search.go,crawl.go,actions.go}`
- Modify tests in: `internal/cli/command/cap/*_test.go`, `internal/cli/command/cap_test.go`
- Modify: `cmd/anycap/main.go`
- Add or modify: `cmd/anycap/main_test.go`

- [x] Add failing HTTP-client tests proving `APIError` parses the diagnostics object and exposes trace/task/upstream/stage fields.
- [x] Add failing output tests proving successful final stdout promotes `trace_id`, `request_id`, `task_id`, `upstream_request_id`, and `stage` while remaining one valid JSON document.
- [x] Add failing command tests proving music retains its task ID and every scoped invocation writes exactly one `{"event":"invocation_started",...}` JSON line to stderr by default.
- [x] Implement a shared CLI invocation-start writer and call it only after local validation but before the HTTP request.
- [x] Promote server diagnostics in the shared output layer; remove capability-specific task-ID reconstruction where the shared path supersedes it.
- [x] Make error hints generate a copyable feedback command containing structured invocation diagnostics, with shell-safe values and no prompt/media contents.
- [x] Run `go test ./internal/cli/... ./cmd/anycap`.

### Task 9: Feedback normalization, persistence, and Feishu rendering

**Files:**
- Modify: `internal/domain/model/feedback.go`
- Modify: `internal/transport/http/dto/feedback.go`
- Modify: `internal/transport/http/handlers/feedback/handler.go`
- Modify: `internal/transport/http/handlers/feedback/handler_test.go`
- Modify: `internal/application/feedback/service.go`
- Modify: `internal/application/feedback/service_test.go`
- Modify: `internal/cli/command/meta/feedback.go`
- Modify: `internal/cli/command/feedback_test.go`
- Modify: `internal/infrastructure/lark/webhook.go`
- Create: `internal/infrastructure/lark/webhook_test.go`

- [x] Introduce a structured feedback diagnostics value with `trace_id`, `request_id`, `task_id`, `upstream_request_id`, `capability`, `model`, `stage`, `error_code`, and `invoked_at`.
- [x] Add failing handler/service tests for direct structured input and normalization of legacy `trace_id`, `request_id`, and `context.task_id` into the same metadata object.
- [x] Add failing CLI tests for a `--diagnostics` JSON flag and explicit compatibility flags, rejecting malformed JSON and unsafe stage values.
- [x] Add failing Feishu tests asserting the card renders original invocation diagnostics in a stable order and does not label the feedback submission trace as the invocation trace.
- [x] Implement normalization in the application service before persistence/notifier dispatch; persist in the existing JSON metadata column and add no migration.
- [x] Implement Feishu rendering with only non-empty approved fields.
- [x] Run `go test ./internal/application/feedback ./internal/transport/http/handlers/feedback ./internal/cli/command ./internal/infrastructure/lark`.

### Task 10: Documentation and complete verification

**Files:**
- Modify after verified behavior: `internal/cli/skill/embedded/anycap-cli/SKILL.md`
- Modify after verified behavior: relevant files under `internal/cli/skill/embedded/anycap-cli/references/`
- Modify after verified behavior: matching source files under `skills/anycap-cli/`
- Modify: `docs/anycap-current-status.md`

- [x] Run focused CLI tests first, then document the actual diagnostics/progress/feedback syntax in embedded and source skill copies.
- [x] Update the current-status snapshot with the shipped invocation diagnostics contract; describe current behavior, not history.
- [x] Run `gofmt` on all changed Go files.
- [x] Run focused verification:

```bash
go test ./internal/domain/model ./internal/infrastructure/nexushub ./internal/infrastructure/agentplatform
go test ./internal/application/image ./internal/application/video ./internal/application/music ./internal/application/capabilities ./internal/application/web ./internal/application/feedback
go test ./internal/transport/http/... ./internal/cli/... ./cmd/anycap
```

- [x] Run `go test ./...` and fix regressions without weakening diagnostic assertions.
- [x] Run `git diff --check`, inspect `git diff --stat`, and search changed public DTOs for forbidden internal numeric IDs/storage fields.
- [x] Review the finished implementation against every approved invocation in the design and report any intentionally omitted behavior before claiming completion.
