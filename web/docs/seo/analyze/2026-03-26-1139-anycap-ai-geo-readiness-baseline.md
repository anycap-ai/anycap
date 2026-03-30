# [SEO-20260326-1139] anycap.ai GEO readiness baseline

- Time: `2026-03-26 11:39 CST`
- Node: `SEO-20260326-1139`
- Type: `analyze`
- Status: `done`
- Scope: `anycap.ai`, `web/src/app/`, `web/src/lib/landing-content.ts`, `web/src/lib/site.ts`
- Related: [`../todo/2026-03-26-1203-today-seo-todo.md`](../todo/2026-03-26-1203-today-seo-todo.md)

## GEO Readiness Score

### Overall Score: `48/100`

| Dimension | Weight | Score | Weighted Result | Assessment |
| --- | --- | --- | --- | --- |
| Citability | 25 | `11/25` | `11` | 有清楚產品主張，但缺少可被 AI 直接引用的定義段與具體事實塊 |
| Structural Readability | 20 | `13/20` | `13` | 首頁結構乾淨，但 `/for-human` 偏視覺敘事，對 AI citation 不夠友好 |
| Multi-Modal Content | 15 | `6/15` | `6` | 有視覺化設計與互動，但缺少可被理解的內容型多媒體資產 |
| Authority & Brand Signals | 20 | `4/20` | `4` | 幾乎沒有外部實體訊號、作者訊號、日期訊號或來源引用 |
| Technical Accessibility | 20 | `14/20` | `14` | SSR 基線可用，robots 可抓，但 `llms.txt` 缺失且 sitemap live `500` |

## Platform Breakdown

| Platform | Score | Why |
| --- | --- | --- |
| Google AI Overviews | `53/100` | 頁面可抓、HTML 可讀，但索引面積太小，且缺少 schema、facts、supporting pages |
| ChatGPT Web Search | `42/100` | 站內內容可讀，但品牌外部提及極弱，缺少 Wikipedia / Reddit / LinkedIn / YouTube 類實體訊號 |
| Perplexity | `39/100` | 同樣受制於品牌 mention 不足與可引用內容塊不足 |

## Executive Summary

AnyCap 目前在「傳統 SEO 基線」上有早期可用形態，但在 GEO 層面仍屬於初始階段。最大的限制不是 crawlability，而是 `citability` 與 `entity signals` 都很弱。

換句話說，AI 系統現在可以讀到 `anycap.ai`，但還不容易把 AnyCap 視為值得引用的明確品牌來源。

目前 AnyCap 的 GEO 問題主要集中在四個面向：

1. 缺少可被直接抽取的定義型段落與 facts block
2. 缺少能支撐 AI citation 的 supporting pages
3. 缺少品牌外部提及與實體一致性訊號
4. 缺少 `llms.txt`，且 sitemap live endpoint 失效

## AI Crawler Access Status

目前 `robots.txt` 使用：

- `User-Agent: *`
- `Allow: /`
- 封鎖 `/dashboard`、`/billing`、`/usage`、`/logs`

這代表大多數 AI search crawler 目前都會被允許抓取公開區域。

| Crawler | Status | Notes |
| --- | --- | --- |
| `GPTBot` | Allowed via wildcard | 未顯式聲明，但目前未被封鎖 |
| `OAI-SearchBot` | Allowed via wildcard | 同上 |
| `ChatGPT-User` | Allowed via wildcard | 同上 |
| `ClaudeBot` | Allowed via wildcard | 同上 |
| `PerplexityBot` | Allowed via wildcard | 同上 |
| `CCBot` | Allowed via wildcard | 目前未區分 search vs training |
| `anthropic-ai` | Allowed via wildcard | 同上 |
| `Bytespider` | Allowed via wildcard | 同上 |
| `cohere-ai` | Allowed via wildcard | 同上 |

### GEO Interpretation

- 對 AI search visibility 來說，目前不是「被擋住」的問題。
- 真正的問題是：即使可以抓，站內也還沒有足夠多「值得被引用」的結構化內容。
- 如果未來要區分 search 與 training，可考慮明確允許 `GPTBot`、`OAI-SearchBot`、`ClaudeBot`、`PerplexityBot`，再單獨決定是否限制 `CCBot` 等 training crawler。

