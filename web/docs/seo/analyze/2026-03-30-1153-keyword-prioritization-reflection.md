# [SEO-20260330-1153] Keyword prioritization reflection after March cluster analysis

- Time: `2026-03-30 11:53 CST`
- Node: `SEO-20260330-1153`
- Type: `analyze`
- Status: `done`
- Scope: `keyword prioritization`, `page strategy`, `Claude Code`, `skills hub`, `protocol branch`, `Semrush follow-up`
- Related:
  - [`../index.md`](../index.md)
  - [`2026-03-26-1145-anycap-ai-keyword-discovery-baseline.md`](2026-03-26-1145-anycap-ai-keyword-discovery-baseline.md)
  - [`2026-03-26-1159-semrush-keyword-builder-synthesis.md`](2026-03-26-1159-semrush-keyword-builder-synthesis.md)
  - [`2026-03-30-1037-anycap-ability-cluster-synthesis.md`](2026-03-30-1037-anycap-ability-cluster-synthesis.md)
  - [`2026-03-30-1114-tool-hub-and-capability-strategy-synthesis.md`](2026-03-30-1114-tool-hub-and-capability-strategy-synthesis.md)
  - [`../todo/2026-03-30-1038-ability-cluster-follow-ups.md`](../todo/2026-03-30-1038-ability-cluster-follow-ups.md)

## Why This Memo Exists

| Problem | Why It Matters |
| --- | --- |
| 結論分散在不同 `analyze` | 容易記住單批 keyword，卻忘記整體排序邏輯 |
| 每篇都有自己的重點 | 單篇閱讀常常只能看到局部判斷 |
| 研究越多，越容易出現「知道很多、但排不出先後」 | 會直接影響 page priority 與 Semrush 下一輪驗證順序 |

這篇不是新增一輪資料分析，而是把目前對 AnyCap keyword strategy 的心得，收斂成一個比較穩定、可快速掃描的判斷版本。

## Executive Summary

| Theme | Current Judgment | Why It Matters |
| --- | --- | --- |
| Demand line | 短期最值得吃的不是泛 `AI agent`，而是 `Claude Code + install + tools / skills` | 這條線最接近 AnyCap 真實可承接的產品行為 |
| `skills` | 已不是可有可無的 supporting word，而是值得獨立承接的缺頁候選 | 同時滿足市場語言、產品敘事與站點架構需求 |
| Protocol branch | `MCP vs A2A`、`agent protocol`、`agent API / SDK` 是最值得新增的教育橋接層 | 能補齊 AnyCap 在 agent stack 裡的位置解釋 |
| `tools` language | `tools` 是需求語言，但只能做成 curated discovery | 若放太泛，很容易跑去做 `best ai tools` 類站 |
| Capability expansion | modality 擴張仍然證據不足 | 不能因為產品想做，就假設搜尋需求已成立 |

## What Actually Changed In My Judgment

如果回看整個 03-26 到 03-30 的脈絡，我的判斷不是大幅改線，而是越來越收斂。

| Stage | What Was Validated | What It Solved |
| --- | --- | --- |
| Stage 1: 市場語言 | AnyCap 想講 `capability runtime`，但市場在搜 `tools`、`skills`、`MCP tools`、`add tools to ...` | 解決語言問題 |
| Stage 2: ecosystem 入口 | `Claude Code` 是最有真實需求盤的 ecosystem；`Cursor / Codex / OpenCode / OpenClaw` 更像第二波 | 解決入口問題 |
| Stage 3: 第二條支線 | `skills` 應升級成 hub 候選；`protocol / MCP / A2A / SDK / API` 值得成為教育支線；`ai-capability` 不能直接當多模態需求地圖 | 解決擴張順序問題 |

## The Real Prioritization Logic

我現在更傾向用下面 5 個標準來排 keyword，而不是只看 volume。

