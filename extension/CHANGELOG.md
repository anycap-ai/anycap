# Changelog

## Unreleased

### Added

- **Offline detection**: `navigator.onLine` checked before every API call; users see "You're offline" with a retry button instead of a generic network error.
- **Server-error retry UX**: HTTP 503 and 5xx errors now show "AnyCap servers are having a moment" with an inline retry action.
- **ErrorBox action buttons**: every error (except trial-exhausted and CSP-blocked) now surfaces a contextual action — retry for network/server/offline, "Go to Settings" for unauthorized.
- **Global focus-visible ring**: keyboard navigation is visible on all interactive elements via `:focus-visible`.
- **System reduced-motion support**: `prefers-reduced-motion: reduce` is now honored globally, disabling transitions and hover lifts even before the Settings toggle is set.

### Engineering

- Added `OFFLINE` error code and `isOffline()` guard in `errors.ts`.
- Enhanced `classifyHttpError` to return friendly messages for 503.
- Added unit tests for offline detection and 503 classification.
- TabBar buttons now carry `aria-label` and `focus-visible` classes for accessibility.
- Server anonymous trial enforcement now uses a Postgres-backed install-ID budget in persistent runtime modes.
- Anonymous public-trial enforcement now also consumes a hashed TCP remote-address client bucket, so rotating install IDs or spoofing `X-Forwarded-For` does not bypass the local server trial gate.
- Anonymous extension media generation skips billing intents, preventing `anon:<install-id>` from hitting numeric user-ID billing tables.
- Added anonymous public-trial abuse-control gate coverage to the completion audit, production runbook, CWS submission guide, launch checklist, next-steps doc, README, load/use guide, and demo notes. `pnpm launch:audit` now requires `--abuse-control-passed` before it can turn green, and `pnpm verify:release` requires the final upload docs to include that gate.
- Updated Chrome Web Store listing and screenshot composer copy to describe the launch trial as "3 anonymous capability runs / month" and removed premature hidden-login quota promises while the extension login UI remains hidden; release verification now rejects unavailable sign-in quota and trial-reset claims in both CWS listing and screenshot source copy.
- Added a gated `pnpm e2e:real` Playwright smoke spec for explicit staging/prod anonymous vary, image, and crawl verification.
- `pnpm e2e:real` now exits before opening headed Chromium unless `ANYCAP_ALLOW_HEADED_E2E=1` is set after explicit approval.
- All headed Playwright package scripts (`pnpm e2e`, `pnpm e2e:demo`, `pnpm shots:feishu`, `pnpm e2e:real`) now require `ANYCAP_ALLOW_HEADED_E2E=1` before opening Chromium, and the release verifier rejects any package script that invokes Playwright without that guard.
- Non-release builds now add the `WXT_API_BASE` origin to `host_permissions`, so staging real-mode E2E is not blocked by Chrome extension permissions; release builds stay production-only.
- Added `pnpm verify:release` for browser-free validation of the CWS zip manifest, extension icon dimensions, runtime manifest entrypoints and referenced files, content script `file://` exclusion, release host permissions, required scripts, store asset dimensions, listing copy, demo MP4 metadata, CWS submission guide, Chrome extension launch dconf examples, and production launch runbook.
- Added `store-assets/permission-justifications.md` and verify it covers every required and optional manifest permission.
- Added `store-assets/cws-submission.md` and verify it covers CWS form inputs, asset mapping, permission copy, server smoke, real E2E, deploy, and dconf gates.
- Release verifier now scans the CWS zip for source maps, test files, localhost, staging hosts, and mock-mode strings.
- `pnpm release` now copies WXT's `.output/anycap-extension-0.2.0-chrome.zip` into `releases/anycap-extension-0.2.0-chrome.zip`, and the release verifier requires that sync path.
- Release verifier now fails if a freshly built `.output/anycap-extension-0.2.0-chrome.zip` exists but differs from `releases/anycap-extension-0.2.0-chrome.zip`.
- Added `pnpm preflight:local` as a browser-free local production gate for release rebuild, unit tests, type check, and release verification; release verifier now requires it to stay browser-free.
- Extension CI now runs `pnpm preflight:local` so the checked-in CWS package path stays covered by the same browser-free local gate.
- Added `pnpm smoke:server` for browser-free post-deploy validation of required feature flags, anonymous extension headers, `/v1/extension/config`, web search, web crawl, extension config/search/crawl response shapes, and optional image/video/music generation.
- Adjusted `pnpm smoke:server -- --include-media` to run image/video/music as a media-only anonymous smoke, skipping search/crawl so the smoke does not exceed the 3-run anonymous launch trial by itself.
- Fixed the extension web-search client to send `max_results` to the server and map server `description` fields into the UI `snippet` field.
- Added `pnpm launch:audit` for browser-free launch gate aggregation across release verification, production smoke, live privacy policy URL, and remaining deploy / auth / dconf / real E2E blockers.
- Launch audit now retries the live privacy policy URL check once on transient network failure.
- Launch audit now fetches the live privacy policy page body and rejects Next.js 404 fallback content even when the CDN returns HTTP 200.
- Added `--abuse-control-passed` and `--real-e2e-passed` to `pnpm launch:audit` so the browser-free audit can turn green as the final Chrome Web Store upload gate only after anonymous abuse control and an approved headed E2E run are both acknowledged.
- Added `docs/PRODUCTION-LAUNCH-RUNBOOK.md` with server deploy, dconf, smoke, E2E acknowledgement, CWS submission, and rollback steps.
- Added `pnpm render:cws`, a headless Chrome Web Store screenshot and promo asset renderer that avoids opening visible browser windows.
- Added `pnpm render:demo`, a headless demo video renderer that outputs `store-assets/demo.mp4` for YouTube upload after approval.
- Release verifier now rejects retired standalone `engineering/anycap_chrome` repository references in extension release docs, so install instructions stay pointed at the current monorepo.

