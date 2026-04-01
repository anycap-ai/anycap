# [SEO-20260401-2021] Current SEO keyword window under AGENTS guardrails

- Time: `2026-04-01 20:21 CST`
- Node: `SEO-20260401-2021`
- Type: `analyze`
- Status: `done`
- Scope: `anycap.ai`, `AGENTS.md`, `current SEO keyword window`, `keyword prioritization`, `AnyCap CLI capability validation`
- Related:
  - [`../index.md`](../index.md)
  - [`2026-03-26-1159-semrush-keyword-builder-synthesis.md`](2026-03-26-1159-semrush-keyword-builder-synthesis.md)
  - [`2026-03-30-1037-anycap-ability-cluster-synthesis.md`](2026-03-30-1037-anycap-ability-cluster-synthesis.md)
  - [`2026-03-30-1114-tool-hub-and-capability-strategy-synthesis.md`](2026-03-30-1114-tool-hub-and-capability-strategy-synthesis.md)
  - [`../todo/2026-03-30-1038-ability-cluster-follow-ups.md`](../todo/2026-03-30-1038-ability-cluster-follow-ups.md)
  - [`../../../../AGENTS.md`](../../../../AGENTS.md)

## Why This Memo Exists

前幾輪 SEO 研究已經把 `Claude Code`、`skills`、`tools`、`CLI`、`protocol` 這幾條需求線拉得很清楚，但有一個新的實務問題需要補一篇獨立分析來回答：

1. **依 `AGENTS.md`，AnyCap 現在公開 SEO 到底能打哪些詞。**
2. **AnyCap CLI 現況比網站公開敘事更寬時，SEO 應該跟哪一邊對齊。**
3. **哪些詞雖然看起來能打，但現在打了會偏離產品敘事或違反 capability guardrail。**

這篇是新的 `analyze`，不是舊文件的延伸改寫。目的不是重做全部研究，而是把「目前時間點可打的 SEO 關鍵詞窗口」收斂出來。

## Method

這次判斷交叉使用四類訊號：

1. **產品與站點 guardrail**
   - `AGENTS.md`
   - `web/src/lib/site.ts`
   - `web/public/llms.txt`

2. **目前公開頁面結構**
   - `web/src/app/(seo)/`
   - `web/src/app/[locale]/(seo)/`

3. **既有 SEO 研究與待辦**
   - 03-26 Semrush builder synthesis
   - 03-30 ability cluster synthesis
   - 03-30 tool hub and capability cluster synthesis
   - 03-30 follow-up todo

4. **即時 CLI 驗證**
   - `anycap status`
   - `anycap actions --help`
   - `anycap image models`
   - `anycap video models`
   - `anycap music models`

## Current Truth: Public SEO Claims vs CLI Reality

## 1. Public SEO canonical language

依 `web/src/lib/site.ts` 與 `web/public/llms.txt`，目前網站對外可穩定主張的 early-access capability 只有：

- `image generation`
- `video generation`
- `image understanding`
- `video analysis`

依同一組 canonical 定義，以下仍屬 roadmap：

- `music`
- `speech`
- `search`
- `crawl`

這條規則在 `AGENTS.md` 裡是硬性 guardrail：

- 所有頁面、metadata、`llms.txt`、agent-facing copy 都必須對齊這組 canonical capability list
- **不可以**把 roadmap capability 描述成現在已經公開可用

## 2. CLI reality is already broader

本輪即時 CLI 驗證顯示，AnyCap 在實際 capability surface 上已經比網站公開語言更寬。

### `anycap status`

目前 server features 顯示為可用的能力包括：

- `image.generate`
- `image.edit`
- `image.models`
- `image.read`
- `video.generate`
- `video.models`
- `video.read`
- `audio.read`
- `audio.models`
- `music.generate`
- `music.models`
- `drive`
- `page`

### `anycap actions --help`

目前 action surface 包含：

- `image-read`
- `video-read`
- `audio-read`

### model catalogs

目前 CLI 查到的 model surface：

- image:
  - `nano-banana-2`
  - `nano-banana-pro`
  - `seedream-5`
- video:
  - `kling-3.0`
  - `seedance-1.5-pro`
  - `veo-3.1`
