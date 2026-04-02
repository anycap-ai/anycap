# ga4

Google Analytics 4 Measurement Protocol client.

```go
import "gitlab.knoffice.tech/open/common-go/ga4"
```

## Create Client

```go
client, err := ga4.NewClient("G-XXXXXXXX", "api_secret",
	ga4.WithHTTPTimeout(10*time.Second),
	ga4.WithDefaultProperties(map[string]any{
		"source": "payment-api",
	}),
)
if err != nil {
	log.Fatal(err)
}
defer client.Close(ctx)
```

## Track Events

```go
// Async tracking (non-blocking, logs errors)
err := client.Track(
	"client-id-123",    // clientID (required)
	"user-456",         // userID (optional, empty string to skip)
	"purchase",         // event name
	map[string]any{     // properties
		"value":    99.9,
		"currency": "USD",
	},
)

// Sync tracking (blocks until complete)
err := client.TrackSync(ctx,
	"client-id-123",
	"user-456",
	"purchase",
	map[string]any{"value": 99.9},
)
```

## Auto-Filled Fields

| Field | Description |
|-------|-------------|
| `env` | From `ENV` environment variable |

Non-production environments auto-prefix clientID/userID (e.g., `dev-user123`).

## Options

| Option | Default | Description |
|--------|---------|-------------|
| `WithHTTPTimeout(d)` | 5s | HTTP request timeout |
| `WithLogger(l)` | default | Custom logger |
| `WithDefaultProperties(m)` | nil | Properties added to all events |

## Errors

```go
ga4.ErrEmptyMeasurementID  // measurement_id required
ga4.ErrEmptyAPISecret      // api_secret required
ga4.ErrEmptyClientID       // client_id required
ga4.ErrEmptyEventName      // event name required
```
