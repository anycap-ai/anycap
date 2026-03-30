# [SEO-20260330-1545] Narrative & IA audit with navigation keyword mapping

- Time: `2026-03-30 15:45 CST`
- Node: `SEO-20260330-1545`
- Type: `analyze`
- Status: `done`
- Scope: `narrative audit`, `information architecture`, `navigation redesign`, `keyword-to-page mapping`, `Claude Plugins`, `problem-intent`, `competitor landscape`
- Related:
  - [`../index.md`](../index.md)
  - [`2026-03-30-1153-keyword-prioritization-reflection.md`](2026-03-30-1153-keyword-prioritization-reflection.md)
  - [`2026-03-30-1321-capability-keyword-research-refresh.md`](2026-03-30-1321-capability-keyword-research-refresh.md)
  - [`2026-03-30-1114-tool-hub-and-capability-strategy-synthesis.md`](2026-03-30-1114-tool-hub-and-capability-strategy-synthesis.md)
  - [`../todo/2026-03-30-1038-ability-cluster-follow-ups.md`](../todo/2026-03-30-1038-ability-cluster-follow-ups.md)

## Why This Memo Exists

前面幾輪分析（03-26 baseline → 03-30 cluster synthesis → 1153 prioritization reflection）完成了關鍵詞選擇與優先級排序，但沒有回答三個問題：

1. 站點敘事層是否足夠強——用戶/agent 能不能瞬間 get 到 AnyCap 的價值
2. 1153 分析是否有結構性盲區
3. 導航重設計後，每個導航項對應的頁面該打哪些關鍵詞

這篇回答這三個問題。

---

## Part 1: 1153 分析審計

### 做對了什麼

- 「安裝意圖」識別準確：`add tools to claude code` / `install tools for claude code` 是高轉換、產品對齊詞
- Claude Code 作為第一生態入口的判斷被多輪資料收斂驗證
- 噪音過濾紀律正確：排除 consumer TTS、品牌導航、泛 AI 工具
- `skills` 升格 hub 級別有 autocomplete + builder + cluster 證據鏈
- MCP vs A2A 作為教育橋接是低 KD、乾淨比較意圖的好判斷

### 三個結構性盲區

#### 盲區 1: 完全漏掉 Claude Plugins

Anthropic 在 2026 年 1-2 月上線了 Claude Cowork 和 Enterprise Plugins：

- 官方 plugin marketplace
- Claude Code 裡的 `/plugin install` 命令
- 11 個開源官方插件
- Plugin Create 工具

分析全程只談 `skills` 和 `tools`，但 `plugins` 現在是 Anthropic 官方產品語言。

缺失的高價值關鍵詞：

| 關鍵詞 | 意圖類型 |
| --- | --- |
| `claude plugins` | 品牌生態 |
| `claude code plugins` | 安裝 |
| `best claude plugins` | 列表/發現 |
| `install claude plugins` | 安裝 |
| `create claude plugin` | 教程 |
| `claude plugins vs skills vs tools` | 比較/消歧義 |
| `claude plugin marketplace` | 發現 |

#### 盲區 2: 零覆蓋問題意圖查詢

分析只看解決方案語言（`claude code skills`、`add tools to claude code`）。更大的流量池是問題語言：

- `how to make AI agent generate images`
- `give AI agent access to web search`
- `AI agent can't generate video`
- `extend AI agent capabilities`
- `claude code limitations workarounds`
- `can claude code generate images`

這些查詢體量更大、競爭更低、轉換更高、GEO 更友好。

#### 盲區 3: 競爭意識不足

分析只提到 Composio。但 SERP 上的真實競爭者還有：

| 競爭者 | 定位 |
| --- | --- |
| PixelDojo | image & video generation for AI agents，40+ 模型，REST API，llms.txt |
| Creati.ai | Unified AI API for image-to-video pipelines |
| Unified.to | 420+ integrations，MCP server，20k+ tools |
| Toolhouse | Agent tool platform |
| Arcade | MCP-native, lightweight |
| Membrane | AI-generated integrations on-demand |

