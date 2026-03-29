# External ID Transformation Plan

## Context

The real goal is:

- do not expose internal incremental IDs externally
- do not leak business scale through URLs, JSON payloads, CLI output, or opaque references
- keep the implementation maintainable instead of spreading ID conversion logic everywhere

We are **not** trying to:

- change every primary key type to string
- remove existing FK structure
- push public-ID conversion into service/domain logic

The chosen direction is:

- keep internal primary keys and foreign keys unchanged
- add `external_id` to externally exposed resources
- keep `users.id` as the internal incremental identity, and expose `users.external_id`
- keep conversion strictly at the boundary: inbound resolve, outbound presenter/DTO
- switch existing text public IDs that are currently time/sequence-derived to true random IDs

## Decisions

- Internal DB primary keys stay unchanged.
- Existing database foreign keys stay unchanged.
- Public resource IDs use `external_id` random strings.
- User is the only dual-identity core resource:
  - internal: `users.id`
  - external: `users.external_id`
- Non-user business resources keep internal numeric IDs and gain `external_id`.
- Existing text public IDs remain strings, but their generators become truly random.
- External ID conversion happens only at system boundaries.
- Since this is still a development-stage system, we cut over directly and do not keep numeric public ID compatibility.

## Target Rule

External surfaces must never expose internal incremental IDs.

This includes:

- JSON `id` / `*_id` fields
- URL path params
- request body reference fields
- CLI JSON output
- web API types/state
- opaque references such as `anycap://upload/<id>`
- auth/status payloads such as `login_session_id`, `api_key_id`, `user.id`

## Scope

### Add `external_id` Column

These entities currently use internal IDs that are exposed externally and therefore need `external_id`.

| Entity | Table | Prefix | Why |
|---|---|---|---|
| User | `users` | `u_` | `/v1/me`, dashboard summary, login user payloads, status user payload |
| Space | `spaces` | `sp_` | exposed as `space_id` on multiple resources |
| DriveNode | `drive_nodes` | `dn_` | paths, JSON `id`, `parent_id`, share view `node_id` |
| UploadSession | `upload_sessions` | `upl_` | drive/page upload request and response fields |
| PageSite | `page_sites` | `pg_` | page paths and JSON `id` |
| PageVersion | `page_versions` | `pv_` | version paths and JSON `id` |
| CapsUpload | `caps_uploads` | `cu_` | exposed via `anycap://upload/<id>` reference |
| ModelRoute | `anycap_model_routes` | `mr_` | admin API resource paths |

### Existing Text Public IDs That Must Become Random

These are already text IDs, but they are not random enough today.

| Surface | Storage | Prefix | Why |
|---|---|---|---|
| Login session ID | `login_sessions.id` | `lsn_` | external `login_session_id` |
| API key ID | `api_keys.id` | `akid_` | external `api_key_id` |
| Feedback ID | `feedback.id` | `fb_` | returned by `/v1/feedback` |

### Not In Scope

These can stay internal-only for now because they are not currently exposed as public resource IDs:

- `drive_share_links.id`
- `storage_objects.id`
- `caps_tasks.id`
- `caps_task_artifacts.id`
- `kv_sync_jobs.id`
- `auth_identities.id`

If any of them later becomes externally addressable, add `external_id` at that time.

## Boundary Rule

External ID conversion happens only at system boundaries.

- Inbound: transport layer resolves external IDs to internal IDs.
- Outbound: presenter/DTO layer serializes internal models into public external IDs.
- Domain models, repositories, and service logic continue using internal IDs only.

This avoids leaking `external_id` handling across the whole codebase.

## User Rule

User is the only dual-identity resource.

- internal: `users.id BIGINT`
- external: `users.external_id TEXT`

External user-facing fields must use `users.external_id`:

- `User.id`
- `LoginUser.id`
- `Principal.user_id`
- `Space.owner_user_id`
- `DriveNode.created_by`
- `PageVersion.created_by`
- `CapsUpload.created_by`

## Shared Generator Package

New package:

- `pkg/externalid/externalid.go`
- `pkg/externalid/externalid_test.go`

Provide:

- `Generate(prefix string) string`
- `GenerateWithLen(prefix string, length int) string`
- `ValidatePrefix(id, prefix string) error`

Requirements:

- use `crypto/rand`
- use `a-zA-Z0-9`
- default random length `16`
- no time-derived bits

