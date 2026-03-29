# AnyCap Edge Worker

Cloudflare Worker for Drive and Page public access.

## Scope

- Drive host: `drive.anycap.cloud`
- Page hosts: `*.page.anycap.cloud`

The worker only reads `EDGE_KV` + `ANYCAP_CLOUD_R2`.

## Local setup

1. Fill `wrangler.toml` binding IDs.
2. Set secrets:
	- `ANYCAP_PASSWORD_PEPPER`
	- `EDGE_SESSION_SECRET`
3. Run:

```bash
pnpm install
pnpm dev
```

## Runtime vars

- `DRIVE_STATIC_ASSET_CACHE_TTL_SECONDS`
- `PAGE_STATIC_ASSET_CACHE_TTL_SECONDS`
- `DRIVE_PASSWORD_RATE_LIMIT_WINDOW_SECONDS`
- `DRIVE_PASSWORD_RATE_LIMIT_MAX_ATTEMPTS`
- `PAGE_PASSWORD_RATE_LIMIT_WINDOW_SECONDS`
- `PAGE_PASSWORD_RATE_LIMIT_MAX_ATTEMPTS`
- `DRIVE_PASSWORD_SESSION_TTL_SECONDS`
- `PAGE_PASSWORD_SESSION_TTL_SECONDS`

## Notes

- Password challenge uses HTML form + HttpOnly session cookie.
- Password verify rate limit key uses `resource + IP`.
- File content strategy:
	- `text/*`, `image/*`, `application/pdf` => inline
	- others => attachment
