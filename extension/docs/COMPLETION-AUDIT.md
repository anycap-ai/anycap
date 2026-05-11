# AnyCap Chrome Extension Completion Audit

Last updated: 2026-05-11.

Objective: complete AnyCap Chrome extension development through delivery of a
production-ready Chrome Web Store release.

This audit separates local release readiness from true production completion.
The extension package is locally ready for deployment and CWS upload, but the
overall objective is not complete until the server, production smoke, dogfood,
latency, real E2E, and CWS submission gates pass.

## Success Criteria

| Requirement | Evidence | Status |
|---|---|---|
| MV3 side-panel extension implements the v0.2 surface | `entrypoints/sidepanel/App.tsx`; 7 tabs: Vary, Image, Video, Music, Search, Crawl, Settings | Done |
| Right-click browser workflows exist | `entrypoints/background.ts`; checklist covers 7 context menus | Done, final manual smoke pending |
| Anonymous extension calls include install identity | `src/lib/api.ts`; `src/lib/storage.ts`; unit tests in `tests/unit/api.test.ts` and `tests/unit/storage.test.ts` | Done |
| Production manifest has minimized permissions | `pnpm verify:release`; manifest host permissions limited to `https://api.anycap.ai/*` and `https://anycap.ai/*`; `identity` optional | Done |
| CWS zip is freshly buildable | `pnpm preflight:local` rebuilt the release zip on 2026-05-11 | Done |
| CWS zip copied into `releases/` and byte-matches WXT output | `shasum -a 256 .output/anycap-extension-0.2.0-chrome.zip releases/anycap-extension-0.2.0-chrome.zip` matched | Done |
| Current CWS zip hash checked | `.output` and `releases` zip SHA-256 values match after `pnpm preflight:local`; latest build-run-specific hash is `b0831537f71a83c495712138e90d8d8be92b96de3db4d2fce9ee7f6f2b100c69`; `pnpm release` syncs the hash into `store-assets/cws-submission.md` and this audit; record again immediately before CWS upload | Done |
| Release verifier covers package, assets, listing, launch UI copy, submission, launch dconf, runbook | `pnpm verify:release` passed; verifier checks CWS zip, runtime manifest entrypoints and referenced files, content script `file://` exclusion, release zip/side-panel performance budgets, side-panel accessibility semantics and color contrast, assets, demo MP4 metadata, permission copy, CWS listing and screenshot composer copy including hidden sign-in quota and production trial-reset claims, README/load-use/changelog release-doc consistency, CWS submission guide including demo-video YouTube instructions, launch evidence template fields, headless renderers, Chrome extension launch dconf examples, production launch runbook, visible Chrome approval docs, anonymous-launch UI source and packed zip copy that reject hidden sign-in quota promises and production trial-reset controls, and all package scripts that invoke Playwright requiring the headed-E2E approval guard | Done |
| Unit/type checks pass | `pnpm test` passed after launch-evidence final-gate hardening: 24 files / 188 tests; `npx tsc --noEmit` and `pnpm verify:release` pass | Done |
| CI extension gate is browser-free | `.gitlab-ci.yml` parses successfully and `build:extension` runs `pnpm preflight:local`; release verifier rejects preflight scripts containing headed browser commands | Done |
| CWS screenshots and promo assets exist and are current | `pnpm render:cws` passed; 4 screenshots + 2 promo assets regenerated with headless Chromium | Done |
| Demo video source exists and covers v0.2 workflows | `pnpm render:demo` passed; `store-assets/demo.mp4` is 72s H.264 1280×720 yuv420p, verified by `pnpm verify:release`, and covers 6 capability tabs plus 7 right-click menus | Done |
| CWS listing and launch UI copy are ready | `store-assets/description.md`; `store-assets/permission-justifications.md`; `store-assets/cws-submission.md`; side-panel/options/error copy verified by `pnpm verify:release`; listing copy now says `3 anonymous capability runs / month`, production UI says `3 anonymous launch runs`, demo trial reset is hidden outside mock mode, and verifier rejects unavailable sign-in quota promises plus trial-reset claims in CWS listing/screenshot copy | Done |
| Server code supports anonymous extension traffic | Local server code and tests cover anonymous image/video/music/web routes, extension config, and durable install-ID plus remote-address client trial buckets | Done locally |
| Anonymous install IDs are sanitized before use | `NormalizeChromeExtensionInstallID` trims and accepts only 1-128 characters from `[A-Za-z0-9_-]`; auth and anonymous trial rate limit middleware both use it; middleware/router/integration and full Go tests pass | Done locally |
| Anonymous public-trial abuse controls resist install-ID rotation | `AnonRateLimit` now consumes both the normalized install-ID bucket and a hashed TCP remote-address client bucket; integration tests verify rotating install IDs and spoofed `X-Forwarded-For` values are blocked locally | Done locally, production deploy pending |
| Chrome extension launch dconf examples are deploy-ready | `jq empty` passes for launch feature/rate examples; both include `image.generate`, `video.generate`, `music.generate`, `web.search`, and `web.crawl`; `pnpm verify:release` validates rollout/RPM shape | Done |
| Current server support is deployed to production | Production `/v1/extension/config` returns `404` | Blocked |
| Production dconf/rate-limit allow anonymous extension operations | Required feature flags are enabled in `/v1/features`, but deployed anonymous route/auth behavior is missing | Blocked pending deploy/config confirmation |
| Browser-free production smoke passes | 2026-05-11 smoke with `codex-smoke-20260511-after-contrast` failed: extension config `404`, web search/crawl `401 AUTH_INVALID` | Blocked |
| Extension privacy web route is buildable | Local web source explicitly registers `/privacy/extension` in SEO route definitions and IA, includes breadcrumb JSON-LD, pins web builds to Node 22.16.0 with `web/.node-version`, and Node 22.16.0 `pnpm --dir web run build` lists `/privacy/extension` and `/[locale]/privacy/extension` | Done locally, production deploy pending |
| Real-mode E2E against production passes | `pnpm e2e:real` is guarded by `ANYCAP_ALLOW_HEADED_E2E=1` and intentionally not run without explicit approval because it opens headed Chromium | Blocked by approval and production deploy |
| Internal dogfood is complete | `pnpm launch:audit` now requires `--dogfood-passed` and matching `store-assets/launch-evidence.md` fields after 5 people dogfood for 2 working days with zero P0 bugs | Blocked |
| P90 generation latency is acceptable | `pnpm launch:audit` now requires `--latency-passed` and matching `store-assets/launch-evidence.md` fields after deployed-server metrics confirm P90 generation latency is under 15 seconds | Blocked |
| Visible browser operations are approval-gated | Headed Playwright package scripts require `scripts/confirm-headed-e2e.mjs`; manual install/demo/smoke docs state visible Chrome UI requires explicit approval; `pnpm verify:release` validates both guard paths | Done |
| YouTube demo URL is recorded for CWS | `pnpm launch:audit` now fails until `store-assets/cws-submission.md` contains a real YouTube URL for `store-assets/demo.mp4` | Blocked pending upload |
| Final launch audit can pass before CWS upload | `pnpm launch:audit` failed again on 2026-05-11 with `codex-audit-20260511-manual-gates`; it catches the live privacy URL's Next.js 404 fallback body and now requires `--abuse-control-passed`, `--real-e2e-passed`, `--dogfood-passed`, `--latency-passed`, matching launch evidence, and a recorded YouTube demo URL before it can turn green | Blocked |
| CWS package uploaded and submitted | No upload performed without explicit approval | Blocked |
| Local credentials can perform remaining web/store upload gates | `gh auth status` reports no GitHub login; `pnpm --dir web exec wrangler whoami` reports unauthenticated; GitHub SSH access is denied; no CWS/Google/YouTube/Cloudflare upload tokens are present in the environment | Blocked |

