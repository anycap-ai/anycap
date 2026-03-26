# [SEO-20260326-1159] Semrush keyword builder synthesis for anycap.ai

- Time: `2026-03-26 11:59 CST`
- Node: `SEO-20260326-1159`
- Type: `analyze`
- Status: `done`
- Scope: `seo-plan`, `seo-geo`, `keyword-discovery`, Semrush cluster CSV synthesis
- Related: [`../todo/2026-03-26-1203-today-seo-todo.md`](../todo/2026-03-26-1203-today-seo-todo.md)

## Executive Summary

你給的兩份 Semrush keyword builder CSV，幫我們把前面幾輪「方向正確但偏定性」的判斷，進一步拉成了更可執行的排序。

這批資料最重要的結論有 4 個：

1. **`tools`、`cli`、`skills` 確實是市場真實需求語言**，不是我們自己想像出來的。
2. **`Claude Code` 是目前最明確、最可落地的 agent ecosystem 切口。**
3. **`Cursor / Codex / OpenCode / OpenClaw` 在這批 Semrush builder 裡訊號偏弱，短期更適合當 GEO 佔位與長尾先手，而不是主流量盤。**
4. **這批 CSV 雖然有價值，但噪音很多，不能直接把高 volume 詞當成 AnyCap 的 target。**

換句話說，這次不是單純「多了關鍵字」，而是我們現在更清楚：

- 哪些頁面應該先做
- 哪些詞可以吃流量
- 哪些詞雖然有量，但不適合 AnyCap

## Source Files

- `ai-agent-skill_clusters_2026-03-26.csv`
- `ai-agent-tool_clusters_2026-03-26.csv`

## Dataset Snapshot

| File | Rows | Highest-signal topic groups |
| --- | --- | --- |
| `ai-agent-skill_clusters_2026-03-26.csv` | `2338` | `ai agent tool reviews & best practices`, `ai agent for coding & development`, `ai agent cli tools & comparisons`, `ai agent skills & modularity` |
| `ai-agent-tool_clusters_2026-03-26.csv` | `2380` | `ai agent memory & tool management`, `ai agent use cases & applications`, `top ai agent tools & platforms`, `ai agent cli tools & utilities` |

### Important Caveat

這兩份 builder 並不是「AnyCap 專屬詞庫」，而是更偏 broad market 的 AI agent cluster expansion。

因此裡面同時混了三種東西：

1. **高相關詞**
2. **可橋接詞**
3. **高 volume 但不適合 AnyCap 的噪音詞**

## What The CSVs Validated

## 1. `Tools` Wins the Demand Layer

從兩份 CSV 的 term coverage 來看：

- `tools / tool` 類詞的總覆蓋與 volume 顯著高於 `skills / skill`
- `cli` 類詞也非常強
- 這證明 AnyCap 不能只用 `capability runtime` 對外說話

### Interpretation

對搜尋市場而言，使用者更自然在找：

- tools
- cli
- skills
- command line
- documentation

而不是直接找：

- capability runtime
- capability layer

### Decision

- `tools` 是 acquisition 主語言
- `skills` 是 ecosystem / installation 輔助語言
- `capability runtime` 是品牌與 GEO 語言

## 2. `Claude Code` Is The Strongest Near-Term Entry Point

這批資料裡，與 agent ecosystem 最穩定相關且 volume 最像真需求的，是 `Claude Code`。

### Strong Signals Found

#### From `skill_clusters`

- `claude skills` — `4400`, KD `43`
- `claude code subagents documentation` — `3600`, KD `50`
- `claude code sdk` — `2400`, KD `34`
- `claude code agents` — `1300`, KD `47`
- `claude code skills` — `590`, KD `30`

#### From `tool_clusters`

- `claude code cli documentation` — `6600`, KD `39`
- `anthropic claude code cli` — `5400`, KD `60`
- `claude code cli` — `1900`, KD `62`
- `claude code agents` — `1300`, KD `47`
- `claude code alternatives` — `320`, KD `23`

### What This Means

`Claude Code` 現在不只是 GEO 假設，而是已經被 Semrush builder 證實有真實搜尋盤。

### Important Fit Check