## v0.2.0 — 2026-04-27

This is the first **side-panel** release. The popup is gone; the extension now lives in Chrome's right-side panel and exposes 7 capability tabs.

### Added — capabilities

- **Side panel** as the primary surface (Chrome 116+ behavior: toolbar click opens panel directly).
- **6 capability tabs** + Settings:
  - **Vary** (image-to-image, the original v0.1 flow).
  - **Image** — text-to-image with model + aspect-ratio selectors.
  - **Video** — text-to-video with model + duration selectors, in-panel `<video>` preview.
  - **Music** — text-to-music with model + duration selectors, in-panel `<audio>` preview.
  - **Search** — web search with 6 source-cited result cards.
  - **Crawl** — page → title + summary + clean Markdown, with "Use current tab URL" shortcut.
  - **Settings** — Profile, Default models, Privacy & display, Maintenance, About.
- **5 prompt-template chips** per gen tab (19 total) — one tap fills the prompt + recommended model + aspect/duration.
- **Per-capability history** — last 30 generations across all tabs, filtered by `kind`. Click a thumbnail / row to rehydrate the form. Clear button works per tab.

### Added — right-click menus (5 → 7)

| Right-clicked target | Menu | Lands on |
|---|---|---|
| Image | ✨ Generate variation with AnyCap | Vary |
| Selection (text) | 🎨 Generate image from this text | Image |
| Selection (text) | 🎬 Generate video from this text | Video — **new in v0.2** |
| Selection (text) | 🎵 Generate music from this text | Music — **new in v0.2** |
| Selection (text) | 🔍 Search with AnyCap | Search |
| Page (background) | 📄 Crawl this page with AnyCap | Crawl |
| Link | 📄 Crawl link with AnyCap | Crawl |

### Added — UX polish

- `lucide-react` icon set replaces all inline SVGs for visual parity with the desktop app.
- Subtle radial-gradient background, `header-gradient` top bar, hover lifts on cards.
- Vary empty state upgraded from a single text block to a hero card + 3 quick-action launch cards (Generate image / Search / Crawl).
- Reduced-motion toggle in Settings honors users with motion sensitivity.

### Added — engineering

- `WXT_MOCK=true pnpm demo` — fully offline-capable demo build that mocks all server calls (image, video, music, search, crawl) with realistic latency and sample media.
- `WXT_RELEASE=true pnpm release` — production build that strips `localhost` host permissions and produces a CWS-ready zip.
- Comprehensive unit, production-mode E2E, demo E2E, and screenshot E2E coverage for the initial side-panel cut.

### Changed

- **Manifest**: removed `default_popup`, added `side_panel.default_path: sidepanel.html`, added `sidePanel` permission.
- **Manifest**: moved `identity` from `permissions` → `optional_permissions`. Anonymous users no longer see the prompt; the permission is requested on demand if/when login lands.
- **Permissions audit**: production host permissions trimmed from 4 → 2 (`api.anycap.ai`, `anycap.ai`); `localhost` host entries are kept only in dev/demo builds.
- **Display name**: "AnyCap — Turn anything you see into new content" → "AnyCap — Image, Video, Music, Search, Crawl in your browser" to match the new capability surface.
- **Description** updated to surface the side-panel + 5 capability story.
- **Quota counter** is shared across all capability tabs (a video gen and a search both decrement the same 3-trial counter).

### Fixed

- `icons/128.png` was a 4 MB 2048×2048 PNG; resized to actual 128×128 (26 KB). Bundle size went from 4.34 MB → 345 KB.
- `X-Anycap-Source: chrome-extension` header now sent on every request — previously omitted, which made the server's anonymous rate-limiter fall through to the protected route and return 401.
- `/v1/extension/config` 404 noise eliminated via 24-hour negative cache in `chrome.storage.local`.
- Content script's `MutationObserver` cleared `lastImage` on every DOM change (broke SPAs); replaced with `pagehide` listener.

### Known gaps

- Account login is wired (`src/lib/auth.ts`) but the UI is hidden until OAuth flow is finalized.
- Real-mode generation against `api.anycap.ai` still requires deploying the current anonymous extension server changes and feature-access dconf before public install.
- Anonymous public trial abuse control is implemented locally but still must be deployed before public CWS traffic; do not enable anonymous media generation until production runs the dual-bucket middleware or an equivalent gateway rule.

## v0.1.0 — 2026-04-22

Initial popup-based MVP — see git history at commit `080ea7db`.
