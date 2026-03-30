# Usage Ledger And API Key Management Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a unified AnyCap usage ledger, NexusHub provider run tracking, and dashboard API key management with disable/delete actions and per-key usage summaries.

**Architecture:** Introduce `usage_events` as the product-facing usage ledger and `provider_runs` as the provider-facing execution detail table. Keep NexusHub on platform-token mode, persist `task_id` linkage locally, backfill provider usage/cost asynchronously, and expose dashboard-facing aggregates from AnyCap-owned tables.

**Tech Stack:** Go, Hertz, PostgreSQL, existing external ID system, Next.js dashboard, SWR hooks, repo-local migration runner, repository-backed services and transport handlers.

**Design References:**
- `docs/plans/2026-03-30-usage-ledger-and-api-key-management-design.md`

---

### Task 1: Add domain models and ports for usage ledger

**Files:**
- Create: `internal/domain/model/usage_event.go`
- Create: `internal/domain/model/provider_run.go`
- Create: `internal/domain/port/usage.go`
- Modify: `internal/domain/model/apikey.go`
- Test: `internal/application/system/service_test.go`

**Step 1: Write the failing tests**

- Add tests that describe:
  - usage event creation for a NexusHub-backed action
  - provider run linkage by `task_id`
  - API key list item includes usage summary fields

**Step 2: Run targeted tests to verify the gap**

Run:

```bash
go test ./internal/application/system -run 'Test.*APIKey|Test.*Usage' -v
```

Expected: missing types / methods / compile failures.

**Step 3: Add minimal domain types and interfaces**

- Define `UsageEvent`
- Define `ProviderRun`
- Define query and mutation interfaces for usage aggregation and provider run persistence
- Extend API key-related model shape only as needed for management responses

**Step 4: Re-run the targeted tests**

Run:

```bash
go test ./internal/application/system -run 'Test.*APIKey|Test.*Usage' -v
```

Expected: tests compile further, fail later at repository/service layer.

**Step 5: Commit**

```bash
git add internal/domain/model/usage_event.go internal/domain/model/provider_run.go internal/domain/port/usage.go internal/domain/model/apikey.go internal/application/system/service_test.go
git commit -m "feat: add usage ledger domain models"
```

### Task 2: Add PostgreSQL migrations for usage ledger and API key soft delete

**Files:**
- Create: `internal/infrastructure/migration/migrations/0016_usage_events.sql`
- Create: `internal/infrastructure/migration/migrations/0017_provider_runs.sql`
- Create: `internal/infrastructure/migration/migrations/0018_api_keys_soft_delete.sql`
- Test: `internal/infrastructure/migration/migrator_test.go`

**Step 1: Write failing migration coverage**

- Add tests or migration assertions ensuring new files are discovered and idempotent.

**Step 2: Run migration tests**

Run:

```bash
go test ./internal/infrastructure/migration -v
```

Expected: failure because new migration fixtures or expectations are missing.

**Step 3: Write idempotent SQL migrations**

- `usage_events` table
- `provider_runs` table
- indexes for user, api key, provider, task id, and time filters
- `deleted_at` on `api_keys`

**Step 4: Re-run migration tests**

Run:

```bash
go test ./internal/infrastructure/migration -v
```

Expected: PASS.

**Step 5: Commit**

```bash
git add internal/infrastructure/migration/migrations/0016_usage_events.sql internal/infrastructure/migration/migrations/0017_provider_runs.sql internal/infrastructure/migration/migrations/0018_api_keys_soft_delete.sql internal/infrastructure/migration/migrator_test.go
git commit -m "feat: add usage ledger schema"
```

### Task 3: Implement repository layer for usage events and provider runs

**Files:**
- Create: `internal/infrastructure/usage/repo.go`
- Create: `internal/infrastructure/usage/repo_test.go`
- Modify: `internal/infrastructure/apikey/api_key_repo.go`
- Modify: `internal/infrastructure/auth/apikey_service.go`

**Step 1: Write repository tests first**

- Cover:
  - create usage event
  - link provider run by `usage_event_id`
  - aggregate by user and API key
  - list API keys excluding soft-deleted records
  - disable API key

**Step 2: Run repository tests**

Run:

```bash
go test ./internal/infrastructure/usage ./internal/infrastructure/apikey -v
```

