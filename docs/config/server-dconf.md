# Server DConf Config

## Overview

AnyCap server currently supports three dconf-backed runtime config surfaces:

- feature access policy
- capability rate limit policy
- model curation

All three use the shared `gitlab.knoffice.tech/open/common-go/dconf` client and
fall back safely to their existing local configuration when DConf is disabled,
unavailable, or invalid.

## Shared DConf Runtime Env

The dconf client itself relies on the standard environment variables provided by `common-go/dconf`, typically:

```env
DCONF_NACOS_HOST=<mse-nacos-host>
DCONF_NACOS_PORT=8848
DCONF_NACOS_NAMESPACE=<mse-namespace>
DCONF_NACOS_CONTEXT_PATH=/nacos
DCONF_NACOS_TIMEOUT_MS=5000
```

Each surface has its own enable switch, group, and data ID.

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

- [`configs/server/dconf/feature_access.example.json`](../../configs/server/dconf/feature_access.example.json)

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
    "audio.generate": {
      "enabled": true,
      "rollout": "groups",
      "feature_access_groups": ["internal", "beta_users"]
    },
    "image.read": {
      "enabled": true,
      "rollout": "all"
    },
    "video.read": {
      "enabled": true,
      "rollout": "all"
    },
    "audio.read": {
      "enabled": true,
      "rollout": "all"
    },
    "audio.models": {
      "enabled": true,
      "rollout": "all"
    },
    "drive": {
      "enabled": true,
      "rollout": "all"
    },
    "page": {
      "enabled": true,
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

- [`configs/server/dconf/rate_limit.example.json`](../../configs/server/dconf/rate_limit.example.json)

Example:

```json
{
  "default_rpm": 60,
  "capabilities": {
    "image.generate": 10,
    "video.generate": 5,
    "music.generate": 8,
    "audio.generate": 8,
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

## Model Curation DConf

### Env Controls

```env
ANYCAP_MODEL_CURATION_DCONF_ENABLED=false
ANYCAP_MODEL_CURATION_DCONF_GROUP=anycap
ANYCAP_MODEL_CURATION_DCONF_DATA_ID=model_curation
ANYCAP_MODEL_CURATION_FILE=
ANYCAP_NEXUSHUB_DISCOVERY_TTL=5m
```

When dconf is enabled, AnyCap loads the curated public model list from the
specified group/data id. If dconf load fails, AnyCap falls back to:

1. `ANYCAP_MODEL_CURATION_FILE` on disk (when set and valid JSON)
2. Embedded default JSON shipped with the binary, curated from the live
   NexusHub Discovery snapshot

The DConf and file forms are complete replacement snapshots; they are not
merged with the embedded default. When either override is active, copy the
current embedded curation as the base and include every model that should
remain public. In particular, an existing production DConf snapshot must add
`doubao-seed-audio-1-0` before `audio.generate` can resolve its catalog route.

The Catalog joins each curation entry with the live NexusHub Discovery
snapshot (`tool_definition[algo].schema`) to build the final model spec
returned by `/v1/{cap}/models` and `/v1/{cap}/models/:model/schema`. Schema
shape is flattened to the legacy `model_params` form so existing CLI agents
keep working.

### JSON Shape

```json
{
  "models": [
    {
      "model_id": "seedream-5",
      "capability": "image",
      "display_name": "Seedream 5",
      "model_description": "...",
      "operations": [
        {
          "operation": "generate",
          "mode": "text-to-image",
          "ability_key": "ark-doubao-seedream-5",
          "algo_type": "txt_2_img",
          "mode_description": "Generate images directly from text prompts."
        },
        {
          "operation": "edit",
          "mode": "image-to-image",
          "ability_key": "ark-doubao-seedream-5",
          "algo_type": "img_2_img",
          "mode_description": "Edit or transform images using prompts."
        }
      ]
    },
    {
      "model_id": "doubao-seed-audio-1-0",
      "capability": "audio",
      "display_name": "Doubao Seed Audio 1.0",
      "operations": [
        {
          "operation": "generate",
          "mode": "text-to-audio",
          "ability_key": "doubao-seed-audio-1-0",
          "algo_type": "txt_2_audio"
        },
        {
          "operation": "generate",
          "mode": "audio-to-audio",
          "ability_key": "doubao-seed-audio-1-0",
          "algo_type": "audio_2_audio"
        },
        {
          "operation": "generate",
          "mode": "image-to-audio",
          "ability_key": "doubao-seed-audio-1-0",
          "algo_type": "image_2_audio"
        }
      ]
    }
  ]
}
```

### Field reference

- `model_id`: stable public identifier surfaced to CLI users.
- `capability`: one of `image`, `video`, `music`, `audio`.
- `operations[]`: each entry binds a `(operation, mode)` to a NexusHub
  `ability_key + algo_type`. The `algo_type` MUST exist under the node's
  `tool_definition` in NexusHub Discovery; entries that do not match are
  skipped at startup with a one-shot WARN log.
- `mode_description`: optional override; falls back to the Discovery
  `algo_description.description` when empty.

### Discovery cache

A short in-memory cache fronts NexusHub Discovery so user-facing endpoints
stay cache-hit. TTL is set by `ANYCAP_NEXUSHUB_DISCOVERY_TTL` (default `5m`).
A background refresher warms every curated `(ability_key, algo_type)` every
`TTL/2`. On upstream errors within `2 * TTL` of the last successful fetch the
cache returns the previously cached value (stale-while-error) instead of
surfacing the failure.

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
