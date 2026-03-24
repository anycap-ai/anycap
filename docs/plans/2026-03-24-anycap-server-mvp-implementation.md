# AnyCap Server MVP Framework Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在当前 Hertz 骨架上落地 AnyCap Server Phase 1 MVP 框架，完成 API Key 系统、限流、login 封装、image 能力主链路、外部 Infra 抽象与基础可观测性。

**Architecture:** 采用分层模块化单体（transport/middleware/application/domain/infrastructure）。Server 是 CLI 的唯一后端入口，统一承接 API Key、限流、登录、计费、路由与日志。外部依赖通过 ports 抽象接入，MVP 优先保证接口稳定、主链路打通与关键链路幂等。

**Tech Stack:** Go 1.24, Hertz, PostgreSQL, Redis, `testing`, `httptest`

---

**Design References:**
- `docs/plans/2026-03-24-anycap-server-mvp-design.md`
- `docs/system-architecture.md`
- `docs/cli-architecture.md`

### Task 0: 对齐现有 Hertz 骨架与目标目录布局

**Files:**
- Modify: `cmd/service/main.go`
- Move/Create: `internal/http/handlers/health.go` -> `internal/transport/http/handlers/health.go`
- Move/Create: `internal/config/http.go` -> `internal/config/config.go`
- Create: `internal/transport/http/router.go`

**Step 1: 写最小健康路由回归测试**

```go
func TestHealthRoutes(t *testing.T) {
    // /ping, /healthz, /v1/healthz return 200
}
```

**Step 2: 运行测试确认失败**

Run: `go test ./internal/transport/http/... -run TestHealthRoutes -v`
Expected: FAIL

**Step 3: 迁移当前骨架到目标目录**

- 建立 `internal/transport/http` 目录
- 保持 `/ping`、`/healthz`、`/v1/healthz` 兼容
- 让 `main.go` 通过 router 装配路由

**Step 4: 运行测试确认通过**

Run: `go test ./internal/transport/http/... -run TestHealthRoutes -v`
Expected: PASS

**Step 5: Commit**

```bash
git add cmd/service/main.go internal/config internal/http internal/transport/http
git commit -m "refactor: align hertz skeleton with target server layout"
```

### Task 1: 配置加载与启动装配

**Files:**
- Create: `internal/app/bootstrap.go`
- Modify: `internal/config/config.go`
- Modify: `cmd/service/main.go`

**Step 1: 写配置加载测试**

```go
func TestLoad_Defaults(t *testing.T) {
    cfg, err := LoadFromEnv()
    if err != nil { t.Fatal(err) }
    if cfg.HTTPAddr != ":8080" { t.Fatalf("got %s", cfg.HTTPAddr) }
    if cfg.RuntimeMode != "stub" { t.Fatalf("got %s", cfg.RuntimeMode) }
}
```

```go
func TestLoad_IntegrationRequiresInfra(t *testing.T) {
    t.Setenv("ANYCAP_RUNTIME_MODE", "integration")
    _, err := LoadFromEnv()
    if err == nil { t.Fatal("expected error") }
}
```

**Step 2: 运行测试确认失败**

Run: `go test ./internal/config -v`
Expected: FAIL

**Step 3: 实现最小配置结构与 bootstrap**

```go
type Config struct {
    RuntimeMode       string
    HTTPAddr          string
    PGDSN             string
    RedisAddr         string
    RedisPassword     string
    RedisDB           int
    RateLimitRPM      int
    Auth0Enabled      bool
    Auth0Issuer       string
    Auth0Audience     string
    Auth0ClientID     string
    Auth0ClientSecret string
    Auth0RedirectURL  string
}
```

**Step 4: 运行测试确认通过**

Run: `go test ./internal/config -v`
Expected: PASS

**Step 5: Commit**

```bash
git add cmd/service/main.go internal/app/bootstrap.go internal/config/config.go
git commit -m "refactor: add bootstrap and runtime config loading"
```