## Fresh Verification

Terminal-only commands run on 2026-05-10 and 2026-05-11:

```bash
cd extension
pnpm render:cws
pnpm render:demo
ffprobe -hide_banner -v error -select_streams v:0 -show_entries stream=codec_name,width,height,pix_fmt,duration -show_entries format=duration,size -of json store-assets/demo.mp4
pnpm release
shasum -a 256 .output/anycap-extension-0.2.0-chrome.zip releases/anycap-extension-0.2.0-chrome.zip
pnpm verify:release
pnpm preflight:local
npx tsc --noEmit
pnpm test
pnpm test -- launch-audit.test.ts
pnpm e2e
pnpm e2e:demo
pnpm shots:feishu
pnpm e2e:real
cd ..
git diff --check
ruby -e "require 'yaml'; YAML.load_file('.gitlab-ci.yml'); puts 'gitlab ci yaml ok'"
jq empty configs/server/dconf/chrome_extension_launch.feature_access.example.json configs/server/dconf/chrome_extension_launch.rate_limit.example.json configs/server/dconf/feature_access.example.json configs/server/dconf/rate_limit.example.json
node -e "const fs=require('fs'); const fa=JSON.parse(fs.readFileSync('configs/server/dconf/chrome_extension_launch.feature_access.example.json','utf8')); const rl=JSON.parse(fs.readFileSync('configs/server/dconf/chrome_extension_launch.rate_limit.example.json','utf8')); const ops=['image.generate','video.generate','music.generate','web.search','web.crawl']; for (const op of ops) { if (!fa.features?.[op]?.enabled || fa.features?.[op]?.rollout !== 'all') throw new Error('feature_access missing rollout all for '+op); if (!(rl.capabilities?.[op] > 0)) throw new Error('rate_limit missing positive rpm for '+op); } console.log('chrome extension launch dconf examples ok:', ops.join(', '));"
GOSUMDB=sum.golang.org GOTOOLCHAIN=go1.25.0 go test ./...
GOSUMDB=sum.golang.org GOTOOLCHAIN=go1.25.0 go test ./internal/middleware ./internal/infrastructure/postgres ./test/integration -run 'TestNormalizeChromeExtensionInstallID|TestAnonymousTrialRepo|TestAnonRateLimit' -count=1
GOSUMDB=sum.golang.org GOTOOLCHAIN=go1.25.0 go test ./internal/middleware ./internal/app ./internal/transport/http ./internal/application/image ./internal/application/video ./internal/application/music ./internal/application/web ./internal/infrastructure/postgres ./test/integration -count=1
pnpm --dir web run check:seo-ia
pnpm --dir web run check:seo-breadcrumbs
pnpm --dir web run check:seo-locale-rollout
pnpm --dir web run check:edge-runtime
npx -y -p node@22.16.0 -p pnpm@10.33.0 pnpm --dir web run build
cd extension
pnpm smoke:server -- --install-id codex-smoke-20260511-after-contrast --base-url https://api.anycap.ai
pnpm launch:audit -- --install-id codex-audit-20260511-manual-gates --base-url https://api.anycap.ai
```

