# trace

Distributed tracing with automatic trace ID propagation.

```go
import "gitlab.knoffice.tech/open/common-go/trace"
```

## Setup

```go
// Wraps http.DefaultTransport to auto-inject trace IDs
trace.Setup()
```

## Trace ID Management

```go
// Generate new trace ID
traceID := trace.NewTraceID()  // UUID v4

// Set trace ID in context (also injects into logging)
ctx = trace.SetTraceID(ctx, traceID)

// Get trace ID from context (generates new if not present)
traceID := trace.GetTraceID(ctx)
```

## HTTP Propagation

After `trace.Setup()`, all HTTP requests via `http.DefaultClient` automatically:
- Extract trace ID from request context
- Set `X-Trace-ID` header

```go
// Trace ID flows automatically
req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)
http.DefaultClient.Do(req)  // X-Trace-ID header added
```

## Integration with Logging

`trace.SetTraceID` automatically injects the trace ID into the logging context:

```go
ctx = trace.SetTraceID(ctx, "abc-123")
logging.WithContext(ctx).Info("Request")
// Output includes: trace_id=abc-123
```