雖然 `claude code cli documentation` 量很高，但這類詞很多其實偏：

- Anthropic 官方文檔 intent
- product docs intent
- navigational / brand-adjacent intent

這不代表 AnyCap 應該直接硬搶 `documentation` 這種詞。

更合理的做法是切這些**高相關但更可承接的長尾**：

- `claude code skills`
- `claude code agents`
- `how to add tools to claude code`
- `claude code tools vs skills`
- `install tools for claude code`

## 3. `Cursor / Codex / OpenCode / OpenClaw` Are Still Strategic, But Less Validated

這批 CSV 裡：

- `Cursor` 訊號非常少，且多數不乾淨
- `Codex` 幾乎沒有形成可用 cluster
- `OpenCode` / `OpenClaw` 幾乎沒有被 builder 抓出有規模的搜尋盤

### Interpretation

這不代表這些頁不能做，而是代表它們現階段的角色更像：

- GEO association pages
- long-tail defensive / category-claim pages
- early land-grab pages

而不是第一波最該押的大流量頁。

### Decision

短期優先順序應是：

1. `Claude Code`
2. `AI agent tools / skills / CLI`
3. `Cursor`
4. `Codex / OpenCode / OpenClaw`

## 4. The CSVs Expose Major Noise

這兩份 builder 最大的風險是，如果不做篩選，很容易被高 volume 假需求帶偏。

### Noise Examples

- `google gemini vs ai studio`
- `gemini cli`
- `agency ai`
- `ai marketing tools`
- `product marketing tools`
- `workflow automation tools`
- `command line cli`

這些詞可能有 volume，但很多都不符合 AnyCap 的核心產品 intent。

### Strategic Rule

**AnyCap 不應該因為 volume 高，就去追所有 `AI tools` 或 `CLI` 詞。**

應該只追同時滿足以下條件的詞：

1. 跟 agent ecosystem 有明確關聯
2. 能自然導向 `installable capabilities`
3. 能讓 AnyCap 的產品價值被合理承接

## Updated Keyword Discovery

## Tier 1: Highest-Fit Keywords

這些詞最值得優先轉成頁面。

| Keyword | Volume | KD | Why It Matters | Fit |
| --- | --- | --- | --- | --- |
| `claude code skills` | `590` | `30` | 高相關、低於中等 KD、可直接承接 AnyCap | High |
| `claude code agents` | `1300` | `47` | 和 agent extension 強相關 | High |
| `claude skills` | `4400` | `43` | 雖較泛，但和 skills 生態高度一致 | Medium-High |
| `ai agent tools` | `480` | `31` | 類別入口詞，可做 hub | High |
| `ai agent tools vs mcp` | 已由 autocomplete 驗證 | TBD | 高質量 comparison intent | High |
| `ai agent skills` | autocomplete 強 | TBD | 可做 skills hub | High |

## Tier 2: High-Intent Bridge Keywords

這些詞不一定 volume 最大，但非常適合 AnyCap 的 bridge content。

- `how to use claude code agents`
- `add tools to claude code`
- `claude code tools vs skills`
- `install tools for claude code`
- `add tools to cursor`
- `cursor skills`
- `cursor mcp tools`

## Tier 3: GEO / Category Keywords

這些詞仍然值得做，但目的不是短期流量，而是類別塑造。

- `agent-native capability runtime`
- `capability layer for ai agents`
- `installable capabilities for agents`
- `what is a capability runtime for ai agents`

## Updated SEO Plan

Semrush 資料進來之後，AnyCap 的 SEO plan 應該改成更明確的三段式。

## Phase A: Demand Capture

先吃已經被驗證有搜尋盤的 agent ecosystem 詞。

### Priority Pages

- `/for/claude-code`
- `/skills`
- `/tools`
- `/guides/how-to-use-claude-code-agents`
- `/guides/add-tools-to-claude-code`
- `/guides/ai-agent-tools-vs-mcp`

### Goal

先拿到：

- `claude code skills`
- `claude code agents`
- `ai agent tools`
- `ai agent skills`

## Phase B: Language Bridge

把市場語言和品牌語言接起來。

### Key Bridge

