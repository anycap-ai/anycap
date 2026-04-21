# AnyCap Chrome Extension v0.1 — Design Spec

**Date:** 2026-04-21
**Status:** Draft — pending user review
**Author:** 仕豪 (via brainstorming skill)
**Scope:** 2-week Scout MVP of the AnyCap Chrome Extension

---

## 1. Context

AnyCap 目前通过 CLI + Skill File 面向 agent 分发。CLI 的用户天花板是"用 Claude Code/Cursor/Codex 的开发者"，触达不到"技术舒适的非开发者"和"纯非技术创作者"。

Chrome 扩展是 AnyCap 在所有非 CLI surface 里 **ROI 最高的一个**：工程成本中等、用户漏斗最上游、和现有能力（image/video/crawl/drive/page）自然耦合。

2025/12 起 SKILL.md 已成为行业标准（Anthropic 开源后被 OpenAI/Cursor/GitHub 采纳），AnyCap 的 "Skill + CLI" 叙事 commodity 化。Chrome 扩展是重新拿回面向人类终端用户的分发入口。

---

## 2. Goals / Non-Goals

### Goals
- **G1**：在 2 周内上架 Chrome Web Store，以单一动作（右键图片 → 生成变体）验证 wedge 假设。
- **G2**：打通 anycap.ai 账号与扩展的 OAuth 登录，复用现有 Auth0 / credit / Drive 系统。
- **G3**：建立可量化的 v0.2 扩展触发条件（D7 回访率 ≥ 25%）。
- **G4**：为未来 Wedge C（选中文字 → 配图）和 Wedge F（整页 → markdown）留好架构接口。

### Non-Goals
- **NG1**：不做选中文字 / 整页 clip / 侧栏 / 多种右键动作（全部归入 v0.2+）。
- **NG2**：不做 Firefox / Edge / Safari 专门适配（MV3 兼容即可）。
- **NG3**：不做 i18n（英文首发，中文等 v0.2 数据验证后再说）。
- **NG4**：不做参数调整 UI（模型 / aspect ratio / steps 全部走服务端默认）。
- **NG5**：不做本地缓存 / 离线模式 / 批量处理。

---

## 3. Key Decisions（Q1–Q6 锁定清单）

| # | 决策 | 锁定值 |
|---|---|---|
| Q1 | 目标用户 | 3 群通吃：技术舒适的非开发者 + Claude Code 用户 + 非技术创作者 |
| Q2 | Day-0 Wedge | 仅 Wedge A（右键图片 → 生成变体）；v0.1 一个默认动作 |
| Q3 | UI Surface | Toolbar Popup (320×480) |
| Q4 | Positioning | "Turn anything you see into new content." |
| Q5 | 认证 + 付费 | 匿名试用 3 次 → OAuth 登录；Free 50 credits/月 + 水印；API Key 次入口 |
| Q6 | 上线节奏 | α Scout — 2 周首发 v0.1，只做 Wedge A |

---

## 4. Scope

### 4.1 In-Scope（v0.1 必做）
- 右键任意 `<img>` 或 background-image → 菜单项 "Generate variation with AnyCap"
- Toolbar popup (320×480)：登录 / 试用计数 / 结果展示 / Drive 最近 3 张缩略 / 升级链接
- 匿名试用 3 次（本地计数 + 服务端二次限流）
- OAuth 登录（`chrome.identity.launchWebAuthFlow` → anycap.ai Auth0）
- API Key 次入口（popup 设置页粘贴）
- 登录后：50 credits/月免费额度，Pro 无水印
- 生成物自动存到 anycap drive（登录用户）
- 错误展示：offline / 配额耗尽 / 服务端 503 / 该页面受保护 / 图片加载失败 / CSP / OAuth 取消 / token 过期 / 超时（9 类）
- Chrome Web Store 上架 + 隐私政策 `anycap.ai/privacy/extension` + 1 分钟演示视频

