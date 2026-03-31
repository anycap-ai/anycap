# Feature Access DConf Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将 AnyCap 的 feature 开关从“全局静态 map + env override”扩展为“dconf 优先、env 回退”的动态访问策略，并支持基于 `principal.Email` 和 `feature_access_groups` 的用户级放量。

**Architecture:** 服务端新增一个 dconf-backed `FeatureProvider`，统一负责全局 feature 视图、用户 feature 视图和请求级访问判断。中间件从读取全局 `map[string]bool` 升级为按请求读取 `principal` 并调用 provider；系统接口新增 `/v1/me/features`，CLI 后续再切换到优先使用该接口。

**Tech Stack:** Go, Hertz, `gitlab.knoffice.tech/open/common-go/dconf`, `testing`, `httptest`

---

**References:**
- `docs/plans/2026-03-31-feature-access-dconf-design.md`
- `docs/plans/2026-03-30-feature-gate-design.md`
- `docs/plans/2026-03-30-rate-limit-dconf-design.md`
- `internal/app/bootstrap.go`
- `internal/middleware/feature_gate.go`
- `internal/application/system/service.go`
- `internal/transport/http/handlers/system/handler.go`

> Implementation notes:
> - Follow `@test-driven-development` for behavior changes.
> - Run `@verification-before-completion` before claiming the feature is done.
> - Keep existing `ANYCAP_FEATURE_*` behavior as fallback.
> - Do not make CLI depend on `/v1/me/features` in the first server PR unless tests already cover the authenticated preflight path cleanly.

### Task 1: Add feature dconf config model and provider skeleton

**Files:**
- Create: `internal/config/feature_provider.go`
- Create: `internal/config/feature_provider_test.go`

**Step 1: Write the failing tests**

Add focused tests for:

```go
func TestFeatureProvider_GlobalFeatures_UsesFallbackWhenDConfDisabled(t *testing.T) {}

func TestFeatureProvider_EnabledFor_AllowsAllRollout(t *testing.T) {}

func TestFeatureProvider_EnabledFor_AllowsGroupsRolloutByEmail(t *testing.T) {}

func TestFeatureProvider_EnabledFor_DeniesWhenEmailNotInGroup(t *testing.T) {}
```

Test expectations:

- when feature dconf is disabled, global features still come from existing server defaults
- `rollout=all` allows any principal when the feature is enabled
- `rollout=groups` allows a user whose normalized email matches a configured `feature_access_groups` entry
- `rollout=groups` denies when no email match exists

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/config -run 'TestFeatureProvider_' -v
```

Expected: FAIL because the provider does not exist

**Step 3: Write minimal implementation**

Add:

```go
type FeatureConfig struct {
    FeatureAccessGroups map[string]FeatureAccessGroup `json:"feature_access_groups"`
    Features            map[string]FeatureRule        `json:"features"`
}

type FeatureAccessGroup struct {
    Emails []string `json:"emails"`
}

type FeatureRule struct {
    Enabled             bool     `json:"enabled"`
    Rollout             string   `json:"rollout"`
    FeatureAccessGroups []string `json:"feature_access_groups,omitempty"`
}
```

And a provider with methods:

```go
GlobalFeatures() map[string]bool
UserFeatures(principal *model.Principal) map[string]bool
EnabledFor(principal *model.Principal, feature string) (allowed bool, globallyEnabled bool)
```

Minimal behavior:

- support only `all` and `groups`
- normalize emails with `trim + lowercase`
- fall back to existing global defaults when dconf is not active

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/config -run 'TestFeatureProvider_' -v
```

Expected: PASS

**Step 5: Commit**

```bash
git add internal/config/feature_provider.go internal/config/feature_provider_test.go
git commit -m "feat: add dconf-backed feature access provider"
```

### Task 2: Add feature dconf control fields to server config

**Files:**
- Modify: `internal/config/config.go`
- Modify: `internal/config/config_test.go`
- Modify: `configs/server/local.env.example`
- Modify: `configs/server/dev.env.example`
- Modify: `configs/server/prod.env.example`

**Step 1: Write the failing tests**

Add tests for:

```go
func TestLoadFromEnv_LoadsFeatureDConfConfig(t *testing.T) {}

func TestLoadFromEnv_UsesDefaultFeatureDConfValues(t *testing.T) {}
```

Expected behavior:

- `ANYCAP_FEATURE_DCONF_ENABLED`
- `ANYCAP_FEATURE_DCONF_GROUP`
- `ANYCAP_FEATURE_DCONF_DATA_ID`

