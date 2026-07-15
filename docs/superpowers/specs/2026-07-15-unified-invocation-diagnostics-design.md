# Unified Invocation Diagnostics And Feedback Design

## Purpose

Give every product-facing model or provider invocation a consistent,
actionable diagnostic trail from the AnyCap CLI through AnyCap Server and its
downstream provider. When a user reports a failure, the resulting Feishu
feedback must carry the identifiers and failure stage for the original model
invocation rather than only the identifier of the later feedback submission.

The immediate motivation is a class of silent media failures where a provider
returns a successful status or task identifier but no usable output. The same
troubleshooting problem exists across media generation, web capabilities,
grounding search, and media understanding, so this design establishes one
invocation contract instead of capability-specific patches.

## Approved Scope

Apply the contract to every current product-facing model or provider
invocation:

- `image.generate`
- `video.generate`
- `music.generate`
- `web.search` in general and grounding modes
- `web.crawl`
- `image.read`
- `video.read`
- `audio.read`

The work covers:

- provider-neutral invocation metadata and structured errors;
- downstream trace propagation and response identifier capture;
- API success and error diagnostics;
- CLI success, error, progress, and feedback output;
- capability-specific meaningful-result validation;
- NexusHub task metadata preservation without adding result polling;
- structured feedback ingestion and legacy normalization;
- Feishu feedback rendering;
- focused server, adapter, CLI, feedback, and integration tests;
- relevant CLI skill documentation after behavior is verified;
- the current product status snapshot after the product-facing behavior ships.

This is one cross-cutting observability contract. It does not make each
capability share provider-specific business logic.

## Current-State Findings

| Invocation | Provider path | End-to-end trace | Downstream task ID | CLI retains task ID | Meaningful-result check |
|---|---|---:|---:|---:|---:|
| `image.generate` | NexusHub atomic process | yes | yes | yes | no |
| `video.generate` | NexusHub atomic process | yes | yes | yes | no |
| `music.generate` | NexusHub atomic process | yes | yes | no | no |
| general `web.search` | NexusHub atomic process | yes | available internally, then discarded | no | zero results are allowed |
| `web.crawl` | NexusHub atomic process | yes | available internally, then discarded | no | yes |
| grounding `web.search` | Agent Platform synchronous API | yes | normally absent | trace/request only | no |
| image/video/audio read | Agent Platform synchronous API | yes | normally absent | trace/request only | no |

Additional findings:

- The CLI generates a `trc_...` identifier before command execution and sends
  it as `X-Trace-ID`.
- AnyCap's response envelope and response headers already preserve the server
  request trace, but error envelopes cannot carry downstream identifiers or a
  failure stage.
- NexusHub media results already contain a task identifier in `data.id`.
  Image/video's shared CLI parser preserves it; music's parser drops it.
- NexusHub web search and crawl use the shared result poller when a task has no
  inline payload, but the domain result does not preserve the task identifier.
- A poll timeout includes the task identifier only in an error string.
- Agent Platform calls propagate the trace through the common HTTP transport,
  but AnyCap does not deliberately capture a distinct downstream response
  request identifier when one is returned.
- A provider task identifier can be lost after provider acceptance if artifact
  publication, billing, or another application step fails.
- The Feishu notifier can already render request, trace, and task identifiers
  when callers manually place them in separate legacy fields. The missing piece
  is a reliable structured path from the original invocation to feedback.

The existing focused tests pass. They test individual happy paths, not a
repository-wide rule requiring diagnostic preservation.

## Goals

1. Every invocation has a client-visible AnyCap trace identifier.
2. Every downstream task or request identifier returned to AnyCap survives all
   later success and failure paths.
3. A provider terminal success with no meaningful capability result is not
   reported as an AnyCap success.
4. A user can report a problem without manually reconstructing identifiers.
5. Feishu feedback shows the original invocation's diagnostics in a consistent
   order.
6. Logs use a common field vocabulary so one trace search reveals the
   component and stage where execution stopped.
7. Providers without an asynchronous task identifier still participate fully
   through the AnyCap trace and optional downstream request identifier.
8. The contract is additive for current API and CLI consumers.

## Non-Goals

- Do not introduce a first-class asynchronous AnyCap invocation resource or a
  new status/result endpoint.
- Do not expose provider credentials, ability keys, raw provider responses,
  storage paths, prompts, media contents, or internal auto-increment IDs.
