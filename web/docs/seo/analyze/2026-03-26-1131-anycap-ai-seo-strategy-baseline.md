# [SEO-20260326-1131] anycap.ai SEO strategy baseline

- Time: `2026-03-26 11:31 CST`
- Node: `SEO-20260326-1131`
- Type: `analyze`
- Status: `done`
- Scope: `anycap.ai`, `web/src/app/`, `web/src/lib/site.ts`
- Related: [`../todo/2026-03-26-1203-today-seo-todo.md`](../todo/2026-03-26-1203-today-seo-todo.md)

## Executive Summary

AnyCap 目前已具備品牌落地頁、基本 metadata、`robots.txt` 與 sitemap 程式碼框架，但整體站點仍屬於非常早期的 SEO 狀態。核心限制不是「文案不夠好」，而是目前可被搜尋引擎理解與索引的公開資產太少，還沒有形成可承接非品牌搜尋流量的內容架構。

這份 baseline strategy 的主目標不是立刻搶高競爭大詞，而是先把 `anycap.ai` 從「2 個公開頁面的品牌展示站」升級成「能持續擴張的 agent tooling SEO 資產」。

## Discovery

| Item | Observation |
| --- | --- |
| Business type | AI agent tooling / developer infrastructure / capability runtime |
| Core offer | One CLI + one auth + one interface for multimodal and web capabilities |
| Primary audience | 使用 Cursor、Claude Code、Codex、OpenCode 等 agent workflow 的開發者與團隊 |
| Secondary audience | 想要為 agent 補能力的 AI infra / platform / automation builder |
| Geography | 目前應以全球英文流量為主 |
| Funnel shape | 研究導向、比較導向、安裝導向 |
| Primary conversion | 安裝 skill、安裝 CLI、登入、執行第一個 capability |
| Assumed constraints | 早期產品、公開頁面少、內容與 social proof 尚在建立期 |

## Current Site Assessment

### Strengths

- 品牌定位鮮明，`agent-first` 記憶點強。
- 首頁與 `/for-human` 已經完成雙軌訊息分流。
- 基本 metadata、canonical、robots 設定已經存在。
- `robots.txt` 已正確封鎖 dashboard 類私人頁面。

### Critical Gaps

1. 目前 sitemap live endpoint 回傳 `500`，這是最高優先級的技術 SEO 問題。
2. 目前公開可索引頁面只有 `/` 與 `/for-human`，站點可承接的搜尋意圖極少。
3. 站內尚未看到 JSON-LD schema 實作，搜尋引擎與 AI 搜尋對實體理解不足。
4. 站內尚未看到 analytics / search console 類追蹤接線，後續難以建立 SEO baseline。
5. 首頁標題與描述雖清楚，但 category intent 還偏弱，尚未強化 `AI agent tools`、`agent capabilities`、`multimodal CLI` 等搜尋語義。
6. 落地頁、Skill、其他文件對 capability coverage 的表述有不一致風險，這會影響信任與內容策略。

### Strategic Diagnosis

目前 `anycap.ai` 更像品牌入口，不像搜尋入口。

要讓 SEO 開始有效，最重要的不是先寫 blog，而是先把以下三件事建立起來：

1. category pages
2. capability pages
3. framework / use-case pages

## Competitive Landscape

以下更偏「搜尋競爭者」而非完全等價產品。對 AnyCap 來說，SEO 競爭發生在「agent tooling / capability / integration / browser / crawl / sandbox」這些意圖層。

| Competitor | Overlap with AnyCap | Content Strength | Estimated Authority | AnyCap Opportunity |
| --- | --- | --- | --- | --- |
| Firecrawl | 強，吃掉 search / crawl / extract 類 intent | use-case pages、API pages、agent-ready messaging 明確 | High | 用 `one CLI for multimodal + web capabilities` 切更廣的 capability 敘事 |
| Composio | 強，吃掉 agent tools / integrations / tool router intent | docs 與 integration surface 很大 | High | 以 `capability runtime`、更輕安裝路徑、agent-first onboarding 做差異化 |
| Toolhouse | 中高，吃掉 agent tools platform / agent backend intent | 平台敘事完整，對 agent builder 友好 | Medium-High | 強打 CLI + skill + multimodal capability 的可操作性 |
| Browserbase / Stagehand | 中，吃掉 browser use / browser for agents intent | category 語義強、品牌清晰 | High | 避免正面只打 browser，改以 broader capability layer 切入 |
| E2B | 中，吃掉 runtime / sandbox / coding agent infra intent | technical docs 與 developer narrative 強 | High | 從「agent can do real-world actions, not only code execution」建立差異 |

