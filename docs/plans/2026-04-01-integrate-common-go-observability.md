# Integrate common-go Observability (Server-side)

> Date: 2026-04-01

## Goal

Replace ad-hoc `log.Printf` + custom request_id system with common-go's structured observability stack: `logging`, `trace`, `metrics`, and `hertz/middleware`. Clean cutover, no backward compatibility shims.

## What Changes

| Before | After |
|--------|-------|
| `log.Printf()` everywhere | `logging.WithContext(ctx)` structured JSON |
| Custom `RequestID()` middleware + `X-Request-Id` header | common-go `TraceMiddleware()` + `X-Trace-ID` header |
| Custom `AccessLog()` with `log.Printf` | common-go `AccessMiddleware()` with structured logging |
| No metrics | common-go `MetricsMiddleware()` — `http_request_total`, `http_request_duration_seconds` |
| No trace propagation to outbound HTTP | `trace.Setup()` wraps `http.DefaultTransport`, auto-injects `X-Trace-ID` |

## Middleware Stack (Final)

```
1. middleware.Recover()                          — Keep custom: JSON error envelope + structured panic log
2. commonmw.TraceMiddleware()                    — common-go: X-Trace-ID injection (UUID v4)
3. commonmw.AccessMiddleware("/ping","/healthz") — common-go: structured access logging
4. commonmw.MetricsMiddleware()                  — common-go: Prometheus request metrics
5. middleware.CORS(...)                           — Keep custom: unchanged
```

Then per-route: Auth → RateLimit → FeatureGate (unchanged).

## Design Decisions

### 1. Fully replace request_id with trace_id

Delete the entire custom request_id system. No bridge, no compat shim.

- Delete `internal/middleware/request_id.go`
- Remove `SetRequestID`, `GetRequestID`, `ContextWithRequestID`, `RequestIDFromContext` from `context.go`
- All code that needs the request identifier calls `trace.GetTraceID(ctx)` directly
- HTTP header changes from `X-Request-Id` to `X-Trace-ID` (set by `TraceMiddleware`)
- Outbound HTTP clients get `X-Trace-ID` automatically via `trace.Setup()` wrapping `http.DefaultTransport` — delete the manual header-setting code in infra clients

### 2. Keep custom Recover, replace AccessLog

- **Recover**: common-go's `RecoverMiddleware()` returns plain 500. Ours returns `dto.ErrorEnvelope` JSON. Keep custom, but enhance with `logging.WithContext(ctx)` + `debug.Stack()`.
- **AccessLog**: Delete. common-go's `AccessMiddleware()` does the same thing with structured logging. The custom error-body-parsing logic in `AccessLog()` is no longer needed — errors are logged at the point they occur.

### 3. Update WriteSuccess / WriteError signatures

Current:
```go
func WriteSuccess(ctx *app.RequestContext, data any)
func WriteError(ctx *app.RequestContext, statusCode int, code, message string)
```

After:
```go
func WriteSuccess(c context.Context, ctx *app.RequestContext, data any)
func WriteError(c context.Context, ctx *app.RequestContext, statusCode int, code, message string)
```

This lets them call `trace.GetTraceID(c)` for the response envelope. All handler call sites already have both `c context.Context` and `ctx *app.RequestContext` in scope.

### 4. Domain model `RequestID` fields — keep as-is

The `RequestID string` field in `GenerateImageRequest`, `GenerateVideoRequest`, etc. is a valid semantic name ("the ID for this request"). The value changes from `req_<timestamp>` to UUID, but the field name is internal and correct. No rename.

### 5. Config additions

| Env var | Default | Purpose |
|---------|---------|---------|
| `ANYCAP_LOG_LEVEL` | `"info"` | Structured log level |
| `ANYCAP_LOG_FORMAT` | `"json"` | Log format (`json` or `text`) |

No metrics push config for now — pull-based scraping is sufficient.

## Implementation Steps

### Step 1: Config

**`internal/config/config.go`** — Add `LogLevel`, `LogFormat` fields + env loading.

### Step 2: Init observability in main.go

**`cmd/anycap-server/main.go`** — Before anything else:
```go
logging.Init(&logging.Config{Level: cfg.LogLevel, Format: cfg.LogFormat, Output: "stdout"})
trace.Setup()
metrics.Init(cfg.AppName, buildinfo.Current().Version, cfg.AppEnv)
```

### Step 3: Swap middleware stack

**`internal/app/bootstrap.go`**:
```go
import commonmw "gitlab.knoffice.tech/open/common-go/hertz/middleware"

Middlewares: []hertzapp.HandlerFunc{
    middleware.Recover(),
    commonmw.TraceMiddleware(),
    commonmw.AccessMiddleware("/ping", "/healthz"),
    commonmw.MetricsMiddleware(),
    middleware.CORS(buildCORSAllowedOrigins(cfg)),
},
```

### Step 4: Delete request_id system

- **Delete** `internal/middleware/request_id.go`
- **`internal/middleware/context.go`** — Remove `ctxRequestIDKey`, `requestIDKey`, `requestIDHeader`, `SetRequestID`, `GetRequestID`, `ContextWithRequestID`, `RequestIDFromContext`. Keep `principalKey`, `SetPrincipal`, `GetPrincipal`, user_id helpers.

### Step 5: Migrate all GetRequestID / RequestIDFromContext callers

Replace `middleware.GetRequestID(ctx)` → `trace.GetTraceID(c)` in:

