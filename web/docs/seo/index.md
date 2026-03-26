# AnyCap SEO Workspace

`web/docs/seo/` 是 AnyCap SEO 工作的統一入口。這套系統要刻意把「判斷過程」、「執行待辦」與「真實改動」拆開，避免研究分析被誤寫成已落地變更。

## 目錄結構

- `index.md`
  - 只放穩定規則、閱讀方式與寫作邊界。
  - 不手動維護完整歷史時間流水線。
- `analyze/`
  - 放調研、診斷、假設、證據、推導與判斷。
  - 回答「看到了什麼、為什麼重要、建議往哪裡走」。
- `todo/`
  - 放去重後、可直接執行的優先事項。
  - 回答「現在最該做什麼、先後順序是什麼」。
- `change-log/`
  - 只放已經發生的實際改動與驗證結果。
  - 回答「真的改了什麼、影響什麼、怎麼驗證」。

## 核心規則

1. `analyze` 用來記錄判斷與推導，不預設對應一篇 `change-log`。
2. `todo` 用來承接多篇 `analyze` 的收斂結果，不重貼分析內容。
3. `change-log` 只有在真的改了程式碼、頁面、文案、配置、metadata、schema、sitemap、robots、`llms.txt` 或實驗設定時才建立。
4. 如果沒有任何實際產物變更，就停留在 `analyze` 或 `todo`，不要補一篇純摘要型 `change-log`。
5. 歷史回放以檔名時間與文件 metadata 為準，不由 `index.md` 手工鏡像完整歷史。
6. 早期文件若還帶有 `analyze` / `change-log` 1:1 配對痕跡，視為 legacy，不再延續。

## 讀取規則

1. 永遠先讀 `index.md`，先掌握規則與邊界。
2. 若要知道目前要做什麼，先讀最新的 `todo/`。
3. 若要理解某個判斷是怎麼得出的，再沿 `Related` 或 `Source Nodes` 回讀對應 `analyze/`。
4. 若要追實際落地與驗證，再讀對應的 `change-log/`。
5. 只有當 `change-log` 或 `analyze` 指到具體檔案、頁面或 URL，才往下讀 repo 實作。

## 更新規則

1. 新開一個 SEO 主題時，先建立一筆 `analyze`。
2. 當多筆分析收斂成可執行事項時，建立或更新對應的 `todo`。
3. 當某個待辦真的落地，才建立一筆 `change-log`。
4. `change-log` 應優先連回觸發它的 `analyze` 或 `todo`，不要重寫整篇分析。
5. `index.md` 不再維護手工完整時間流水線；需要看歷史時，直接按檔名時間讀各目錄即可。
6. 若未來有自動化工具，再考慮重建 timeline；在那之前不要手工同步。

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

每一筆 `analyze`、`todo` 或 `change-log` 都至少包含：

- `Time`
- `Node`
- `Type`
- `Status`
- `Scope`
- `Related`

`change-log` 另外至少應包含：

- `Touched`
- `Verification`

常用狀態值：

- `planned`
- `in_progress`
- `done`
- `blocked`
- `archived`

## 何時該寫 Change Log

符合以下任一條件才建立 `change-log`：

- 改了程式碼或配置
- 新增、刪除或重寫公開頁面 / URL
- 更新 metadata、schema、sitemap、robots、`llms.txt`
- 做了可回放的實驗、驗證或觀測記錄

以下情況不要建立 `change-log`：

- 只有研究、整理、推導
- 只有策略摘要
- 只有待辦排序
- 只是把 `analyze` 換一種寫法重貼一次

## 建議工作流程

1. 用 `analyze` 沉澱觀察、證據、風險與方向判斷。
2. 用 `todo` 收斂成目前的執行隊列。
3. 用 `change-log` 記錄真實改動與驗證。
4. 讓文件之間互相連結，但盡量用引用，不重複整段內容。

## 文件撰寫準則

- `analyze` 重點是判斷品質，不是流水帳。
- `todo` 重點是去重、排序、可執行，不重複貼分析內容。
- `change-log` 重點是可追溯的產物變更，不是第二篇 `analyze`。
- 一筆文件只處理一個明確主題，避免混多個 SEO 議題。
- 若有明確頁面、URL、關鍵字群、受眾或假設，請寫清楚。
- 如果結論仍不確定，也要把不確定性寫出來。

## 後續使用方式

之後每次要做 SEO 工作，直接沿用下面這個順序：

1. 先新增一篇 `analyze`。
2. 若有可執行事項，整理成一篇 `todo`。
3. 若有真實改動或驗證結果，再新增一篇 `change-log`。
4. 不再為了維護時間線而手動回寫 `index.md`。
