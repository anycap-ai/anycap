# hertz middleware

Hertz HTTP framework middleware for observability.

```go
import "gitlab.knoffice.tech/open/common-go/hertz/middleware"
```

## Setup

```go
h := server.Default()

// Recommended order
h.Use(
	middleware.RecoverMiddleware(),              // Panic recovery (first)
	middleware.TraceMiddleware(),                // Trace ID injection
	middleware.AccessMiddleware("/health"),      // Access logging (skip health)
	middleware.MetricsMiddleware(),              // Request metrics
)
```

## TraceMiddleware

Extracts or generates trace ID and propagates through context.

```go
h.Use(middleware.TraceMiddleware())
```

Behavior:
- Reads `X-Trace-ID` from request header
- Generates new UUID if not present
- Injects into context via `trace.SetTraceID()`
- Sets `X-Trace-ID` in response header

## AccessMiddleware

Logs HTTP requests with timing.

```go
// Skip specific paths (e.g., health checks)
h.Use(middleware.AccessMiddleware("/health", "/metrics"))
```

Logged fields (request):
- `method`, `path`, `client_ip`, `query_string`, `request_body`

Logged fields (response):
- `status_code`, `latency_ms`, `response_body`

## MetricsMiddleware

Records Prometheus metrics for requests.

```go
h.Use(middleware.MetricsMiddleware())
```

Metrics recorded:
- `http_request_total` (Counter) - labels: method, path, status_code, biz_id
- `http_request_duration_seconds` (Histogram) - labels: method, path, status_code, biz_id

## RecoverMiddleware

Catches panics and returns 500.

```go
h.Use(middleware.RecoverMiddleware())
```

Behavior:
- Logs panic with stack trace via `logging.WithContext()`
- Returns HTTP 500
- Aborts request chain
