# AnyCap Auth BFF MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为 AnyCap 落地“Server 编排 Auth0 登录并向 CLI 签发 API Key”的 MVP 认证链路，覆盖 localhost callback 与 device flow 两种登录方式。

**Architecture:** CLI 只与 AnyCap Server 通信。Server 负责登录会话管理、Auth0 交互、本地用户落库与 API Key 签发。CLI 登录成功后只保存 API Key 到本地凭据文件，后续所有业务请求统一使用 API Key。

**Tech Stack:** Go 1.24, Hertz, PostgreSQL, Redis, Auth0 HTTP API, testing, httptest

---

**Design References:**
- `docs/plans/2026-03-25-anycap-auth-bff-design.md`
- `docs/plans/2026-03-24-anycap-server-mvp-design.md`
- `docs/cli/spec/oauth.md`

### Task 1: 对齐 CLI/Server 认证契约

**Files:**
- Modify: `docs/cli/spec/oauth.md`
- Modify: `docs/plans/2026-03-25-anycap-mvp-gap-review.md`
- Test/Reference: `internal/cli/testutil/mockserver/server.go`

**Step 1: 写文档差异清单**

- 标出旧 OAuth token 返回模型与新 API Key 返回模型的差异
- 明确 `auth/refresh` 不在 MVP 范围内
- 明确 `device flow` 使用 `poll` 而不是 `callback`

**Step 2: 更新文档**

- 在 `oauth.md` 顶部加入 MVP authoritative note
- 将 CLI 登录成功产物改为 API Key
- 标注 `refresh` 为 Phase 2 或 future work

**Step 3: 复查 mockserver 契约**

- 确认后续测试替换点：
  - `/v1/auth/callback`
  - `/v1/auth/device-poll`
  - 返回 `api_key`

**Step 4: Commit**

```bash
git add docs/cli/spec/oauth.md docs/plans/2026-03-25-anycap-mvp-gap-review.md
git commit -m "docs: align auth spec with api key based login mvp"
```

### Task 2: 设计并落地登录会话模型

**Files:**
- Create: `internal/domain/model/login_session.go`
- Create: `internal/domain/port/login_session.go`
- Create: `internal/infrastructure/apikey/login_session_repo.go`
- Create: `internal/infrastructure/apikey/migrations/0004_login_sessions.sql`
- Test: `internal/infrastructure/apikey/login_session_repo_test.go`

**Step 1: 写失败测试**

- `CreateSession`
- `GetByID`
- `GetByState`
- `MarkAuthorized`
- `MarkCompleted`
- 过期状态判断

**Step 2: 运行测试确认失败**

Run: `go test ./internal/infrastructure/apikey -run TestLoginSessionRepo -v`
Expected: FAIL

**Step 3: 实现最小仓储**

- 表结构支持 `localhost` / `device`
- 存 `state`、`code_verifier`、`redirect_uri`、`user_code`
- 状态机：`pending -> authorized -> completed`

**Step 4: 运行测试确认通过**

Run: `go test ./internal/infrastructure/apikey -run TestLoginSessionRepo -v`
Expected: PASS

**Step 5: Commit**

```bash
git add internal/domain/model/login_session.go internal/domain/port/login_session.go internal/infrastructure/apikey
git commit -m "feat: add login session persistence for auth flows"
```

### Task 3: 扩展 Auth0 adapter

**Files:**
- Modify: `internal/domain/port/auth.go`
- Create: `internal/infrastructure/auth/auth0_client.go`
- Create: `internal/infrastructure/auth/auth0_client_test.go`
- Modify: `internal/config/config.go`

**Step 1: 写失败测试**

- `BuildAuthorizeURL`
- `ExchangeCode`
- `GetUserProfile`

**Step 2: 运行测试确认失败**

Run: `go test ./internal/infrastructure/auth -run TestAuth0Client -v`
Expected: FAIL

**Step 3: 实现最小 Auth0 client**

- 构造 authorize URL
- code exchange
- userinfo / profile 获取
- 支持 stub 与 real adapter 切换

**Step 4: 运行测试确认通过**

Run: `go test ./internal/infrastructure/auth -run TestAuth0Client -v`
Expected: PASS

**Step 5: Commit**

```bash
git add internal/domain/port/auth.go internal/infrastructure/auth internal/config/config.go
git commit -m "feat: add auth0 adapter for login orchestration"
```

### Task 4: 重写 login application 用例

**Files:**
- Modify: `internal/application/login/service.go`
- Create: `internal/application/login/service_test.go`
- Modify: `internal/domain/model/system.go`

**Step 1: 写失败测试**

- localhost `Init` 返回 `authorize_url + login_session_id`
- `Callback` 成功后创建或复用用户并返回 API Key
- 重复 `Callback` 幂等
- device `Init` 返回 `user_code`
- `Poll` 在 `pending/complete/expired` 下行为正确

**Step 2: 运行测试确认失败**

Run: `go test ./internal/application/login -v`
Expected: FAIL

**Step 3: 实现最小业务逻辑**

- `Init(method, redirect_port)`
- `Callback(login_session_id, code, state, redirect_uri)`
- `Poll(login_session_id)`
- 用户不存在时用 Auth0 `sub/email/name/picture` 建档
- 成功后调用 API key service 生成 key

**Step 4: 运行测试确认通过**

Run: `go test ./internal/application/login -v`
Expected: PASS

