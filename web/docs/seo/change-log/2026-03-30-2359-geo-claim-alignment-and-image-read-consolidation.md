# [SEO-20260330-2359] GEO claim alignment and image-read consolidation

- Time: `2026-03-30 23:59 CST`
- Node: `SEO-20260330-2359`
- Type: `change-log`
- Status: `done`
- Scope: `metadata`, `landing copy`, `llms.txt`, `robots`, `legacy route redirect`, `image-read consolidation`
- Related:
  - [`../index.md`](../index.md)
  - [`../analyze/2026-03-30-2342-anycap-live-geo-audit-refresh.md`](../analyze/2026-03-30-2342-anycap-live-geo-audit-refresh.md)
  - [`../analyze/2026-03-26-1139-anycap-ai-geo-readiness-baseline.md`](../analyze/2026-03-26-1139-anycap-ai-geo-readiness-baseline.md)
  - [`../todo/2026-03-30-1038-ability-cluster-follow-ups.md`](../todo/2026-03-30-1038-ability-cluster-follow-ups.md)
- Touched:
  - `web/src/lib/site.ts`
  - `web/src/lib/seo-metadata.ts`
  - `web/src/app/layout.tsx`
  - `web/src/lib/localized-metadata.ts`
  - `web/src/lib/landing-content.ts`
  - `web/src/app/opengraph-image.tsx`
  - `web/public/site.webmanifest`
  - `web/public/llms.txt`
  - `web/src/app/robots.ts`
  - `web/src/middleware.ts`
  - `web/src/components/EquipAgent.tsx`
  - `web/src/components/TerminalDemo.tsx`
  - `web/src/app/(seo)/about/page.tsx`
  - `web/src/app/(seo)/glossary/agent-capability-runtime/page.tsx`
  - removed `web/src/app/(seo)/capabilities/image-read/page.tsx`
  - removed `web/src/app/[locale]/(seo)/capabilities/image-read/page.tsx`
- Verification:
  - `pnpm lint`
  - `pnpm build`

## What Changed

### 1. Unified capability-availability language

收斂站內對 AnyCap 當前能力面的描述，統一成：

- current early access: `image generation`, `video generation`, `image understanding`, `video analysis`
- roadmap: `music`, `speech`, `search`, `crawl`

這次同步更新了：

- site-level metadata description
- social image alt text
- agent landing copy
- web app manifest description
- `EquipAgent` prompt
- `TerminalDemo` capability surface
- high-weight explanatory pages like `about` and `agent capability runtime`

### 2. Fixed root metadata title duplication

原本 root title 會產生 `... | AnyCap | AnyCap` 類型的重複品牌尾巴。這次把 default title 與 Open Graph / Twitter title 的責任拆開，讓 root title 與 social title 都只保留一次品牌尾碼。

### 3. Upgraded `llms.txt`

把 `llms.txt` 從 bare URL 清單改成更接近 AI-friendly route guide 的格式，補上：

- best entry pages
- capabilities available now
- roadmap capabilities
- explicit note that roadmap capabilities 不應被描述為已普遍可用
- explicit note that `image-understanding` 是取代 legacy `image-read` 的主路徑

### 4. Added explicit AI crawler rules

`robots.txt` 現在除了 wildcard allow 之外，也顯式允許：

- `GPTBot`
- `OAI-SearchBot`
- `ChatGPT-User`
- `ClaudeBot`
- `PerplexityBot`

### 5. Consolidated `image-read` into `image-understanding`

為了減少 route / term fragmentation：

- 刪除了 `image-read` 的 SEO page files
- 從 public route definitions 移除了 `capabilities-image-read`
- 在 middleware 新增 legacy redirect：
  - `/capabilities/image-read` → `/en/capabilities/image-understanding`
  - `/en/capabilities/image-read` → `/en/capabilities/image-understanding`

這讓 sitemap / canonical / `llms.txt` / public page naming 更集中到 `image-understanding`

## Outcome

這一輪沒有新增新頁面，也沒有做大規模 schema rollout，但已先把最容易讓 AI crawler / AI answers 產生錯誤理解的幾個問題收掉：

1. 站內 capability 現況訊號更一致
2. `image-read` 與 `image-understanding` 的 authority split 開始收斂
3. `llms.txt` 更像給 AI 系統看的入口文件，而不是純 URL dump
4. crawler intent 對外更明確

## Verification Notes

### `pnpm lint`

通過。仍有既有 warning，未在本輪處理：

- 多處 `<img>` 的 Next.js lint warning
- 一個既有 `react-hooks/exhaustive-deps` warning

### `pnpm build`

通過。production build 成功完成，`/capabilities/image-read` 不再作為 page route 產物出現在 build 輸出中。
