# Loading and using the AnyCap Chrome extension

This doc captures the exact steps after the 2026-05-09 v0.2.0 refresh.

Manual loading and smoke steps in this document use visible Chrome UI. Do not run
them during unattended agent work or without explicit approval when browser
windows should stay closed.

## What was fixed in this round

| Issue | Symptom | Fix |
|---|---|---|
| `icons/128.png` was 2048×2048, 4 MB | Bloated bundle, sluggish load, possible Chrome warning | Resized to 128×128 (26 KB) |
| Extension never sent `X-Anycap-Source: chrome-extension` | Server's anonymous rate-limit middleware bypassed → request fell through to the protected route → 401 | `src/lib/api.ts` now adds the header on every request |
| `/v1/extension/config` 404 logged on every popup open | Console noise on every popup mount because prod has no such route | 24-hour negative cache in `chrome.storage.local` so we hit the network at most once per day |
| Content script's `MutationObserver` cleared `lastImage` on any DOM change | On SPAs (Twitter, Gmail) the captured dimensions were lost between right-click and the background message | Replaced with a `pagehide` listener — only clears on real navigation |
| `API_BASE` was hard-coded to prod | No way to point at a local or staging server during dev | Honors `WXT_API_BASE` env at build time; non-release manifests allow local hosts and the configured API origin |
| Anonymous trial budget was local-only | Clearing extension storage reset the free trial counter | Server now supports a durable Postgres-backed install-ID budget in persistent runtime modes |
| Real-mode failures were hard to interpret | Offline, auth, quota, and server errors looked generic | Side panel now classifies failures and shows retry/settings/paywall actions |

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

> **Important:** The release build defaults to `https://api.anycap.ai`, but public
> anonymous use requires the current server extension support to be deployed and
> production dconf to allow anonymous extension users for the enabled operations.
> Anonymous media generation also requires production to run the dual bucket
> abuse-control middleware, or an equivalent gateway rule, so rotating
> `X-Anycap-Install-Id` cannot bypass the launch trial. Until those gates pass,
> real-mode requests can still return `401`, `403`, or `503` even though the
> extension package itself is built correctly.

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

Deploy the current server changes to `deploy/server-prod` (and the staging/dev
environment used for validation), run the embedded migrations, verify the
anonymous public-trial abuse-control middleware is live, then configure
`feature_access` and `rate_limit` dconf for:

- `image.generate`
- `video.generate`
- `music.generate`
- `web.search`
- `web.crawl`

After that, `WXT_API_BASE` is unnecessary for production use — the default
`https://api.anycap.ai` should work.

## How to verify it's working

```bash
cd extension
pnpm test                                          # 180 unit tests
pnpm preflight:local                               # browser-free local release gate
npx tsc --noEmit
pnpm release                                       # CWS-ready zip + current zip SHA-256 doc sync
pnpm verify:release                               # manifest / permission / asset / listing / submission hash / launch-dconf / launch-runbook audit
pnpm render:cws                                   # headless CWS screenshot / promo asset renderer; no browser window
pnpm render:demo                                  # headless demo MP4 renderer; no browser window
ANYCAP_API_BASE=https://api-staging.anycap.ai pnpm smoke:server
                                                  # browser-free server/dconf smoke
ANYCAP_API_BASE=https://api-staging.anycap.ai pnpm launch:audit
                                                  # browser-free launch gate summary
ANYCAP_API_BASE=https://api-staging.anycap.ai pnpm launch:audit -- --abuse-control-passed --real-e2e-passed
                                                  # final browser-free CWS gate after abuse-control is deployed and approved real E2E is green
ANYCAP_API_BASE=https://api-staging.anycap.ai pnpm smoke:server -- --include-media
                                                  # optional media-only anonymous smoke; consumes provider quota

# Quick prod-endpoint sanity check
curl -i -H 'X-Anycap-Source: chrome-extension' \
  -H 'X-Anycap-Install-Id: smoke-install' \
  https://api.anycap.ai/v1/extension/config
# expect 200 once prod is deployed and configured

curl -i -X POST https://api.anycap.ai/v1/web/search \
  -H 'Content-Type: application/json' \
  -H 'X-Anycap-Source: chrome-extension' \
  -H 'X-Anycap-Install-Id: smoke-install' \
  -d '{"query":"AnyCap"}'
# expect 200, not 401/403/503

curl -i -X POST https://api.anycap.ai/v1/image/generate \
  -H 'Content-Type: application/json' \
  -H 'X-Anycap-Source: chrome-extension' \
  -H 'X-Anycap-Install-Id: smoke-install' \
  -d '{"prompt":"test","model":"nano-banana-2","images":["https://placehold.co/512.png"]}'
# expect 200 once NexusHub routing and feature access are configured

# Headed Chromium: run only after explicit approval to open a browser window.
ANYCAP_ALLOW_HEADED_E2E=1 WXT_API_BASE=https://api-staging.anycap.ai pnpm e2e:real
```

## Manual smoke after loading

This section uses visible Chrome UI; run it only after explicit approval.

1. Right-click any image ≥256 px on a website (e.g. Wikipedia photo).
2. Select **Generate variation with AnyCap**.
3. Toolbar badge shows **1**, and the side panel opens; if Chrome does not open it automatically, click the AnyCap icon.
4. Source image preview is visible, prompt textarea is editable.
5. Click **Generate Variation** — result appears within ~15 s.
6. Trial counter decrements.

If the click results in an auth, feature-disabled, or server error, first verify
the server deploy and dconf rollout above. Use Option A to bypass production while
debugging client-side behavior.
