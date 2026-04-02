# resty

HTTP client with automatic trace ID propagation.

```go
import "gitlab.knoffice.tech/open/common-go/resty"
```

## Usage

```go
// Create client with trace injection
client := resty.New()

// Make request (X-Trace-ID auto-injected from context)
resp, err := client.R().
	SetContext(ctx).
	SetBody(map[string]string{"key": "value"}).
	Post("https://api.example.com/endpoint")
```

## Behavior

- Wraps `go-resty/resty/v2` client
- Automatically injects `X-Trace-ID` header from context
- Uses `trace.GetTraceID(ctx)` to extract trace ID

## Full Example

```go
ctx := trace.SetTraceID(context.Background(), "abc-123")

client := resty.New()
resp, err := client.R().
	SetContext(ctx).
	SetHeader("Content-Type", "application/json").
	SetBody(payload).
	SetResult(&response).
	Post(url)
// Request includes: X-Trace-ID: abc-123
```