- music:
  - `elevanlabs-music`

## 3. SEO should follow public truth, not the widest internal truth

這一點是這篇 memo 最重要的判斷。

雖然 CLI 已經顯示：

- `music.generate` 是 live
- `audio-read` 是 live
- `drive` / `page` 是 live

但依 `AGENTS.md` 的網站與 SEO guardrail，**目前 acquisition-facing SEO 仍然要先跟 `site.ts` / `llms.txt` 的公開能力敘事對齊**，而不是直接跟最寬的 CLI surface 對齊。

也就是說：

- CLI 現況可以當成 **research input**
- 但不應直接變成 **公開 capability 主題擴張**

這個區分非常重要，否則網站會出現：

- 產品現況敘事不一致
- capability claim 不穩定
- AI crawler / organic search 對 AnyCap 的實體理解變模糊

## Current Keyword Window

## P0: 現在最值得打的詞

這一層同時滿足：

1. 與產品敘事高度一致
2. 有真實搜尋需求
3. 不違反 canonical capability guardrail
4. 可以被現有頁面承接

### Cluster A: Claude Code install / extension intent

最值得優先打的詞：

- `claude code skills`
- `claude skills`
- `add tools to claude code`
- `install tools for claude code`
- `claude code tools vs skills`
- `serve claude code as mcp`
- `claude code cli mcp`

原因：

- 這是目前最強、最乾淨的 ecosystem demand line
- 和 AnyCap 的 installable capability 敘事最貼
- 與 `AGENTS.md` 中的 agent product positioning 高度一致

最適合承接頁面：

- `/for/claude-code`
- `/guides/add-tools-to-claude-code`

### Cluster B: CLI / onboarding intent

最值得優先打的詞：

- `anycap cli`
- `install anycap`
- `install anycap cli`
- `agent cli`
- `installable capabilities for agents`

原因：

- 這組詞能把搜尋入口自然接回產品核心
- 不需要過度消耗 capability claim
- 可以兼顧 SEO 與 GEO

最適合承接頁面：

- `/cli`
- `/guides/install-anycap`
- `/start`

### Cluster C: Skills language

現在仍應視為 P0 的詞：

- `ai agent skills`
- `skills for ai agents`
- `claude skills`

原因：

- 這條線已被多份 research 重複驗證
- 它既是市場語言，也能自然回扣 AnyCap skill distribution

最適合承接頁面：

- `/skills`
- `/for/claude-code`

## P1: 可以打，但應是第二層

### Cluster D: Tools / protocol / bridge content

可打的詞：

- `ai agent tools`
- `ai agent tools vs mcp`
- `mcp vs a2a`
- `a2a protocol vs mcp`
- `agent protocol`
- `agent api`
- `agent sdk`
- `agent capability runtime`
- `capability layer for ai agents`

原因：

- 這些詞更適合教育型或 bridge page
- 能建立 AnyCap 懂 agent stack 的認知
- 但不是第一波最直接的 acquisition page

適合承接頁面：

- `/skills`
- `/capabilities`
- `/glossary/agent-capability-runtime`
- 後續可補的 protocol / compare guide

### Cluster E: Publicly true capability-supporting keywords

目前可以圍繞現有 4 個 public capability 去補的詞：

- `image generation api`
- `text to image api`
- `video generation api`
- `text to video api`
- `image recognition api`
- `vision api`
- `image analysis api`
- `ai video analysis api`
- `video understanding api`
- `video intelligence api`

這些詞的作用不是開新大 cluster，而是替現有 capability leaves 提供更乾淨的 supporting layer。

適合承接頁面：

- `/capabilities/image-generation`
- `/capabilities/video-generation`
- `/capabilities/image-understanding`
- `/capabilities/video-analysis`

## P2: 可布局，但先不要重押

### Cluster F: Second-wave ecosystems

可追但不宜重押的詞：

- `cursor skills`
- `add tools to cursor`
- `claude code in cursor`
- `codex tools`

原因：

- 有價值，但目前 demand 與 fit 都還比不上 Claude Code 線
- 比較適合作為第二波擴張或 defensive coverage

對應頁面：

- `/for/cursor`
- `/for/codex`

