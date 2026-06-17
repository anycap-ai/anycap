---
node_id: SEO-20260617-1623
date: 2026-06-17
type: analyze
status: done
scope: main-site-only (excludes /page/ hosted CMS)
source:
  - GSC Performance export "anycap.ai-Performance-on-Search-2026-06-17" (Last 7 days, 2026-06-09..06-15, Web)
  - Live production checks (curl, Googlebot UA)
  - Code/git inspection (origin/main vs feat_seo)
related:
  - analyze/2026-06-09-gsc-main-site-audit.md
  - change-log/2026-06-09-main-site-hosted-page-linkage.md
---

# [SEO-20260617-1623] Main-Site GSC + Live-Test Cross-Validation

/ 性能数据窗口正好落在 06-09 那批主站修复"声称完成"之后, 用 live test
交叉验证哪些修复实际生效, 哪些尚未修复 / 未部署.

## TL;DR

1. **06-09 那批主站修复 (glossary 308 重定向 / canonical 回退 / site.ts EN 回退 /
   llms.txt slug) 只在 `feat_seo` 分支, 未合并进 `origin/main` → 未部署到生产.**
   git + live 双重确认.
2. **未翻译却被标为可索引的本地化 hub / 首页 (`/de`, `/pt-br`, `/id`,
   `/{locale}/glossary|compare|models|for`) 渲染英文内容, 仍 `index,follow` +
   self-canonical, 并被 sitemap 主动收录** → 与 EN 版构成同语言重复, Google 折叠选
   EN canonical. 这是 06-09 审计 #1 (28 个 DUPLICATE_GOOGLE_CHOSE_DIFFERENT_CANONICAL)
   中**两个分支都没修**的部分 (06-09 的回退只处理"不可索引"路径, 这些 hub 被标为
   "可索引"所以漏掉).
3. GSC 侧交叉印证: 德国 (1050 曝光 / 0.86% CTR) 与巴西 (1188 曝光 / 0.51% CTR)
   高曝光低点击低位次, 正是这些英文重复 hub 所在 locale.

主站健康分估计 ≈ **65/100** (与 06-09 的 64 基本持平, 因为关键问题未落地).

## GSC Topline (主站 + /page/ 合计, 仅作背景)

| 指标 | 值 |
|---|---|
| Clicks (7d) | 122 |
| Impressions (7d) | 11,270 |
| 平均 CTR | ~1.08% |
| 平均位次 | 12.3, 一周内 11.4 → 14.3 (走弱) |
| Desktop / Mobile / Tablet | 101 / 21 / 0 clicks |

国家层面 (交叉验证 locale 表现):

| 国家 | Impr | Clicks | CTR | Pos | 解读 |
|---|---|---|---|---|---|
| 美国 | 3941 | 19 | 0.48% | 16 | 弱 (多为 /page/ 长尾) |
| 德国 | 1050 | 9 | 0.86% | 10.3 | **高曝光低点击 → de hub 英文重复** |
| 巴西 | 1188 | 6 | 0.51% | 9.6 | **高曝光低点击 → pt-br hub 英文重复** |
| 韩国 | 296 | 14 | 4.73% | 7.4 | 好 (/page/ ko-KR) |
| 中国 | 266 | 14 | 5.26% | 7.4 | 好 (/page/ zh-CN) |
| 日本 | 377 | 12 | 3.18% | 8.8 | 好 (/page/ ja-JP) |

表现好的 locale 主要由 /page/ 托管内容驱动 (本次范围外); **主站本地化 hub
(de/pt-br/id) 是高曝光低效区**.

## Finding 1 — 06-09 主站修复未部署 (Critical, 部署/流程问题)

### 证据 (git)
- `origin/main` 的 `legacyRouteRedirects` 只有 `/for-human`, `/capabilities/image-read`,
  **没有 `/glossary/agent-capability-runtime`**.
- glossary 308 + canonical 回退 + site.ts EN 回退 + llms.txt slug 修复在提交
  `7fe1161 (2026-06-10 "seo page")`, 位于 `feat_seo`, `feat_seo` 有 **15 个提交未进 main**.

### 证据 (live, Googlebot UA)
- `GET /glossary/agent-capability-runtime` → **200**, 且渲染**首页 title**
  `AnyCap | AI Agent Capabilities Through One CLI` (cf-cache-status: DYNAMIC, 非缓存).
  既无 308→`/glossary/agent-harness`, 又是首页内容的 soft-404/重复.
  对照: `/capabilities/image-read`, `/for-human` 都正常 307 重定向 (旧 entry 已部署).
