# [SEO-20260326-1159] Semrush keyword builder synthesis for anycap.ai

- Time: `2026-03-26 11:59 CST`
- Node: `SEO-20260326-1159`
- Type: `change-log`
- Status: `done`
- Scope: `web/docs/seo/`
- Related: [`../analyze/2026-03-26-1159-semrush-keyword-builder-synthesis.md`](../analyze/2026-03-26-1159-semrush-keyword-builder-synthesis.md)

## Change Summary

- 將使用者提供的兩份 Semrush keyword builder CSV 轉成 AnyCap 可執行的 SEO / GEO / keyword strategy synthesis。
- 補出哪些 cluster 可直接用、哪些只是 category bridge、哪些屬於高 volume 噪音。
- 重新排序 AnyCap 的內容優先級，將 `Claude Code + tools / skills / CLI` 拉到第一優先。

## What Was Added

- Semrush 資料的 dataset snapshot
- 高適配關鍵字與低適配噪音的區分
- `seo-plan` 的優先順序更新
- `seo-geo` 的 message bridge 更新
- `keyword-discovery` 的 tiered keyword map 更新

## Key Decisions Captured

1. `tools`、`skills`、`cli` 是市場語言，應作為 acquisition 主軸
2. `agent-native capability runtime` 是品牌語言，應作為 GEO 與 category 主軸
3. `Claude Code` 是目前第一個最值得押的 ecosystem 切口
4. `Cursor / Codex / OpenCode / OpenClaw` 先以 GEO 佔位與長尾頁為主
5. 不應被 `Gemini CLI`、`AI marketing tools`、`agency ai` 這類高 volume 噪音帶偏

## Immediate Follow-up

- 這份 synthesis 最適合直接拆成：
  - `/for/claude-code` 頁面規劃
  - `/tools` 與 `/skills` hub 規劃
  - `Claude Code` 相關 guide page 規劃

## Verification

- 本次分析已使用使用者提供的 Semrush CSV 作為主要量化輸入。
- 本次未修改網站實作，只完成策略綜合、優先級調整與沉澱。
