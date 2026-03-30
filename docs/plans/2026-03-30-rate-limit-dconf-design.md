# Rate Limit DConf Integration Design

## 1. Background

AnyCap has already completed the first phase of capability-aware rate limiting:

- only protected function routes participate in capability rate limiting
- the bucket is `principal.UserID + capability`
- route capability names are declared explicitly
- RPM is currently resolved from static server configuration:
  - `ANYCAP_RATE_LIMIT_RPM`
  - `ANYCAP_RATE_LIMIT_<CAPABILITY>_RPM`

This works, but it still requires configuration to be delivered through environment variables and process restarts. That is acceptable for static defaults, but it is not ideal when operators want to adjust rate limits dynamically by environment or capability without restarting the service.

The internal dynamic configuration platform already exists through `gitlab.knoffice.tech/open/common-go/dconf`, which wraps MSE/Nacos. Internal services already use it for hot-reloadable runtime configuration, including configuration-provider patterns and a rate-limit-like quota lookup.

Therefore, the next step is to replace only the **rate limit configuration source** with a dconf-backed provider, while keeping the rest of the capability rate limit behavior unchanged.

## 2. Goals

This design aims to:

1. keep the existing capability rate limit behavior unchanged
2. replace only the RPM configuration source with dconf
3. support runtime updates without requiring AnyCap restart
4. keep the current environment-variable configuration as fallback
5. minimize code changes by reusing the existing `CapabilityRateLimitResolver` boundary

## 3. Non-Goals

This design does not attempt to:

- change the rate limit bucket shape
- change route capability declarations
- change Redis / in-memory limiter implementations
- replace all server configuration with dconf
- introduce a new distributed rate limit algorithm
- remove the current environment-variable based rate limit config

## 4. Current State

Today, the runtime path is:

1. `cmd/anycap-server/main.go` loads static config via `config.Load()`
2. `app.NewServer(...)` receives `config.Config`
3. `bootstrap.go` wires `middleware.RateLimit(deps.rateLimiter, deps.config)`
4. `middleware.RateLimit(...)` calls `ResolveCapabilityRateLimitRPM(capability)` on every request

Important observation:

- the middleware already depends on an interface, not a concrete config type
- RPM resolution already happens per request

This means we do **not** need to redesign the middleware. We only need to replace the resolver implementation passed into it.

## 5. Core Idea

Introduce a dedicated rate-limit configuration provider backed by dconf.

Instead of passing `config.Config` directly into `middleware.RateLimit(...)`, bootstrap will pass a provider that implements the same resolver interface:

```go
type CapabilityRateLimitResolver interface {
    ResolveCapabilityRateLimitRPM(capability string) int
}
```

The provider will:

- optionally initialize a dconf-backed `*dconf.Container[RateLimitConfig]`
- read the latest current value from dconf at request time
- fall back to the existing static env-based config if dconf is disabled, unavailable, or invalid

This keeps the runtime call site stable while changing only the config source behind it.

## 6. Proposed Configuration Model

### 6.1 DConf JSON shape

Recommended dconf payload:

```json
{
  "default_rpm": 60,
  "capabilities": {
    "image.generate": 10,
    "video.generate": 5,
    "music.generate": 8,
    "image.read": 30,
    "video.read": 20,
    "audio.read": 20,
    "asset.upload.prepare": 60,
    "feedback.submit": 20,
    "drive.browse": 120,
    "page.publish": 12
  }
}
```

Recommended Go shape:

```go
type RateLimitConfig struct {
    DefaultRPM   int            `json:"default_rpm"`
    Capabilities map[string]int `json:"capabilities"`
}
```

Why not use `map[string]int` directly:

- a default RPM needs a first-class field
- the structure is easier to validate
- future extension is easier without breaking format

### 6.2 Environment variables controlling dconf usage

Keep the existing env rate limit variables, and add only a small dconf control surface:

```env
ANYCAP_RATE_LIMIT_DCONF_ENABLED=false
ANYCAP_RATE_LIMIT_DCONF_GROUP=anycap
ANYCAP_RATE_LIMIT_DCONF_DATA_ID=rate_limit
```

The base dconf/Nacos connection still uses the shared `dconf` runtime environment:

- `DCONF_NACOS_HOST`
- `DCONF_NACOS_PORT`
- `DCONF_NACOS_NAMESPACE`
- optional `ENV`

## 7. Resolution Rules

For a given capability, the effective RPM should be resolved in this order:

