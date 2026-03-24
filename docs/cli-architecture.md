# AnyCap CLI 架构设计

## 设计原则

1. **Agent-First**：默认行为为 Agent 优化，人类使用是兼容模式
2. **渐进式发现**：Agent 通过 `--help` 逐层探索能力，而非预加载全量文档
3. **JSON-First**：默认输出 JSON（stdout），日志信息走 stderr
4. **扁平优先**：高频操作放顶层，减少命令层级，降低 Agent 的认知和 token 开销
5. **自描述**：CLI 本身即文档，每条命令的 help 即 skill file 的运行时等价物

## 命令结构总览

```
anycap
│
│  ── 能力（Cap）──────────────────────────
├── llm          语言模型
├── image        图片生成、编辑、放大
├── video        视频生成
├── music        音乐生成
├── tts          文本转语音
├── asr          语音转文本
├── search       搜索（网页、新闻、学术）
├── crawl        结构化爬取
├── action       封装好的 Workflow
├── agent        调用其他 Agent
│
│  ── 基础设施（Infra）────────────────────
├── drive        文件存储
├── database     数据持久化
├── page         网页托管
├── sandbox      隔离执行环境
├── browser      浏览器实例
│
│  ── 动态扩展 ─────────────────────────────
├── run          通用执行入口（访问新上线的动态能力）
│
│  ── 管理（Meta）─────────────────────────
├── login        认证登录
├── config       配置管理
├── skill        Skill 发现与管理
├── feedback     反馈
└── status       服务状态
```

**设计决策**：Cap 和 Infra 不在命令层级上区分（不需要 `anycap cap llm` 或 `anycap infra drive`）。Agent 不关心后端分类，它只需要 `anycap image generate`。分类通过 `--help` 的分组展示来体现。

## 命令详细设计

### 顶层 Help（第一层发现）

Agent 执行 `anycap --help` 时看到的内容。这是 Agent 的能力索引入口。

```
AnyCap — Capability runtime for AI agents.

CAPABILITIES
  llm          Route across 20+ language models
  image        Generate, edit, upscale images
  video        Text-to-video, image-to-video
  music        Generate stems, tracks, loops
  tts          Text to speech
  asr          Speech to text
  search       Web, news, academic search
  crawl        Structured web crawling
  action       Pre-built workflows
  agent        Delegate tasks to other agents

INFRASTRUCTURE
  drive        File storage
  database     Persistent data store
  page         Web page hosting
  sandbox      Isolated execution environment
  browser      Browser instance

EXTENSIONS
  run          Access new capabilities not yet in this CLI version

MANAGEMENT
  login        Authenticate (run once, credentials persist)
  config       View and set configuration
  skill        Discover and manage skills
  feedback     Report quality or request capabilities
  status       Service health and account info

Run 'anycap <command> --help' for details on any command.
Run 'anycap run --list' to discover new capabilities.
Run 'anycap skill show' for best practices and usage guide.
```

**设计要点**：
- 三个分组，让 Agent 快速定位需要的命令
- 每条描述不超过一行，节省 token
- 底部引导 Agent 进入下一层发现

### 资源级 Help（第二层发现）

Agent 执行 `anycap image --help` 时看到的内容。

```
anycap image — Generate, edit, and upscale images.

COMMANDS
  generate     Generate image from text prompt
  edit         Edit existing image with instructions
  upscale      Upscale image resolution

COMMON FLAGS
  --model      Model to use (run 'anycap image models' to list available)
  --output     Output file path (default: auto-generated)
  --json       Force JSON output (default when non-TTY)

EXAMPLES
  anycap image generate --prompt "cyberpunk city" --model gpt-image-1.5
  anycap image edit --input photo.jpg --prompt "remove background"
  anycap image upscale --input logo.png --scale 4x

Run 'anycap image models' to see available models and supported parameters.
Run 'anycap image <command> --help' for full parameter details.
```

**设计要点**：
- 列出所有子命令（动词）
- `--model` 不硬编码模型列表，引导 Agent 通过 `models` 子命令动态查询
- 提供常用 flag 和示例
- Agent 看完就能直接调用，不需要进入第三层

