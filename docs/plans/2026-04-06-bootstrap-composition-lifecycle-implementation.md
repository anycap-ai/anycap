# Bootstrap Composition And Lifecycle Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 重构 `internal/app` 的 server bootstrap，先补统一 lifecycle/runtime，再把依赖装配按 `auth` / `billing` / `media` / `storage` / `web` 拆成 composition 文件，同时保持对外行为不变。

**Architecture:** 第一阶段先把构造和运行解耦，引入统一 root context、worker 启停和 HTTP shutdown，让 `NewServer(...)` 变成无副作用构造。第二阶段再把 `buildServerDependencies(...)` 的装配逻辑拆为按域聚合的 composition outputs，收口顶层 bootstrap 为清晰的 orchestration。

**Tech Stack:** Go, Hertz, existing `internal/app` bootstrap, existing worker implementations, existing transport/http router, existing bootstrap tests.

**Design References:**
- `docs/plans/2026-04-06-bootstrap-composition-lifecycle-design.md`

---

### Task 1: Add a runtime lifecycle skeleton without changing external behavior

**Files:**
- Modify: `internal/app/bootstrap.go`
- Create: `internal/app/runtime.go`
- Modify: `cmd/anycap-server/main.go`
- Test: `internal/app/runtime_bootstrap_test.go`

**Step 1: Write the failing tests**

- In `internal/app/runtime_bootstrap_test.go`, add focused tests for:
  - `NewServer(...)` no longer starting background workers during construction
  - `Start(...)` creating a cancellable runtime context
  - `Shutdown(...)` cancelling that context
  - no change to the default top-level startup path used by `cmd/anycap-server/main.go`

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/app -run 'Test.*(Runtime|Server)' -v
```

Expected: FAIL because lifecycle methods or runtime state do not exist yet.

**Step 3: Write minimal implementation**

- Create `internal/app/runtime.go`
- Move worker startup responsibility out of `NewServer(...)`
- Add runtime-owned fields needed for:
  - root context
  - cancel function
  - started-state guard
  - worker start helpers
- Add `Start(...)` and `Shutdown(...)` methods
- Keep a compatibility path so the process still has an ergonomic `Run()` entrypoint
- Update `cmd/anycap-server/main.go` only as needed to use the new lifecycle entrypoint without changing user-visible behavior

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/app -run 'Test.*(Runtime|Server)' -v
```

Expected: PASS.

**Step 5: Commit**

```bash
git add internal/app/bootstrap.go internal/app/runtime.go internal/app/runtime_bootstrap_test.go cmd/anycap-server/main.go
git commit -m "refactor: introduce server runtime lifecycle"
```

### Task 2: Wire all background workers through the runtime lifecycle

**Files:**
- Modify: `internal/app/bootstrap.go`
- Modify: `internal/app/runtime.go`
- Test: `internal/app/runtime_bootstrap_test.go`

**Step 1: Write the failing tests**

- Extend runtime tests to cover:
  - `kvsyncWorker` starts through runtime-managed startup
  - `usageSyncWorker` starts through runtime-managed startup
  - `billingWorker` starts through runtime-managed startup
  - `paymentEventsWorker` receives cancellation on shutdown

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/app -run 'Test.*Worker' -v
```

Expected: FAIL because workers are still started directly from bootstrap or are not cancellable in tests.

**Step 3: Write minimal implementation**

- Introduce a small internal abstraction for runtime-managed background tasks, if needed
- Register each optional worker with the runtime instead of launching goroutines inside `NewServer(...)`
- Ensure runtime startup order is deterministic
- Ensure shutdown first cancels the shared context, then lets worker-owned stop logic run

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/app -run 'Test.*Worker' -v
```

Expected: PASS.

**Step 5: Commit**

```bash
git add internal/app/bootstrap.go internal/app/runtime.go internal/app/runtime_bootstrap_test.go
git commit -m "refactor: manage bootstrap workers via runtime"
```

### Task 3: Extract shared composition inputs and outputs

**Files:**
- Modify: `internal/app/bootstrap.go`
- Create: `internal/app/compose_shared.go`
- Test: `internal/app/bootstrap_test.go`
- Test: `internal/app/migration_bootstrap_test.go`

**Step 1: Write the failing tests**

