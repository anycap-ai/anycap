# AnyCap — 产品愿景与规划

## 1. 项目背景

Coding Agent（Claude Code、Cursor、Codex）让 AI 学会了思考和写代码。但写代码只是做事的一部分——Agent 不能生成图片、不能制作视频和音乐、不能持久化存储文件、不能发布网页。这些真实世界的能力，是现有 Agent 平台的盲区。

AnyCap 补上这些缺失的能力。而且是以 Agent 原生的方式：

- 一条命令就能调用能力，不需要 SDK 或人类文档
- 机器可读的接口契约（Skill File），Agent 读完即可自主使用
- 统一的认证和计费，一个账号覆盖所有能力

## 2. 产品定位

> **Any capability your agent is missing.**

你的 Agent 能思考、能写代码，但不能生图、不能做视频、不能存文件、不能发网页。AnyCap 补上这些缺失的能力——不管 Agent 缺什么，一个入口全补齐。

### 设计哲学：No SDK. No docs. No UI.

AnyCap 为 Agent 而生，不是为人类开发者：

- Agent 不需要 SDK —— 它需要一条命令（CLI）
- Agent 不需要文档 —— 它需要 Skill File（机器可读的接口契约）
- Agent 不需要 UI —— 它需要结构化的输入输出

未来会开放 API/SDK 供开发者集成，但当前阶段的核心故事是：**补全 Agent 缺失的能力，零摩擦。**

## 3. 产品架构

AnyCap 由五大支柱组成：

```
AnyCap
├── Cap       能力层（调用即结果）
├── Infra     基础设施层（资源自主使用）
├── CLI       交互层（Agent 的唯一操作界面）
├── Skill     契约层（Agent 的能力说明书）
└── Dashboard 管理层（人类的监管窗口）
```

### 3.1 Cap — 能力层

Cap 是 AnyCap 的核心价值。交互模式为 **Request → Response**：Agent 发起一个调用，拿回一个结果。

能力分三个层级，体现从原子到复合再到自主的递进：

#### Direct（原子能力）

最小粒度，单次调用，一个输入一个输出。

| 能力 | 说明 |
|------|------|
| llm | 大语言模型调用，路由 20+ 提供商 |
| image | 图片生成、编辑、放大 |
| video | 文生视频、图生视频 |
| music | 音轨、循环、完整曲目生成 |
| tts | 文本转语音 |
| asr | 语音转文本 |
| search | 网页、新闻、学术搜索 |
| crawl | 结构化爬取（不一定依赖浏览器） |

#### Action（封装 Workflow）

预编排的复合操作，组合多个 Direct 能力。Agent 无需自己编排，降低使用成本。

- 示例：`read media`（自动识别媒体类型并提取内容）
- 当前由 AnyCap 官方定义，未来可能开放给用户和第三方
- 持续扩展中

#### Agent（Agent-as-a-Service）

最高抽象层级。调用方 Agent 可以将任务委托给 AnyCap 平台上的其他 Agent 执行。

- 当前由 AnyCap 自己运营
- 未来支持第三方 Agent 入驻，形成 Agent 托管和路由平台

**对调用方 Agent 来说，三个层级的调用方式统一（都通过 CLI），但背后复杂度递增。**

### 3.2 Infra — 基础设施层

Agent 做事不仅需要 AI 能力，还需要"水电煤"。Infra 提供 IaaS 级别的资源，交互模式为 **获取资源 → 自主使用**：Agent 拿到资源句柄后自行决定如何使用。

| 资源 | 说明 |
|------|------|
| drive | 文件存储（生成的图片、音频等需要持久化的地方） |
| database | 数据持久化（爬取的数据、Agent 状态等） |
| page | 网页托管发布（Agent 可以发布和管理网页） |
| sandbox | 隔离执行环境（安全运行代码） |
| browser | 浏览器实例（给 Agent 一个真实的浏览器自主操作） |

#### Cap 与 Infra 的边界

不是"AI 相关 vs 非 AI"，而是交互模式的不同：

| | Cap | Infra |
|---|---|---|
| 交互模式 | 调用即结果 | 获取资源自主使用 |
| 控制权 | AnyCap 控制执行 | Agent 自己控制 |
| 类比 | SaaS | IaaS |
| 例子 | crawl（帮你爬） | browser（给你浏览器自己爬） |

### 3.3 CLI — 交互层

CLI 是 Agent 与 AnyCap 的唯一交互界面，承载完整的 Agent 生命周期：

| 功能 | 说明 |
|------|------|
| use | 调用 Cap 能力和 Infra 资源 |
| feedback | like/dislike 反馈 + 新能力请求（capability request） |
| skill | Skill 管理（待定，可能支持 `anycap skill list/install`） |
| control | Agent 对自身行为和资源的控制 |
| onboard | 注册/初始化（CLI 出链接，引导用户浏览器注册） |
| security | API Key 管理（支持直接输入 Key 快速激活） |

使用示例：

```bash
$ anycap llm chat --model claude --prompt "..."
$ anycap image generate --prompt "..." --model flux
$ anycap video generate --prompt "..."
$ anycap search web --query "..."
$ anycap browser navigate --url "..."
```

### 3.4 Skill — 契约层

Skill File 是 Agent 与 AnyCap 之间的接口契约，遵循 Anthropic Agent Skills 规范。