## Keyword Strategy

### Core Principle

前 3 個月不建議主打過泛的頭部詞，例如：

- `AI agents`
- `agent platform`
- `AI tools`

更合理的打法是先拿長尾、高意圖、和現有產品敘事高度吻合的組合詞。

### Priority Keyword Clusters

#### Cluster A: Category Positioning

- `ai agent tools`
- `ai agent capabilities`
- `capability runtime for ai agents`
- `agent cli`
- `multimodal cli for ai agents`
- `tools for coding agents`

#### Cluster B: Capability Intent

- `image understanding for ai agents`
- `video analysis for ai agents`
- `web search for ai agents`
- `web crawling for ai agents`
- `download files for ai agents`
- `text to speech for ai agents`

#### Cluster C: Framework / Workflow Intent

- `anycap for cursor`
- `anycap for claude code`
- `anycap for codex`
- `install anycap cli`
- `install skills for ai agents`
- `agent skills cli`

#### Cluster D: Comparison Intent

- `anycap vs composio`
- `anycap vs firecrawl`
- `anycap vs toolhouse`
- `composio alternative for ai agents`
- `firecrawl alternative for agent workflows`

#### Cluster E: Educational / GEO Intent

- `what is a capability runtime`
- `how to give ai agents image and video capabilities`
- `mcp vs cli for ai agents`
- `how to add web search to coding agents`
- `how to give cursor agent multimodal tools`

## Recommended Site Architecture

基於 AnyCap 現況，建議用 SaaS 模板的簡化版，而不是一開始就鋪太大。

```text
/
├── /for-human
├── /capabilities
│   ├── /image-understanding
│   ├── /video-analysis
│   ├── /web-search
│   ├── /web-crawl
│   ├── /download
│   └── /status
├── /for
│   ├── /cursor
│   ├── /claude-code
│   └── /codex
├── /guides
│   ├── /install-anycap
│   ├── /install-anycap-on-cursor
│   ├── /give-ai-agents-image-understanding
│   └── /give-ai-agents-video-analysis
├── /compare
│   ├── /anycap-vs-composio
│   ├── /anycap-vs-firecrawl
│   └── /anycap-vs-toolhouse
├── /blog
└── /glossary
```

## Information Architecture Rules

1. Home page 負責品牌敘事與主張，不負責吃完所有 SEO intent。
2. Capability page 負責承接功能型搜尋詞。
3. Framework page 負責承接 `for Cursor`、`for Claude Code` 這類高意圖搜尋。
4. Guide page 負責承接教學型、安裝型、問題解決型搜尋。
5. Compare page 負責承接高轉換比較型搜尋。

## Internal Linking Strategy

| From | Link to | Purpose |
| --- | --- | --- |
| Home | `/capabilities`, `/for/*`, `/guides/install-anycap` | 將品牌流量導向可排名頁面 |
| Capability pages | guides + compare pages | 建立主題集群與下游轉換 |
| Framework pages | install guide + capability pages | 讓框架意圖導向安裝與使用 |
| Compare pages | capability pages + install guide | 讓比較流量有清楚 CTA |
| Blog / glossary | relevant capability pages | 提升主題權重，避免孤島頁面 |

## Content Strategy

### Phase 1 Content Set

優先不要做大量 blog，而是先補齊最有機會承接 intent 的 landing pages：

1. `/capabilities`
2. `/capabilities/image-understanding`
3. `/capabilities/video-analysis`
4. `/for/cursor`
5. `/for/claude-code`
6. `/guides/install-anycap`

### Phase 2 Content Set

1. `/guides/install-anycap-on-cursor`
2. `/guides/give-ai-agents-image-understanding`
3. `/compare/anycap-vs-composio`
4. `/compare/anycap-vs-firecrawl`
5. `/glossary/capability-runtime`
6. `/glossary/agent-skills`

### Editorial Rules

- 每頁聚焦一個明確 intent，不要把多個搜尋意圖混在同一頁。
- capability 頁面要包含：做什麼、給誰用、怎麼調用、輸入輸出範例、與其他工具差異。
- guide 頁面要有完整步驟、前置條件、常見錯誤、驗證指令。
- compare 頁面只寫可驗證事實，避免空泛攻擊式文案。
- 尚未 GA 的功能不要做成強轉換 landing page，避免內容承諾超過產品實際供給。

## E-E-A-T and Trust Plan