- Add or update tests to assert that refactoring the assembly shape does not change:
  - runtime-mode-dependent repo/client selection
  - migration behavior when `PGAutoMigrate` is enabled
  - feature- and auth-related dependency initialization

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/app -run 'TestBuildServerDependencies|TestBuildCatalogRepo|TestBuildServerFeatures' -v
```

Expected: FAIL or compile errors once assembly code begins moving to shared structs.

**Step 3: Write minimal implementation**

- Introduce small `sharedInputs` / `sharedOutputs` style structs to hold:
  - config
  - build info
  - db / redis / object store
  - shared clients and repos
  - feature-related shared values
- Keep these structs internal to `internal/app`
- Avoid creating a generic framework; only extract the values needed by multiple composition files

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/app -run 'TestBuildServerDependencies|TestBuildCatalogRepo|TestBuildServerFeatures' -v
```

Expected: PASS.

**Step 5: Commit**

```bash
git add internal/app/bootstrap.go internal/app/compose_shared.go internal/app/bootstrap_test.go internal/app/migration_bootstrap_test.go
git commit -m "refactor: extract shared bootstrap composition inputs"
```

### Task 4: Split auth and billing composition from the bootstrap

**Files:**
- Create: `internal/app/compose_auth.go`
- Create: `internal/app/compose_billing.go`
- Modify: `internal/app/bootstrap.go`
- Test: `internal/app/bootstrap_test.go`
- Test: `internal/app/runtime_bootstrap_test.go`

**Step 1: Write the failing tests**

- Cover or preserve assertions for:
  - Auth0-enabled identity token authenticator creation
  - bypass-auth passthrough ID mapping behavior
  - credit/payment client selection
  - payment events config validation

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/app -run 'TestBuildServerDependencies_.*(Auth0|PaymentEvents|Credit)|TestBuildDeviceVerificationURL' -v
```

Expected: FAIL once auth/billing wiring is partially moved.

**Step 3: Write minimal implementation**

- Move auth-related assembly into `compose_auth.go`:
  - users
  - api keys
  - login sessions
  - identity token authenticator
  - id resolver / mapper
  - login service
- Move billing-related assembly into `compose_billing.go`:
  - credit client
  - payment client
  - credit pack specs
  - billing repo / service
  - payment events worker
  - checkout idempotency
- Keep `systemService` assembly in bootstrap for now; consume outputs from both compositions instead

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/app -run 'TestBuildServerDependencies_.*(Auth0|PaymentEvents|Credit)|TestBuildDeviceVerificationURL' -v
```

Expected: PASS.

**Step 5: Commit**

```bash
git add internal/app/bootstrap.go internal/app/compose_auth.go internal/app/compose_billing.go internal/app/bootstrap_test.go internal/app/runtime_bootstrap_test.go
git commit -m "refactor: split auth and billing bootstrap composition"
```

### Task 5: Split storage composition from the bootstrap

**Files:**
- Create: `internal/app/compose_storage.go`
- Modify: `internal/app/bootstrap.go`
- Test: `internal/app/bootstrap_test.go`
- Test: `internal/app/migration_bootstrap_test.go`

**Step 1: Write the failing tests**

- Cover storage-related behavior:
  - postgres opening and migration flow
  - object storage initialization fallback
  - KV sync worker creation only when enabled
  - quota provider availability in non-stub modes
  - drive/page service assembly still succeeding in composable infra modes

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/app -run 'TestBuildServerDependencies_.*(Integration|DevMode|ProdMode|RunsMigrations)' -v
```

Expected: FAIL once storage assembly moves and dependencies are temporarily incomplete.

**Step 3: Write minimal implementation**

- Move storage-centric assembly into `compose_storage.go`:
  - db and migration path
  - space/drive/page repos
  - upload/storage object repos
  - KV sync client/projector/waiter/worker
  - edge grant store
  - quota provider
  - object store
- Return outputs needed by media/bootstrap:
  - db-backed repos
  - services
  - workers
  - quota provider

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/app -run 'TestBuildServerDependencies_.*(Integration|DevMode|ProdMode|RunsMigrations)' -v
```

Expected: PASS.

**Step 5: Commit**