### 總判決

| 維度 | 評分 | 備註 |
| --- | --- | --- |
| 方法論 | 強 | 三階段收斂、五標準框架、噪音紀律 |
| 完整性 | 弱 | 漏掉 plugins、無問題意圖、無競爭者格局 |
| 進攻性 | 太低 | 優化「不浪費」而非「爆量」 |
| 關鍵詞覆蓋 | 中等 | 既有 cluster 好，但對 3 個主要新 cluster 視盲 |
| 可執行性 | 中等 | page-path 對映清楚，但太多「等等再驗證」 |
| 競爭意識 | 弱 | PixelDojo、Toolhouse、Arcade、Unified.to 全缺 |

---

## Part 2: 敘事層診斷

### 問題

`/for-human` 首頁有最強的一句文案：

> "Agents can think, but they can't act — no images, no video, no music, no voice."

但 SEO 頁面全部沒有繼承這個敘事。

| 頁面 | 當前 Hero | 問題 |
| --- | --- | --- |
| `/for/claude-code` | "Give Claude Code real-world capabilities." | 在說「我能做什麼」，沒說「你的 agent 缺了什麼」 |
| `/cli` | "AnyCap Agent CLI" | 純功能描述 |
| `/skills` | "AnyCap skills" | 架構解釋 |
| `/capabilities` | "Capabilities" | 抽象定位 |

### 敘事公式

```
[Agent] 可以 [它擅長的事]。
但它不能 [AnyCap 能補的事]。
一行命令，立刻補上。
```

### 最強敘事資產：能力對照表

```
                Claude Code   Cursor   Codex   + AnyCap
Code Gen            Yes         Yes      Yes      Yes
Image Gen           ---         ---      ---      Yes (Seedream 5, Nano Banana Pro)
Video Gen           ---         ---      ---      Yes (Veo 3.1)
Image Read          ---         ---      ---      Yes
Video Analysis      ---         ---      ---      Yes
Music               ---         ---      ---      Coming
Speech              ---         ---      ---      Coming
Web Search          ---         ---      ---      Coming
Web Crawl           ---         ---      ---      Coming
```

這張表應出現在 `/capabilities` hub 和每個 `/for/{agent}` 頁面。

---

## Part 3: 導航重設計方案

### 當前導航

```
[anycap]  Capabilities ▼  Integrations ▼  Resources ▼ (14項)  About  I'm Agent →
```

### 問題

1. Resources 塞了 14 個項目——CLI、Skills、Models、5 個 guides、2 個 compare、2 個 glossary 全混在一起
2. 「Integrations」是產品語言——用戶不會把 Claude Code 當成「整合」
3. 最高轉化的安裝入口（Install AnyCap、Add Tools to Claude Code）被埋在 14 項的 dropdown 中間
4. 沒有 CTA 按鈕——所有項目都是同等權重的文字連結

### 新導航（方案 B）

```
[anycap]  Capabilities ▼  For Your Agent ▼  Resources ▼ (7項)  About  Login  [Get Started]
```

### 改動清單

1. `Integrations` → `For Your Agent`
2. `Image Read` → `Image Understanding`
3. Resources 從 14 項精簡到 7 項
4. 新增 `[Get Started]` CTA 按鈕（指向 `/guides/install-anycap`）

### Resources 精簡

| 保留 | 移除（靠內鏈和搜尋到達） | 移除原因 |
| --- | --- | --- |
| CLI | Install AnyCap | CTA 按鈕承接 |
| Skills | Workspace Context | 和 Context Engineering 重疊 |
| Models | Agent Skills | 和 Skills hub 重疊 |
| MCP vs A2A | Agent Harness | 低優先級 |
| Context Engineering | Add Tools to Claude Code | CTA + /for/claude-code 內鏈承接 |
| Agent Protocol | vs Agent Builder | 低優先級 |
| AnyCap vs Composio | What is ACR? | 深層概念頁 |