### 命令级 Help（第三层发现）

Agent 需要完整参数规格时执行 `anycap image generate --help`。

```
anycap image generate — Generate image from text prompt.

REQUIRED
  --prompt     Text description of the image to generate

COMMON OPTIONS (accepted by all models)
  --model      Model to use (default: auto, run 'anycap image models' to list)
  --size       Image size (default: model-dependent)
  --count      Number of images (default: 1)
  --output     Output file path (default: /tmp/anycap-<id>.png)
  --json       Force JSON output

Note: Each model supports additional parameters.
      Run 'anycap image models --name <model> --schema' to see model-specific options.

OUTPUT (JSON)
  {
    "id": "img_abc123",
    "status": "success",
    "files": ["/tmp/anycap-img_abc123.png"],
    "model": "gpt-image-1.5",
    "usage": { "credits": 1 }
  }

EXIT CODES
  0    Success
  1    Authentication error (run 'anycap login')
  2    Invalid parameters
  3    Model unavailable
  4    Rate limit exceeded
  5    Server error
```

**设计要点**：
- 明确区分 REQUIRED 和 COMMON OPTIONS
- 通用参数跨模型生效，AnyCap 负责翻译给底层模型
- 模型特有参数通过 `anycap image models --name <model> --schema` 动态发现
- 展示输出的 JSON schema，Agent 知道如何解析结果
- 定义 exit code，Agent 可以精确处理错误

### 核心命令详细设计

#### Cap — 能力命令

```bash
# LLM
anycap llm chat --model claude-sonnet-4-6 --prompt "..."
anycap llm chat --model gpt-5.4 --prompt "..." --system "You are..."
anycap llm chat --model gemini-3.1-pro --prompt "..."
anycap llm models                              # 列出可用模型
anycap llm models --name claude-sonnet-4-6 --schema  # 查看模型参数

# Image
anycap image generate --prompt "..." --model gpt-image-1.5
anycap image generate --prompt "..." --model nano-banana-2
anycap image generate --prompt "..." --model midjourney-v7
anycap image edit --input photo.jpg --prompt "remove background"
anycap image upscale --input logo.png --scale 4x
anycap image models                            # 列出可用模型
anycap image models --name nano-banana-2 --schema  # 查看模型专属参数

# Video
anycap video generate --prompt "..." --model veo-3.1
anycap video generate --prompt "..." --model sora-2
anycap video from-image --input scene.png --prompt "make it rain" --model runway-gen-4.5
anycap video models

# Music
anycap music generate --prompt "lo-fi chill beat" --duration 30 --model suno-v4
anycap music generate --prompt "orchestral theme" --model wondera-1
anycap music stems --input track.mp3           # 分离音轨
anycap music models

# TTS
anycap tts speak --text "Hello world" --model elevenlabs-v3
anycap tts speak --text "你好世界" --model cartesia-sonic-3
anycap tts voices                              # 列出可用语音
anycap tts models

# ASR
anycap asr transcribe --input meeting.mp3 --model elevenlabs-scribe-v2
anycap asr transcribe --input lecture.wav --model qwen3-asr
anycap asr models

# Search
anycap search web --query "..."
anycap search news --query "..." --period 7d
anycap search academic --query "..."

# Crawl
anycap crawl url --url "https://..." --format markdown
anycap crawl site --url "https://..." --depth 2

# Action（封装 Workflow）
anycap action list                              # 列出可用 action
anycap action run read-media --input file.pdf
anycap action run <action-name> [--params...]

# Agent
anycap agent list                               # 列出可用 agent
anycap agent run <agent-name> --task "..."
```

#### Infra — 基础设施命令

