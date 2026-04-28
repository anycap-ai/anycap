# Chrome Web Store assets — v0.2.0

Generated 2026-04-27 from `store-assets/composer/*.html` via
`npx playwright test tests/e2e/cws-shots.spec.ts`. Re-run that command to
regenerate any of these.

## What goes where on the CWS submission form

| Asset slot | Required size | File | Notes |
|---|---|---|---|
| **Screenshot 1** (hero) | 1280×800 | `01-hero-1280x800.png` | "Image, Video, Music, Search, Crawl — in your browser" |
| **Screenshot 2** | 1280×800 | `02-rightclick-1280x800.png` | Right-click context menu + side panel |
| **Screenshot 3** | 1280×800 | `03-templates-1280x800.png` | 19 prompt-template chips |
| **Screenshot 4** | 1280×800 | `04-history-1280x800.png` | History grid + Settings tab |
| Marquee promo | 1400×560 | `05-marquee-1400x560.png` | Featured placement (optional but recommended) |
| Small promo tile | 440×280 | `06-promo-440x280.png` | Discovery shelves (optional) |

CWS allows up to **5 screenshots**; we ship 4 — there's room to add a fifth
later (e.g. video/music output) without breaking layout.

## Submission form copy

Description and permission justifications: see `../description.md` and
`../../LAUNCH_CHECKLIST.md`.

## Re-rendering

```bash
# After updating side-panel screenshots in tests/e2e/feishu-shots/
npx playwright test tests/e2e/cws-shots.spec.ts
# All 6 PNGs regenerate from store-assets/composer/*.html
```

The composer takes the raw 400×760 side-panel screenshots and lays them on a
branded background with hero copy + bullet feature list. Each layout file is
~30 lines of static HTML — edit those if you want to tweak copy.
