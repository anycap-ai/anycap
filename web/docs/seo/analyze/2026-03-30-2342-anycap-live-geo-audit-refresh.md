# [SEO-20260330-2342] anycap.ai live GEO audit refresh

- Time: `2026-03-30 23:42 CST`
- Node: `SEO-20260330-2342`
- Type: `analyze`
- Status: `done`
- Scope: `anycap.ai`, `web/src/app/`, `web/src/lib/`, `web/public/llms.txt`, `robots.txt`, `sitemap.xml`, live production crawl`
- Related:
  - [`../index.md`](../index.md)
  - [`2026-03-26-1139-anycap-ai-geo-readiness-baseline.md`](2026-03-26-1139-anycap-ai-geo-readiness-baseline.md)
  - [`2026-03-26-1141-anycap-geo-positioning-for-agent-brand.md`](2026-03-26-1141-anycap-geo-positioning-for-agent-brand.md)
  - [`2026-03-30-1545-narrative-ia-audit-and-nav-keyword-mapping.md`](2026-03-30-1545-narrative-ia-audit-and-nav-keyword-mapping.md)
  - [`../todo/2026-03-30-1038-ability-cluster-follow-ups.md`](../todo/2026-03-30-1038-ability-cluster-follow-ups.md)

## Why This Memo Exists

03-26 的 GEO baseline 當時抓到的核心問題是：

1. `llms.txt` 缺失
2. sitemap live endpoint 有問題
3. AI citation block 不夠
4. entity signal 很弱

這一輪不是重做策略，而是回答更窄、更實務的問題：

1. 現在 production live 狀態到底改善到哪裡了
2. 目前最大的 GEO 阻塞點還是不是 technical accessibility
3. 哪幾個修正是下一輪最該優先做的

這篇屬於 `analyze`，因為本輪只做 live crawl、程式碼核對與判斷整理，沒有實際改 code、metadata、robots、schema 或 `llms.txt`。

## Method

本輪依據兩種訊號做交叉比對：

1. live production 檢查
   - `https://anycap.ai/en`
   - `https://anycap.ai/en/start`
   - `https://anycap.ai/en/for/codex`
   - `https://anycap.ai/en/guides/context-engineering-for-agents`
   - `https://anycap.ai/en/learn/what-agents-cant-do`
   - `https://anycap.ai/en/capabilities/image-read`
   - `https://anycap.ai/en/capabilities/image-understanding`
   - `https://anycap.ai/robots.txt`
   - `https://anycap.ai/llms.txt`
   - `https://anycap.ai/sitemap.xml`

2. local source review
   - `web/src/app/layout.tsx`
   - `web/src/app/robots.ts`
   - `web/src/app/sitemap.ts`
   - `web/src/lib/seo-metadata.ts`
   - `web/src/lib/schema.ts`
   - `web/src/lib/site.ts`
   - `web/src/lib/sitemap-routes.ts`
   - representative SEO page files under `web/src/app/(seo)`

DataForSEO / direct LLM search telemetry 在這個環境不可用，所以 platform score 是依據 crawlability、entity signal、schema、citability 與內容一致性做推論，不是假裝成真實排名資料。

## GEO Readiness Score

### Overall Score: `58/100`

| Dimension | Weight | Score | Weighted Result | Assessment |
| --- | --- | --- | --- | --- |
| Citability | 25 | `13/25` | `13` | 敘事清楚，但多數核心 opening block 只有約 43-57 詞，缺少 134-167 詞 answer block 與來源支撐 |
| Structural Readability | 20 | `16/20` | `16` | heading hierarchy、FAQ、table、internal links 都比 03-26 時更強 |
| Multi-Modal Content | 15 | `4/15` | `4` | 主要仍是文字、code block、card，缺少 demo screenshot、diagram、video、original chart |
| Authority & Brand Signals | 20 | `8/20` | `8` | GitHub signal 存在，但作者、日期、來源引用、外部 entity graph 仍弱 |
| Technical Accessibility | 20 | `17/20` | `17` | SSR HTML、robots、sitemap、llms.txt 都 live，主頁面可直接被 crawler 讀取 |

