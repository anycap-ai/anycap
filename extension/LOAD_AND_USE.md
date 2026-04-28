# Loading and using the AnyCap Chrome extension

This doc captures the exact steps after the 2026-04-27 load-and-use fixes.

## What was fixed in this round

| Issue | Symptom | Fix |
|---|---|---|
| `icons/128.png` was 2048×2048, 4 MB | Bloated bundle, sluggish load, possible Chrome warning | Resized to 128×128 (26 KB) |
| Extension never sent `X-Anycap-Source: chrome-extension` | Server's anonymous rate-limit middleware bypassed → request fell through to the protected route → 401 | `src/lib/api.ts` now adds the header on every request |
| `/v1/extension/config` 404 logged on every popup open | Console noise on every popup mount because prod has no such route | 24-hour negative cache in `chrome.storage.local` so we hit the network at most once per day |
| Content script's `MutationObserver` cleared `lastImage` on any DOM change | On SPAs (Twitter, Gmail) the captured dimensions were lost between right-click and the background message | Replaced with a `pagehide` listener — only clears on real navigation |
| `API_BASE` was hard-coded to prod | No way to point at a local server during dev | Honors `WXT_API_BASE` env at build time; manifest now allows `http://127.0.0.1/*` and `http://localhost/*` |

## How to load the extension into Chrome

```bash
cd extension
pnpm install
pnpm build
```

1. Open `chrome://extensions`.
2. Toggle **Developer mode** (top right).
3. Click **Load unpacked**.
4. Pick `extension/.output/chrome-mv3/`.

The extension should appear with the AnyCap olive logo and no errors next to it.

## How to actually use the extension

> **Important:** The extension needs a server that exposes the anonymous extension routes. As of this commit, **neither `deploy/server-prod` nor `deploy/server-dev` has commit `3514a828` (the one that adds `/v1/extension/config` and the anonymous rate-limited `/v1/image/generate`).** Until that ships, every right-click → Generate against `https://api.anycap.ai` will return 401.

### Option A — local server (fastest)

```bash
# in repo root
make infra-up        # Postgres + Redis
make dev             # anycap-server on :8080

# in extension/
WXT_API_BASE=http://127.0.0.1:8080 pnpm build
# reload the unpacked extension in chrome://extensions
```

### Option B — fix prod

Merge `main` → `deploy/server-prod` (and `deploy/server-dev`) so the anon routes deploy. Then `WXT_API_BASE` is unnecessary — the default `https://api.anycap.ai` will work.

## How to verify it's working

```bash
cd extension
pnpm test                                          # 62 unit tests
pnpm exec playwright test                          # 16 E2E + 1 fixme

# Quick prod-endpoint sanity check
curl -i https://api.anycap.ai/v1/extension/config  # expect 200 once prod is redeployed
curl -i -X POST https://api.anycap.ai/v1/image/generate \
  -H 'Content-Type: application/json' \
  -H 'X-Anycap-Source: chrome-extension' \
  -H 'X-Anycap-Install-Id: any-uuid' \
  -d '{"prompt":"test","model":"nano-banana-2","images":["https://placehold.co/512.png"]}'
# Once prod has commit 3514a828 this returns 200; today it returns 401.
```

## Manual smoke after loading

1. Right-click any image ≥256 px on a website (e.g. Wikipedia photo).
2. Select **Generate variation with AnyCap**.
3. Toolbar badge shows **1**, popup auto-opens (Chrome 127+) or click the icon.
4. Source image preview is visible, prompt textarea is editable.
5. Click **Generate Variation** — result appears within ~15 s.
6. Trial counter decrements.

If the click results in an error toast saying "Session expired" or "Server error", the prod server is missing commit `3514a828` (see Option A above for the workaround).
