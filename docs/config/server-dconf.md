# Server DConf Config

## Overview

AnyCap server currently supports two dconf-backed runtime config surfaces:

- feature access policy
- capability rate limit policy

Both use the shared `gitlab.knoffice.tech/open/common-go/dconf` client and both fall back safely to existing env/static behavior when dconf is disabled, unavailable, or invalid.

## Shared DConf Runtime Env

The dconf client itself relies on the standard environment variables provided by `common-go/dconf`, typically:

```env
DCONF_NACOS_HOST=<mse-nacos-host>
DCONF_NACOS_PORT=8848
DCONF_NACOS_NAMESPACE=<mse-namespace>
DCONF_NACOS_CONTEXT_PATH=/nacos
DCONF_NACOS_TIMEOUT_MS=5000
```

Feature access and rate limit each have their own enable switch, group, and data id.

## Feature Access DConf

### Env Controls

```env
ANYCAP_FEATURE_DCONF_ENABLED=false
ANYCAP_FEATURE_DCONF_GROUP=anycap
ANYCAP_FEATURE_DCONF_DATA_ID=feature_access
```

When `ANYCAP_FEATURE_DCONF_ENABLED=true`, AnyCap attempts to load feature access policy from:

- `group = ANYCAP_FEATURE_DCONF_GROUP`
- `dataId = ANYCAP_FEATURE_DCONF_DATA_ID`

If loading fails, AnyCap falls back to:

1. server default feature availability derived from infrastructure readiness
2. explicit `ANYCAP_FEATURE_*` env overrides

### JSON Shape

Reference file:

- [`configs/server/dconf/feature_access.example.json`](/Users/sczhao/dev/Projects/converge-ai/ai-infra/anycap/configs/server/dconf/feature_access.example.json)

Example:

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

### Rules

- `enabled=false` means the feature is globally disabled
- `rollout=all` means all users may access the feature
- `rollout=groups` means the current user's normalized `principal.Email` must match at least one referenced `feature_access_groups` entry
- supported rollout values in v1:
  - `all`
  - `groups`

### API Semantics

- `GET /v1/features` returns the global server feature view
- `GET /v1/me/features` returns the current user's effective feature view

CLI behavior:

- authenticated CLI preflight first tries `/v1/me/features`
- if that request fails, CLI falls back to `/v1/features`
- unauthenticated CLI uses `/v1/features`

## Rate Limit DConf

### Env Controls

```env
ANYCAP_RATE_LIMIT_DCONF_ENABLED=false
ANYCAP_RATE_LIMIT_DCONF_GROUP=anycap
ANYCAP_RATE_LIMIT_DCONF_DATA_ID=rate_limit
```

When `ANYCAP_RATE_LIMIT_DCONF_ENABLED=true`, AnyCap attempts to load rate limit policy from:

- `group = ANYCAP_RATE_LIMIT_DCONF_GROUP`
- `dataId = ANYCAP_RATE_LIMIT_DCONF_DATA_ID`

If loading fails, AnyCap falls back to:

1. `ANYCAP_RATE_LIMIT_<CAPABILITY>_RPM`
2. `ANYCAP_RATE_LIMIT_RPM`

### JSON Shape

Reference file:

- [`configs/server/dconf/rate_limit.example.json`](/Users/sczhao/dev/Projects/converge-ai/ai-infra/anycap/configs/server/dconf/rate_limit.example.json)

Example:

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

### Resolution Order

For a given capability:

1. if dconf is enabled and `capabilities[<capability>]` is valid, use it
2. otherwise if dconf is enabled and `default_rpm` is valid, use it
3. otherwise fall back to `ANYCAP_RATE_LIMIT_<CAPABILITY>_RPM`
4. otherwise fall back to `ANYCAP_RATE_LIMIT_RPM`
5. if the final RPM is `<= 0`, skip capability rate limiting for that capability

## Recommended Rollout Setup

A practical starting point:

- keep `ANYCAP_FEATURE_DCONF_ENABLED=false` until the `feature_access` payload is ready
- publish the dconf payload first using the example files as a base
- enable dconf in one environment
- verify:
  - `/v1/features`
  - `/v1/me/features`
  - CLI command visibility for an allowed user
  - CLI fallback behavior for an unallowed user
- keep existing `ANYCAP_FEATURE_*` and `ANYCAP_RATE_LIMIT_*` env values available as rollback safety