Results:

- `pnpm render:cws`: passed; regenerated all 6 CWS PNG assets without a visible browser window.
- `pnpm release`: passed; rebuilt `releases/anycap-extension-0.2.0-chrome.zip`.
- SHA-256: `.output` and `releases` zip hashes matched after rebuild at `b0831537f71a83c495712138e90d8d8be92b96de3db4d2fce9ee7f6f2b100c69`; record the build-run-specific value again immediately before CWS upload.
- `pnpm verify:release`: passed.
- `pnpm verify:release`: passed again on 2026-05-11 after browser-approval documentation updates.
- `pnpm preflight:local`: passed after launch-evidence final-gate hardening; browser-free local gate rebuilt the release zip, synced the current SHA-256 into launch docs, then ran unit tests, type check, and release verifier.
- `npx tsc --noEmit`: passed.
- `pnpm render:demo`: passed; generated `store-assets/demo.mp4`.
- `ffprobe store-assets/demo.mp4`: H.264, 1280×720, yuv420p, 72s.
- `pnpm test`: passed after launch-evidence final-gate hardening, 24 files / 188 tests.
- `pnpm test -- release-verify.test.ts`: passed after side-panel color-contrast guard hardening, 24 files / 188 tests.
- `pnpm test -- launch-audit.test.ts`: passed after adding the dogfood/latency launch-evidence blocker and deterministic stdout output checks; latest full browser-free preflight test run is 24 files / 188 tests.
- `pnpm test -- server-smoke.test.ts`: passed after changing `--include-media` to media-only anonymous smoke so it stays within the 3-run launch trial; latest full browser-free preflight test run is 24 files / 188 tests.
- `pnpm test -- release-verify.test.ts confirm-headed-e2e.test.ts`: passed after the all-Playwright-script approval guard update; latest full browser-free preflight test run is 24 files / 188 tests.
- `pnpm e2e`, `pnpm e2e:demo`, `pnpm shots:feishu`, and `pnpm e2e:real` without `ANYCAP_ALLOW_HEADED_E2E=1`: each blocked before `pnpm build`, `pnpm demo`, or Playwright with `headed E2E blocked`.
- `git diff --check`: passed again after the release hash-sync and verification-documentation updates.
- `.gitlab-ci.yml`: parsed successfully, and `build:extension` runs `pnpm preflight:local`.
- Chrome extension launch dconf examples: JSON parsed successfully and the explicit Node assertion confirmed `image.generate`, `video.generate`, `music.generate`, `web.search`, and `web.crawl` are `rollout=all` in feature access and have positive RPMs in rate limit.
- `GOSUMDB=sum.golang.org GOTOOLCHAIN=go1.25.0 go test ./...`: passed again on 2026-05-11 after the dual-bucket anonymous trial middleware and release hash-sync documentation updates.
- Install ID sanitizer tests passed on 2026-05-11 for middleware, router, and integration coverage.
- Targeted anonymous extension server readiness tests also passed on 2026-05-11 for `internal/transport/http`, `internal/middleware`, image/video/music/web application packages, Postgres anonymous trial storage, and integration tests. The latest anonymous abuse-control target run used `GOSUMDB=sum.golang.org GOTOOLCHAIN=go1.25.0 go test ./internal/middleware ./internal/infrastructure/postgres ./test/integration -run 'TestNormalizeChromeExtensionInstallID|TestAnonymousTrialRepo|TestAnonRateLimit' -count=1`; the wider server package run used `GOSUMDB=sum.golang.org GOTOOLCHAIN=go1.25.0 go test ./internal/middleware ./internal/app ./internal/transport/http ./internal/application/image ./internal/application/video ./internal/application/music ./internal/application/web ./internal/infrastructure/postgres ./test/integration -count=1`.
- `pnpm --dir web run check:seo-ia`: initially failed for missing `/privacy/extension` IA entry, then passed after adding the IA node.
- `pnpm --dir web run check:seo-breadcrumbs`: initially failed because `src/app/(seo)/privacy/extension/page.tsx` lacked breadcrumb coverage, then passed after adding `BreadcrumbJsonLd`.
- `pnpm --dir web run check:seo-locale-rollout` and `pnpm --dir web run check:edge-runtime`: passed.
- `npx -y -p node@22.16.0 -p pnpm@10.33.0 pnpm --dir web run build`: passed again and listed `/privacy/extension` plus `/[locale]/privacy/extension`; `web/.node-version` pins Cloudflare/local builds to the same Node major/minor. The same build under local Node 24.14.1 still fails in Next page-data collection with `SIGSEGV`, which appears local toolchain-specific after Node 22.16.0 passes.
- `pnpm smoke:server -- --base-url https://api.anycap.ai`: failed as expected before production deploy.
- `pnpm launch:audit -- --base-url https://api.anycap.ai --install-id codex-audit-20260511-manual-gates`: printed target context, caught the live privacy URL returning HTTP 200 with a Next.js 404 fallback body, then failed as expected before production deploy, deployed abuse-control acknowledgement, real E2E, dogfood, latency, and YouTube demo upload.
- Local credential audit: `gh auth status` reports no GitHub login;
  `pnpm --dir web exec wrangler whoami` reports unauthenticated; `ssh -T
  git@github.com` returns `Permission denied (publickey)`; `env | rg
  '^(CHROME|CWS|GOOGLE|YOUTUBE|CLOUDFLARE|CF_|WRANGLER|GITHUB|GH_)'` only finds
  `GH_PAGER=cat`; and `git remote -v` shows only the GitLab `origin` remote.

