# Doubao Seed Audio AnyCap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add production-grade `doubao-seed-audio-1-0` generation to AnyCap HTTP, catalog, storage, billing, and CLI surfaces.

**Architecture:** Follow the existing image/video/music vertical slice. Public typed audio models live in domain, orchestration lives in `internal/application/audio`, NexusHub mapping stays in infrastructure, and HTTP/CLI remain thin adapters. Discovery drives schema constraints while an audio-specific projector translates structured references into stable AnyCap parameters.

**Tech Stack:** Go, CloudWeGo Hertz, Cobra, NexusHub Core/Discovery, PostgreSQL-backed artifact publisher, DConf curation/feature/rate limits.

## Global Constraints

- Work directly on `feat_new_model`.
- Do not commit, stage, push, merge, tag, release, or deploy.
- Use TDD: every production behavior must be preceded by a test that fails for the expected reason.
- Preserve JSON-first CLI output and existing HTTP contracts.
- Resolve all `anycap://upload/...` references before provider invocation.
- Do not expose internal IDs, object keys, provider log IDs, or raw storage paths.

---

### Task 1: Domain Audio Contract

**Files:**
- Create: `internal/domain/model/audio.go`
- Create: `internal/domain/model/audio_test.go`
- Modify: `internal/domain/model/catalog.go`
- Modify: `internal/domain/port/nexushub.go`
- Modify: `internal/infrastructure/nexushub/stub.go`

**Interfaces:**
- Produces `GenerateAudioRequest.Validate`, `InferAudioMode`, `GenerateAudioResult`, `AudioArtifact`, and the capability-scoped `AudioGenerationClient` port.
- Modes are `text-to-audio`, `audio-to-audio`, and `image-to-audio`.

- [x] Write tests for required model/prompt, reference cardinality, explicit-mode conflicts, and inference.
- [x] Run `go test ./internal/domain/model` and verify failure because audio types are absent.
- [x] Add the minimal domain types, validation, capability-scoped port, and stub implementation without widening the legacy multi-media client interface.
- [x] Run `go test ./internal/domain/model ./internal/infrastructure/nexushub` and verify green.

### Task 2: Catalog Projection and Curation

**Files:**
- Modify: `internal/infrastructure/curatedcatalog/catalog.go`
- Modify: `internal/infrastructure/curatedcatalog/flatten.go`
- Modify: `internal/infrastructure/curatedcatalog/catalog_test.go`
- Modify: `internal/infrastructure/curatedcatalog/flatten_test.go`
- Modify: `internal/infrastructure/curatedcatalog/default_curation.json`

**Interfaces:**
- Consumes NexusHub Discovery `audio_option` schemas and provider identity.
- Produces stable model schemas with `speaker_ids`, `audios`, or `images`.

- [x] Add failing tests for all three audio algo projections and scheduler route type.
- [x] Run `go test ./internal/infrastructure/curatedcatalog` and confirm the new assertions fail.
- [x] Implement capability-aware audio projection, drop upstream references, and derive route type from provider.
- [x] Add the curated `doubao-seed-audio-1-0` model with three generate modes.
- [x] Run curated-catalog tests and verify green.

### Task 3: NexusHub Typed Audio Adapter

**Files:**
- Modify: `internal/infrastructure/nexushub/client.go`
- Create: `internal/infrastructure/nexushub/audio_client_test.go`

**Interfaces:**
- Consumes `GenerateAudioRequest` and `RouteBinding`.
- Produces a Core payload with typed `audio_option.references` and a typed `GenerateAudioResult`.

- [x] Add failing HTTP characterization tests for the three payload modes and full live-shaped response metadata.
- [x] Run the named tests and confirm failure because `GenerateAudio` is missing.
- [x] Add `atomicAudioOption`, `atomicAudioReference`, response metadata decoding, and robust URL-path MIME inference.
- [x] Extract only the common submit transport needed to avoid a fourth copy, retaining image/video/music behavior.
- [x] Run all NexusHub infrastructure tests and verify green.

### Task 4: Audio Application Service and Artifact Publication