### 4.2 Out-of-Scope（v0.2+ 再做）
- 选中文字 → 生成配图（Wedge C）
- Toolbar clip to markdown（Wedge F）
- 右键图片的其他动作（understand / upscale / meme / save-only）
- Side Panel UI
- 批量处理多张图
- 参数调整 UI
- Firefox / Edge 专门适配
- i18n
- 本地缓存 / 离线历史

### 4.3 边界和拒绝态
- 图片 < 256px 或 < 100KB：不显示菜单项
- CSP 严格站点：菜单可点，popup 提示 "This page doesn't allow extensions"
- 本地文件 (`file://`)：不支持，提示 "只支持网页图片"
- 非 JPG/PNG/WEBP：不显示菜单项

---

## 5. User Experience

### 5.1 首次用户旅程（Happy Path，目标 < 60 秒）

1. **发现**：Chrome Web Store 搜 "anycap" 或博主推荐 → 点 Install
2. **安装**：Chrome 弹权限确认（`contextMenus` + `activeTab` + `storage` + `identity`）→ 装好自动打开 `anycap.ai/welcome-extension`
3. **引导**：welcome 页 10 秒视频演示 "右键图片 → 变体"；不强制登录
4. **首次触发**：用户切换到别的网页 → 右键一张图 → 看到 "✨ Generate variation with AnyCap"
5. **生成**：点击 → toolbar popup 自动弹出 → 显示 "Generating... 8s" 进度
6. **看结果**：popup 里显示原图 + 生成结果（并排）→ Download / Try again / Save to Drive（灰掉，悬停提示"登录解锁"）
7. **第 4 次使用**：试用额度用完 → popup 显示 "Sign in for 50 free credits/month" → 点击走 OAuth → 完成即继续

### 5.2 Popup 状态

- `idle` — 初始，显示最近 Drive 缩略 + 登录状态
- `generating` — loading 动画 + 进度条 + "Generating variation..."
- `done` — 原图 vs 结果并排 + 下载/重试/保存按钮
- `error` — 具体错误文案 + 恢复建议
- `paywall` — "Sign in for 50 free credits" / "Upgrade to Pro"

---

## 6. Architecture

### 6.1 Chrome MV3 组件图

```
┌─────────────────────┐     ┌─────────────────────┐
│ background.ts       │     │ content.ts          │
│ (service worker)    │◄────┤ (content script)    │
│                     │ msg │                     │
│ • contextMenus 注册 │     │ • 每个普通页面注入   │
│ • 菜单点击 → popup  │     │ • 捕获右键图片 URL  │
│ • HTTP → anycap-srv │     │ • 过滤小图 (<256px) │
│ • auth + quota 管理 │     │ • < 100 行          │
└─────────────────────┘     └─────────────────────┘
           │                          ▲
           │                          │
           ▼                          │
┌─────────────────────┐     ┌─────────────────────┐
│ popup.tsx (React)   │     │ options.tsx         │
│                     │     │                     │
│ • 320×480 UI        │     │ • welcome 页        │
│ • 状态机 UI         │     │ • API Key 入口      │
│ • Zustand store     │     │ • 隐私链接          │
│ • Drive 缩略        │     │                     │
└─────────────────────┘     └─────────────────────┘
```

### 6.2 数据流：右键图片 → 看到结果（8 步，P90 < 15s）

1. **[user]** 右键 `<img>` 在网页上
2. **[content.ts]** 捕获图片 URL + 尺寸 → `chrome.runtime.sendMessage`
3. **[background.ts]** 检查 auth state + 试用计数
   - 未登录 + 已用 3 次 → popup 显示 Paywall → 停
   - 通过 → 打开 popup + 发 `chrome.action.openPopup()`
4. **[popup]** loading 态 → 调 `POST /v1/image/generate`
   - `mode: "image-to-image"`
   - `prompt: "create a stylistic variation"`（默认 prompt）
   - `images: [<原图 URL>]`
5. **[anycap-server]** 走现有 `UploadRefResolver` → NexusHub → 返回 result URL
6. **[popup]** 显示结果 + 并排对比 + Download 按钮
7. **[background.ts]** 试用计数 +1 或 credits 扣 1 + 记录最近生成
8. **[user]** 点 Download → 带水印 PNG 保存本地（Free）或无水印（Pro）

