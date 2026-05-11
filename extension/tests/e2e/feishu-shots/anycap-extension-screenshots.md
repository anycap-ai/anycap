# AnyCap 浏览器插件 · 产品截图与功能说明

> 文档生成时间: 2026-04-27 · 演示构建版本 (`pnpm demo`)
>
> 本插件的演示包(`extension/.output/chrome-mv3`,约 340 KB)已内置 mock 后端,
> 加载到 Chrome 后无需任何服务器即可完整跑通所有能力。

## 一句话产品定位

AnyCap 浏览器插件是 AnyCap **能力运行时**(capability runtime)的人面向表层 ——
把 image / video / music / search / crawl 5 类核心能力,
通过浏览器右键 + 侧边栏的方式直接送到任意网页旁,
让用户**在阅读网页的同时调用 AI 能力,而不是切到另一个标签页**。

后端与 AnyCap CLI / 桌面端共用同一套 Go server,
人按按钮和 agent 调 API 走的是同一条管道。

[IMG: architecture.png]

> 同一个 Go HTTP server,同一组 image / video / music / search / crawl 原语,
> 三个面向不同受众的表层。**插件不是脱离 agent 主线的产品,
> 是同一棵树长出的一根额外枝条**。

## 能力矩阵(7 个 Tab)

[IMG: capabilities.png]

> **本轮 v0.2 更新(2026-04-27)**:
> - 新增 **Settings tab**(第 7 个),含 Profile / Default models / Privacy / Maintenance 四个区块
> - 每个生成型 Tab 顶部新增 **Quick start 模板芯片**(Image / Video / Music / Search / Crawl 各 3-5 个一键预填)
> - 全面替换为 lucide-react 图标,标题区加 "capability runtime" 副标
> - Vary 空态从单一引导升级为 **hero 卡片 + 3 张快速跳转卡**
> - 整体加上品牌色径向渐变背景 + hover 提升交互


| Tab | 类别 | 入口能力 | Mock 后端模拟 |
|---|---|---|---|
| **Vary** | image-to-image | 对右键选中的图片做风格/构图变体 | `generateVariationMock` ~2.5s |
| **Image** | text-to-image | 自由文本生成图片(模型 + 比例) | `generateImageMock` ~2.2s |
| **Video** | text-to-video | 文生视频(模型 + 时长) | `generateVideoMock` ~5s |
| **Music** | text-to-music | 文生音乐(模型 + 时长) | `generateMusicMock` ~3s |
| **Search** | web-search | 网页搜索 | `searchWebMock` ~0.7s |
| **Crawl** | page-extract | 页面抓取 → 摘要 + Markdown | `crawlPageMock` ~1.5s |

## 7 个右键菜单 → 自动跳到对应 Tab

| 右键对象 | 菜单条目 | 跳转 Tab | 自动预填 |
|---|---|---|---|
| 图片(≥256 px) | ✨ Generate variation with AnyCap | **Vary** | 源图 |
| 选中文字 | 🎨 Generate image from this text | **Image** | prompt = 选中文字 |
| 选中文字 | 🎬 Generate video from this text | **Video** | prompt = 选中文字 |
| 选中文字 | 🎵 Generate music from this text | **Music** | prompt = 选中文字 |
| 选中文字 | 🔍 Search with AnyCap | **Search** | 查询 = 选中文字 |
| 页面空白处 | 📄 Crawl this page with AnyCap | **Crawl** | URL = 当前页 |
| 链接 | 📄 Crawl link with AnyCap | **Crawl** | URL = 链接目标 |

每个菜单都通过 `chrome.storage.session.pendingRequest` 写入一个 tagged union,
侧栏挂载或被监听到变化时自动切到正确 Tab 并预填表单。

> **v0.3 新增**:选中文字现在有 4 个生成型菜单(Image / Video / Music / Search),
> 用户高亮一段描述文本即可一键生成对应媒体或搜索。

---

## 端到端用户流(整体动线)

[IMG: user-flow.png]

四个关键节点串起来就是用户旅程:
1. **right-click** —— 网页任意元素右键,5 个 AnyCap 菜单按上下文自动浮现
2. **side panel opens** —— Chrome 右侧划出 400 px 宽的侧栏(Chrome 116+ 自动弹出),
   预填好的 Tab 已就位
3. **API call** —— 用户按 Generate,后端走匿名限流路径
   (插件路径上多送一个 `X-Anycap-Source: chrome-extension` 头)
4. **result** —— 同一个面板内原位渲染图/视频/音频/搜索结果/Markdown,Open · New · Download 三动作就绪

---

## 截图集

