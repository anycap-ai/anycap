# Rate Limit DConf Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将 AnyCap 的 capability rate limit 配置源从纯 env/static config 扩展为“dconf 优先、env 回退”，只替换 rate limit 这一块，不影响现有限流语义。

**Architecture:** 保持现有 `middleware.CapabilityRateLimitResolver` 接口不变，新增一个 dconf-backed `RateLimitProvider` 作为 resolver 注入到 `middleware.RateLimit(...)`。当 `ANYCAP_RATE_LIMIT_DCONF_ENABLED=true` 时，启动阶段初始化 dconf，provider 通过 `dconf.LoadJson[RateLimitConfig]` 读取并在请求时获取最新配置；若 dconf 未启用、初始化失败、载入失败或数据非法，则回退到当前 env 配置解析逻辑。

**Tech Stack:** Go, Hertz, `gitlab.knoffice.tech/open/common-go/dconf`, `testing`, `httptest`

---

**References:**
- `docs/plans/2026-03-30-rate-limit-dconf-design.md`
- `docs/plans/2026-03-30-user-capability-rate-limit-design.md`
- `internal/middleware/ratelimit.go`
- `internal/app/bootstrap.go`
- `cmd/anycap-server/main.go`

> Implementation notes:
> - Follow `@test-driven-development` for each code path change.
> - Run `@verification-before-completion` before claiming the feature is done.
> - Keep dconf integration scoped strictly to rate limit config.
> - Do not remove existing env fallback.

### Task 1: Add dconf-facing rate limit config model and provider skeleton

**Files:**
- Create: `internal/config/ratelimit_provider.go`
- Create: `internal/config/ratelimit_provider_test.go`

**Step 1: Write the failing tests**

Add focused tests for:

```go
func TestRateLimitProvider_UsesFallbackConfigWhenDConfDisabled(t *testing.T) {}

func TestRateLimitProvider_UsesFallbackConfigWhenContainerMissing(t *testing.T) {}

func TestRateLimitProvider_UsesDConfCapabilityOverride(t *testing.T) {}

func TestRateLimitProvider_UsesDConfDefaultRPM(t *testing.T) {}
```

Test expectations:

- when dconf is disabled, provider returns the current env/static config result
- when dconf is enabled but no container is available, provider falls back
- when dconf has a valid capability-specific RPM, it wins
- when dconf has no capability override but has valid `default_rpm`, it is used

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/config -run 'TestRateLimitProvider_' -v
```

Expected: FAIL because the provider does not exist

**Step 3: Write minimal implementation**

Add:

```go
type RateLimitConfig struct {
    DefaultRPM   int            `json:"default_rpm"`
    Capabilities map[string]int `json:"capabilities"`
}

type RateLimitProvider struct {
    fallback      Config
    dconfEnabled  bool
    dconfGroup    string
    dconfDataID   string
    container     rateLimitContainer
}
```

Introduce a small internal interface to make tests independent from real dconf:

```go
type rateLimitContainer interface {
    Get() *RateLimitConfig
}
```

And implement:

- `NewRateLimitProvider(cfg Config) *RateLimitProvider`
- `ResolveCapabilityRateLimitRPM(capability string) int`

Minimal behavior:

- normalize capability to lowercase/trim spaces
- use dconf only when enabled and container is non-nil
- otherwise fall back to `cfg.ResolveCapabilityRateLimitRPM`

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/config -run 'TestRateLimitProvider_' -v
```

Expected: PASS

**Step 5: Commit**

```bash
git add internal/config/ratelimit_provider.go internal/config/ratelimit_provider_test.go
git commit -m "feat: add dconf-backed rate limit provider"
```

### Task 2: Add dconf control fields to server config

**Files:**
- Modify: `internal/config/config.go`
- Modify: `internal/config/config_test.go`

**Step 1: Write the failing tests**

Add tests for:

```go
func TestLoadFromEnv_LoadsRateLimitDConfConfig(t *testing.T) {}

func TestLoadFromEnv_UsesDefaultRateLimitDConfValues(t *testing.T) {}
```

Test expectations:

- `ANYCAP_RATE_LIMIT_DCONF_ENABLED`
- `ANYCAP_RATE_LIMIT_DCONF_GROUP`
- `ANYCAP_RATE_LIMIT_DCONF_DATA_ID`

