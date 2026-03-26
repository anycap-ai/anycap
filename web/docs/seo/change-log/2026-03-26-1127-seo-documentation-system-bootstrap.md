# [SEO-20260326-1127] SEO documentation system bootstrap

- Time: `2026-03-26 11:27 CST`
- Node: `SEO-20260326-1127`
- Type: `change-log`
- Status: `done`
- Scope: `web/docs/seo/`
- Related: [`../analyze/2026-03-26-1127-seo-documentation-system-bootstrap.md`](../analyze/2026-03-26-1127-seo-documentation-system-bootstrap.md)

## Change Summary

- 將 `web/docs/seo/index.md` 建立為 SEO 文件總入口。
- 新增 `analyze/` 目錄，用來沉澱 SEO 調研與判斷依據。
- 新增 `change-log/` 目錄，用來沉澱 SEO 變更與執行紀錄。
- 建立第一個時間節點 `SEO-20260326-1127`，作為整套文件體系的初始化樣本。

## Why This Change Exists

這次變更的目的不是直接優化搜尋排名，而是先建立一個能夠持續承載 SEO 工作的知識底座，避免後續分析、策略、實作與驗證失去上下文。

## What This Enables

- 後續 SEO 工作有固定入口，不再散落。
- 每次分析與改動都能以時間節點回放。
- 可以從 `index.md` 快速找到最近的研究與變更。
- 能把「分析」與「變更」分開管理，提升可讀性與追溯性。

## Verification

- `index.md` 已補上讀取規則、更新規則、命名規則與時間流水線。
- `analyze/` 已有第一筆初始化分析文件。
- `change-log/` 已有第一筆初始化變更文件。
- 三者已完成互相連結。

## Follow-up

下一次實際 SEO 工作進來時，直接沿用同一套節點規則新增文件即可，不需要再重新設計資料結構。