Expected: compile or missing method failures.

**Step 3: Implement the repositories**

- Add usage event insert/update/list/aggregate methods
- Add provider run insert/update/find-by-task-id methods
- Extend API key repo with:
  - list by user
  - disable by key id
  - soft delete by key id

**Step 4: Re-run repository tests**

Run:

```bash
go test ./internal/infrastructure/usage ./internal/infrastructure/apikey -v
```

Expected: PASS.

**Step 5: Commit**

```bash
git add internal/infrastructure/usage/repo.go internal/infrastructure/usage/repo_test.go internal/infrastructure/apikey/api_key_repo.go internal/infrastructure/auth/apikey_service.go
git commit -m "feat: add usage ledger repositories"
```

### Task 4: Persist usage events for image and video generation

**Files:**
- Modify: `internal/application/image/service.go`
- Modify: `internal/application/video/service.go`
- Modify: `internal/application/image/service_test.go`
- Modify: `internal/application/video/service_test.go`
- Modify: `internal/domain/model/log.go`

**Step 1: Write failing service tests**

- Assert that successful NexusHub submissions create:
  - usage event
  - provider run with `task_id`
  - API key linkage
- Assert that submit failure still produces correct failed usage event behavior

**Step 2: Run targeted service tests**

Run:

```bash
go test ./internal/application/image ./internal/application/video -v
```

Expected: failing assertions around missing usage ledger persistence.

**Step 3: Implement minimal service changes**

- Thread `api_key_id` into request/service context
- Persist usage event before or during provider submission
- Persist provider run after `task_id` is returned
- Keep `call_logs` as a secondary logging path

**Step 4: Re-run service tests**

Run:

```bash
go test ./internal/application/image ./internal/application/video -v
```

Expected: PASS.

**Step 5: Commit**

```bash
git add internal/application/image/service.go internal/application/video/service.go internal/application/image/service_test.go internal/application/video/service_test.go internal/domain/model/log.go
git commit -m "feat: record usage ledger for nexus tasks"
```

### Task 5: Add NexusHub result sync client path and backfill service

**Files:**
- Modify: `internal/domain/port/nexushub.go`
- Modify: `internal/infrastructure/nexushub/client.go`
- Create: `internal/application/usage/service.go`
- Create: `internal/application/usage/service_test.go`

**Step 1: Write failing tests for polling/backfill**

- Cover:
  - query `get_submit_result/:task_id`
  - map `nexus_usage`, `nexus_cost`, `status`
  - update provider run and usage event terminal state

**Step 2: Run tests**

Run:

```bash
go test ./internal/application/usage ./internal/infrastructure/nexushub -v
```

Expected: missing query capability or mapping code.

**Step 3: Implement query and backfill path**

- Add provider query method to NexusHub client
- Add application service to sync a provider run by task id
- Update `final_cost`, `cost_source`, `completed_at`

**Step 4: Re-run tests**

Run:

```bash
go test ./internal/application/usage ./internal/infrastructure/nexushub -v
```

Expected: PASS.

**Step 5: Commit**

```bash
git add internal/domain/port/nexushub.go internal/infrastructure/nexushub/client.go internal/application/usage/service.go internal/application/usage/service_test.go
git commit -m "feat: backfill usage from nexushub results"
```

### Task 6: Add system/application APIs for API key management and usage summary

**Files:**
- Modify: `internal/application/system/service.go`
- Modify: `internal/application/system/service_test.go`
- Modify: `internal/transport/http/handlers/system/handler.go`
- Create: `internal/transport/http/presenter/apikey.go`
- Modify: `internal/transport/http/router_test.go`

**Step 1: Write failing handler/service tests**

- Cover:
  - `GET /v1/api-keys`
  - `POST /v1/api-keys/:id/disable`
  - `DELETE /v1/api-keys/:id`
  - `GET /v1/api-keys/:id/usage`
  - `GET /v1/usage/summary`
  - `GET /v1/usage/events`

**Step 2: Run targeted tests**

Run:

```bash
go test ./internal/application/system ./internal/transport/http -v
```

Expected: route or service failures.

**Step 3: Implement the endpoints**

- Add service methods for API key list/disable/delete
- Add summary/event query methods over `usage_events`
- Ensure all externally visible IDs use presenter + external ID rules

