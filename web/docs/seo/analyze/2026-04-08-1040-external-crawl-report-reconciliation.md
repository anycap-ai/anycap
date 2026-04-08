# [SEO-20260408-1040] External crawl report reconciliation and output planning

- Time: `2026-04-08 10:40 CST`
- Node: `SEO-20260408-1040`
- Type: `analyze`
- Status: `done`
- Scope: `external crawl report`, `site inventory reconciliation`, `page-type strategy`, `execution planning`
- Related:
  - [`../index.md`](../index.md)
  - [`2026-03-26-1131-anycap-ai-seo-strategy-baseline.md`](2026-03-26-1131-anycap-ai-seo-strategy-baseline.md)
  - [`2026-03-30-1114-tool-hub-and-capability-strategy-synthesis.md`](2026-03-30-1114-tool-hub-and-capability-strategy-synthesis.md)
  - [`2026-03-30-1545-narrative-ia-audit-and-nav-keyword-mapping.md`](2026-03-30-1545-narrative-ia-audit-and-nav-keyword-mapping.md)
  - [`2026-04-03-1602-capabilities-page-live-audit.md`](2026-04-03-1602-capabilities-page-live-audit.md)
  - [`../todo/2026-04-08-1040-execution-plan-from-external-crawl-report.md`](../todo/2026-04-08-1040-execution-plan-from-external-crawl-report.md)

## Why This Memo Exists

這份外部 crawl 報告的主判斷方向大致正確，但它低估了 AnyCap 目前已存在的 SEO 資產，也把幾個「結構缺口」和「內容深度缺口」混在一起了。

因此這篇 memo 的任務不是重做整份策略，而是把外部報告轉譯成 repo 現況下真正能執行的輸出規劃。

## Executive Summary

外部報告最有價值的結論不是「AnyCap 沒有 SEO 架構」，而是：

1. 目前站點已經有正確的 SEO 骨架。
2. 真正的瓶頸是每個頁型的內容厚度、意圖分層、以及從 hub 到 leaf 的覆蓋密度還不夠。
3. Pixa 可以借鏡「每個明確用途一個 URL」，但不應作為主要對標對象。

更精確地說，AnyCap 現在的問題是：

- 不是沒有 `/for/`，而是只有 `Claude Code` 做出更深的 leaf 結構，`Cursor` / `Codex` / `Manus` 還沒有跟上。
- 不是沒有 guide / learn，而是現有內容已經不少，但 page type 邊界還不夠清楚，擴張時容易把 buyer guide、workflow explainer、how-to 和 problem-intent 混寫。
- 不是沒有 capability / model 架構，而是首頁與部分 hub 頁仍偏品牌敘事，對搜尋意圖的直白承接不夠。

## What The External Report Got Right

### 1. 主體架構方向是對的

AnyCap 現在的站點骨架確實沿著正確方向在長：

- `capabilities`
- `models`
- `for/{agent}`
- `guides`
- `learn`
- `glossary`
- `compare`

這個方向與先前內部 memo 的結論一致，沒有必要推翻。

### 2. 首頁仍然偏品牌頁，不夠像搜尋入口

首頁目前的敘事很強，但仍以品牌主張為主，沒有充分承接：

- `AI agent capabilities`
- `capability runtime`
- `tools for coding agents`
- `image / video / vision for agents`

這個問題和 03-26、03-30、04-03 幾輪內部分析是一致的。

### 3. 內容擴張的下一步確實不是再加一層 hub，而是補 leaf 與 workflow

外部報告抓到的核心原則是對的：

- 每個具體用途都應該有對應 URL
- 現有頁面需要更厚的內容與更清楚的查詢意圖承接
- 不能只有 capability 名稱，還要有 use case / integration / workflow 類頁面

## Where The External Report Is Outdated Or Needs Correction

### 1. `Pixa` 不適合作為主對標

這個判斷正確。Pixa 的流量結構來自：

- consumer-facing tool pages
- App Store distribution

AnyCap 的核心受眾是 agent developers 和 developer teams。更接近的搜尋競爭者不是 consumer image tools，而是：

- agent tooling / agent infra
- model / API / workflow 文檔型站點
- developer ecosystem 內容站

對 AnyCap 來說，更值得關注的是：

- 哪些站在搶 `for {agent}`、`agent tools`、`capability runtime`、`image generation for agents` 這類意圖
- 哪些站靠深技術頁、教學頁、對比頁拿到 developer 搜尋流量

### 2. 站點 inventory 已經比報告裡描述的更完整

