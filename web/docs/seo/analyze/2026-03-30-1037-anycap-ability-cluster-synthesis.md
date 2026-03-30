# [SEO-20260330-1037] AnyCap ability cluster synthesis and page mapping

- Time: `2026-03-30 10:37 CST`
- Node: `SEO-20260330-1037`
- Type: `analyze`
- Status: `done`
- Scope: `anycap.ai`, `seo-plan`, `keyword-discovery`, `page-intent mapping`, `anycap-ability_clusters_2026-03-30.csv`
- Related:
  - `[../index.md](../index.md)`
  - `[2026-03-26-1159-semrush-keyword-builder-synthesis.md](2026-03-26-1159-semrush-keyword-builder-synthesis.md)`
  - `[../todo/2026-03-26-1203-today-seo-todo.md](../todo/2026-03-26-1203-today-seo-todo.md)`
  - `[../todo/2026-03-30-1038-ability-cluster-follow-ups.md](../todo/2026-03-30-1038-ability-cluster-follow-ups.md)`

## Executive Summary

這份 `anycap-ability_clusters_2026-03-30.csv` 最大的價值，不是證明 AnyCap 可以去追更多泛 `AI agent` 大詞，而是把這幾件事講得更清楚：

1. `**Claude Code` 仍然是最強、最明確的需求入口。**
2. `**MCP vs A2A`、`agent protocol`、`agent SDK` 這條教育型 / 比較型支線，現在已經有足夠理由納入內容規劃。**
3. **這份 CSV 對 `image / video / speech / music / crawl` 這類多模態能力詞的證據很弱，不能拿它來硬推 capability cluster 擴張。**
4. **噪音仍然非常大，尤其是泛 use case、泛 business software、泛 cloud、以及 Claude 品牌導航詞。**

換句話說，這份資料比較像：

- 一份 `**Claude Code + protocol + agent dev education` 的關鍵詞盤**

而不是：

- 一份完整的 **AnyCap multimodal capability demand map**

因此，這次不應把策略重心從既有方向拉開。更合理的做法是：

- 繼續以 `Claude Code + agent CLI + installable capabilities` 做主軸
- 在這個主軸旁邊，新增一條 `MCP / A2A / protocol` 的教育內容支線
- 對 `Cursor / Codex` 保持佈局，但不要因為這份 CSV 就提高優先級
- 對 `music / speech / search / crawl` 保持產品敘事，但先不要把它們當成已被這份 CSV 驗證的 SEO 主題

## Source Files

- `/Users/tyluo/Downloads/anycap-ability_clusters_2026-03-30.csv`
- `web/src/app/(seo)/`
- `web/src/lib/landing-content.ts`

## Dataset Snapshot

### Basic Shape


| Item               | Value  |
| ------------------ | ------ |
| Rows               | `1435` |
| Topics             | `8`    |
| Database           | `us`   |
| `Sub page` rows    | `1347` |
| `Pillar page` rows | `88`   |


### Topic Distribution


| Topic                                             | Rows  | Aggregate Volume | Judgment                                   |
| ------------------------------------------------- | ----- | ---------------- | ------------------------------------------ |
| `specific ai agent integrations (claude, cursor)` | `727` | `337290`         | 最強主盤，但高度偏向 Claude 品牌與官方相關 intent           |
| `ai agent use cases & examples`                   | `384` | `100620`         | 量很大，但大多不適合 AnyCap                          |
| `ai agent harness & frameworks`                   | `116` | `25720`          | 有教育價值，但要挑詞                                 |
| `ai agent development tools`                      | `120` | `24820`          | 可用於 compare / education，但不能泛追              |
| `ai agent protocols & communication`              | `35`  | `8590`           | 量不算最大，但高度值得重視                              |
| `ai agent sdks & apis`                            | `35`  | `7100`           | 和 agent execution / tool access 相鄰，可做輔助教育頁 |
| `ai agent native applications`                    | `8`   | `5330`           | 有少量高相關概念詞，但盤不大                             |
| `ai agent runtimes & deployment`                  | `10`  | `2150`           | 與 AnyCap 的 `runtime` 名稱相似，但搜尋 intent 偏離很大  |


