# [SEO-20260408-1125] Capability alignment with homepage narrative preserved

- Time: `2026-04-08 11:25 CST`
- Node: `SEO-20260408-1125`
- Type: `change-log`
- Status: `done`
- Scope: `capability claim alignment`, `capabilities page`, `pricing page`, `about page`, `agent landing`, `llms.txt`, `homepage narrative rollback`
- Related:
  - [`../index.md`](../index.md)
  - [`../analyze/2026-04-08-1040-external-crawl-report-reconciliation.md`](../analyze/2026-04-08-1040-external-crawl-report-reconciliation.md)
  - [`../todo/2026-04-08-1040-execution-plan-from-external-crawl-report.md`](../todo/2026-04-08-1040-execution-plan-from-external-crawl-report.md)
  - [`../analyze/2026-04-03-1602-capabilities-page-live-audit.md`](../analyze/2026-04-03-1602-capabilities-page-live-audit.md)
- Touched:
  - `web/src/lib/site.ts`
  - `web/src/content/landing.ts`
  - `web/src/app/(seo)/capabilities/page.tsx`
  - `web/src/app/(seo)/pricing/page.tsx`
  - `web/src/app/(seo)/about/page.tsx`
  - `web/src/app/(seo)/for/claude-code/page.tsx`
  - `web/src/components/landing/HumanHomePage.tsx`
  - `web/src/app/opengraph-image.tsx`
  - `web/public/site.webmanifest`
- Verification:
  - `pnpm lint`
  - `pnpm build`

## What Changed

### 1. Kept the homepage narrative on the live version

首頁敘事在本輪回退到線上版本：

- hero 文案回到 live copy
- 首頁正文敘事回到 live copy
- 首頁社交圖與 manifest 描述回到 live 方向
- root metadata title 也回到 `Any Capability, Instantly`

這次不再把首頁當作可以自由調整的 category rewrite 場域。

### 2. Continued the capability-alignment work on non-home surfaces

在不碰首頁敘事前提下，保留並完成其他高權重 public surfaces 的 capability 對齊：

- `/capabilities`
- `/pricing`
- `/about`
- `/agent`
- `/llms.txt`

主要收斂的方向是：

- 用更清楚的 inventory / category 語言描述 AnyCap
- 讓非首頁高權重頁面更一致地表達 capability surface
- 降低站內共享 claim 在不同頁型上的漂移

### 3. Updated the agent-facing inventory source

`landing.ts` 作為 `/agent` 和 `/llms.txt` 的共用來源，這次整理成三段更清楚的 inventory 結構：

- `Media generation`
- `Media understanding and web retrieval`
- `Delivery and publishing`

同時保留較完整的實際 capability surface：

- image / video / music generation
- image / video / audio understanding
- web search / grounded web search / web crawl
- drive / page / download

### 4. Tightened one cross-page wording dependency

`/for/claude-code` 原本因共享 label 語言變動而變得不自然，這次改為直接寫：

- image
- video
- audio
- visual-analysis capabilities

避免單一 shared label 影響 agent-specific page 的自然度。

## Outcome

這輪最終落地結果是：

1. 首頁敘事保留 live 版本
2. capability inventory alignment 繼續在非首頁 public surfaces 推進

也就是說，首頁仍是雷區，不作 category rewrite；後續 SEO 擴張優先放在：

- `/for/{agent}/{task}`
- `/capabilities`
- `/pricing`
- `/about`
- `/agent` / `/llms.txt`

## Verification Notes

### `pnpm lint`

通過。仍有既有 warning，未在本輪處理：

- 多處 `<img>` 的 Next.js lint warning
- 一個既有 `react-hooks/exhaustive-deps` warning

### `pnpm build`

通過。production build 成功完成，首頁回退與其他 public SEO 頁的 capability 對齊沒有引入 build error。