### 6.3 Tech Stack

| 层 | 选型 | 理由 |
|---|---|---|
| 构建框架 | WXT (Vite-based) | Plasmo 过重；WXT 冷启动 < 1s，HMR 好，TS 一等公民 |
| UI | React 19 + Tailwind 4 | 和 anycap.ai web 栈对齐，复用 token/color/组件 |
| 状态管理 | Zustand（popup 内） | popup < 500 行，Redux 过重，Context 不够 |
| 存储 | `chrome.storage.local` | 存 token / 试用计数 / 最近 10 张缩略图 URL |
| 认证 | `chrome.identity.launchWebAuthFlow` → Auth0 | 复用 anycap CLI 的 Auth0 tenant |
| API | 现有 `/v1/image/generate` | 零新增后端（见依赖列表） |
| 水印 | 服务端注入 | 扩展端不做；需新增 server 参数 `watermark=true` |
| 打包发布 | WXT → .zip → Chrome Web Store | GitLab CI 自动构建，Store 提交手动 |

### 6.4 依赖与新增后端工作

**复用（零改动）：**
- Auth0 tenant
- `/v1/image/generate`（如接受外部 URL）
- Drive API
- Credit 扣费系统
- Feature gate middleware

**需要验证（可能要改）：**
- ⚠️ `image-to-image` mode 是否接受外部 URL（非 `anycap://upload/` 引用）；若只接受 upload ref，则需要先走 `/v1/upload/presign` 上传外部 URL 的内容到 R2 再引用

**需要新增（v0.1 范围内）：**
- 🆕 Server 端 `watermark` 参数（Free/匿名强制 true）
- 🆕 匿名 rate limit：按 IP + `extension_install_id` 做 3-per-install 限流
- 🆕 `/v1/extension/config` endpoint：返回默认 prompt 和模型 ID（方便 server 侧调参不发扩展新版）

---

## 7. Auth State Machine

4 态：`Fresh` → `Trialing` → `PaywallBlocked` → `Authed`

```
┌─────────────────────┐
│ ① Fresh (首装)      │  trial_count=0, token=null
└──────────┬──────────┘
           │ 右键图片 → 生成
           ▼
┌─────────────────────┐
│ ② Trialing          │  trial_count=1..3, token=null
│   (匿名试用中)      │  watermark=ON, drive=disabled
└──┬──────────────┬───┘
   │ trial=3 用满  │ 用户在 popup 点 Sign In
   ▼              ▼
┌─────────────────────┐
│ ③ PaywallBlocked    │  trial_count=3, token=null
│   (拦截屏)          │  popup 只显示 "Sign in to continue"
└──┬──────────────────┘
   │ 点 Sign In → OAuth 成功
   ▼
┌─────────────────────┐
│ ④ Authed            │  token=xxx, credits=50
│   ├─ Free           │  watermark=ON, drive=enabled
│   └─ Pro            │  watermark=OFF, credits 从订阅/充值扣
└─────────────────────┘
```

**备注：**
- Authed Free 和 Pro 共用一个 state，仅 `watermark` 和配额来源不同
- 登出 → 回到 Fresh，但 `trial_count` 不重置（防薅羊毛前端层）
- 服务端按 IP + UA + `extension_install_id` 二次限流（真正防线）

---

## 8. Quota Logic

| 状态 | 额度 | 水印 | Drive | 扣费源 |
|---|---|---|---|---|
| ② Trialing | 3 次 / 扩展装机终身 | 强制 ON | ❌ | 服务端匿名池（按 IP + fingerprint 限频） |
| ④ Authed Free | 50 credits / 月（≈ 10–25 次） | 强制 ON | ✅ 5GB | 共享 anycap.ai Free 池 |
| ④ Authed Pro | 订阅档 / 充值余额 | OFF（默认；可选 ON） | ✅ 50GB+ | 现有 credit 扣费 |

---

## 9. Error Matrix

