# AnyCap Edge Worker

Cloudflare Worker that serves Drive, Page, and CDN public access.

## Environments

| | Dev | Prod |
|---|---|---|
| Worker | `anycap-edge-dev` | `anycap-edge` |
| CDN | `cdn.dev.anycap.cloud` | `cdn.anycap.cloud` |
| Drive | `drive.dev.anycap.cloud` | `drive.anycap.cloud` |
| Page | `*.page.dev.anycap.cloud` | `*.page.anycap.cloud` |
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
- `*.page.*` → hosted page serving (with optional password protection)

Bindings: `EDGE_KV` (metadata) + `ANYCAP_CLOUD_R2` (file storage). Read-only, no external API calls.

## Notes

- Password challenge uses HTML form + HttpOnly session cookie
- Rate limiting keyed on `resource + IP`
- File content disposition: `text/*`, `image/*`, `application/pdf` inline; others attachment