## What This CSV Validated

## 1. `Claude Code` 仍然是第一波最該吃的需求層

這份資料裡最強的不是泛 `capability runtime`，也不是泛 `multimodal tools`，而是整個 `Claude Code / Claude / Anthropic agent integration` 相關的搜尋盤。

### Representative Signals


| Keyword                               | Volume   | KD   | Topic                                             | Judgment                             |
| ------------------------------------- | -------- | ---- | ------------------------------------------------- | ------------------------------------ |
| `claude code`                         | `110000` | `70` | `specific ai agent integrations (claude, cursor)` | 超大詞，但偏品牌 / 官方 /導航 intent             |
| `claude code cli documentation`       | `6600`   | `39` | same                                              | 量大，但多數是官方文檔 intent                   |
| `claude skills`                       | `4400`   | `43` | same                                              | 與 AnyCap 的 skill distribution 敘事高度相關 |
| `claude code subagents documentation` | `3600`   | `50` | same                                              | 偏官方與生態教育，適合 bridge content           |
| `claude code sdk`                     | `2400`   | `34` | same                                              | 可支撐比較 / explanation 類內容              |
| `claude code agents`                  | `1300`   | `47` | same                                              | 仍是高相關生態詞                             |
| `claude code cli installation`        | `880`    | `31` | same                                              | 安裝型意圖明確                              |
| `serve claude code as mcp`            | `590`    | `42` | same                                              | 非常像 AnyCap 可以切入的 bridge keyword      |
| `claude code cli mcp`                 | `210`    | `22` | same                                              | 比較乾淨、可承接的長尾                          |


### Interpretation

這證明我們 03-26 那輪的主判斷沒有偏：

- `Claude Code` 依然是 AnyCap 最值得先押的 ecosystem
- `CLI`、`skills`、`install`、`MCP` 是比較像真實需求語言的切口

但同時這份資料也再次提醒：

- **不能把高 volume 的 Claude 詞直接當成 AnyCap target**

像這些詞就不應該正面追：

- `claude code`
- `claude code cli documentation`
- `claude code download`
- `claude logo`
- `who owns claude ai`

更合理的打法仍然是做可承接的 bridge content，例如：

- `add tools to claude code`
- `install capabilities for claude code`
- `claude code tools vs skills`
- `serve claude code as mcp`
- `claude code cli mcp`

## 2. `MCP vs A2A / protocol` 是這次最值得新增的內容支線

和 03-26 那輪相比，這份 `ability cluster` 最有新信息量的地方，不是再一次證明 `tools / skills / CLI`，而是把 `protocol / communication / MCP / A2A` 這塊拉成了可以操作的內容群。

### Representative Signals


| Keyword                          | Volume | KD   | Topic                                | Why It Matters             |
| -------------------------------- | ------ | ---- | ------------------------------------ | -------------------------- |
| `a2a protocol`                   | `2400` | `58` | `ai agent protocols & communication` | 頭部詞，但 KD 偏高                |
| `google a2a`                     | `1000` | `54` | same                                 | 品牌新詞，可做解釋型頁面               |
| `agent to agent protocol`        | `590`  | `63` | same                                 | 類別詞，教育意圖強                  |
| `mcp vs a2a`                     | `480`  | `30` | same                                 | 這批資料裡最值得做的比較詞之一            |
| `mcp a2a`                        | `110`  | `34` | same                                 | 可當 supporting keyword      |
| `a2a protocol vs mcp`            | `90`   | `27` | same                                 | 乾淨、低於中等 KD                 |
| `agent to agent protocol vs mcp` | `50`   | `20` | same                                 | 雖量不大，但意圖非常準                |
| `agent protocol`                 | `110`  | `49` | same                                 | 概念詞，可用 glossary / guide 佈局 |


### Interpretation

這群詞不是 AnyCap 的主交易頁關鍵詞，但非常適合作為：

- comparison / education page
- glossary / concept page
- capability runtime 與 protocol 的邊界解釋頁

這條線對 AnyCap 有價值，原因不是 AnyCap 本身就是 A2A 或 MCP 產品，而是：