are loaded into `config.Config`

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/config -run 'TestLoadFromEnv_.*RateLimitDConf' -v
```

Expected: FAIL because these fields do not exist

**Step 3: Write minimal implementation**

Extend `Config` with:

```go
RateLimitDConfEnabled bool
RateLimitDConfGroup   string
RateLimitDConfDataID  string
```

Load them in `LoadFromEnv()` with safe defaults:

- enabled default: `false`
- group default: `anycap`
- data id default: `rate_limit`

Keep existing env/static rate limit parsing unchanged.

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/config -run 'TestLoadFromEnv_.*RateLimitDConf|TestRateLimitProvider_' -v
```

Expected: PASS

**Step 5: Commit**

```bash
git add internal/config/config.go internal/config/config_test.go internal/config/ratelimit_provider.go internal/config/ratelimit_provider_test.go
git commit -m "feat: add rate limit dconf config settings"
```

### Task 3: Integrate real dconf container loading into the provider

**Files:**
- Modify: `internal/config/ratelimit_provider.go`
- Modify: `internal/config/ratelimit_provider_test.go`

**Step 1: Write the failing tests**

Add tests around provider validation behavior:

```go
func TestRateLimitProvider_IgnoresInvalidDConfCapabilityValue(t *testing.T) {}

func TestRateLimitProvider_FallsBackWhenDConfDefaultInvalid(t *testing.T) {}
```

Expected behavior:

- non-positive dconf RPM values are ignored
- invalid dconf payload values fall back to env/static config

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/config -run 'TestRateLimitProvider_' -v
```

Expected: FAIL until validation behavior exists

**Step 3: Write minimal implementation**

Update the provider so that:

- when `RateLimitDConfEnabled=true`, it attempts to create a real dconf container via `dconf.LoadJson[RateLimitConfig](group, dataID)`
- container creation failure does not panic; it logs or silently falls back depending on current logging conventions
- `ResolveCapabilityRateLimitRPM` ignores invalid/non-positive dconf values

Keep the `rateLimitContainer` abstraction so tests can still inject fake containers.

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/config -run 'TestRateLimitProvider_' -v
```

Expected: PASS

**Step 5: Commit**

```bash
git add internal/config/ratelimit_provider.go internal/config/ratelimit_provider_test.go
git commit -m "feat: load rate limit config from dconf"
```

### Task 4: Initialize dconf at server startup when enabled

**Files:**
- Modify: `cmd/anycap-server/main.go`
- Create or Modify: `internal/app/dconf.go`
- Test: `internal/app/bootstrap_test.go` or a new focused startup helper test

**Step 1: Write the failing test**

Because `main.go` is hard to test directly, extract a small helper first and test that:

```go
func TestInitRateLimitDConf_SkipsWhenDisabled(t *testing.T) {}

func TestInitRateLimitDConf_CallsInitWhenEnabled(t *testing.T) {}
```

Use package-level function variables to stub `dconf.Init`.

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/app -run 'TestInitRateLimitDConf_' -v
```

Expected: FAIL because the helper does not exist

**Step 3: Write minimal implementation**

Add a tiny helper, for example:

```go
func InitRateLimitDConf(cfg config.Config) (func(), error)
```

Behavior:

- if disabled, return no-op cleanup
- if enabled, call `dconf.Init(...)`
- return cleanup that calls `dconf.Stop()`

Then call this helper from `cmd/anycap-server/main.go`.

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/app -run 'TestInitRateLimitDConf_' -v
```

Expected: PASS

**Step 5: Commit**

```bash
git add cmd/anycap-server/main.go internal/app/dconf.go internal/app/bootstrap_test.go
git commit -m "feat: initialize dconf for rate limit config"
```

### Task 5: Replace bootstrap’s static rate limit resolver with the provider

**Files:**
- Modify: `internal/app/bootstrap.go`
- Modify: `internal/app/bootstrap_test.go`

**Step 1: Write the failing test**

Add a test that verifies protected routes are wired with an injected resolver from dependencies rather than the raw `config.Config`.

Suggested test shape:

```go
func TestBuildServerDependencies_UsesRateLimitProvider(t *testing.T) {}
```

Expectation:

- built dependencies include a non-nil `rateLimitResolver`
- protected router wiring uses `deps.rateLimitResolver`

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/app -run 'TestBuildServerDependencies_UsesRateLimitProvider' -v
```

Expected: FAIL because bootstrap still passes `deps.config`

**Step 3: Write minimal implementation**

Update `serverDependencies`:

- add `rateLimitResolver middleware.CapabilityRateLimitResolver`

Update dependency construction:

- create `config.NewRateLimitProvider(cfg)`
- store it in `serverDependencies`

Update routing:

- replace `middleware.RateLimit(deps.rateLimiter, deps.config)`
- with `middleware.RateLimit(deps.rateLimiter, deps.rateLimitResolver)`

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/app -run 'TestBuildServerDependencies_UsesRateLimitProvider|TestNewServer_' -v
```

