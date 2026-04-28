# AnyCap Chrome Extension — v0.2.0 Launch Checklist

Last updated: 2026-04-27. Run through in order. Each item must pass before
submitting to the Chrome Web Store.

## Pre-submit

### Build / quality

- [x] `pnpm release` produces `releases/anycap-extension-0.2.0-chrome.zip` (~126 KB)
- [x] `pnpm test` — 78 unit tests pass
- [x] `pnpm e2e` — 7 prod E2E pass, no regressions
- [x] `pnpm e2e:demo` — 8 demo E2E pass (covers all 6 capability tabs)
- [x] `npx tsc --noEmit` — clean
- [x] Manual smoke: side panel opens via toolbar click, all 7 right-click menus appear in correct contexts
- [ ] Internal dogfood (5 people × 2 days, zero P0 bugs)
- [ ] P90 generation latency < 15 s on dev server (waiting on prod server deploy)

### Manifest / permissions

- [x] `host_permissions` minimized to `https://api.anycap.ai/*`, `https://anycap.ai/*`
- [x] `identity` moved to `optional_permissions` — anonymous users skip the prompt
- [x] `default_popup` removed; `side_panel.default_path` set
- [x] `version` = 0.2.0, `name` reflects the new capability surface
- [x] No `<all_urls>` in `host_permissions` (only in `content_scripts.matches`, which is required for context menus)

### Server / infrastructure

- [ ] Server deployed with commit `3514a828` (watermark param + anon rate limit + `/v1/extension/config`) — **blocks real-mode**
- [x] Privacy page live at `https://anycap.ai/privacy/extension`
- [x] OAuth `anycap-chrome-extension` client has the extension's redirect URI registered (used only when login UI lands)

## Store submission

- [ ] Upload `releases/anycap-extension-0.2.0-chrome.zip` to CWS
- [x] Description: see `store-assets/description.md` — refreshed to mirror v0.2 features
- [ ] 4 screenshots (1280×800) — regenerate from `tests/e2e/feishu-shots/` set, scaled
- [ ] Icon (128×128) — already in repo
- [ ] Demo video (YouTube) — should walk through the 6 capability tabs + 7 right-click menus
- [x] Privacy policy URL: `https://anycap.ai/privacy/extension`
- [ ] Permission justifications (paste into CWS form):
  - `contextMenus`: "Show 'Generate variation', 'Search with AnyCap', 'Crawl link', etc. on right-click"
  - `activeTab`: "Read the current tab URL when the user clicks 'Use current tab URL' in the Crawl panel"
  - `storage`: "Save trial counter, user preferences, generation history locally"
  - `downloads`: "Save generated images / videos / music to the user's machine"
  - `sidePanel`: "Show the AnyCap interface in Chrome's side panel"
  - `identity` (optional): "Sign the user into their AnyCap account when they choose to"
- [ ] Submit for review

## Post-submit (3-7 day review window)

- [ ] Write Product Hunt launch post
- [ ] Write 即刻 / 少数派 / V2EX 介绍帖
- [ ] Record 2-minute B 站 tutorial of the 7 right-click flows
- [ ] Prep launch tweet thread
- [ ] Refresh anycap.ai banner CTA

## Day-1 after approval

- [ ] Announce in `anycap.ai` site banner
- [ ] Announce in 飞书 daemon welcome message
- [ ] Post to Product Hunt
- [ ] Monitor CWS reviews + `anycap-server` metrics:
  - P90 latency per capability
  - Error rate (especially TRIAL_EXHAUSTED conversions)
  - Conversion funnel: install → first-gen → second-gen → paywall view → sign-in

## What's NOT shipping in v0.2

- Account login UI (auth code present, button hidden — `optional_permissions` keeps prompt off)
- Drive / Page capabilities (still desktop-only)
- API key management (Settings doesn't expose this yet)
- I18n — copy is English-only