- Do not require every provider to invent a task identifier.
- Do not add live provider lookups when a feedback report is submitted.
- Do not redesign billing, refund, pricing, or provider-cost policy.
- Do not generalize `provider_runs` persistence to every synchronous provider
  in this change.
- Do not include model catalog, upload, Drive, Page, or local
  Codex/Claude/Cursor runner operations in the invocation contract.

## Identifier Semantics

The identifiers have distinct meanings and must not be conflated:

| Field | Required | Meaning |
|---|---:|---|
| `trace_id` | yes | End-to-end correlation ID created by the CLI or accepted by AnyCap Server and propagated downstream. |
| `request_id` | yes in completed HTTP output | AnyCap Server request ID returned in the response header/envelope. It normally equals `trace_id` today but remains a separate compatibility field. |
| `task_id` | no | Downstream asynchronous task/job ID, such as a NexusHub atomic task identifier. |
| `upstream_request_id` | no | Distinct request ID returned by a synchronous downstream service. |
| feedback `id` | yes for feedback | The `fb_...` identifier of the feedback record, not an invocation identifier. |

`trace_id` is the universal troubleshooting key. `task_id` and
`upstream_request_id` enrich it when the downstream supports them.

No new external invocation ID is introduced. If a future product requires
status queries, cancellation, or resumable results, that work should introduce
an AnyCap-owned external invocation resource in a separate design.

## Domain And Application Contract

Introduce a provider-neutral invocation metadata value in the domain layer.
Its internal form carries only execution facts, not HTTP or Feishu concerns:

```go
type InvocationMeta struct {
	TaskID            string
	UpstreamRequestID string
	ProviderStatus    string
	Stage             InvocationStage
}
```

Provider port success paths return their business result together with
`InvocationMeta`. Use a generic `InvocationResult[T]` wrapper rather than
repeating metadata fields in every result type:

```go
type InvocationResult[T any] struct {
	Value T
	Meta  InvocationMeta
}
```

Provider failures use a typed error that unwraps its cause and preserves any
metadata learned before failure:

```go
type InvocationError struct {
	Code  string
	Cause error
	Meta  InvocationMeta
}
```

`InvocationError` implements `Unwrap() error`. `errors.Is` and `errors.As`
behavior must continue to work so existing domain error mapping remains valid.

Application services own meaningful-result validation. Infrastructure owns
provider transport, provider status normalization, existing provider-specific
completion behavior, and response decoding. Transport owns the public
diagnostics DTO. This maintains the
repository's dependency direction:

```text
transport/http -> application -> domain
infrastructure -----------------> domain ports
```

Metadata is captured immediately after the provider returns. Any error from a
later application step must be wrapped with the already known metadata so an
accepted provider task is not lost during artifact publication, usage writes,
or billing finalization.

## Invocation Stages

Public stages use a small controlled vocabulary:

- `prepare`
- `submit`
- `poll`
- `decode_result`
- `validate_result`
- `publish`
- `billing`

Internal logs may use more detailed sub-stages, but only these stable values
are exposed to clients and feedback. A stage is omitted when it is not known
or not relevant.

Existing structured error codes remain unchanged where they already describe
the failure. Add only the missing cross-capability codes:

- `UPSTREAM_TIMEOUT`: the provider request or result poll exceeded its
  deadline;
- `UPSTREAM_EMPTY_RESULT`: the provider reached a successful terminal state
  but the capability result was not meaningful.

Provider quota, rate-limit, authentication, validation, and availability
errors continue through their existing mappings. Raw provider messages are
not exposed unless an existing safe mapping already allows them.

## Meaningful-Result Validation

An HTTP 200 or provider `success` value is necessary but not sufficient for an
AnyCap success. Application services apply capability-specific validators
before returning success to transport:

| Invocation | Required result |
|---|---|
| image/video/music generation | At least one output with a non-empty client-usable URL. |
| image/video/audio read | Non-whitespace `content`. |
| grounding web search | Non-whitespace synthesized `content`. |
| web crawl | Non-whitespace `markdown`. |
| general web search | A successfully decoded result list; zero results remain valid. |

Validation failure returns `UPSTREAM_EMPTY_RESULT` with
`stage=validate_result` and all metadata known at that point. It must not exit
successfully or produce a successful empty CLI result.

This contract changes public success/error semantics, not provider accounting
facts. Provider cost and user credit policy remain governed by the existing
billing design and must not be silently changed as part of this work.

