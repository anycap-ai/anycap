# [SEO-20260330-1114] Tool hub and capability cluster strategy synthesis

- Time: `2026-03-30 11:14 CST`
- Node: `SEO-20260330-1114`
- Type: `analyze`
- Status: `done`
- Scope: `seo-plan`, `keyword-discovery`, `tool hub`, `skills hub`, `capability cluster`, `page strategy`
- Related:
  - [`../index.md`](../index.md)
  - [`2026-03-30-1037-anycap-ability-cluster-synthesis.md`](2026-03-30-1037-anycap-ability-cluster-synthesis.md)
  - [`2026-03-26-1159-semrush-keyword-builder-synthesis.md`](2026-03-26-1159-semrush-keyword-builder-synthesis.md)
  - [`../todo/2026-03-30-1038-ability-cluster-follow-ups.md`](../todo/2026-03-30-1038-ability-cluster-follow-ups.md)

## Executive Summary

這兩份新 CSV 幫 AnyCap 補了兩個很重要、但方向完全不同的訊號：

1. **`agent-tool-hub_clusters_2026-03-30.csv` 明確強化了 `skills / tools / SDK / API / framework education` 這條線。**
2. **`ai-capability_clusters_2026-03-30.csv` 表面上像在講 capability，但實際上噪音極高，不能當成多模態能力擴張地圖。**

因此，這輪最重要的策略更新不是「多做更多 capability 子頁」，而是：

- 繼續守住 `Claude Code + agent CLI + installable capabilities`
- 把 `skills` 從輔助語言提升成更值得獨立承接的 hub
- 把 `tools` 理解成 **curated discovery / directory**，而不是泛 `best ai tools`
- 把 `SDK / API / framework / protocol` 內容視為新的中層教育支線
- 對 `speech / music / search / crawl / multimodal` 保持克制，等專項 keyword research 再擴頁

## Source Files

- `/Users/tyluo/Downloads/agent-tool-hub_clusters_2026-03-30.csv`
- `/Users/tyluo/Downloads/ai-capability_clusters_2026-03-30.csv`
- `web/src/app/(seo)/`
- `web/docs/seo/`

## Dataset Snapshot

| File | Rows | Topics | Main Signal | Main Risk |
| --- | --- | --- | --- | --- |
| `agent-tool-hub_clusters_2026-03-30.csv` | `922` | `10` | `skills`, `tools`, `SDK/API`, `frameworks`, `directory/discovery` | 泛 `marketing`、`customer service`、`agency` 噪音很大 |
| `ai-capability_clusters_2026-03-30.csv` | `1849` | `9` | 表面上有 capability / multimodal / speech / video 詞 | Topic 命名和實際 intent 嚴重錯位，尤其 `speech-to-text` 區塊其實混了大量 TTS / consumer voice |

### `agent-tool-hub` Topic Distribution

| Topic | Rows | Aggregate Volume | Judgment |
| --- | --- | --- | --- |
| `ai agent use cases & applications` | `340` | `89710` | 體量最大，但大多不適合 AnyCap |
| `ai agent development frameworks & harnesses` | `152` | `30620` | 高價值教育內容池 |
| `autonomous ai agents` | `66` | `28790` | 混了不少泛概念與品牌噪音 |
| `ai agent tools & utilities` | `77` | `23250` | 可做 hub，但必須嚴格編輯過濾 |
| `ai agent sdks & apis` | `80` | `19760` | 非常適合作為中層教育 / compare / guide 支柱 |
| `ai agent architecture & design` | `83` | `16490` | 可支撐 glossary / education |
| `ai agent skills marketplace` | `19` | `8160` | 雖然行數不多，但對 AnyCap 很關鍵 |
| `ai agent workspace & management platforms` | `57` | `8150` | 偏平台管理，與 AnyCap 主軸距離較遠 |
| `ai agent directory & discovery` | `42` | `6490` | 可支撐 curated discovery 頁 |
| `ai agent integration & deployment` | `6` | `2580` | 量小，但意圖乾淨 |

### `ai-capability` Topic Distribution

