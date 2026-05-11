# Chrome Web Store Submission Form - v0.2.0

Use this as the single source for the Chrome Web Store dashboard submission.

Developer console: https://chrome.google.com/webstore/devconsole/

## Package

- Upload: `releases/anycap-extension-0.2.0-chrome.zip`
- Version: `0.2.0`
- SHA-256: `c4e2272fb564225cd1250ae2adc9587ba284f932ad4aa3f8bb351c2ddd7e3b47`
- Category: Productivity
- Language: English

## Store Listing

- Listing copy: `store-assets/description.md`
- Privacy policy URL: https://anycap.ai/privacy/extension
- Support URL: https://anycap.ai
- Website URL: https://anycap.ai

## Assets

| Slot | File |
|---|---|
| Screenshot 1 | `store-assets/cws/01-hero-1280x800.png` |
| Screenshot 2 | `store-assets/cws/02-rightclick-1280x800.png` |
| Screenshot 3 | `store-assets/cws/03-templates-1280x800.png` |
| Screenshot 4 | `store-assets/cws/04-history-1280x800.png` |
| Marquee promo | `store-assets/cws/05-marquee-1400x560.png` |
| Small promo tile | `store-assets/cws/06-promo-440x280.png` |
| Promotional video source | `store-assets/demo.mp4` |

Upload `store-assets/demo.mp4` to YouTube after approval, then paste the
YouTube URL into the optional CWS promotional video field.

## Permissions

Permission copy: `store-assets/permission-justifications.md`

Permissions to justify in the submission form:

- `contextMenus`
- `activeTab`
- `storage`
- `downloads`
- `sidePanel`
- Optional `identity`

## Pre-Submit Gates

Run these before upload:

```bash
pnpm verify:release
ANYCAP_INSTALL_ID=<fresh-install-id> pnpm smoke:server -- --base-url https://api.anycap.ai
```

Run this only after explicit approval because it opens headed Chromium:

```bash
ANYCAP_ALLOW_HEADED_E2E=1 WXT_API_BASE=https://api.anycap.ai pnpm e2e:real
```

After that real-mode E2E run is green, run the final browser-free upload gate:

```bash
ANYCAP_INSTALL_ID=<fresh-install-id> pnpm launch:audit -- --base-url https://api.anycap.ai --abuse-control-passed --real-e2e-passed
```

Server gates that must already be complete:

- `deploy/server-prod` includes the current extension anonymous support.
- Anonymous public-trial abuse control is deployed. Do not enable anonymous
  `image.generate`, `video.generate`, or `music.generate` until production runs
  the dual-bucket server middleware or an equivalent gateway rule limiting
  install-ID rotation.
- `feature_access` dconf allows public anonymous extension rollout for `image.generate`, `video.generate`, `music.generate`, `web.search`, and `web.crawl`.
- `rate_limit` dconf sets explicit limits for `image.generate`, `video.generate`, `music.generate`, `web.search`, and `web.crawl`.
- `https://anycap.ai/privacy/extension` returns the extension privacy page body;
  `launch:audit` rejects the current Next.js 404 fallback even when HTTP status is
  `200`.

## Submit

Submit only after the package, assets, listing copy, permission copy, privacy URL,
anonymous abuse-control gate, server deploy, dconf rollout, browser-free smoke,
and approved real-mode E2E are complete.
