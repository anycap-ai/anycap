# User Capability Rate Limit Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将当前按凭证分桶的受保护路由限流改为“仅功能接口参与、按用户 + capability 分桶”的能力级限流。

**Architecture:** 通过在功能路由注册阶段显式挂载 capability 中间件，把产品语义能力写入请求上下文；统一限流中间件只在 capability 存在时生效，并按 `principal.UserID + capability` 选择对应的 fixed-window 桶。配置层保留默认 RPM，同时支持 capability 级覆盖，系统类受保护接口不声明 capability，因此天然跳过能力限流。

**Tech Stack:** Go, Hertz, Redis limiter, in-memory limiter, `testing`, `httptest`

---

**References:**
- `docs/plans/2026-03-30-user-capability-rate-limit-design.md`
- `internal/middleware/ratelimit.go`
- `internal/transport/http/router_test.go`

> Implementation notes:
> - Follow `@test-driven-development` for each code path change.
> - Run `@verification-before-completion` before claiming the feature is done.
> - Keep commits small and reviewable.

### Task 1: Add capability context helpers

**Files:**
- Create: `internal/middleware/capability.go`
- Test: `internal/middleware/capability_test.go`

**Step 1: Write the failing test**

```go
func TestWithCapability_SetsCapabilityOnRequestContext(t *testing.T) {
    h := server.Default()
    h.POST("/test",
        WithCapability("image.generate"),
        func(ctx context.Context, c *app.RequestContext) {
            got, ok := GetCapability(c)
            if !ok || got != "image.generate" {
                t.Fatalf("expected image.generate, got %q ok=%v", got, ok)
            }
            c.String(200, "ok")
        },
    )
}
```

**Step 2: Run test to verify it fails**

Run: `go test ./internal/middleware -run TestWithCapability_SetsCapabilityOnRequestContext -v`
Expected: FAIL because `WithCapability` and `GetCapability` do not exist

**Step 3: Write minimal implementation**

Implement:

- `WithCapability(name string) app.HandlerFunc`
- `SetCapability(ctx *app.RequestContext, name string)`
- `GetCapability(ctx *app.RequestContext) (string, bool)`

Requirements:

- empty capability must not panic
- helpers must live in `internal/middleware/capability.go`
- context key must be private to the middleware package

**Step 4: Run test to verify it passes**

Run: `go test ./internal/middleware -run TestWithCapability_SetsCapabilityOnRequestContext -v`
Expected: PASS

**Step 5: Commit**

```bash
git add internal/middleware/capability.go internal/middleware/capability_test.go
git commit -m "feat: add request capability context helpers"
```

### Task 2: Convert rate limiting key selection to user + capability

**Files:**
- Modify: `internal/middleware/ratelimit.go`
- Create: `internal/middleware/ratelimit_test.go`

**Step 1: Write the failing tests**

```go
func TestRateLimit_UsesUserAndCapabilityBucket(t *testing.T) {}

func TestRateLimit_SkipsRequestsWithoutCapability(t *testing.T) {}

func TestRateLimit_DifferentCapabilitiesUseDifferentBuckets(t *testing.T) {}

func TestRateLimit_DifferentUsersUseDifferentBuckets(t *testing.T) {}
```

Test expectations:

- same user + same capability shares one bucket
- same user + different capability uses separate buckets
- different user + same capability uses separate buckets
- request without capability bypasses limiter

**Step 2: Run test to verify it fails**

Run: `go test ./internal/middleware -run 'TestRateLimit_' -v`
Expected: FAIL because `RateLimit` still uses API key / bearer token buckets

**Step 3: Write minimal implementation**

Update `internal/middleware/ratelimit.go` so that:

- it reads `principal.UserID`
- it reads capability via `GetCapability`
- if capability is missing, it calls `c.Next(ctx)` immediately
- if `principal.UserID` is empty, it returns auth invalid or safely skips according to existing protected-route assumptions
- limiter key format becomes `rl:usercap:<userID>:<capability>`
- response headers remain `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

**Step 4: Run test to verify it passes**

Run: `go test ./internal/middleware -run 'TestRateLimit_' -v`
Expected: PASS

**Step 5: Commit**

```bash
git add internal/middleware/ratelimit.go internal/middleware/ratelimit_test.go
git commit -m "feat: bucket rate limits by user and capability"
```

### Task 3: Add capability-specific RPM config resolution

**Files:**
- Modify: `internal/config/config.go`
- Modify: `internal/config/config_test.go`

**Step 1: Write the failing tests**

```go
func TestConfig_ResolveCapabilityRateLimitRPM_UsesOverride(t *testing.T) {}

func TestConfig_ResolveCapabilityRateLimitRPM_FallsBackToDefault(t *testing.T) {}