## Provider Behavior

### NexusHub

NexusHub image, video, and music adapters preserve diagnostics from the initial
submit response without adding invocation-time polling:

1. Submit with the AnyCap trace propagated in `X-Trace-ID` and the existing
   Nexus extra metadata.
2. Capture `task_id` and provider status immediately.
3. Decode an inline response payload when present.
4. If the payload is empty, return immediately without calling the result
   endpoint; preserve the accepted `task_id` and provider status for downstream
   validation and diagnostics.
5. Preserve `task_id` on provider failure, decode error, empty result, and
   later application failure.
6. If both payload and `task_id` are absent, return a structured empty-result
   failure rather than a false success.

NexusHub general search and crawl retain the result polling behavior that
predates this diagnostics work. This feature wraps their existing inline and
polled responses with the same task/provider metadata; it does not add a new
polling path or change their polling interval and attempt limits.

### Agent Platform

Agent Platform image/video/audio read and grounding search remain synchronous:

1. Propagate the AnyCap trace explicitly through the request context and
   `X-Trace-ID` behavior.
2. Capture a distinct downstream request identifier from supported response
   headers, preferring `X-Trace-ID` and then `X-Request-ID`/`X-Request-Id` when
   the value differs from the AnyCap trace.
3. Store that value as `upstream_request_id`.
4. Do not fabricate `task_id` when the provider has no task concept.
5. Apply meaningful-content validation in the application service.

## HTTP API Contract

Extend the success/error envelope with an additive optional diagnostics DTO:

```json
{
  "id": "trc_abc",
  "status": "success",
  "data": {},
  "diagnostics": {
    "trace_id": "trc_abc",
    "request_id": "trc_abc",
    "task_id": "atomic_xyz",
    "upstream_request_id": "gateway_req_123"
  }
}
```

On failure:

```json
{
  "id": "trc_abc",
  "status": "error",
  "error": {
    "code": "UPSTREAM_EMPTY_RESULT",
    "message": "provider completed without a usable result"
  },
  "diagnostics": {
    "trace_id": "trc_abc",
    "request_id": "trc_abc",
    "task_id": "atomic_xyz",
    "stage": "validate_result"
  }
}
```

Rules:

- `diagnostics` is present on invocation endpoints even when only trace and
  request IDs are known.
- Optional fields are omitted when empty.
- Existing envelope `id`, status, data, and error fields remain unchanged.
- Existing media `data.id` remains available for compatibility; when it is a
  downstream task identifier it must equal `diagnostics.task_id`.
- Handlers use shared success/error response helpers and stay free of
  provider-specific logic.
- Internal provider names, ability keys, storage paths, and internal IDs are
  not part of the public DTO.

## CLI Contract

### Start Progress

Before the primary long-running provider request, every invocation command
writes one structured progress record to stderr:

```json
{"event":"invocation_started","trace_id":"trc_abc","capability":"music.generate","model":"suno-v5.5"}
```

This record is emitted by default, not only with `--verbose`, so a process that
hangs or is externally killed still leaves a usable correlation ID. It is sent
to stderr; stdout remains one final automation-friendly JSON document.

The event must not contain prompts, file contents, URLs carrying credentials,
or provider configuration.

### Final Output

All invocation commands preserve the existing data shape while promoting
diagnostics to predictable top-level CLI fields:

```json
{
  "status": "error",
  "error": "UPSTREAM_EMPTY_RESULT",
  "message": "provider completed without a usable result",
  "trace_id": "trc_abc",
  "request_id": "trc_abc",
  "task_id": "atomic_xyz",
  "upstream_request_id": "gateway_req_123",
  "stage": "validate_result"
}
```

The output helpers, not individual commands, own promotion and omission of
diagnostic fields. Media commands may continue their existing flattened result
shape; search, crawl, and read commands may retain the server envelope. The
diagnostic field names are consistent in both cases.

`httpclient.APIError` preserves structured diagnostics so `cmd/anycap/main.go`
can include them in the final non-zero error JSON. Errors must not degrade to a
message containing an embedded task identifier.

### Feedback Handoff

CLI output includes a machine-readable feedback diagnostics object and a hint
that instructs the agent to submit it with the report. The new feedback command
accepts:

```text
anycap feedback --type bug -m "<description>" --diagnostics "<json>"
```

The diagnostics value contains only the allow-listed public fields. Existing
`--request-id`, `--trace-id`, and `--context` flags remain supported.