- 使用者正在搜尋「agent 怎麼互通、怎麼掛工具、MCP 和 A2A 差在哪」
- AnyCap 可以在這個討論裡回答：
  - protocol 是做什麼的
  - capability layer / CLI / install path 又是在解決哪一段問題
  - AnyCap 跟 MCP / A2A 的關係是什麼，不是什麼

### Important Guardrail

這條內容支線只能建立在「清楚定位」上，不能寫成：

- `AnyCap = MCP`
- `AnyCap = A2A`
- `AnyCap 取代 protocol`

更合理的敘事是：

- protocol 解決 agent 之間或 agent 與 tool surface 的溝通標準
- AnyCap 解決 agent capability 的安裝、接入、統一調用與跨環境使用

## 3. `Cursor` 在這份資料裡依然不是第一波主流量盤

我們之前的文檔把 `Cursor` 視為第二層 ecosystem，這份 CSV 並沒有改變這個判斷。

### What The CSV Actually Shows

這份檔案裡和 `cursor` 直接相關的關鍵詞非常少，而且多數其實是 `Claude Code in Cursor`，不是 `Cursor skills` 或 `Cursor MCP tools` 那種獨立盤。


| Keyword                               | Volume | KD   | Judgment       |
| ------------------------------------- | ------ | ---- | -------------- |
| `claude code integration with cursor` | `320`  | `19` | 乾淨長尾，可吃        |
| `claude code on cursor`               | `320`  | `33` | 次要長尾           |
| `add claude code to cursor`           | `170`  | `21` | 可用 how-to 角度承接 |
| `install claude code in cursor`       | `90`   | `19` | 可用 how-to 角度承接 |
| `claude code cursor extension`        | `90`   | `15` | 低 KD，但屬非常具體長尾  |


### Interpretation

這代表：

- `/for/cursor` 仍然值得保留與優化
- 但這份 CSV **沒有** 給出足夠證據，支持我們把 Cursor 升到超過 Claude Code 的優先級
- 如果要更積極經營 Cursor，仍然應更多依靠：
  - 先前的 Semrush builder
  - autocomplete
  - 未來 GSC

而不是只靠這份 `ability cluster`

## 4. 這份 CSV 不能當成多模態 capability 擴張的主要依據

AnyCap 產品有 `image generation`、`video generation`、`image understanding`、`video analysis`，但這份 CSV 在這一塊的信號很弱，而且多數仍然掛在 Claude 品牌問題上。

### Representative Signals


| Keyword                          | Volume | KD   | Judgment                         |
| -------------------------------- | ------ | ---- | -------------------------------- |
| `claude image generation`        | `590`  | `21` | 有量，但偏 Claude 原生能力判斷              |
| `claude web search`              | `390`  | `25` | 有量，但不是 AnyCap 專屬能力詞              |
| `anthropic image generation`     | `140`  | `62` | 相關性一般，競爭偏高                       |
| `claude code web search`         | `90`   | `23` | 可以做 Claude 支線 supporting content |
| `can claude code search the web` | `70`   | `23` | 偏問題型長尾                           |


### What Is Missing

這份 CSV 沒有給出足夠強的群組去支撐：

- `video generation for ai agents`
- `video analysis for ai agents`
- `speech for ai agents`
- `music for ai agents`
- `crawl tools for ai agents`
- `search tools for ai agents`

### Interpretation

因此：

- 現有 capability pages 應該繼續保留，因為它們反映真實產品與站點架構
- 但不要把這份 CSV 當成「可以大幅擴張 multimodal capability cluster」的證據
- 若要驗證這條線，應另外跑以模態能力為 seed 的 research

## 5. 噪音仍然非常高，不能把大盤 volume 當成 target list

這份資料裡最大風險，和 03-26 那輪一樣，仍然是高 volume 假需求。

### Noise Examples