| Topic | Rows | Aggregate Volume | Judgment |
| --- | --- | --- | --- |
| `speech-to-text for ai agents` | `798` | `1198700` | Topic 名字最誤導，裡面混大量 TTS / voice generator / consumer intent |
| `ai agent core functionality` | `216` | `452390` | 多為泛 AI 定義詞，不適合作能力頁主詞 |
| `future of ai agents` | `170` | `232650` | 多為新聞 / 趨勢 / 通識詞 |
| `ai agent capabilities & applications` | `315` | `124230` | 混合能力詞與泛 AI assistant 詞 |
| `multimodal ai agents` | `47` | `74610` | 名稱像對，但內容大量偏 general AI |
| `ai agent development & frameworks` | `240` | `55510` | 有部分可用的開發者詞 |
| `video analysis for ai agents` | `43` | `22640` | 只有少數詞直接對題 |
| `image understanding for ai agents` | `8` | `3810` | 行數很少，但相對乾淨 |
| `ai agent apis & integration` | `12` | `940` | 體量小，但意圖可用 |

## What `agent-tool-hub` Changed

## 1. `/skills` hub 比以前更值得獨立做

過去 `skills` 的重要性主要來自：

- autocomplete
- 03-26 的 Semrush builder
- 既有產品安裝模型

這次 `agent-tool-hub` 則補了一個新的證據層：

- 它不只是零散詞，而是已經被聚成了 `ai agent skills marketplace`

### Representative Signals

| Keyword | Volume | KD | Judgment |
| --- | --- | --- | --- |
| `claude skills` | `4400` | `43` | 目前最值得重視的 `skills` 入口詞之一 |
| `claude code skills` | 先前資料已驗證 | `30` | 和現有 `/for/claude-code`、skill distribution 最匹配 |
| `anthropic skills` | `390` | — | 可做 supporting keyword |

### Interpretation

這代表：

- `/skills` 不再只是「可能要補」
- 它現在更像是 **最值得補的缺頁之一**

但它的頁型不應該是純 marketplace clone，而應該是：

- `skills` 是什麼
- AnyCap skill 怎麼安裝
- 它和 `tools`、`capabilities`、`CLI` 的關係是什麼
- 哪些 agent product 可以用

## 2. `/tools` 可以做，但只能做成 curated discovery / directory

`agent-tool-hub` 的 `tools & utilities`、`directory & discovery` 確實有量，但它也夾了大量不適合 AnyCap 的高 volume 詞。

### Representative Signals

| Keyword | Volume | KD | Judgment |
| --- | --- | --- | --- |
| `ai tools list` | `1900` | `72` | 太泛，不應直接硬打 |
| `ai tools for business` | `2900` | `67` | 偏 business software，不適合 |
| `ai marketing tools` | `5400` | `76` | 明顯噪音 |
| `advertising agency tools` | `50` | `19` | 和 AnyCap 幾乎無關 |

### Interpretation

這說明：

- `/tools` 可以做
- 但如果做成「best ai tools」大全，很容易整頁跑偏

更適合 AnyCap 的做法是：

- 做成 `agent tools` / `installable tools for agents` / `tool discovery for agent workflows`
- 強調：
  - agent 怎麼裝
  - agent 怎麼調用
  - tool 和 capability 的關係
  - 哪些適合 Claude Code / Cursor / Codex

## 3. `SDK / API / framework` 是更值得重視的中層教育支線

這次比 03-26 更明確的新增價值，是 `agent-tool-hub` 把很多偏中層、偏開發者的概念盤聚了出來。

### Representative Signals

| Keyword | Volume | KD | Judgment |
| --- | --- | --- | --- |
| `claude code sdk` | `2400` | `34` | 高價值 supporting keyword |
| `context engineering` | `2400` | `60` | 有量，但更適合權威型教育頁 |
| `agent builder` | `1900` | `60` | 競爭高，適合 compare / explanation，不適合主打 |
| `agentic workflows` | `1900` | `38` | 很值得納入 education / guide |
| `agent api` | `140` | `22` | 雖量不大，但意圖乾淨 |

### Interpretation

這類詞的作用不是直接拉交易頁，而是幫 AnyCap 建出一層「懂 agent stack 的站點認知」。

更適合承接它們的頁型是：

- guide
- glossary
- compare
- ecosystem explanation

而不是首頁或泛 capability 頁。

## What `ai-capability` Did Not Validate

## 1. 它不是一張可靠的 capability map

最大問題不是這份檔沒有量，而是：

- **Topic 標籤和真實 intent 經常對不上**

最典型的就是：

- `speech-to-text for ai agents`

實際上裡面充滿了：

- `text to speech`
- `ai voice generator`
- `read aloud`
- consumer voice / TTS brands