```bash
# Drive
anycap drive upload --file image.png            # 返回 URL/ID
anycap drive download --id file_abc123 --output ./
anycap drive list
anycap drive delete --id file_abc123

# Database
anycap database create --name mydb
anycap database query --name mydb --sql "SELECT ..."
anycap database list

# Page
anycap page deploy --dir ./dist                 # 部署网页
anycap page list
anycap page delete --id page_abc123

# Sandbox
anycap sandbox create --runtime python3.11
anycap sandbox exec --id sb_abc123 --command "python script.py"
anycap sandbox destroy --id sb_abc123

# Browser
anycap browser create                           # 返回 session ID
anycap browser navigate --id br_abc123 --url "https://..."
anycap browser screenshot --id br_abc123
anycap browser extract --id br_abc123 --selector ".content"
anycap browser close --id br_abc123
```

#### Meta — 管理命令

```bash
# 认证
anycap login                                    # 自动选择最佳认证方式
anycap login --headless                         # 强制 Device Flow
anycap logout

# 配置
anycap config set-key <api-key>                 # 直接输入 key
anycap config show                              # 当前配置
anycap config set default-model claude          # 设置默认值

# Skill
anycap skill show                               # 显示 AnyCap 完整 skill（索引 + best practice）
anycap skill show image                         # 显示 image 相关 skill
anycap skill list                               # 列出所有已安装 skill
anycap skill install <skill-name>               # 从 market 安装
anycap skill search <keyword>                   # 搜索 market

# Feedback
anycap feedback like --id img_abc123            # 对某次调用点赞
anycap feedback dislike --id img_abc123 --reason "quality too low"
anycap feedback request --capability "3d-model-generation"

# 状态
anycap status                                   # 服务健康 + 账户信息 + 用量
```

## 模型发现与参数内省

每个能力类别（image、video、music 等）下的不同模型支持不同的参数。通过统一的 `models` 子命令解决：

### 列出可用模型

```bash
$ anycap image models
```

```json
{
  "models": [
    { "name": "gpt-image-1.5",    "provider": "openai",    "description": "Instruction-driven, context-aware image creation" },
    { "name": "nano-banana-2",    "provider": "google",    "description": "High realism, fast, commercial-ready" },
    { "name": "midjourney-v7",    "provider": "midjourney", "description": "Best artistic and aesthetic quality" },
    { "name": "seedream-5.0",     "provider": "bytedance", "description": "Photorealistic with text rendering" },
    { "name": "ideogram-2.0",     "provider": "ideogram",  "description": "Best text-in-image accuracy" },
    { "name": "flux-1.1-pro",     "provider": "bfl",       "description": "Fast generation, good quality balance" },
    { "name": "sd-3.5",           "provider": "stability", "description": "Maximum flexibility, open weights" }
  ]
}
```

### 查看模型专属参数（Schema 内省）

```bash
$ anycap image models --name midjourney-v7 --schema
```

```json
{
  "model": "midjourney-v7",
  "version": "7.0",
  "common_params": {
    "prompt":  { "type": "string",  "required": true },
    "size":    { "type": "enum",    "values": ["1024x1024", "1536x1024", "1024x1536"] },
    "count":   { "type": "int",     "default": 1, "max": 4 },
    "output":  { "type": "string",  "default": "/tmp/anycap-<id>.png" }
  },
  "model_params": {
    "aspect-ratio":  { "type": "string",  "default": "1:1", "examples": ["16:9", "9:16", "4:3"] },
    "stylize":       { "type": "int",     "default": 100, "min": 0, "max": 1000 },
    "chaos":         { "type": "int",     "default": 0,   "min": 0, "max": 100 },
    "weird":         { "type": "int",     "default": 0,   "min": 0, "max": 3000 },
    "quality":       { "type": "enum",    "values": ["standard", "hd"] }
  }
}
```

```bash
$ anycap image models --name nano-banana-2 --schema
```

```json
{
  "model": "nano-banana-2",
  "version": "2.0",
  "common_params": {
    "prompt":  { "type": "string",  "required": true },
    "size":    { "type": "enum",    "values": ["512x512", "1024x1024", "1536x1536", "2048x2048"] },
    "count":   { "type": "int",     "default": 1, "max": 8 },
    "output":  { "type": "string",  "default": "/tmp/anycap-<id>.png" }
  },
  "model_params": {
    "style":         { "type": "enum",    "values": ["photorealistic", "digital-art", "anime", "vector"] },
    "negative":      { "type": "string",  "description": "Negative prompt" },
    "seed":          { "type": "int",     "description": "Random seed for reproducibility" },
    "guidance":      { "type": "float",   "default": 7.5, "min": 1.0, "max": 20.0 }
  }
}
```

