# Drive Download/Preview & Page Preview v2

> Design for dashboard file download/preview and page version preview, aligned with the current edge architecture.

## Goals

- Drive files can be previewed from dashboard.
- Drive files can be downloaded directly from dashboard.
- Page published site keeps using the existing public host flow.
- Page unpublished versions can be previewed safely.
- All browser read traffic goes through the edge worker, not direct S3/R2 presigned GET.

## Non-Goals

- No preview history/audit UI.
- No bulk revoke/list management for preview sessions.
- No new preview database tables in Phase 1.
- No second preview renderer in dashboard web code.

## Current Architecture We Must Fit

### Existing durable edge projections

- Drive share entry: `drive:share:{token}`
- Drive file index: `drive:file:{file_id}`
- Drive directory index: `drive:dir:{dir_id}:meta`, `drive:dir:{dir_id}:children`
- Page published host: `page:host:{hostname}`

These are maintained by KV sync jobs and projectors. They are durable read models derived from DB state and are allowed to be eventually consistent.

### Existing worker constraints

- `drive.anycap.[dev|cloud]` is routed to `handleDrive()`
- `page-*.anycap.[dev|cloud]` is routed to `handlePage()`
- published page serving already works as `hostname -> page:host:{hostname} -> servePageAsset()`
- drive file preview UI already exists in `workers/edge/src/ui/file-preview.ts`

## Design Principles

1. Projection and session are different things.
2. Published/share/index state uses async KV projector.
3. Interactive preview/access grants use direct KV write with TTL.
4. Browser never receives raw object storage paths.
5. Preview rendering is centralized in edge, not duplicated in dashboard.
6. Reuse existing worker code paths whenever possible.
7. Bearer token generation is centralized and high-entropy (DRY).
8. Bearer token values are redacted in logs.

## Why Preview/Access Should Not Use Async KV Projector

Preview/access links are not durable projections. They are short-lived bearer grants.

Using async KV projector for them would add a full queueing chain:

`HTTP request -> DB job -> worker poll/claim -> projector -> KV write -> waiter poll`

That is appropriate for published host projection and drive index rebuild, but not for a user clicking Preview and expecting the new tab to open immediately.

For preview/access grants, the required semantics are:

- write once
- available immediately
- expires automatically
- no `edge_version` conflict resolution
- no rebuild requirement

So the right fit is direct KV write with TTL, not `kvsync_jobs`.

## Part 1 — Drive Dashboard Preview & Direct Download

### 1.1 Summary

Drive dashboard preview and download both go through the edge worker on `drive.anycap.[dev|cloud]`.

The server issues a short-lived edge access grant for a single file and returns two URLs:

- `preview_url` for edge-rendered preview
- `download_url` for direct dashboard download

The browser never receives a raw presigned R2/S3 GET URL.

### 1.2 API

**Endpoint:** `POST /v1/drive/nodes/:id/access-links`

**Response:**

```json
{
  "preview_url": "https://drive.anycap.cloud/o/drvacc_xxxxxxxxxxxxx",
  "download_url": "https://drive.anycap.cloud/o/drvacc_xxxxxxxxxxxxx/raw?download=1",
  "expires_at": "2026-03-31T13:00:00Z"
}
```

### 1.3 Service Flow

```text
CreateAccessLinks(ctx, userID, nodeID)
  -> GetOrCreatePersonalSpace(userID)
  -> nodeRepo.GetByID(nodeID)
  -> verify node belongs to user's space
  -> verify node.Kind == file
  -> verify node.StorageObjectID != nil
  -> storageObjectRepo.GetByID(*node.StorageObjectID)
  -> generate access token via shared TokenGenerator (prefix=drvacc_)
  -> resolve ttl from config (default 300s, clamped)
  -> write drive:access:{token} to edge KV with TTL
  -> return preview_url + download_url + expires_at
```

### 1.4 KV Record

**Key:** `drive:access:{token}`

```json
{
  "node_id": 42,
  "space_id": 1,
  "name": "small.txt",
  "object_key": "drive/spaces/1/nodes/42/uuid",
  "mime": "text/plain; charset=utf-8",
  "size": 12,
  "expires_at": "2026-03-31T13:00:00Z"
}
```

Notes:

- `object_key` stays inside edge KV only. It is never returned to browser.
- This is not an external API DTO, so internal IDs inside the record are acceptable.
- TTL defaults to 5 minutes.
- TTL is configurable via `ANYCAP_DRIVE_ACCESS_TTL_SECONDS` (default 300), with min/max clamp to avoid unsafe values.

### 1.5 Edge Routing

**Host:** `drive.anycap.[dev|cloud]`

**New routes:**

- `GET /o/:token`
- `GET /o/:token/raw`

Flow:

- `GET /o/:token`
  - read `drive:access:{token}`
  - reject if missing or expired
  - render preview wrapper using existing `renderFilePreviewPage()`
  - raw asset URL points to `/o/:token/raw`
  - response should set `Cache-Control: private, no-store`