這會直接造成錯判：

- 你以為在驗證 STT
- 實際上 SERP 大量是 TTS 或 consumer voice product

## 2. `speech / multimodal / future of ai` 高 volume 不代表可打

### Noise Examples

| Keyword | Volume | KD | Why It Is Not A Good AnyCap Target |
| --- | --- | --- | --- |
| `what is artificial intelligence` | `301000` | `100` | 通識大詞，和能力頁轉換距離太遠 |
| `text to speech` | `246000` | `81` | 偏 consumer TTS，非 agent capability runtime |
| `ai voice generator` | `90500` | `76` | 消費級工具 intent 為主 |
| `latest ai breakthroughs` | `74000` | `82` | 新聞 / 趨勢詞 |
| `ai assistant` | `33100` | `83` | 太泛、競爭太高 |
| `read aloud` | `33100` | `74` | 與 agent runtime 幾乎無關 |

### Interpretation

這些詞只能告訴我們：

- AI capability 市場非常大

但不能告訴我們：

- AnyCap 應該去打哪些 capability 頁

## 3. 只有少數 capability signal 真正有參考價值

這份 `ai-capability` 裡仍然有少數可用信號，但它們比較像：

- 小而乾淨的 supporting keyword

而不是：

- 一整條可以直接大幅擴張的 cluster

### More Usable Signals

| Keyword | Volume | KD | Use |
| --- | --- | --- | --- |
| `image recognition ai` | `720` | `50` | 可支撐 image understanding 相關敘事 |
| `image recognition software` | `720` | `30` | 可做 supporting phrase |
| `image recognition api` | `210` | `34` | 可支撐 API / capability copy |
| `ai video analysis` | `880` | `52` | 可支撐 video analysis 葉子頁，但不是超強需求盤 |
| `claude agent sdk` | `1300` | `22` | 更像 SDK / ecosystem signal than capability signal |

### Interpretation

這代表：

- `/capabilities/image-understanding`
- `/capabilities/video-analysis`

這兩類頁可以繼續保留並慢慢強化

但像：

- `/capabilities/speech`
- `/capabilities/music`
- `/capabilities/search`
- `/capabilities/crawl`

現在還是應該繼續維持在：

- product direction
- future backlog

而不是被這份 CSV 誤導成「已被驗證的 SEO 主盤」

## Competitive Pattern

這兩份 CSV 對 SERP 的啟示也不一樣：

### `agent-tool-hub`

- SDK / API 詞：官方文檔與開發者文檔強勢
- tool / directory 詞：listicle、review、discovery 站強勢
- skills 詞：生態與教學頁更容易切入

### `ai-capability`

- speech / TTS 詞：consumer 工具與語音產品強勢
- future / AI definitions：大型資訊站、媒體、百科強勢
- 這些都不是 AnyCap 短期該正面搶的盤

## Updated Strategy After Three CSVs

把：

- 03-26 的 Semrush builder
- 03-30 的 ability cluster
- 03-30 的 tool hub / capability cluster

合在一起看，AnyCap 現在最穩的策略應該是這樣：

## Layer 1: Acquisition Core

最優先仍然是：

- `Claude Code`
- `agent CLI`
- `installable capabilities`
- `skills`

對應頁：

- `/cli`
- `/for/claude-code`
- `/guides/add-tools-to-claude-code`
- `/guides/install-anycap`
- 下一個最值得補的是 `/skills`

## Layer 2: Education Bridge

這層是這次資料最值得新增的部分：

- `MCP vs A2A`
- `agent protocol`
- `agent SDK`
- `agent API`
- `agentic workflows`
- `context engineering`

對應頁型：

- guide
- glossary
- compare

## Layer 3: Controlled Capability Expansion

現有 capability pages 應保留，但擴張規則要更嚴：

- 可以漸進強化：
  - `image understanding`
  - `video analysis`
- 不應該因這份 CSV 直接大擴：
  - `speech`
  - `music`
  - `search`
  - `crawl`
  - 泛 `multimodal`

## Page Priority Implication

### P0

- `/cli`
- `/for/claude-code`
- `/guides/add-tools-to-claude-code`
- `/guides/install-anycap`

### Strongest Missing Page

- `/skills`

### P1

- `MCP vs A2A` guide / compare
- `agent protocol` glossary
- `/tools` or discovery hub with heavy editorial filtering
- `/capabilities` hub refinement
- `/compare/anycap-vs-composio`

