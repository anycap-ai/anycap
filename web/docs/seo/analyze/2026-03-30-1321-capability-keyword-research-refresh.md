# [SEO-20260330-1321] Capability keyword research refresh and naming fit

- Time: `2026-03-30 13:21 CST`
- Node: `SEO-20260330-1321`
- Type: `analyze`
- Status: `done`
- Scope: `capability keywords`, `page naming`, `image/video capabilities`, `search/crawl/speech/music`, `Semrush follow-up seeds`
- Related:
  - [`../index.md`](../index.md)
  - [`2026-03-26-1145-anycap-ai-keyword-discovery-baseline.md`](2026-03-26-1145-anycap-ai-keyword-discovery-baseline.md)
  - [`2026-03-30-1037-anycap-ability-cluster-synthesis.md`](2026-03-30-1037-anycap-ability-cluster-synthesis.md)
  - [`2026-03-30-1114-tool-hub-and-capability-strategy-synthesis.md`](2026-03-30-1114-tool-hub-and-capability-strategy-synthesis.md)
  - [`2026-03-30-1153-keyword-prioritization-reflection.md`](2026-03-30-1153-keyword-prioritization-reflection.md)
  - [`../todo/2026-03-30-1038-ability-cluster-follow-ups.md`](../todo/2026-03-30-1038-ability-cluster-follow-ups.md)

## Why This Pass Exists

前面幾輪文檔已經反覆提到一件事：

- capability 這條線不能直接照 CSV topic 名稱擴頁

但到目前為止，還少一篇專門回答下面問題的文檔：

1. 現有 capability 頁名和真實市場語言，到底有沒有對上
2. `image / video` 這些已上線能力，應該補哪些 supporting keyword
3. `search / crawl / speech / music` 這些 coming soon 能力，應該先研究什麼詞，而不是直接建頁

這篇就是補這個缺口。

## This Pass Used

### Existing Site Surface

- `web/src/app/(seo)/capabilities/page.tsx`
- `web/src/app/(seo)/capabilities/image-generation/page.tsx`
- `web/src/app/(seo)/capabilities/video-generation/page.tsx`
- `web/src/app/(seo)/capabilities/image-understanding/page.tsx`
- `web/src/app/(seo)/capabilities/video-analysis/page.tsx`

### Prior Internal SEO Evidence

- 03-26 baseline keyword discovery
- 03-30 ability cluster synthesis
- 03-30 tool hub / capability synthesis
- 03-30 keyword prioritization reflection

### Live Demand-Language Checks

這輪沒有直接拿到 Semrush MCP 數據，因為 `user-semrush` 認證被跳過；因此這次主要用 live web search 去看：

- 哪些 query 有明顯 provider / API / framework SERP
- 哪些 query 名稱比目前頁名更接近市場語言
- 哪些詞其實會把 AnyCap 帶到 consumer or enterprise voice/software SERP

## High-Level Judgment

目前 capability keyword research 最重要的結論不是「多出很多新詞」，而是：

1. **`image generation` 與 `video generation` 這兩條頁名基本成立，但要更靠近 `API / text-to-*` 語言。**
2. **`image understanding` 與 `video analysis` 這兩條頁名偏產品內部語言，市場更常用的是 `vision / image recognition / image analysis / video understanding / video intelligence`。**
3. **`search` 與 `crawl` 不是沒有需求，而是需求語言更像 `web search api`、`web scraping api`、`crawl api`、`web data api`。**
4. **`speech` 目前不能當成一個單一 SEO 主題，因為市場語言會快速分裂成 `speech-to-text`、`text-to-speech`、`voice api`、`voice agents`。**
5. **`music` 有 API 層面的市場信號，但 agent-native intent 仍弱，短期只適合做 seed validation，不適合直接建 capability 頁。**

## Naming Fit by Capability

## 1. Image Generation

### Current Page Language

- `image generation`
- `generate images through AI agents`

### Market Language Signal

live SERP 顯示這條線最穩的市場語言包括：

- `image generation api`
- `text to image api`
- `image generation for ai agents`
- `image editing api`

### Judgment

這條線整體是對得上的。

問題不是頁名錯，而是 supporting keyword 還可以更靠近市場常用語：

- `text-to-image`
- `image generation API`
- `image editing`

### Recommendation

- 保留 `/capabilities/image-generation`
- 在 metadata、schema、H2、FAQ 裡補：
  - `image generation api`
  - `text to image api`
  - `image editing api`
  - `image generation for ai agents`