## Database Changes

### New Columns

Add `external_id TEXT` to:

- `users`
- `spaces`
- `drive_nodes`
- `upload_sessions`
- `page_sites`
- `page_versions`
- `caps_uploads`
- `anycap_model_routes`

For each new column:

1. `ADD COLUMN IF NOT EXISTS external_id TEXT`
2. backfill with random prefixed IDs
3. `ALTER COLUMN external_id SET NOT NULL`
4. `CREATE UNIQUE INDEX ... (external_id)`

### Existing Text-ID Tables

Do not add a new column for these:

- `login_sessions.id`
- `api_keys.id`
- `feedback.id`

Instead:

- keep the same column
- switch generator logic to random prefixed IDs
- backfill existing rows only if we care about old dev data

### No PK/FK Type Migration

We explicitly do **not**:

- rename `id` columns
- replace numeric PKs with text PKs
- rewrite FK column types
- drop FK constraints

## Domain And DTO Changes

### Domain Models

Keep domain models internal.

- keep internal numeric IDs on business models
- do not add large numbers of `External*` companion fields to core domain structs
- do not make service logic depend on public ID format

Examples:

- `DriveNode.ID int64`
- `DriveNode.SpaceID int64`
- `DriveNode.ParentID *int64`
- `PageSite.ID int64`
- `PageVersion.ID int64`

Existing text-ID models still keep one ID field, but their generator changes:

- `LoginSession.ID`
- `APIKey.ID`
- `Feedback.ID`

### Public DTOs / Presenters

Use dedicated response DTOs or presenter structs for public serialization.

Example:

```go
type DriveNodeDTO struct {
	ID        string  `json:"id"`
	SpaceID   string  `json:"space_id"`
	ParentID  *string `json:"parent_id,omitempty"`
	CreatedBy string  `json:"created_by"`
	...
}
```

Recommended pattern:

- handler gets internal domain model from service
- presenter resolves related external IDs in batch
- presenter returns DTO for JSON/CLI/web output

Public DTO coverage should include:

- `User`
- `Space`
- `DriveNode`
- `PageSite`
- `PageVersion`
- `DriveFilePresignResult`
- `PageVersionPresignResult`
- `DriveShareView`
- `ModelRoute`

## Repository Changes

Keep internal primary key lookups for most existing code, and add external lookup methods for transport/presenter boundary use.

Examples:

- `GetByID(ctx, id int64)`
- `GetByExternalID(ctx, externalID string)`
- `GetByExternalIDs(ctx, ids []string)` where batch hydration helps

Add explicit small resolver-oriented repository methods where useful, for example:

- `ResolveIDByExternalID(ctx, externalID string) (int64, error)`
- `ResolveExternalIDByID(ctx, id int64) (string, error)`
- bulk variants for batch presentation

Users need both:

- internal lookup by numeric/internal user ID
- external lookup by `users.external_id`

Affected packages:

- `internal/domain/port/`
- `internal/infrastructure/postgres/`
- `internal/infrastructure/user/`
- `internal/infrastructure/loginsession/`
- `internal/infrastructure/auth/`

## Service Layer Changes

Service layer should keep working with internal IDs and internal domain models.

Key rule:

- service methods should not grow public-ID formatting concerns unless there is no better boundary location

Most external-ID work should sit in:

- transport input resolvers
- presenter/DTO assemblers

Service changes still needed:

- support lookup by external ID where handlers need resource resolution
- support fetching related records needed for presenter batch hydration
- keep worker/internal payloads numeric where they are internal-only

Special cases:

- `anycap://upload/<id>` becomes `anycap://upload/cu_xxx`
- upload reference parser resolves `caps_uploads.external_id`
- login flow returns random `login_session_id`
- auth flow returns random `api_key_id`
- feedback submit returns random `fb_...`

## HTTP Transport Changes

Handlers must stop accepting or returning numeric public IDs.

Inbound responsibility:

- parse public string ID
- validate prefix
- resolve to internal ID before calling service

Outbound responsibility:

- pass internal model to presenter/DTO layer
- never serialize internal IDs directly from domain structs

Examples:

- `/drive/nodes/:id` accepts `dn_*`
- `/pages/:id` accepts `pg_*`
- `/pages/:id/versions/:vid` accepts `pg_*` and `pv_*`
- `/admin/model-routes/:id` accepts `mr_*`