### P2

- `/for/cursor`
- `/for/codex`
- `context engineering / harness` cluster cleanup
- `models/*`
- new capability leaves after separate research

## Near-Term Actionable Keyword Queue

這一節把：

- `03-26` 的 keyword discovery baseline
- `03-26` 的 Semrush builder synthesis
- `03-30` 的 ability cluster synthesis
- `03-30` 的 tool hub / capability synthesis

收斂成「近期真的可以做」的 keyword queue。這裡的優先級不只看 volume，而是同時看：

1. 是否被多輪資料重複驗證
2. intent 是否能自然導向 `install tools / skills / capabilities for agents`
3. 是否已有對位頁面，或缺口是否已經非常明確
4. SERP 是否相對能避開官方 docs / 品牌導航 / 泛 AI listicle
5. 內容是否能把市場語言橋接回 AnyCap 的產品定位

### P0: Next Sprint

| Keyword / Cluster | Why It Is P0 | Strategy |
| --- | --- | --- |
| `claude code skills` | 在 `03-26` 與 `03-30` 兩輪資料都反覆出現，且 `KD 30`，是目前最乾淨、最能直接承接 AnyCap 的 Claude Code 生態詞之一。 | 先用 `/for/claude-code` 吃 ecosystem intent，再把它內鏈到未來的 `/skills` hub；頁面文案要同時覆蓋 `skills`、`tools`、`capabilities` 三種語言。 |
| `add tools to claude code` / `install tools for claude code` | 這組詞的價值不在於 volume 最大，而在於 install intent 最強，最接近 AnyCap 真正能解的問題。 | 持續把 `/guides/add-tools-to-claude-code` 做成第一承接頁，優先補安裝流程、支援的 capability 類型、與 `skills` / `MCP` 的關係。 |
| `claude code tools vs skills` | 它能同時回應使用者的語義困惑與 AnyCap 的橋接需求，是「市場語言 -> 品牌語言」最自然的 comparison query。 | 可先作為 `/guides/add-tools-to-claude-code` 的核心段落，若後續 impressions 起來，再拆成獨立 compare / guide。 |
| `claude skills` / `ai agent skills` | `skills` 已經不只是 supporting language，而是被 builder、autocomplete、tool hub cluster 共同驗證的缺頁機會。 | 優先規劃 `/skills`，頁面不要做 marketplace clone，而要回答 `skills 是什麼`、`怎麼安裝`、`和 tools / capabilities / CLI 的關係`。 |
| `serve claude code as mcp` / `claude code cli mcp` | 這組詞量不一定最大，但非常貼近 AnyCap 可以切入的 bridge intent；其中 `claude code cli mcp` 的 `KD 22` 尤其值得吃。 | 先在 Claude Code guide 裡補一節 `MCP / tool / capability` 關係解釋；若後續再擴 protocol branch，可獨立成 deeper guide。 |

### P1: Immediately After P0

| Keyword / Cluster | Why It Is P1 | Strategy |
| --- | --- | --- |
| `mcp vs a2a` / `a2a protocol vs mcp` / `agent to agent protocol vs mcp` | 這是 03-30 ability cluster 最明確新增的一條內容支線，query intent 乾淨、比較意圖強，但仍偏 education，不是第一波 transaction page。 | 新增一頁 `MCP vs A2A` comparison / guide，重點不是宣稱 AnyCap 等於 protocol，而是解釋 protocol layer 與 capability layer 的分工。 |
| `agent protocol` / `agent api` | 量不算最大，但屬於乾淨的概念與接口語言，可幫 AnyCap 建立「懂 agent stack」的站點認知。 | 用 glossary / guide 承接，而不是首頁或產品頁；頁面要明確區分 protocol、SDK、API、capability runtime。 |
| `ai agent tools` / `ai agent tools vs mcp` | 這類詞是市場真實入口語言，但如果不加控制，很容易把站點帶向泛 AI tools listicle。 | 只做 curated `/tools` hub，聚焦 `installable tools for agents`、`developer agent workflows`、`Claude Code / Cursor / Codex` 相關內容。 |
| `claude code sdk` / `agentic workflows` | 這些詞有明確 developer education 價值，能補齊 AnyCap 的中層認知，但不是現在最直接的 acquisition 入口。 | 作為 `/for/claude-code`、`/cli`、protocol / guide 支線的 supporting keyword，優先用 guide / glossary / ecosystem explanation 吃。 |

