# AnyCap for Chrome

> **图片 · 视频 · 音乐 · 搜索 · 爬取，全部在浏览器里完成。**
> 在网页上右键任意元素，AnyCap 在右侧栏立刻接住你。

![AnyCap Chrome 侧栏首图](docs/assets/hero-side-panel.png)

AnyCap 是一个 **AI 能力运行时（capability runtime）**。Chrome 扩展是三个客户端中的
一个（CLI · Desktop · **Chrome**），三者共用同一个 `anycap-server`。Agent 能做的事，
你也能做，无需离开当前页面。

| 能力 | 它做什么 |
|---|---|
| **Vary** | 右键任意图片 → 生成同款变体 |
| **Image** | 文生图，可选模型与画幅比例 |
| **Video** | 文生视频，侧栏内 `<video>` 直接预览 |
| **Music** | 文生音乐，侧栏内 `<audio>` 直接试听 |
| **Search** | 网页搜索，返回带引用源的卡片 |
| **Crawl** | 抓取页面 → 标题 + 摘要 + 干净的 Markdown |

---

## 安装

> **一句话总结 — 从 [Releases](https://gitlab.knoffice.tech/engineering/anycap_chrome/-/releases) 下载最新 `.zip`，解压，加载已解压的扩展程序。**

### 方式 A — 使用预打包 zip（推荐给体验者）

1. 从 <https://gitlab.knoffice.tech/engineering/anycap_chrome/-/releases> 下载
   `anycap-extension-<version>-chrome.zip`。
2. 解压到任意目录，例如 `~/Downloads/anycap-extension`。
3. 浏览器打开 `chrome://extensions`，右上角开启 **开发者模式**。
4. 点击 **加载已解压的扩展程序**，选择刚才解压出来的目录。
5. 点击 AnyCap 工具栏图标 — 侧栏即弹出。或者直接在网页上右键任意图片。

预打包 zip 默认带 `WXT_MOCK=true`，**无需任何后端**就能演示全部能力 — image / video /
music / search / crawl 都会返回带真实延迟感的样本数据。等生产服务上线后，可切到下面的
**方式 B**。

### 方式 B — 从源码构建

```bash
git clone https://gitlab.knoffice.tech/engineering/anycap_chrome.git
cd anycap_chrome
pnpm install

# 三选一：
pnpm demo           # WXT_MOCK=true — 离线演示构建，无需后端
pnpm build          # 真后端模式（需要可达的 anycap-server）
pnpm release        # WXT_RELEASE=true — 剥离 localhost host_permissions，输出 CWS-ready zip
```

构建产物落在 `.output/chrome-mv3/`，加载方式同方式 A。

---

## 工作原理

### 在网页上右键 → 侧栏直接接管

![右键 → 侧栏数据流](docs/assets/right-click-flow.png)

每种右键场景都会落到对应的 tab，并且表单已经预填好：

| 右键的目标 | 菜单项 | 落到哪个 tab |
|---|---|---|
| 图片 | ✨ Generate variation with AnyCap | **Vary** |
| 选中文字 | 🎨 Generate image from this text | **Image** |
| 选中文字 | 🎬 Generate video from this text | **Video** |
| 选中文字 | 🎵 Generate music from this text | **Music** |
| 选中文字 | 🔍 Search with AnyCap | **Search** |
| 页面空白处 | 📄 Crawl this page with AnyCap | **Crawl** |
| 链接 | 📄 Crawl link with AnyCap | **Crawl** |

底层实现：`entrypoints/background.ts` 把一个 tagged-union 的 `pendingRequest` 写入
`chrome.storage.session`，然后调用 `chrome.sidePanel.open({ windowId })`。侧栏监听
`chrome.storage.onChanged`，根据 `kind` 字段切换到对应 tab，再把表单预填好。

### 一套后端，三种皮肤

![AnyCap 产品矩阵架构](docs/assets/architecture.png)

这个扩展 **不是** CLI 的封装。它直接打的是给 CLI 和桌面端供电的同一个 Go HTTP API —
认证、限流、模型路由、计费全在 server 一处。新增一个能力，只要加在 server 上，三个
客户端立刻全部点亮；客户端侧只需要一个 30 行的 tab 组件。

---

## 项目结构

```
entrypoints/
  background.ts            # MV3 service worker — 右键菜单、侧栏路由
  content.ts               # 捕获最近一次悬停的图片，pagehide 时清空
  sidepanel/
    App.tsx                # 7-tab 外壳（Vary / Image / Video / Music / Search / Crawl / Settings）
    tabs/                  # 每个能力一个文件，互相隔离
    components/            # AnycapMark / Spinner / ErrorBox / HistorySection / TemplateChips
    main.tsx, index.html, style.css
src/lib/
  api.ts                   # 打 anycap-server 的 HTTP 客户端（带 X-Anycap-Source: chrome-extension）
  api-mock.ts              # WXT_MOCK=true 时拦截每次调用 — picsum + 样本 MP4/OGG + 假搜索/抓取
  store.ts                 # Zustand 状态，tagged-union 的 PendingRequest
  history.ts               # 每能力 30 条历史，按 kind 过滤
  settings.ts              # 个人资料 / 默认模型 / 隐私偏好
  templates.ts             # 19 条 prompt 模板
  storage.ts, constants.ts, auth.ts, errors.ts
public/icons/              # 16 / 48 / 128
store-assets/
  composer/*.html          # CWS 截图的静态 HTML 编排器（1280×800 / 1400×560 / 440×280）
  cws/*.png                # 渲染好的 CWS 提审素材
tests/
  unit/                    # Vitest — 78 个用例
  e2e/                     # Playwright — 7 prod + 8 demo + 12 截图
wxt.config.ts              # Manifest，host_permissions（release 模式剥离 localhost）
docs/assets/               # README 用的图示
```

## 开发

```bash
pnpm dev                # WXT 开发服务，热重载
pnpm test               # Vitest 单元测试
pnpm e2e                # Playwright（生产模式构建）
pnpm e2e:demo           # Playwright（mock 模式）— 不需要后端
pnpm release            # WXT_RELEASE=true wxt build && wxt zip → CWS-ready
```

### 构建标志

| 环境变量 | 作用 |
|---|---|
| `WXT_MOCK=true` | 把 `api.ts` 的每次调用替换成确定性的 mock（picsum / archive.org / W3C OGG / 假搜索/抓取）。完全不联网。 |
| `WXT_RELEASE=true` | 剥离 `localhost` 与 `127.0.0.1` 的 host_permissions，把生产 `DefaultEndpoint` 烧进去，并通过 `wxt zip` 输出 CWS-ready 包。 |
| `WXT_API_BASE=...` | 在构建时覆盖 server 端点（dev 默认 `http://127.0.0.1:8080`，release 默认 `https://api.anycap.ai`）。 |

### 测试要点

- E2E 用 Playwright `launchPersistentContext` — **MV3 扩展只能跑 headed 模式**，Chromium 的 headless 不支持。
- Mock 模式 E2E（`pnpm e2e:demo`）不需要后端 — CI、快速冒烟、对外演示都很合适。
- `tests/e2e/cws-shots.spec.ts` 会从 `store-assets/composer/*.html` 重新渲染全部 6 张 CWS 营销图。

## 权限审计

```
contextMenus    — 7 个右键菜单项
activeTab       — 用户触发"抓取当前页"时读 pageUrl
storage         — chrome.storage.session（跨上下文路由）+ .local（历史、缓存）
downloads       — 生成结果上的"保存到下载"动作
sidePanel       — 从 background 主动打开侧栏
optional: identity   — 仅在 OAuth 登录启用时使用（v0.2.0 暂时隐藏 UI）
```

生产 host permissions：仅 `https://api.anycap.ai/*`、`https://anycap.ai/*`。
Localhost / `127.0.0.1` 只在 dev/demo 构建里加回来（`WXT_RELEASE` 未设置时）。

## 历次发布

| 版本 | 日期 | 主要变化 |
|---|---|---|
| **v0.2.0** | 2026-04-27 | 首个侧栏版本。6 个能力、7 个右键菜单、19 条模板、mock 模式、CWS 提审素材。 |
| v0.1.0 | 2026-04-22 | 仅弹窗的图片变体 MVP。 |

完整变更日志：[`CHANGELOG.md`](./CHANGELOG.md)。
预打包 zip 与签名后的发布说明：[Releases](https://gitlab.knoffice.tech/engineering/anycap_chrome/-/releases)。

## 文档索引

| 文件 | 用途 |
|---|---|
| [`CHANGELOG.md`](./CHANGELOG.md) | 各版本变更 |
| [`DEMO.md`](./DEMO.md) | 5 分钟演示脚本 + 截图 |
| [`LOAD_AND_USE.md`](./LOAD_AND_USE.md) | 首次安装指引与故障排查 |
| [`LAUNCH_CHECKLIST.md`](./LAUNCH_CHECKLIST.md) | 提交 Chrome 商店前还差什么 |
| [`docs/NEXT-STEPS.md`](./docs/NEXT-STEPS.md) | 让插件真正可用的工程路线图（A / B / C 三档） |
| [`store-assets/description.md`](./store-assets/description.md) | CWS-ready 的短/长描述、权限说明 |
| [`store-assets/cws/README.md`](./store-assets/cws/README.md) | 营销素材与 CWS 提审表单的对应表（1280×800 × 4 + marquee + tile） |

## 许可

Internal — Knoffice / AnyCap。归仓库所有者所有。
