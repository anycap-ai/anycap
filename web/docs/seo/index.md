# AnyCap SEO Workspace

`web/docs/seo/` 是 AnyCap 所有 SEO 工作的統一沉澱入口。後續無論是關鍵字研究、競品分析、技術 SEO、內容規劃、Schema、Sitemap、GEO/AI Search、落地頁優化，都先在這個目錄留下可追溯記錄。

## 目錄結構

- `index.md`
  - SEO 文件總入口。
  - 只負責說明規則、閱讀方式、時間流水線，以及收錄最新節點索引。
- `analyze/`
  - 放 SEO 調研、診斷、假設、判斷依據。
  - 每一筆分析都應該能回答「看到了什麼、為什麼重要、接下來建議做什麼」。
- `change-log/`
  - 放 SEO 相關的變更紀錄。
  - 每一筆都應該能回答「改了什麼、為什麼改、影響什麼、怎麼驗證」。
- `todo/`
  - 放 SEO 執行待辦與優先順序。
  - 只保留去重後、可直接執行的事項，不放重複分析。

## 讀取規則

1. 永遠先讀 `index.md`，先掌握目前的工作規則與最新時間節點。
2. 若要理解某個 SEO 主題，先讀對應的 `analyze` 節點。
3. 若要知道目前要做什麼，讀最新的 `todo` 節點。
4. 若要追實際落地與驗證，再讀關聯的 `change-log`。
5. 若 `change-log` 提到程式碼、頁面或實驗，才往下讀 repo 內對應實作檔案。

## 更新規則

1. 新開一個 SEO 主題時，先建立一筆 `analyze`。
2. 當分析收斂成可執行事項時，建立或更新對應的 `todo`。
3. 當 `todo` 中的事項有實際改動、決策或驗證結果時，再補一筆 `change-log`。
4. 每新增一筆文件，都必須回寫到本頁的「時間流水線」。
5. 一個主題可有多筆後續節點，但每筆都要保留清楚的時間與標題。
6. 若後續某次工作只是延續既有主題，也要新增新的時間節點，不要直接覆蓋舊分析。

## 檔名與節點規範

- 檔名格式：
  - `analyze/YYYY-MM-DD-HHMM-topic-slug.md`
  - `change-log/YYYY-MM-DD-HHMM-topic-slug.md`
  - `todo/YYYY-MM-DD-HHMM-topic-slug.md`
- 節點 ID 格式：
  - `SEO-YYYYMMDD-HHMM`
- 標題格式：
  - `# [SEO-YYYYMMDD-HHMM] Human readable title`

## 每筆文件最少要有的欄位

每一筆 `analyze`、`change-log` 或 `todo` 都至少包含以下欄位：

- `Time`
- `Node`
- `Type`
- `Status`
- `Scope`
- `Related`

建議狀態值：

- `planned`
- `in_progress`
- `done`
- `blocked`
- `archived`

## 建議工作流程

1. 建立 `analyze` 節點，描述背景、觀察、風險、假設、建議方向。
2. 將分析收斂成單一 `todo` 節點，保留去重後的優先順序。
3. 若有執行層行動，建立對應的 `change-log` 節點，記錄改動與驗證。
4. 將三者互相連結，確保可以從分析追到待辦，從待辦追到落地。
5. 回到 `index.md` 補上新的時間流水線條目。

## 文件撰寫準則

- `analyze` 重點是判斷品質，不是流水帳。
- `todo` 重點是去重、排序、可執行，不重複貼分析內容。
- `change-log` 重點是可追溯性，不是單純列檔案。
- 一筆文件只處理一個明確主題，避免把多個 SEO 議題混在同一篇。
- 若有明確頁面、URL、關鍵字群、受眾或假設，請寫清楚。
- 如果結論仍不確定，也要把不確定性寫出來。

## 時間流水線