**Step 5: Commit**

```bash
git add internal/application/login internal/domain/model/system.go
git commit -m "feat: implement login use cases for localhost and device flows"
```

### Task 5: 扩展 HTTP DTO、handler 与路由

**Files:**
- Modify: `internal/transport/http/dto/login.go`
- Modify: `internal/transport/http/handlers/login.go`
- Modify: `internal/transport/http/router.go`
- Modify: `internal/transport/http/router_test.go`

**Step 1: 写失败测试**

- `POST /v1/login/init`
- `POST /v1/login/callback`
- `POST /v1/login/poll`
- `/v1/auth/login`
- `/v1/auth/callback`
- `/v1/auth/device-code`
- `/v1/auth/device-poll`

**Step 2: 运行测试确认失败**

Run: `go test ./internal/transport/http -run TestAuthRoutes -v`
Expected: FAIL

**Step 3: 实现协议层**

- DTO 对齐 API Key 返回模型
- 新增 `poll` handler
- 保留旧路径兼容
- `auth/*` 路径映射到新 use case

**Step 4: 运行测试确认通过**

Run: `go test ./internal/transport/http -run TestAuthRoutes -v`
Expected: PASS

**Step 5: Commit**

```bash
git add internal/transport/http
git commit -m "feat: expose api key based login http endpoints"
```

### Task 6: CLI 登录流切回 API Key 模型

**Files:**
- Modify: `internal/cli/auth/localhost.go`
- Modify: `internal/cli/auth/device.go`
- Modify: `internal/cli/httpclient/client.go`
- Modify: `internal/cli/config/credential.go`
- Modify: `internal/cli/command/meta/login.go`
- Test: `internal/cli/command/login_test.go`
- Test: `internal/cli/testutil/mockserver/server.go`

**Step 1: 写失败测试**

- `anycap login` 保存 API Key
- `anycap login --headless` 保存 API Key
- `credentials show` 显示 `api_key`
- 登录后 `status` 自动带 API Key

**Step 2: 运行测试确认失败**

Run: `go test ./internal/cli/... -run 'TestLogin|TestCredential' -v`
Expected: FAIL

**Step 3: 实现最小 CLI 适配**

- localhost callback 完成后解析 `api_key`
- device poll 完成后解析 `api_key`
- MVP 中停用 OAuth refresh 逻辑
- 本地凭据默认保存为 `api_key` 类型

**Step 4: 运行测试确认通过**

Run: `go test ./internal/cli/... -run 'TestLogin|TestCredential' -v`
Expected: PASS

**Step 5: Commit**

```bash
git add internal/cli
git commit -m "feat: store api key after cli login flows"
```

### Task 7: Bootstrap 装配真实 Auth0 路线

**Files:**
- Modify: `internal/app/bootstrap.go`
- Modify: `cmd/anycap-server/main.go`
- Modify: `internal/app/bootstrap_test.go`

**Step 1: 写失败测试**

- `dev/prod` 模式在启用 Auth0 时注入 real auth client
- `stub` 模式仍注入 stub

**Step 2: 运行测试确认失败**

Run: `go test ./internal/app -run TestBuildServerDependencies -v`
Expected: FAIL

**Step 3: 实现装配**

- `cfg.Auth0Enabled` 控制 real/stub
- 注入 login session repo
- 将 login use case 接入 PG repo 和 API key service

**Step 4: 运行测试确认通过**

Run: `go test ./internal/app -run TestBuildServerDependencies -v`
Expected: PASS

**Step 5: Commit**

```bash
git add internal/app cmd/anycap-server/main.go
git commit -m "feat: wire auth bff dependencies in bootstrap"
```

### Task 8: 增加最小端到端验证

**Files:**
- Modify: `test/integration/` 下新增或扩展认证 smoke test
- Modify: `configs/server/dev.env.example`
- Create: `docs/server-auth-mvp-local-run.md`

**Step 1: 写 smoke 测试或脚本**

- login init
- callback/poll
- status
- image models

**Step 2: 运行最小验证**

Run: `go test ./test/integration/... -v`
Expected: PASS or clear environment-gated skip

**Step 3: 补本地联调文档**

- 需要哪些 Auth0 env
- 如何跑 localhost callback
- 如何跑 device flow

**Step 4: Commit**

```bash
git add test/integration configs/server/dev.env.example docs/server-auth-mvp-local-run.md
git commit -m "docs: add auth mvp smoke verification and local run guide"
```

### Task 9: 收尾与回归

**Files:**
- Review: `internal/cli/**`
- Review: `internal/application/login/**`
- Review: `internal/transport/http/**`

**Step 1: 跑关键测试**

Run:

```bash
GOCACHE=$(pwd)/.gocache go test ./internal/application/login ./internal/transport/http ./internal/cli/... ./internal/app -v
```

Expected: PASS

**Step 2: 跑 server 相关回归**

Run:

```bash
GOCACHE=$(pwd)/.gocache go test ./cmd/anycap-server ./internal/app ./internal/application/... ./internal/config ./internal/domain/... ./internal/infrastructure/... ./internal/middleware ./internal/transport/http/... -v
```

Expected: PASS

**Step 3: 手工验证**

- `anycap login`
- `anycap status`
- `anycap image models`

**Step 4: Commit**

```bash
git add .
git commit -m "feat: complete auth bff mvp flow"
```