- 所有重定向是 **307 (临时)** 而非代码意图的 **308 (永久)**:
  `/en/models→/models`, `/en/pricing→/pricing`, `/en→/`, `/for-human→/` 全是 307.
  → 永久合并 (legacy slug / 默认 locale 去前缀) 应用 308 才能传递权重并让 Google
  替换旧 URL; 当前 307 让 Google 保留旧 URL.

### 影响
- 死 slug `agent-capability-runtime` 仍 200 且 = 首页重复, llms.txt 仍指旧 slug
  (feat_seo 已改但未部署).
- 06-09 声称的 canonical 回退 (非索引本地化页 canonical 指向 EN) 未生效:
  live 上 `/pt-br/compare/anycap-vs-openclaw-image-generation` = `noindex,nofollow`
  + **self-canonical** (而非指向 EN). noindex 能挡住收录, 但与"canonical 指向 EN"
  的预期不符, 证明生产跑的是旧逻辑.

## Finding 2 — 未翻译 hub/首页被标为可索引 → 同语言重复 (High, 代码/配置, 两分支都没修)

### 根因
`web/src/lib/seo-locale-rollout.ts` 把 `home / for / glossary / compare / models /
capabilities / about / cli / agent / skills / learn / guides / pricing ...` 全部标为
对 `["en","pt-br","id","de"]` 可索引 (前提是有真实翻译). 但翻译覆盖**不一致**:
叶子页有译文, 多数 hub / 首页没有.

### Live 验证 (德语样本)

| URL | 内容语言 | robots | canonical | 判定 |
|---|---|---|---|---|
| `/de` (首页) | ❌ 英文 | index,follow | self (`/de`) | **重复** |
| `/de/glossary` | ❌ 英文 | index,follow | self | **重复** |
| `/de/compare` | ❌ 英文 | index,follow | self | **重复** |
| `/de/models` | ⚠️ 混合 (title 英 / h1 德) | index,follow | self | 部分重复 |
| `/de/for` | ❌ 英文 | index,follow | self | **重复** |
| `/de/for/cursor` | ✅ 德语 | index,follow | self | 正常 |
| `/de/capabilities/video-generation` | ✅ 德语 | index,follow | self | 正常 |
| `/de/about` | ✅ 德语 | index,follow | self | 正常 |
| `/pt-br`, `/id` 首页 | ❌ 英文 | index,follow | self | **重复** |
| `/pt-br/compare` | ✅ 葡语 | index,follow | self | 正常 (locale 间覆盖不一致) |

### sitemap 主动喂重复
`/sitemap.xml` = index → 子 `sitemap/{en,pt-br,id,de}.xml`. 子 sitemap **完整列出**
`/de`, `/de/glossary`, `/de/compare`, `/de/models`, `/de/for`, `/pt-br`, `/id` 等
全部 hub URL 为可索引, 包括那些渲染英文的. → 主动把同语言重复送进 Google.

### hreflang
集群互惠正确 (en/pt-BR/id/de/x-default 双向). 但**相同语言 (全英文) 的内容,
hreflang 无法阻止去重**; Google 仍按 06-09 issues CSV 折叠并选 EN canonical.
所以这些 locale hub 的本地化 SEO 投入目前**零回报**, 且浪费抓取预算.

### 影响 (与 GSC 印证)
de / pt-br 高曝光低 CTR 低位次 = 这些英文重复 hub 进了索引候选却拿不到点击/排名.

## Finding 3 — 主站可点击性 / On-Page (Medium)

GSC "曝光高/点击为 0 或位次高但 CTR 低" 的主站页 (排除 /page/):

| 页面 | Impr | Clicks | CTR | Pos | 问题 |
|---|---|---|---|---|---|
| `/for/cursor` | 926 | 8 | 0.86% | 6.84 | 位次好, CTR 远低于该位平均 (~5-8%). title 未直接回答 "can cursor generate video/images" 类问句 |
| `/for/codex` | 233 | 0 | 0% | 7.29 | 同上, title 品牌前置 |
| `/capabilities/video-generation` | 313 | 0 | 0% | 18.1 | 位次偏低, 需内容/内链强化 |
| `/capabilities/image-generation` | 198 | 0 | 0% | 9.65 | 第一页边缘, 0 点击 |
| `/skills` | 72 | 0 | 0% | 4.15 | **位次很好却 0 点击**, title/desc 吸引力不足 |
| `/agent` | 67 | 0 | 0% | 5.31 | h1 仅 "AnyCap", 弱 |
| `/compare/fal-ai-vs-replicate` | 119 | 0 | 0% | 7.03 | title 72 字符易截断 |

