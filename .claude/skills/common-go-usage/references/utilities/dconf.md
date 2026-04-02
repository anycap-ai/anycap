# dconf

Dynamic configuration using Nacos with environment-aware fallback.

```go
import "gitlab.knoffice.tech/open/common-go/dconf"
```

## Initialization

```go
// Uses environment variables:
// - DCONF_NACOS_HOST (required)
// - DCONF_NACOS_PORT (default: 8848)
// - DCONF_NACOS_NAMESPACE (required)
// - DCONF_NACOS_CONTEXT_PATH (default: /nacos)
// - DCONF_NACOS_TIMEOUT_MS (default: 5000)

err := dconf.Init(
	dconf.WithNamespace("namespace-id"),    // Override env var
	dconf.WithEnv("prod"),                  // Override ENV var
	dconf.WithFallbackDisabled(false),      // Enable fallback
)
if err != nil {
	log.Fatal(err)
}
defer dconf.Stop()
```

## Load Configuration

```go
// Load JSON config
type AppConfig struct {
	Debug    bool   `json:"debug"`
	MaxConns int    `json:"max_conns"`
}

container, err := dconf.LoadJson[AppConfig]("group", "app-config")
if err != nil {
	log.Fatal(err)
}

// Get current value (auto-updates on Nacos change)
config := container.Get()
fmt.Println(config.Debug, config.MaxConns)

// Load string config
strContainer, err := dconf.LoadString("group", "feature-flags")
value := strContainer.Get()
```

## Environment-Aware Keys

When `ENV` is set (e.g., "prod"), dconf looks up:
1. `prod:app-config` (environment-specific)
2. `app-config` (fallback, if enabled)

## Container API

```go
container.Get()            // Returns *T (current or fallback)
container.Set(item)        // Set primary value
container.SetFallback(item)// Set fallback value
```

## Options

| Option | Description |
|--------|-------------|
| `WithNamespace(ns)` | Nacos namespace ID |
| `WithEnv(env)` | Environment prefix for keys |
| `WithFallbackDisabled(b)` | Disable fallback lookup |
| `WithStore(s)` | Custom Store implementation |