## llms.txt Status

### Current Status: `missing`

- `https://anycap.ai/llms.txt` 目前回 `404`

### Impact

- 這不會阻止搜尋引擎收錄，但會錯失一個非常低成本的 AI crawler guidance 入口。
- 對於像 AnyCap 這種本來就服務 AI agents 的產品，`llms.txt` 具備高戰略匹配度。

### Recommendation

建議在 root 新增 `llms.txt`，至少包含：

- 品牌定義
- 最重要的入口頁
- capability summary
- installation / docs / status / compare 類關鍵頁

## RSL 1.0 Status

### Current Status: `not detected`

- 目前站內與程式碼中都未看到 RSL 1.0 或 machine-readable AI licensing 設定。

### Interpretation

- 這不是短期阻塞問題。
- 但若未來 AnyCap 想對 AI crawler / training 使用邊界更明確，RSL 是值得追蹤的下一步。

## Brand Mention Analysis

### Observed External Signal Level: `very weak`

本次以公開搜尋與直接抓取做快速檢查，未發現明確的：

- Wikipedia / Wikidata presence
- Reddit 討論面
- YouTube mention 面
- LinkedIn 實體面

另外，首頁導出的幾個品牌權威連結在本次公開抓取中也沒有形成穩定可驗證訊號：

- `https://github.com/anycap-ai/anycap` 抓取回 `404`
- `https://github.com/anycap-ai/anycap/releases` 抓取回 `404`
- `https://skills.sh/anycap-ai/anycap` 抓取回 `404`

### GEO Interpretation

- 對 ChatGPT / Perplexity 而言，這是很大的 authority deficit。
- 即使站內文案不差，若品牌在外部缺少穩定 mention 與實體對齊，AI citation 仍然偏弱。
- 這一點對 AnyCap 特別重要，因為產品本身就在 agent ecosystem 中，外部實體訊號會比一般 SaaS 更影響 AI search trust。

### Action Note

需要確認：

1. GitHub repo 是否尚未公開
2. `skills.sh` listing 是否尚未上線或 URL 已變更
3. 是否已有可公開的 LinkedIn / YouTube / Reddit / docs entity surface

## Server-Side Rendering Check

### Result: `pass`

依據：

- live fetch 能直接取得首頁與 `/for-human` 的主要文案
- `web/src/app/page.tsx` 與 `web/src/app/for-human/page.tsx` 為 server component
- 主要內容不是 client-only hydrate 後才出現

### GEO Interpretation

這是目前 AnyCap 的一個加分點。AI crawler 與非 JS 執行環境可以直接讀到主內容，不會被前端渲染阻塞。

## Passage-Level Citability

### Current State

首頁有幾個接近可引用的句子，但大多仍偏品牌敘事，而不是 AI 可直接引用的答案型內容。

### Relatively Strong Existing Passages

#### Candidate 1

`AnyCap gives you all of these through a single command-line tool. One binary. One auth. Structured I/O.`

優點：

- 明確
- 可被摘錄
- 帶有產品差異化

缺點：

- 缺少上下文定義
- 沒有列出 capability 範圍與適用場景
- 缺少可驗證事實或具體範例

#### Candidate 2

`We're building the utility layer for the age of Agents — so they stop managing tools and start doing work.`

優點：

- 品牌感強

缺點：

- 更像宣言，不像 citation block
- 對搜尋回答的直接幫助有限

### Current Citability Diagnosis

目前缺少符合 GEO 最佳實踐的 134-167 字自包含答案塊，尤其缺少這幾種段落：

- `What is AnyCap?`
- `What can AnyCap do today?`
- `How do AI agents use AnyCap?`
- `What is the difference between AnyCap and other agent tool platforms?`

## Content Reformatting Suggestions

### Highest-Impact Rewrite 1: Definition Block

首頁或 `/for-human` 開頭需要一個 134-167 字、可單獨抽出的 answer block，直接回答：