### Priority

- `P1` for page strengthening

## 2. Video Generation

### Current Page Language

- `video generation`
- `generate videos through AI agents`

### Market Language Signal

live SERP 顯示這條線常見語言包括：

- `video generation api`
- `text to video api`
- `video creation api`
- `agent-first text-to-video`

### Judgment

這條線也算對得上，但和 image generation 一樣，市場更偏 `API` 與 `text-to-video` 語言。

### Recommendation

- 保留 `/capabilities/video-generation`
- 補強 supporting keyword：
  - `text to video api`
  - `video generation api`
  - `video generation for ai agents`
  - `text to video for developers`

### Priority

- `P1` for page strengthening

## 3. Image Understanding

### Current Page Language

- `image understanding`
- `analyze images through AI agents`

### Market Language Signal

目前這條線最明顯的市場語言不是 `image understanding` 本身，而是：

- `image recognition api`
- `vision api`
- `image analysis api`
- `OCR api`
- `vision api for ai agents`

### Judgment

這是目前 naming fit 最值得警惕的一條。

`image understanding` 作為產品概念沒有問題，但如果只靠這個詞，容易和真實 demand language 錯開。

### Recommendation

- 短期先不改 slug
- 但頁面文案、FAQ、schema、internal links 應明確吸收：
  - `image recognition api`
  - `vision api`
  - `image analysis for ai agents`
  - `OCR for agents`

### Better Positioning Language

更適合的頁面定位不是單純：

- `image understanding`

而是：

- `vision and image analysis capability for AI agents`

### Priority

- `P0` for keyword/copy correction

## 4. Video Analysis

### Current Page Language

- `video analysis`
- `analyze videos through AI agents`

### Market Language Signal

live SERP 更接近的語言包括：

- `ai video analysis api`
- `video analysis api`
- `video understanding api`
- `video intelligence api`

### Judgment

這條線比 `image understanding` 稍好，但仍然偏內部命名。

因為市場其實更常把這種能力理解成：

- video understanding
- video intelligence
- video analysis API

### Recommendation

- 短期保留 `/capabilities/video-analysis`
- 在 supporting keyword 上補：
  - `ai video analysis api`
  - `video understanding api`
  - `video analysis for ai agents`
  - `video intelligence api`

### Better Positioning Language

更好的頁面敘事是：

- `video understanding and analysis for AI agents`

### Priority

- `P0` for keyword/copy correction

## 5. Search

### Current Capability Label

- `Search`
- `web search capabilities for agents`

### Market Language Signal

這條線目前看到的市場語言更像：

- `web search api`
- `search api for ai agents`
- `search api for llms`
- `real-time web search api`

### Judgment

`search` 這個概念本身沒有錯，但真正能接 demand 的不是泛 `search`，而是：

- `web search api`

如果未來真的建頁，不能只寫成 capability 概念頁，而要更接近：

- `web search capability / api for AI agents`

### Recommendation

- 現階段不要急著建 `/capabilities/search`
- 先用 builder 驗證：
  - `web search api ai agents`
  - `search api for ai agents`
  - `search api for llms`
  - `real time web search api`

### Priority

- `P2` seed validation only

## 6. Crawl

### Current Capability Label

- `Crawl`
- `web crawling and content extraction`

### Market Language Signal

這條線目前看到的市場語言比 `crawl` 更常見的是：

- `web scraping api`
- `crawl api`
- `web data api`
- `content extraction api`

尤其在 agent 語境下，SERP 已經很明顯偏向：

- Firecrawl
- Apify
- Spider
- scraping / extraction / markdown-ready web data

### Judgment

如果未來做這條線，不能只拿 `crawl` 當主詞，因為：

- 它太內部
- 也太窄

更真實的市場語言是：

- scraping
- crawl api
- web data
- content extraction

### Recommendation

- 不急著建 `/capabilities/crawl`
- 先驗證這組詞：
  - `web scraping api ai agents`
  - `crawl api ai agents`
  - `web data api ai agents`
  - `content extraction api`

### Priority

- `P2` seed validation only

## 7. Speech

### Current Capability Label

- `Speech`
- `text-to-speech and voice generation`

### Market Language Signal

這條線目前最不適合直接用一個泛 `speech` 頁去承接，因為市場語言會快速分成至少三群：

- `speech to text api`
- `text to speech api`
- `voice api` / `voice agents`

而且這三群 SERP intent 差異很大。

### Judgment