Request body changes:

- `parent_id`: numeric -> string
- `upload_session_id`: numeric -> string
- `file_id`: numeric -> string
- `version_id`: numeric -> string

Auth/status payload changes:

- `login_session_id`
- `api_key_id`
- `/v1/status` user payload
- `/v1/me`
- login callback/poll user payloads
- feedback response `id`

Affected handlers:

- `internal/transport/http/handlers/drive_handler.go`
- `internal/transport/http/handlers/page_handler.go`
- `internal/transport/http/handlers/model_route.go`
- `internal/transport/http/handlers/capabilities.go`
- `internal/transport/http/handlers/system.go`
- `internal/transport/http/handlers/login.go`
- `internal/transport/http/handlers/feedback.go`

## CLI Changes

Switch all public resource arguments and outputs to external IDs.

Includes:

- drive commands in `internal/cli/command/infra/`
- page commands in `internal/cli/command/infra/`
- capabilities upload helper in `internal/cli/command/cap/upload.go`
- login flows that print `login_session_id`

CLI should never print internal numeric resource IDs in JSON mode.

## Web Changes

Update all externally visible ID types in:

- `web/src/lib/api/types.ts`
- `web/src/lib/api/hooks.ts`
- dashboard pages that use drive/page IDs

Change `number` to `string` for public resource IDs and request references.

## Implementation Checklist

### 1. Shared Generator

- add `pkg/externalid/externalid.go`
- add `pkg/externalid/externalid_test.go`
- define prefixes for `u_`, `sp_`, `dn_`, `upl_`, `pg_`, `pv_`, `cu_`, `mr_`, `lsn_`, `akid_`, `fb_`

### 2. Database Migration

- add one migration for `external_id` columns and backfill
- update rows in:
  - `users`
  - `spaces`
  - `drive_nodes`
  - `upload_sessions`
  - `page_sites`
  - `page_versions`
  - `caps_uploads`
  - `anycap_model_routes`
- decide whether to backfill existing dev rows in:
  - `login_sessions`
  - `api_keys`
  - `feedback`

### 3. Repository And Port Work

Add or update ports in:

- `internal/domain/port/drive.go`
- `internal/domain/port/page.go`
- `internal/domain/port/storage.go`
- `internal/domain/port/space.go`
- `internal/domain/port/model_route.go`
- user-related ports used by:
  - `internal/infrastructure/user/`
  - `internal/infrastructure/auth/`
  - `internal/infrastructure/loginsession/`

Add repository support in:

- `internal/infrastructure/postgres/drive_node_repo.go`
- `internal/infrastructure/postgres/page_site_repo.go`
- `internal/infrastructure/postgres/page_version_repo.go`
- `internal/infrastructure/postgres/upload_session_repo.go`
- `internal/infrastructure/postgres/space_repo.go`
- `internal/infrastructure/postgres/caps_upload_repo.go`
- `internal/infrastructure/postgres/model_route_repo.go`
- `internal/infrastructure/user/provisioner.go`
- `internal/infrastructure/loginsession/repo.go`
- `internal/infrastructure/apikey/api_key_repo.go`

Expected methods:

- `GetByExternalID(...)`
- `ResolveIDByExternalID(...)`
- `ResolveExternalIDByID(...)`
- bulk resolve helpers where response presentation needs batching

### 4. Generator Switches For Existing Text IDs

Update generators in:

- `internal/application/login/service.go`
- `internal/infrastructure/auth/apikey_service.go`
- `internal/infrastructure/apikey/memory_service.go`
- `internal/application/feedback/service.go`

Goal:

- stop using time-derived or sequence-derived values
- emit random prefixed IDs only

### 5. Inbound Resolver Layer

Create small resolver helpers used by handlers, for example:

- resolve drive node external ID -> internal node ID
- resolve page site external ID -> internal site ID
- resolve page version external ID -> internal version ID
- resolve upload session external ID -> internal session ID
- resolve model route external ID -> internal route ID
- resolve user external ID -> internal user ID where needed

Likely location:

- `internal/transport/http/handlers/` shared helper file
- or a small dedicated boundary package if reuse grows

### 6. Presenter / DTO Layer

Add public DTOs and assemblers for:

