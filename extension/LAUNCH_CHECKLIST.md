# AnyCap Chrome Extension v0.1 — Launch Checklist

Run through in order. Each item must pass before submitting to Chrome Web Store.

## Pre-submit

- [ ] `pnpm build` produces a clean `.output/chrome-mv3/`
- [ ] All unit tests pass (`pnpm test`)
- [ ] All E2E tests pass (`pnpm e2e`)
- [ ] Manual smoke: Gmail / Twitter / Xiaohongshu-web each work
- [ ] Internal dogfood (5 people, 2 days, zero P0 bugs)
- [ ] P90 generation latency < 15 s on dev server
- [ ] Privacy page live at https://anycap.ai/privacy/extension
- [ ] Auth0 `anycap-chrome-extension` client has the extension's redirect URI registered
- [ ] Server deployed with watermark param + anon rate limit + `/v1/extension/config`

## Store submission

- [ ] Zip `.output/chrome-mv3/` → upload to CWS
- [ ] Description (from `store-assets/description.md`)
- [ ] 4 screenshots (1280×800)
- [ ] Icon (128×128)
- [ ] Demo video (YouTube link from `store-assets/demo.mp4`)
- [ ] Privacy policy URL: https://anycap.ai/privacy/extension
- [ ] Permission justifications:
  - `contextMenus`: "Show 'Generate variation' menu on right-clicked images"
  - `activeTab`: "Read only the image you right-clicked; nothing else"
  - `storage`: "Save your trial count and auth token locally"
  - `identity`: "Sign you into your AnyCap account"
  - `downloads`: "Save generated images to your computer"
- [ ] Submit for review

## Post-submit (while waiting 3–7 days)

- [ ] Write Product Hunt launch post
- [ ] Write 即刻 / 少数派 / V2EX 介绍帖
- [ ] Record 2-minute B 站 tutorial
- [ ] Prep launch tweet thread

## Day-1 after approval

- [ ] Announce in anycap.ai banner
- [ ] Announce in 飞书 daemon welcome message
- [ ] Post Product Hunt
- [ ] Monitor CWS reviews + anycap-server metrics (P90 latency, error rate, conversion funnel)