The CLI feedback-diagnostics builder combines server diagnostics with command
context: capability, requested public model ID when present, command start
time, and the final structured error code. It never derives those fields from
the free-form feedback message.

Command construction must be tested on Unix-style shells and Windows argument
handling. The CLI should expose the diagnostics as structured JSON in its
result in addition to any human-readable hint so agents do not need to parse a
shell command to recover the values.

## Feedback API And Storage

Add an explicit optional `diagnostics` object to the feedback request DTO. It
uses the same public field names as invocation responses, plus feedback-safe
context:

```json
{
  "trace_id": "trc_abc",
  "request_id": "trc_abc",
  "task_id": "atomic_xyz",
  "upstream_request_id": "gateway_req_123",
  "capability": "music.generate",
  "model": "suno-v5.5",
  "stage": "validate_result",
  "error_code": "UPSTREAM_EMPTY_RESULT",
  "invoked_at": "2026-07-15T01:50:42Z"
}
```

The handler normalizes legacy feedback into this object with the following
precedence:

1. Explicit non-empty values in `diagnostics` are authoritative.
2. Missing trace/request fields are filled from legacy top-level
   `trace_id`/`request_id`.
3. A missing task ID is filled from legacy `context.task_id`.
4. Legacy fields never overwrite explicit diagnostics.

Keep arbitrary user context separate from diagnostics. Persist the normalized
diagnostics inside the existing feedback JSON metadata rather than adding a
new SQL column. This requires no migration and preserves the current feedback
record schema.

The feedback submission request has its own transport trace. That trace may be
logged internally but must not replace the original invocation trace in the
stored diagnostics or Feishu card.

## Feishu Feedback Rendering

The Feishu notification displays the original invocation snapshot in a stable
order and omits unavailable values:

```text
[AnyCap/prod] Bug Report

Type: Bug Report
Feedback ID: fb_xxx
User: 200000003

Capability: music.generate
Model: suno-v5.5
Error Code: UPSTREAM_EMPTY_RESULT
Stage: validate_result

Trace ID: trc_abc
Request ID: trc_abc
Task ID: atomic_xyz
Upstream Request ID: gateway_req_123
Invoked At: 2026-07-15T01:50:42Z

<user message>

CLI 0.3.7 | windows/amd64 | Reported 2026-07-15T01:52:10Z
```

Rendering rules:

- The feedback `fb_...` ID remains clearly labeled and is never presented as
  an invocation ID.
- Invocation identifiers are rendered in copy-friendly code formatting.
- Invocation time comes from diagnostics; feedback report time comes from the
  feedback record. They are labeled separately and are never substituted for
  one another.
- Empty values are omitted rather than rendered as blanks.
- Controlled metadata is rendered before the user message; arbitrary context
  remains in a JSON block below the message.
- Markdown-sensitive diagnostic values are escaped.
- No live NexusHub or Agent Platform query occurs while building the card.

## Logging Contract

Every provider boundary uses the same internal structured field vocabulary:

- `trace_id`
- `capability`
- `model`
- `provider`
- `provider_task_id`
- `upstream_request_id`
- `provider_status`
- `stage`
- `latency_ms`
- `error_code`

Fields are included only when known. Provider adapters log acceptance as soon
as they learn a task/request identifier. Application services log validation
and post-provider stages using the same metadata. Sensitive request content is
never included merely to improve diagnostics.

Existing `billing_intents`, `usage_events`, and `provider_runs` continue their
current responsibilities. Where a media flow already persists a provider task
identifier, it must preserve the identifier before a later failure can discard
it. Cross-provider persistent invocation history is deferred to a future
first-class invocation-resource design.

## Privacy And Safety Boundaries

Public diagnostics and feedback may include only:

- trace/request/task identifiers;
- capability and public model ID;
- controlled stage and error code;
- invocation timestamp;
- CLI version and OS/architecture.

They must not automatically include:

- prompts, lyrics, uploaded media, or generated content;
- authorization headers, API keys, provider tokens, or tenant secrets;
- signed URLs or URLs containing credentials;
- NexusHub ability keys or internal provider routing configuration;
- raw provider request/response payloads;
- object keys, asset prefixes, storage paths, or internal auto-increment IDs.

Diagnostic strings receive reasonable length limits. Identifier validation
must reject control characters and unsafe rendering content without requiring
provider-specific ID prefixes.

