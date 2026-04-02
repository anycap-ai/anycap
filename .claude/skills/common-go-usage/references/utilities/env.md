# env

Environment detection utilities.

```go
import "gitlab.knoffice.tech/open/common-go/env"
```

## Functions

```go
// Get current environment from ENV variable
env.GetEnv()  // "dev", "test", "prod", or ""

// Check if production
env.IsProd()  // true if ENV == "prod"
```

## Environment Values

| Value | Description |
|-------|-------------|
| `dev` | Development |
| `test` | Testing/Staging |
| `prod` | Production |