1. if dconf is disabled, skip directly to env fallback
2. if dconf is enabled and a valid capability-specific override exists, use it
3. otherwise, if dconf is enabled and a valid `default_rpm` exists, use it
4. otherwise, fall back to existing env/static config:
   - `ANYCAP_RATE_LIMIT_<CAPABILITY>_RPM`
   - `ANYCAP_RATE_LIMIT_RPM`
5. if the final RPM is `<= 0`, skip capability rate limiting for that capability

“Valid” here means:

- capability key is non-empty
- rpm is a positive integer

Invalid dconf values must not break request handling. They should be ignored and fall back.

## 8. Runtime Behavior

### 8.1 Dynamic update model

The provider should hold a `*dconf.Container[RateLimitConfig]` and call `Get()` on demand.

That means:

- no extra polling loop is needed in AnyCap
- no custom callback registry is needed
- rate limit changes become visible on later requests automatically

This is the same broad usage pattern already used by internal services with hot-reloadable config providers.

### 8.2 Failure handling

The provider must fail safe.

Recommended behavior:

- if dconf initialization fails and dconf is enabled, log a warning and continue with env fallback
- if `LoadJson` fails, log a warning and continue with env fallback
- if dconf payload is malformed, ignore invalid values and continue with env fallback

This keeps rate limiting available even when dconf is unavailable.

## 9. Code Shape

### 9.1 New provider

Add a small provider dedicated to rate limit configuration.

Recommended location:

- `internal/config/ratelimit_provider.go`

Suggested structure:

```go
type RateLimitProvider struct {
    fallback      Config
    dconfEnabled  bool
    dconfGroup    string
    dconfDataID   string
    container     *dconf.Container[RateLimitConfig]
}
```

Methods:

- `NewRateLimitProvider(cfg Config) *RateLimitProvider`
- `ResolveCapabilityRateLimitRPM(capability string) int`

Optional helper methods:

- `loadCurrentDConfConfig() *RateLimitConfig`
- `resolveFromDConf(capability string) (int, bool)`

### 9.2 Bootstrap wiring

Change bootstrap so the protected route group uses:

```go
middleware.RateLimit(deps.rateLimiter, deps.rateLimitResolver)
```

instead of:

```go
middleware.RateLimit(deps.rateLimiter, deps.config)
```

### 9.3 Server startup

`cmd/anycap-server/main.go` should initialize dconf once during startup when rate limit dconf is enabled.

Recommended behavior:

- if `ANYCAP_RATE_LIMIT_DCONF_ENABLED=false`, do nothing
- if enabled, call `dconf.Init(...)`
- `defer dconf.Stop()`

Because this integration is intentionally scoped to rate limit only, dconf startup should remain small and isolated.

## 10. Why This Is A Good Fit

This design is a good fit for the current codebase because:

1. the rate limit middleware already uses an abstraction boundary
2. the RPM is already resolved per request, so hot config fits naturally
3. env fallback already exists and can remain the safe baseline
4. the change is localized to startup, bootstrap, config/provider logic, and tests

## 11. Risks And Trade-Offs

### 11.1 Risk: silent misconfiguration

If dconf payloads are malformed or use invalid capability names, the system may silently fall back to env defaults.

Mitigation:

- log explicit warnings when dconf cannot be parsed
- log when invalid capability RPM values are ignored

### 11.2 Risk: runtime dependency on dconf

If dconf is enabled, startup depends on external dynamic config initialization.

Mitigation:

- keep the feature gated with `ANYCAP_RATE_LIMIT_DCONF_ENABLED`
- retain env fallback
- prefer warning-and-fallback over fail-fast

### 11.3 Trade-off: dual configuration sources

For some time, the system will support both dconf and env-based rate limit config.

This is intentional:

- it allows safe migration
- it supports local/test environments without dconf
- it reduces rollout risk

## 12. Recommended Rollout

1. merge code with dconf integration behind `ANYCAP_RATE_LIMIT_DCONF_ENABLED=false`
2. deploy to dev with the flag still disabled
3. configure dconf payload in dev
4. enable the dconf flag in dev only
5. verify that changing dconf payload affects subsequent requests without restart
6. repeat for production

## 13. Summary

The recommended change is not to replace AnyCap’s full config system, but only to replace the **rate limit resolver** with a dconf-backed provider.

This preserves:

- existing capability rate limit semantics
- existing middleware interface
- existing env fallback

while adding:

- dynamic runtime updates through dconf / MSE
- safer operational control over capability-specific rate limits
