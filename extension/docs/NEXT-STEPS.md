# Next steps to make AnyCap Chrome truly production-ready

> **State as of v0.2.0 (2026-04-27):** The extension ships, installs, demos every
> capability in mock mode, has 78 unit + 27 E2E tests green, and 6 CWS marketing
> assets ready. What follows is what stops it from being something we can hand to
> 1,000 strangers tomorrow.

The list is grouped by **blocking** (must do before public install) and **important**
(do before scaling beyond a closed beta). Each item names the file or surface to touch
and the rough effort.

---

## A. Blocking — required before public install

### A1. Deploy server commit `3514a828` to `deploy/server-prod`
**Where:** `anycap-server` parent monorepo · effort: 30 min (CI merge) + soak.
That commit adds the anonymous extension routes (`/v1/extension/config`, anonymous
rate-limiter on `/v1/{cap}/...` when `X-Anycap-Source: chrome-extension` is set).
Until it's live in prod, `pnpm build` (real-mode) returns `401` to anonymous users.

**Verify after deploy:**
```bash
curl -H "X-Anycap-Source: chrome-extension" \
     https://api.anycap.ai/v1/extension/config
# expect 200 with default model + trial budget JSON
```

### A2. Per-user generation budget on the server
**Where:** `anycap-server/internal/middleware/rate_limit.go` · effort: 1–2 days.
Today the extension stores `trialCount` in `chrome.storage.local` — clearable by any
user. Move trial accounting server-side keyed by anonymous install-id (already sent
in `X-Anycap-Install-ID`), so the 3-free-gen budget can't be bypassed.

### A3. Real-mode E2E against staging
**Where:** new `tests/e2e/real-flow.spec.ts` · effort: half-day.
Today our E2E is mock-only. Add one production-mode E2E that hits an
`api.anycap.ai-staging` deployment for vary + image + crawl. Run it nightly in CI;
flag if anything regresses on the server contract.

### A4. CWS submission form filled and submitted
**Where:** [Chrome Web Store dashboard](https://chrome.google.com/webstore/devconsole/) · effort: half-day.
- Upload `releases/anycap-extension-0.2.0-chrome.zip`
- Paste copy from `store-assets/description.md`
- Upload all 6 PNGs from `store-assets/cws/`
- Paste permission justifications from `LAUNCH_CHECKLIST.md`
- Privacy policy URL: <https://anycap.ai/extension/privacy>
- Submit. Review takes 1–10 days.

### A5. Privacy policy page lands
**Where:** `web/src/app/[locale]/(seo)/extension/privacy/page.tsx` · effort: half-day.
A stub already exists. Make it match what the extension actually does: anonymous
install-id only, no PII collected, generated assets stored in user's Drive only if
they're logged in, mock-mode does no network calls at all. Privacy is what blocks
many CWS reviewers — make it concrete and short.

### A6. Demo video (60–120s)
**Where:** new `store-assets/demo.mp4` · effort: half-day.
CWS's "promotional video" slot massively boosts install rate. Script:
1. (5s) Right-click an image → "Generate variation with AnyCap" → side panel opens
2. (15s) Generate video tab — paste prompt → click → preview plays
3. (15s) Crawl this page → markdown drops in
4. (10s) History grid → click thumbnail → form rehydrated
5. (5s) Settings — anonymous quota, default models

Tools: `tests/e2e/cws-shots.spec.ts` already drives the side panel — extend to
record an MP4 with `ffmpeg` (skill `ffmpeg-ops`) or use a screen-cap tool like
Cleanshot.

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

### B3. First-run onboarding
**Where:** new `entrypoints/sidepanel/components/OnboardingOverlay.tsx` · effort: 1 day.
First time the side panel opens, show a 3-step coachmark:
1. "Right-click any image to vary it" → arrow at the page
2. "Use the tabs to switch capability"
3. "Click a history thumbnail to reuse the form"

Hide after first dismissal (`chrome.storage.local: onboardingCompleted=true`).

### B4. Auto-update for sideloaded installs
**Where:** new `update.xml` hosted at `anycap.ai/extension/update.xml` · effort: half-day.
Side-loaded extensions don't auto-update. CWS does. **Until** we're on CWS, host
an `update.xml` that points to the latest release zip and add `update_url` in the
manifest. After CWS approval, drop this — Chrome takes over.

### B5. i18n — at minimum, en + zh
**Where:** new `entrypoints/sidepanel/i18n/` · effort: 2 days.
Most of our team is bilingual; many of our prospect users in China are read-Chinese-first.
Use Chrome's `chrome.i18n` (`_locales/en/messages.json`, `_locales/zh_CN/messages.json`).
Start with side-panel UI; the prompt-template chips can lazy-translate later.

### B6. Accessibility audit
**Where:** `entrypoints/sidepanel/` · effort: 1 day.
- Tab nav: every button reachable via `Tab`, focus ring visible (probably is — confirm)
- Screen reader: each tab has `aria-label`, `role="tab"` (✅ already), `aria-selected`
- Color contrast: olive #5C7C4F on cream #F5F0E6 — verify ≥4.5:1 with axe
- Reduced motion: respect `prefers-reduced-motion` (already a Settings toggle, also honor system)

### B7. Performance budget
**Where:** `wxt.config.ts` build flags · effort: 2 hours.
Bundle is 345 KB today. Set a budget:
- `chunks/sidepanel-*.js` ≤ 80 KB gzipped
- Total ≤ 200 KB gzipped
Wire to CI: fail if exceeded. WXT supports rolldown; size is mostly React + lucide.

### B8. Real-mode failure UX
When the server is down or the user's network is offline, today we show "Generation
failed: Failed to fetch". Replace with:
- Detect `navigator.onLine === false` → "You're offline. Try again when reconnected."
- HTTP 5xx → "AnyCap servers are having a moment. Try again in 30s." with retry button
- HTTP 401 → "Login required" → links to OAuth (when B2 lands)
- Mock mode: silent (dev tool only)

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
| 1 | Server side & CWS | A1, A2, A4, A5 |
| 2 | Confidence | A3, A6, A7 (dogfood) |
| 3 | Quality bar | B1, B2, B6, B8 |
| 4 | First-run polish | B3, B5, store launch |

After CWS approval and 1k installs: pivot to **C1, C2** (analytics-driven content + Pro tier).

---

## Definition of "truly usable"

Not when **we** like it — when:

1. ✅ A new user can install from CWS in <60s (CWS approval + zero local setup)
2. ✅ Every capability returns a real generation against `api.anycap.ai` for 3 free trials, no login required
3. ✅ A failed generation is surfaced clearly, retryable, and we get a stack trace
4. ✅ A user who logs in once can sync history across browsers
5. ✅ We have a Discord or email channel that catches "this is broken for me" within 24h
6. ✅ Dogfood week-2: ≥3/5 testers go back unprompted in a separate session

Today (v0.2.0) we have **(2)** in mock and the building blocks for the rest. Ship A1–A7 in two weeks and we cross the line.
