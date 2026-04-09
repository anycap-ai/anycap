# [SEO-20260409-1325] Glossary title and H1 separation for duplicate-tag cleanup

- Time: `2026-04-09 13:25 CST`
- Node: `SEO-20260409-1325`
- Type: `change-log`
- Status: `done`
- Scope: `glossary metadata`, `title tag cleanup`, `H1/title separation`
- Related:
  - [`../index.md`](../index.md)
  - [`../analyze/2026-04-08-1040-external-crawl-report-reconciliation.md`](../analyze/2026-04-08-1040-external-crawl-report-reconciliation.md)
  - [`../todo/2026-04-08-1040-execution-plan-from-external-crawl-report.md`](../todo/2026-04-08-1040-execution-plan-from-external-crawl-report.md)
- Touched:
  - `web/src/app/(seo)/glossary/agent-capability-runtime/page.tsx`
  - `web/src/app/(seo)/glossary/agent-harness/page.tsx`
  - `web/src/app/(seo)/glossary/context-engineering/page.tsx`
- Verification:
  - `pnpm lint`
  - `pnpm build`

## What Changed

### 1. Separated `<title>` from on-page H1 on the three glossary concept pages

這三頁原本都把 metadata title 和頁面 H1 寫成完全相同的問句：

- `/glossary/agent-capability-runtime`
- `/glossary/agent-harness`
- `/glossary/context-engineering`

這次保留 H1 的 query-style 問句不動，只把 metadata title / Open Graph title 改成：

- `問句 + clarifying suffix`

讓頁面仍然保留原本的搜尋意圖覆蓋，同時避免 crawler 工具把它標成 duplicate H1/title。

### 2. Kept the change narrow to metadata only

這一輪沒有改：

- URL
- canonical
- H1
- body copy
- internal links
- schema

目標是先用最小改動把 external crawl report 的這組 warning 收掉，而不額外引入內容層面的變數。

## Outcome

glossary 概念頁現在更接近現有 guides 的 metadata pattern：

1. H1 負責頁面主問題 / 主概念
2. title tag 額外補一層定義或解釋角度
3. social title 也和 title tag 保持一致

## Verification Notes

### `pnpm lint`

通過。仍有既有 warning，未在本輪處理：

- 多處 `<img>` 的 Next.js lint warning
- 一個既有 `react-hooks/exhaustive-deps` warning

### `pnpm build`

通過。Next production build 成功完成，`/glossary/agent-capability-runtime`、`/glossary/agent-harness`、`/glossary/context-engineering` 皆正常出現在 build route 輸出中。