## Compatibility

- API envelope changes are additive.
- Existing envelope `id` and media `data.id` fields remain unchanged.
- Existing CLI result data stays available; diagnostics are added or promoted.
- Existing feedback flags and legacy payloads continue to work.
- Existing Feishu reports without diagnostics still render normally.
- Providers without task IDs return trace/request diagnostics only.
- No API endpoint path, feature capability name, or rate-limit capability name
  changes.
- No internal numeric task ID becomes externally visible.

## Testing Strategy

### Domain And Application

- Typed invocation errors unwrap existing domain errors.
- Metadata survives provider failure and failures after provider acceptance.
- Each capability validator accepts a meaningful result and rejects the
  defined empty result.
- General search explicitly accepts a decoded empty result list.

### Provider Adapters

- NexusHub adapters propagate trace headers and preserve task IDs.
- Image, video, and music return the submit response without issuing a result
  poll when the inline payload is empty.
- Search and crawl retain their pre-existing result polling; poll success,
  terminal failure, timeout, context cancellation, and decode errors preserve
  structured metadata.
- Missing-payload and missing-task paths preserve structured metadata.
- Agent Platform propagates trace and captures supported response request-ID
  headers without fabricating a task ID.

### HTTP Transport

- Invocation success envelopes contain diagnostics.
- Invocation error envelopes contain diagnostics and stable error codes.
- Legacy `id` and media `data.id` compatibility is preserved.
- No internal fields appear in serialized diagnostics.

### CLI

- Every invocation command emits exactly one safe start record to stderr.
- Success and error stdout remain valid single-document JSON.
- Media, search, crawl, grounding, and read output preserve available
  diagnostic fields.
- Non-zero API errors retain task/request identifiers and stage.
- Feedback diagnostics arguments are accepted on supported operating-system
  argument paths.

### Feedback And Feishu

- Explicit diagnostics are persisted and rendered.
- Legacy request/trace/context fields normalize correctly.
- Explicit diagnostics win conflicts with legacy values.
- The feedback submission trace does not replace the invocation trace.
- Optional fields are omitted, values are escaped, and arbitrary context stays
  separate.
- Feishu output includes capability, model, error code, stage, and all known
  invocation identifiers in the specified order.

### Cross-Layer Verification

At minimum, route-level or integration tests cover:

1. successful media generation with trace and task ID;
2. NexusHub web task accepted, polled, then completed;
3. NexusHub web task timeout retaining trace and task ID;
4. provider terminal success with empty media output returning
   `UPSTREAM_EMPTY_RESULT`;
5. Agent Platform read failure with trace and optional upstream request ID;
6. CLI diagnostics passed into feedback and rendered in Feishu.

After focused tests pass, run the repository's relevant broader Go test suite.
After CLI behavior is verified, update the distributed CLI skill references to
describe the real output and feedback behavior. Do not update skill files from
the intended contract before CLI tests prove it.

## Rollout Sequence

1. Add domain metadata/error primitives and transport diagnostics DTOs.
2. Add NexusHub metadata preservation across atomic invocation adapters without
   adding polling or changing provider request volume.
3. Add Agent Platform response identifier capture.
4. Add application meaningful-result validators and metadata-preserving
   post-provider errors.
5. Add API success/error diagnostics.
6. Update CLI HTTP errors, output helpers, start progress, and each invocation
   command.
7. Add structured feedback diagnostics, legacy normalization, persistence, and
   Feishu rendering.
8. Run focused and broader verification.
9. Update relevant CLI skill documentation and
   `docs/anycap-current-status.md` to match verified behavior.

## Acceptance Criteria

- Every scoped invocation returns or emits a trace ID that support can search.
- Every available downstream task/request ID appears in structured API/CLI
  diagnostics on both success and failure.
- A killed or hanging CLI invocation leaves its trace ID on stderr.
- Empty media/read/grounding/crawl results follow their defined error semantics
  and do not exit as success.
- General search can legitimately return zero results.
- Feedback submitted from an invocation carries a structured diagnostics
  snapshot without relying on server-side guessing.
- Feishu shows the original invocation diagnostics and clearly distinguishes
  the feedback record ID.
- Existing API response fields and legacy feedback clients remain compatible.
- No secret, internal storage path, ability key, or internal numeric ID is
  exposed.

## Approval

This design was approved in conversation on 2026-07-15. It is ready for an
implementation plan after review of this written specification.
