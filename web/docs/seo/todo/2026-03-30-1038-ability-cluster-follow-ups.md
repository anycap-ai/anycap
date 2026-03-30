# [SEO-20260330-1038] Cluster synthesis follow-up todo

- Time: `2026-03-30 10:38 CST`
- Node: `SEO-20260330-1038`
- Type: `todo`
- Status: `planned`
- Scope: `cluster analysis follow-ups`, `page prioritization`, `skills hub`, `tools discovery`, `protocol content branch`
- Related:
  - [`../index.md`](../index.md)
  - [`../analyze/2026-03-30-1037-anycap-ability-cluster-synthesis.md`](../analyze/2026-03-30-1037-anycap-ability-cluster-synthesis.md)
  - [`../analyze/2026-03-30-1114-tool-hub-and-capability-strategy-synthesis.md`](../analyze/2026-03-30-1114-tool-hub-and-capability-strategy-synthesis.md)

## Source Nodes

- [`SEO-20260326-1131`](../analyze/2026-03-26-1131-anycap-ai-seo-strategy-baseline.md)
- [`SEO-20260326-1145`](../analyze/2026-03-26-1145-anycap-ai-keyword-discovery-baseline.md)
- [`SEO-20260326-1159`](../analyze/2026-03-26-1159-semrush-keyword-builder-synthesis.md)
- [`SEO-20260330-1037`](../analyze/2026-03-30-1037-anycap-ability-cluster-synthesis.md)
- [`SEO-20260330-1114`](../analyze/2026-03-30-1114-tool-hub-and-capability-strategy-synthesis.md)
- [`SEO-20260330-1321`](../analyze/2026-03-30-1321-capability-keyword-research-refresh.md)

## Documentation Note

- 這篇 `todo` 現在承接 03-30 這一輪的多份 cluster 分析，不再只限定 `ability cluster`。
- 目前仍屬研究與規劃階段，因此只更新 `analyze` 與 `todo`，不建立 `change-log`。

## Core Guardrail

- 核心定位仍是：`AnyCap = agent-native capability runtime / capability layer for AI agents`
- acquisition 入口仍以：`agent CLI`、`Claude Code`、`installable capabilities` 為主
- `skills` 已從輔助語言升級成更值得獨立承接的 hub 候選
- `tools` 可以做，但只能作為 curated discovery / directory，不是泛 AI tools 大全
- `MCP / A2A / protocol / SDK / API` 值得成為新的教育內容支線
- 目前資料 **沒有** 充分驗證：`music / speech / search / crawl / broad multimodal` 可以直接擴張成大內容集群

## Priority Now

1. 重新對位並強化現有 P0 頁面，聚焦：
   - `/cli`
   - `/for/claude-code`
   - `/guides/add-tools-to-claude-code`
   - `/guides/install-anycap`

2. 規劃 `/skills`，作為目前最值得補的缺頁之一：
   - 明確回答 `skills` 是什麼
   - 它和 `tools`、`capabilities`、`CLI` 的關係
   - 哪些 agent product 能使用

3. 規劃一條新的 protocol / comparison 支線，優先考慮：
   - `/guides/mcp-vs-a2a-for-ai-agents`
   - 或等價的 `MCP vs A2A` 比較頁
   - 視需要補一頁 `/glossary/agent-protocol`

4. 定義 `/tools` 是否作為 discovery / directory hub：
   - 只收與 agent workflow 高相關的工具
   - 不碰泛 `AI marketing tools`
   - 不碰泛 business software listicle

5. 明確整理 `context engineering / agent harness` 集群邊界，避免：
   - glossary 與 guide 重疊
   - 一個 query 被多頁同時追
   - internal linking 無法告訴搜尋引擎哪一頁是主頁

## Next

1. 將 `SDK / API / framework` 語言補進既有頁面與內鏈策略：
   - `/cli`
   - `/for/claude-code`
   - `/guides/add-tools-to-claude-code`

2. 保持 `/for/cursor` 為 P1，但不要因這一輪資料過度擴張 Cursor 線

3. 視 authority 與內容成熟度，逐步推進 compare 頁：
   - `/compare/anycap-vs-composio`
   - `/compare/anycap-vs-openai-agent-builder`

4. 為 capability cluster 開一輪獨立 research，專門驗證：
   - `image generation`
   - `video generation`
   - `image understanding`
   - `video analysis`
   - `search`
   - `crawl`
   - `speech`
   - `music`

5. 重新判斷 `image understanding` 與 `video analysis` 葉子頁能否用更乾淨的 supporting keyword 強化，而不是直接按 CSV Topic 名稱擴頁
   - `image understanding` 優先轉向 `image recognition api`、`vision api`、`image analysis api`
   - `video analysis` 優先轉向 `ai video analysis api`、`video understanding api`、`video intelligence api`
   - `image generation` 與 `video generation` 補強 `image/video generation api`、`text-to-image`、`text-to-video`

6. 對 coming soon capability 先做 seed validation，不急著建頁：
   - `search` 先驗證 `web search api` / `search api for ai agents`
   - `crawl` 先驗證 `web scraping api` / `crawl api` / `web data api`
   - `speech` 先拆分 `speech-to-text` / `text-to-speech` / `voice api`
   - `music` 先驗證 `music generation api` / `ai music api`

## Later

1. 再決定是否擴寫：
   - `/for/codex`
   - `/for/opencode`
   - `/for/openclaw`

2. 再系統化擴寫 `models/*` 長尾頁

3. 只有在有獨立 demand 證據後，才擴 capability 子頁：
   - `/capabilities/search`
   - `/capabilities/crawl`
   - `/capabilities/speech`
   - `/capabilities/music`

4. 再決定是否要把 `/tools` 拓展成更完整的 discovery 體系

## Not Now

- 不追泛 `agency ai`
- 不追泛 `ai customer service`
- 不追泛 `ai cloud`
- 不追泛 `ai marketing tools`
- 不追泛 `future of ai` / `ai news` 類資訊詞
- 不追 consumer TTS / voice generator 大詞，例如：
  - `text to speech`
  - `ai voice generator`
  - `read aloud`
- 不追 Claude 品牌導航詞，例如：
  - `claude logo`
  - `claude download`
  - `who owns claude ai`
- 不把 `ai-capability` 的 Topic 名稱直接當成站點資訊架構
- 不把目前資料當成多模態能力需求已被完全驗證
- 不在未驗證前直接建立泛 `speech` capability 頁
- 不在未驗證前直接建立泛 `music` capability 頁
- 不把 `crawl` 當成唯一市場主語，忽略 `web scraping api` / `web data api`

## Working Rule

- 這一輪 cluster 分析最適合驅動：
  - `Claude Code` 生態頁
  - install / guide 頁
  - `skills` hub
  - curated `tools/discovery` hub
  - protocol / comparison / glossary 頁

- 這一輪 cluster 分析不適合驅動：
  - 泛 AI business use case 頁
  - 泛 cloud / platform 頁
  - consumer TTS / voice generator 頁
  - 未被額外驗證的 modality expansion

- 後續凡是 AnyCap 的 SEO 調研與待辦更新，預設都持續沉澱到 `web/docs/seo/` 下，不再只停留在聊天結論。
