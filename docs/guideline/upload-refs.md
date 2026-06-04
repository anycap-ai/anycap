# Upload Reference Guidelines

## Purpose

Use this when a flow accepts local files, user-provided media URLs, reference
images/videos/audio, or any value that can be forwarded to an upstream provider.

## Source of Truth

- Upload ref parsing: `internal/application/capabilities/upload_ref.go`
- Upload ref resolver: `internal/application/capabilities/service_upload_resolver.go`
- Resolver port: `internal/domain/port/capabilities.go`
- Current resolver wiring: `internal/app/compose_media.go`
- Image/video resolver usage:
  `internal/application/image/service.go`,
  `internal/application/video/service.go`
- CLI local file upload helpers:
  `internal/cli/command/cap/upload.go`,
  `internal/cli/command/cap/param_resolve.go`

## Rule

Any service that forwards user-supplied references to an upstream provider must
resolve `anycap://upload/...` references before the upstream call.

Failure to resolve upload refs can send an internal AnyCap reference to a
provider that expects an HTTP URL or base64 payload.

## What Counts as a Reference

Review upload ref handling for:

- Reference images for image generation or editing.
- Reference images for video generation.
- User-provided URLs in read/analyze actions.
- Schema-driven CLI params that can contain file paths or uploaded URLs.
- Future media operations such as edit, upscale, inpaint, remix, audio/video
  transform, or provider-specific reference inputs.

## Implementation Rules

- Use the `UploadRefResolver` port rather than duplicating resolution logic.
- Resolve after request validation and before building the upstream provider
  request.
- Preserve non-AnyCap URLs as-is.
- Keep stub/local behavior explicit. Stub mode may return direct URLs or skip
  audit-backed resolution, but the application flow should still make the
  resolver decision deliberately.
- Add tests showing `anycap://upload/cu_...` is converted before provider
  invocation.

## CLI Interaction

The CLI may upload local files and receive `object_url` values that are
`anycap://upload/...` references. Server-side application services must still
handle these references; do not rely on the CLI to convert them to provider
URLs.