### ① 冷启动 · 空 Vary 状态

工具栏点击 AnyCap 图标 → Chrome 右侧划出 400px 宽的侧边栏。
Vary Tab 是默认落地页,初次进入引导用户去网页右键图片。

[IMG: 00-cold-vary-empty.png]

要点:
- 顶部品牌区(Logo + 试用次数提示「3 free tries left」)
- 6 Tab 横向均分导航,当前 Vary 高亮(底部橄榄色下划线)
- 主区中央引导文案说明触发方式
- 底部 Footer 标注 "Powered by AnyCap · capabilities for AI agents",
  同时呼应 agent 维度的产品定位

### ② Vary · 接收到右键传入的图片

用户在任意网页右键图片 → 「✨ Generate variation with AnyCap」 → 侧栏自动弹出,
源图预览 + Prompt 文本框 + 生成按钮全部就位。

[IMG: 01-vary-pending.png]

要点:
- 源图占据视觉重心(从 picsum demo 随机种子拉)
- Prompt 框带默认文案 "create a stylistic variation of this image",可改可保留
- 主按钮 olive 色 + 内阴影,符合品牌主色 `#6b7d3a`
- 错误态会就地浮现红色错误条(在 mock 模式下不会触发)

### ③ Vary · 生成完成

点 Generate Variation 后约 2.5 秒,结果图原位替换。
Open / New / Download 三动作全部可用。

[IMG: 02-vary-result.png]

要点:
- 结果图与源图同尺寸预览
- 三个动作按钮:Open(新标签打开)、New(回到生成态)、Download(走 chrome.downloads)
- 每生成一次,试用次数 -1(顶部右侧实时更新)

### ④ Image · Quick start 模板芯片(v0.2 新)

切到 Image Tab,顶部 **Quick start** 行有 5 个一键预填模板:Studio portrait / Watercolor / Product flat-lay / Cyberpunk city / Logo mark。
每个芯片同时预填 prompt + 推荐 model + 推荐 aspect ratio,新人不用想词,1 秒就能出图。

[IMG: 09-image-templates.png]

要点:
- Quick start 标签 + 芯片(emoji + 短标题),hover 带轻微抬升和 olive 描边
- 芯片 `title` 属性是完整 prompt,鼠标悬停可预览
- Vary / Video / Music / Search / Crawl 同样有自己的模板组,共 19 个开箱即用 prompt

### ⑤ Image · 文本生成图片(出图后)

模型(nano-banana-2 / seedream-5 / flux-dev)和宽高比可下拉选择。
出图后 Open / Download 跟随,Open 用 lucide ExternalLink 图标,Download 用 lucide Download。

[IMG: 03-image-result.png]

要点:
- 与桌面端同款 lucide-react 图标库,视觉风格统一
- 完整对应 CLI 的 `anycap image generate --prompt ...`

### ⑤b Image · 历史记录(v0.3 新)

每生成一次,结果自动写入 `chrome.storage.local`(按 capability 分类,最多 30 条)。
Recent 区显示该 Tab 最近 6 条,缩略图 grid 布局,hover 时半透明覆盖层显示原始 prompt 摘要。
点击任一缩略图,**重填回 prompt + model + aspect ratio**,可直接再生成或微调。

[IMG: 11-image-history.png]

要点:
- Recent 区只在 Image / Video / Music / Vary 显示**缩略图**,Search / Crawl 显示**文字列表**(标题+查询)
- 单击 Clear 按钮可一键清空该 Tab 的历史(不影响其他 Tab)
- 历史在所有 Tab 共享底层数据,但严格按 `kind` 字段过滤展示,互不污染
- 即使在 demo 模式下,历史也会持久化(`storage.local` 跨 session)

### ⑤ Video · 文本生成视频

模型(veo-3-1 / kling-2 / sora-1)和时长(3s / 5s / 8s)可选,
出片后内嵌 `<video>` 控件,用户可就地预览,可下载 MP4。

[IMG: 04-video-result.png]

要点:
- Mock 后端用 Google 的 sample MP4 作为占位结果
- 播放器原生 controls + poster 海报图(picsum 随机)
- 真实模式接 NexusHub 视频生成路由

### ⑥ Music · 文本生成音乐

模型(lyria-2 / suno-v4 / udio-1)和时长(15s / 30s / 60s)可选,
出片后内嵌 `<audio>` 控件,可在面板内试听、下载 OGG。

[IMG: 05-music-result.png]

要点:
- Audio 控件包在 olive 风格的卡片里,与整体视觉一致
- Mock 后端用 W3C / Wikimedia 的公开 OGG 作为占位
- 真实模式接 lyria-2 等模型