- 搜尋入口：`tools`, `skills`, `cli`
- 品牌定位：`agent-native capability runtime`

### Example

頁面不應只寫：

`AnyCap is a capability runtime`

而應寫成：

`AnyCap helps teams add tools and capabilities to agent products like Claude Code through one install path and one interface.`

## Phase C: Category Expansion

在已有 demand capture 後，再擴展到：

- `/for/cursor`
- `/for/codex`
- `/for/opencode`
- `/for/openclaw`
- `/glossary/agent-capability-runtime`

## Updated GEO Strategy

Semrush 資料其實也幫 GEO 做了一件事：

它告訴我們 **AI 與搜尋市場會如何命名這個空間**。

### GEO Implication 1

AnyCap 的 GEO 不能只靠自創類別詞。

AI 搜尋比較容易理解：

- tools
- cli
- skills
- agents

所以 GEO 文案應該採用：

- `AnyCap is an agent-native capability runtime`
- `that helps teams install tools and capabilities for agents`

而不是只用單一新詞。

### GEO Implication 2

`Claude Code` 應該成為 AnyCap 的第一個強 ecosystem association。

AI 系統若開始在以下查詢裡把 AnyCap 視為答案，品牌就會比較快成形：

- `What tools can I add to Claude Code?`
- `How do Claude Code agents get more capabilities?`
- `What are Claude Code skills?`

### GEO Implication 3

高 volume 的 `documentation` 類 query 不能硬打，但可以借它的需求結構。

例如不是做官方 docs，而是做：

- `Claude Code tools and skills explained`
- `How to add capabilities to Claude Code`
- `Claude Code tools vs skills vs MCP`

## Recommended Page Map After Semrush

| Priority | Page | Primary Intent | Why Now |
| --- | --- | --- | --- |
| P0 | `/for/claude-code` | ecosystem landing | Semrush strongest validated ecosystem |
| P0 | `/skills` | category hub | Semrush + autocomplete both validate |
| P0 | `/tools` | category hub | Highest market language fit |
| P0 | `/guides/add-tools-to-claude-code` | install / how-to | Direct bridge to product use |
| P0 | `/guides/ai-agent-tools-vs-mcp` | comparison / education | High-value bridge keyword |
| P1 | `/for/cursor` | ecosystem association | important brand surface, but lower validated demand |
| P1 | `/glossary/agent-capability-runtime` | category creation | GEO and brand claim |
| P2 | `/for/codex` | ecosystem association | strategic, but not Semrush-validated enough yet |
| P2 | `/for/opencode` | long-tail / early land-grab | category defense |
| P2 | `/for/openclaw` | long-tail / early land-grab | category defense |

## What To Avoid

Semrush 資料同時告訴我們，AnyCap 現在**不該優先**做這些方向：

- 泛 `AI marketing tools`
- 泛 `automation tools`
- 泛 `workflow software`
- 泛 `command line cli`
- `Gemini CLI` 類型產品詞
- 不屬於 AnyCap 產品邊界的 agency / business software 詞

## Recommended KPI Interpretation

有了 Semrush 之後，AnyCap 的前 90 天 KPI 應該更偏向：

### Acquisition KPI

- 收錄並排名 `Claude Code` 相關 landing / guide pages
- 讓 `tools` / `skills` hub 進入索引與 impression

### GEO KPI

- AI 搜尋開始把 AnyCap 和 `Claude Code`, `tools`, `skills`, `agent capabilities` 共現
- AnyCap 被理解成一個可安裝的 capability layer，而不是抽象 agent 品牌

## Final Judgment

這兩份 Semrush CSV 幫 AnyCap 把路徑收得更窄，也更準：

- **短期最該押的是 `Claude Code + tools / skills / CLI`**
- **中期才是 `Cursor` 與其他 agent ecosystem page`**
- **長期再把這些 demand pages 往 `agent-native capability runtime` 類別心智收斂**

所以接下來最合理的不是再做一輪更泛的關鍵字擴張，而是直接把第一批頁面開出來，尤其是：

1. `for/claude-code`
2. `tools`
3. `skills`
4. `guides/add-tools-to-claude-code`
5. `guides/ai-agent-tools-vs-mcp`