### Interpretation

和 03-26 相比，AnyCap 最大的 GEO 問題已經不再是「抓不到」。現在的主戰場變成：

1. 內容可不可以被穩定引用
2. 站內訊息是不是一致
3. 外部實體訊號能不能把 `AnyCap` 跟 `anycap.ai` 綁得更緊

## Platform Breakdown

| Platform | Score | Why |
| --- | --- | --- |
| Google AI Overviews | `63/100` | sitemap、route intent、SSR、頁面結構都不差；主要被薄 answer block、弱 authority、claim inconsistency 拖住 |
| ChatGPT web search | `55/100` | `llms.txt` 已是加分項，SSR 與 page intent 清楚；但外部 entity signal 太弱，品牌歧義仍高 |
| Perplexity | `50/100` | 結構化內容可讀，但缺少 Reddit / YouTube / community mention 類平台訊號 |
| Bing / Copilot | `59/100` | 技術面基線不錯，但 product / software schema 覆蓋不足，entity reinforcement 仍弱 |

## AI Crawler Access Status

### Current Status: `good`

live 檢查結果：

- `https://anycap.ai/robots.txt` 回 `200`
- robots 內容為：
  - `User-Agent: *`
  - `Allow: /`
  - `Disallow: /dashboard`
- `Sitemap: https://anycap.ai/sitemap.xml`

另外以不同 crawler UA 直接測試：

- `GPTBot`: `200`
- `OAI-SearchBot`: `200`
- `ChatGPT-User`: `200`
- `ClaudeBot`: `200`
- `PerplexityBot`: `200`
- `Googlebot`: `200`

以 crawler-style UA 請求 `https://anycap.ai/en` 時，也能拿到可讀的 HTML 與 `<h1>`、`<title>`、`robots` metadata。

### Interpretation

- wildcard allow 現階段已足以讓主要 AI crawler 進站。
- technical accessibility 不再是這輪的最大 blocker。
- 但 crawler allow 目前是「隱式允許」，不是「顯式表態」。

### Recommendation

下一輪如果要補 technical polish，建議：

1. 在 `robots.txt` 額外顯式列出 `GPTBot`、`OAI-SearchBot`、`ChatGPT-User`、`ClaudeBot`、`PerplexityBot`
2. 觀察 Cloudflare bot management 是否對這些 UA 造成不穩定影響

## llms.txt Status

### Current Status: `live`

- `https://anycap.ai/llms.txt` 回 `200`
- `content-type: text/plain; charset=utf-8`

### What Improved Since 03-26

- `llms.txt` 已從缺失變成 live 資產
- 內容已經包含：
  - 品牌定義
  - canonical URLs
  - who it is for
  - capabilities
  - important resources
  - notes for AI systems

### Remaining Problems

1. canonical URLs 區段仍是 bare URLs，不夠像 AI-friendly route index
2. 存在 stale route：`/en/capabilities/image-read`
3. capability availability 的描述跟站上其他頁面沒有完全對齊
4. 缺少 freshness / editorial ownership 訊號

### Recommendation

下一輪應把 `llms.txt` 從「有」升級成「更像 machine-readable guidance」：

- 用 `- [Page title](url): one-sentence description`
- 明確拆出：
  - `Capabilities Available Now`
  - `Coming Soon`
  - `Best Entry Pages`
  - `Definitions`
- 移除 stale route

## Server-Side Rendering Check

### Result: `pass`

本輪 live fetch 顯示：

- 核心頁面在 raw HTML 裡就有主要內容
- `<title>`、`description`、`canonical`、JSON-LD 都存在
- 不是「空殼 + hydrate 後才出現 SEO 文案」

### Caveat