### ⑦ Search · 网页搜索

输入查询(或从右键文字选中带入),Enter 即触发,~0.7 秒返回 6 条结果。
每条卡片包含:标题(可点击跳转)、来源域名、摘要。

[IMG: 06-search-results.png]

要点:
- Hacker News / Wikipedia / GitHub / 自定义博客等多源 mock,
  与真实 search API 的返回结构一致
- 标题色为 olive,链接行为符合"主操作"定义
- 此 Tab 在浏览中价值最高:**用户不需要切到 Google 标签页**

### ⑧ Crawl · 页面提取

输入任意 URL(或点 "Use current tab URL" 自动带入当前页),
Crawl Page 后返回:标题 + 字数 + 语言 + 摘要,折叠区可展开完整 Markdown。

[IMG: 07-crawl-markdown.png]

要点:
- Crawl 是「把网页喂给 LLM」之前的标准前处理步骤
- 浏览器原生集成 = 用户不必复制粘贴 URL 跨产品流转
- Markdown 区可一键 Copy markdown,直接喂给任何 chat 入口

### ⑨ Settings · 个人设置页(v0.2 新)

第 7 个 Tab,垂直滚动布局。所有改动 200 ms 防抖自动写入 `chrome.storage.local`,
顶部右侧"试用次数"提示也实时刷新。

[IMG: 10-settings.png]

四个区块:

| 区块 | 字段 | 说明 |
|---|---|---|
| **Profile** | Display name(占位) | 当前匿名,登录上线后扩展 |
| **Default models** | Image / Video / Music 默认模型 | 各 Tab mount 时读取作为 default |
| **Privacy & display** | Reduced motion · Watermark on results | 减少动画 / 水印开关(免费层强制开) |
| **Maintenance** | Reset settings | 还原所有设置；demo 模式才显示本地试用重置 |

底部 About 区还有版本号、运行模式(production / demo)、试用进度、源码链接、隐私政策链接、Pricing 链接。

### ⑩ Paywall · 试用耗尽

匿名用户每月 3 次免费生成。第 4 次任意 Tab 触发生成时,
统一引导到付费/登录引导页。

[IMG: 08-paywall.png]

要点:
- 文案明确"使用了所有 3 次免费",降低用户挫败感
- 当前 v0.2 匿名首发隐藏登录 UI（标注 "Account sign-in and paid plans are planned"）
- 账户登录与付费计划后续上线；当前公开首发按匿名 3 次/月说明

---

## 与 AnyCap 整体产品矩阵的关系

```
                        ┌─────  CLI / SDK  ─────  agent 调用
   AnyCap Server   ─────┼─────  Desktop App ─────  power user
   (capability runtime) │
                        └─────  Chrome 插件  ─────  普通人(本文档主角)
```

- **同一个后端**:Go HTTP server 暴露 `/v1/image/generate` 等能力路由
- **同一套能力**:image / video / music / search / crawl 是一组 capability,
  不是按"用户身份"分割,而是按"能力类型"分割
- **三种壳**:CLI 让 agent 自动化、桌面端给重度玩家、浏览器插件给所有人

对外讲价值:
- 给投资人:**人面向产品 = B2C 漏斗,把每个插件用户漏到 dev key 注册,获客成本砍 5×**
- 给客户:**插件已经被几万真实用户压测过,所以你买 API 时买的是验证过的能力**
- 给工程师:**桌面端是 dogfood,插件是回归测试,API 推到 agent 时已经被人压过两轮**

---

## 加载到本地 Chrome 演示

```bash
cd extension
pnpm install
pnpm demo                           # 构建带 mock 的演示包,无需任何 server
```

1. `chrome://extensions` → 开 **Developer mode**
2. **Load unpacked** → 选 `extension/.output/chrome-mv3/`
3. Pin AnyCap 图标到工具栏
4. 点工具栏图标 → 右侧划出侧栏,即可走完 9 步演示动线

完整演示脚本见 `extension/DEMO.md`。

## 测试覆盖

| 套件 | 用例数 | 说明 |
|---|---|---|
| Unit (vitest) | 74 | 含 6 mock 后端 + tagged union store + 5 menu handlers |
| 常规 E2E (`pnpm e2e`) | 7 通过 + 9 skipped | prod build,跑非 mock 路径 |
| Demo E2E (`pnpm e2e:demo`) | 8 通过 | 完整覆盖 6 个 Tab 端到端走通 |
| 截图(本文用) | 9 张 | 由 `tests/e2e/feishu-shots.spec.ts` 自动产出 |