AnyCap 現階段最需要的不是傳統企業背書，而是 developer trust signals。

建議優先補強：

- GitHub release 與 repo activity 的導流
- 明確的 capability availability matrix
- Quick start 可驗證範例
- 安裝後驗證命令
- roadmap / status / changelog 類可信度資產
- 未來加入真實使用案例、實測 benchmark、agent workflow demo

## Technical SEO Foundation

### P0

1. 修復 `https://anycap.ai/sitemap.xml` 的 `500`。
2. 確保 sitemap 只列出應索引的公開頁面。
3. 接上 Google Search Console 與 Bing Webmaster Tools。
4. 接上 analytics，至少能追 `install`, `login`, `github release click`, `docs click`。

### P1

1. 首頁與 `/for-human` 補 `Organization`、`WebSite`、`SoftwareApplication` schema。
2. 後續 capability 與 guide 頁面補對應 schema。
3. 規劃 `llms.txt`，讓 AI 搜尋與 agent crawler 更容易理解可讀入口。
4. 建立標準化 metadata 規則，避免未來擴頁時 title / description 失控。

### P2

1. 規劃 OG image generation 規則。
2. 建立內容發佈後的 index request 流程。
3. 追蹤 CWV，目標：
   - LCP `< 2.5s`
   - INP `< 200ms`
   - CLS `< 0.1`

## GEO / AI Search Strategy

AnyCap 非常適合做 GEO，因為產品本身就服務 agent 與 developer workflow。

優先策略：

1. 讓每個 capability page 都有可被引用的定義句與 step-by-step usage。
2. 用表格清楚列出 capability、command、input、output、availability。
3. 發布 comparison 與 glossary 內容，讓 AI 搜尋更容易引用定義與差異。
4. 將產品事實集中在 `anycap.ai`，不要只散落在 GitHub 與 skill files。

## 4-Phase Implementation Roadmap

### Phase 1: Foundation (weeks 1-4)

- 修 sitemap 500
- 上 Search Console / Bing / analytics
- 補 schema baseline
- 補 4 到 6 個高意圖 landing pages
- 統一 capability messaging

### Phase 2: Expansion (weeks 5-12)

- 上線 framework pages
- 上線 installation / use-case guides
- 做第 1 批 comparison pages
- 建立 glossary / docs-like evergreen pages

### Phase 3: Scale (weeks 13-24)

- 建立固定內容節奏
- 擴寫 capability cluster
- 補案例、benchmark、實作範例
- 系統化做 GEO-friendly structure

### Phase 4: Authority (months 7-12)

- 發布原創研究、比較資料、遷移故事
- 爭取 repo / community / newsletter / podcast mention
- 讓 AnyCap 成為 `agent capability` 類別的可引用來源

## KPI Targets

| Metric | Baseline | 3 Month | 6 Month | 12 Month |
| --- | --- | --- | --- | --- |
| Indexed public pages | `2` | `10+` | `25+` | `60+` |
| Non-branded landing pages | `0` | `6+` | `15+` | `35+` |
| Ranking keywords in top 20 | `TBD after GSC` | `10-20` | `30-60` | `80-150` |
| Organic clicks / month | `TBD after GSC` | `100-300` | `500-1,200` | `2,000-5,000` |
| AI-search citation-ready pages | `0` | `6+` | `15+` | `30+` |
| Core Web Vitals pass rate | `TBD` | `>= 80%` | `>= 90%` | `>= 95%` |

## Recommended First 10 Execution Tasks

1. 修正 live sitemap `500`
2. 建立 SEO tracking baseline
3. 統一 capability availability 說法
4. 新增 `/capabilities`
5. 新增 `/capabilities/image-understanding`
6. 新增 `/capabilities/video-analysis`
7. 新增 `/for/cursor`
8. 新增 `/guides/install-anycap`
9. 補首頁與 `/for-human` schema
10. 建立 compare / glossary backlog

## Risks and Guardrails

- 不要用大量薄內容硬鋪頁面數。
- 不要為未上線功能創建高承諾 SEO 頁面。
- 不要把所有搜尋意圖都塞回首頁。
- 不要只做 blog，卻缺 capability / compare / guide 類高意圖頁。

## Success Criteria

這份計畫成功的標誌不是「寫完文件」，而是：

1. `anycap.ai` 從 2 個公開頁面擴展成有結構的搜尋入口
2. 搜尋流量開始不只來自品牌詞
3. AI 搜尋能從站內直接引用明確 capability 與比較內容
4. organic 流量能導向安裝、登入與首次使用