### Task 2: 定义 domain 模型、错误与 ports

**Files:**
- Create: `internal/domain/model/principal.go`
- Create: `internal/domain/model/request.go`
- Create: `internal/domain/model/apikey.go`
- Create: `internal/domain/model/image.go`
- Create: `internal/domain/model/log.go`
- Create: `internal/domain/model/errors.go`
- Create: `internal/domain/port/auth.go`
- Create: `internal/domain/port/apikey.go`
- Create: `internal/domain/port/credit.go`
- Create: `internal/domain/port/nexushub.go`
- Create: `internal/domain/port/payment.go`
- Create: `internal/domain/port/log.go`
- Create: `internal/domain/port/ratelimit.go`

**Step 1: 写编译期接口测试**

```go
func TestPortsCompile(t *testing.T) {
    var _ port.APIKeyService
    var _ port.Auth0Client
    var _ port.CreditClient
    var _ port.NexusHubClient
    var _ port.PaymentClient
}
```

**Step 2: 运行测试确认失败**

Run: `go test ./internal/domain/... -v`
Expected: FAIL

**Step 3: 实现最小模型和接口**

- `Principal`
- `RequestMeta`
- `APIKey`
- `PaymentClient` 只定义边界，不要求真实实现
- 为关键写操作预留 `request_id` / `idempotency_key` 入参
- 统一业务错误类型：`AUTH_INVALID`、`RATE_LIMITED`、`INSUFFICIENT_CREDIT`、`BILLING_UNCERTAIN`

**Step 4: 运行测试确认通过**

Run: `go test ./internal/domain/... -v`
Expected: PASS

**Step 5: Commit**

```bash
git add internal/domain
git commit -m "feat: define anycap server domain models and ports"
```

### Task 3: 定义外部 Infra 抽象与 stub 基座

**Files:**
- Create: `internal/infrastructure/auth/auth0_client.go`
- Create: `internal/infrastructure/credit/client_stub.go`
- Create: `internal/infrastructure/nexushub/client_stub.go`
- Create: `internal/infrastructure/payment/client_stub.go`

**Step 1: 写 stub 编译期与最小行为测试**

```go
func TestAuth0Stub_BuildLoginURL(t *testing.T) {}
func TestCreditStub_GetBalance(t *testing.T) {}
func TestCreditStub_DeductIsIdempotent(t *testing.T) {}
func TestNexusHubStub_ListImageModels(t *testing.T) {}
func TestPaymentStub_CreateTopUpSession(t *testing.T) {}
func TestPaymentStub_WebhookIsIdempotent(t *testing.T) {}
```

**Step 2: 运行测试确认失败**

Run: `go test ./internal/infrastructure/... -run 'TestAuth0Stub|TestCreditStub|TestNexusHubStub|TestPaymentStub' -v`
Expected: FAIL

**Step 3: 实现最小 Infra stub 基座**

- `Auth0Client` stub 返回固定 login URL，并支持固定 code -> user 映射
- `CreditClient` stub 返回固定 balance，并支持基于 `request_id` 的幂等 deduct
- `NexusHubClient` stub 返回固定 models/schema/generate 结果
- `PaymentClient` stub 只返回占位 checkout session，并基于 `idempotency_key` / `event_id` 提供最小去重语义

**Step 4: 运行测试确认通过**

Run: `go test ./internal/infrastructure/... -run 'TestAuth0Stub|TestCreditStub|TestNexusHubStub|TestPaymentStub' -v`
Expected: PASS

**Step 5: Commit**

```bash
git add internal/infrastructure/auth internal/infrastructure/credit internal/infrastructure/nexushub internal/infrastructure/payment
git commit -m "feat: add infra client stubs and integration boundaries"
```

### Task 4: 统一 HTTP 响应与基础 middleware