部分頁面仍可見 React / Next bailout marker，但主 SEO 內容本身仍然 server-rendered，對目前 GEO 不是實質阻塞。

## Passage-Level Citability

### Current Diagnosis

AnyCap 現在已經有不少「方向正確」的頁面，但最該被 AI 引用的段落普遍還太短。

本輪從 local source 抽到的 opening paragraph 大致落在：

- `/start`: 約 `43` 詞
- `/for/codex`: 約 `54` 詞
- `/guides/context-engineering-for-agents`: 約 `57` 詞
- `/learn/what-agents-cant-do`: 約 `51` 詞
- `/capabilities/image-understanding`: 約 `50` 詞
- `/cli`: 約 `48` 詞

### What This Means

這些段落本身不差，甚至已經比很多產品頁清楚，但還沒有達到最容易被 AI citation 抽取的形態：

- 自包含
- query-matching
- 134-167 詞
- 有明確現況與範圍邊界

### Best Immediate Rewrite Targets

1. `/en/start`
2. `/en/for/codex`
3. `/en/learn/what-agents-cant-do`
4. `/en/guides/context-engineering-for-agents`
5. `/en/capabilities/image-understanding`

### Recommended Rewrite Pattern

每頁頂部新增一個 answer block，直接回答該頁最核心 query，例如：

- `What is AnyCap and how do I get started?`
- `How do I add image, video, and vision capabilities to Codex?`
- `What is context engineering for agents?`
- `What can't AI agents do out of the box?`
- `What is image understanding for AI agents?`

## Content Consistency Risks

### This Is The Biggest Current GEO Problem

現在最傷 AnyCap GEO 的，不是 technical crawl，而是 product claim inconsistency。

### Observed Inconsistency

不同 surface 對「現在有哪些 capability」說法不完全一致：

1. sitewide metadata / social copy：
   - image
   - video
   - music
   - speech
   - search
   - crawl

2. `llms.txt`：
   - 某些 capability 為 early access
   - 某些 capability 為 coming soon

3. live `/en` page：
   - public landing page 目前只明確 document `image understanding` 與 `video analysis`
   - broader multimodal / web capabilities 應與已 document 現況分開看

### GEO Interpretation

AI system 比起華麗文案，更怕「同一站對同一事實講法不一樣」。

只要 metadata、首頁文案、`llms.txt`、capability hub 沒有對齊：

- citation 會更保守
- 回答會更模糊
- 產品現況更容易被誤解成「全都 live」

## Route / Canonical Hygiene

### Observed Problem

目前 production 同時存在：

- `/en/capabilities/image-read`
- `/en/capabilities/image-understanding`

兩頁都 live，兩頁都各自有 canonical，而且 `llms.txt` / sitemap /頁面敘事對這兩者的定位沒有完全統一。

### Why It Matters

對人類來說這只是 naming 過渡；對 AI search 來說這會造成：

- citation fragmentation
- term confusion
- two-page authority split

### Recommendation

下一輪要做明確決策：

1. 如果 market language 要用 `image-understanding`
   - 讓它成為唯一主 canonical
   - `/image-read` 改 redirect 或 noindex alias
2. `llms.txt`、sitemap、內鏈、schema 一起收斂

## Structured Data Audit

### What Is Good

- root `Organization` schema live
- root `WebSite` schema live
- 多個 SEO 頁已有 `TechArticle`、`FAQPage`、`BreadcrumbList`
- `/cli` 已有 `SoftwareApplication`

### What Is Still Incomplete

目前 `web/src/app/(seo)` 下共有 `32` 個 `page.tsx`，其中只有 `16` 個頁面有 `TechArticle` 或 `SoftwareApplication` 類 schema generation。

仍缺 schema 覆蓋的重要頁面包括：

