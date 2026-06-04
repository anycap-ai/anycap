# External ID Guidelines

## Purpose

Use this when a change accepts, returns, stores, or logs externally visible
resource IDs.

## Source of Truth

- Prefix constants: `pkg/externalid/externalid.go`
- Inbound resolver interface and Postgres implementation:
  `internal/transport/http/handlers/idresolver/`
- Outbound mapper interface and presenters:
  `internal/transport/http/presenter/`
- Handler usage examples:
  `internal/transport/http/handlers/drive/`,
  `internal/transport/http/handlers/page/`,
  `internal/transport/http/handlers/agentcontrol/`

## Core Rule

External clients must never observe internal auto-increment `int64` IDs.

External surfaces include HTTP JSON, URL path parameters, request bodies, CLI
stdout, web responses, WebSocket messages, and client-visible errors.

## Required Flow

Inbound:

```text
external string ID -> IDResolver -> internal int64
```

Outbound:

```text
internal int64 -> IDMapper -> external string ID -> presenter DTO
```

## Request Rules

- Path params for resources must be external IDs and resolved with
  `h.resolver.ResolveXxxID(ctx, raw)`.
- Body IDs must be parsed as strings. Use the helpers in
  `internal/transport/http/handlers/idresolver/codec.go`.
- Do not accept numeric JSON values for resource IDs. A client should send
  `"parent_id": "dn_..."`, not `"parent_id": 42`.
- Stub and tests may use passthrough resolvers, but production code must still
  go through the resolver interface.

## Response Rules

- Resource responses must use presenter DTOs when internal IDs are present.
- List endpoints must return DTO slices, not raw domain model slices.
- Delete/update responses must resolve any returned resource IDs through the
  mapper.
- Do not mutate a domain model to replace an internal ID with an external ID
  before serialization. Build a DTO instead.
- The presence or absence of `json` tags on a domain model is not a safety
  signal. If a model contains internal IDs or internal paths, do not directly
  expose it.

## Storage Path Rule

Never expose internal storage paths or object layout details. This includes:

- `ObjectKey`
- `AssetPrefix`
- R2/S3 object keys
- paths containing internal `space_id`, `site_id`, `version_id`, `node_id`, or
  similar implementation IDs

Expose only client-usable fields such as `upload_url`, `object_url`, public
share URLs, or externally mapped IDs.

## Adding an Externally Visible Resource

Checklist:

- Add or reuse a prefix in `pkg/externalid/externalid.go`.
- Add an `external_id` column through a new migration if the resource is stored
  in SQL.
- Generate external IDs at creation time.
- Add inbound resolve methods to `IDResolver` when clients can reference the
  resource.
- Add outbound resolve methods to `presenter.IDMapper` when clients can observe
  the resource.
- Add presenter DTOs and presenter functions.
- Add tests covering mapping and missing mappings.

Do not add nil mapper/resolver fallbacks. Every runtime mode should inject a
concrete implementation.