---

## Part 4: 導航 x 頁面 x 關鍵詞對照表

### Capabilities dropdown

| 導航項 | 路徑 | 主打關鍵詞 | 支撐關鍵詞 | 意圖類型 | 來源驗證 |
| --- | --- | --- | --- | --- | --- |
| (hub link) | `/capabilities` | `ai agent capabilities`, `installable capabilities for agents` | `agent capabilities`, `capability runtime` | 品牌/類別 | GEO + autocomplete |
| Image Generation | `/capabilities/image-generation` | `image generation api for agents`, `image generation for AI agents` | `text to image api`, `image generation api`, `image editing api` | 能力發現 | live SERP 驗證（PixelDojo, Mistral, MS 排名） |
| Video Generation | `/capabilities/video-generation` | `video generation for AI agents`, `video generation api` | `text to video api`, `video creation api` | 能力發現 | live SERP 驗證（Vercel AI Gateway 排名） |
| Image Understanding | `/capabilities/image-understanding` | `vision api for ai agents`, `image recognition api` | `image analysis api`, `image analysis for ai agents`, `OCR for agents` | 能力發現 | 1321 分析：市場語言是 vision/recognition，不是 image-read |
| Video Analysis | `/capabilities/video-analysis` | `ai video analysis api`, `video analysis for ai agents` | `video understanding api`, `video intelligence api` | 能力發現 | 1321 分析 |

### For Your Agent dropdown

| 導航項 | 路徑 | 主打關鍵詞 | 支撐關鍵詞 | 意圖類型 | 來源驗證 |
| --- | --- | --- | --- | --- | --- |
| Claude Code | `/for/claude-code` | `claude code tools`, `claude code skills`, `claude code capabilities` | `add capabilities to claude code`, `claude code plugins`, `claude code image generation`, `can claude code generate images` | 生態安裝 | Semrush builder KD 30-43 |
| Cursor | `/for/cursor` | `cursor skills`, `cursor mcp tools`, `add tools to cursor` | `cursor capabilities`, `cursor image generation` | 生態安裝 | autocomplete 驗證，第二波 |
| Codex | `/for/codex` | `codex tools`, `codex mcp tools`, `codex cli tools` | `codex capabilities` | 生態佔位 | GEO/defensive |

### Resources dropdown

| 導航項 | 路徑 | 主打關鍵詞 | 支撐關鍵詞 | 意圖類型 | 來源驗證 |
| --- | --- | --- | --- | --- | --- |
| CLI | `/cli` | `agent cli`, `anycap cli` | `agent sdk`, `install anycap cli` | 產品 | Semrush builder |
| Skills | `/skills` | `ai agent skills`, `claude skills` | `ai agent skills marketplace`, `claude code skills` | 產品/生態 | builder + autocomplete + cluster |
| Models | `/models` | `ai models for agents` | `seedream 5 for agents`, `veo 3.1 for agents`, `nano banana pro` | 模型發現 | 產品對齊 |
| MCP vs A2A | `/guides/mcp-vs-a2a-for-ai-agents` | `mcp vs a2a`, `a2a protocol vs mcp` | `agent to agent protocol vs mcp`, `agent protocol` | 比較/教育 | cluster KD 20-30 |
| Context Engineering | `/guides/context-engineering-for-agents` | `context engineering`, `context engineering for agents` | `agentic workflows` | 教育 | cluster KD 38-60 |
| Agent Protocol | `/glossary/agent-protocol` | `agent protocol`, `agent api` | `agent sdk` | 教育/概念 | cluster |
| AnyCap vs Composio | `/compare/anycap-vs-composio` | `anycap vs composio`, `composio alternative` | `composio alternatives`, `agent tool platform comparison` | 比較/轉換 | live SERP 驗證 |

### Get Started CTA