- `GET /o/:token/raw`
  - read `drive:access:{token}`
  - reject if missing or expired
  - read R2 object by `object_key`
  - if `download=1`, force attachment disposition
  - otherwise use existing inline-vs-attachment logic
  - response should set `Cache-Control: private, no-store`

### 1.6 Dashboard Integration

Dashboard Drive page uses the new endpoint:

- click file name -> open `preview_url`
- click Download action -> open `download_url`

This satisfies the product requirement that dashboard can download directly, without first entering preview.

Frontend behavior can stay simple:

- preview uses `window.open(preview_url, "_blank")`
- direct download uses temporary `<a href={download_url} download>` or `window.open(download_url, "_blank")`

### 1.7 Why This Is Better Than `presign-download`

- no raw storage URL exposed to browser
- no internal storage path leak in response URL
- no CORS problems for text/markdown/html preview
- no duplicated MIME/render logic in web app
- reuses existing edge preview UI

## Part 2 — Page Version Preview

### 2.1 Summary

Published pages keep the current model:

- hostname like `page-foo.anycap.cloud`
- durable KV projection `page:host:{hostname}`
- async projector remains the correct mechanism

Unpublished preview uses a separate temporary hostname:

- `preview-page-<token>.anycap.[dev|cloud]`

Preview host records are written directly to KV with TTL and served by the same page edge flow.

### 2.2 Status Rule

Preview is allowed for:

- `verified`
- `published`

Preview is not allowed for:

- `draft`
- `uploaded`
- `archived`

Reason:

- `uploaded` is currently a transitional/backward-compat state.
- `verified` is the first stable state that means the version is ready to be served.

### 2.3 API

**Endpoint:** `POST /v1/pages/:id/versions/:vid/preview-host`

**Response:**

```json
{
  "preview_url": "https://preview-page-pprv_xxxxxxxxxxxxx.anycap.cloud/",
  "expires_at": "2026-03-31T13:00:00Z"
}
```

### 2.4 Service Flow

```text
CreatePreviewHost(ctx, userID, pageID, versionID)
  -> GetOrCreatePersonalSpace(userID)
  -> siteRepo.GetByID(pageID) and verify ownership
  -> versionRepo.GetByID(versionID) and verify belongs to page
  -> verify status in (verified, published)
  -> generate preview token via shared TokenGenerator (prefix=pprv_)
  -> resolve ttl from config (default 300s, clamped)
  -> build preview hostname: preview-page-{token}.anycap.[dev|cloud]
  -> write page:host:{preview-hostname} to edge KV with TTL
  -> return preview_url + expires_at
```

### 2.5 KV Record

**Key:** `page:host:{preview-hostname}`

Payload intentionally reuses the published host shape as much as possible:

```json
{
  "page_id": 42,
  "space_id": 1,
  "current_version_id": 100,
  "asset_prefix": "page/spaces/1/sites/42/versions/3",
  "spa_fallback": true,
  "show_badge": true,
  "access_mode": "public",
  "preview": true,
  "expires_at": "2026-03-31T13:00:00Z"
}
```

Notes:

- `password_hash` and `password_salt` are not needed for preview hosts.
- Preview host bypasses page password/private mode because the preview hostname itself is an unguessable bearer grant.
- `current_version_id` is still populated so existing `handlePage()` shape can be reused with minimal branching.
- TTL defaults to 5 minutes.
- TTL is configurable via `ANYCAP_PAGE_PREVIEW_TTL_SECONDS` (default 300), with min/max clamp to avoid unsafe values.

### 2.6 Edge Routing

Current worker only routes `page-` hosts to `handlePage()`.

To support preview hosts cleanly, extend worker config/routing to recognize both:

- `page-`
- `preview-page-`

Recommended config shape:

- `PAGE_HOST_PREFIX=page-`
- `PAGE_PREVIEW_HOST_PREFIX=preview-page-`

Worker entry routing becomes:

- `hostname.startsWith(pageHostPrefix)` -> `handlePage()`
- `hostname.startsWith(pagePreviewHostPrefix)` -> `handlePage()`

Cloudflare route configuration does not need a new hostname-specific rule if we keep the existing wildcard routes:

- `*.anycap.dev/*`
- `*.anycap.cloud/*`

The required change is in worker dispatch logic, not in DNS/route shape.

`handlePage()` then remains hostname-driven:

- read `page:host:{hostname}`
- reject if missing
- if `preview=true`, check `expires_at`
- serve assets using existing `servePageAsset()`
- preview responses should set `Cache-Control: private, no-store`

This keeps preview and published page serving on the same main code path.

### 2.7 Why Separate Preview Host Is Better Than Query Token

- all relative asset requests work
- SPA refresh and route navigation work
- no `_preview` query token propagation problem
- no query-string bearer token in browser history or logs
- cache key separation between public host and preview host is natural
- worker architecture stays hostname-first, consistent with current page design

### 2.8 Dashboard Integration

Pages list page:

- if `current_version_id` exists, show `Open` button to `page_url`