- user
- drive node
- drive node list
- drive file presign result
- drive share view
- page site
- page site list
- page version
- page version list
- page version presign result
- model route
- status user payload
- login callback/poll user payload

Recommended location:

- `internal/transport/http/dto/` for HTTP DTOs
- small presenter helpers near handlers or in a dedicated presenter package

Presenter responsibilities:

- map resource `id` to `external_id`
- map related IDs such as `space_id`, `parent_id`, `current_version_id`
- map user-linked fields such as `created_by`, `owner_user_id`
- batch-resolve where list endpoints would otherwise cause N+1 queries

### 7. Handler Updates

Update inbound parsing and outbound serialization in:

- `internal/transport/http/handlers/drive_handler.go`
- `internal/transport/http/handlers/page_handler.go`
- `internal/transport/http/handlers/model_route.go`
- `internal/transport/http/handlers/capabilities.go`
- `internal/transport/http/handlers/system.go`
- `internal/transport/http/handlers/login.go`
- `internal/transport/http/handlers/feedback.go`

Specific inbound fields to change:

- path `:id`
- path `:vid`
- query `parent_id`
- body `parent_id`
- body `upload_session_id`
- body `file_id`

Specific outbound payloads to review:

- `/v1/me`
- `/v1/status`
- `/v1/drive/*`
- `/v1/pages*`
- `/v1/admin/model-routes*`
- login init/poll/exchange responses
- feedback submit response
- capabilities presign response

### 8. Upload Reference Work

Update:

- `internal/application/capabilities/upload_ref.go`
- `internal/application/capabilities/service_presign.go`
- `internal/application/capabilities/service_resolver.go`
- `internal/cli/command/cap/upload.go`

Goal:

- `anycap://upload/<caps_upload.external_id>`
- no numeric upload reference visible externally

### 9. CLI Changes

Update summary structs and argument parsing in:

- `internal/cli/command/infra/common.go`
- all drive commands under `internal/cli/command/infra/drive_*.go`
- all page commands under `internal/cli/command/infra/page_*.go`
- `internal/cli/command/cap/upload.go`
- login-related CLI output under:
  - `internal/cli/command/meta/login.go`
  - `internal/cli/auth/`

### 10. Web Changes

Update:

- `web/src/lib/api/types.ts`
- `web/src/lib/api/hooks.ts`
- dashboard pages using drive/page IDs

Focus on:

- `id`
- `space_id`
- `parent_id`
- `current_version_id`
- `upload_session_id`
- `file_id`
- `version_id`

### 11. Tests

Update or add tests for:

- external ID generator
- repository external ID lookup
- handler inbound resolution
- presenter outbound serialization
- `anycap://upload/...` parsing and formatting
- login/API key/feedback random ID generation
- CLI JSON output using external IDs
- web API type alignment

## API Contract Examples

```json
{
  "id": "dn_A1b2C3d4E5f6G7h8",
  "space_id": "sp_Z9y8X7w6V5u4T3s2",
  "parent_id": "dn_P1q2R3s4T5u6V7w8"
}
```

```json
{
  "upload_session_id": "upl_h8G7f6E5d4C3b2A1",
  "file_id": "dn_A1b2C3d4E5f6G7h8"
}
```

```json
{
  "object_url": "anycap://upload/cu_M4n5B6v7C8x9Z0a1"
}
```

```json
{
  "login_session_id": "lsn_J2k3L4m5N6p7Q8r9",
  "api_key_id": "akid_S1t2U3v4W5x6Y7z8",
  "user": {
    "id": "u_R4s5T6u7V8w9X0y1"
  }
}
```

## Cutover Strategy

Direct cutover only.

- add/backfill `external_id` columns
- deploy server changes
- deploy CLI changes
- deploy web changes
- update tests

After merge:

- numeric public IDs are invalid input
- numeric public IDs are unsupported output

## Verification

1. Verify every public JSON `id` / `*_id` field is a string.
2. Verify every public path param accepts only external IDs.
3. Verify `/v1/me`, `/v1/status`, login flows, feedback, drive, page, and model-route APIs never return internal numeric IDs.
4. Verify `anycap://upload/...` uses `caps_uploads.external_id`.
5. Verify CLI JSON output contains no internal numeric resource IDs.
6. Verify web drive/page flows work with string IDs.
7. Grep for leaked numeric public IDs before merge.