| 導航項 | 路徑 | 主打關鍵詞 | 支撐關鍵詞 | 意圖類型 | 來源驗證 |
| --- | --- | --- | --- | --- | --- |
| Get Started | `/guides/install-anycap` | `install anycap`, `anycap install` | `anycap getting started`, `anycap setup` | 安裝 | 產品對齊 |

### 導航外但仍重要的頁面

| 路徑 | 主打關鍵詞 | 意圖類型 | 為何不在導航 |
| --- | --- | --- | --- |
| `/guides/add-tools-to-claude-code` | `add tools to claude code`, `install tools for claude code` | 安裝 how-to | Get Started CTA + /for/claude-code 內鏈承接 |
| `/compare/anycap-vs-openai-agent-builder` | `anycap vs agent builder` | 比較 | 優先級低於 vs Composio |
| `/glossary/agent-capability-runtime` | `what is agent capability runtime` | GEO/概念 | 深層概念頁，不需要導航入口 |
| `/glossary/agent-harness` | `what is agent harness` | GEO/概念 | 同上 |
| `/guides/what-is-agent-harness` | — | 教育 | 和 glossary 重疊，應考慮合併 |
| `/guides/workspace-context-engineering` | — | 教育 | 和 Context Engineering guide 重疊 |
| `/guides/agent-skills-for-developer-tools` | `agent skills for developer tools` | 教育 | Skills hub 已承接 |

---

## Part 5: 尚未覆蓋但值得後續打的關鍵詞方向

以下關鍵詞方向在這輪分析中被識別，但目前站上沒有對應頁面，也不在新導航中。

### Claude Plugins（需 Semrush 驗證後決定）

| 關鍵詞 | 頁面候選 |
| --- | --- |
| `claude plugins` | `/learn/claude-plugins` 或更新 `/skills` 頁面 |
| `claude plugins vs skills vs tools` | `/guides/plugins-vs-skills-vs-tools` |
| `best claude plugins` | `/guides/best-claude-plugins` |

### 問題意圖查詢（需 Semrush 驗證後決定）

| 關鍵詞 | 頁面候選 |
| --- | --- |
| `can claude code generate images` | `/for/claude-code` FAQ schema |
| `claude code limitations` | `/learn/what-agents-cant-do` |
| `AI agent can't generate images` | 同上 |
| `extend AI agent capabilities` | `/for/claude-code` 或 `/capabilities` |

### 競爭者比較（已驗證 SERP 存在）

| 關鍵詞 | 頁面候選 |
| --- | --- |
| `anycap vs pixeldojo` | `/compare/anycap-vs-pixeldojo` |
| `anycap vs toolhouse` | `/compare/anycap-vs-toolhouse` |
| `composio alternatives` | `/compare/composio-alternatives` |
| `agent tool platforms compared` | `/compare/agent-capability-platforms` |

### 教程/構建者意圖（已驗證 SERP 存在）

| 關鍵詞 | 頁面候選 |
| --- | --- |
| `build AI agent with image generation` | `/tutorials/` 或 `/guides/` |
| `how to build multimodal AI agent` | 同上 |
| `AI agent API integration tutorial` | 同上 |

### Agent x Capability 交叉頁（Programmatic SEO）

| 關鍵詞 | 頁面候選 |
| --- | --- |
| `claude code image generation` | `/for/claude-code/image-generation` |
| `add image generation to claude code` | 同上 |
| `cursor image generation` | `/for/cursor/image-generation` |
| `claude code video generation` | `/for/claude-code/video-generation` |

---

## What Would Change This Mapping

| 觸發條件 | 影響 |
| --- | --- |
| Semrush 驗證 `claude plugins` volume 確實很大 | Plugins 從「待驗證」升為導航級頁面 |
| `/for/claude-code/{capability}` 交叉頁建成 | Capabilities dropdown 可增加 "for Claude Code" 子項 |
| 問題意圖查詢驗證有量 | `/learn/what-agents-cant-do` 升級為 Resources dropdown 項目 |
| 新競爭者比較頁流量起來 | Resources dropdown 加入 compare section |