| Criterion | Why It Matters | Example |
| --- | --- | --- |
| 是否多輪重複出現 | 同時出現在 autocomplete、builder、cluster synthesis 的詞，可靠性更高 | `claude code skills` |
| 是否接近真實產品行為 | `add tools`、`install tools`、`skills` 更接近 AnyCap 真正能解的問題 | `add tools to claude code` |
| 是否能對應清楚的頁型 | 好 keyword 背後通常有清楚頁型，例如 landing、guide、compare、glossary | `mcp vs a2a` 適合 compare |
| SERP 是否可打 | 被官方 docs、品牌導航、consumer 工具壟斷的詞，即使 volume 高也不值得先打 | `claude code cli documentation` |
| 是否能橋接到品牌定位 | 好詞不只帶流量，還能把 `tools / skills` 收束回 `capability runtime` | `claude code tools vs skills` |

## My Current Keyword Conviction

| Cluster | Current Judgment | Representative Terms | Why I Believe It | Page Implication |
| --- | --- | --- | --- | --- |
| Claude Code install layer | 目前信心最高 | `claude code skills`<br>`add tools to claude code`<br>`install tools for claude code`<br>`claude code tools vs skills`<br>`serve claude code as mcp`<br>`claude code cli mcp` | intent 更乾淨、離 capability installation 更近、也更容易做成可轉化的 guide / landing page | 強化 `/for/claude-code` 與 `/guides/add-tools-to-claude-code` |
| `skills` hub | 結構性缺口 | `claude skills`<br>`ai agent skills` | 同時滿足市場語言、ecosystem 語境、產品敘事與站點承接位置 | 優先規劃 `/skills` |
| Protocol branch | 最有意義的第二波 | `mcp vs a2a`<br>`agent protocol`<br>`agent api`<br>`agent sdk` | 不一定最先轉化，但最能補齊 agent stack 解釋權 | 新增 compare / glossary / guide 支線 |

## What I Would Not Over-Invest In Yet

| Area | Why Not Now | Guardrail |
| --- | --- | --- |
| Broad `tools` language | 一旦做成泛 `best ai tools` 或 `ai tools list`，很容易偏到 marketing / business software listicle | `/tools` 可以做，但只能做 curated discovery / developer-agent workflow hub |
| `Cursor / Codex / OpenCode / OpenClaw` | 多輪資料都沒有把它們推到高於 Claude Code，現在同步大推只會稀釋主線 | 當第二波 ecosystem 擴張，不搶第一波資源 |
| Capability modality expansion | `speech`、`music`、`search`、`crawl`、broad `multimodal` 目前都還沒有足夠乾淨的 demand 證據 | 只先保留 supporting phrase，如 `image recognition api`、`image recognition ai`、`ai video analysis`，不急著擴 IA |

## Expansion Map By Path

如果改成「按頁面路徑排優先級」，目前我會這樣看。

| Path | Status | Keywords To Piggyback | Why This Path | Recommended Action | Priority |
| --- | --- | --- | --- | --- | --- |
| `/for/claude-code` | existing | `claude code skills`<br>`claude code tools`<br>`claude code capabilities` | 最能承接 Claude Code 生態的高相關 demand | 持續作為主 ecosystem landing，吸收 `tools / skills / capabilities` 三套語言 | `P0` |
| `/guides/add-tools-to-claude-code` | existing | `add tools to claude code`<br>`install tools for claude code`<br>`claude code tools vs skills`<br>`claude code cli mcp` | install intent 最強，最接近真實使用情境 | 做成最強 how-to / conversion page | `P0` |
| `/skills` | existing, should be upgraded | `claude skills`<br>`claude code skills`<br>`ai agent skills`<br>`ai agent skills marketplace` | `skills` 已經不只是 supporting language，而是核心 hub 語言 | 把它從輔助頁升級成核心 category hub | `P0` |
| `/cli` | existing | `agent cli`<br>`install anycap cli`<br>`agent sdk`<br>`claude code sdk` | 能把需求語言和產品 interface 接起來 | 強化 bridge copy，補 `CLI / SDK / install` 語言 | `P0` |
| `/guides/mcp-vs-a2a-for-ai-agents` | planned | `mcp vs a2a`<br>`a2a protocol vs mcp`<br>`agent to agent protocol vs mcp` | 這是最乾淨的 protocol compare query 群 | 作為 protocol branch 的第一個 compare 頁 | `P1` |
| `/glossary/agent-protocol` | planned | `agent protocol`<br>`agent api`<br>`agent sdk` | 可以補概念層，而不把首頁或產品頁拖去做通識教育 | 用 glossary 承接定義型需求 | `P1` |
| `/tools` | planned | `ai agent tools`<br>`ai agent tools vs mcp` | `tools` 是市場語言，但必須非常克制 | 只做 curated hub，不做泛 `best ai tools` | `P1` |
| `/for/cursor` | existing | `cursor skills`<br>`cursor mcp tools`<br>`add tools to cursor` | 有價值，但所有資料都顯示仍是第二波 | 保留並優化，但不要搶第一波資源 | `P2` |
| `/for/codex` | existing | `codex tools`<br>`codex mcp tools`<br>`codex cli tools` | 仍偏 GEO / defensive positioning，量化驗證較弱 | 作為第二波 ecosystem page 慢慢補 | `P2` |

