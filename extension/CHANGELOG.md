# Changelog

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
- 78 unit tests, 7 production E2E + 8 demo E2E + 12 screenshot E2E, all passing.

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
- Real-mode generation against `api.anycap.ai` will fail until commit `3514a828` (anonymous extension routes) is merged into `deploy/server-prod`. See `LOAD_AND_USE.md`.

## v0.1.0 — 2026-04-22

Initial popup-based MVP — see git history at commit `080ea7db`.
