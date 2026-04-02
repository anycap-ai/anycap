# kitex middleware

Kitex RPC framework middleware for observability.

```go
import "gitlab.knoffice.tech/open/common-go/kitex/middleware"
```

## Server Middleware

```go
svr := xxxservice.NewServer(handler,
	server.WithMiddleware(middleware.TraceServerMiddleware()),
	server.WithMiddleware(middleware.AccessMiddleware("Health")),
)
```

## Client Middleware

```go
cli, err := xxxservice.NewClient("service-name",
	client.WithMiddleware(middleware.TraceClientMiddleware()),
)
```

## TraceServerMiddleware

Extracts trace ID from Kitex metainfo and injects into context.

```go
server.WithMiddleware(middleware.TraceServerMiddleware())
```

Behavior:
- Reads trace ID from `metainfo.GetPersistentValue(ctx, "trace_id")`
- Generates new UUID if not present
- Injects via `trace.SetTraceID()`

## TraceClientMiddleware

Propagates trace ID to downstream services via Kitex metainfo.

```go
client.WithMiddleware(middleware.TraceClientMiddleware())
```

Behavior:
- Gets trace ID from context via `trace.GetTraceID()`
- Sets `metainfo.WithPersistentValue(ctx, "trace_id", traceID)`

## AccessMiddleware

Logs RPC requests with timing.

```go
// Skip specific methods (e.g., health checks)
server.WithMiddleware(middleware.AccessMiddleware("Health", "Ping"))
```

Logged fields (request):
- `rpc_package`, `rpc_service`, `rpc_method`
- `client_service`, `client_address`, `request`

Logged fields (response):
- `latency_ms`, `response`, `recv_size`, `send_size`, `error`
