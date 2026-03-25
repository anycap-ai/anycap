# Upload Security Hardening -- Deployment Checklist

Date: 2026-03-25

## Summary of Changes

This document covers the upload security hardening for the presign/upload flow.
All code changes should be deployed together.

### Code Changes

| File | Change |
|------|--------|
| `internal/domain/model/capabilities.go` | Added `ContentLength` to `PresignRequest`; explicit content-type allowlist (SVG excluded); filename sanitization; size limit validation (20MB image, 200MB video); sentinel errors |
| `internal/domain/model/capabilities_test.go` | Added `TestPresignRequest_Validate` covering size, content-type, filename edge cases |
| `internal/config/config.go` | Reduced default presign expiry 3600s -> 600s; added 3600s hard cap; added `S3_KEY_PREFIX` (default `user_upload`) |
| `internal/infrastructure/s3store/client.go` | Signs `ContentLength` into presigned PUT URL; uses configurable key prefix |
| `internal/infrastructure/s3store/stub.go` | Added `Delete()` method; updated paths |
| `internal/domain/port/capabilities.go` | Added `Delete()` to `ObjectStorage` interface |
| `internal/transport/http/handlers/capabilities.go` | Error classification uses `errors.Is` instead of string matching; added 413 for file-too-large |
| `internal/cli/command/cap/upload.go` | Sends `content_length` in presign request; uses redirect-blocking HTTP client |
| `deploy/r2-lifecycle.json` | R2 lifecycle rules for `user_upload/` prefix |

### Security Issues Addressed

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 1 | No upload size limit | Warning | Server validates content_length; R2 enforces exact size via signed ContentLength |
| 2 | Filename path traversal | Warning | Reject `/`, `\`, `..` in filename |
| 3 | SVG XSS via upload | Warning | Explicit content-type allowlist (SVG excluded) |
| 4 | CLI follows redirects on PUT | Warning | Custom HTTP client with `CheckRedirect` returning `ErrUseLastResponse` |
| 5 | Presigned URL TTL too long | Warning | Default reduced to 600s, hard cap at 3600s |
| 6 | No object cleanup | Warning | R2 lifecycle rule expires `user_upload/` after 7 days |

### Known Issues Not Addressed (Tracked Separately)

| # | Issue | Severity | Notes |
|---|-------|----------|-------|
| 1 | No authentication on presign endpoint | Critical | Auth middleware not yet implemented (MVP scope) |
| 2 | No rate limiting | Critical | Rate limit middleware not yet implemented (MVP scope) |
| 3 | Request-ID header log injection | Info | Low risk with structured logging |

---

## R2 Configuration Checklist

### Environment Variables

```bash
# Required -- S3-compatible API credentials
S3_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
S3_ACCESS_KEY_ID=<your-access-key>
S3_SECRET_ACCESS_KEY=<your-secret-key>
S3_BUCKET=anycap-tmp

# Required -- public URL hides bucket name from end users
S3_PUBLIC_URL=https://files.anycap.ai

# Optional (defaults shown)
S3_REGION=auto
S3_KEY_PREFIX=user_upload
S3_FORCE_PATH_STYLE=true
S3_PRESIGN_EXPIRY_SECONDS=600
```

### R2 Bucket Setup

1. **Create bucket** (if not exists):
   ```bash
   npx wrangler r2 bucket create anycap-tmp
   ```

2. **Create API token** in Cloudflare dashboard:
   - Go to R2 > Manage R2 API Tokens
   - Create token with "Object Read & Write" permission
   - Scope to bucket `anycap-tmp`
   - Save Access Key ID and Secret Access Key

3. **Configure custom domain** (for `S3_PUBLIC_URL`):
   - Go to R2 > anycap-tmp > Settings > Public Access
   - Add custom domain: `files.anycap.ai`
   - Ensure DNS CNAME is configured

4. **Apply lifecycle rules**:
   ```bash
   # Option A: Via wrangler
   npx wrangler r2 bucket lifecycle set anycap-tmp --file deploy/r2-lifecycle.json

   # Option B: Via S3 API (aws cli with R2 endpoint)
   aws s3api put-bucket-lifecycle-configuration \
     --bucket anycap-tmp \
     --lifecycle-configuration file://deploy/r2-lifecycle.json \
     --endpoint-url https://<ACCOUNT_ID>.r2.cloudflarestorage.com
   ```

5. **Verify lifecycle rules**:
   ```bash
   npx wrangler r2 bucket lifecycle list anycap-tmp
   ```

### Lifecycle Rules Applied

| Rule ID | Prefix | Action | Period |
|---------|--------|--------|--------|
| `expire-user-uploads-7d` | `user_upload/` | Delete objects | 7 days after creation |
| `abort-incomplete-multipart-1d` | `user_upload/` | Abort incomplete multipart uploads | 1 day after initiation |

### Upload Size Limits

| Content Type | Max Size |
|-------------|----------|
| `image/jpeg` | 20 MB |
| `image/png` | 20 MB |
| `image/gif` | 20 MB |
| `image/webp` | 20 MB |
| `video/mp4` | 200 MB |
| `video/webm` | 200 MB |
| `video/quicktime` | 200 MB |

All other content types are rejected (including `image/svg+xml`, `text/*`, `application/*`).

### How Size Enforcement Works

```
CLI                          Server                         R2
 |                             |                             |
 | stat file -> 5,242,880 bytes|                             |
 |                             |                             |
 | POST /presign               |                             |
 | {content_length: 5242880}   |                             |
 |                             |                             |
 |                 Validate:   |                             |
 |                 5MB <= 20MB |                             |
 |                             |                             |
 |                 PresignPut: |                             |
 |                 ContentLength: 5242880 (signed into URL)  |
 |                             |                             |
 | <-- {upload_url, ...}       |                             |
 |                             |                             |
 | PUT upload_url              |                             |
 | Content-Length: 5242880 ----|----------------------------->|
 |                             |                   R2 checks:|
 |                             |         Content-Length header|
 |                             |         matches signed value|
 |                             |                             |
 | <-- 200 OK -----------------|-----------------------------+
```

If the client sends a different `Content-Length` header, R2 returns `403 SignatureDoesNotMatch`.