### Agent 使用流程

```
场景：Agent 需要生成一张 16:9 的图片

1. anycap image models
   → 看到所有可用模型，选择 midjourney-v7

2. anycap image models --name midjourney-v7 --schema
   → 发现 midjourney-v7 支持 --aspect-ratio 参数

3. anycap image generate --prompt "sunset" --model midjourney-v7 --aspect-ratio 16:9
   → 成功
```

### 参数错误时的智能提示

```bash
$ anycap image generate --prompt "sunset" --model nano-banana-2 --aspect-ratio 16:9
```

```json
{
  "status": "error",
  "error": {
    "code": "INVALID_PARAM",
    "message": "--aspect-ratio is not supported by nano-banana-2. Use --size to control dimensions.",
    "hint": "anycap image models --name nano-banana-2 --schema",
    "suggestion": "--size 1536x1024"
  }
}
```

**error.hint** 引导 Agent 查看正确的参数列表，**error.suggestion** 直接给出替代方案。

### 各能力类别的最新模型参考（2026.03）

> 注：以下为示例模型，具体支持列表以 `anycap <capability> models` 运行时返回为准。
> 模型默认参数待定。

| 能力 | 模型示例 | 说明 |
|------|---------|------|
| **llm** | claude-opus-4-6, claude-sonnet-4-6, gpt-5.4, gemini-3.1-pro, grok-4 | 前沿语言模型 |
| **image** | gpt-image-1.5, nano-banana-2, midjourney-v7, seedream-5.0, ideogram-2.0, flux-1.1-pro, sd-3.5 | 图片生成 |
| **video** | veo-3.1, sora-2, runway-gen-4.5, kling-2.6, wan-2.2 | 视频生成 |
| **music** | suno-v4, wondera-1, udio-2, elevenlabs-music-1 | 音乐生成 |
| **tts** | elevenlabs-v3, cartesia-sonic-3, openai-tts-1, fish-speech-1.5 | 文本转语音 |
| **asr** | elevenlabs-scribe-v2, qwen3-asr, assemblyai-universal-2, whisper-v3-turbo | 语音转文本 |

## 输出设计

### 默认行为：自动检测环境

```
if stdout is TTY (人类在终端里直接用):
    输出人类可读格式（表格、彩色文本）
    日志信息输出到 stderr

if stdout is piped/non-TTY (Agent 调用):
    输出 JSON 到 stdout
    日志信息输出到 stderr
```

### 强制覆盖

```bash
anycap image generate --prompt "..." --json      # 强制 JSON
anycap image generate --prompt "..." --pretty     # 强制人类可读
```

### 标准 JSON 输出结构

所有命令的 JSON 输出遵循统一结构：

```json
{
  "id": "操作 ID，用于 feedback 引用",
  "status": "success | error",
  "data": {
    "// 命令特定的返回数据"
  },
  "usage": {
    "credits": 1,
    "model": "flux"
  }
}
```

错误输出：

```json
{
  "id": null,
  "status": "error",
  "error": {
    "code": "AUTH_REQUIRED",
    "message": "Not authenticated. Run 'anycap login' to get started.",
    "hint": "anycap login"
  }
}
```

**`hint` 字段**：告诉 Agent 下一步该执行什么命令。Agent 可以直接读取并执行，实现自动恢复。

### Exit Code 规范

| Code | 含义 | Agent 行为 |
|------|------|-----------|
| 0 | 成功 | 继续 |
| 1 | 未认证 | 执行 `anycap login` |
| 2 | 参数错误 | 读取 error.message 修正参数 |
| 3 | 资源不可用（模型下线等） | 换模型重试 |
| 4 | 超出配额/限流 | 等待或通知用户 |
| 5 | 服务端错误 | 重试或通知用户 |

## 认证流程