**Files:**
- Create: `internal/application/audio/service.go`
- Create: `internal/application/audio/service_test.go`
- Modify: `internal/domain/model/caps_artifact.go`
- Modify: `internal/application/artifact/publisher.go`
- Modify: `internal/application/artifact/publisher_test.go`

**Interfaces:**
- Consumes catalog, NexusHub, credit, billing, usage, call-log, upload resolver, and artifact publisher ports.
- Produces `InvocationResult[GenerateAudioResult]` with published artifacts and preserved metadata.

- [x] Add failing service tests for route selection, upload resolution, empty output, publisher merge, billing, usage, and logs.
- [x] Add failing publisher tests for Audio filename/MIME fallback.
- [x] Run focused tests and confirm expected failures.
- [x] Implement the service with `execflow.Run` and add the audio artifact media type/fallbacks.
- [x] Run application audio and artifact tests and verify green.

### Task 5: Bootstrap and HTTP API

**Files:**
- Create: `internal/transport/http/dto/audio.go`
- Create: `internal/transport/http/handlers/audio/handler.go`
- Create: `internal/transport/http/handlers/audio/handler_test.go`
- Modify: `internal/app/compose_shared.go`
- Modify: `internal/app/compose_media.go`
- Modify: `internal/app/bootstrap.go`
- Modify: `internal/app/bootstrap_test.go`
- Modify: `internal/transport/http/router_test.go`
- Modify: `pkg/feature/feature.go`
- Modify: `internal/middleware/feature_gate.go`
- Modify: `internal/middleware/feature_gate_test.go`

**Interfaces:**
- Exposes `POST /v1/audio/generate` with capability name `audio.generate`.

- [x] Add failing handler/router/feature tests for request mapping, auth context, registration, enabled, disabled, and denied access.
- [x] Run focused tests and confirm expected failures.
- [x] Implement thin DTO/handler and bootstrap wiring with existing capability helpers.
- [x] Add the feature constant/default and dynamic audio prefix.
- [x] Run HTTP, middleware, and bootstrap tests and verify green.

### Task 6: CLI Audio Command

**Files:**
- Create: `internal/cli/command/cap/audio.go`
- Create: `internal/cli/command/cap/audio_test.go`
- Create: `internal/cli/command/cap/media_output.go`
- Create: `internal/cli/command/cap/media_output_test.go`
- Modify: `internal/cli/command/root.go`
- Modify: `internal/cli/command/root_test.go`

**Interfaces:**
- Exposes `anycap audio models` and `anycap audio generate`.
- Reuses `api.GeneratePath("audio")`, `resolveFileParams`, server JSON helpers, and downloader utilities.

- [x] Add failing root/command tests for model schema, payload, local reference upload, JSON response, and MP3/WAV filename selection.
- [x] Run CLI command tests and confirm expected failures.
- [x] Implement the command with schema-driven `--param` handling and JSON-first output.
- [x] Run CLI tests and verify green.

### Task 7: Configuration, Skills, and Product Status

**Files:**
- Modify: `configs/server/dconf/feature_access.example.json`
- Modify: `configs/server/dconf/rate_limit.example.json`
- Modify: `docs/anycap-current-status.md`
- Modify: `skills/anycap-cli/SKILL.md`
- Modify: relevant `skills/anycap-cli/references/*.md`
- Regenerate: `internal/cli/skill/embedded/`

**Interfaces:**
- Documents only behavior already verified by Tasks 1-6.

- [x] Verify exact DConf example filenames and current skill command structure.
- [x] Update feature/rate examples and current-state documentation.
- [x] Add concise executable CLI examples without duplicating the live model catalog.
- [x] Run `make sync-skills` and verify distributed/embedded copies are aligned.

### Task 8: Completion Verification

**Files:** all changed files.

- [x] Run `gofmt` on all changed Go files.
- [x] Run all focused package tests touched above.
- [x] Run `go test ./...`.
- [x] Run `go vet ./...`.
- [x] Run `git diff --check`.
- [x] Run a dev HTTP/CLI smoke when local server dependencies are available; otherwise report the exact unrun boundary.
- [x] Review the diff against the approved design, external-ID rules, upload-ref rules, and feature/rate-limit checklist.
- [x] Confirm `git status` shows only intended uncommitted files and no staged changes.
