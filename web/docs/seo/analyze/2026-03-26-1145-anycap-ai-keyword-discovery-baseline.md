# [SEO-20260326-1145] anycap.ai keyword discovery baseline

- Time: `2026-03-26 11:45 CST`
- Node: `SEO-20260326-1145`
- Type: `analyze`
- Status: `done`
- Scope: `anycap.ai`, keyword discovery, page-intent mapping, agent ecosystem search language
- Related: [`../change-log/2026-03-26-1145-anycap-ai-keyword-discovery-baseline.md`](../change-log/2026-03-26-1145-anycap-ai-keyword-discovery-baseline.md)

## Executive Summary

這次 keyword discovery 最重要的發現不是某一個單字，而是一個語言層差：

- **AnyCap 想講的是**：`capability runtime`、`capability layer`
- **市場正在搜的是**：`tools`、`skills`、`MCP tools`、`add tools to ...`、`... tools list`

這代表 AnyCap 的 SEO / GEO 不能只用品牌內部語言。更有效的打法是：

1. 用 `agent-native capability runtime` 建立類別與品牌定位
2. 用 `tools / skills / MCP tools / add tools` 承接真實搜尋需求

換句話說，**品牌敘事要吃 category，頁面語言要吃 demand。**

## Research Method

本次優先使用以下方法做第一輪 keyword discovery：

1. Seed expansion
2. Google autocomplete / suggest query signals
3. Reverse-engineer adjacent competitors
4. Ecosystem-specific keyword expansion

### Data Limitations

- 原本預計使用 `Semrush` MCP 補 volume / KD / related terms，但目前 auth 失敗，無法取得量化資料。
- 因此這輪以 **autocomplete presence + competitor language + intent fit** 為主，先建立第一版 keyword map。
- 後續建議補做 Semrush / Google Trends / Keyword Planner 驗證。

## Core Insight

### The Search Language Gap

AnyCap 目前的品牌語言比較接近：

- capability runtime
- capability layer
- installable capabilities

但從 autocomplete 與相鄰市場語義來看，使用者更自然會搜尋：

- tools
- skills
- mcp tools
- tools list
- add tools to x
- x tools github
- x skills examples

### Strategic Implication

這不是要放棄 `capability runtime`，而是要雙軌：

- **Brand / GEO layer**：繼續教育市場 `agent-native capability runtime`
- **SEO acquisition layer**：用 `tools / skills / mcp tools` 吃搜尋入口

## Direct Demand Signals From Autocomplete

以下查詢都在 Google suggest 中出現過明確延伸，代表已有搜尋語言與需求輪廓。

### High-Signal Seeds

| Seed | Suggest Signal | What It Means |
| --- | --- | --- |
| `ai agent tools` | `list`, `free`, `for coding`, `github`, `frameworks`, `vs mcp` | 市場已經把這個類別當成真實搜尋詞 |
| `ai agent skills` | `github`, `vs tools`, `marketplace`, `repo`, `examples` | `skills` 是明確存在的搜索語言 |
| `claude code tools` | `list`, `github`, `docs`, `vs skills`, `available`, `reddit` | Claude Code 生態是高價值切口 |
| `claude code skills` | `marketplace`, `github`, `examples`, `docs`, `library` | `skills` 在 Claude Code 生態已經很自然 |
| `cursor agent tools` | `mcp tools`, `capabilities tools coding` | Cursor 生態會把需求理解成 tools / MCP tools |
| `cursor mcp tools` | `list`, `github`, `not working` | 有安裝型與故障型需求 |
| `cursor skills` | `skills.md`, `examples`, `github`, `marketplace`, `vs commands` | `Cursor + skills` 是可切頁型 |
| `add tools to cursor` | `add mcp tools to cursor` | 安裝與 how-to intent 明確 |
| `codex tools` | `github`, `list`, `cli tools`, `mcp tools`, `like tools` | Codex 生態也存在工具擴充搜尋 |
| `opencode tools` | `github`, `list`, `config`, `custom tools`, `mcp tools` | OpenCode 已經有實用型查詢語言 |
| `openclaw tools` | `tools.md`, `list`, `config`, `vs skills`, `web`, `not working` | OpenClaw 是很好的長尾先手位 |

### Low-Signal / Category-Creation Seeds

