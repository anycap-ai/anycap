# AnyCap Chrome Extension Production Launch Runbook

Last updated: 2026-05-11. This runbook is for the v0.2.0 Chrome Web Store
launch. It separates terminal-only gates from approval-gated browser and store
actions.

## Launch Definition

Treat the launch as complete only when all of these are true:

- Current server extension support is deployed to production.
- Production `feature_access` and `rate_limit` dconf allow the anonymous Chrome
  extension rollout for `image.generate`, `video.generate`, `music.generate`,
  `web.search`, and `web.crawl`.
- Browser-free production smoke passes against `https://api.anycap.ai`.
- Real-mode extension E2E passes against production after explicit approval,
  because it opens headed Chromium.
- `releases/anycap-extension-0.2.0-chrome.zip` is uploaded to Chrome Web Store
  with the checked-in listing assets.

## Current Production Snapshot

As of 2026-05-11, the local package and server code are ready for deployment,
but production is not ready:

- `pnpm verify:release` passes locally.
- `pnpm preflight:local` passes locally.
- `pnpm test` passes locally with 182 unit tests.
- Full local Go tests pass.
- Latest production smoke with install ID `codex-smoke-20260511-after-contrast` returned required features as enabled, but
  `/v1/extension/config` returned `404`, and anonymous `/v1/web/search` plus
  `/v1/web/crawl` returned `401 AUTH_INVALID`.
- The local server now includes the anonymous public-trial abuse control:
  `AnonRateLimit` consumes both the normalized install-ID bucket and a hashed TCP
  remote-address client bucket, and integration tests cover install-ID rotation
  plus spoofed `X-Forwarded-For`.

Those results mean the production blocker is server deployment, not Chrome-side
packaging.

## Current Access Snapshot

As of 2026-05-11, this local machine is not ready to perform the remaining
web/store upload steps without additional credentials:

- `gh auth status` reports no GitHub login.
- `pnpm --dir web exec wrangler whoami` reports no Cloudflare/Wrangler login.
- `git@github.com:anycap-ai/anycap.git` SSH access is denied.
- The environment does not expose Chrome Web Store, Google, YouTube,
  Cloudflare, Wrangler, or GitHub upload tokens; only `GH_PAGER=cat` is present.
- The repository currently has only the GitLab `origin` remote configured.

Treat those as credential blockers, separate from the production server blockers
above.

## Approval Gates

Do not run these without explicit approval from the repository owner:

- Push or merge to `deploy/server-dev` or `deploy/server-prod`.
- Run `ANYCAP_ALLOW_HEADED_E2E=1 pnpm e2e`, `ANYCAP_ALLOW_HEADED_E2E=1 pnpm e2e:demo`, `ANYCAP_ALLOW_HEADED_E2E=1 pnpm shots:feishu`, or `ANYCAP_ALLOW_HEADED_E2E=1 pnpm e2e:real`, because they open headed Chromium.
- Upload or submit the Chrome Web Store item.
- Run media generation smoke against production with `--include-media`, because
  it consumes provider quota.

Everything else below is terminal-only and does not open a browser.

## 1. Pre-Deploy Local Verification

From the repository root:

```bash
git diff --check
GOSUMDB=sum.golang.org GOTOOLCHAIN=go1.25.0 go test -count=1 ./...
```

From `extension/`:

```bash
pnpm test
npx tsc --noEmit
pnpm render:cws
pnpm render:demo
pnpm release
pnpm verify:release
pnpm preflight:local
```

Optional blocker preview before deployment. This is expected to exit non-zero
until production smoke and real-mode E2E are complete:

```bash
pnpm launch:audit -- --skip-smoke
```

Expected release artifact:

```bash
shasum -a 256 .output/anycap-extension-0.2.0-chrome.zip releases/anycap-extension-0.2.0-chrome.zip
```

Both hashes must match. `pnpm release` also syncs the current `releases/` zip
SHA-256 into `store-assets/cws-submission.md` and
`docs/COMPLETION-AUDIT.md`. Confirm the recorded hash immediately before CWS
upload; the zip hash is build-run specific because zip metadata changes when the
package is rebuilt.

Before production deploy, confirm the reviewed commit includes the anonymous
public-trial abuse-control gate. The repo implementation is the service-side
dual bucket in `internal/middleware/anon_rate_limit.go`; if operations replace it
with a gateway/WAF rule, record the exact production rule name and limits in the
launch notes before enabling anonymous media-generation trial traffic.

## 2. Deploy Server

Use the deploy branches documented in `.gitlab-ci.yml`:

- `deploy/server-dev` deploys `anycap-server` to the dev namespace.
- `deploy/server-prod` deploys `anycap-server` to the prod namespace.

After approval, deploy the reviewed commit by merging it into the deploy branch:

```bash
git fetch origin
git checkout -B deploy/server-dev origin/deploy/server-dev
git merge --no-ff <reviewed-extension-server-commit-or-branch>
git push origin deploy/server-dev
```

Wait for the dev pipeline to pass and validate dev smoke. Then, after approval:

```bash
git fetch origin
git checkout -B deploy/server-prod origin/deploy/server-prod
git merge --no-ff <same-reviewed-extension-server-commit-or-branch>
git push origin deploy/server-prod
```

Wait for the prod pipeline to complete before touching CWS.

## 3. Configure Production Dconf

Merge the launch examples into the production dconf payloads:

- `configs/server/dconf/chrome_extension_launch.feature_access.example.json`
- `configs/server/dconf/chrome_extension_launch.rate_limit.example.json`

Required operations:

- `image.generate`
- `video.generate`
- `music.generate`
- `web.search`
- `web.crawl`

Anonymous extension principals do not have email addresses, so the public trial
slice must use rollout rules that do not depend on user groups. Set explicit RPM
values for every operation instead of relying on `default_rpm`.

Do not enable anonymous `image.generate`, `video.generate`, or `music.generate`
in production until the abuse-control gate above is deployed. If the first
launch uses only gateway/WAF controls, record the exact production rule name and
limits next to the deployment notes before running final smoke.

## 4. Browser-Free Production Validation

From `extension/`, use a fresh install ID for every run:

```bash
ANYCAP_INSTALL_ID=prod-smoke-$(date +%Y%m%d%H%M%S) pnpm smoke:server -- --base-url https://api.anycap.ai
```

Expected:

- Required features return `200`.
- `/v1/extension/config` returns `200`.
- `/v1/web/search` returns `200`, not `401`, `403`, or `503`.
- `/v1/web/crawl` returns `200`, not `401`, `403`, or `503`.

Optional provider-costing media-only smoke, only after approval. This mode
checks image/video/music and skips search/crawl so it stays within the 3-run
anonymous launch trial:

```bash
ANYCAP_INSTALL_ID=prod-media-$(date +%Y%m%d%H%M%S) pnpm smoke:server -- --base-url https://api.anycap.ai --include-media
```

## 5. Real-Mode E2E

This step opens headed Chromium. Run it only after explicit approval:

```bash
ANYCAP_ALLOW_HEADED_E2E=1 WXT_API_BASE=https://api.anycap.ai pnpm e2e:real
```

After it passes, run the final browser-free audit with the manual E2E
acknowledgement:

```bash
ANYCAP_INSTALL_ID=prod-audit-$(date +%Y%m%d%H%M%S) pnpm launch:audit -- --base-url https://api.anycap.ai --abuse-control-passed --real-e2e-passed
```

Expected result: all checks pass and no blockers are printed. This command does
not open Chrome; `--abuse-control-passed` is only an explicit acknowledgement
that the deployed server contains the dual-bucket anonymous trial middleware, or
that equivalent gateway-level controls limit anonymous install-ID rotation.
`--real-e2e-passed` is only an explicit acknowledgement that the headed E2E
command already completed green. The audit fetches
`https://anycap.ai/privacy/extension` with GET and fails if the response body is
the Next.js 404 fallback, even if the CDN returns HTTP 200.

## 6. Chrome Web Store Submission

Submit only after the final audit is green:

- Package: `releases/anycap-extension-0.2.0-chrome.zip`
- Form checklist: `store-assets/cws-submission.md`
- Listing copy: `store-assets/description.md`
- Permission copy: `store-assets/permission-justifications.md`
- Screenshots and promo assets: `store-assets/cws/`
- Promotional video source: `store-assets/demo.mp4` (upload to YouTube after approval)
- Privacy policy: `https://anycap.ai/privacy/extension`

## Rollback

Prefer the smallest rollback that stops user impact:

1. If only anonymous extension traffic is affected, tighten production
   `feature_access` rollout for the five extension operations and keep the
   server deployed.
2. If the deployed server is bad, revert the reviewed server commit on a new
   branch, merge that revert into `deploy/server-prod`, and wait for the prod
   deploy pipeline.
3. If CWS submission is still in review, cancel or pause submission in the CWS
   dashboard.
4. If a bad CWS version is already approved, publish a forward hotfix version;
   Chrome Web Store does not provide a normal package downgrade path.

After rollback, re-run browser-free smoke to verify production returns the
intended failure mode or restored success mode.
