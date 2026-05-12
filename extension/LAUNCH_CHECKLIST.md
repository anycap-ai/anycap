# AnyCap Chrome Extension — v0.2.0 Launch Checklist

Last updated: 2026-05-12. Run through in order. Each item must pass before
submitting to the Chrome Web Store.

## Pre-submit

### Build / quality

- [x] `pnpm release` produces `releases/anycap-extension-0.2.0-chrome.zip` (128.77 KB)
- [x] `pnpm verify:release` — release zip manifest, extension icon dimensions, runtime manifest entrypoints and referenced runtime files, content script `file://` exclusion, permissions, scripts, no dev/staging leakage, `.output`/`releases` zip sync, CWS submission hash, release zip/side-panel performance budgets, side-panel accessibility and contrast guards, CWS asset dimensions, demo MP4 metadata, listing and screenshot composer copy including hidden sign-in quota and production trial-reset claims, launch UI source/zip copy, README/load-use/changelog release-doc consistency, permission justifications, CWS submission guide including demo-video YouTube instructions, headless CWS renderer script, Chrome extension launch dconf examples, production launch runbook, and visible Chrome approval docs pass
- [x] `pnpm preflight:local` — browser-free local gate covering release rebuild, unit tests, type check, and release verifier
- [x] `pnpm test` — 190 unit tests pass
- [x] `pnpm launch:audit -- --skip-smoke` — browser-free local launch audit command is wired
- [x] Targeted server readiness tests — `internal/transport/http`, `internal/middleware`, and image/video/music/web application packages cover anonymous Chrome extension routes and pass locally
- [ ] `pnpm smoke:server -- --base-url <staging-or-prod>` — browser-free required-features + anonymous extension config/search/crawl smoke pending deploy
- [ ] `pnpm smoke:server -- --base-url <staging-or-prod> --include-media` — browser-free anonymous image/video/music smoke pending deploy; skips search/crawl to stay within the 3-run trial and consumes provider quota
- [ ] `ANYCAP_ALLOW_HEADED_E2E=1 pnpm e2e:real` — vary/image/crawl real-mode smoke pending final approved run against deployed staging/prod server
- [x] `ANYCAP_ALLOW_HEADED_E2E=1 pnpm e2e:demo` — underlying demo E2E previously passed with 9 tests (covers all 6 capability tabs + onboarding); current headed wrapper blocks before Playwright when not approved
- [x] `npx tsc --noEmit` — clean
- [ ] Manual smoke: side panel opens via toolbar click, all 7 right-click menus appear in correct contexts — pending explicit approval because it interacts with visible Chrome
- [ ] Internal dogfood (5 people × 2 days, zero P0 bugs), recorded in `store-assets/launch-evidence.md`
- [ ] P90 generation latency < 15 s on deployed server, recorded in `store-assets/launch-evidence.md` (waiting on prod server deploy)

### Manifest / permissions

- [x] `host_permissions` minimized to `https://api.anycap.ai/*`, `https://anycap.ai/*`
- [x] `identity` moved to `optional_permissions` — anonymous users skip the prompt
- [x] `default_popup` removed; `side_panel.default_path` set
- [x] `version` = 0.2.0, `name` reflects the new capability surface
- [x] No `<all_urls>` in `host_permissions` (only in `content_scripts.matches`, which is required for context menus)

### Server / infrastructure

- [ ] Server deployed with current extension support changes — anonymous image/video/music/web routes, durable install-ID trial budget, `/v1/extension/config`, and anonymous zero-credit trial path. **Blocks real-mode public install.**
- [ ] Anonymous public-trial abuse-control gate deployed — local server now has dual install-ID + hashed remote-address trial buckets, but production must run this code or an equivalent gateway rule before anonymous media generation is enabled. **Blocks public CWS submission.**
- [ ] Production `feature_access` dconf allows anonymous extension rollout for the enabled operations (`image.generate`, `video.generate`, `music.generate`, `web.search`, `web.crawl`) before public CWS traffic
- [x] Production launch runbook: `docs/PRODUCTION-LAUNCH-RUNBOOK.md` covers deploy branches, dconf, browser-free smoke, `--abuse-control-passed`, `--real-e2e-passed`, `--dogfood-passed`, `--latency-passed`, CWS upload, and rollback
- [ ] Latest browser-free prod smoke (2026-05-12, install ID `prod-check-20260512174848`): target line printed; `required features` returned `200` in 765 ms; `extension config` returned `404` in 339 ms; `web search` returned `401 AUTH_INVALID` in 113 ms; `web crawl` returned `401 AUTH_INVALID` in 111 ms. Re-run `ANYCAP_INSTALL_ID=<fresh-install-id> pnpm smoke:server -- --base-url https://api.anycap.ai` after deploy/dconf.
- [ ] Latest launch audit (2026-05-12, install ID `prod-audit-20260512175617`): release artifacts and required features pass; blockers are production `/v1/extension/config` deploy, anonymous web auth deploy, live privacy page body returning a Next.js 404 fallback, deployed abuse-control acknowledgement, approved real-mode E2E, internal dogfood acknowledgement, P90 latency acknowledgement, and recorded YouTube demo URL. Do not pass `--abuse-control-passed` until the local dual-bucket middleware or equivalent gateway install-ID rotation controls are deployed and verified.
- [ ] Privacy page live at `https://anycap.ai/privacy/extension` — local web source now explicitly registers the route, IA entry, and breadcrumb JSON-LD, pins web builds with `web/.node-version`, and a Node 22.16.0 web production build lists `/privacy/extension`; production currently still returns HTTP 200 with Next.js 404 fallback content until web deploy
- [x] OAuth `anycap-chrome-extension` client has the extension's redirect URI registered (used only when login UI lands)

## Store submission

- [ ] Upload `releases/anycap-extension-0.2.0-chrome.zip` to CWS
- [x] Submission guide: see `store-assets/cws-submission.md` — verified by `pnpm verify:release`
- [x] Description: see `store-assets/description.md` — refreshed to mirror v0.2 features
- [x] 4 screenshots (1280×800) + 2 promo assets — regenerated with `pnpm render:cws` and verified by `pnpm verify:release`
- [x] Icon (16×16, 48×48, 128×128) — verified inside release zip
- [x] Demo video source MP4 — `store-assets/demo.mp4` generated by `pnpm render:demo` (72s, H.264, 1280×720, yuv420p), verified by `pnpm verify:release`, and covers the 6 capability tabs + 7 right-click menus
- [ ] Demo video YouTube upload — upload `store-assets/demo.mp4`, paste the URL into CWS after approval, and record the URL in `store-assets/cws-submission.md` so `pnpm launch:audit` can pass
- [ ] Privacy policy URL: `https://anycap.ai/privacy/extension` — must return the extension privacy page body, not the current Next.js 404 fallback
- [x] Permission justifications: see `store-assets/permission-justifications.md` — verified against manifest permissions
- [x] Launch evidence template: see `store-assets/launch-evidence.md` — verified by `pnpm verify:release`; values remain pending until dogfood and latency evidence exist
- [ ] Submit for review — only after the anonymous abuse-control gate, production smoke, approved real-mode E2E, internal dogfood, P90 latency check, final launch audit, and YouTube demo upload are complete

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