| 错误 | 触发条件 | UX 处理 | 重试 |
|---|---|---|---|
| Offline | `navigator.onLine === false` | Popup 显示 "You're offline" | 自动（恢复后） |
| Trial Exhausted | `trial_count ≥ 3`，未登录 | Paywall 页 "Sign in for 50 free credits/month" | 登录后 |
| Quota Exceeded | server 返回 402 | "Monthly limit reached · Upgrade to Pro" + 按钮跳 pricing | 升级后 |
| Server 503 | anycap-server / NexusHub 上游失败 | "AnyCap is having a bad day. Retry?" + 不扣额度 | 手动 |
| Image Fetch Fail | 原图 URL 403 / CORS / 404 | "Can't read this image · try another" + 具体原因 | 换图 |
| CSP Blocked | Gmail / 银行等站点拦截 | "This page doesn't allow extensions · open image in new tab and retry" | 新 tab |
| OAuth Cancel | 用户关掉 Auth0 窗口 | 静默返回 Trialing 态，不报错 | 再点 Sign In |
| Token Expired | server 返回 401 | 自动 refresh；失败则回 Fresh + 提示重新登录 | 自动或手动 |
| Timeout (>60s) | NexusHub 上游慢 | "Taking too long · check Drive later" + 不扣额度 | 手动 |

---

## 10. Privacy & Permissions

### 10.1 Manifest Permissions（最小化原则）
- `contextMenus`
- `activeTab`（**不要** `<all_urls>`，只在用户右键时临时提权）
- `storage`
- `identity`

### 10.2 数据收集
- **不收集**：页面 DOM / Cookie / URL bar / 用户浏览历史
- **只发送**：用户右键那张图的 URL
- **Telemetry**：仅计数事件（install / generate / download / login）；可在 options 关闭

### 10.3 Chrome Web Store 合规
- 独立隐私政策页 `anycap.ai/privacy/extension`
- 权限说明在 listing description 明确写出

---

## 11. Milestones

### 2 周日历

| Day | 任务 | Exit 标准 |
|---|---|---|
| D1 | WXT 脚手架 + manifest · contextMenus 注册 · content script 捕获图片 URL | 右键图片能 log 出 URL |
| D2 | Popup 骨架 · Zustand 状态 · 4 态 UI · 联调本地 mock | mock 数据能走通 UI |
| D3 | 对接 `/v1/image/generate`（如需 presign 就先走 upload/presign） | 端到端生成一张变体 |
| D4 | Auth0 OAuth flow · token 存 storage · trial 计数 | 登录 → credits 扣费成功 |
| D5 | Drive 集成 · Popup 底部最近 3 张缩略 · Paywall UI | Week 1 内部 demo 可用 |
| **D6–D7** | **周末：内部 dogfood 2 天，收 bug 清单** | — |
| D8 | 9 种错误态 UX 落地 · Retry/Timeout 逻辑 · 水印服务端参数打通 | 所有错误都有文案 |
| D9 | Options / Welcome 页 · 隐私页 · API Key 粘贴入口 | 首次安装走通 welcome |
| D10 | 视觉打磨：图标 · 动效 · Tailwind 品牌色 · dark mode 基础 | 产品截图可对外 |
| D11 | E2E 回归 · Store listing 素材（4 截图 + 1 分钟 demo 视频 + 描述文案） | 素材包 ready |
| D12 | 提交 Chrome Web Store · GitLab CI 配置 · 防薅羊毛服务端联调 | Store 提交 + 等审核 |
| **D13–D14** | **等审核（平均 3 天），同时准备 Product Hunt / 即刻 / 少数派 文案** | — |

### Definition of Done
- 右键任意 >256px JPG/PNG/WEBP → 10 秒内看到变体（P90 < 15s）
- 匿名试用 3 次 + OAuth 登录 + 50 credits/月 + Pro 去水印 全部走通
- 9 种错误态都有对应文案与恢复路径
- Chrome Web Store 过审（MV3 · 隐私页 · 权限说明）
- 3 个主要网站（Gmail / Twitter / 小红书 web）实测能用
- 内部 5 人 dogfood 2 天无 P0 bug

---

## 12. Testing Strategy