Production failures observed:

```text
server smoke: ok target - base-url=https://api.anycap.ai install-id=codex-smoke-20260511-after-contrast
server smoke: fail extension config (404)
server smoke: fail web search (401) AUTH_INVALID - missing or invalid bearer token
server smoke: ok required features (200)
server smoke: fail web crawl (401) AUTH_INVALID - missing or invalid bearer token
```

```text
launch audit: ok target - base-url=https://api.anycap.ai install-id=codex-audit-20260511-manual-gates
launch audit: ok release artifacts - pnpm verify:release passed
launch audit: ok prod smoke: required features - 200
launch audit: fail prod smoke: extension config - 404
launch audit: fail prod smoke: web search - 401 - AUTH_INVALID - missing or invalid bearer token
launch audit: fail prod smoke: web crawl - 401 - AUTH_INVALID - missing or invalid bearer token
launch audit: fail privacy policy - 200 - PRIVACY_NOT_FOUND - privacy policy page returned a Next.js 404 fallback
launch audit: fail anonymous abuse-control - not acknowledged
launch audit: fail YouTube demo video - missing
launch audit: fail internal dogfood - not acknowledged
launch audit: fail P90 generation latency - not acknowledged
launch audit: blocker Deploy current server changes to production so /v1/extension/config exists.
launch audit: blocker Deploy anonymous Chrome extension auth for /v1/web/search and /v1/web/crawl.
launch audit: blocker Fix Chrome Web Store privacy policy URL https://anycap.ai/privacy/extension: 200 - PRIVACY_NOT_FOUND - privacy policy page returned a Next.js 404 fallback
launch audit: blocker Confirm anonymous public-trial abuse control is deployed before CWS upload; pass --abuse-control-passed only after the dual-bucket server middleware or equivalent gateway controls limit install-ID rotation.
launch audit: blocker Upload store-assets/demo.mp4 to YouTube and add the YouTube URL to store-assets/cws-submission.md before CWS upload.
launch audit: blocker Complete internal dogfood with 5 people for 2 working days and zero P0 bugs before CWS upload; pass --dogfood-passed only after it is recorded.
launch audit: blocker Confirm P90 generation latency is under 15s on the deployed server before CWS upload; pass --latency-passed only after metrics confirm it.
launch audit: blocker Run approved real-mode E2E with ANYCAP_ALLOW_HEADED_E2E=1 WXT_API_BASE=https://api.anycap.ai pnpm e2e:real after production smoke passes; it opens headed Chromium.
```