| Keyword               | Volume | KD   | Why It Is Noise For AnyCap                      |
| --------------------- | ------ | ---- | ----------------------------------------------- |
| `agency ai`           | `4400` | `50` | 偏 agency / services，不是 agent capability runtime |
| `ai customer service` | `5400` | `80` | 客服 use case，不是 AnyCap 的產品邊界                     |
| `fin ai`              | `5400` | `41` | 品牌詞，不是 category opportunity                     |
| `ai cloud`            | `1300` | `71` | 太泛、太偏 cloud platform                            |
| `claude logo`         | `3600` | `40` | 品牌導航詞                                           |
| `who owns claude ai`  | `2900` | `72` | 品牌資訊詞                                           |
| `claude download`     | `2400` | `70` | 官方下載 intent                                     |


### Strategic Rule

這份 CSV 的正確用法不是：

- 挑 volume 最大的詞去做頁面

而是：

- 先排除品牌導航詞
- 再排除 use case 與 business software 噪音詞
- 最後只保留那些能自然導向：
  - agent CLI
  - skills / tool installation
  - capability layer
  - protocol / ecosystem education

## Current SEO Page Mapping

下面這張表不是單純列出已有頁，而是把它們放回這次 CSV 與既有策略脈絡裡重新判斷。


| Cluster         | Existing Page                              | Likely Target                                                                      | Priority | Judgment                                      |
| --------------- | ------------------------------------------ | ---------------------------------------------------------------------------------- | -------- | --------------------------------------------- |
| CLI             | `/cli`                                     | `agent cli`, `install anycap cli`, `one cli for agent capabilities`                | P0       | 仍是最重要的 bridge page                            |
| Ecosystem       | `/for/claude-code`                         | `add capabilities to claude code`, `claude code tools`, `claude code capabilities` | P0       | 這份 CSV 最支持的現有 landing page                    |
| Guide           | `/guides/add-tools-to-claude-code`         | `add tools to claude code`, `install tools for claude code`                        | P0       | 最直接承接 install / how-to intent                 |
| Guide           | `/guides/install-anycap`                   | `install anycap`, `install anycap cli`                                             | P0       | 泛安裝入口，和 `/cli` 一起構成 onboarding spine          |
| Category        | `/capabilities`                            | `ai agent capabilities`, `installable capabilities for agents`                     | P1       | 品牌到需求的橋接頁，但不是這份 CSV 的最強盤                      |
| Capability leaf | `/capabilities/image-generation`           | `image generation through AI agents`                                               | P1       | 有產品價值，但這份 CSV 證據不足                            |
| Capability leaf | `/capabilities/video-generation`           | `video generation through AI agents`                                               | P1       | 同上                                            |
| Capability leaf | `/capabilities/image-understanding`        | `image understanding through AI agents`                                            | P1       | 同上                                            |
| Capability leaf | `/capabilities/video-analysis`             | `video analysis through AI agents`                                                 | P1       | 同上                                            |
| Ecosystem       | `/for/cursor`                              | `cursor agent capabilities`, `claude code in cursor`                               | P1       | 保留，但不宜因這份 CSV 升級成第一波主盤                        |
| Ecosystem       | `/for/codex`                               | `codex agent capabilities`                                                         | P2       | 這份 CSV 幾乎沒有提供新證據                              |
| Compare         | `/compare/anycap-vs-composio`              | `anycap vs composio`, `composio alternative`                                       | P1       | 仍值得保留，因為轉換意圖強                                 |
| Compare         | `/compare/anycap-vs-openai-agent-builder`  | `agent builder` related comparison                                                 | P2       | 有量，但競爭偏高且需要品牌 authority                       |
| Glossary        | `/glossary/agent-capability-runtime`       | `what is an agent capability runtime`                                              | P1       | GEO 必要頁，與主定位一致                                |
| Glossary        | `/glossary/context-engineering`            | `what is context engineering`                                                      | P2       | 有詞，但教育 intent 偏上層                             |
| Glossary        | `/glossary/agent-harness`                  | `what is an agent harness`                                                         | P2       | 可保留，但需控制與 guide 重疊                            |
| Guide           | `/guides/context-engineering-for-agents`   | `context engineering for agents`                                                   | P2       | 教育內容，有價值但非第一波轉換頁                              |
| Guide           | `/guides/workspace-context-engineering`    | `workspace context engineering`                                                    | P2       | 更偏 thought leadership / GEO                   |
| Guide           | `/guides/what-is-agent-harness`            | `what is an agent harness`                                                         | P2       | 和 glossary 頁有重疊風險                             |
| Guide           | `/guides/agent-skills-for-developer-tools` | `agent skills`, `skills for developer tools`                                       | P1       | 能支撐 skill distribution 敘事，但缺少獨立 `/skills` hub |
| Models          | `/models` and `/models/*`                  | `seedream 5 for ai agents`, `veo 3.1 for ai agents`                                | P2       | 長尾保護位，不是主流 acquisition 核心                     |