`What is AnyCap?`

應包含：

- AnyCap 是什麼
- 給誰用
- today-available capabilities
- how it is accessed

### Highest-Impact Rewrite 2: Capability Availability Block

目前 capability 表只列 2 項，且還有 `More capabilities coming soon.`。對 AI citation 來說，這會讓現況顯得模糊。

建議新增清楚的 availability matrix：

| Capability | Status | Access Path | Notes |
| --- | --- | --- | --- |
| Image understanding | Live | CLI | Current |
| Video analysis | Live | CLI | Current |
| Music | Planned | TBD | Not live yet |
| Speech | Planned | TBD | Not live yet |
| Search | Planned | TBD | Not live yet |
| Crawl | Planned | TBD | Not live yet |

### Highest-Impact Rewrite 3: Install + Verify Block

AI 搜尋偏好可執行答案。建議把 `install`, `login`, `status`, `first command` 整理成一個可引用的步驟塊。

### Highest-Impact Rewrite 4: Framework-Specific Block

AnyCap 明顯與 Cursor、Claude Code、Codex 等生態有關，但目前缺少每個框架對應的 self-contained page / answer block。

### Highest-Impact Rewrite 5: Comparison Block

若未來新增 compare pages，請固定使用：

- product definition
- who it is for
- capability coverage
- auth / install model
- when to choose which tool

這種格式最容易被 AI search 摘取。

## Structural Readability Review

### What Works

- 首頁有清楚的 `H1`、`H2`
- lists、tables、commands 形式對 AI 讀取友好
- 首頁文字比 `/for-human` 更適合 citation

### What Hurts GEO

- `/for-human` 的視覺敘事很強，但很多文句過短、過碎、過品牌化
- 缺少 question-led heading
- 缺少 FAQ / definition / comparison blocks
- 缺少 publication date / last updated date

## Schema Recommendations

### Immediate

1. Homepage:
   - `Organization`
   - `WebSite`
   - `SoftwareApplication`
2. `/for-human`:
   - `AboutPage` 或補強 `SoftwareApplication`
3. Future pages:
   - capability pages 用 `SoftwareApplication`
   - guides 用 `TechArticle`
   - compare pages 可搭配 `FAQPage` 風格內容結構，但避免濫用 schema

### Entity Enrichment

未來可補：

- `sameAs` 指向 GitHub、LinkedIn、YouTube、X、docs
- `datePublished`
- `dateModified`
- author / organization identity

## Top 5 Highest-Impact Changes

1. 修復 `sitemap.xml` live `500`
2. 新增 `/llms.txt`
3. 在首頁與 `/for-human` 增加 citation-ready definition / fact blocks
4. 新增可被引用的 capability / install / compare 類支撐頁
5. 建立外部品牌實體訊號，至少先補可公開且穩定的 GitHub / LinkedIn / skills.sh / community presence

## Query-Level GEO Opportunities

最值得優先切入的 AI-search 問題型查詢：

- `What is AnyCap?`
- `How do I give AI agents image and video capabilities?`
- `What tools can Cursor or Claude Code use for image read?`
- `What is a capability runtime for AI agents?`
- `AnyCap vs Composio`

## GEO Roadmap

### P0

- 修 `sitemap.xml`
- 新增 `llms.txt`
- 確認所有對外品牌連結可公開訪問
- 補首頁 definition block

### P1

- 上 capability pages
- 上 install guide pages
- 補 schema
- 加 last updated date

### P2

- 上 compare pages
- 建立 glossary / concept pages
- 建立 Reddit / LinkedIn / YouTube 可被引用的品牌面

## Final Judgment

AnyCap 很適合做 GEO，因為產品本身就位在 AI agent 與 capability infrastructure 的交叉點，但目前仍停留在「可讀」而非「可引用」階段。

對 AnyCap 來說，GEO 的關鍵不是先追求大量頁面，而是先做出少量但高密度、可抽取、可驗證、可對齊實體訊號的頁面。只要把 definition blocks、capability pages、`llms.txt`、外部品牌實體訊號補起來，GEO 進步速度會比傳統 SEO 更快。
