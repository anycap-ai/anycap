# Feature Access DConf Design

Date: 2026-03-31

## 1. Background

AnyCap already has server-side feature flags and CLI preflight support:

- server derives feature availability from infrastructure readiness in `buildServerFeatures()`
- server allows env overrides via `ANYCAP_FEATURE_*`
- server exposes `GET /v1/features`
- protected routes are blocked by `middleware.FeatureGate(...)`
- CLI fetches `/v1/features` before building the command tree

This works for coarse server-level enablement, but it cannot express:

1. dynamic feature changes without restart
2. user-specific rollout rules
3. internal-user access to more capabilities than external users

The repository already uses dconf for hot-reloadable rate limit configuration. The same runtime pattern is a good fit for feature access policy.

## 2. Goals

This design aims to:

1. move feature access policy to dconf
2. support both global feature switches and user-level rollout rules
3. let operators define reusable access groups by email
4. keep the existing `ANYCAP_FEATURE_*` env behavior as fallback during migration
5. make server enforcement authoritative
6. optionally let CLI consume user-specific feature visibility later

## 3. Non-Goals

This design does not attempt to:

- redesign capability route registration
- remove the current feature flag env fallback immediately
- add support for complex rule languages, percentages, or experiments in v1
- use `name` as an access-control identity field
- introduce a database-backed entitlement system

## 4. Current State

Today the effective path is:

1. `internal/app/bootstrap.go` builds a global `map[string]bool`
2. `internal/middleware/feature_gate.go` blocks routes by feature name using that global map
3. `internal/application/system/service.go` exposes the same global map via `/v1/features` and `status`
4. `cmd/anycap/main.go` fetches `/v1/features` and applies the result to local CLI feature flags

Important limitations:

- feature state is global per server, not per user
- env-based changes require restart
- CLI only sees global server support, not the current user's allowed features

## 5. Core Idea

Introduce a dconf-backed feature access provider that resolves both:

1. whether a feature is globally enabled
2. whether the current authenticated user is allowed to use it

The provider should:

- load a `FeatureConfig` payload from dconf
- normalize and evaluate access groups defined by email
- fall back to current server defaults plus `ANYCAP_FEATURE_*` overrides when dconf is absent or invalid
- expose both global and per-user feature views

This changes feature access from a static global map into a request-aware policy resolver.

## 6. Proposed Configuration Model

### 6.1 DConf JSON shape

Recommended payload:

```json
{
  "feature_access_groups": {
    "internal": {
      "emails": [
        "alice@gmail.com",
        "bob@gmail.com"
      ]
    },
    "beta_users": {
      "emails": [
        "partner1@gmail.com"
      ]
    }
  },
  "features": {
    "image.generate": {
      "enabled": true,
      "rollout": "all"
    },
    "video.generate": {
      "enabled": true,
      "rollout": "groups",
      "feature_access_groups": ["internal"]
    },
    "music.generate": {
      "enabled": true,
      "rollout": "groups",
      "feature_access_groups": ["internal", "beta_users"]
    },
    "page": {
      "enabled": false,
      "rollout": "all"
    }
  }
}
```

Recommended Go shape:

```go
type FeatureConfig struct {
    FeatureAccessGroups map[string]FeatureAccessGroup `json:"feature_access_groups"`
    Features            map[string]FeatureRule        `json:"features"`
}

type FeatureAccessGroup struct {
    Emails []string `json:"emails"`
}

type FeatureRule struct {
    Enabled             bool     `json:"enabled"`
    Rollout             string   `json:"rollout"`
    FeatureAccessGroups []string `json:"feature_access_groups,omitempty"`
}
```

### 6.2 Naming

`feature_access_groups` is intentionally explicit:

- it is clearly about feature access, not generic user groups
- it makes feature-level references self-explanatory
- it leaves room for future unrelated grouping concepts elsewhere

### 6.3 Supported rollout values in v1

Only support these values in the first version:

- `all`
- `groups`

Why keep it small:

- `all` covers public rollout
- `groups` covers internal users and ad hoc allowlists
- special-case values such as `internal` become unnecessary when `feature_access_groups` is available

### 6.4 Group management

Operators may define any group name they need, for example:

- `internal`
- `beta_users`
- `music_preview`

Recommended constraints:

- lowercase letters, digits, `_`, `-`
- unknown group references should be ignored with a warning log
- duplicate or malformed emails should be normalized and deduplicated in memory

