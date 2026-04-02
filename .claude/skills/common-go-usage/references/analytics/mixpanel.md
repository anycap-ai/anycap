# mixpanel

Mixpanel event tracking with async batching.

```go
import "gitlab.knoffice.tech/open/common-go/mixpanel"
```

## Create Client

```go
client, err := mixpanel.NewClient("project-token",
	mixpanel.WithRegion(mixpanel.RegionUS),     // or RegionEU
	mixpanel.WithBatchSize(100),
	mixpanel.WithFlushInterval(10*time.Second),
	mixpanel.WithBufferSize(2000),
	mixpanel.WithDefaultProperties(map[string]any{
		"app_version": "1.2.3",
	}),
)
if err != nil {
	log.Fatal(err)
}
defer client.Close(ctx)  // Flushes remaining events
```

## Track Events

```go
// Async tracking (batched, non-blocking)
err := client.Track(
	"user-123",         // distinctID (required)
	"purchase",         // event name
	map[string]any{     // properties
		"product_id": "sku-456",
		"amount":     99.9,
	},
)

// Sync tracking (immediate send)
err := client.TrackSync(ctx,
	"user-123",
	"payment_success",
	map[string]any{"order_id": "order-789"},
)
```

## User Profile Operations

```go
// Set profile properties
err := client.Set("user-123", map[string]any{
	"name":  "John",
	"email": "john@example.com",
})

// Set once (only if not already set)
err := client.SetOnce("user-123", map[string]any{
	"first_login": time.Now(),
})

// Increment numeric properties
err := client.Add("user-123", map[string]any{
	"login_count": 1,
})

// Append to list properties
err := client.Append("user-123", map[string]any{
	"tags": "premium",
})

// Union (append unique values)
err := client.Union("user-123", map[string]any{
	"interests": []string{"tech", "music"},
})

// Remove from list
err := client.Remove("user-123", map[string]any{
	"tags": "trial",
})

// Unset properties
err := client.Unset("user-123", []string{"temp_field"})
```

## Auto-Filled Fields

| Field | Description |
|-------|-------------|
| `token` | Project token |
| `distinct_id` | User ID (with env prefix for non-prod) |
| `time` | Unix timestamp |
| `$insert_id` | UUID for deduplication |
| `env` | From `ENV` environment variable |

## Options

| Option | Default | Description |
|--------|---------|-------------|
| `WithRegion(r)` | US | Data center (US or EU) |
| `WithBatchSize(n)` | 50 | Events per batch |
| `WithFlushInterval(d)` | 5s | Max time between flushes |
| `WithHTTPTimeout(d)` | 10s | HTTP request timeout |
| `WithBufferSize(n)` | 1000 | Max buffered events |
| `WithLogger(l)` | default | Custom logger |
| `WithDefaultProperties(m)` | nil | Properties added to all events |

## Errors

```go
mixpanel.ErrEmptyToken      // Token required
mixpanel.ErrEmptyDistinctID // distinct_id required
mixpanel.ErrEmptyEvent      // Event name required
mixpanel.ErrBufferFull      // Buffer at capacity
mixpanel.ErrClientClosed    // Client already closed
```
