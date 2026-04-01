# 集成 common-go 可观测性（仅服务端）

> 日期: 2026-04-01

## 目标

用 common-go 的结构化可观测性体系（`logging`、`trace`、`metrics`、`hertz/middleware`）全面替换现有的 `log.Printf` 和自定义 request_id 系统。干净切换，不做向后兼容。

## 变更对比

| 现状 | 目标 |
|------|------|
| 全局 `log.Printf()` 非结构化日志 | `logging.WithContext(ctx)` 结构化 JSON 日志 |
| 自定义 `RequestID()` 中间件 + `X-Request-Id` | common-go `TraceMiddleware()` + `X-Trace-ID` |
| 自定义 `AccessLog()` 用 `log.Printf` | common-go `AccessMiddleware()` 结构化访问日志 |
| 无 metrics | common-go `MetricsMiddleware()` — `http_request_total`、`http_request_duration_seconds` |
| 出站 HTTP 无 trace 传播 | `trace.Setup()` 包装 `http.DefaultTransport`，自动注入 `X-Trace-ID` |

## 最终中间件栈

```
1. middleware.Recover()                          — 保留自定义：JSON 错误信封 + 结构化 panic 日志
2. commonmw.TraceMiddleware()                    — common-go：注入 X-Trace-ID（UUID v4）
3. commonmw.AccessMiddleware("/ping","/healthz") — common-go：结构化访问日志（跳过健康检查）
4. commonmw.MetricsMiddleware()                  — common-go：Prometheus 请求指标
5. middleware.CORS(...)                           — 保留自定义：不变
```

路由级中间件不变：Auth → RateLimit → FeatureGate。

## 设计决策

### 1. 彻底用 trace_id 替换 request_id

删除整个自定义 request_id 体系，不做桥接、不做兼容。

- **删除** `internal/middleware/request_id.go`
- 从 `context.go` 中移除 `SetRequestID`、`GetRequestID`、`ContextWithRequestID`、`RequestIDFromContext`
- 所有需要请求标识的地方直接调用 `trace.GetTraceID(ctx)`
- HTTP Header 从 `X-Request-Id` 改为 `X-Trace-ID`（由 `TraceMiddleware` 设置）
- 出站 HTTP 客户端通过 `trace.Setup()` 包装的 `http.DefaultTransport` 自动携带 `X-Trace-ID` — 删除 infra client 中手动设置 header 的代码

### 2. 保留自定义 Recover，替换 AccessLog

- **Recover**：common-go 的 `RecoverMiddleware()` 只返回纯 500。我们的返回 `dto.ErrorEnvelope` JSON 格式，对 API 一致性更好。保留自定义版本，增加 `logging.WithContext(ctx)` + `debug.Stack()` 结构化 panic 日志。
- **AccessLog**：删除。common-go 的 `AccessMiddleware()` 用结构化日志实现相同功能。原有的从响应体解析错误码的逻辑不再需要 — 错误在发生处直接记录。

### 3. 更新 WriteSuccess / WriteError 签名

现状：
```go
func WriteSuccess(ctx *app.RequestContext, data any)
func WriteError(ctx *app.RequestContext, statusCode int, code, message string)
```

变更后：
```go
func WriteSuccess(c context.Context, ctx *app.RequestContext, data any)
func WriteError(c context.Context, ctx *app.RequestContext, statusCode int, code, message string)
```

新增 `context.Context` 参数以调用 `trace.GetTraceID(c)` 获取响应信封的 ID。所有 handler 调用点都已同时持有 `c context.Context` 和 `ctx *app.RequestContext`，改动是机械化的。

### 4. 领域模型 `RequestID` 字段 — 保持不变

`GenerateImageRequest`、`GenerateVideoRequest` 等结构体中的 `RequestID string` 字段语义正确（"该请求的唯一标识"）。值从 `req_<时间戳>` 变为 UUID，但字段名是内部命名，语义没问题，不重命名。

### 5. 配置新增

| 环境变量 | 默认值 | 用途 |
|---------|--------|------|
| `ANYCAP_LOG_LEVEL` | `"info"` | 结构化日志级别（debug/info/warn/error） |
| `ANYCAP_LOG_FORMAT` | `"json"` | 日志格式（json 或 text） |

暂不添加 metrics push 配置 — pull 模式的 Prometheus 抓取足够。

## 实施步骤

### Step 1: 配置字段

**`internal/config/config.go`** — 在 `Config` 结构体中新增 `LogLevel`、`LogFormat` 字段，在 `LoadFromEnv()` 中加载对应环境变量。

### Step 2: 在 main.go 中初始化可观测性

**`cmd/anycap-server/main.go`** — 在一切操作之前依次初始化：
```go
logging.Init(&logging.Config{Level: cfg.LogLevel, Format: cfg.LogFormat, Output: "stdout"})
trace.Setup()
metrics.Init(cfg.AppName, buildinfo.Current().Version, cfg.AppEnv)
```

同时将该文件内 4 处 `log.Printf` 迁移为 `logging`。

### Step 3: 替换中间件栈

**`internal/app/bootstrap.go`**：
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

同时将该文件内约 20 处 `log.Printf` 迁移为 `logging`。

### Step 4: 删除 request_id 体系