```bash
git add internal/app/bootstrap.go internal/app/compose_storage.go internal/app/bootstrap_test.go internal/app/migration_bootstrap_test.go
git commit -m "refactor: split storage bootstrap composition"
```

### Task 6: Split media and web composition from the bootstrap

**Files:**
- Create: `internal/app/compose_media.go`
- Create: `internal/app/compose_web.go`
- Modify: `internal/app/bootstrap.go`
- Test: `internal/app/bootstrap_test.go`

**Step 1: Write the failing tests**

- Cover:
  - catalog/model-route repo selection rules
  - image/video/music execution client selection
  - web provider selection and feedback notifier fallback
  - billing/usage worker creation rules in real infra modes
  - capabilities and web services still assembling with the same dependencies

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/app -run 'TestBuildCatalogRepo|TestBuildImageExecutionClient|TestBuildCreditClient|TestBuildServerDependencies_StubMode' -v
```

Expected: FAIL or compile errors until the moved assembly is reconnected.

**Step 3: Write minimal implementation**

- Move media assembly into `compose_media.go`:
  - catalog/model route
  - capabilities provider/service
  - image/video/music services
  - artifact ingest/publisher
  - usage sync worker
  - billing recovery worker
- Move web assembly into `compose_web.go`:
  - web crawler/search providers
  - web service
  - feedback notifier/service
- Keep router registration in top-level bootstrap

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/app -run 'TestBuildCatalogRepo|TestBuildImageExecutionClient|TestBuildCreditClient|TestBuildServerDependencies_StubMode' -v
```

Expected: PASS.

**Step 5: Commit**

```bash
git add internal/app/bootstrap.go internal/app/compose_media.go internal/app/compose_web.go internal/app/bootstrap_test.go
git commit -m "refactor: split media and web bootstrap composition"
```

### Task 7: Collapse bootstrap into top-level orchestration and re-verify focused coverage

**Files:**
- Modify: `internal/app/bootstrap.go`
- Modify: `internal/app/bootstrap_test.go`
- Modify: `internal/app/runtime_bootstrap_test.go`
- Modify: `internal/app/migration_bootstrap_test.go`

**Step 1: Run the focused test suite**

Run:

```bash
go test ./internal/app -v
```

Expected: PASS after all prior tasks are complete.

**Step 2: Fill remaining test gaps**

- Add focused tests if needed for:
  - router registration still using the same handlers and middleware
  - feature provider still flowing into `systemService`
  - storage quota still only wiring when both `spaceService` and `quotaProvider` exist

**Step 3: Perform final bootstrap cleanup**

- Remove dead helper glue introduced during the intermediate refactor
- Ensure `bootstrap.go` now reads as orchestration only:
  - build shared inputs
  - compose domains
  - build handlers/router
  - return runtime-backed server

**Step 4: Re-run tests**

Run:

```bash
go test ./internal/app -v
```

Expected: PASS.

**Step 5: Run adjacent regression checks**

Run:

```bash
go test ./cmd/anycap-server ./internal/transport/http -v
```

Expected: PASS.

**Step 6: Commit**

```bash
git add internal/app/bootstrap.go internal/app/bootstrap_test.go internal/app/runtime_bootstrap_test.go internal/app/migration_bootstrap_test.go
git commit -m "refactor: reduce bootstrap to orchestration"
```

### Task 8: Final verification and documentation polish

**Files:**
- Modify: `docs/plans/2026-04-06-bootstrap-composition-lifecycle-design.md` only if decisions changed during implementation
- Modify: `docs/plans/2026-04-06-bootstrap-composition-lifecycle-implementation.md` only if task reality diverged

**Step 1: Run final targeted verification**

Run:

```bash
go test ./internal/app ./cmd/anycap-server ./internal/transport/http -v
```

Expected: PASS.

**Step 2: Run a broader safety check**

Run:

```bash
go test ./... 
```

Expected: PASS, or document any unrelated pre-existing failures before merging.

**Step 3: Reconcile docs if needed**

- If file paths, API names, or task ordering changed during implementation, update the design and implementation docs so they remain usable references

**Step 4: Commit**

```bash
git add docs/plans/2026-04-06-bootstrap-composition-lifecycle-design.md docs/plans/2026-04-06-bootstrap-composition-lifecycle-implementation.md
git commit -m "docs: finalize bootstrap refactor plan"
```