| Seed | Signal | Interpretation |
| --- | --- | --- |
| `capability layer ai agents` | no suggestions | 這是品牌教育型語言，不是現成需求型語言 |
| `agent-native capabilities` | weak/no direct signal | 可做 GEO 類別詞，但不適合當唯一 acquisition keyword |

## Competitor Language Review

### Composio

主要語義：

- tools
- auth
- MCP client
- apps
- execute across apps
- agent tools

### Toolhouse

主要語義：

- agents
- workflows
- integrations
- data
- MCPs
- automation

### Firecrawl

主要語義：

- web search
- web scraping
- AI platforms
- agent frameworks
- structured outputs

### Browserbase

主要語義：

- AI agents
- web automation
- navigate / extract / act

### Competitor Pattern

相鄰玩家大多不會先教育一個全新名詞，而是先借力市場已知需求語言：

- tools
- search
- scraping
- integrations
- workflows
- browser automation

### Implication For AnyCap

AnyCap 要建立新類別沒有問題，但不能只靠新類別詞。

更好的方式是：

- 用 `tools / skills / add tools / mcp tools` 拿流量入口
- 用頁面內容把這些需求重新框定成 `agent-native capability layer`

## Keyword Strategy Framework

## Layer 1: Demand Capture Keywords

這層優先追求「有人真的會這樣搜」。

### Cluster A: Agent Tools

- `ai agent tools`
- `ai agent tools list`
- `ai agent tools for coding`
- `ai agent tools github`
- `ai agent tools vs mcp`

### Cluster B: Agent Skills

- `ai agent skills`
- `ai agent skills github`
- `ai agent skills examples`
- `ai agent skills vs tools`
- `ai agent skills marketplace`

### Cluster C: Claude Code

- `claude code tools`
- `claude code tools list`
- `claude code tools github`
- `claude code tools vs skills`
- `claude code skills`
- `claude code skills examples`
- `claude code skills docs`
- `add tools to claude code`

### Cluster D: Cursor

- `cursor agent tools`
- `cursor mcp tools`
- `cursor mcp tools list`
- `cursor skills`
- `cursor skills.md`
- `cursor skills examples`
- `add tools to cursor`
- `add mcp tools to cursor`

### Cluster E: Codex / OpenCode / OpenClaw

- `codex tools`
- `codex tools list`
- `codex mcp tools`
- `codex cli tools`
- `opencode tools`
- `opencode tools list`
- `opencode custom tools`
- `opencode mcp tools`
- `openclaw tools`
- `openclaw tools.md`
- `openclaw tools list`
- `openclaw tools vs skills`

## Layer 2: Brand-Shaping Keywords

這層可能沒那麼高 volume，但它決定 AnyCap 被理解成什麼。

- `agent-native capability runtime`
- `capability layer for ai agents`
- `installable capabilities for agents`
- `how do ai agents get new capabilities`
- `what is a capability runtime for ai agents`
- `tools vs capabilities for ai agents`
- `mcp vs tools for ai agents`

## Layer 3: Use-Case Keywords

這層結合 AnyCap 現有與未來能力。

### Live / Near-Live Friendly

- `image understanding for ai agents`
- `video analysis for ai agents`
- `add image understanding to cursor`
- `add video analysis to claude code`
- `tools for coding agents image understanding`

### Future / Guarded

- `search tools for ai agents`
- `crawl tools for ai agents`
- `speech tools for ai agents`

這些可以先做 backlog，但若產品尚未穩定上線，不建議過度承諾。

## Opportunity Ranking

### P0: Highest Priority

這些關鍵字同時滿足：

- autocomplete 已有訊號
- 和 AnyCap 品牌敘事高度吻合
- 可直接對應新頁面

| Priority | Keyword Cluster | Why |
| --- | --- | --- |
| P0 | `claude code tools` / `claude code skills` | 搜尋語言成熟，和 AnyCap 的安裝型價值非常貼近 |
| P0 | `cursor skills` / `cursor mcp tools` / `add tools to cursor` | 安裝意圖非常強，可直接承接 how-to |
| P0 | `ai agent tools` / `ai agent skills` | 類別入口詞，適合首頁與 hub page |
| P0 | `codex tools` | 新平台詞，競爭可能尚未完全固化 |
| P0 | `opencode tools` / `openclaw tools` | 長尾且更早期，容易先佔位 |

### P1: Strategic Category Keywords