- **删除** `internal/middleware/request_id.go`
- **`internal/middleware/context.go`** — 移除 `ctxRequestIDKey`、`requestIDKey`、`requestIDHeader`、`SetRequestID`、`GetRequestID`、`ContextWithRequestID`、`RequestIDFromContext`。保留 `principalKey`、`SetPrincipal`、`GetPrincipal`、user_id 相关函数。

### Step 5: 迁移所有 GetRequestID / RequestIDFromContext 调用方

将 `middleware.GetRequestID(ctx)` 替换为 `trace.GetTraceID(c)`：

| 文件 | 约改动数 |
|------|---------|
| `handlers/response.go` | 2（签名变更） |
| `handlers/image/handler.go` | 5 |
| `handlers/video/handler.go` | 5 |
| `handlers/music/handler.go` | 5 |
| `handlers/login/handler.go` | ~14 |
| `handlers/system/handler.go` | 7 |
| `handlers/feedback/handler.go` | 5 |
| `handlers/drive/*.go` | 若干 |
| `handlers/page/*.go` | 若干 |
| `handlers/catalog/*.go` | 若干 |
| `handlers/capabilities/*.go` | 若干 |
| `handlers/modelroute/*.go` | 若干 |
| `middleware/recover.go` | 1 |
| `middleware/feature_gate.go` | 4 |
| `middleware/ratelimit.go` | 2 |
| `middleware/auth.go` | 2 |

将 `middleware.RequestIDFromContext(ctx)` 替换为 `trace.GetTraceID(ctx)`，并删除手动设置 `X-Request-Id` header 的代码：

| 文件 | 改动数 |
|------|--------|
| `infrastructure/nexushub/client.go` | 4 处 |
| `infrastructure/nexushub/platform_client.go` | 2 处 |
| `infrastructure/agentplatform/client.go` | 1 处 |

`trace.Setup()` 已包装 `http.DefaultTransport`，出站请求自动注入 `X-Trace-ID`，手动设置冗余。

### Step 6: 增强 Recover 中间件

**`internal/middleware/recover.go`** — 添加结构化 panic 日志：
```go
logging.WithContext(ctx).WithField("stack", string(debug.Stack())).Errorf("panic: %v", recovered)
```

### Step 7: 清理 access_log.go

**`internal/middleware/access_log.go`** — 删除 `AccessLog()` 函数。保留 `ReportError()`、`getReportedError()`、`extractResponseError()`（Recover 和 handler 仍在使用）。

### Step 8: 迁移服务端所有 log.Printf

| 文件 | 数量 |
|------|------|
| `cmd/anycap-server/main.go` | 4 |
| `internal/app/bootstrap.go` | ~20 |
| `internal/config/dconf.go` | 4 |
| `internal/config/feature_provider.go` | 2 |
| `internal/config/ratelimit_provider.go` | 5 |

替换模式：`log.Printf("foo: bar %s", x)` → `logging.WithField("key", x).Info("foo: bar")`

### Step 9: 更新测试

- **`internal/middleware/access_log_test.go`** — 重写为仅测试 `ReportError`/`extractResponseError`（`AccessLog()` 已删除）
- **`internal/infrastructure/nexushub/client_test.go`** — 将 `X-Request-Id` header 断言改为 `X-Trace-ID`
- **`internal/transport/http/router_test.go`** — 更新中间件配置和 header 断言

## 文件变更清单

| 文件 | 操作 |
|------|------|
| `internal/config/config.go` | 新增 LogLevel、LogFormat |
| `cmd/anycap-server/main.go` | 初始化 logging、trace、metrics |
| `internal/app/bootstrap.go` | 替换中间件栈，迁移 log.Printf |
| `internal/middleware/request_id.go` | **删除** |
| `internal/middleware/context.go` | 移除 request_id 相关函数 |
| `internal/middleware/recover.go` | 结构化 panic 日志 |
| `internal/middleware/access_log.go` | 删除 AccessLog()，保留 ReportError |
| `internal/middleware/access_log_test.go` | 重写 |
| `internal/middleware/feature_gate.go` | trace.GetTraceID |
| `internal/middleware/ratelimit.go` | trace.GetTraceID |
| `internal/middleware/auth.go` | trace.GetTraceID |
| `internal/transport/http/handlers/response.go` | 新增 context.Context 参数 |
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
| `internal/infrastructure/nexushub/client.go` | 删除手动 X-Request-Id |
| `internal/infrastructure/nexushub/platform_client.go` | 删除手动 X-Request-Id |
| `internal/infrastructure/agentplatform/client.go` | 删除手动 X-Request-ID |
| `internal/infrastructure/nexushub/client_test.go` | 更新 header 断言 |
| `internal/transport/http/router_test.go` | 更新中间件和断言 |
| `internal/config/dconf.go` | 迁移 logging |
| `internal/config/feature_provider.go` | 迁移 logging |
| `internal/config/ratelimit_provider.go` | 迁移 logging |

## 验证

1. `go build ./cmd/anycap-server/` — 编译通过
2. `go test ./internal/...` — 全部测试通过
3. `make dev` → `curl -v http://127.0.0.1:18080/ping` — 验证：
   - 响应包含 `X-Trace-ID` header（UUID v4 格式）
   - 无 `X-Request-Id` header
   - stdout 输出结构化 JSON 访问日志
   - 响应信封 `id` 字段为 UUID