#### 结构设计

采用**入口 Skill + 按需加载**的模式：

```
anycap.skill（入口）
  → 全局索引：AnyCap 有哪些能力
  → 安装引导：如何安装和认证
  → 按需指向：
      → anycap-image.skill
      → anycap-llm.skill
      → anycap-infra.skill
      → ...
```

Agent 读入口 Skill 了解全局能力，只加载自己需要的具体 Skill，节省 context window。

#### Skill 内容

每个 Skill 包含：

- **Capability Index**：该 Skill 覆盖的能力列表和调用方式
- **Best Practice**：使用建议和最佳实践（如"生成 logo 建议用 flux + vector 风格"）

#### Skill Market

未来开放 Skill 市场，第三方可以发布和共享 Skill，形成社区生态。

### 3.5 Dashboard — 管理层

Dashboard 是为人类管理者（Agent 的拥有者）提供的监管界面。

| 模块 | 功能 |
|------|------|
| billing | 计费管理：订阅制（subscription）+ 充值（top up） |
| usage | 用量统计 |
| log | 调用日志 |
| control | 管控设置：黑名单（blacklist）、配额（quota）、偏好（preference） |

**Agent 用 CLI，人类用 Dashboard，两者互不干涉。**

## 4. 优先级排序

### 第一阶段：补全最缺失的能力

优先补上现有 coding agent 完全不具备的能力，按缺失程度排序：

1. **image / video / music / tts** — 多模态创作能力，coding agent 完全没有，刚需
2. **drive / page** — Agent 生成了内容但没地方存、没地方发布，是能力闭环的关键一环
3. **asr** — 音频理解能力缺失
4. **crawl** — 现有 Agent 的抓取能力有限，结构化爬取是增量
5. **search** — 部分 Agent 已有内置搜索，增量价值较低
6. **llm** — Agent 自身即 LLM，仅特定场景需要（模型对比、特定模型路由等）

### 第二阶段：扩展基础设施

- database、sandbox、browser 逐步跟进
- 让 Agent 不仅有能力调用，还有完整的资源环境

### 第三阶段：生态开放

- 开放 Action 定义（允许用户和第三方编排 workflow）
- 开放 Agent 入驻（第三方 Agent 托管）
- Skill Market 上线
- API/SDK 开放（面向开发者的集成层）

### 增长路径总结

```
卖能力（Direct）→ 卖效率（Action）→ 卖生态（Agent + Market）
```

## 5. Go-to-Market 策略

### 目标用户

正在用 Claude Code、Cursor、Codex、OpenCode 等 coding agent 的开发者。他们已经体验到 agent 的强大，但也撞到了能力天花板——想让 agent 生张图、做个视频、存个文件，却发现做不到。

### 分发渠道

- Skill File 和 CLI Binary 托管在 GitHub
- AnyCap 官网（anycap.ai）本身即 LLM 可读的纯文本，Agent 读完即可自主安装使用
- Skill file 兼容 Anthropic Agent Skills 规范，可被各大 Agent 平台索引

### 用户旅程

```
用户告诉 Agent "用 anycap 生成一张图"
  → Agent 搜索/访问 anycap.ai 或 GitHub
  → 读取 Skill File，理解安装和使用方式
  → 安装 CLI（curl | sh）
  → 首次使用触发 onboard（CLI 出链接，用户注册/登录一次）
  → 凭证持久化保存（~/.anycap/），后续无需重复操作
  → 也支持直接输入 API Key 快速激活
  → 开始使用
```

### 降低摩擦的措施

- **安装引导**：Skill File 中加入友好文案，降低 `curl | sh` 的信任门槛
- **注册一次化**：凭证持久化，所有 Agent 环境共享，不重复注册
- **Free Tier**：提供免费额度，让 Agent 可以立即开始使用
- **Key 直接输入**：支持 `anycap config set-key xxx`，最短路径激活

## 6. Feedback 机制

CLI 内置 feedback 功能，Agent 可以：

- **like/dislike**：反馈能力调用的质量
- **capability request**：请求 AnyCap 尚未提供的新能力

这些数据将作为**产品决策的核心数据源**，用于：

- 发现哪些模型/provider 质量在下降
- 判断 Agent 生态下一步最需要什么能力
- 决定哪些 Action 值得官方封装

## 7. 竞争护城河

大平台（Anthropic、OpenAI、Cursor）可能会原生集成部分能力（如图片生成）。但这恰恰验证了需求的真实性——平台补得越多，说明 Agent 能力缺失越是真问题。AnyCap 的护城河在于：

| 护城河 | 说明 |
|--------|------|
| 能力完整度 | 大平台会补少数高频能力，但不会覆盖 music、tts、asr、drive、page 等长尾。AnyCap 做的是完整的能力补全层，永远覆盖更广 |
| Action 编排智慧 | 预编排的 workflow 包含最佳实践和 know-how，直接调 API 无法获得 |
| Skill 最佳实践 | Skill File 中嵌入使用建议，Agent 通过 AnyCap 调用的效果优于直接调 API |
| Infra 粘性 | 数据存入 drive/page 后迁移成本高，形成自然锁定 |
| Feedback 数据飞轮 | 持续优化能力路由和质量，形成正向循环 |
