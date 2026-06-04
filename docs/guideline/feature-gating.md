# Feature Gating and Rate Limit Guidelines

## Purpose

Use this when adding or changing externally callable capability endpoints,
feature flags, dconf access rules, or per-capability rate limits.

## Source of Truth

- Feature constants and defaults used by shared code: `pkg/feature/feature.go`
- Server feature defaults and env overrides: `internal/app/bootstrap.go`
- Feature access provider: `internal/config/feature_provider.go`
- Feature gate middleware: `internal/middleware/feature_gate.go`
- Capability route registry helpers: `internal/middleware/capability.go`
- Rate limit provider: `internal/config/ratelimit_provider.go`
- Example dconf JSON: `configs/server/dconf/`
- Route registration sites: `internal/transport/http/handlers/**`

## Concepts

There are related but separate concerns:

- **Feature enabled**: whether the server globally enables a capability.
- **Feature allowed**: whether the authenticated user is allowed by rollout.
- **Route capability name**: the action name used by middleware, rate limits,
  logs, and usage accounting.
- **CLI visibility**: whether a command exists in the CLI. The server remains
  the enforcement point.

Do not assume one of these automatically handles the others.

## Server Feature Defaults

Server fallback feature values are built from infrastructure configuration in
`buildServerFeatures()` and can be overridden with
`ANYCAP_FEATURE_<NAME_WITH_UNDERSCORES>`.

Do not copy the feature table into docs. Add or change feature constants in
`pkg/feature/feature.go`, then wire server defaults in `internal/app/bootstrap.go`.

## Feature Gate Coverage

Before adding an endpoint, verify how feature gate will resolve its feature:

- Some capability operation paths are dynamically resolved by
  `feature_gate.go`.
- Some non-standard paths are covered by static prefix rules.
- Routes registered with `CapabilityGET`, `CapabilityPOST`, and related
  helpers are registered for capability lookup and rate-limit resolution, but
  route registration alone is not a substitute for checking feature-gate
  coverage.

If a new route family does not match existing dynamic/static feature gate
rules, update the feature gate deliberately and add tests.

## Route Capability Names

Every capability endpoint should have a stable capability name. Use route
helpers such as:

- `middleware.CapabilityGET`
- `middleware.CapabilityPOST`
- `middleware.CapabilityPATCH`
- `middleware.CapabilityDELETE`

The capability name should be specific enough for rate limits and access
control, for example `image.generate`, `drive.file.upload.prepare`,
`page.version.create`, or `web.search`.

## Adding or Changing a Capability Endpoint

Checklist:

- Pick the route capability name.
- Add a feature constant if this capability needs first-class feature access.
- Wire server fallback default in `buildServerFeatures()`.
- Ensure feature gate coverage exists.
- Add or update dconf `feature_access` rules when the feature is controlled by
  rollout.
- Add or update dconf `rate_limit` rules when default RPM is not appropriate.
- Register the route with capability helpers where applicable.
- Verify CLI behavior and skill docs if agent-facing.
- Add tests for enabled, disabled, and user-denied behavior when access logic
  changes.

## Rate Limits

Rate limits resolve by capability name. If no per-capability dconf value is
configured, the provider falls back to default RPM.

Use stable, lower-case capability names. Do not change existing names casually;
that changes rate-limit, usage, and rollout semantics.
