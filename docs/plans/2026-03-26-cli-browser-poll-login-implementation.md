# AnyCap CLI Browser Poll Login Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将 `anycap login` 的默认浏览器登录从 localhost callback 切换为前端域名回调 + CLI 轮询取 API key 的 `browser_poll` 流。

**Architecture:** CLI 只与 AnyCap Server 通信。前端负责承接 Auth0 浏览器回调并通知 Server 完成登录会话授权。Server 统一维护 `login_session` 状态机，并在 CLI poll 时签发最终 API key。`browser_poll` 与现有 `device` flow 共享 `pending/authorized/complete/expired/slow_down` 语义。

**Tech Stack:** Go 1.24, Hertz, Next.js App Router, PostgreSQL, Auth0 HTTP API, httptest, go test

---

**Design References:**
- `docs/plans/2026-03-26-cli-browser-poll-login-design.md`
- `docs/plans/2026-03-26-headless-login-relay-design.md`
- `docs/cli/spec/oauth.md`

### Task 1: 扩展登录会话模型以支持 browser_poll

**Files:**
- Modify: `internal/domain/model/login_session.go`
- Modify: `internal/domain/port/login_session.go`
- Modify: `internal/infrastructure/apikey/login_session_repo.go`
- Modify: `internal/infrastructure/apikey/login_session_memory_repo.go`
- Modify: `internal/infrastructure/apikey/login_session_repo_test.go`
- Modify: `internal/infrastructure/apikey/migrations/0004_login_sessions.sql`

**Step 1: 写失败测试**

- 为仓储补 `browser_poll` session 的 round-trip 测试
- 覆盖 `browser_token` 查询
- 覆盖 `poll_token` 校验所需字段持久化

**Step 2: 运行测试确认失败**

Run: `/usr/local/go/bin/go test ./internal/infrastructure/apikey -run TestLoginSessionRepo -v`
Expected: FAIL

**Step 3: 实现最小数据模型**

- 新增 `LoginFlowBrowserPoll`
- 在 `login_session` 中增加 `browser_token` 与 `poll_token` 或 `poll_token_hash`
- 在 repo 增加按 `browser_token` 查询能力

**Step 4: 运行测试确认通过**

Run: `/usr/local/go/bin/go test ./internal/infrastructure/apikey -run TestLoginSessionRepo -v`
Expected: PASS

**Step 5: Commit**

```bash
git add internal/domain/model/login_session.go internal/domain/port/login_session.go internal/infrastructure/apikey
git commit -m "feat: extend login session model for browser poll flow"
```

### Task 2: 在 login application 中新增 browser_poll use case

**Files:**
- Modify: `internal/application/login/service.go`
- Modify: `internal/application/login/service_test.go`

**Step 1: 写失败测试**

- `Init(browser_poll)` 返回 `browser_url + poll_token + interval`
- `BrowserBind` 通过 `browser_token` 返回 Auth0 `authorize_url`
- `BrowserComplete` 成功后只标记 `authorized`
- `Poll` 支持 `browser_poll`
- `Poll` 在 `authorized` 状态下签发 API key

**Step 2: 运行测试确认失败**

Run: `/usr/local/go/bin/go test ./internal/application/login -v`
Expected: FAIL

**Step 3: 实现最小业务逻辑**

- 在 `Init` 中新增 `browser_poll`
- 生成 `browser_token` 和 `poll_token`
- 生成前端 `browser_url`
- 新增 `BrowserBind`
- 新增 `BrowserComplete`
- 将现有 `Poll` 从“device only”扩展到 “device + browser_poll”

**Step 4: 运行测试确认通过**

Run: `/usr/local/go/bin/go test ./internal/application/login -v`
Expected: PASS

**Step 5: Commit**

```bash
git add internal/application/login
git commit -m "feat: add browser poll login use cases"
```

### Task 3: 扩展 HTTP DTO 与 handler

**Files:**
- Modify: `internal/transport/http/dto/login.go`
- Modify: `internal/transport/http/handlers/login.go`
- Modify: `internal/transport/http/router_test.go`

**Step 1: 写失败测试**

- `POST /v1/auth/login` with `method=browser_poll`
- `POST /v1/auth/browser-bind`
- `POST /v1/auth/browser-complete`
- `POST /v1/auth/poll`
- 兼容 `POST /v1/auth/device-poll`

**Step 2: 运行测试确认失败**

Run: `/usr/local/go/bin/go test ./internal/transport/http -run 'TestRouter_.*Login|TestRouter_.*Poll' -v`
Expected: FAIL

**Step 3: 实现协议层**

- 增加 `browser_bind` / `browser_complete` 的 DTO
- 增加新的 handler
- 暴露 `/v1/auth/poll`
- 让旧 `device-poll` 继续映射到兼容逻辑

**Step 4: 运行测试确认通过**

Run: `/usr/local/go/bin/go test ./internal/transport/http -run 'TestRouter_.*Login|TestRouter_.*Poll' -v`
Expected: PASS

**Step 5: Commit**

```bash
git add internal/transport/http
git commit -m "feat: expose browser poll login http endpoints"
```

### Task 4: 调整前端 auth/login 路由支持 CLI 模式

**Files:**
- Modify: `web/src/app/auth/login/route.ts`
- Modify: `web/src/lib/auth/session.ts`

**Step 1: 写失败测试或验证用例**

- 明确 CLI 模式输入：`browser_token`
- 确认 CLI 模式下不走现有 dashboard login init
- 确认会设置独立的 CLI login cookie / state

**Step 2: 运行相关测试或最小静态检查**