### Endpoint 与 Auth 抽象

**设计决策**：CLI 不硬编码 API 地址和认证方式。所有 HTTP 请求通过统一的 `endpoint` + `auth token` 发出，CLI 不关心对端是 AnyCap API 还是企业内网 Proxy。

```go
// CLI 内部的请求发送逻辑
func (c *Client) do(req *http.Request) (*http.Response, error) {
	req.Header.Set("Authorization", "Bearer "+c.config.Auth.Token)
	req.URL.Host = c.config.Endpoint
	// ...
}
```

这样设计是为了支持未来的企业 Proxy 部署模式（见下方「企业 Proxy 模式」章节），同时对个人用户零影响。

### 个人用户认证（默认模式）

```
anycap login 的内部逻辑：

1. 检查 ~/.anycap/credentials 是否已有有效 token
   └── 有 → "Already logged in as user@example.com"，exit 0

2. 检测环境
   ├── 能启动 localhost server + 打开浏览器
   │   └── Localhost Callback Flow（最低摩擦）
   └── 不能（SSH/容器/无桌面）
       └── Device Flow（显示链接 + 验证码，需用户确认）

3. 认证成功 → token 保存到 ~/.anycap/credentials
4. 所有后续命令自动读取 credentials，无需重复认证

快捷方式：
  anycap config set-key sk-xxx   ← 跳过整个登录流程
```

## 渐进式发现机制

### Agent 如何通过 CLI 自学 AnyCap

```
第一步：Agent 读取 Skill File（anycap.skill on GitHub）
        了解 AnyCap 是什么，如何安装

第二步：anycap --help
        看到所有能力分类和命令列表

第三步：anycap image --help
        看到 image 下的子命令、通用参数、示例

第四步：anycap image generate --help
        看到通用参数规格、输出 JSON schema、exit code

第五步：anycap image models
        看到所有可用模型及简介，选择合适的模型

第六步：anycap image models --name midjourney-v7 --schema
        看到该模型的专属参数（aspect-ratio、stylize 等）

第七步：anycap skill show image
        看到 best practice（"生成 logo 建议用 nano-banana-2 + vector 风格"）
```

每一步只加载当前需要的信息，不浪费 context window。

### Skill File 与 CLI Help 的关系

```
Skill File（静态，存在 GitHub 上）
  → 告诉 Agent："AnyCap 存在，可以做什么，如何安装"
  → 入口级信息，引导 Agent 进入 CLI

CLI --help（动态，运行时获取）
  → 告诉 Agent："具体怎么用，有哪些参数，输出什么格式"
  → 始终反映当前版本的真实能力

Models --schema（动态，运行时获取）
  → 告诉 Agent："这个模型支持哪些专属参数"
  → 模型参数内省层

Skill show（动态，运行时获取）
  → 告诉 Agent："最佳实践是什么，什么场景用什么模型和参数"
  → 经验知识层
```

**Skill File 负责"发现"，CLI Help 负责"使用"，Models Schema 负责"精确调参"，Skill Show 负责"用好"。**

## 静态编译 vs 动态下发

### 设计决策：编译固定 + `anycap run` 动态逃逸口

CLI 命令结构采用**编译固定**为主，辅以通用执行入口处理新能力上线的过渡期。

### 决策依据

全部动态下发（CLI 从后端获取命令树 manifest）虽然灵活，但有严重的稳定性风险：

| 风险 | 说明 |
|------|------|
| **Agent 调用被静默破坏** | 后端改了命令名/参数名，正在运行的 Agent 代码会突然失效，且 Agent 拥有者无法感知 |
| **离线不可用** | 首次运行必须联网获取 manifest；无缓存时 CLI 完全不可用 |
| **无法锁定版本** | Agent 无法声明"我依赖 AnyCap CLI v1.2 的行为"，后端变了全量生效 |
| **启动开销** | 每次执行都需要解析 manifest 构建命令树 |
| **Tab 补全受损** | 动态命令无法在安装时生成 shell 补全脚本 |
| **调试困难** | 问题可能出在 CLI、manifest、或后端三方之一 |
| **安全攻击面** | manifest 是远程控制的命令定义，被篡改可注入恶意 endpoint |