## 7. Identity and Matching Rules

V1 access checks should use `principal.Email`.

Reasons:

- internal users currently cannot be reliably identified by domain
- `name` is not stable enough for access control
- `email` is readable and operationally manageable

Matching rules:

1. trim spaces
2. lowercase
3. compare against normalized configured emails

Recommended helper:

```go
func normalizeEmail(s string) string {
    return strings.ToLower(strings.TrimSpace(s))
}
```

`principal.Email == ""` should be treated as no group match.

## 8. Resolution Rules

For a given feature and principal, resolution should follow this order:

1. load the feature rule from dconf if available
2. if no valid dconf rule exists, fall back to the existing server feature defaults and env overrides
3. if the effective feature is globally disabled, reject as disabled
4. if `rollout == "all"`, allow
5. if `rollout == "groups"`, require the user's normalized email to match at least one referenced access group
6. otherwise reject

Recommended response semantics:

- `503 FEATURE_DISABLED` when the feature is globally off
- `403 FEATURE_NOT_ALLOWED` when the feature is globally on but the current user is not in an allowed group

## 9. Runtime Behavior

### 9.1 Dynamic updates

Feature access should use the same dconf container pattern already used for rate limits:

- keep a `*dconf.Container[FeatureConfig]`
- call `Get()` on request or when building current views
- later requests observe updated config automatically

### 9.2 Fallback behavior

The provider must fail safe:

- if feature dconf is disabled, use current behavior
- if dconf init fails, use current behavior
- if payload load fails, use current behavior
- if a specific feature rule is malformed, ignore it and fall back

This makes feature dconf migration low-risk.

## 10. API Semantics

### 10.1 Keep `GET /v1/features`

This endpoint should continue to mean:

- which features this server supports globally

It should not become user-specific.

### 10.2 Add `GET /v1/me/features`

New protected endpoint:

- returns the feature view for the current authenticated user

This endpoint should answer:

- which features the current user is actually allowed to use

This separation avoids ambiguity:

- `/v1/features` = server capability view
- `/v1/me/features` = user entitlement view

## 11. CLI Behavior

Server enforcement is the source of truth. CLI changes are secondary.

Recommended rollout:

1. first, implement server-side policy and enforcement
2. later, teach CLI to prefer `/v1/me/features` when authenticated
3. keep `/v1/features` as fallback for unauthenticated startup or older servers

This ensures correctness even before CLI catches up.

## 12. Code Shape

### 12.1 New provider

Recommended location:

- `internal/config/feature_provider.go`

Suggested surface:

```go
type FeatureProvider interface {
    GlobalFeatures() map[string]bool
    UserFeatures(principal *model.Principal) map[string]bool
    EnabledFor(principal *model.Principal, feature string) (allowed bool, globallyEnabled bool)
}
```

Implementation responsibilities:

- resolve dconf-backed feature rules
- normalize configured groups
- evaluate user email against referenced groups
- preserve fallback to existing feature defaults

### 12.2 Middleware change

`internal/middleware/feature_gate.go` should stop depending on a plain `map[string]bool`.

Instead it should:

1. resolve the requested feature from the path
2. read `principal` from request context
3. call `EnabledFor(principal, feature)`
4. return `503` or `403` as appropriate

### 12.3 System service change

`internal/application/system/service.go` should stop treating features as only a stored global map.

It should expose:

- global feature view for `/v1/features` and status
- user-specific feature view for `/v1/me/features`

## 13. Migration Plan

Recommended migration order:

1. add feature dconf config loading behind new env toggles
2. keep existing `ANYCAP_FEATURE_*` fallback untouched
3. switch middleware to request-aware provider
4. add `/v1/me/features`
5. update CLI later

This allows gradual rollout without breaking current deployments.

## 14. Open Questions

1. Should `/status` keep only global features, or also expose current user features in a separate field
2. Should missing `principal.Email` always mean deny for `groups`, or should some internal auth flows inject email earlier
3. Whether dconf should eventually support `user_ids` in addition to `emails`

## 15. Summary

This design upgrades AnyCap feature flags from static server-wide switches into dynamic access policy:

- dconf controls both global enablement and user rollout
- `feature_access_groups` keeps configuration readable and reusable
- access checks use normalized email, not `name`
- server remains authoritative
- existing env-based behavior remains the safety net during migration