Page detail versions table:

- `published` version:
  - `Open` -> `page_url`
  - `Preview` may simply reuse `page_url`
- `verified` version:
  - `Preview` -> call `POST /preview-host`, open returned `preview_url`

## Part 3 — Architecture Boundary

### Durable projection remains unchanged

These still use async KV projector:

- `page:host:{published-hostname}`
- `drive:share:{token}`
- `drive:file:*`
- `drive:dir:*`

Because they are derived read models for durable product state.

### Ephemeral access/preview is separate

These use direct KV write with TTL:

- `drive:access:{token}`
- `page:host:{preview-hostname}`

Because they are short-lived interactive edge grants.

This is not a second architecture. It is a second data lifetime class.

## Part 4 — Minimal Infra Changes

### 4.1 Add a Domain Port for Ephemeral Edge Grants

Do not let application services depend directly on `internal/infrastructure/kvsync`.

Add a domain port (example name: `EdgeGrantStore`) with explicit TTL semantics:

```go
type EdgeGrantStore interface {
	PutJSON(ctx context.Context, key string, value []byte, ttlSeconds int64) error
}
```

Why:

- preserves inward dependency direction
- keeps ephemeral grant writes testable and replaceable
- avoids coupling application use-cases to projector-oriented infra package names

### 4.2 Infrastructure Implementation + Fail-Fast

Provide a Cloudflare KV implementation for `EdgeGrantStore` and wire it in bootstrap.

Behavior requirements:

- if grant write fails, API returns error (no dead link response)
- if grant store is unavailable, API returns `503` (fail-fast)
- no noop-success behavior for interactive preview/access endpoints

### 4.3 Shared Token Generator (DRY)

Add one shared token generator used by both drive access and page preview:

- high entropy (at least 128-bit, recommended 160-bit+)
- URL-safe output
- deterministic prefix support (`drvacc_`, `pprv_`)
- fixed-length token body

### 4.4 Worker Types

Add:

- `DriveAccessRecord`
- optional preview fields to `PageHostRecord`

Keep payloads small and purpose-specific.

## Part 5 — Security

- Browser never gets raw object storage URLs for dashboard preview/download.
- Drive dashboard access grants are owner-created and short-lived.
- Page preview hostname is unguessable and short-lived.
- Query-string bearer tokens are avoided.
- Internal object keys remain edge-internal only.
- Published page access rules remain unchanged.
- Preview host cache is isolated from public host cache by hostname.
- Token-bearing responses use `private, no-store`.
- Worker logs must redact token/preview-host sensitive values (no full bearer token in logs).
- Preview/access APIs fail fast on KV write failure; they do not return unusable URLs.

## Part 6 — Avoiding Overdesign

Phase 1 deliberately does **not** do the following:

- no preview DB table
- no revoke/list preview management API
- no new dashboard-side preview renderer
- no async projector jobs for preview/access grants
- no special page preview session cookie flow unless a later requirement forces it

This keeps the design simple:

- one durable projection mechanism
- one short-lived edge grant mechanism
- one page serving path
- one drive file preview path

## Part 7 — Implementation Order

1. Add shared token generator utility (high entropy + prefix support).
2. Add `EdgeGrantStore` domain port and Cloudflare KV implementation with TTL write.
3. Wire grant store in bootstrap with fail-fast behavior for interactive endpoints.
4. Add TTL config parsing (`ANYCAP_DRIVE_ACCESS_TTL_SECONDS`, `ANYCAP_PAGE_PREVIEW_TTL_SECONDS`) with clamp and default 300.
5. Add page preview-host server endpoint.
6. Add drive access-links server endpoint.
7. Extend edge config/routing to support `preview-page-` host prefix.
8. Extend worker page handler to accept preview host records with expiry.
9. Add drive edge routes `/o/:token` and `/o/:token/raw`.
10. Set `Cache-Control: private, no-store` on token-bearing routes and redact related logs.
11. Update dashboard Drive UI to use `preview_url` and direct `download_url`.
12. Update dashboard Pages UI to use `Open` and `Preview` correctly.

## Part 8 — Must-Have Acceptance Criteria

- A new access/preview URL is usable immediately after API returns.
- If KV grant write fails, API does not return URL and responds with failure (`503` when unavailable).
- Drive/page grant TTL defaults to 300 seconds and follows configured values within clamp range.
- Drive access token and page preview token are generated by the same shared utility.
- Worker/application logs do not contain full bearer token values.
- Token-bearing preview/raw responses return `Cache-Control: private, no-store`.
- No external API response contains raw storage object key or internal numeric IDs.

## Part 9 — Final Recommendation

Use the current edge architecture as the center of gravity:

- Drive preview/download goes through `drive.anycap.[dev|cloud]`
- Page preview goes through `preview-page-<token>.anycap.[dev|cloud]`
- durable published/share/index state stays on async projector
- short-lived preview/access state uses direct TTL KV writes

This is the best balance of elegance, security, readability, and extensibility for the current codebase.