目前 `(seo)` 路由下已經有 `56` 個非本地化 page routes，至少包含：

| Family | Count | Notes |
| --- | --- | --- |
| `capabilities` | `11` | 含 hub 與多個 leaf |
| `models` | `8` | 含 hub 與各模型詳情頁 |
| `for` | `7` | 含 hub、`Cursor`、`Codex`、`Manus`、`Claude Code` 與 2 個 Claude leaf |
| `guides` | `7` | 含 hub 與 6 個 guide |
| `learn` | `9` | 含 hub 與 buyer-guide / architecture / workflow 類頁面 |
| `glossary` | `4` | 含 hub 與 3 個 concept pages |
| `compare` | `5` | 含 hub 與 4 個 compare pages |

因此，現在不應該再把問題定義成「缺少架構」。更準確的定義是：

- architecture 已有
- coverage 還不夠均衡
- leaf depth 還不夠
- page intent segmentation 還需要再整理

### 3. `/for/` 的問題不是只有 `Claude Code`

外部報告提到 `/en/for/` 只有 `Claude Code`，這已經過時。

目前 repo 已存在：

- `/for`
- `/for/claude-code`
- `/for/claude-code/image-generation`
- `/for/claude-code/video-generation`
- `/for/cursor`
- `/for/codex`
- `/for/manus`

真正的缺口不是「沒有 `Cursor` / `Codex` / `Manus`」，而是：

1. 只有 `Claude Code` 已經延伸到 task-level leaf
2. `Cursor` / `Codex` / `Manus` 還沒有對稱的 leaf cluster
3. 某些高意圖查詢更適合由 leaf page 吃，而不是只靠平台 hub 吃

也就是說，`/for/` 的下一步是 **depth expansion**，不是從零補齊。

### 4. guide / learn 並非單純「數量不足」

外部報告把 guide 問題定義成「數量與字數都不夠」，這只對了一半。

目前 repo 裡已經有一些相對完整的頁：

- `for/cursor`
- `for/codex`
- `learn/ai-chatbot-vs-ai-agent-for-saas`
- `learn/what-agents-cant-do`

所以現在的更大問題不是「頁太少」而已，而是：

- 有些頁很厚，有些頁偏薄，厚薄不均
- `learn` 同時承載 buyer guide、architecture explainer、workflow page，容易擴張失焦
- `guides` 與 `glossary`、`guides` 與 `learn` 的邊界還可以再明確

### 5. `ChatGPT` 不應在沒有真實 install path 的前提下直接列為優先頁

外部報告提到應補 `ChatGPT` 專屬頁，但這裡需要加 guardrail：

- 如果 AnyCap 沒有清楚、可驗證、可重現的安裝或接入路徑，就不應為了吃字而建 page
- `for/{agent}` 頁面屬於高意圖頁，必須和真實產品路徑一致

因此，`ChatGPT` 可以作為 research backlog，但不應自動進入當前 P0 / P1。

## Strategic Diagnosis

## 1. 架構已經不是最大瓶頸

AnyCap 已經走過「只有首頁與品牌頁」的階段。現狀更接近：

- 有一套可延展的 IA
- 已經有多個可索引 hub
- 已經有一些不錯的 leaf page 與 schema
- 但還沒有形成足夠密的 intent capture 網

## 2. 真正缺的是三層執行密度

### Layer A: hub pages 要更像 category pages

優先對象：

- `/`
- `/capabilities`
- `/for`
- `/guides`
- `/learn`

這些頁需要更直接地回答：

- 這個頁面在服務哪類搜尋意圖
- 哪些任務可在這裡開始
- 下一步要去哪一個 leaf page

### Layer B: existing families 要補對稱 leaf

最明顯的是 `/for/`：

- `Claude Code` 已有 `image-generation`、`video-generation`
- `Cursor` / `Codex` / `Manus` 尚未有對應 task leaf

這代表目前 leaf expansion 的優先方向很明確，不需要再重新發明 hub。

### Layer C: 站上還缺一種「workflow / use case」頁型

現有 page families 已經很多，但還少一種明確承接這類查詢的頁型：

- `how to add image generation to a coding agent`
- `give your coding agent visual output`
- `build a marketing agent that generates product images`
- `use screenshots to debug a SaaS assistant`

這類頁面不太適合塞進 `glossary`，也不應全部擠進 `learn`。更合理的做法是新增一個受控 page family，例如：

- `/workflows/*`
- 或 `/use-cases/*`

