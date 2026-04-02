# AnyCap Edge Worker

Cloudflare Worker that serves Drive, Page, and CDN public access.

## Environments

| | Dev | Prod |
|---|---|---|
| Worker | `anycap-edge-dev` | `anycap-edge` |
| CDN | `cdn.anycap.dev` | `cdn.anycap.cloud` |
| Drive | `drive.anycap.dev` | `drive.anycap.cloud` |
| Artifact public | `artifact.anycap.dev` | `artifact.anycap.cloud` |
| Artifact ingest (internal) | `artifact-ingest.anycap.dev` | `artifact-ingest.anycap.cloud` |
| Page | `page-<name>.anycap.dev` | `page-<name>.anycap.cloud` |
| R2 bucket | `anycap-cloud-dev` | `anycap-cloud` |

## Setup

```bash
pnpm install

# Copy and fill in secrets
cp .secrets.example .secrets.dev
cp .secrets.example .secrets.prod
```

Secrets:
- `ANYCAP_PASSWORD_PEPPER` — salt for password hashing
- `EDGE_SESSION_SECRET` — HMAC key for session cookies
- `ANYCAP_ARTIFACT_INGEST_TOKEN` — bearer token for ingest endpoint

Artifact ingest source policy:
- `ARTIFACT_SOURCE_HOST_ALLOWLIST` can be empty (default) to allow any public HTTPS host.
- If configured, only listed hosts (supports `*.example.com`) are allowed.
- In all cases, localhost/private-network/IP-literal sources are blocked.

## Development

```bash
make dev          # local dev server
make typecheck    # type check
make test         # run tests
```

## Deploy

```bash
make deploy              # deploy to dev
make deploy ENV=prod     # deploy to prod (requires confirmation)
make secrets             # upload secrets from .secrets.dev
make secrets ENV=prod    # upload secrets from .secrets.prod
```

## Architecture

The worker routes requests by hostname:
- `cdn.*` → public asset serving
- `drive.*` → shared file/folder access (with optional password protection)
- `artifact.*` → capability artifact short-link download (`/a/{token}`)
- `artifact-ingest.*` → internal provider-to-R2 ingest endpoint
- `page-<name>.*` → hosted page serving (with optional password protection)

Artifact short-link cache policy:
- `artifact.*` responses are sent with `Cache-Control: private, max-age=15, must-revalidate`.
- This keeps browser cache very short while still re-checking token validity/expiry quickly.

Bindings: `EDGE_KV` (metadata + rate limit counters) + `ANYCAP_CLOUD_R2` (file storage) + CF Cache API (static asset caching). No external API calls.

## Notes

- Password challenge uses HTML form + HttpOnly session cookie
- Rate limiting keyed on `resource + IP`
- File content disposition: `text/*`, `image/*`, `application/pdf` inline; others attachment
