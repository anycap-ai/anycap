# AnyCap for Chrome

> **Image · Video · Music · Search · Crawl — in your browser.**
> Right-click anything on a page; AnyCap meets you there in a side panel.

![AnyCap Chrome side panel hero](docs/assets/hero-side-panel.png)

AnyCap is an **AI capability runtime**. The Chrome extension is one of three sibling clients
(CLI · Desktop · **Chrome**) that all talk to the same `anycap-server`. Whatever the agent stack
can do, you can do too — without leaving the page.

| | What it does |
|---|---|
| **Vary** | Right-click any image → generate a variation |
| **Image** | Text-to-image with model + aspect-ratio selectors |
| **Video** | Text-to-video, in-panel `<video>` preview |
| **Music** | Text-to-music, in-panel `<audio>` preview |
| **Search** | Web search with cited result cards |
| **Crawl** | Page → title + summary + clean Markdown |

---

## Install

> **TL;DR — Grab the latest `.zip` from [Releases](https://gitlab.knoffice.tech/engineering/anycap_chrome/-/releases), unzip, load unpacked.**

### Option A — Pre-built zip (recommended for testers)

1. Download `anycap-extension-<version>-chrome.zip` from
   <https://gitlab.knoffice.tech/engineering/anycap_chrome/-/releases>.
2. Unzip it anywhere, e.g. `~/Downloads/anycap-extension`.
3. Open `chrome://extensions`, enable **Developer mode** (top-right toggle).
4. Click **Load unpacked** → pick the unzipped folder.
5. Click the AnyCap toolbar icon — the side panel opens. Or right-click any image.

The pre-built zip ships with `WXT_MOCK=true`, so you can demo every capability **without the
backend** — image / video / music / search / crawl all return realistic sample data with
faked latency. When the production server is ready, swap to **Option B**.

### Option B — Build from source

```bash
git clone https://gitlab.knoffice.tech/engineering/anycap_chrome.git
cd anycap_chrome
pnpm install

# Choose ONE of:
pnpm demo           # WXT_MOCK=true — offline demo build, no backend
pnpm build          # Real backend (requires anycap-server reachable)
pnpm release        # WXT_RELEASE=true — strips localhost host_permissions, zips for CWS
```

The build output lands in `.output/chrome-mv3/` — same load-unpacked flow as Option A.

---

## How it works

### Right-click anywhere → side panel takes over

![right-click → side panel flow](docs/assets/right-click-flow.png)

Each context type lands on the right tab with the form pre-filled:

| Right-clicked target | Menu | Lands on |
|---|---|---|
| Image | ✨ Generate variation with AnyCap | **Vary** |
| Selection (text) | 🎨 Generate image from this text | **Image** |
| Selection (text) | 🎬 Generate video from this text | **Video** |
| Selection (text) | 🎵 Generate music from this text | **Music** |
| Selection (text) | 🔍 Search with AnyCap | **Search** |
| Page (background) | 📄 Crawl this page with AnyCap | **Crawl** |
| Link | 📄 Crawl link with AnyCap | **Crawl** |

Under the hood, `entrypoints/background.ts` writes a tagged-union `pendingRequest` to
`chrome.storage.session` and calls `chrome.sidePanel.open({ windowId })`. The side panel
listens for `chrome.storage.onChanged`, picks the right tab from `kind`, and pre-fills the form.

### One backend, three skins

![AnyCap product family architecture](docs/assets/architecture.png)

This extension is **not** a CLI wrapper. It hits the same Go HTTP API that powers the CLI
and the desktop app — server is the single source of truth for auth, rate limit, model
routing and billing. Adding a capability on the server lights it up for all three clients;
adding it client-side is a 30-line tab component.

---

## Project layout

```
entrypoints/
  background.ts            # MV3 service worker — context menus, side-panel routing
  content.ts               # Captures last hovered image, fires on pagehide
  sidepanel/
    App.tsx                # 7-tab shell (Vary, Image, Video, Music, Search, Crawl, Settings)
    tabs/                  # One file per capability — fully isolated
    components/            # AnycapMark, Spinner, ErrorBox, HistorySection, TemplateChips
    main.tsx, index.html, style.css
src/lib/
  api.ts                   # HTTP client → anycap-server (sends X-Anycap-Source: chrome-extension)
  api-mock.ts              # WXT_MOCK=true — picsum + sample MP4/OGG + fake search/crawl
  store.ts                 # Zustand state, tagged-union PendingRequest
  history.ts               # 30-item per-capability history with kind filter
  settings.ts              # Profile / default models / privacy preferences
  templates.ts             # 19 prompt-template chips
  storage.ts, constants.ts, auth.ts, errors.ts
public/icons/              # 16 / 48 / 128
store-assets/
  composer/*.html          # Static HTML composers for CWS shots (1280×800 / 1400×560 / 440×280)
  cws/*.png                # Rendered CWS submission assets
tests/
  unit/                    # Vitest — 78 tests
  e2e/                     # Playwright — 7 prod + 8 demo + 12 screenshot
wxt.config.ts              # Manifest, host_permissions (localhost stripped on release)
docs/assets/               # README diagrams
```

## Development

```bash
pnpm dev                # WXT dev server, hot-reload
pnpm test               # Vitest unit tests
pnpm e2e                # Playwright (production-mode build)
pnpm e2e:demo           # Playwright (mock build) — no backend needed
pnpm release            # WXT_RELEASE=true wxt build && wxt zip → CWS-ready
```

### Build flags

| Env var | Effect |
|---|---|
| `WXT_MOCK=true` | Replace every `api.ts` call with deterministic mocks (picsum / archive.org / W3C OGGs / fake search/crawl). No network needed. |
| `WXT_RELEASE=true` | Strip `localhost` and `127.0.0.1` host permissions, set production `DefaultEndpoint`, produce a CWS-ready zip via `wxt zip`. |
| `WXT_API_BASE=...` | Override server endpoint at build time (defaults to `http://127.0.0.1:8080` in dev, `https://api.anycap.ai` in release). |

### Testing notes

- E2E uses Playwright `launchPersistentContext` — **MV3 extensions only run in headed mode**, headless is unsupported by Chromium.
- Mock-mode E2E (`pnpm e2e:demo`) doesn't need the server — perfect for CI, quick smoke tests, and demos.
- `tests/e2e/cws-shots.spec.ts` regenerates all 6 CWS marketing PNGs from `store-assets/composer/*.html`.

## Permissions audit

```
contextMenus    — 7 right-click menu entries
activeTab       — read pageUrl when user invokes "Crawl this page"
storage         — chrome.storage.session (cross-context routing) + .local (history, cache)
downloads       — "Save to downloads" action on generated assets
sidePanel       — open the side panel programmatically from background
optional: identity   — used only if/when OAuth login is enabled (UI hidden in v0.2.0)
```

Production host permissions: `https://api.anycap.ai/*`, `https://anycap.ai/*` only.
Localhost / `127.0.0.1` are added back in dev/demo builds (`WXT_RELEASE` not set).

## Releases

| Version | Date | Highlights |
|---|---|---|
| **v0.2.0** | 2026-04-27 | First side-panel release. 6 capabilities, 7 right-click menus, 19 templates, mock mode, CWS assets. |
| v0.1.0 | 2026-04-22 | Popup-only image-variation MVP. |

Full changelog: [`CHANGELOG.md`](./CHANGELOG.md).
Pre-built zips and signed release notes: [Releases](https://gitlab.knoffice.tech/engineering/anycap_chrome/-/releases).

## Documentation

| File | Purpose |
|---|---|
| [`CHANGELOG.md`](./CHANGELOG.md) | Per-version changes |
| [`DEMO.md`](./DEMO.md) | 5-minute demo script with screenshots |
| [`LOAD_AND_USE.md`](./LOAD_AND_USE.md) | First-time install + troubleshooting |
| [`LAUNCH_CHECKLIST.md`](./LAUNCH_CHECKLIST.md) | What still blocks Chrome Web Store submission |
| [`store-assets/description.md`](./store-assets/description.md) | CWS-ready short + long descriptions, permission justifications |
| [`store-assets/cws/README.md`](./store-assets/cws/README.md) | Marketing-asset slot map (1280×800 × 4 + marquee + tile) |

## License

Internal — Knoffice / AnyCap. See repository owner.