目前如果直接做 `/capabilities/speech`，很容易同時出現三個問題：

1. query intent 太散
2. consumer / enterprise voice 平台太強
3. 頁面不知道自己到底在講 STT、TTS 還是 voice agents

### Recommendation

- 先不要做 generic `speech` capability page
- 先從產品層面釐清要承接：
  - `speech to text`
  - `text to speech`
  - `voice agent`
  - 或其中哪一個

### Validation Seeds

- `speech to text api ai agents`
- `text to speech api ai agents`
- `voice api ai agents`
- `voice agents api`

### Priority

- `P3` until product scope is clearer

## 8. Music

### Current Capability Label

- `Music`
- `generate music and audio compositions`

### Market Language Signal

這條線現在能看到的語言主要是：

- `music generation api`
- `ai music api`
- `text to music api`
- provider-led brand terms like `Lyria`

### Judgment

music 的 API demand 是存在的，但 agent-native intent 目前仍偏弱。

換句話說：

- 這條線比較像 provider / model / developer API 市場
- 還不像 `Claude Code install` 或 `skills` 那樣，已經有很清楚的 agent workflow demand language

### Recommendation

- 不急著建 `/capabilities/music`
- 先觀察 provider 新詞與 builder volume：
  - `music generation api`
  - `ai music api`
  - `text to music api`
  - `lyria api`

### Priority

- `P3` seed validation only

## Updated Capability Keyword Queue

### P0: Fix Current Naming and Copy Fit

- `image recognition api`
- `vision api`
- `image analysis api`
- `ai video analysis api`
- `video understanding api`
- `video intelligence api`

這組詞最值得先處理，因為它們直接影響現有頁面是否和市場語言對得上。

### P1: Strengthen Existing Early-Access Pages

- `image generation api`
- `text to image api`
- `image generation for ai agents`
- `video generation api`
- `text to video api`
- `video generation for ai agents`

這組詞不一定代表要換頁名，但非常值得進 metadata / FAQ / schema / internal link copy。

### P2: Validate Future Web Capability Lines

- `web search api ai agents`
- `search api for ai agents`
- `web scraping api ai agents`
- `crawl api ai agents`
- `web data api ai agents`

### P3: Validate Audio Capability Split Before Any Page Build

- `speech to text api ai agents`
- `text to speech api ai agents`
- `voice api ai agents`
- `music generation api`
- `ai music api`

## Semrush Builder Pack For Capability Research

如果下一輪要去 Semrush builder，建議不要再丟太泛的 `multimodal`，而是直接丟下面 4 組。

### Pack A: Existing Image / Video Pages

- `image generation api`
- `text to image api`
- `image editing api`
- `video generation api`
- `text to video api`
- `video creation api`

### Pack B: Rename-Pressure Terms

- `image recognition api`
- `vision api`
- `image analysis api`
- `ai video analysis api`
- `video understanding api`
- `video intelligence api`

### Pack C: Future Web Capability Terms

- `web search api ai agents`
- `search api for ai agents`
- `search api for llms`
- `web scraping api ai agents`
- `crawl api ai agents`
- `web data api ai agents`

### Pack D: Future Audio Terms

- `speech to text api ai agents`
- `text to speech api ai agents`
- `voice api ai agents`
- `voice agents api`
- `music generation api`
- `ai music api`
- `text to music api`

## What This Means For Page Strategy

### Strengthen Now

- `/capabilities/image-generation`
- `/capabilities/video-generation`
- `/capabilities/image-understanding`
- `/capabilities/video-analysis`

### Do Not Build Yet

- `/capabilities/search`
- `/capabilities/crawl`
- `/capabilities/speech`
- `/capabilities/music`

原因不是這些能力不重要，而是：

- demand language 還沒完全驗證
- naming 還不夠收斂
- 頁面一旦建出來，會被迫對 query intent 做出承諾

## Final Judgment

這輪 capability keyword research 最重要的收穫，是把「頁名可用」和「市場語言可用」分開了。

現在最合理的做法不是立刻新增很多 capability 頁，而是：

1. 先修正現有 `image-understanding`、`video-analysis` 的 keyword fit
2. 再補強 `image-generation`、`video-generation` 的 `API / text-to-*` 語言
3. 對 `search / crawl / speech / music` 先做 seed validation，不急著擴頁

如果只濃縮成一句話，這輪的心得是：

- **AnyCap 的 capability 頁目前更需要「對齊市場語言」，而不是「增加能力數量」。**