| Priority | Keyword | Why |
| --- | --- | --- |
| P1 | `what is a capability runtime for ai agents` | 雖非大眾市場語言，但可塑造類別 |
| P1 | `tools vs capabilities for ai agents` | 很適合做 explanation + positioning 頁 |
| P1 | `ai agent tools vs mcp` | autocomplete 已有直接訊號 |

### P2: Capability Keywords

| Priority | Keyword | Why |
| --- | --- | --- |
| P2 | `image understanding for ai agents` | 和現有能力對齊，但搜尋語言還需驗證 |
| P2 | `video analysis for ai agents` | 和現有能力對齊，可做功能頁 |
| P2 | `search tools for ai agents` | 有機會，但需等 capability 與內容更完整 |

## Recommended First Pages

### Page Set 1: Demand-Capture Pages

- `/for/claude-code`
- `/for/cursor`
- `/for/codex`
- `/for/opencode`
- `/for/openclaw`

### Page Set 2: Language Bridge Pages

- `/tools`
- `/skills`
- `/guides/add-tools-to-cursor`
- `/guides/add-tools-to-claude-code`
- `/guides/ai-agent-tools-vs-mcp`

### Page Set 3: Category-Shaping Pages

- `/glossary/agent-capability-runtime`
- `/glossary/installable-agent-capabilities`
- `/compare/tools-vs-capabilities-for-agents`

## Keyword-to-Page Mapping

| Page | Primary Keyword | Secondary Keywords |
| --- | --- | --- |
| `/for/claude-code` | `claude code tools` | `claude code skills`, `add tools to claude code`, `claude code tools vs skills` |
| `/for/cursor` | `cursor skills` | `cursor mcp tools`, `add tools to cursor`, `cursor agent tools` |
| `/for/codex` | `codex tools` | `codex mcp tools`, `codex cli tools` |
| `/for/opencode` | `opencode tools` | `opencode custom tools`, `opencode mcp tools` |
| `/for/openclaw` | `openclaw tools` | `openclaw tools.md`, `openclaw tools vs skills` |
| `/tools` | `ai agent tools` | `ai agent tools list`, `ai agent tools for coding`, `ai agent tools github` |
| `/skills` | `ai agent skills` | `ai agent skills github`, `ai agent skills examples`, `ai agent skills vs tools` |
| `/guides/ai-agent-tools-vs-mcp` | `ai agent tools vs mcp` | `tools vs capabilities for ai agents`, `mcp vs tools for ai agents` |
| `/glossary/agent-capability-runtime` | `what is a capability runtime for ai agents` | `capability layer for ai agents`, `agent-native capability runtime` |

## Copy Implications

### Rule 1

首頁可以講 `capability runtime`，但 acquisition pages 必須大量使用：

- tools
- skills
- add tools
- mcp tools

### Rule 2

每個 `for/*` 頁面都應該有一個 bridge sentence：

`AnyCap gives <product> users a cleaner way to install tools and capabilities through one consistent interface.`

這樣同時吃到：

- 搜尋語言：`tools`
- 品牌語言：`capabilities`

### Rule 3

不要用一個頁面同時追太多 ecosystem 關鍵字。`Cursor`、`Claude Code`、`Codex`、`OpenCode`、`OpenClaw` 應獨立。

## Risks

- 若只追 `capability runtime`，會教育市場但吃不到早期流量。
- 若只追 `tools`，則會失去 AnyCap 的類別差異化。
- 若過早寫大量能力頁，但產品 availability 還不穩，會造成內容承諾過度。

## Recommended Next Validation Pass

這一輪完成後，最該補的是量化驗證：

1. Semrush auth 修復後跑 keyword expansion
2. Google Trends 比對：
   - `tools` vs `skills`
   - `claude code tools` vs `claude code skills`
   - `cursor skills` vs `cursor mcp tools`
3. Keyword Planner 補 volume
4. 競品 landing pages / docs 再做 organic keyword reverse-engineering

## Final Judgment

AnyCap 當前最值得打的不是一個「完美命名」，而是一個雙層 keyword strategy：

- **對市場說人話**：`tools`、`skills`、`add tools`
- **對品牌說定位話**：`agent-native capability runtime`

只要頁面層能把這兩套語言橋接起來，AnyCap 就可以同時拿到搜尋入口與類別心智。