- `about`
- `capabilities/image-read`
- `capabilities/video-analysis`
- `capabilities/video-generation`
- `compare/anycap-vs-composio`
- `guides/context-engineering-for-agents`
- `guides/agent-skills-for-developer-tools`
- `guides/what-is-agent-harness`
- `guides/workspace-context-engineering`
- `models`
- `models/nano-banana-pro`
- `models/veo-3-1`
- `skills`
- glossary pages

### Missing Fields

即使已有 schema，仍普遍缺少：

- `datePublished`
- `dateModified`
- 作者實體或 editorial owner
- 更完整的 `sameAs`
- supporting source / proof surface

## Authority & Brand Signal Diagnosis

### Confirmed Strongest Signal

- GitHub 是目前最明確、最一致的外部 entity signal

### Weaknesses

本輪沒有看到明確強信號的：

- Wikipedia
- Wikidata
- LinkedIn
- YouTube
- Reddit

另外，live `Organization` schema 目前只放了單一 `sameAs`：

- GitHub

### Important Brand Risk: Name Ambiguity

`AnyCap` 這個 token 在外部世界仍有歧義。

本輪外部檢查至少看到兩種會干擾品牌辨識的結果：

1. academic paper / project 名稱也叫 `AnyCap`
2. electronics / regulator 領域有 `anyCAP` 相關產品名稱

### GEO Interpretation

這表示對 ChatGPT / Perplexity 類系統來說，`AnyCap` 還不是一個已經被強烈綁定到 `anycap.ai` 的實體。

所以 AnyCap 的 GEO 不只是在做 on-site SEO，而是在做「品牌 disambiguation」。

## Executive Summary

### What Improved

和 03-26 baseline 相比，已明確改善：

1. `llms.txt` 已 live
2. `sitemap.xml` 已 live
3. 主要頁面 SSR 與 crawler-access 基線穩定
4. `/start`、`/for/{agent}`、capability / guide page intent 已更明確

### Biggest Remaining Problems

1. capability availability 說法不一致
2. citation block 太短，還不夠 answer-first
3. schema coverage 只覆蓋了一半左右的 SEO 頁面
4. `image-read` vs `image-understanding` 造成路由與語義分裂
5. 外部 entity graph 太弱，品牌歧義仍高

## Highest-Impact Next Moves

### Priority 1

統一 capability availability 語言，讓 metadata、首頁、`llms.txt`、capability hub、agent pages 都對齊。

### Priority 2

把 5 個最高價值頁面的 opening paragraph 重寫成 134-167 詞 answer block。

### Priority 3

補齊 guide / capability / compare / glossary / model pages 的 article-like schema，並加上：

- `datePublished`
- `dateModified`
- author / editor ownership

### Priority 4

收斂 `image-read` / `image-understanding` 路由策略，避免 authority split。

### Priority 5

擴張 external entity signal，最現實的起點是：

1. LinkedIn
2. YouTube
3. 更完整 `sameAs`
4. 可被引用的第三方 mention

## Sources Used

### Live URLs

- `https://anycap.ai/en`
- `https://anycap.ai/en/start`
- `https://anycap.ai/en/for/codex`
- `https://anycap.ai/en/guides/context-engineering-for-agents`
- `https://anycap.ai/en/learn/what-agents-cant-do`
- `https://anycap.ai/en/capabilities/image-read`
- `https://anycap.ai/en/capabilities/image-understanding`
- `https://anycap.ai/robots.txt`
- `https://anycap.ai/llms.txt`
- `https://anycap.ai/sitemap.xml`

### Local Files

- `web/src/app/layout.tsx`
- `web/src/app/robots.ts`
- `web/src/app/sitemap.ts`
- `web/src/lib/seo-metadata.ts`
- `web/src/lib/schema.ts`
- `web/src/lib/site.ts`
- `web/src/lib/sitemap-routes.ts`
- representative pages under `web/src/app/(seo)`

### External Ambiguity References

- `https://arxiv.org/abs/2507.12841`
- `https://huggingface.co/papers/2507.12841`
- `https://www.farnell.com/datasheets/2146833.pdf`