Expected: PASS

**Step 5: Commit**

```bash
git add internal/app/bootstrap.go internal/app/bootstrap_test.go internal/config/ratelimit_provider.go
git commit -m "refactor: wire dconf rate limit provider into bootstrap"
```

### Task 6: Prove fallback and protected-route behavior still works end-to-end

**Files:**
- Modify: `internal/middleware/ratelimit_test.go`
- Modify: `internal/transport/http/router_test.go`

**Step 1: Write the failing tests**

Add tests proving:

```go
func TestRateLimit_UsesProviderResolvedRPM(t *testing.T) {}

func TestRouter_FunctionRoutes_StillRateLimitWithCustomResolver(t *testing.T) {}

func TestRouter_SystemRoutes_StillBypassCapabilityRateLimit(t *testing.T) {}
```

Focus:

- middleware behavior does not regress
- function routes still return `429`
- non-capability protected routes still bypass capability rate limit

**Step 2: Run test to verify it fails**

Run:

```bash
go test ./internal/middleware ./internal/transport/http -run 'TestRateLimit_|TestRouter_(FunctionRoutes|SystemRoutes|AuthHelperRoutes)' -v
```

Expected: FAIL if wiring regresses

**Step 3: Write minimal implementation**

Adjust test harnesses only as needed:

- make resolver injection explicit where needed
- do not rewrite existing route capability behavior

**Step 4: Run test to verify it passes**

Run:

```bash
go test ./internal/middleware ./internal/transport/http -run 'TestRateLimit_|TestRouter_(FunctionRoutes|SystemRoutes|AuthHelperRoutes)' -v
```

Expected: PASS

**Step 5: Commit**

```bash
git add internal/middleware/ratelimit_test.go internal/transport/http/router_test.go
git commit -m "test: cover dconf-backed rate limit routing"
```

### Task 7: Document dconf-backed rate limit configuration

**Files:**
- Modify: `docs/config/server-rate-limit.md`
- Modify: `configs/server/local.env.example`
- Modify: `configs/server/dev.env.example`
- Modify: `configs/server/prod.env.example`

**Step 1: Write the failing doc checklist**

Add a checklist to the task and verify the docs currently do not describe:

- `ANYCAP_RATE_LIMIT_DCONF_ENABLED`
- `ANYCAP_RATE_LIMIT_DCONF_GROUP`
- `ANYCAP_RATE_LIMIT_DCONF_DATA_ID`
- dconf JSON shape
- dconf-first, env-fallback resolution order

**Step 2: Run the doc verification**

Run:

```bash
rg -n "RATE_LIMIT_DCONF|default_rpm|capabilities" docs/config/server-rate-limit.md configs/server/*.env.example
```

Expected: missing entries or incomplete coverage

**Step 3: Write minimal documentation updates**

Document:

- the new env flags controlling dconf
- example dconf payload JSON
- fallback semantics
- rollout recommendation

Keep the env examples concise; put the full explanation in `docs/config/server-rate-limit.md`.

**Step 4: Run the doc verification**

Run:

```bash
rg -n "RATE_LIMIT_DCONF|default_rpm|capabilities" docs/config/server-rate-limit.md configs/server/*.env.example
git diff --check
```

Expected: entries present and no diff formatting errors

**Step 5: Commit**

```bash
git add docs/config/server-rate-limit.md configs/server/local.env.example configs/server/dev.env.example configs/server/prod.env.example
git commit -m "docs: describe dconf-backed rate limit config"
```

### Task 8: Run final verification

**Files:**
- No code changes expected

**Step 1: Run focused package tests**

Run:

```bash
go test ./internal/config ./internal/app ./internal/middleware ./internal/transport/http
```

Expected: PASS

**Step 2: Run formatting / diff sanity checks**

Run:

```bash
git diff --check
git status --short
```

Expected:

- no diff whitespace errors
- only intended files modified

**Step 3: Re-read design alignment**

Verify implementation matches:

- dconf only replaces rate limit config source
- env fallback remains intact
- capability semantics are unchanged
- middleware interface is unchanged

**Step 4: Commit final cleanups if needed**

```bash
git add -A
git commit -m "chore: finalize dconf rate limit integration" # only if a cleanup commit is actually needed
```

