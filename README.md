# AnyCap

AnyCap 是一个面向 AI Agent 的 capability runtime。这个仓库当前以 `AnyCap Server` 为中心初始化产品级代码结构，同时放入最小可运行的 CLI 和 skill files 骨架，方便后续按阶段扩展到更多能力、分发渠道和管理界面。

## 目录结构

```text
.
├── cmd/                    # 所有可执行程序入口目录
│   ├── anycap/             # AnyCap CLI 二进制入口，面向 Agent 使用
│   └── anycap-server/      # AnyCap Server 二进制入口，负责启动 HTTP 服务
├── configs/                # 本地开发和示例配置目录
│   ├── cli/                # CLI 配置样例，例如 endpoint、输出格式
│   └── server/             # Server 环境变量样例，便于本地启动和部署对齐
├── deploy/                 # 部署资产目录
│   └── docker/             # Server 和 CLI 的 Dockerfile 放置位置
├── docs/                   # 产品、架构和实施文档总目录
│   └── plans/              # 设计方案和实施计划文档，记录阶段性决策
├── internal/               # 仓库私有实现目录，不对外暴露稳定 API
│   ├── app/                # Server 启动装配和依赖注入入口
│   ├── application/        # 用例编排层，承载具体业务流程
│   │   ├── image/          # 图片能力相关用例，例如模型发现和生成请求
│   │   ├── login/          # 登录链路相关用例，例如 login init
│   │   └── system/         # 系统状态和健康相关用例
│   ├── cli/                # CLI 的私有实现目录
│   │   ├── command/        # Cobra 命令树与命令分区装配位置
│   │   │   ├── cap/        # Cap 能力命令，例如 image、video、music
│   │   │   ├── infra/      # Infra 资源命令，例如 drive、browser、sandbox
│   │   │   ├── meta/       # 管理命令，例如 login、status、config、skill
│   │   │   └── extension/  # 动态扩展命令，例如 run
│   │   ├── config/         # CLI 配置解析与默认值处理
│   │   ├── httpclient/     # CLI 调用 AnyCap Server 的 HTTP 客户端封装
│   │   └── output/         # CLI 输出封装，例如 JSON-first stdout
│   ├── config/             # Server 配置加载逻辑
│   ├── domain/             # 领域层，放核心模型和接口定义
│   │   ├── model/          # 领域模型定义，例如 ServiceStatus、ImageModel
│   │   └── port/           # 领域端口接口，约束应用层和基础设施层的边界
│   ├── infrastructure/     # 外部系统适配器实现目录
│   │   ├── apikey/         # 预留 API Key 存储与认证适配器位置
│   │   ├── auth/           # 认证适配器位置，当前先放 stub
│   │   ├── credit/         # 预留 credit 查询与扣费适配器位置
│   │   ├── nexushub/       # NexusHub 适配器位置，当前先放 stub
│   │   └── ratelimit/      # 预留限流实现位置
│   ├── middleware/         # HTTP 横切逻辑，例如 request id、鉴权、限流、日志
│   └── transport/          # 对外传输层目录
│       └── http/           # HTTP 路由、handler、响应格式等协议适配逻辑
├── pkg/                    # 可被多个可执行程序稳定复用的小包目录
│   ├── api/                # 预留 server 和 CLI 共用的稳定公共 contract 类型
│   ├── buildinfo/          # 构建信息，例如版本号、commit、构建时间
│   └── version/            # 版本默认值和构建时注入常量
├── scripts/                # 开发和发布辅助脚本目录
│   ├── dev/                # 本地开发脚本，例如启动 server、执行 CLI
│   └── release/            # 发布构建脚本
├── skills/                 # AnyCap skill files 总目录
│   └── capabilities/       # 按能力拆分的 skill files，例如 image
├── test/                   # 仓库级测试和辅助验证目录
│   └── integration/        # 集成和 smoke 测试脚本位置
└── web/                    # 面向人类用户的 Web 产品目录
    ├── dashboard/          # Dashboard 功能模块目录，未来承载 billing、usage、log、control
    └── landing/            # Landing Page 功能模块目录，未来承载 anycap.ai 展示与安装引导
```

## Server 架构分层

- `internal/transport/http/`
  Server 的 HTTP 入口层，负责路由、请求解析和响应输出。
- `internal/middleware/`
  放 request id、鉴权、限流、日志等横切能力。当前先初始化了 `request_id`。
- `internal/application/`
  放用例编排。当前已初始化 `system`、`login`、`image` 三个最小服务。
- `internal/domain/`
  放领域模型和 ports 接口，避免业务逻辑直接依赖具体外部实现。
- `internal/infrastructure/`
  放具体适配器。当前 `auth/` 和 `nexushub/` 先用 stub 实现，`apikey/`、`credit/`、`ratelimit/` 先保留清晰边界。

## CLI 与 Skill 的关系

- CLI 是 Agent 的运行时入口，当前最小命令集包括 `login`、`status`、`image models`、`image generate`。
- CLI 目录现在按 `docs/cli-architecture.md` 的思路开始分区：`cap` 放能力命令，`meta` 放管理命令，`infra` 和 `extension` 先保留清晰占位，后续命令可以沿着这条线继续扩展。
- Skill files 是 Agent 的发现入口，用来告诉 Agent 如何安装、认证和调用能力。
- 当前仓库里的最小骨架已经能让 CLI 通过 HTTP 调用本地 AnyCap Server stub，形成一条从 skill 到 CLI 到 server 的最小闭环。

## 本地运行

启动 server：

```bash
go run ./cmd/anycap-server
```

查看状态：

```bash
go run ./cmd/anycap --endpoint http://127.0.0.1:8080 status
```

查看图片模型：

```bash
go run ./cmd/anycap --endpoint http://127.0.0.1:8080 image models
```

生成图片：

```bash
go run ./cmd/anycap --endpoint http://127.0.0.1:8080 image generate --prompt "paper crane"
```

也可以直接使用脚本：

```bash
scripts/dev/run-server.sh
scripts/dev/run-cli.sh status
```

## 后续扩展建议

- Phase 1 继续把 API key、限流、credit、NexusHub 真正接入到 `internal/infrastructure/`
- Phase 2 再逐步扩展 `video`、`music`、`tts`、`asr`、`search`、`crawl`
- 当 Dashboard 和 Landing Page 开始真正编码时，可以直接在 `web/dashboard` 和 `web/landing` 下落真实应用代码