### Cluster G: model pages and developer education

可保留但不應成主 acquisition 的詞：

- model-name queries
- `context engineering`
- `agent harness`

原因：

- 它們能補站點 authority 與 GEO
- 但不是目前最直接的增長入口

對應頁面：

- `/models`
- `/models/*`
- `/guides/context-engineering-for-agents`
- `/glossary/context-engineering`
- `/glossary/agent-harness`

## Terms That Look Tempting But Should Not Be Hit Now

以下詞目前不適合作為 AnyCap 的主 SEO 目標：

### 1. 泛 AI / business software 噪音

- `ai tools list`
- `ai marketing tools`
- `automation tools`
- `ai customer service`
- `future of ai`

### 2. Claude 品牌導航 / 官方文檔意圖

- `claude code`
- `claude code cli documentation`
- `claude download`
- `claude logo`
- `who owns claude ai`

### 3. consumer TTS / voice intent

- `text to speech`
- `ai voice generator`
- `read aloud`

### 4. roadmap capability head terms

在沒有新的 public canonical claim 前，不應大打：

- `music generation for ai agents`
- `speech for ai agents`
- `search tools for ai agents`
- `crawl tools for ai agents`

### 5. broad multimodal capability expansion

不能因為 CLI 現在比較寬，就直接把以下方向拉成公開 acquisition cluster：

- `music`
- `speech`
- `search`
- `crawl`
- 泛 `multimodal ai agents`

## Practical Page Mapping

| Priority | Keyword cluster | Best current page |
| --- | --- | --- |
| P0 | `claude code skills`, `claude skills`, `add tools to claude code`, `install tools for claude code` | `/for/claude-code`, `/guides/add-tools-to-claude-code` |
| P0 | `anycap cli`, `install anycap`, `install anycap cli`, `agent cli` | `/cli`, `/guides/install-anycap`, `/start` |
| P0 | `ai agent skills`, `skills for ai agents` | `/skills` |
| P1 | `ai agent tools`, `ai agent tools vs mcp`, `mcp vs a2a`, `agent protocol`, `agent capability runtime` | `/skills`, `/capabilities`, `/glossary/agent-capability-runtime` |
| P1 | `image generation api`, `vision api`, `ai video analysis api` | `/capabilities/image-generation`, `/capabilities/image-understanding`, `/capabilities/video-analysis` |
| P2 | `cursor skills`, `codex tools`, model-name long-tail, `context engineering` | `/for/cursor`, `/for/codex`, `/models`, education / glossary pages |

## Final Judgment

如果只看「現在這個時間點、在 `AGENTS.md` guardrail 下，AnyCap 真的能打什麼 SEO 關鍵詞」，排序應該收斂成：

1. **`Claude Code + install + skills + tools-vs-skills`**
2. **`CLI + onboarding + installable capabilities`**
3. **`skills / tools / protocol / capability runtime` 這組 bridge content**
4. **只圍繞 4 個已公開 capability 補 supporting API / use-case 詞**
5. **`Cursor / Codex / models / context engineering` 作為第二波**

這篇分析最重要的補充是：

- **CLI 現況已經比網站公開敘事更寬**
- 但 **AnyCap 的公開 SEO 關鍵詞，現在仍然必須跟 public canonical capability language 對齊**
- 因此，`music / speech / search / crawl / audio-read / drive / page` 在這一輪更適合作為 research input 或 backlog signal，而不是立刻拿來當公開 acquisition topic

## Sources Used

### Product guardrails

- `AGENTS.md`
- `web/src/lib/site.ts`
- `web/public/llms.txt`

### Existing research

- `web/docs/seo/analyze/2026-03-26-1159-semrush-keyword-builder-synthesis.md`
- `web/docs/seo/analyze/2026-03-30-1037-anycap-ability-cluster-synthesis.md`
- `web/docs/seo/analyze/2026-03-30-1114-tool-hub-and-capability-strategy-synthesis.md`
- `web/docs/seo/todo/2026-03-30-1038-ability-cluster-follow-ups.md`

### Live CLI validation

- `anycap status`
- `anycap actions --help`
- `anycap image models`
- `anycap video models`
- `anycap music models`
