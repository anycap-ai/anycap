# AnyCap Product Structure Initialization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 以完整 AnyCap 产品视角初始化仓库目录，落地最小可运行的 server、CLI 和 skill files 骨架，并在 README 中解释目录架构与使用方式。

**Architecture:** 根目录采用产品级组织方式：`cmd` 承载可执行入口，`internal` 承载 AnyCap Server 与 CLI 的私有实现，`pkg` 只放稳定共享代码，`skills/configs/scripts/deploy/test` 承载分发与运行辅助资产。Server 继续遵循 Go 的分层模块化单体模式，CLI 作为独立可执行入口复用共享构建信息并通过 HTTP 调用 Server。

**Tech Stack:** Go 1.24, Hertz, Cobra, `testing`, `httptest`

---

**Design References:**
- `docs/anycap-vision.md`
- `docs/system-architecture.md`
- `docs/cli-architecture.md`
- `docs/plans/2026-03-24-anycap-server-mvp-design.md`

### Task 1: 对齐产品级根目录与 server 入口

**Files:**
- Create: `cmd/anycap-server/main.go`
- Modify: `internal/app/bootstrap.go`
- Modify: `internal/config/config.go`
- Create: `internal/transport/http/router_test.go`

**Step 1: Write the failing test**

为 `/ping`、`/healthz`、`/v1/status` 写 HTTP 合约测试，确认新入口和新目录下的路由行为。

**Step 2: Run test to verify it fails**

Run: `go test ./internal/transport/http -run TestRouter -v`
Expected: FAIL

**Step 3: Write minimal implementation**

- 将现有 server 启动入口迁移到 `cmd/anycap-server`
- 新建 `bootstrap` 装配函数
- 将 HTTP 路由迁移到 `internal/transport/http`

**Step 4: Run test to verify it passes**

Run: `go test ./internal/transport/http -run TestRouter -v`
Expected: PASS

### Task 2: 初始化最小可运行的 CLI 骨架

**Files:**
- Create: `cmd/anycap/main.go`
- Create: `internal/cli/command/root.go`
- Create: `internal/cli/command/root_test.go`
- Create: `internal/cli/config/config.go`
- Create: `internal/cli/httpclient/client.go`

**Step 1: Write the failing test**

为 `anycap --help`、`anycap status` 和 `anycap image models` 写最小 CLI 测试。

**Step 2: Run test to verify it fails**

Run: `go test ./internal/cli/... -v`
Expected: FAIL

**Step 3: Write minimal implementation**

- 使用 Cobra 初始化 CLI
- 提供 `login`、`status`、`image generate`、`image models`
- 支持通过 flag/env 指定 server endpoint

**Step 4: Run test to verify it passes**

Run: `go test ./internal/cli/... -v`
Expected: PASS

### Task 3: 初始化最小 application/domain/infrastructure 骨架

**Files:**
- Create: `internal/application/system/service.go`
- Create: `internal/application/image/service.go`
- Create: `internal/application/login/service.go`
- Create: `internal/domain/model/*.go`
- Create: `internal/domain/port/*.go`
- Create: `internal/infrastructure/auth/stub.go`
- Create: `internal/infrastructure/nexushub/stub.go`

**Step 1: Write the failing test**

为 image models、image generate、login init 的应用服务写最小行为测试。

**Step 2: Run test to verify it fails**

Run: `go test ./internal/application/... -v`
Expected: FAIL

**Step 3: Write minimal implementation**

- 定义最小领域模型和端口
- 提供 stub infra 以支撑 CLI/Server 冒烟联通

**Step 4: Run test to verify it passes**

Run: `go test ./internal/application/... -v`
Expected: PASS

### Task 4: 初始化产品级目录与分发资产

**Files:**
- Create: `skills/anycap.skill`
- Create: `skills/capabilities/anycap-image.skill`
- Create: `configs/server/local.env.example`
- Create: `configs/cli/config.example.json`
- Create: `scripts/dev/run-server.sh`
- Create: `scripts/dev/run-cli.sh`
- Create: `scripts/release/build.sh`
- Create: `deploy/docker/Dockerfile.server`
- Create: `deploy/docker/Dockerfile.cli`
- Create: `test/integration/smoke_test.sh`

**Step 1: Write the failing test**

为关键脚本和 skill 文件路径存在性写一个轻量结构测试。

**Step 2: Run test to verify it fails**

Run: `go test ./test/... -v`
Expected: FAIL

**Step 3: Write minimal implementation**

- 补齐目录和最小内容
- 保持 assets 可运行、可读、可扩展

**Step 4: Run test to verify it passes**

Run: `go test ./test/... -v`
Expected: PASS

### Task 5: 写 README 并验证仓库可用

**Files:**
- Create: `README.md`

**Step 1: Write the failing test**

增加一个 README 结构检查，确保包含目录说明、运行命令、扩展边界。

**Step 2: Run test to verify it fails**

Run: `go test ./test/... -run TestRepositoryDocs -v`
Expected: FAIL

**Step 3: Write minimal implementation**

- 解释根目录职责
- 解释 server/cli/skills 关系
- 给出本地运行与构建命令

**Step 4: Run test to verify it passes**

Run: `go test ./... -v`
Expected: PASS