## Gaps Exposed By This Round

## 1. `protocol / MCP / A2A` 頁型缺口已經足夠明確

這次最明確的新缺口不是再做更多 ecosystem page，而是：

- 缺一頁能承接 `mcp vs a2a`
- 缺一頁能解釋 `agent protocol`
- 缺一頁能把 `protocol`、`MCP`、`capability layer`、`CLI` 的角色關係說清楚

對應候選頁型可以是：

- `/guides/mcp-vs-a2a-for-ai-agents`
- `/glossary/agent-protocol`
- `/guides/how-anycap-fits-with-mcp`

## 2. `/tools` 與 `/skills` hub 仍然是結構性缺口

這份 CSV 沒有像 03-26 的 builder 那樣，直接把 `tools` 打得那麼明顯，但它並沒有推翻原本的判斷。

換句話說：

- `tools / skills / CLI` 仍然是市場語言
- 只是這份 `ability cluster` 更偏向 Claude / protocol，而不是 broad market hub 詞

所以 `/tools` 與 `/skills` 的缺口仍然存在，只是它們這一輪不是最需要立刻新增的頁。

## 3. `context engineering / agent harness` 已經有重疊風險

目前站上這組頁面已經形成一個小集群：

- `/guides/context-engineering-for-agents`
- `/guides/workspace-context-engineering`
- `/guides/what-is-agent-harness`
- `/glossary/context-engineering`
- `/glossary/agent-harness`

這條線不是不該做，而是需要更嚴格區分：

- glossary 定義頁
- practical guide
- broader concept article

不然會出現：

- title / intent 重疊
- internal linking 模糊
- AI search 與 organic 都不容易知道哪一頁才是主頁

## 4. 多模態 capability 擴張需要另一輪專項 research

如果後續要強化：

- `/capabilities/search`
- `/capabilities/crawl`
- `/capabilities/speech`
- `/capabilities/music`

或要擴寫現有 image / video cluster

那就不應該再繼續依賴這份 CSV，而應直接用模態能力詞作為新的 keyword seed 重新研究。

## Updated Priority After This CSV

### P0

- 強化 `/cli`
- 強化 `/for/claude-code`
- 強化 `/guides/add-tools-to-claude-code`
- 強化 `/guides/install-anycap`

### P1

- 新增一頁 `MCP vs A2A` 或等價 comparison / guide
- 強化 `/compare/anycap-vs-composio`
- 保持 `/capabilities` 作為 capability bridge hub
- 保持 `/for/cursor`，但不做過度擴張
- 明確規劃 `/skills` hub 是否作為下一輪補位頁

### P2

- `/for/codex`
- `models/*`
- `context engineering / agent harness` 集群重整
- 其他 ecosystem pages，例如 `opencode`、`openclaw`

## Final Judgment

這份 `ability cluster` 沒有推翻 AnyCap 既有 SEO 路線，反而讓路線更清楚：

- **第一主軸仍然是 `Claude Code + agent CLI + installable capabilities`**
- **第二條最值得新增的支線是 `MCP / A2A / protocol` 教育內容**
- `**Cursor` 仍然重要，但在這份資料裡不是第一波主流量盤**
- **multimodal capability pages 要繼續做，但不能假裝這份 CSV 已經替它們驗證了 demand**

因此，這輪最合理的輸出不是「再擴更多泛 agent 頁」，而是：

1. 把既有 P0 頁面對位得更準
2. 正式開一條 `protocol / comparison` 內容支線
3. 對 capability cluster 保持克制，等待更專門的 keyword 驗證