而真正需要"动态"的部分，**已有设计已经覆盖**：

| 变化频率 | 内容 | 是否需要动态 | 现有方案 |
|---------|------|------------|---------|
| 每周 | 新模型上线 | 需要 | `anycap image models`（已动态） |
| 每月 | 模型参数变化 | 需要 | `models --schema`（已动态） |
| 每季度 | 新能力上线（如 `3d`） | 需要 | `anycap run`（新增逃逸口） |
| 很少 | 命令结构变化 | 不需要 | 发新 CLI 版本 |

### 架构分层

```
编译固定（不依赖网络，行为可预期）
├── 命令结构：image / video / llm / tts / asr / ...
├── 子命令：generate / edit / upscale / models / ...
├── 通用参数：--prompt / --model / --output / --json / ...
├── Help 文本
├── 输出格式化（JSON / pretty）
├── 认证模块（login / config）
├── Tab 补全脚本
└── anycap run（通用执行入口）

运行时从后端获取（高频变化部分）
├── anycap <cap> models           → 可用模型列表
├── anycap <cap> models --schema  → 模型专属参数
├── anycap skill show             → 最佳实践
└── anycap run <capability> ...   → 新能力的命令定义
```

### `anycap run` — 通用动态执行入口

当后端新增了一个能力（如 `3d`），但 CLI 还没发新版本时，Agent 可以通过 `run` 命令立即使用：

```bash
# CLI 还没有 3d 命令，但后端已经上线了
# Agent 通过 run 命令访问
anycap run 3d generate --prompt "a wooden chair" --format obj

# run 命令的行为：
# 1. 向后端查询 3d 的命令定义（endpoint、参数等）
# 2. 后端校验参数
# 3. 执行并返回结果
```

```bash
# 下个 CLI 版本发布后，3d 变成一等公民命令
anycap 3d generate --prompt "a wooden chair" --format obj
```

`run` 命令的发现机制：

```bash
# 查看所有可通过 run 访问的动态能力
$ anycap run --list

{
  "capabilities": [
    { "name": "3d", "description": "3D model generation", "status": "preview" },
    { "name": "voice-clone", "description": "Voice cloning", "status": "beta" }
  ]
}

# 查看某个动态能力的参数
$ anycap run 3d --help

# 从后端获取 3d 的命令定义并展示
```

### 一等公民命令 vs `run` 的区别

| | 一等公民（编译固定） | `anycap run`（动态） |
|---|---|---|
| 离线 help | 可用 | 需要网络 |
| Tab 补全 | 支持 | 不支持 |
| 参数校验 | CLI 本地 + 后端双重校验 | 仅后端校验 |
| 稳定性 | CLI 版本即契约 | 后端可随时变更 |
| 适用场景 | 成熟、稳定的能力 | 新上线、预览阶段的能力 |

**能力的生命周期**：`anycap run`（预览）→ 验证稳定 → 编译进下一版 CLI（一等公民）。

### 技术选型：Go

CLI 使用 Go 语言开发，基于 Cobra 框架。

选择理由：

| 因素 | 说明 |
|------|------|
| **开发速度** | 创业阶段迭代速度优先，Go 比 Rust 快 |
| **CLI 生态** | gh、kubectl、docker、terraform 均为 Go 编写，Cobra 是业界标准 |
| **单二进制** | `go build` 直接输出单文件，无运行时依赖 |
| **交叉编译** | `GOOS=linux GOARCH=amd64` 一行出全平台产物 |
| **性能足够** | CLI 非计算密集型，Go 的启动速度（~10ms）满足需求 |

### 本地文件结构

```
~/.anycap/
├── credentials          # 认证 token（login 后持久化）
├── config.json          # 用户配置（endpoint、auth、default-model 等）
└── cache/
    ├── models/          # 模型列表缓存（按能力分文件，TTL 1h）
    │   ├── image.json
    │   ├── video.json
    │   └── ...
    └── run/             # 动态能力定义缓存
        ├── 3d.json
        └── ...
```