| Time | Node | Type | Title | Status | File |
| --- | --- | --- | --- | --- | --- |
| 2026-03-26 12:03 CST | `SEO-20260326-1203` | `todo` | Today SEO todo | `planned` | [`todo/2026-03-26-1203-today-seo-todo.md`](./todo/2026-03-26-1203-today-seo-todo.md) |
| 2026-03-26 12:03 CST | `SEO-20260326-1203` | `change-log` | Today SEO todo | `done` | [`change-log/2026-03-26-1203-today-seo-todo.md`](./change-log/2026-03-26-1203-today-seo-todo.md) |
| 2026-03-26 11:59 CST | `SEO-20260326-1159` | `analyze` | Semrush keyword builder synthesis for anycap.ai | `done` | [`analyze/2026-03-26-1159-semrush-keyword-builder-synthesis.md`](./analyze/2026-03-26-1159-semrush-keyword-builder-synthesis.md) |
| 2026-03-26 11:59 CST | `SEO-20260326-1159` | `change-log` | Semrush keyword builder synthesis for anycap.ai | `done` | [`change-log/2026-03-26-1159-semrush-keyword-builder-synthesis.md`](./change-log/2026-03-26-1159-semrush-keyword-builder-synthesis.md) |
| 2026-03-26 11:45 CST | `SEO-20260326-1145` | `analyze` | anycap.ai keyword discovery baseline | `done` | [`analyze/2026-03-26-1145-anycap-ai-keyword-discovery-baseline.md`](./analyze/2026-03-26-1145-anycap-ai-keyword-discovery-baseline.md) |
| 2026-03-26 11:45 CST | `SEO-20260326-1145` | `change-log` | anycap.ai keyword discovery baseline | `done` | [`change-log/2026-03-26-1145-anycap-ai-keyword-discovery-baseline.md`](./change-log/2026-03-26-1145-anycap-ai-keyword-discovery-baseline.md) |
| 2026-03-26 11:41 CST | `SEO-20260326-1141` | `analyze` | anycap GEO positioning for agent-native brand | `done` | [`analyze/2026-03-26-1141-anycap-geo-positioning-for-agent-brand.md`](./analyze/2026-03-26-1141-anycap-geo-positioning-for-agent-brand.md) |
| 2026-03-26 11:41 CST | `SEO-20260326-1141` | `change-log` | anycap GEO positioning for agent-native brand | `done` | [`change-log/2026-03-26-1141-anycap-geo-positioning-for-agent-brand.md`](./change-log/2026-03-26-1141-anycap-geo-positioning-for-agent-brand.md) |
| 2026-03-26 11:39 CST | `SEO-20260326-1139` | `analyze` | anycap.ai GEO readiness baseline | `done` | [`analyze/2026-03-26-1139-anycap-ai-geo-readiness-baseline.md`](./analyze/2026-03-26-1139-anycap-ai-geo-readiness-baseline.md) |
| 2026-03-26 11:39 CST | `SEO-20260326-1139` | `change-log` | anycap.ai GEO readiness baseline | `done` | [`change-log/2026-03-26-1139-anycap-ai-geo-readiness-baseline.md`](./change-log/2026-03-26-1139-anycap-ai-geo-readiness-baseline.md) |
| 2026-03-26 11:31 CST | `SEO-20260326-1131` | `analyze` | anycap.ai SEO strategy baseline | `done` | [`analyze/2026-03-26-1131-anycap-ai-seo-strategy-baseline.md`](./analyze/2026-03-26-1131-anycap-ai-seo-strategy-baseline.md) |
| 2026-03-26 11:31 CST | `SEO-20260326-1131` | `change-log` | anycap.ai SEO strategy baseline | `done` | [`change-log/2026-03-26-1131-anycap-ai-seo-strategy-baseline.md`](./change-log/2026-03-26-1131-anycap-ai-seo-strategy-baseline.md) |
| 2026-03-26 11:27 CST | `SEO-20260326-1127` | `analyze` | SEO documentation system bootstrap | `done` | [`analyze/2026-03-26-1127-seo-documentation-system-bootstrap.md`](./analyze/2026-03-26-1127-seo-documentation-system-bootstrap.md) |
| 2026-03-26 11:27 CST | `SEO-20260326-1127` | `change-log` | SEO documentation system bootstrap | `done` | [`change-log/2026-03-26-1127-seo-documentation-system-bootstrap.md`](./change-log/2026-03-26-1127-seo-documentation-system-bootstrap.md) |

## 後續使用方式

之後每次要做 SEO 工作，直接沿用下面這個順序：

1. 先新增一篇 `analyze`。
2. 若有可執行事項，整理成一篇 `todo`。
3. 若有產出決策或實作，再新增一篇 `change-log`。
4. 最後更新本頁的時間流水線。

這樣 `web/docs/seo/` 就會同時具備：

- 規則入口
- 分析沉澱
- 待辦清單
- 變更紀錄
- 可回放的時間脈絡