**Files:**
- Create: `internal/transport/http/response.go`
- Create: `internal/transport/http/dto/error.go`
- Create: `internal/middleware/context.go`
- Create: `internal/middleware/request_id.go`
- Create: `internal/middleware/access_log.go`
- Create: `internal/middleware/recover.go`

**Step 1: 写错误映射测试**

```go
func TestMapDomainError(t *testing.T) {
    status, payload := MapDomainError(domain.ErrAuthInvalid)
    if status != 401 { t.Fatalf("got %d", status) }
    if payload.Error.Code != "AUTH_INVALID" { t.Fatalf("got %s", payload.Error.Code) }
}
```

**Step 2: 运行测试确认失败**

Run: `go test ./internal/transport/http ./internal/middleware -v`
Expected: FAIL

**Step 3: 实现最小响应与 middleware**

- `request_id` 注入 context 和响应头
- `access_log` 记录 2xx/4xx/5xx
- `recover` 统一返回 `INTERNAL_ERROR`
- context helper 统一读写 `request_id` / `principal`

**Step 4: 运行测试确认通过**

Run: `go test ./internal/transport/http ./internal/middleware -v`
Expected: PASS

**Step 5: Commit**

```bash
git add internal/transport/http internal/middleware
git commit -m "feat: add shared response layer and base middleware"
```

### Task 5: PostgreSQL API Key System 与鉴权中间件

**Files:**
- Create: `internal/infrastructure/postgres/db.go`
- Create: `internal/infrastructure/postgres/api_key_repo.go`
- Create: `internal/infrastructure/postgres/migrations/0001_init_api_keys.sql`
- Create: `internal/infrastructure/auth/apikey_authenticator.go`
- Create: `internal/middleware/auth.go`

**Step 1: 写 API Key 鉴权测试**

```go
func TestAuthenticateAPIKey(t *testing.T) {
    // active / revoked / expired
}
```

```go
func TestAuthMiddleware_RejectMissingBearer(t *testing.T) {}
```

**Step 2: 运行测试确认失败**

Run: `go test ./internal/infrastructure/auth ./internal/middleware -v`
Expected: FAIL

**Step 3: 实现最小 API Key 主链路**

- 通过 `key_prefix` 查 PG
- 校验 `key_hash`
- 更新 `last_used_at`
- 将 `Principal` 放入请求上下文

**Step 4: 运行测试确认通过**

Run: `go test ./internal/infrastructure/auth ./internal/middleware -v`
Expected: PASS

**Step 5: Commit**

```bash
git add internal/infrastructure/postgres internal/infrastructure/auth internal/middleware/auth.go
git commit -m "feat: implement api key auth pipeline"
```

### Task 6: Redis Rate Limiter

**Files:**
- Create: `internal/infrastructure/redis/ratelimiter.go`
- Create: `internal/infrastructure/redis/lua/fixed_window.lua`
- Create: `internal/middleware/ratelimit.go`

**Step 1: 写限流测试**

```go
func TestRateLimit_Exceeded(t *testing.T) {
    // 61st request in one minute returns 429
}
```

**Step 2: 运行测试确认失败**

Run: `go test ./internal/infrastructure/redis ./internal/middleware -v`
Expected: FAIL

**Step 3: 实现最小限流能力**

- key: `rl:apikey:<api_key_id>:<bucket>`
- headers: `X-RateLimit-Limit/Remaining/Reset`
- 超限返回 `RATE_LIMITED`

**Step 4: 运行测试确认通过**

Run: `go test ./internal/infrastructure/redis ./internal/middleware -v`
Expected: PASS

**Step 5: Commit**

```bash
git add internal/infrastructure/redis internal/middleware/ratelimit.go
git commit -m "feat: add redis rate limiter middleware"
```

### Task 7: image models 元数据接口

**Files:**
- Create: `internal/application/image_models.go`
- Create: `internal/transport/http/dto/image.go`
- Create: `internal/transport/http/handlers/image_models.go`