#### config.json 结构

```json
// 个人用户（默认）
{
  "endpoint": "https://api.anycap.ai",
  "auth": {
    "token": "sk-xxx"
  },
  "defaults": {
    "image-model": "flux-1.1-pro"
  }
}
```

```json
// 企业 Proxy 模式
{
  "endpoint": "http://proxy.internal:8080",
  "auth": {
    "token": "internal-token-xxx"
  },
  "defaults": {
    "image-model": "flux-1.1-pro"
  }
}
```

CLI 代码中不区分这两种模式，统一读取 `endpoint` + `auth.token`。

## 企业 Proxy 模式

### 问题

AnyCap 的 API Key 存储在本地 `~/.anycap/credentials` 中。AI Agent 具有文件系统访问权限，可以读取该文件。在 prompt injection 等攻击场景下，Key 可能被泄露到外网。

### 方案

企业可在内网部署 AnyCap Proxy Server，作为 CLI 与 AnyCap API 之间的中间层：

```
┌─────────────────────── 企业内网 ───────────────────────┐
│                                                        │
│  Agent + CLI ──(内网 auth)──→ AnyCap Proxy             │
│                              ├── 持有 AnyCap API Key   │
│                              ├── 内部鉴权（SSO/内网 token）│
│                              └── 转发请求到 AnyCap API  │
│                                                        │
└────────────────────────────────────────────────────────┘
                                    │
                                    │ AnyCap Key
                                    ▼
                              AnyCap API (外网)
```

### 设计要点

| 要点 | 说明 |
|------|------|
| Agent 机器上无 AnyCap Key | Key 仅存在于 Proxy Server，Agent 无法读取和泄露 |
| 内网鉴权与 AnyCap 鉴权解耦 | Proxy 使用企业自有的 token 体系（SSO、内网 token 等），与 AnyCap API Key 无关 |
| CLI 零改动 | 仅需修改 `config.json` 中的 `endpoint` 和 `auth.token`，CLI 代码无需区分两种模式 |
| Proxy 本身很薄 | 核心逻辑为 auth 转换 + 请求转发，由 AnyCap 提供开源参考实现 |
| 内网部署 | Proxy 运行在企业内网，网络层天然安全 |

### 优先级

Proxy Server 的开发和发布优先级不高，放在后续阶段。但 **CLI 从第一版起就必须支持 `endpoint` + `auth` 的抽象配置**，确保未来接入 Proxy 时 CLI 无需架构改动。

## 设计优势

1. **零文档依赖**：Agent 通过 `--help` 逐层探索，不需要预加载任何文档到 context
2. **Token 高效**：扁平结构 + 渐进发现，Agent 只读需要的信息
3. **自动错误恢复**：JSON 错误输出包含 `hint` 字段，Agent 可以自动执行修复命令
4. **环境自适应**：输出格式和认证方式自动适配环境
5. **统一心智模型**：所有命令遵循 `anycap <resource> <action> [--flags]`，学一个会所有

## 潜在问题与应对

| 问题 | 风险 | 应对 |
|------|------|------|
| 命令太多导致顶层 help 过长 | Agent 首次发现时 token 开销大 | 顶层 help 严格控制在 30 行以内；详情推到第二层 |
| Cap 和 Infra 混在顶层 | Agent 可能混淆"调用能力"和"使用资源"的不同交互模式 | help 分组展示；infra 命令返回的 JSON 包含 session/资源 ID，暗示有状态管理 |
| 新能力上线后 Skill File 过时 | GitHub 上的 skill 和实际 CLI 能力不一致 | `anycap skill show` 始终从服务端拉取最新信息；Skill File 只做入口引导，不列举具体能力 |
| `--json` 自动检测误判 | 某些终端模拟器被误判为 non-TTY | 提供 `--json` 和 `--pretty` 强制覆盖 |
| Infra 资源需要生命周期管理 | Agent 创建了 browser/sandbox 但忘记关闭 | 资源设默认 TTL（如 browser 30 分钟自动关闭）；`anycap status` 显示活跃资源 |
