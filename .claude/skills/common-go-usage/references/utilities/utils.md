# utils

Common utility functions.

```go
import "gitlab.knoffice.tech/open/common-go/utils"
```

## Environment Variable Helpers

```go
// Get with type conversion and default
utils.GetEnvString("API_KEY", "default")      // string
utils.GetEnvInt("PORT", 8080)                 // int
utils.GetEnvBool("DEBUG", false)              // bool
utils.GetEnvFloat64("RATE_LIMIT", 1.5)        // float64
```

## JSON Conversion

```go
// Convert any value to JSON string (falls back to %v format)
utils.ToJSONOrValue(myStruct)          // {"field":"value"}
utils.ToIndentedJSONOrValue(myStruct)  // Pretty-printed JSON
```

## User ID Formatting

```go
// Add environment prefix for non-production
utils.FormatUserIDWithEnvPrefix("12345")
// prod/production: "12345"
// staging: "staging-12345"
// dev: "dev-12345"
```
