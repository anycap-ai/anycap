# Next steps to make AnyCap Chrome truly production-ready

> **State as of v0.2.0 refresh (2026-05-11):** The extension side-panel package is
> code-complete for the v0.2 capability surface, with image/video/music/search/crawl,
> first-run onboarding, clearer failure UX, anonymous install-id headers, and a
> refreshed CWS-ready zip. The server now has a Postgres-backed anonymous trial
> budget for persistent runtime modes. Unit/type/release gates pass, and demo E2E
> previously passed in a headed Chromium run; all headed Playwright scripts are
> now guarded by `ANYCAP_ALLOW_HEADED_E2E=1`. Public launch is still blocked by
> production deployment of the local anonymous public-trial abuse controls,
> production smoke, real-mode
> staging/prod verification, YouTube/CWS submission, and dogfood.

The list is grouped by **blocking** (must do before public install) and **important**
(do before scaling beyond a closed beta). Each item names the file or surface to touch
and the rough effort.

---

## A. Blocking — required before public install

### A1. Deploy current server extension support to production
**Where:** this repo, server deploy branches · effort: 30 min (CI merge) + soak.
The server code now supports hybrid authenticated/anonymous extension traffic for
image, video, music, web search, and web crawl. Anonymous extension requests use
`X-Anycap-Source: chrome-extension` and `X-Anycap-Install-Id`, become
`anon:<install-id>` principals, skip normal credit consume, and are limited by
install ID with Postgres persistence in dev/prod/integration runtime modes. Until
these changes are deployed, the real release package can still return
`401`/`403`/`503` for anonymous users.

The local server now uses a dual anonymous trial budget: the normalized install ID
bucket plus a hashed TCP remote-address client bucket. This blocks install-ID
rotation and ignores spoofed `X-Forwarded-For` values in local integration tests.
Public rollout still needs the current server deployed before anonymous media
generation is enabled in production.

Local server readiness is covered by targeted Go tests for `internal/transport/http`,
`internal/middleware`, and the image/video/music/web application packages. These
tests pass locally; production still fails because the deployed server does not
yet expose the new extension config route or anonymous web auth path.

Use `docs/PRODUCTION-LAUNCH-RUNBOOK.md` for the exact deploy, dconf, smoke,
real-mode E2E acknowledgement, CWS upload, and rollback sequence.

Latest browser-free production smoke on 2026-05-11 with install ID
`codex-smoke-20260511-delivery-audit` still fails before media generation:
`/v1/features` returns the required feature flags as enabled, but
`/v1/extension/config` returns `404`, while
`/v1/web/search` and `/v1/web/crawl` return `401 AUTH_INVALID` without a bearer
token.

Latest `pnpm launch:audit` on 2026-05-11 with install ID
`codex-audit-20260511-delivery-audit` confirms release artifacts and required features,
then reports five automated blockers: production `/v1/extension/config` deploy,
anonymous web auth deploy, the live privacy URL returning HTTP 200 with a Next.js
404 fallback body, deployed abuse-control acknowledgement, and approved
real-mode E2E. The local web source now registers `/privacy/extension` in SEO
routes and IA, includes breadcrumb JSON-LD, pins builds with `web/.node-version`,
and builds under Node 22.16.0; production
still needs a web deploy before the live URL can pass. `launch:audit` now checks
the privacy page body instead of trusting HEAD-only status and requires
`--abuse-control-passed` before the final CWS upload gate can turn green.

**Verify after deploy:**
```bash
cd extension
ANYCAP_INSTALL_ID=<fresh-install-id> ANYCAP_API_BASE=https://api.anycap.ai pnpm smoke:server
# expect all checks ok, not 401/403/503

# Final browser-free CWS upload gate after abuse control is deployed
# and approved real E2E has passed:
ANYCAP_INSTALL_ID=<fresh-install-id> ANYCAP_API_BASE=https://api.anycap.ai pnpm launch:audit -- --abuse-control-passed --real-e2e-passed

# Optional provider-costing media-only smoke:
ANYCAP_INSTALL_ID=<fresh-install-id> ANYCAP_API_BASE=https://api.anycap.ai pnpm smoke:server -- --include-media
```

### A2. Deploy anonymous public-trial abuse-control gate
**Where:** server middleware or gateway/WAF · effort: included in server deploy.
The local server-side control is implemented in `internal/middleware/anon_rate_limit.go`.
Each anonymous extension request now consumes the normalized install-ID bucket and
a hashed TCP remote-address client bucket. This keeps the existing 3-run launch
trial but also blocks install-ID rotation from the same network peer. The code
does not trust client-supplied `X-Forwarded-For`; the spoofing regression is
covered by integration tests.

Do not pass `--abuse-control-passed` until this server code is deployed to the
target environment, or an equivalent gateway/WAF rule is active and recorded in
the launch notes.