note: `/for/cursor` title=50字符尚可, 但查询是问句 ("can cursor generate videos"
pos 4.67, "cursor image generation" pos 6.43). 用"是/否+能力"句式开头更易拿点击.

## Finding 4 — `/learn/smart-goal-generator` noindex 但仍有曝光 (验证意图)

Live: `robots = noindex,nofollow`, hreflang 0. GSC: 92 曝光 @ pos 7.97 (0 点击).
noindex 页仍有曝光 = 近期才 noindex, 正在退出索引. **若非有意废弃, 等于丢掉一个
首页排名资产**. 需确认是否有意.

## 健康分 (主站, seo-audit 权重)

| 类别 | 权重 | 分 | 说明 |
|---|---|---|---|
| Technical SEO | 25% | 62 | robots/sitemap/hreflang 结构好; 但重复簇 + glossary soft-404 + 307≠308 + 修复未部署 |
| Content Quality | 25% | 60 | 叶子页好且已翻译; hub/首页本地化为英文重复; 有 ranking 页被 noindex |
| On-Page SEO | 20% | 68 | title/meta 多数达标; 若干 CTR 弱 / h1 弱 / title 过长 |
| Schema | 10% | 72 | 06-09 评估稳健, 本轮未深测 |
| Performance | 10% | 70 | Edge SSR, 未实测 CWV |
| Images | 5% | 75 | 未实测 |
| AI readiness | 5% | 58 | llms.txt slug 修复未部署 |

**加权 ≈ 65 / 100**

## 行动计划 (优先级)

### Critical (本周, 部署相关)
1. 合并 `feat_seo` 的主站 SEO 修复进 `main` 并部署 (glossary 308 / canonical 回退 /
   site.ts EN 回退 / llms.txt slug). 部署后用本文 live 命令复测.
2. 复测重定向状态码: 期望 308. 若适配层 (OpenNext/CF) 把 308 降级为 307, 评估是否
   接受 (永久合并最好是 308).

### High (1-2 周, 代码/配置)
3. 处理"未翻译却可索引"的本地化 hub. 二选一 (可按页面分别决定):
   - (a) 补真实译文 (home / for / glossary / compare / models hub for de/pt-br/id), 或
   - (b) 把未翻译 hub 从 `seo-locale-rollout.ts` 的 locale 列表移除 → 自动 noindex +
     (合并 feat_seo 后) canonical 指向 EN, 并从 locale 子 sitemap 中排除.
   建议先对覆盖最差的 `de` 与各 locale 首页执行 (b), 有译文再切回 (a).
4. sitemap 与 rollout / 实际译文保持一致: 不再列出会渲染英文的 locale hub URL.

### Medium (本月)
5. 主站 CTR 优化: 重写 `/for/cursor`, `/for/codex`, `/skills`, `/agent`,
   `/capabilities/image-generation`, `/capabilities/video-generation` 的 title/description,
   用问句答案式 / 能力前置, `/agent` 补描述性 h1; 压缩过长 compare title (<60 字符).
6. 确认 `/learn/smart-goal-generator` 的 noindex 是否有意; 非有意则恢复索引.
7. 部署后对修复 URL 提交 IndexNow / GSC 重新索引.

### Low / backlog
8. 监控 de/pt-br 在 hub 去重后曝光是否转化为 EN 主站的点击.
9. 位次一周走弱 (11.4→14.3) 持续观察, 区分噪声与趋势.

## 复测命令 (部署后回归)

```bash
# 1. glossary 死 slug 应 308 → /glossary/agent-harness
curl -sSI -A Googlebot https://anycap.ai/glossary/agent-capability-runtime | grep -iE '^(HTTP|location)'
# 2. 非索引本地化页 canonical 应指向 EN
curl -sS  -A Googlebot https://anycap.ai/pt-br/compare/anycap-vs-openclaw-image-generation | grep -oiE '<link rel="canonical"[^>]*>'
# 3. 未翻译 hub 期望 noindex 或已有译文
curl -sS  -A Googlebot https://anycap.ai/de/glossary | grep -oiE '<meta name="robots"[^>]*>'
```