are loaded into `config.Config`.

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/config -run 'TestLoadFromEnv_.*FeatureDConf' -v
```

Expected: FAIL because these fields do not exist

**Step 3: Write minimal implementation**

Extend `Config` with:

```go
FeatureDConfEnabled bool
FeatureDConfGroup   string
FeatureDConfDataID  string
```

Recommended defaults:

- enabled: `false`
- group: `anycap`
- data id: `feature_access`

Document them in the env example files while keeping current `ANYCAP_FEATURE_*` entries untouched.

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/config -run 'TestLoadFromEnv_.*FeatureDConf|TestFeatureProvider_' -v
```

Expected: PASS

**Step 5: Commit**

```bash
git add internal/config/config.go internal/config/config_test.go configs/server/local.env.example configs/server/dev.env.example configs/server/prod.env.example
git commit -m "feat: add feature dconf config settings"
```

### Task 3: Integrate real dconf loading and fallback behavior

**Files:**
- Modify: `internal/config/feature_provider.go`
- Modify: `internal/config/feature_provider_test.go`
- Create or Modify: `internal/config/dconf.go`
- Modify: `internal/config/dconf_test.go`
- Modify: `cmd/anycap-server/main.go`

**Step 1: Write the failing tests**

Add tests for:

```go
func TestFeatureProvider_UsesDConfRuleWhenAvailable(t *testing.T) {}

func TestFeatureProvider_FallsBackWhenDConfContainerUnavailable(t *testing.T) {}

func TestInitFeatureDConf_SkipsWhenDisabled(t *testing.T) {}

func TestInitFeatureDConf_CallsInitWhenEnabled(t *testing.T) {}
```

Expected behavior:

- real dconf loading is attempted only when feature dconf is enabled
- init/load failure does not crash startup
- provider falls back cleanly to the existing feature defaults and env overrides

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/config -run 'TestFeatureProvider_|TestInitFeatureDConf_' -v
```

Expected: FAIL until real dconf integration exists

**Step 3: Write minimal implementation**

Implement:

- dconf-backed container loading via `dconf.LoadJson[FeatureConfig](group, dataID)`
- feature-specific init/stop helpers similar to the rate limit integration
- safe fallback when init or load fails

Startup behavior should mirror the existing rate limit dconf pattern.

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/config -run 'TestFeatureProvider_|TestInitFeatureDConf_' -v
```

Expected: PASS

**Step 5: Commit**

```bash
git add internal/config/feature_provider.go internal/config/feature_provider_test.go internal/config/dconf.go internal/config/dconf_test.go cmd/anycap-server/main.go
git commit -m "feat: load feature access policy from dconf"
```

### Task 4: Replace global feature gate map with request-aware provider

**Files:**
- Modify: `internal/middleware/feature_gate.go`
- Modify: `internal/middleware/feature_gate_test.go`
- Modify: `internal/app/bootstrap.go`
- Modify: `internal/app/bootstrap_test.go`

**Step 1: Write the failing tests**

Add middleware tests for:

```go
func TestFeatureGate_Returns503WhenFeatureGloballyDisabled(t *testing.T) {}

func TestFeatureGate_Returns403WhenUserNotAllowed(t *testing.T) {}

func TestFeatureGate_AllowsWhenUserEmailMatchesGroup(t *testing.T) {}
```

Test expectations:

- `503 FEATURE_DISABLED` when the feature is globally off
- `403 FEATURE_NOT_ALLOWED` when the feature is on but the current principal is not in an allowed group
- request proceeds when `principal.Email` matches a configured group

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/middleware -run 'TestFeatureGate_' -v
```

Expected: FAIL because middleware still reads a plain `map[string]bool`

**Step 3: Write minimal implementation**

Refactor `FeatureGate(...)` so that it depends on the provider interface instead of a `map[string]bool`.

Behavior:

1. map request path to feature name
2. read `principal` from request context
3. call `EnabledFor(principal, feature)`
4. return:
   - `503 FEATURE_DISABLED`
   - `403 FEATURE_NOT_ALLOWED`
5. otherwise continue

Wire the provider from bootstrap instead of `buildServerFeatures()` output directly.

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/middleware -run 'TestFeatureGate_' -v
go test ./internal/app -run 'TestBuildServer_.*Feature' -v
```

Expected: PASS

**Step 5: Commit**