### P2: Track, Validate, Then Decide

| Keyword / Cluster | Why It Stays P2 | Strategy |
| --- | --- | --- |
| `cursor skills` / `cursor mcp tools` / `add tools to cursor` | 這批詞有明確安裝與 ecosystem intent，但目前所有資料都顯示它仍是第二波，不應該搶在 Claude Code 前面。 | 保持 `/for/cursor` 與 cursor how-to 的規劃，但等 P0 / P1 起來後再擴。 |
| `codex tools` / `opencode tools` / `openclaw tools` | autocomplete 有訊號，但 builder 與 cluster 對它們的量化驗證仍弱，現階段更像 GEO / defensive pages。 | 適合做長尾先手位，不適合近期投入主要內容資源。 |
| `image recognition api` / `image recognition ai` / `ai video analysis` | 這些詞是目前少數相對乾淨的 capability supporting keyword，但證據仍不足以支撐大規模 capability expansion。 | 可作為現有 capability pages 的 supporting copy 方向；若要擴成新頁，先做一輪模態專項 keyword research。 |

### Not A Near-Term Keyword Target

以下詞即使 volume 高，也不建議近期投入：

- `ai tools list`
- `ai marketing tools`
- `text to speech`
- `ai voice generator`
- `read aloud`
- `what is artificial intelligence`
- `claude logo`
- `claude download`
- `who owns claude ai`

原因很一致：

- 要嘛是品牌導航詞
- 要嘛是 consumer intent
- 要嘛是泛 AI / business software 大詞
- 都很難自然導向 AnyCap 的 capability installation / runtime 敘事

## Semrush Builder Next Query Pack

如果下一輪要去 Semrush keyword builder 補數據，建議優先丟下面這幾組 seed，而不是再泛擴 `ai tools`：

### Pack A: Claude Code Install Intent

- `claude code tools`
- `claude code tools list`
- `claude code tools github`
- `claude code tools vs skills`
- `add tools to claude code`
- `install tools for claude code`
- `claude code mcp tools`
- `claude code mcp server`
- `serve claude code as mcp`
- `claude code capabilities`

### Pack B: Skills Hub Validation

- `ai agent skills`
- `ai agent skills examples`
- `ai agent skills github`
- `ai agent skills marketplace`
- `claude skills`
- `claude code skills`
- `claude code skills examples`
- `claude code skills docs`

### Pack C: Protocol / Compare Branch

- `mcp vs a2a`
- `a2a protocol vs mcp`
- `agent to agent protocol vs mcp`
- `agent protocol`
- `agent api`
- `agent sdk`
- `claude code sdk`
- `agentic workflows`

### Pack D: Wave-2 Ecosystem Terms

- `cursor skills`
- `cursor mcp tools`
- `add tools to cursor`
- `codex tools`
- `codex mcp tools`
- `opencode tools`
- `openclaw tools`

### Pack E: Capability Validation Seeds

- `image recognition api`
- `image recognition ai`
- `ai video analysis`
- `search tools for ai agents`
- `crawl tools for ai agents`
- `speech tools for ai agents`
- `music tools for ai agents`

## Synthesis Decision

如果只看「近期可以做什麼詞」，排序應該收斂成：

1. 先吃 `Claude Code install / skills / tools-vs-skills` 這條最貼產品的 demand line
2. 再開 `skills` hub 與 `MCP vs A2A / protocol` 這兩條 bridge line
3. 對 `Cursor`、`Codex`、`OpenCode`、`OpenClaw` 保持佈局，但不搶第一波
4. 對 capability modality 詞保持克制，先驗證再擴張

## Final Judgment

如果只看這兩份新 CSV，最容易犯的錯是：

1. 因為 `tool hub` 有量，就去做泛 AI tools 站
2. 因為 `ai-capability` 很大，就誤以為 speech / multimodal 已被驗證

真正更合理的結論是：

- **`agent-tool-hub` 強化了 `skills + tools/discovery + SDK/API education`**
- **`ai-capability` 主要強化的是「要更小心」，而不是「要大擴 capability 頁」**

所以這輪最值得打的策略不是改線，而是把線收得更清楚：

1. 用 `Claude Code + CLI + skills` 吃入口
2. 用 `protocol / SDK / workflow` 補教育橋接層
3. 用極克制的方式經營 capability leaves，等專項 research 再擴