func TestConfig_ResolveCapabilityRateLimitRPM_NormalizesCapabilityName(t *testing.T) {}
```

Test expectations:

- `image.generate` resolves from `ANYCAP_RATE_LIMIT_IMAGE_GENERATE_RPM`
- capability without override falls back to `ANYCAP_RATE_LIMIT_RPM`
- dot-separated capability names normalize to uppercase underscore env names

**Step 2: Run test to verify it fails**

Run: `go test ./internal/config -run 'TestConfig_ResolveCapabilityRateLimitRPM' -v`
Expected: FAIL because capability-level resolution does not exist

**Step 3: Write minimal implementation**

Add config support that:

- keeps existing `RateLimitRPM`
- adds a helper such as `ResolveCapabilityRateLimitRPM(capability string) int`
- looks up `ANYCAP_RATE_LIMIT_<CAPABILITY>_RPM`
- falls back to `RateLimitRPM`
- treats invalid or non-positive override values as absent

Implementation should stay small and avoid introducing a large config registry unless tests require it.

**Step 4: Run test to verify it passes**

Run: `go test ./internal/config -run 'TestConfig_ResolveCapabilityRateLimitRPM' -v`
Expected: PASS

**Step 5: Commit**

```bash
git add internal/config/config.go internal/config/config_test.go
git commit -m "feat: support capability-specific rate limit config"
```

### Task 4: Thread capability RPM resolution into router construction

**Files:**
- Modify: `internal/app/bootstrap.go`
- Modify: `internal/app/bootstrap_test.go`

**Step 1: Write the failing test**

```go
func TestBuildServer_ProtectedRoutesUseCapabilityAwareRateLimit(t *testing.T) {}
```

Test expectation:

- protected group still wires one shared rate limit middleware
- middleware receives config needed to resolve per-capability RPM values

**Step 2: Run test to verify it fails**

Run: `go test ./internal/app -run TestBuildServer_ProtectedRoutesUseCapabilityAwareRateLimit -v`
Expected: FAIL because bootstrap only passes a flat RPM integer

**Step 3: Write minimal implementation**

Refactor bootstrap wiring so that:

- rate limit middleware can resolve the effective RPM for the current capability
- the configuration dependency stays in bootstrap / middleware boundary
- no handler gains direct knowledge of env vars

Preferred shape:

- pass `config.Config` or a small resolver func into `middleware.RateLimit`
- keep changes minimal and local

**Step 4: Run test to verify it passes**

Run: `go test ./internal/app -run TestBuildServer_ProtectedRoutesUseCapabilityAwareRateLimit -v`
Expected: PASS

**Step 5: Commit**

```bash
git add internal/app/bootstrap.go internal/app/bootstrap_test.go
git commit -m "refactor: wire capability-aware rate limit config"
```

### Task 5: Mark image, video, capability, and feedback routes with explicit capability names

**Files:**
- Modify: `internal/transport/http/handlers/image/handler.go`
- Modify: `internal/transport/http/handlers/video/handler.go`
- Modify: `internal/transport/http/handlers/capabilities/handler.go`
- Modify: `internal/transport/http/handlers/feedback/handler.go`
- Modify: `internal/transport/http/router_test.go`

**Step 1: Write the failing tests**

Add route-level tests proving:

- `POST /v1/image/generate` uses `image.generate`
- `POST /v1/video/generate` uses `video.generate`
- `POST /v1/capabilities/image/read` uses `image.read`
- `POST /v1/capabilities/video/read` uses `video.read`
- `POST /v1/capabilities/presign` uses `asset.upload.prepare`
- `POST /v1/feedback` uses `feedback.submit`

Use a low RPM such as `1` and issue repeated requests from the same logical user to verify `429` on the second request.

**Step 2: Run test to verify it fails**

Run: `go test ./internal/transport/http -run 'TestRouter_(Image|Video|Capabilities|Feedback)_CapabilityRateLimit' -v`
Expected: FAIL because these routes do not yet set capability context

**Step 3: Write minimal implementation**

Modify route registration to attach `middleware.WithCapability(...)` before the handler for each function route listed in the design doc.

Do not add capabilities to:

- `/v1/status`
- `/v1/me`
- `/v1/logs`
- `/v1/auth/logout`
- protected auth flow helper routes

**Step 4: Run test to verify it passes**

Run: `go test ./internal/transport/http -run 'TestRouter_(Image|Video|Capabilities|Feedback)_CapabilityRateLimit' -v`
Expected: PASS

**Step 5: Commit**

```bash
git add internal/transport/http/handlers/image/handler.go internal/transport/http/handlers/video/handler.go internal/transport/http/handlers/capabilities/handler.go internal/transport/http/handlers/feedback/handler.go internal/transport/http/router_test.go
git commit -m "feat: tag core capability routes for rate limiting"
```

### Task 6: Mark drive routes with explicit capability names

**Files:**
- Modify: `internal/transport/http/handlers/drive/handler.go`
- Modify: `internal/transport/http/router_test.go`

**Step 1: Write the failing tests**

Add route-level tests covering:

- `drive.folder.create`
- `drive.file.upload.prepare`
- `drive.file.upload.complete`
- `drive.browse`
- `drive.item.update`
- `drive.item.delete`
- `drive.share.update`
- `drive.share.rotate`
- `drive.share.revoke`

Use a table-driven test to keep the file readable.

**Step 2: Run test to verify it fails**

Run: `go test ./internal/transport/http -run TestRouter_DriveCapabilityRateLimit -v`
Expected: FAIL because drive routes do not yet set capability context

**Step 3: Write minimal implementation**

Attach the exact capability names from the design doc to each drive route.

**Step 4: Run test to verify it passes**

Run: `go test ./internal/transport/http -run TestRouter_DriveCapabilityRateLimit -v`
Expected: PASS

**Step 5: Commit**

```bash
git add internal/transport/http/handlers/drive/handler.go internal/transport/http/router_test.go
git commit -m "feat: tag drive routes for capability rate limits"
```

### Task 7: Mark page routes with explicit capability names

**Files:**
- Modify: `internal/transport/http/handlers/page/handler.go`
- Modify: `internal/transport/http/router_test.go`

**Step 1: Write the failing tests**

Add route-level tests covering:

- `page.create`
- `page.list`
- `page.read`
- `page.update`
- `page.version.create`
- `page.asset.upload.prepare`
- `page.asset.upload.complete`
- `page.version.finalize`
- `page.publish`
- `page.rollback`
- `page.unpublish`
- `page.version.list`

**Step 2: Run test to verify it fails**

Run: `go test ./internal/transport/http -run TestRouter_PageCapabilityRateLimit -v`
Expected: FAIL because page routes do not yet set capability context

**Step 3: Write minimal implementation**

Attach the exact capability names from the design doc to each page route.

**Step 4: Run test to verify it passes**

Run: `go test ./internal/transport/http -run TestRouter_PageCapabilityRateLimit -v`
Expected: PASS

**Step 5: Commit**

```bash
git add internal/transport/http/handlers/page/handler.go internal/transport/http/router_test.go
git commit -m "feat: tag page routes for capability rate limits"
```

### Task 8: Verify excluded system and auth helper routes bypass capability rate limits

**Files:**
- Modify: `internal/transport/http/router_test.go`

**Step 1: Write the failing test**

```go
func TestRouter_SystemAndAuthHelperRoutes_BypassCapabilityRateLimit(t *testing.T) {}
```

Cover:

- `/v1/status`
- `/v1/dashboard/summary`
- `/v1/me`
- `/v1/credits/balance`
- `/v1/logs`
- `/v1/auth/logout`
- `/v1/auth/exchange`
- `/v1/auth/device-verify`
- `/v1/auth/browser-verify`

Test expectation:

- repeated requests from the same user must not return `429` due to missing capability marker

**Step 2: Run test to verify it fails**

Run: `go test ./internal/transport/http -run TestRouter_SystemAndAuthHelperRoutes_BypassCapabilityRateLimit -v`
Expected: FAIL if any excluded route accidentally participates in capability rate limiting

**Step 3: Write minimal implementation**

Adjust route registration or middleware assumptions only if needed. Prefer keeping excluded routes unchanged and relying on “no capability means skip” behavior.

**Step 4: Run test to verify it passes**

Run: `go test ./internal/transport/http -run TestRouter_SystemAndAuthHelperRoutes_BypassCapabilityRateLimit -v`
Expected: PASS

**Step 5: Commit**

```bash
git add internal/transport/http/router_test.go
git commit -m "test: cover excluded routes for capability rate limiting"
```

### Task 9: Run focused verification and full relevant regression suite

**Files:**
- Modify: `internal/middleware/ratelimit.go`
- Modify: `internal/config/config.go`
- Modify: `internal/app/bootstrap.go`
- Modify: `internal/transport/http/router_test.go`

**Step 1: Run focused middleware tests**

Run: `go test ./internal/middleware -run 'TestWithCapability|TestRateLimit_' -v`
Expected: PASS

**Step 2: Run focused config and bootstrap tests**

Run: `go test ./internal/config ./internal/app -run 'TestConfig_ResolveCapabilityRateLimitRPM|TestBuildServer_ProtectedRoutesUseCapabilityAwareRateLimit' -v`
Expected: PASS

**Step 3: Run focused HTTP router tests**

Run: `go test ./internal/transport/http -run 'TestRouter_(Image|Video|Capabilities|Feedback|Drive|Page|SystemAndAuthHelperRoutes_)' -v`
Expected: PASS

**Step 4: Run broader regression suite**

Run: `go test ./internal/... ./test/integration/...`
Expected: PASS, or any unrelated failures documented clearly before merge

**Step 5: Commit**

```bash
git add internal/middleware internal/config internal/app internal/transport/http
git commit -m "test: verify capability-aware user rate limiting"
```