**Step 1: 写 models 与 schema handler 测试**

```go
func TestImageModelsHandler(t *testing.T) {}
func TestImageModelSchemaHandler(t *testing.T) {}
```

**Step 2: 运行测试确认失败**

Run: `go test ./internal/application ./internal/transport/http/handlers -run 'TestImageModels|TestImageModelSchema' -v`
Expected: FAIL

**Step 3: 实现最小元数据接口**

- `GET /v1/image/models`
- `GET /v1/image/models/:name/schema`
- 先由 NexusHub stub 返回静态模型数据

**Step 4: 运行测试确认通过**

Run: `go test ./internal/application ./internal/transport/http/handlers -run 'TestImageModels|TestImageModelSchema' -v`
Expected: PASS

**Step 5: Commit**

```bash
git add internal/application internal/infrastructure/nexushub internal/transport/http
git commit -m "feat: add image model metadata endpoints"
```

### Task 8: image generate 主链路

**Files:**
- Create: `internal/application/image_generate.go`
- Create: `internal/transport/http/handlers/image.go`

**Step 1: 写 usecase 测试**

```go
func TestGenerateImage_InsufficientCredit(t *testing.T) {}
func TestGenerateImage_UpstreamFailure(t *testing.T) {}
func TestGenerateImage_DeductFailure(t *testing.T) {}
func TestGenerateImage_DeductIsIdempotent(t *testing.T) {}
func TestGenerateImage_Success(t *testing.T) {}
```

**Step 2: 运行测试确认失败**

Run: `go test ./internal/application -run TestGenerateImage -v`
Expected: FAIL

**Step 3: 实现最小 happy path**

- 参数校验
- `GetBalance -> GenerateImage -> Deduct`
- Deduct 失败返回 `BILLING_UNCERTAIN`
- 同一 `request_id` 重试时不重复扣费
- 返回统一 JSON

**Step 4: 运行测试确认通过**

Run: `go test ./internal/application ./internal/transport/http/handlers -run TestGenerateImage -v`
Expected: PASS

**Step 5: Commit**

```bash
git add internal/application internal/infrastructure/credit internal/transport/http
git commit -m "feat: add image generate usecase and handler"
```

### Task 9: login init / callback 主链路

**Files:**
- Create: `internal/application/login_init.go`
- Create: `internal/application/login_callback.go`
- Create: `internal/transport/http/dto/login.go`
- Create: `internal/transport/http/handlers/login.go`

**Step 1: 写 login handler 测试**

```go
func TestLoginInitHandler(t *testing.T) {}
func TestLoginCallbackHandler(t *testing.T) {}
func TestLoginCallback_IsIdempotent(t *testing.T) {}
```

**Step 2: 运行测试确认失败**

Run: `go test ./internal/application ./internal/transport/http/handlers -run 'TestLoginInit|TestLoginCallback' -v`
Expected: FAIL

**Step 3: 实现最小 login 流程**

- `login/init` 返回链接和 state
- `login/callback` 交换 code
- 创建或查询用户
- 生成 API Key 并返回 CLI
- 对重复 callback 提供幂等保护，避免重复建资源或重复发 key

**Step 4: 运行测试确认通过**

Run: `go test ./internal/application ./internal/transport/http/handlers -run 'TestLoginInit|TestLoginCallback' -v`
Expected: PASS

**Step 5: Commit**

```bash
git add internal/application internal/infrastructure/auth internal/transport/http
git commit -m "feat: add login init and callback flow"
```

### Task 10: 调用日志与状态接口

**Files:**
- Create: `internal/infrastructure/postgres/call_log_repo.go`
- Create: `internal/infrastructure/postgres/migrations/0002_call_logs.sql`
- Create: `internal/application/status.go`
- Create: `internal/transport/http/dto/status.go`
- Create: `internal/transport/http/handlers/status.go`