### A3. Configure production feature rollout for anonymous extension users
**Where:** dconf `feature_access` and `rate_limit` · effort: 30 min.
Feature flags are still enforced after anonymous auth. Set rollout rules for
`image.generate`, `video.generate`, `music.generate`, `web.search`, and `web.crawl`
to allow the intended anonymous extension audience, then set explicit RPM values
instead of relying on `default_rpm`.

Use these launch-slice examples as the merge source for production dconf:

- `configs/server/dconf/chrome_extension_launch.feature_access.example.json`
- `configs/server/dconf/chrome_extension_launch.rate_limit.example.json`

Anonymous extension principals do not have an email, so these five public trial
features must use `rollout=all`; `rollout=groups` only works for authenticated
users with an email.

### A4. Real-mode E2E against staging
**Where:** `tests/e2e/real-flow.spec.ts` · effort: 1 hour to wire into CI after staging is ready.
A gated real-mode smoke spec now exists for anonymous image variation,
image-from-text, and crawl. Run it manually against staging after A1/A2/A3, then wire
it into nightly CI once the staging endpoint and dconf rollout are stable:

```bash
ANYCAP_ALLOW_HEADED_E2E=1 WXT_API_BASE=https://api-staging.anycap.ai pnpm e2e:real
```

Treat A4 as done only after this command is run green against the target
environment. The spec intentionally opens headed Chromium because MV3 extension
E2E cannot run headless; without `ANYCAP_ALLOW_HEADED_E2E=1`, the script exits
before opening a browser window.

### A5. Demo video (60–120s)
**Where:** `store-assets/demo.mp4` + YouTube upload · effort: approval/upload.
The local source video now exists: `pnpm render:demo` creates a 72s H.264
1280×720 MP4 without opening a visible browser window. CWS still needs the
approved YouTube upload URL. Script:
1. (5s) Right-click an image → "Generate variation with AnyCap" → side panel opens
2. (15s) Generate video tab — paste prompt → click → preview plays
3. (15s) Crawl this page → markdown drops in
4. (10s) History grid → click thumbnail → form rehydrated
5. (5s) Settings — anonymous quota, default models

Tools: `pnpm render:cws` refreshes static CWS stills, and `pnpm render:demo`
creates the local video source without opening a visible browser. For a narrated
human screencast later, record an approved headed extension run with `ffmpeg` or
a screen-cap tool like Cleanshot.

