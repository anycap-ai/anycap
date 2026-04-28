# AnyCap Chrome Extension — Demo Guide

> Demo build runs entirely on the client. **No server required.** The bundle
> intercepts all API calls with realistic mocks (delay + sample media).

## One-shot setup

```bash
cd extension
pnpm install
pnpm demo                # builds .output/chrome-mv3 with WXT_MOCK=true
```

In Chrome:
1. `chrome://extensions` → enable **Developer mode**.
2. **Load unpacked** → pick `extension/.output/chrome-mv3/`.
3. Pin the AnyCap icon to the toolbar.

Click the toolbar icon — Chrome opens the **right-side panel**, not a small popup.

## What's in the panel

The panel has 6 capability tabs that mirror the AnyCap CLI / desktop matrix:

| Tab | Capability | Mocked output |
|---|---|---|
| **Vary** | Image variation from a right-clicked image | new picsum image (~2.5 s) |
| **Image** | Text-to-image with model + aspect ratio | picsum image (~2.2 s) |
| **Video** | Text-to-video with model + duration | sample MP4 + poster (~5 s) |
| **Music** | Text-to-music with model + duration | public OGG track (~3 s) |
| **Search** | Web search | 6 result cards (~0.7 s) |
| **Crawl** | Page extraction → markdown | summary + word count + markdown (~1.5 s) |

## Right-click context menus → side panel

The extension registers **5** context menu entries. Each one opens the side
panel and pre-fills the right tab.

| Right-clicked element | Menu item | Lands on tab | Pre-filled |
|---|---|---|---|
| Image (≥256 px) | ✨ Generate variation with AnyCap | **Vary** | source image |
| Selected text | 🎨 Generate image from this text | **Image** | prompt = selection |
| Selected text | 🔍 Search with AnyCap | **Search** | query = selection |
| Page (background) | 📄 Crawl this page with AnyCap | **Crawl** | URL = page URL |
| Link | 📄 Crawl link with AnyCap | **Crawl** | URL = link URL |

## Suggested demo script

1. **Cold open** — click the toolbar icon. Side panel slides in from the right.
2. **Image** tab — type "a watercolor cat reading a book" → Generate Image. ~2.5 s, image renders, Open / Download.
3. **Video** tab — type "a calm beach at sunset, slow drone shot" → Generate Video. ~5 s, playable MP4.
4. **Music** tab — "uplifting jazz with piano and saxophone" → Generate Music. Audio player.
5. **Search** tab — "agent capability runtime" → Enter. 6 result cards.
6. **Crawl** tab — "Use current tab URL" → Crawl Page. Title + summary + expandable markdown.
7. **Vary** flow — close panel, navigate to any page with images, right-click an image → Generate variation. Panel reopens on the **Vary** tab with the source preview, click Generate Variation.
8. **Right-click selection** — highlight text on a page → right-click → "Search with AnyCap". Panel opens on **Search** with the query pre-filled.
9. After 3 generations across any tab → **Free Tries Used** paywall.

## Where the mock lives

| File | Purpose |
|---|---|
| `src/lib/api-mock.ts` | All 6 capability mocks |
| `src/lib/api.ts` | Branches on `MOCK_MODE` |
| `src/lib/constants.ts` | `MOCK_MODE` from `WXT_MOCK` env |
| `entrypoints/sidepanel/` | Side panel UI (App + 6 tab components) |
| `entrypoints/background.ts` | Context menus + panel-open routing |

The result media in mock mode comes from public sources (picsum.photos for
images, Google's open sample MP4s for video, archive/W3C/Wikimedia OGG for
music). Internet required for the assets to render — same as production.

## Switching back to real mode

```bash
pnpm build
```

(`WXT_MOCK` unset → real API mode. Currently fails at API call time because
`deploy/server-prod` lacks commit `3514a828`. See `LOAD_AND_USE.md`.)

## Verification

```bash
pnpm test                # 78 unit tests
pnpm e2e                 # 7 prod-mode E2E + 21 mock-only skipped
pnpm e2e:demo            # builds demo + runs 8 demo E2E covering all 6 tabs
pnpm release             # produces releases/anycap-extension-0.2.0-chrome.zip (CWS-ready, 126 KB)
```

## Producing a release

```bash
pnpm release
# → .output/anycap-extension-0.2.0-chrome.zip
# → strips localhost host_permissions, keeps only api.anycap.ai + anycap.ai
```
