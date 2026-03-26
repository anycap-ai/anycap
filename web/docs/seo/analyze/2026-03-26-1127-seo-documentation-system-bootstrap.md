# [SEO-20260326-1127] SEO documentation system bootstrap

- Time: `2026-03-26 11:27 CST`
- Node: `SEO-20260326-1127`
- Type: `analyze`
- Status: `done`
- Scope: `web/docs/seo/`
- Related: [`../change-log/2026-03-26-1127-seo-documentation-system-bootstrap.md`](../change-log/2026-03-26-1127-seo-documentation-system-bootstrap.md)

## Background

AnyCap 接下來會開始持續進行 SEO 相關工作，但目前 `web/docs/seo/index.md` 是空的，沒有形成可以承接後續研究、決策、變更與驗證的文件系統。

## Observations

- 缺少單一入口，後續 SEO 調研容易散落在不同聊天、臨時筆記或提交訊息中。
- 缺少分析與變更的分層，容易把「研究判斷」和「實際改動」混在一起。
- 缺少時間節點，之後很難回放某次 SEO 決策是基於什麼背景產生。

## Decision

- 以 `web/docs/seo/index.md` 作為唯一總入口。
- 將 SEO 文件分為 `analyze/` 與 `change-log/` 兩個主軸。
- 所有新工作以時間節點管理，使用 `SEO-YYYYMMDD-HHMM` 作為主鍵。
- 每筆新增內容都必須回寫到 `index.md` 的時間流水線。

## Why This Structure

- `analyze/` 負責保留判斷依據，讓未來可以復查分析質量。
- `change-log/` 負責保留行動與影響，讓未來可以追蹤執行效果。
- `index.md` 負責規則與索引，讓新進入的人先知道怎麼讀、怎麼寫、怎麼接續工作。

## Suggested Use From Now On

後續每個 SEO 主題建議都遵循以下模式：

1. 先建立一篇 `analyze`，確認問題、觀察與建議方向。
2. 若有落地行動或決策，再建立對應 `change-log`。
3. 更新 `index.md`，把該節點掛入時間流水線。

## Immediate Next Topics

這套文件體系建好後，下一批很適合直接進來沉澱的 SEO 主題包括：

- 首頁與核心 landing page 的 keyword mapping
- 技術 SEO 基線檢查：`robots`、`sitemap`、canonical、metadata
- GEO / AI Search 可見性策略
- 內容集群與資訊架構規劃