Run: `pnpm --dir web test`
Expected: FAIL if tests exist, otherwise document manual verification path

**Step 3: 实现最小前端入口**

- 在 `/auth/login` 识别 CLI 登录参数
- 调 `POST /v1/auth/browser-bind`
- 将必要信息写入 cookie
- 302 跳转到 Auth0 `authorize_url`

**Step 4: 运行测试或静态检查**

Run: `pnpm --dir web test`
Expected: PASS or no relevant tests

**Step 5: Commit**

```bash
git add web/src/app/auth/login/route.ts web/src/lib/auth/session.ts
git commit -m "feat: support cli browser poll login entry in web auth route"
```

### Task 5: 调整前端 auth/callback 路由支持 CLI browser_complete

**Files:**
- Modify: `web/src/app/auth/callback/route.ts`
- Modify: `web/src/lib/auth/session.ts`

**Step 1: 写失败测试或验证用例**

- CLI 模式下 callback 应调用 `browser-complete`
- CLI 模式下 callback 不应直接消费最终 `api_key`
- 完成后应显示“返回终端”语义页面

**Step 2: 运行相关测试或最小静态检查**

Run: `pnpm --dir web test`
Expected: FAIL if tests exist, otherwise document manual verification path

**Step 3: 实现最小 CLI callback 分支**

- 读取 CLI login cookie
- 调用 `POST /v1/auth/browser-complete`
- 清理 CLI login cookie
- 重定向到一个适合 CLI 的完成页面，而不是 dashboard

**Step 4: 运行测试或静态检查**

Run: `pnpm --dir web test`
Expected: PASS or no relevant tests

**Step 5: Commit**

```bash
git add web/src/app/auth/callback/route.ts web/src/lib/auth/session.ts
git commit -m "feat: complete cli browser poll login in auth callback"
```

### Task 6: 将 CLI 默认浏览器登录切换到 browser_poll

**Files:**
- Modify: `internal/cli/auth/auto.go`
- Modify: `internal/cli/auth/localhost.go`
- Modify: `internal/cli/command/meta/login.go`
- Modify: `internal/cli/command/login_test.go`
- Modify: `internal/cli/testutil/mockserver/server.go`

**Step 1: 写失败测试**

- `login` 默认流不再绑定 localhost 端口
- `login` 能打开 `browser_url`
- `login` 能通过 poll 拿到 API key
- 浏览器打开失败时会打印手动访问 URL

**Step 2: 运行测试确认失败**

Run: `/usr/local/go/bin/go test ./internal/cli/... -run 'TestLogin|TestAutoFlow' -v`
Expected: FAIL

**Step 3: 实现最小 CLI 调整**

- 用 `browser_poll` 替换默认 localhost 浏览器流
- 保留 `--headless` 走现有 device
- 可以暂时保留旧 `localhost.go` 作为兼容代码，不作为默认路径

**Step 4: 运行测试确认通过**

Run: `/usr/local/go/bin/go test ./internal/cli/... -run 'TestLogin|TestAutoFlow' -v`
Expected: PASS

**Step 5: Commit**

```bash
git add internal/cli internal/cli/testutil/mockserver/server.go
git commit -m "feat: switch cli default browser login to browser poll flow"
```

### Task 7: 更新协议文档与登录说明

**Files:**
- Modify: `docs/cli/spec/oauth.md`
- Modify: `skills/anycap-cli/SKILL.md`
- Modify: `skills/anycap-cli/references/cli-reference.md`
- Modify: `docs/plans/2026-03-26-auth0-google-cli-login-checklist.md`

**Step 1: 写文档差异清单**

- 标出 localhost callback 不再是默认 authoritative path
- 标出 `browser_poll` 是默认 browser login
- 标出 `headless` 与 `browser_poll` 的关系

**Step 2: 更新文档**

- 更新 OAuth spec
- 更新 CLI skill login 描述
- 更新 Auth0 checklist 中 callback 说明

**Step 3: 自检文档一致性**

- 确认没有把 localhost callback 继续写成默认行为
- 确认 callback URL 描述与前端域名一致

**Step 4: Commit**

```bash
git add docs/cli/spec/oauth.md skills/anycap-cli docs/plans/2026-03-26-auth0-google-cli-login-checklist.md
git commit -m "docs: describe browser poll based cli login flow"
```

### Task 8: 端到端验证与回归检查

**Files:**
- Test/Reference: `internal/application/login/service_test.go`
- Test/Reference: `internal/transport/http/router_test.go`
- Test/Reference: `internal/cli/command/login_test.go`
- Test/Reference: `web/src/app/auth/login/route.ts`
- Test/Reference: `web/src/app/auth/callback/route.ts`

**Step 1: 跑 Go 相关测试**

Run: `/usr/local/go/bin/go test ./internal/application/login ./internal/transport/http ./internal/cli/...`
Expected: PASS

**Step 2: 跑前端相关测试或最小检查**

Run: `pnpm --dir web test`
Expected: PASS or document no test coverage

**Step 3: 做手工验证**

- 启动本地 server + web
- 执行 `anycap login`
- 确认浏览器访问的是前端域名登录页
- 确认 Auth0 `redirect_uri` 是前端真实域名
- 确认不再出现 consent 页面
- 确认 CLI 最终拿到 `api_key`

**Step 4: 记录剩余风险**

- localhost 兼容路径仍存在但非默认
- poll token 仍为明文存储时的后续收敛项
- Web / CLI cookie 隔离是否还需更严格命名

**Step 5: Commit**

```bash
git add .
git commit -m "test: verify browser poll login flow end to end"
```
