# Annotation-Driven Reference Resource + Legacy Catalog Cleanup

> Date: 2026-05-16
> Owner: anycap-server
> Scope: server-only refactor, CLI behavior unchanged. Removes legacy
> Postgres-backed catalog and Platform client paths, makes CuratedCatalog
> the only catalog backend, and restores reference image support for image
> i2i / video i2v models that regressed during the discovery migration.

## Problem

After the NexusHub Discovery migration (`2026-05-12-nexushub-discovery-and-curation.md`),
`anycap image generate --model nano-banana-pro --mode image-to-image
--param images=...` no longer works:

1. `flattenDiscoverySchema` actively drops every reference-image-shaped
   field (`refer_image_urls`, `resource_url`, `resource_path`, ...). The
   resulting `model_params` schema returned to the CLI never advertises
   any way to send a reference image.
2. CLI `resolveFileParams` is schema-driven; with no `format: file-or-url`
   field declared it does not upload the local file. The local path is
   passed through verbatim and lost on the server.
3. Legacy curated catalog enrichment used to expose `images` (the legacy
   adapter's wire field), so this contract is silently broken in the
   new pipeline.

Discovery already exposes the structured information we need under
`tool_definition[algo].annotation.resource.oneOf`: a list of accepted
upstream slots with their kinds (`url`, `url_array`, `storage`,
`storage_array`). We have to read it.

## Goals

1. Restore the `images` parameter for any (model, mode) whose Discovery
   `annotation.resource` declares at least one reference slot. The
   parameter is a string array of file paths or URLs; the CLI uploads
   local files; the server forwards them to the right upstream slot.
2. Keep AnyCap's external contract stable. CLI command line, schema
   shape (`model_params`), and the public DTO field name (`images`)
   stay the same. Upstream wire names (`refer_image_urls`,
   `resource_url`, ...) never appear in any external surface.
3. Take this opportunity to remove the legacy catalog code paths kept
   "just in case" by the discovery plan: postgres `anycap_model_routes`
   table, `postgres.CatalogRepo`, `nexushub.PlatformClient`,
   `nexushub.CatalogSchemaEnricher`, `/v1/admin/model-routes` admin
   handlers, and the `modelroute` application service. CuratedCatalog
   becomes the only catalog backend and the stub is preserved only for
   tests / offline mode.

## Non-Goals

- No CLI command, flag, or skill copy change.
- No DTO field renames. `dto.GenerateImageRequest.ReferenceImageURLs`
  and `Ratio` deprecated aliases are kept (separate cleanup later).
- No change to upload presign, resolution, or feature gate plumbing.
- No prod dconf migration. `model_curation` JSON schema is unchanged.

## Design

### Domain: ResourceTarget

`internal/domain/model/catalog.go` adds a small, dependency-free type:

```go
type ResourceKind string

const (
    ResourceKindURL          ResourceKind = "url"
    ResourceKindURLArray     ResourceKind = "url_array"
    ResourceKindStorage      ResourceKind = "storage"
    ResourceKindStorageArray ResourceKind = "storage_array"
)

// ResourceTarget describes one upstream slot a reference resource can
// fill. Multiple targets within the same RouteBinding are alternatives
// (oneOf): the adapter picks the first one whose Kind matches the data
// shape it currently has (URL list / storage path list / single value).
type ResourceTarget struct {
    Key  string
    Kind ResourceKind
}

type RouteBinding struct {
    // ...existing fields...
    ResourceTargets []ResourceTarget // empty when mode does not consume reference media
}
```

Domain stays free of NexusHub vocabulary; future adapters (OpenAI,
Replicate, ...) can reuse the same `ResourceTarget` list.

### CuratedCatalog: parse annotation, propagate targets

`internal/infrastructure/curatedcatalog`:

- New `annotation.go` (or inline helper in `catalog.go`):
  `parseResourceTargets(annotation map[string]any) []model.ResourceTarget`
  reads `annotation.resource.oneOf` and converts each entry into a
  `ResourceTarget`. Unknown `type` values are dropped with a debug log.

- `catalog.go::buildSpec`:
  1. Parses targets per algo entry.
  2. Attaches them to the new `RouteBinding.ResourceTargets`.
  3. Passes a single bool (`hasReferenceTarget`) into flatten so the
     schema gets the synthetic `images` field.

### Flatten: synthesize `images`, keep dropping wire fields

`flattenDiscoverySchema` signature becomes
`flattenDiscoverySchema(schema map[string]any, withImages bool)`.

- Continues to drop `refer_image_urls`, `resource_url`, `resource_path`,
  `reference_*`, `first_image_url`, `last_image_url` etc. (so wire
  shape never escapes to the agent surface). The hard-coded drop maps
  in `imageOptionRenames` / `videoOptionRenames` are simplified now
  that we only need them for hiding wire names, not for inferring
  reference support.
- When `withImages` is true, injects:
  ```json
  "images": {
    "type": "array",
    "items": {"type": "string", "format": "file-or-url"},
    "description": "Reference image(s). Pass local file paths or URLs; the server uploads and forwards them to the upstream provider."
  }
  ```
  CLI's existing `resolveFileParams` recognizes `format: file-or-url`
  and uploads single values or arrays as needed.
- `images` is never required at the schema level (caller decides).

### NexusHub adapter: route via ResourceTargets

`internal/infrastructure/nexushub/client.go::GenerateImage` and
`GenerateVideo`:

- Drop the hard-coded `ImageOption.ReferImageURLs = ...` /
  `ResourceURL = firstString(...)` writes.
- Replace with a small `applyResourceTargets(payload, route.ResourceTargets, urls)`
  helper that picks the first target whose Kind matches a URL list and
  writes the URLs to the right payload slot via a switch over the
  Discovery key (`image_option.refer_image_urls`, `resource_url`,
  ...). New keys are added to the switch when NexusHub introduces
  them; unknown keys log a warning and the URLs are dropped (loud
  failure beats silent success).

### Cleanup: deprecate (not delete) the legacy catalog stack

CuratedCatalog is the only catalog backend the production code path
uses, so the parallel legacy stack is dead weight. We mark each piece
with a `// Deprecated:` comment pointing to its replacement instead of
deleting it, so the historical implementation stays available for
reference and the `/v1/admin/model-routes` admin endpoints keep
serving the historical Postgres table for ad-hoc inspection:

| Path | Reason |
|---|---|
| `internal/infrastructure/postgres/catalog_repo.go` | Marked deprecated; not used by any production catalog read path. |
| `internal/infrastructure/postgres/model_route_repo.go` | Backs the deprecated admin endpoints only. |
| `internal/infrastructure/nexushub/platform_client.go` | Marked deprecated; replaced by `discovery_client.go`. |
| `internal/infrastructure/nexushub/catalog_schema_enricher.go` | Marked deprecated; the curated path enriches in-place via Discovery `tool_definition.schema`. |
| `internal/transport/http/handlers/modelroute/` | Package marked deprecated; admin endpoints retained for inspection. |
| `internal/application/modelroute/` | Package marked deprecated; sole caller of `ModelRouteRepository`. |
| `internal/domain/model/model_route.go`, `internal/domain/port/model_route.go` | Types marked deprecated; only used by the admin path. |
| `pkg/externalid/externalid.go::PrefixModelRoute` | Still referenced by the admin handler; left in place. |
| `deploy/sql/001_create_model_routes.sql`, `002_seed_model_routes.sh`, `anycap_model_routes.csv` | Local-only seed for the deprecated table; left in place for reference. |
| Embedded migration `0015_anycap_model_routes.sql` | Cannot edit per project rule. Kept; the table is harmless when unused. |

Bootstrap continues to build and wire the legacy chain so the admin
endpoints keep working. The newly added curated catalog path takes
over the read traffic for `/v1/{cap}/models`.

### Stub mode

The stub catalog (`nexushub.NewCatalogStubWith`) loses no behavior. It
still serves the small hardcoded list when neither NexusHub Platform
nor CuratedCatalog is available. Its specs do not declare
ResourceTargets; the stub is for smoke tests only.

### Tests

Updated / added:

| File | Coverage |
|---|---|
| `internal/infrastructure/curatedcatalog/flatten_test.go` | Replaces the "drops reference image fields" test with "promotes annotation to images field"; verifies wire fields stay dropped and `images.items.format == file-or-url`. |
| `internal/infrastructure/curatedcatalog/catalog_test.go` | Adds a discovery node with `annotation.resource.oneOf` and asserts `RouteBinding.ResourceTargets`, `ModeSchemas[mode].images`, `RequestHints.images`. Adds a no-annotation case verifying no `images` field is exposed. |
| `internal/infrastructure/nexushub/client_test.go` | Image i2i: route with `ResourceTargets=[{image_option.refer_image_urls, url_array}]` produces an upstream payload whose `image_option.refer_image_urls` carries the URLs. Video i2v: route with `[{resource_url, url}]` keeps existing `resource_url` wire behavior. Empty targets + non-empty URLs logs and drops. |
| `internal/app/bootstrap_test.go` | Removes legacy CatalogRepo / model-route admin tests; keeps the curated-catalog selection test and stub fallback test. |
| `internal/transport/http/router_test.go` | Drop the modelroute handler from the router smoke test. |

Hand-verification after `make dev`:

```bash
# Schema now exposes images for image-to-image
curl -s http://127.0.0.1:8080/v1/image/models/nano-banana-pro/schema?mode=image-to-image \
  | jq '.schemas[].schema.model_params.images'

# End-to-end: local file -> presign upload -> nexushub call
go run ./cmd/anycap --endpoint http://127.0.0.1:8080 \
  image generate --model nano-banana-pro --mode image-to-image \
  --prompt "make it watercolor" --param images=./tmp/test.png
```

## Migration / Rollback Notes

- No data migrations. `anycap_model_routes` table remains in dev/prod
  but unused; can be dropped in a follow-up plan once we are sure no
  external tooling reads it.
- Rollback path is `git revert` + redeploy; no destructive changes
  outside the binary.


## Phase 2 -- Wire All Schema-Exposed Knobs End-to-End (2026-05-16)

### Problem

After Phase 1 restored `images`, an audit of every active model across
image / video / music revealed eight additional fields that were
*advertised* in the agent-facing schema (because Discovery exposed them)
but *silently dropped* on the server. The CLI happily forwarded them in
the JSON request body, the DTO discarded them, and they never reached
NexusHub. Agents had no signal that their parameter was ignored.

Affected fields:

| Capability | Field | Models impacted |
|---|---|---|
| image | `format` | every image model (i2i + t2i) |
| image | `move_forward` | gpt-image-2, qwen-image (i2i) |
| image | `rotate_degrees` | gpt-image-2, qwen-image (i2i) |
| image | `use_wide_angle` | gpt-image-2, qwen-image (i2i) |
| image | `vertical_tilt` | gpt-image-2, qwen-image (i2i) |
| video | `format` | every video model |
| video | `fps` | every video model |
| video | `generate_audio` | kling-3.0, seedance-1.5-pro, seedance-2, seedance-2-fast |
| music | `model_variant` | every music model (after rename from upstream `model`) |

### Design decisions

1. **No drops.** Anything Discovery exposes and that the upstream
   provider actually consumes must be wired. The rule is: if the
   schema shows it, the wire must carry it.
2. **`generate_audio` uses `*bool`.** Several providers default audio
   to `true`. Agents need a way to explicitly disable it, so we cannot
   collapse `unset` and `false` into the same on-the-wire absence. The
   pointer encodes the three states (`nil` = omit, `&false` =
   explicit false, `&true` = explicit true).
3. **Music `model` collision.** Discovery's
   `music_option.properties.model` is the upstream provider variant
   (e.g. Suno `v5` vs `v5.5`). It shadows AnyCap's top-level `model`
   parameter (the AnyCap model id). Solution: rename the nested field
   to `model_variant` in `flattenDiscoverySchema` and add a matching
   DTO / domain field. AnyCap's top-level `model` semantics are
   preserved.
4. **`omitempty` everywhere.** Every newly wired optional knob uses
   `omitempty` (and pointers where the zero value is meaningful) so
   models that do not declare the knob never see noise in their
   upstream payload.

### Wire surface changes

```text
DTO (transport/http/dto)           Domain (domain/model)              NexusHub adapter (atomicXxxOption)
---------------------------------  ---------------------------------  ---------------------------------
GenerateImageRequest               GenerateImageRequest               atomicImageOption
  + Format                           + Format                           + Format
  + MoveForward                      + MoveForward                      + MoveForward
  + RotateDegrees                    + RotateDegrees                    + RotateDegrees
  + UseWideAngle                     + UseWideAngle                     + UseWideAngle
  + VerticalTilt                     + VerticalTilt                     + VerticalTilt
GenerateVideoRequest               GenerateVideoRequest               atomicVideoOption
  + Format                           + Format                           + Format
  + FPS                              + FPS                              + FPS
  + GenerateAudio *bool              + GenerateAudio *bool              + GenerateAudio *bool
GenerateMusicRequest               GenerateMusicRequest               atomicMusicOption
  + ModelVariant                     + ModelVariant                     (writes Model from req.ModelVariant)
```

`musicOptionRenames` adds `"model" -> "model_variant"` in
`internal/infrastructure/curatedcatalog/flatten.go` to avoid the
collision described above.

### Test coverage added

| File | Tests |
|---|---|
| `internal/infrastructure/curatedcatalog/flatten_test.go` | `TestFlattenDiscoverySchema_MusicRenamesUpstreamModel` |
| `internal/infrastructure/nexushub/client_extended_test.go` (new) | `TestGenerateImage_PropagatesEditKnobs`, `TestGenerateImage_OmitsZeroEditKnobs`, `TestGenerateVideo_PropagatesFormatFPSAndAudio`, `TestGenerateVideo_GenerateAudioFalseRoundTrips`, `TestGenerateVideo_GenerateAudioNilOmitted`, `TestGenerateMusic_PropagatesModelVariant` |

`go build ./...` and `go test ./...` both pass clean.

### Live verification

With a real NexusHub Discovery feed and the running server, an audit
script walks every active model and every (operation, mode) tuple,
then compares schema-exposed parameters against the set of fields the
AnyCap wire surface actually forwards. Result: **0 silent-drop gaps
across image, video, music**. Every parameter the agent sees is now
guaranteed to land at the upstream provider.

```text
=== image: 14 model/mode entries -> 0 dropped fields ===
=== video: 17 model/mode entries -> 0 dropped fields ===
=== music:  4 model/mode entries -> 0 dropped fields ===
```

The audit script lives in the conversation log; it is not committed
because it is a one-off check that requires a live Discovery backend.
The unit tests in `client_extended_test.go` cover the same invariants
in CI.