### A6. CWS submission form filled and submitted
**Where:** [Chrome Web Store dashboard](https://chrome.google.com/webstore/devconsole/) · effort: half-day.
- Upload `releases/anycap-extension-0.2.0-chrome.zip`
- Use `store-assets/cws-submission.md` as the form checklist
- Paste copy from `store-assets/description.md`
- Upload all 6 PNGs from `store-assets/cws/`
- Paste permission justifications from `LAUNCH_CHECKLIST.md`
- Privacy policy URL: <https://anycap.ai/privacy/extension> must pass the
  `launch:audit` body check; production currently returns a Next.js 404 fallback
  until the web route is published/fixed.
- Submit only after anonymous abuse control, production smoke, approved real-mode
  E2E, live privacy page, final audit, and YouTube demo upload are complete.
  Review takes 1–10 days.

### A7. Dogfood: 5 people × 2 working days
Pick 5 people across (1 marketing, 1 design, 1 dev, 2 random users). Have them
install the v0.2.0 zip, give them 5 capability-specific tasks, watch where they
get stuck. **What to instrument:** Sentry breadcrumbs (see B1) — or just a shared
Notion page.

---

## B. Important — before opening to >100 users

### B1. Error reporting (Sentry / our own logger)
**Where:** new `src/lib/telemetry.ts`, wire from `api.ts` and tab error boundaries · effort: 1 day.
Right now if a generation fails the user sees "Something went wrong" and we have
no idea. Add Sentry (or equivalent) with:
- Stack traces from React error boundaries
- HTTP errors with status + `X-Request-ID` header
- Mock-mode disabled (don't send picsum failures)
- User-controllable: a "Send error reports" toggle in Settings tab (already has the slot)

### B2. OAuth login UI re-enabled
**Where:** `entrypoints/sidepanel/tabs/SettingsTab.tsx`, currently hidden · effort: 2 days.
Code exists at `src/lib/auth.ts` but UI is hidden behind `false`. Required for:
- Cross-device history sync (today it's `chrome.storage.local`, browser-local)
- Drive save (already wired, but unauthenticated users can't use it)
- Higher quota / Pro tier

Validate the OAuth callback URL works inside the side-panel context (it didn't in
v0.1 — `chrome.identity.launchWebAuthFlow` requires popup, not panel).

### B3. Auto-update for sideloaded installs
**Where:** new `update.xml` hosted at `anycap.ai/extension/update.xml` · effort: half-day.
Side-loaded extensions don't auto-update. CWS does. **Until** we're on CWS, host
an `update.xml` that points to the latest release zip and add `update_url` in the
manifest. After CWS approval, drop this — Chrome takes over.

### B4. i18n — at minimum, en + zh
**Where:** new `entrypoints/sidepanel/i18n/` · effort: 2 days.
Most of our team is bilingual; many of our prospect users in China are read-Chinese-first.
Use Chrome's `chrome.i18n` (`_locales/en/messages.json`, `_locales/zh_CN/messages.json`).
Start with side-panel UI; the prompt-template chips can lazy-translate later.

### B5. Accessibility audit
**Where:** `entrypoints/sidepanel/` · status: partially implemented.
- Tab nav: every button remains reachable via `Tab`, with visible focus rings.
- Screen reader: tabs now connect to the active `tabpanel` via `aria-controls`
  and `aria-labelledby`; onboarding is an `aria-modal` dialog; thumbnail history
  buttons have explicit `aria-label` text instead of relying on `title`.
- Reduced motion: `prefers-reduced-motion` is honored in CSS.
- Remaining manual check: run an approved visible-browser screen-reader/keyboard
  pass after production smoke succeeds.

### B6. Performance budget
**Where:** `scripts/verify-release.mjs` · status: implemented.
The release verifier now fails CI if the CWS zip exceeds 200 KiB compressed or
if any `chunks/sidepanel*.js` bundle exceeds 80 KiB after gzip. The current
release zip is 128,773 bytes and the side-panel app chunk is 17,819 bytes gzip.

### B7. Completed polish from this plan
These items are already implemented in the current v0.2.0 refresh:
- First-run onboarding with persistent dismissal and Settings replay.
- Real-mode failure UX for offline, server, quota, auth, validation, and network cases.
- Durable server-side anonymous trial budget keyed by install ID.
- Privacy policy URL source aligned to `https://anycap.ai/privacy/extension`,
  including explicit SEO route registration, IA entry, and breadcrumb JSON-LD;
  production still needs to serve the page body instead of the current 404
  fallback after web deploy.
- CWS release package refreshed with minimized production host permissions.

---

## C. Strategic — after we have install + retention data

### C1. Web Store optimization (GEO + SEO)
**Where:** `store-assets/description.md` + Chrome Web Store listing · effort: ongoing.
The current description targets "image, video, music, search, crawl" — broad but
generic. After 2 weeks of installs, look at search queries that brought users in
(via the dashboard analytics) and split-test the description.

### C2. Examples gallery on the marketing site
**Where:** `web/src/app/[locale]/(seo)/extension/examples` · effort: 2 days.
A page showing 12 generations made with the extension — actual outputs, the prompt
that produced them, "try this template in AnyCap" CTA. Helps with GEO ranking and
gives the demo video a place to point.

### C3. Pro tier (real billing)
**Where:** `anycap-server/internal/application/credit/`, extension Settings tab · effort: 1 week.
Stripe checkout flow, $9/mo tier removes anonymous quota, unlocks longer durations
and higher-res models. Wire to the existing `credit` service on the server. The UI
slot is reserved in `SettingsTab.tsx`.

### C4. Discord / feedback loop
**Where:** new `entrypoints/sidepanel/components/FeedbackButton.tsx` · effort: half-day.
A "Got feedback?" button in the Settings tab footer that opens a Discord invite
in a new tab. Also email link as fallback. Cheap, valuable signal channel for v0.3.

### C5. Multi-extension auth share with Desktop
**Where:** `chrome.storage.local` ↔ Desktop's `~/.anycap/credentials` · effort: 1 week.
If the user is logged into the desktop app, the extension should pick up the same
credentials. Possible via a tiny native messaging host. Only worth doing once
both products have meaningful retention.

---

## Suggested 4-week slice

| Week | Theme | Items |
|---|---|---|
| 1 | Server side & abuse controls | A1, A2, A3 |
| 2 | Confidence | A4, A5, A7 |
| 3 | Quality bar | B1, B2, B5, B6 |
| 4 | Launch polish | B3, B4, A6 |

After CWS approval and 1k installs: pivot to **C1, C2** (analytics-driven content + Pro tier).

---

## Definition of "truly usable"

Not when **we** like it — when:

1. A new user can install from CWS in <60s (CWS approval + zero local setup)
2. Every capability returns a real generation against `api.anycap.ai` for free anonymous trials, no login required, with abuse controls active
3. A failed generation is surfaced clearly, retryable, and observable by the team
4. A user who logs in once can sync history across browsers
5. We have a Discord or email channel that catches "this is broken for me" within 24h
6. Dogfood week-2: >=3/5 testers go back unprompted in a separate session

Today (v0.2.0 refresh) we have the client and server building blocks for **(2)**,
but it is not true in production until A1/A2/A3/A4 pass. Ship A1-A7 before
treating this as public-install ready.
