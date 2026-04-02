# logging

Structured logging with logrus, supporting context-based field injection.

```go
import "gitlab.knoffice.tech/open/common-go/logging"
```

## Initialization

```go
logging.Init(&logging.Config{
	Level:      "info",           // debug, info, warn, error
	Format:     "json",           // json or text
	Output:     "stdout",         // stdout, stderr, or file path (comma-separated)
	TimeFormat: "2006-01-02 15:04:05.000",
	Rotation: &logging.RotationConfig{
		MaxSizeMB:  100,
		MaxBackups: 20,
		MaxAgeDays: 30,
	},
})
```

## Basic Logging

```go
logger := logging.GetLogger()
logger.Info("Server started")
logger.Errorf("Failed to connect: %v", err)

// With fields
logging.WithField("user_id", 123).Info("User logged in")
logging.WithFields(logging.Fields{
	"method": "POST",
	"path":   "/api/users",
}).Info("Request received")

// With error
logging.WithError(err).Error("Operation failed")
```

## Context-Based Logging

```go
// Inject fields into context
ctx := logging.InjectLoggerField(ctx, "request_id", "abc-123")
ctx = logging.InjectLoggerFields(ctx, logging.Fields{
	"user_id": 456,
	"tenant":  "acme",
})

// Log with context (auto-extracts injected fields)
logging.WithContext(ctx).Info("Processing request")
// Output includes: request_id=abc-123, user_id=456, tenant=acme
```

## Extract Fields from Context

```go
// Extract all fields
fields := logging.ExtractLoggerFields(ctx)

// Extract single field
value, ok := logging.ExtractLoggerField(ctx, "user_id")

// Type-safe extraction
str, ok := logging.ExtractLoggerFieldString(ctx, "tenant")
str := logging.MustExtractLoggerFieldString(ctx, "tenant")
str := logging.MustExtractLoggerFieldStringWithDefault(ctx, "tenant", "default")

num, ok := logging.ExtractLoggerFieldInt(ctx, "user_id")
num := logging.MustExtractLoggerFieldInt(ctx, "user_id")
num := logging.MustExtractLoggerFieldIntWithDefault(ctx, "user_id", 0)

flt, ok := logging.ExtractLoggerFieldFloat(ctx, "score")
flt := logging.MustExtractLoggerFieldFloat(ctx, "score")
flt := logging.MustExtractLoggerFieldFloatWithDefault(ctx, "score", 0.0)
```

## Configuration

```go
logging.SetLevel(logrus.DebugLevel)
logging.SetOutput(os.Stderr)
```
