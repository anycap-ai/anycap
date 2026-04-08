# [SEO-20260408-1040] Execution plan from external crawl report

- Time: `2026-04-08 10:40 CST`
- Node: `SEO-20260408-1040`
- Type: `todo`
- Status: `in_progress`
- Scope: `homepage rewrite`, `for-family depth expansion`, `workflow page type`, `guide deepening`, `execution sequencing`
- Related:
  - [`../index.md`](../index.md)
  - [`../analyze/2026-04-08-1040-external-crawl-report-reconciliation.md`](../analyze/2026-04-08-1040-external-crawl-report-reconciliation.md)
  - [`../analyze/2026-03-30-1545-narrative-ia-audit-and-nav-keyword-mapping.md`](../analyze/2026-03-30-1545-narrative-ia-audit-and-nav-keyword-mapping.md)
  - [`../analyze/2026-04-03-1602-capabilities-page-live-audit.md`](../analyze/2026-04-03-1602-capabilities-page-live-audit.md)
  - [`2026-03-30-1038-ability-cluster-follow-ups.md`](2026-03-30-1038-ability-cluster-follow-ups.md)

## Core Judgment

這一輪不需要再抽象地討論「AnyCap 有沒有 SEO 架構」。答案已經很清楚：

- 有骨架
- 缺密度
- 缺對稱 leaf
- 缺 workflow / use-case 這個 page type

所以這份 `todo` 的目的，是把外部 crawl 報告翻成可以直接執行的輸出隊列。

## Progress Update

已在 `2026-04-08` 完成：

- 公開 capability inventory 對齊

See:

- [`../change-log/2026-04-08-1125-capability-alignment-with-homepage-narrative-preserved.md`](../change-log/2026-04-08-1125-capability-alignment-with-homepage-narrative-preserved.md)

## Ranked Priority Stack

如果只看「SEO 影響 x 對現有產品對齊 x 可執行性」，目前最值得做的前 `8` 項是：

1. 首頁 category rewrite
2. 公開 capability inventory 對齊
3. `/for/cursor/image-generation`
4. `/for/codex/image-generation`
5. `/for/cursor/video-generation`
6. `/for/codex/video-generation`
7. 現有 `guides` / `learn` 的 content floor 補齊
8. 第一批 `/workflows/*` 頁型定義與種子頁

## Why This Order

### Tier 1: 先修入口與產品語義

- 首頁 category rewrite
- capability inventory 對齊

原因：

- 這兩件事會影響整站實體理解與內鏈分發
- 不先做，後面擴頁容易把錯誤訊號放大
- 這是所有新 leaf 頁的共同前置條件

### Tier 2: 補最有把握的高意圖 leaf

- `/for/cursor/image-generation`
- `/for/codex/image-generation`
- `/for/cursor/video-generation`
- `/for/codex/video-generation`

原因：

- `for` family 已經存在，只差 depth expansion
- 這些頁最容易和現有 capability / model / install path 串起來
- 比新增新家族或新 agent 風險低，轉換意圖也更強

### Tier 3: 補內容標準化，再擴新 page type

- `guides` / `learn` content floor
- `/workflows/*`

原因：

- 如果不先把現有頁型標準化，新增 workflow family 很容易再長歪
- workflow 頁型很重要，但它應該建立在現有 family 已經較穩的前提上

## P0 Now

## 1. 重寫首頁語義層，讓首頁從品牌頁升級成 category entry page

目標：

- 保留目前強敘事
- 補上對搜尋引擎與 AI 系統更直白的 category 語言
- 讓首頁能自然導向現有 SEO hubs

必做項：

- 首屏補清楚 AnyCap 是什麼
- 在正文更明確出現：
  - `AI agent capabilities`
  - `capability runtime`
  - `tools for coding agents`
  - `image, video, and vision workflows for agents`
- 在正文增加更直接的內鏈到：
  - `/capabilities`
  - `/for`
  - `/guides/install-anycap`
  - `/skills`

完成標準：

- 首頁不再只靠品牌句子讓搜尋引擎猜測產品類別
- 首頁成為可把權重分發到 hub pages 的真實入口

## 2. 先對齊公開 capability inventory，再擴內容

目標：

- 避免新頁把 capability claim drift 擴大

必做項：

- 對齊首頁、capabilities hub、pricing、about、`llms.txt`、shared copy
- 明確定義：
  - 目前 live
  - early access
  - coming soon

完成標準：

- 所有高曝光頁面對 capability 狀態的說法一致

## 3. 定義 page-template content floor

不要再用「字數夠不夠」當唯一標準，而是對各頁型定一套最低內容結構。

### `for/{agent}` 最低結構