**Step 1: 写 status 与 log repo 测试**

```go
func TestStatusHandler(t *testing.T) {}
func TestCallLogRepo_Insert(t *testing.T) {}
```

**Step 2: 运行测试确认失败**

Run: `go test ./internal/infrastructure/postgres ./internal/transport/http/handlers -v`
Expected: FAIL

**Step 3: 实现最小状态与日志能力**

- status 返回服务状态 + 当前用户信息
- 调用日志 best-effort 落库

**Step 4: 运行测试确认通过**

Run: `go test ./internal/infrastructure/postgres ./internal/transport/http/handlers -v`
Expected: PASS

**Step 5: Commit**

```bash
git add internal/infrastructure/postgres internal/application/status.go internal/transport/http
git commit -m "feat: add status endpoint and call logging"
```

### Task 11: 幂等记录与关键去重存储

**Files:**
- Create: `internal/infrastructure/postgres/migrations/0003_idempotency.sql`
- Create: `internal/infrastructure/postgres/idempotency_repo.go`
- Modify: `internal/domain/port/payment.go`
- Modify: `internal/domain/port/credit.go`

**Step 1: 写幂等 repo 测试**

```go
func TestIdempotencyRepo_ClaimOnce(t *testing.T) {}
func TestIdempotencyRepo_DuplicateClaim(t *testing.T) {}
```

**Step 2: 运行测试确认失败**

Run: `go test ./internal/infrastructure/postgres -run TestIdempotencyRepo -v`
Expected: FAIL

**Step 3: 实现最小幂等存储能力**

- 为关键 scope 记录 `idempotency_key`
- 支持“首次 claim 成功，重复 claim 返回已存在”
- 给 Payment webhook / checkout / Credit 扣费预留统一复用能力

**Step 4: 运行测试确认通过**

Run: `go test ./internal/infrastructure/postgres -run TestIdempotencyRepo -v`
Expected: PASS

**Step 5: Commit**

```bash
git add internal/infrastructure/postgres internal/domain/port/payment.go internal/domain/port/credit.go
git commit -m "feat: add idempotency storage for critical operations"
```

### Task 12: 路由装配与端到端联调

**Files:**
- Modify: `internal/transport/http/router.go`
- Modify: `internal/app/bootstrap.go`
- Modify: `cmd/service/main.go`

**Step 1: 写最小 HTTP 合约测试**

```go
func TestImageGenerateContract(t *testing.T) {}
func TestLoginContract(t *testing.T) {}
```

**Step 2: 运行测试确认失败**

Run: `go test ./internal/transport/http -v`
Expected: FAIL

**Step 3: 组装完整路由和依赖**

- 路由：`/ping` `/healthz` `/v1/status` `/v1/login/init` `/v1/login/callback` `/v1/image/models` `/v1/image/models/:name/schema` `/v1/image/generate`
- 中间件顺序：`recover -> request_id -> access_log -> auth -> rate_limit`
- `login/*` 路由按需跳过 auth middleware

**Step 4: 运行测试确认通过**

Run: `go test ./...`
Expected: PASS

**Step 5: Commit**

```bash
git add cmd/service/main.go internal/app/bootstrap.go internal/transport/http/router.go
git commit -m "feat: wire anycap server mvp routes"
```

### Task 13: 本地运行与 smoke test 文档

**Files:**
- Create: `docs/server-mvp-local-run.md`

**Step 1: 写运行文档**

包含：

- runtime mode 说明
- PG / Redis 占位配置
- `curl /v1/login/init`
- `curl /v1/image/models`
- `curl /v1/image/generate`

**Step 2: 运行最小 smoke test**

Run: `go test ./... && go run ./cmd/service`
Expected: tests PASS，服务启动成功

**Step 3: Commit**

```bash
git add docs/server-mvp-local-run.md
git commit -m "docs: add server mvp local run guide"
```