## Remaining Work

These are the remaining gates before the objective can be marked complete:

1. Deploy the reviewed server changes to `deploy/server-dev`, validate, then deploy to `deploy/server-prod`.
2. Deploy the local dual-bucket anonymous trial middleware, or externally configure an equivalent gateway rule, so the production abuse-control gate cannot be bypassed by rotating `X-Anycap-Install-Id`.
3. Confirm production `feature_access` and `rate_limit` dconf for `image.generate`, `video.generate`, `music.generate`, `web.search`, and `web.crawl`.
4. Deploy the web changes so `https://anycap.ai/privacy/extension` returns the extension privacy page body, not the current production Next.js 404 fallback.
5. Rerun browser-free production smoke until `/v1/extension/config`, `/v1/web/search`, and `/v1/web/crawl` return `200`.
6. With explicit approval, run `ANYCAP_ALLOW_HEADED_E2E=1 WXT_API_BASE=https://api.anycap.ai pnpm e2e:real`.
7. Rerun `pnpm launch:audit -- --base-url https://api.anycap.ai --abuse-control-passed --real-e2e-passed --dogfood-passed --latency-passed` only after the anonymous abuse-control gate is actually deployed, the approved real-mode E2E is green, dogfood is complete, P90 latency is under 15 seconds, and the YouTube demo URL is recorded in `store-assets/cws-submission.md`.
8. Authenticate the local machine or provide another approved release operator
   for GitHub/Cloudflare, YouTube, and Chrome Web Store upload steps.
9. Upload `store-assets/demo.mp4` to YouTube after approval and record the URL in `store-assets/cws-submission.md`.
10. Upload `releases/anycap-extension-0.2.0-chrome.zip` to Chrome Web Store using `store-assets/cws-submission.md`.

## Decision

Do not mark the goal complete yet. The local Chrome extension package, assets,
tests, verifier, and runbook are ready. Production is still blocked by anonymous
public-trial abuse controls, undeployed server support, live privacy page content,
failed production smoke, unrun real-mode E2E, and CWS submission.
