# [SEO-20260326-1139] anycap.ai GEO readiness baseline

- Time: `2026-03-26 11:39 CST`
- Node: `SEO-20260326-1139`
- Type: `change-log`
- Status: `done`
- Scope: `web/docs/seo/`
- Related: [`../analyze/2026-03-26-1139-anycap-ai-geo-readiness-baseline.md`](../analyze/2026-03-26-1139-anycap-ai-geo-readiness-baseline.md)

## Change Summary

- 新增 `anycap.ai` 第一版 GEO / AI Search readiness 分析。
- 將 GEO score、平台拆分、AI crawler 狀態、`llms.txt` / RSL 缺口、品牌 mention 弱點與 citability 問題正式沉澱到 SEO 文件系統。
- 把 `/seo-geo anycap.ai` 的產出掛入 SEO 時間流水線。

## Key Findings Captured

1. `anycap.ai` 目前 GEO readiness 為早期階段，總分暫定 `48/100`
2. 目前不是 crawler 被擋住，而是站內內容與站外 entity signals 都不夠強
3. `llms.txt` 缺失，`sitemap.xml` live endpoint 仍然失效
4. 首頁與 `/for-human` 可讀，但還不夠 citation-ready
5. 品牌外部可驗證訊號很弱，這會直接拖累 ChatGPT / Perplexity 類平台表現

## What Was Verified

- live homepage content
- live `/for-human`
- live `robots.txt`
- `llms.txt` `404`
- `sitemap.xml` `500`
- server-side rendered content accessibility
- 站內是否存在 schema / llms / RSL 類實作

## Immediate Follow-up

- GEO 角度的下一步可以直接拆成：
  - `llms.txt` 規劃與實作
  - citation-ready homepage copy rewrite
  - AI crawler policy refinement
  - brand entity surface checklist

## Verification

- 已新增對應 `analyze` 文件。
- 本次未變更網站 SEO/GEO 實作，只完成 readiness 診斷與優先級整理。