## Semrush Validation By Path

如果下一輪要跑 Semrush keyword builder，我更傾向按 path 驗證，而不是按抽象 cluster 驗證。

| Path | Validation Goal | Seed Set |
| --- | --- | --- |
| `/for/claude-code` + `/guides/add-tools-to-claude-code` | 確認 Claude Code install line 是否繼續穩坐第一優先級 | `claude code tools`<br>`claude code tools vs skills`<br>`add tools to claude code`<br>`install tools for claude code`<br>`claude code mcp tools`<br>`serve claude code as mcp` |
| `/skills` | 確認 `skills` hub 是否要比其他新頁更快升級 | `ai agent skills`<br>`ai agent skills examples`<br>`ai agent skills marketplace`<br>`claude skills`<br>`claude code skills` |
| `/guides/mcp-vs-a2a-for-ai-agents` + `/glossary/agent-protocol` | 確認 protocol branch 應該先從 compare 還是 glossary 切入 | `mcp vs a2a`<br>`a2a protocol vs mcp`<br>`agent to agent protocol vs mcp`<br>`agent protocol`<br>`agent api`<br>`agent sdk` |
| `/tools` | 確認 `tools` hub 是否有足夠 agent-specific demand，而不會滑向泛 AI tools | `ai agent tools`<br>`ai agent tools vs mcp`<br>`ai agent tools github` |
| `/for/cursor` + `/for/codex` | 確認第二波 ecosystem 是否需要提前 | `cursor skills`<br>`cursor mcp tools`<br>`add tools to cursor`<br>`codex tools`<br>`codex mcp tools`<br>`codex cli tools` |

## What Would Change My Mind

目前這套判斷不是不可變的。下面任一情況出現，排序都值得重調。

| Trigger | What It Would Likely Change |
| --- | --- |
| `Cursor` 相關 query 在 Semrush / GSC 裡明顯上升 | `Cursor` 可能從第二波升到更靠前的位置 |
| `/skills` 類 query 的 volume 或 intent 比現在估計得更弱 | `/skills` hub 的優先級需要下修 |
| `MCP vs A2A` 的 SERP 被大型權威站完全鎖死，且沒有切入空間 | protocol branch 可能要改成 supporting content，而不是獨立重點頁 |
| capability modality research 顯示某一條線其實有更乾淨的需求盤 | capability cluster 的優先級可能提前 |

在那之前，我會把現在的排序視為較穩定的工作假設。

## Final Reflection

如果要把這輪所有分析濃縮成一句話，我現在的心得是：

- **AnyCap 不應該先去追最大盤，而應該先去追最像自己能承接的盤。**

| Prioritize Now | Avoid Treating As Short-Term Core |
| --- | --- |
| `Claude Code` | 泛 `AI tools` |
| `install` | 泛 `AI agent use cases` |
| `tools / skills` | 泛 `multimodal` |
| `MCP / protocol bridge` | consumer capability keywords |

也因此，短期最合理的內容策略不是橫向鋪很多頁，而是把幾條最準的線先打深：

| Order | Focus |
| --- | --- |
| 1 | `Claude Code install / skills / tools-vs-skills` |
| 2 | `/skills` hub |
| 3 | `MCP vs A2A / protocol` bridge |
| 4 | 之後再把 `Cursor` 與 capability cluster 逐步接上 |