| File | Approx usages |
|------|---------------|
| `handlers/response.go` | 2 (signature change) |
| `handlers/image/handler.go` | 5 |
| `handlers/video/handler.go` | 5 |
| `handlers/music/handler.go` | 5 |
| `handlers/login/handler.go` | ~14 |
| `handlers/system/handler.go` | 7 |
| `handlers/feedback/handler.go` | 5 |
| `handlers/drive/*.go` | varies |
| `handlers/page/*.go` | varies |
| `handlers/catalog/*.go` | varies |
| `handlers/capabilities/*.go` | varies |
| `middleware/recover.go` | 1 |
| `middleware/feature_gate.go` | 4 |
| `middleware/ratelimit.go` | 2 |
| `middleware/auth.go` | 2 |

Replace `middleware.RequestIDFromContext(ctx)` → `trace.GetTraceID(ctx)` + delete manual `X-Request-Id` header setting in:

| File | Usages |
|------|--------|
| `infrastructure/nexushub/client.go` | 4 blocks |
| `infrastructure/nexushub/platform_client.go` | 2 blocks |
| `infrastructure/agentplatform/client.go` | 1 block |

After `trace.Setup()`, outbound `http.DefaultTransport` auto-injects `X-Trace-ID`, so the manual header setting is redundant.

### Step 6: Enhance Recover middleware

**`internal/middleware/recover.go`** — Add structured panic logging:
```go
logging.WithContext(ctx).WithField("stack", string(debug.Stack())).Errorf("panic: %v", recovered)
```

### Step 7: Clean up access_log.go

**`internal/middleware/access_log.go`** — Delete `AccessLog()`. Keep `ReportError()`, `getReportedError()`, `extractResponseError()` (still used by Recover and handlers).

### Step 8: Migrate log.Printf throughout server code

| File | Count |
|------|-------|
| `cmd/anycap-server/main.go` | 4 |
| `internal/app/bootstrap.go` | ~20 |
| `internal/config/dconf.go` | 4 |
| `internal/config/feature_provider.go` | 2 |
| `internal/config/ratelimit_provider.go` | 5 |

Pattern: `log.Printf("foo: bar %s", x)` → `logging.WithField("key", x).Info("foo: bar")`

### Step 9: Update tests

- **`internal/middleware/access_log_test.go`** — Rewrite to test `ReportError`/`extractResponseError` only (the `AccessLog()` function is deleted)
- **`internal/infrastructure/nexushub/client_test.go`** — Update `X-Request-Id` header assertions to `X-Trace-ID`
- **`internal/transport/http/router_test.go`** — Update middleware setup and header assertions

## Files Changed

| File | Action |
|------|--------|
| `internal/config/config.go` | Add LogLevel, LogFormat |
| `cmd/anycap-server/main.go` | Init logging, trace, metrics |
| `internal/app/bootstrap.go` | Swap middleware, migrate log.Printf |
| `internal/middleware/request_id.go` | **Delete** |
| `internal/middleware/context.go` | Remove request_id helpers |
| `internal/middleware/recover.go` | Structured panic logging |
| `internal/middleware/access_log.go` | Remove AccessLog(), keep ReportError |
| `internal/middleware/access_log_test.go` | Rewrite |
| `internal/middleware/feature_gate.go` | trace.GetTraceID |
| `internal/middleware/ratelimit.go` | trace.GetTraceID |
| `internal/middleware/auth.go` | trace.GetTraceID |
| `internal/transport/http/handlers/response.go` | Add context.Context param |
| `internal/transport/http/handlers/image/handler.go` | trace.GetTraceID |
| `internal/transport/http/handlers/video/handler.go` | trace.GetTraceID |
| `internal/transport/http/handlers/music/handler.go` | trace.GetTraceID |
| `internal/transport/http/handlers/login/handler.go` | trace.GetTraceID |
| `internal/transport/http/handlers/system/handler.go` | trace.GetTraceID |
| `internal/transport/http/handlers/feedback/handler.go` | trace.GetTraceID |
| `internal/transport/http/handlers/drive/*.go` | trace.GetTraceID |
| `internal/transport/http/handlers/page/*.go` | trace.GetTraceID |
| `internal/transport/http/handlers/catalog/*.go` | trace.GetTraceID |
| `internal/transport/http/handlers/capabilities/*.go` | trace.GetTraceID |
| `internal/transport/http/handlers/modelroute/*.go` | trace.GetTraceID |
| `internal/infrastructure/nexushub/client.go` | Delete manual X-Request-Id |
| `internal/infrastructure/nexushub/platform_client.go` | Delete manual X-Request-Id |
| `internal/infrastructure/agentplatform/client.go` | Delete manual X-Request-ID |
| `internal/infrastructure/nexushub/client_test.go` | Update header assertions |
| `internal/transport/http/router_test.go` | Update middleware + assertions |
| `internal/config/dconf.go` | logging migration |
| `internal/config/feature_provider.go` | logging migration |
| `internal/config/ratelimit_provider.go` | logging migration |

## Verification

1. `go build ./cmd/anycap-server/` — compiles
2. `go test ./internal/...` — all tests pass
3. `make dev` → `curl -v http://127.0.0.1:18080/ping` — verify:
   - Response has `X-Trace-ID` header (UUID v4)
   - No `X-Request-Id` header
   - Stdout shows structured JSON access log
   - Envelope `id` field is UUID