```bash
git add internal/middleware/feature_gate.go internal/middleware/feature_gate_test.go internal/app/bootstrap.go internal/app/bootstrap_test.go
git commit -m "refactor: enforce feature access through request-aware provider"
```

### Task 5: Expose global and user-specific feature views from system APIs

**Files:**
- Modify: `internal/application/system/service.go`
- Modify: `internal/application/system/service_test.go`
- Modify: `internal/transport/http/handlers/system/handler.go`
- Modify: `internal/transport/http/handlers/system/handler_test.go`

**Step 1: Write the failing tests**

Add tests for:

```go
func TestHandler_Features_ReturnsGlobalFeatureView(t *testing.T) {}

func TestHandler_MeFeatures_ReturnsUserFeatureView(t *testing.T) {}
```

Expected behavior:

- `GET /v1/features` returns the global server feature view
- `GET /v1/me/features` returns the current user's feature view

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/transport/http/handlers/system -run 'TestHandler_(Features|MeFeatures)' -v
```

Expected: FAIL because the service only stores one global feature map and `/v1/me/features` does not exist

**Step 3: Write minimal implementation**

Change the system service to depend on the feature provider for both:

- global features
- user features

Add a protected route:

```go
group.GET("/me/features", h.MeFeatures)
```

Keep `/v1/features` public and global-only.

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/application/system -run 'Test.*Feature' -v
go test ./internal/transport/http/handlers/system -run 'TestHandler_(Features|MeFeatures)' -v
```

Expected: PASS

**Step 5: Commit**

```bash
git add internal/application/system/service.go internal/application/system/service_test.go internal/transport/http/handlers/system/handler.go internal/transport/http/handlers/system/handler_test.go
git commit -m "feat: add user-specific feature access endpoint"
```

### Task 6: Update CLI to prefer `/v1/me/features` when authenticated

**Files:**
- Modify: `cmd/anycap/main.go`
- Modify: `cmd/anycap/main_test.go`
- Modify: `pkg/feature/feature.go` only if tests show a real need

**Step 1: Write the failing tests**

Add tests for:

```go
func TestSyncServerFeatures_PrefersMeFeaturesWhenAuthenticated(t *testing.T) {}

func TestSyncServerFeatures_FallsBackToGlobalFeaturesWhenUnauthenticated(t *testing.T) {}
```

Expected behavior:

- when credentials are available, CLI uses `/v1/me/features`
- when authentication is not available or request fails, CLI falls back to `/v1/features`

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./cmd/anycap -run 'TestSyncServerFeatures_' -v
```

Expected: FAIL because CLI only fetches `/v1/features`

**Step 3: Write minimal implementation**

Keep CLI rollout conservative:

- try `/v1/me/features` only when authenticated client wiring is already available and well-covered
- otherwise fall back to the existing anonymous `/v1/features`

Do not block command startup on user-specific feature sync failure.

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./cmd/anycap -run 'TestSyncServerFeatures_' -v
```

Expected: PASS

**Step 5: Commit**

```bash
git add cmd/anycap/main.go cmd/anycap/main_test.go
git commit -m "feat: sync user-specific feature access in cli"
```

### Task 7: Verification

**Files:**
- No code changes required unless verification finds issues

**Step 1: Run targeted tests**

```bash
go test ./internal/config -v
go test ./internal/middleware -run 'TestFeatureGate_' -v
go test ./internal/application/system -run 'Test.*Feature' -v
go test ./internal/transport/http/handlers/system -run 'TestHandler_(Features|MeFeatures)' -v
go test ./internal/app -run 'TestBuildServer_.*Feature' -v
```

Expected: PASS

**Step 2: Run broader command checks**

```bash
go test ./cmd/anycap ./cmd/anycap-server ./internal/... ./pkg/... ./test/... 
```

Expected: PASS, or document any pre-existing failures clearly

**Step 3: Manual verification checklist**

- `GET /v1/features` returns only global feature availability
- authenticated `GET /v1/me/features` reflects `feature_access_groups`
- globally disabled feature returns `503 FEATURE_DISABLED`
- globally enabled but unauthorized feature returns `403 FEATURE_NOT_ALLOWED`
- authorized user passes through normally
- removing or breaking dconf payload falls back to current env-based behavior

**Step 4: Commit or follow-up**

If verification reveals issues, fix them in small follow-up commits before final merge.

---

Plan complete and saved to `docs/plans/2026-03-31-feature-access-dconf-implementation.md`. Two execution options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

Which approach?