| 层 | 工具 | 覆盖重点 |
|---|---|---|
| 单元 | Vitest | Zustand reducer · 配额计算 · 状态转换 |
| 集成 | Vitest + MSW | API 调用 · OAuth flow · 错误分类 |
| E2E | Playwright (`loadExtension`) | 完整流程：install → 右键 → 生成 → 下载 · 覆盖 3 个真实站点 |
| 手动 QA | Checklist + 内部 dogfood | CSP 站点 / 弱网 / 深色模式 / Chrome 版本兼容 (118+) |

---

## 13. Success Metrics（上线后 2 周）

### North Star
**D7 回访率 ≥ 25%** — 安装 7 天后至少用过一次 = v0.2 做 Wedge C 的绿灯。
- < 10% → "右键图片变体" 不是真痛点，重新选 wedge

### 辅助指标
- 匿名 → Free 登录转化 ≥ **40%**（行业 15–25%）
- Free → Pro 转化 ≥ **2%** / 月
- Store 装机 2 周 ≥ **1000**（种子）
- P90 生成延迟 < **15 秒**
- Crash-free session ≥ **99%**

---

## 14. v0.2 Trigger Conditions

- D7 回访 ≥ 25% **且** 装机 ≥ 1000 → **上 Wedge C（选中文字 → 配图）**
- 用户反馈里 "wish it could X" 数据 → 决定 C 还是 F 先
- 任一未达标 → **不加 feature，先修**：改 onboarding / 换 wedge A 的默认 prompt / 改定价

---

## 15. Risks & Open Questions

### Risks
- **R1**：`image-to-image` 接受外部 URL 的支持度未知。若不支持，D3 会滑到 D4，压缩后续缓冲期。
  - *缓解*：D0（kick-off 当天）做 5 分钟验证；不支持则在 D1–D2 同步加 presign 中转层。
- **R2**：Chrome Web Store 审核周期不可控（平均 3 天，但可能拖到 7+ 天）。
  - *缓解*：D12 提交时附完整文档、隐私政策、权限说明，降低被打回率。
- **R3**：匿名 rate limit 的服务端实现时间可能超预期（需要持久化 fingerprint）。
  - *缓解*：D8 服务端联调当天 timebox 0.5 天；方案做不出就降级为仅前端计数 + 容忍一定程度薅羊毛。
- **R4**：同时期团队在做 anycap-desktop + anycap-agent TUI + server 架构重构，人手吃紧。
  - *缓解*：明确 Scout 节奏只需 1 人全职 + 0.3 人后端协同 ≈ 1.3 人月；如果凑不齐就延后启动，而不是并行启动半成品。

### Open Questions（需 kick-off 前解答）
1. `image-to-image` 是否接受 HTTP URL？（需验证 NexusHub 侧）
2. Free tier 50 credits/月是否和 anycap.ai web 的 Free 池共享？还是扩展独立池？
3. `extension_install_id` 的持久化方案：`chrome.storage.local` 够用还是要服务端侧 registry？
4. Chrome 最低支持版本：118（Side Panel 准备）还是 114（更广）？
5. Store 审核材料由谁出（设计师做 4 截图 + 1 demo 视频）？

---

## 16. Appendix

### 16.1 Positioning One-Liner
> **AnyCap for Chrome — Turn anything you see into new content.**
>
> Right-click any image on the web, get a stylistic variation in 10 seconds. Free to try, no signup.

### 16.2 Store Description Draft（等 D11 打磨）
```
Generate AI variations from any image on the web — right-click and go.

• One click: right-click any image → get a stylistic variation
• Works everywhere: Gmail, Twitter, Reddit, Pinterest, anywhere with images
• 3 free trials, no signup. 50 free generations/month after signing in.
• Everything saves to your AnyCap drive.
• Pro: no watermark, 1000+ generations/month.

AnyCap is the capability runtime for AI agents. This extension brings its
image generation to every browser tab.

More at anycap.ai
```

### 16.3 Brand Links
- Main site: https://anycap.ai
- Privacy: https://anycap.ai/privacy/extension
- Pricing: https://anycap.ai/pricing
- GitHub: https://github.com/anycap-ai/anycap