**Step 4: Re-run targeted tests**

Run:

```bash
go test ./internal/application/system ./internal/transport/http -v
```

Expected: PASS.

**Step 5: Commit**

```bash
git add internal/application/system/service.go internal/application/system/service_test.go internal/transport/http/handlers/system/handler.go internal/transport/http/presenter/apikey.go internal/transport/http/router_test.go
git commit -m "feat: expose api key management and usage endpoints"
```

### Task 7: Wire repositories and services in bootstrap

**Files:**
- Modify: `internal/app/bootstrap.go`
- Modify: `internal/app/runtime_bootstrap_test.go`

**Step 1: Write or update bootstrap tests**

- Assert production bootstrap constructs:
  - usage repositories
  - usage service
  - API key management dependencies

**Step 2: Run bootstrap tests**

Run:

```bash
go test ./internal/app -v
```

Expected: failures because new dependencies are not wired.

**Step 3: Add bootstrap wiring**

- Instantiate usage repositories in real runtime
- Thread them into image/video/system services
- Preserve stub runtime behavior with minimal no-op or memory repos

**Step 4: Re-run bootstrap tests**

Run:

```bash
go test ./internal/app -v
```

Expected: PASS.

**Step 5: Commit**

```bash
git add internal/app/bootstrap.go internal/app/runtime_bootstrap_test.go
git commit -m "feat: wire usage ledger services"
```

### Task 8: Build dashboard API key page and usage hooks

**Files:**
- Modify: `web/src/lib/api/types.ts`
- Modify: `web/src/lib/api/hooks.ts`
- Modify: `web/src/app/dashboard/api-keys/page.tsx`
- Modify: `web/src/app/dashboard/usage/page.tsx`

**Step 1: Add the failing UI/data expectations**

- Define TS types for:
  - API key list item
  - usage summary
  - usage event row
- Add minimal page-level tests if the repo already supports frontend tests; otherwise document manual checks in the PR

**Step 2: Run the fastest relevant frontend check**

Run:

```bash
pnpm --dir web lint
```

Expected: failures due to missing types, hooks, or page code.

**Step 3: Implement dashboard UI using existing design language**

- Replace the placeholder `API Keys` page
- Add disable/delete actions
- Add summary columns and empty/loading/error states
- Replace the placeholder `Usage` page with summary + event list

**Step 4: Re-run frontend validation**

Run:

```bash
pnpm --dir web lint
```

Expected: PASS.

**Step 5: Commit**

```bash
git add web/src/lib/api/types.ts web/src/lib/api/hooks.ts web/src/app/dashboard/api-keys/page.tsx web/src/app/dashboard/usage/page.tsx
git commit -m "feat: add dashboard api key and usage views"
```

### Task 9: Add manual verification and rollout notes

**Files:**
- Modify: `docs/plans/2026-03-30-usage-ledger-and-api-key-management-design.md`
- Modify: `docs/plans/2026-03-30-usage-ledger-and-api-key-management-implementation.md`

**Step 1: Run end-to-end focused checks**

Run:

```bash
go test ./internal/... ./test/integration/...
pnpm --dir web lint
```

Expected: all touched areas pass; if not, fix before proceeding.

**Step 2: Do a manual smoke checklist**

- Create API key
- Disable API key
- Soft-delete API key
- Trigger image/video generation and confirm local `usage_event` + `provider_run`
- Confirm dashboard reflects the new usage row and summary

**Step 3: Record rollout notes**

- Backfill plan for old `call_logs`
- Whether old API keys need `deleted_at` backfill
- Whether asynchronous provider sync needs cron, queue, or on-read retry

**Step 4: Commit**

```bash
git add docs/plans/2026-03-30-usage-ledger-and-api-key-management-design.md docs/plans/2026-03-30-usage-ledger-and-api-key-management-implementation.md
git commit -m "docs: finalize usage ledger rollout checklist"
```

Plan complete and saved to `docs/plans/2026-03-30-usage-ledger-and-api-key-management-implementation.md`. Two execution options:

1. Subagent-Driven (this session) - I dispatch fresh subagent per task, review between tasks, fast iteration
2. Parallel Session (separate) - Open new session with executing-plans, batch execution with checkpoints

Which approach?