- 明確能力缺口定義
- 安裝 / 接入路徑
- capability gap table
- capability leaves
- model recommendations
- FAQ
- next-step CTA

### `guides/*` 最低結構

- 問題定義
- 前置條件
- step-by-step
- common mistakes
- verification step
- related capability / model / install links

### `learn/*` 最低結構

- 明確 query promise
- 判斷框架或對比結論
- capability / workflow bridge
- FAQ
- 轉向具體 product page 的 CTA

## P1 Next

## 1. 把 `/for/` 從 platform hub 擴成 platform x task 矩陣

現狀：

- `Claude Code` 已有 task-level leaves
- `Cursor` / `Codex` / `Manus` 尚未對稱展開

優先順序：

1. `/for/cursor/image-generation`
2. `/for/cursor/video-generation`
3. `/for/codex/image-generation`
4. `/for/codex/video-generation`

條件：

- 頁面必須對應真實使用路徑
- 內容要能直接承接高意圖 query，不只是複寫 hub intro

## 2. 重新整理 `guides` 與 `learn` 的邊界

判斷原則：

- `guides` 承接 how-to / install / implementation
- `learn` 承接 buyer guide / architecture / problem framing

近期優先動作：

- 補強現有 guide 頁的操作密度
- 避免同一 query 在 `learn`、`guides`、`glossary` 同時追
- 為每一頁補清楚的主 query 與 internal-link role

## 3. 讓 capability / model / guide / for 之間形成更強內鏈

每個核心 page family 都至少要能把讀者導向：

- 一個具體 capability page
- 一個具體 model page
- 一個具體 install guide
- 一個具體 `for/{agent}` page

這件事的目的不只是轉換，也是讓搜尋引擎更清楚理解頁與頁之間的主題關係。

## P2 Build

## 1. 新增 `workflow` 或 `use-case` family

建議先選一個名稱，不要兩個都上。

較推薦：

- `/workflows/*`

原因：

- 更符合 developer / agent 實作語境
- 比 `/use-cases/*` 更不容易寫成空泛 marketing 頁

第一批只出 `3-5` 頁。

推薦種子：

1. coding agent product mockups
2. coding agent demo videos
3. SaaS assistant screenshot triage
4. agent-generated visual outputs for product teams

## 2. 建立 workflow page brief 模板

每一頁至少固定包含：

- target query cluster
- agent / team persona
- job to be done
- exact workflow
- required capabilities
- suggested models
- output artifact
- CTA
- internal-link targets

## 3. 從 capability-first 擴到 problem-intent

當 `for/{agent}/{task}` 與 `workflow` 穩定後，再補 problem-intent 類頁：

- can X generate images
- how to give X visual output
- what breaks when Y needs screenshots or recordings

這些頁通常比抽象 category 頁更容易吃到具體、高意圖搜尋。

## Later

## 1. 再決定是否做新的 `for/{agent}` 家族

例如：

- `ChatGPT`
- 其他 agent platforms

前提：

- 必須存在真實、可驗證的接入路徑
- 不能為了關鍵詞去造不成立的 page promise

## 2. 再評估比較頁要不要往 developer infra 競爭者延展

可能方向：

- compare 類
- alternative 類
- architecture difference 類

但前提仍是：

- 能做出 factual、可驗證、不失真的頁

## 3. 視成效擴大 workflow family

只有在第一批 workflow 頁：

- crawl 正常
- 內鏈定位清楚
- 不與 `learn` 發生嚴重 cannibalization

才繼續擴第二批。

## Not Now

- 不新增沒有真實 install path 的 `for/{agent}` 頁
- 不把 `ChatGPT` 自動列入本輪 P0 / P1
- 不用 consumer image-tool SEO 當主要打法
- 不用單純字數作為頁面合格標準
- 不在 capability inventory 還沒對齊前大規模擴頁
- 不把 `music / speech / search / crawl` 當成已完全可安全放大的內容集群

## Working Rule

這一輪內容規劃的工作順序應該固定是：

1. 先補首頁與現有 hub 的 category 語義
2. 再補 `for/{agent}/{task}` 對稱 leaf
3. 再推出受控的 `workflow` family
4. 最後才擴新 agent family 或更激進的 compare / alternative content

## Success Criteria

### 30 days

- 首頁完成 category rewrite
- capability inventory 對齊完成
- `for` family 的 leaf expansion scope 定案

### 60 days

- 至少 `4` 個新的 `for/{agent}/{task}` leaf 上線
- 至少 `2-3` 個現有 guide / learn 頁完成深度重寫
- `workflow` family 路徑與模板定案

### 90 days

- 第一批 `workflow` 頁上線
- hub → leaf → guide / model 的內鏈骨架成形
- 可以開始根據 Search Console impression / click data 回頭微調 query-to-page mapping