## Recommended Output Model

AnyCap repo 已經有明確的 SEO 文檔邊界，因此這份外部報告的最佳輸出方式不是另外散出一套 generic strategy 檔，而是：

1. `analyze`
   - 用來做這份外部 crawl 報告和 repo 現況的 reconciliation
2. `todo`
   - 用來定義接下來 6-12 週的輸出隊列
3. `change-log`
   - 只有在真的改首頁、改 hub copy、加新頁、補 schema、改 metadata、改 sitemap 時才建立

這樣的好處是：

- 不會把分析誤當已落地變更
- 後續每次寫頁、改頁、驗證頁面表現都能自然接續
- 方便把「哪個判斷導致哪個頁面變更」串起來

## Page-Brief Output Shape

後續要真正把這輪規劃變成可寫稿或可實作的輸出時，建議每個新頁 brief 至少固定包含：

1. `Primary query cluster`
2. `Reader / persona`
3. `Job to be done`
4. `Page promise`
5. `Capability / model / workflow proof`
6. `Primary CTA`
7. `Required internal links`
8. `Required schema`
9. `Guardrails`

其中 `Guardrails` 對 AnyCap 特別重要，因為目前公開 capability inventory 仍有對齊風險，不能讓文案先跑到產品前面。

## Planning Decisions From This Memo

### 1. 先補深度，不先加太多新 hub

現階段最有槓桿的不是新增第 N 個導航分類，而是把現有家族做深：

- `for`
- `guides`
- `learn`

### 2. 先做 supported-agent leaf，再考慮新 agent family

優先順序應是：

1. 讓 `Claude Code` 之外的 supported agents 也有 task-level leaves
2. 讓 leaf page 與 capability / model / install guide 形成更完整內鏈
3. 再決定是否值得新增新的 agent family

### 3. 需要一個新的 workflow family，但要受控推出

新增 `workflow` / `use-case` family 是合理的，但不應一次鋪太大。

更好的做法是先出 `3-5` 個最貼近現有產品能力的頁，驗證：

- crawl / index 是否健康
- 是否能自然獲得內鏈與 sitemap 權重
- 是否有比 `learn` 更清楚的 query-to-page 對位

### 4. 首頁重寫仍是 P0

不論 leaf 與 workflow 怎麼擴，首頁依然是最重要的語義入口。這件事沒有被後續擴頁取代。

## Candidate Page Families And First Seeds

## A. `/for/{agent}/{task}` leaf expansion

優先候選：

- `/for/cursor/image-generation`
- `/for/cursor/video-generation`
- `/for/codex/image-generation`
- `/for/codex/video-generation`

次優先候選：

- `/for/manus/image-generation`
- `/for/manus/video-generation`

前提：

- 必須與真實支持的 agent workflow 對齊
- 必須有清楚 install / usage path

## B. `/workflows/*` or `/use-cases/*`

優先候選應盡量用目前最容易自證的能力，不先碰 public claim 還不穩的 capability。

候選方向：

- coding agent generates product mockups
- coding agent creates demo videos
- SaaS assistant screenshot triage
- agent turns research into shareable assets

## C. guide deepening

更適合補的不是抽象理念，而是高度可執行的 how-to：

- how to add image generation to a coding agent
- how to add video generation to a coding agent
- how to give an agent visual output
- how to choose an image model for coding-agent workflows

## Risks And Guardrails

### 1. 不要把「內容厚度」誤解成只追字數

外部報告用字符數判斷薄厚有參考價值，但真正該追的是：

- intent coverage
- evidence density
- workflow clarity
- internal-link usefulness
- schema completeness

### 2. 不要讓新頁面再加劇 capability claim drift

如果公開頁面對「哪些能力 live、哪些能力 early access、哪些能力 coming soon」說法不一致，擴頁只會把問題放大。

### 3. 不要過早複製 consumer tool SEO

AnyCap 的價值在 developer workflow，不在 consumer image tooling。所有新頁都應維持：

- agent-first
- developer-first
- workflow-first

而不是 generic AI tool 文案。

## Final Judgment

這份外部報告最值得採納的，不是它的 inventory，而是它提醒了 AnyCap 現在的主戰場已經從「搭骨架」進入「補密度、補 depth、補 page type」。

接下來的正確輸出方式應是：

1. 用這篇 `analyze` 校正外部報告
2. 用一篇新的 `todo` 把它轉成 phased execution queue
3. 後續每次真正改頁或加頁，再用 `change-log` 記錄落地與驗證
