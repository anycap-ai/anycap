# AnyCap 登录流程梳理与清理计划

> Date: 2026-03-29
> Status: Draft
> Scope: 梳理当前仓库中的所有登录相关流程，识别现行主路径与历史遗留，为后续清理做准备
> Out of Scope: 本文不直接改代码；不处理兼容发布策略；不讨论上线迁移

## 1. 目标

当前仓库中的登录实现经历了多次改版，已经同时存在：

- Web 直接对接 Auth0 SDK 的新路径
- CLI 通过前端域名回调 + poll 获取 API Key 的路径
- 更早的 server-side OAuth code exchange / localhost callback / OAuth refresh 语义

本文目标：

1. 明确当前真正应该保留的 authoritative login flows
2. 标出高置信度遗留代码和文档
3. 给出清理顺序、依赖关系和确认项
4. 为后续代码清理提供单一参考文档

## 2. 当前 authoritative flows

基于当前代码实现，推荐视为 authoritative 的登录路径如下。

### 2.1 Web 登录

Web 已经直接使用 `@auth0/nextjs-auth0`：

- `/auth/login` 最终跳转到 `/api/auth/login`
- `/api/auth/callback` 由 Auth0 SDK 管理 session
- 前端业务请求通过 `getAccessToken()` 取 Auth0 access token
- 后端 middleware 对 JWT 做验签并映射本地用户

对应代码：

- `web/src/lib/auth/auth0.ts`
- `web/src/middleware.ts`
- `web/src/lib/api/hooks.ts`
- `internal/middleware/auth.go`
- `internal/infrastructure/auth/jwt_verifier.go`
- `internal/infrastructure/auth/identity_token_authenticator.go`

结论：

- Web 已不再依赖 server 做 OAuth callback exchange
- Web 当前不以 API Key 作为浏览器 session

### 2.2 CLI 默认浏览器登录: browser_poll

`anycap login` 的当前默认浏览器登录链路是：

1. CLI 调 `POST /v1/auth/login {method:"browser_poll"}`
2. Server 返回 `browser_url + login_session_id + poll_token`
3. CLI 打开前端 `/auth/cli-login`
4. 前端完成 Auth0 登录
5. 前端回调页调 `POST /v1/auth/browser-verify`
6. CLI 调 `POST /v1/auth/poll` 取最终 API Key

对应代码：

- `internal/cli/auth/auto.go`
- `internal/cli/auth/localhost.go` (实际内容已经是 browser poll flow)
- `web/src/app/auth/cli-login/`
- `web/src/app/auth/callback/CallbackClient.tsx`
- `internal/application/login/service.go` (`browser_poll`, `Poll`, `BrowserVerify`)

结论：

- CLI 默认浏览器登录已经不是 localhost callback
- `browser_poll` 是当前 CLI 交互式登录主路径

### 2.3 CLI headless 登录: device code + web verify

`anycap login --headless` 的当前链路是：

1. CLI 调 `POST /v1/auth/device-code`
2. Server 返回 `user_code + verification_uri + login_session_id`
3. 用户在 Web `/auth/device` 输入 code
4. Web 完成 Auth0 登录
5. 回调页调 `POST /v1/auth/device-verify`
6. CLI 调 `POST /v1/auth/device-poll` 获取最终 API Key

对应代码：

- `internal/cli/auth/device.go`
- `internal/cli/command/meta/login.go`
- `web/src/app/auth/device/`
- `web/src/app/auth/callback/CallbackClient.tsx`
- `internal/application/login/service.go` (`device`, `CheckDeviceCode`, `VerifyDeviceCode`, `Poll`)

结论：

- 当前 device flow 是 self-hosted code + Web Auth0 verify
- 当前 device flow 不依赖 Auth0 native device authorization grant

### 2.4 直接 API Key 登录

当前仍支持三种非 OAuth 登录入口：

- `anycap login --with-token`
- `anycap credentials set-key`
- `ANYCAP_API_KEY` 环境变量

对应代码：

- `internal/cli/command/meta/login.go`
- `internal/cli/command/meta/credential.go`
- `internal/cli/config/credential.go`

结论：

- 这部分应继续保留
- 这是 CI/CD 与非交互环境的必要入口

## 3. 当前明显的遗留实现

以下内容从当前代码调用关系看，已经不是 authoritative path。

### 3.1 Localhost callback 相关代码

遗留点：

- `LoginFlowLocalhost`
- `redirect_port`
- `LocalhostFlow()`
- `CanBindLocalPort()`
- server 端 `Init(method=localhost)` + `Callback(flow_type=localhost)`

现状判断：

- `AutoFlow()` 已经不再根据端口绑定决定 localhost callback
- `LocalhostFlow()` 只是 `BrowserPollFlow()` 的兼容 alias
- 非测试代码中没有真实 caller 继续走 localhost callback

对应代码：

- `internal/domain/model/login_session.go`
- `internal/transport/http/dto/login.go`
- `internal/application/login/service.go`
- `internal/cli/auth/localhost.go`

结论：

- 这是高置信度清理候选

### 3.2 Server-side Web callback exchange

遗留点：

- `LoginFlowWeb`
- `POST /v1/auth/callback`
- `Service.Callback()` 中的 `ExchangeCode()`

现状判断：

- 当前 Web 登录不调用 `POST /v1/auth/login {method:"web"}`
- 当前 Web callback 不调用 `POST /v1/auth/callback`
- 当前 Web 完全由 Auth0 SDK 管 session，再用 JWT 调后端

对应代码：

- `internal/application/login/service.go`
- `internal/transport/http/handlers/login.go`
- `internal/infrastructure/auth/auth0_client.go`

结论：

- 这是上一代 Web auth 方案遗留
- 如果确认最终架构就是 “Web 直连 Auth0，后端只验 JWT”，可以整体删除

### 3.3 browser-bind / browser-complete

遗留点：

- `POST /v1/auth/browser-bind`
- `POST /v1/auth/browser-complete`
- `Service.BrowserBind()`
- `Service.BrowserComplete()`

现状判断：

- 当前 CLI browser login 实际走的是：
  - `browser_poll` init
  - 前端 `/auth/cli-login`
  - 前端 callback 调 `browser-verify`
  - CLI `poll`
- 当前前端与 CLI 都没有非测试调用点使用 `browser-bind` / `browser-complete`

对应代码：

- `internal/application/login/service.go`
- `internal/transport/http/handlers/login.go`
- `internal/transport/http/dto/login.go`

结论：

- 这是高置信度死分支

### 3.4 Server root auth HTML 页面

遗留点：

- `GET /auth/device`
- `POST /auth/device`
- `GET /auth/callback`

现状判断：

- 当前仓库已经有完整的 Next.js 页面承接：
  - `/auth/device`
  - `/auth/login`
  - `/auth/callback`
  - `/auth/cli-login`
- server root routes 仍输出内联 HTML，并继续走旧的 server-side Auth0 逻辑

对应代码：

- `internal/transport/http/handlers/login.go`
- `web/src/app/auth/`

结论：

- 如果最终浏览器入口统一交给 `web/`，server 这组 root routes 可以删
- 删除前只需要确认部署上不会继续把 CLI 用户导向 server 自己的 `/auth/device`

### 3.5 CLI OAuth credential / refresh 语义

遗留点：

- `CredentialTypeOAuth`
- `refresh_token`
- `expires_at`
- `httpclient.refreshToken()`
- `/v1/auth/refresh` 协议
- token parser 中对 OAuth response shape 的兼容

现状判断：

- 当前 CLI 最终拿到的是 AnyCap API Key，不是 OAuth credential
- 正式 server 路由没有公开 `/v1/auth/refresh`
- `/v1/auth/refresh` 只存在于 CLI mock server 与测试中

对应代码：

- `internal/cli/config/credential.go`
- `internal/cli/httpclient/client.go`
- `internal/cli/auth/token.go`
- `internal/cli/testutil/mockserver/server.go`

结论：

- 这是高置信度遗留
- 清理后 CLI credential model 可以简化成 API Key-only

### 3.6 Auth0 native device grant 接口

遗留点：

- `Auth0Client.StartDeviceFlow()`
- `Auth0Client.PollDeviceFlow()`
- 对应 stub 与 real client 实现

现状判断：

- 当前 device flow 已经是 self-hosted user code
- 这些接口不在当前主链路调用图上

对应代码：

- `internal/domain/port/auth.go`
- `internal/infrastructure/auth/auth0_client.go`
- `internal/infrastructure/auth/stub.go`

结论：

- 可以和旧 device flow 语义一起删除

### 3.7 文档、mock server、静态页面残留

遗留点：

- CLI spec 与 skill 文档仍描述 localhost callback / 旧 `/v1/login/*` 时代
- `cmd/anycap-mock` 说明文字仍以 localhost callback 为默认路径
- `web/auth0-login-page.html` 看起来没有被当前代码引用

结论：

- 这些内容会持续制造认知噪音
- 应作为清理范围的一部分统一处理

## 4. 当前建议保留的能力边界

后续清理应以以下最小集合为目标：

1. Web: Auth0 SDK session + JWT 调后端
2. Server auth middleware: API Key + JWT 双鉴权
3. CLI: `browser_poll`
4. CLI: `device code`
5. CLI: direct API key login
6. Server: API Key issue / revoke
7. Server: login session repo 与 `pending/authorized/complete/expired/slow_down` 状态机

## 5. 建议的清理顺序

### Phase A: 先冻结 authoritative architecture

输出一版统一结论文档：

- Web 不再使用 server-side OAuth callback exchange
- CLI 默认浏览器登录统一使用 `browser_poll`
- device flow 统一使用 self-hosted code + Web verify
- CLI credential 统一使用 API Key

产出：

- 更新 docs/spec
- 更新 skill reference
- 更新 mock server usage 文案

### Phase B: 删除无调用的 server auth 分支

优先删除：

- `browser-bind`
- `browser-complete`
- `LoginFlowWeb`
- `Callback()`
- root `/auth/device` + `/auth/callback` HTML 页面

预期收益：

- login service 只保留 session 编排与 API Key issue
- server 登录域模型显著收敛

### Phase C: 删除 localhost callback 与 OAuth credential 语义

删除：

- `LoginFlowLocalhost`
- `redirect_port`
- `LocalhostFlow()`
- `CanBindLocalPort()`
- OAuth credential / refresh 逻辑
- `/v1/auth/refresh` 相关测试协议

预期收益：

- CLI auth 模型改为 API Key-only
- CLI http client 去掉 refresh retry 分支
- mock server 和测试契约更简单

### Phase D: 收口配置与依赖

如果 Phase B/C 完成，则进一步评估：

- server 是否还需要 `Auth0Client` 的 `ExchangeCode()`
- server 是否还需要 `ANYCAP_AUTH0_CLIENT_SECRET`
- server 配置是否只保留 JWT verify 所需信息

这一步需要结合最终部署方案确认。

## 6. 暂不建议直接删除的点

### 6.1 `/v1/auth/exchange`

当前没有现行调用方，但它与“Web 已登录后显式签发一个 CLI/API key”的能力方向是一致的。

建议：

- 如果 dashboard 短期会做 “Generate API Key / CLI token” 功能，则保留
- 如果近期没有明确消费者，则也可以删掉，后续需要时再按新模型重建

### 6.2 现有 login session 持久化结构

虽然字段偏多，但在清理掉旧 flow 之前，不建议先动 migration/DB schema。先删流程，再收 schema，风险更小。

## 7. 已识别的实现风险

### 7.1 Poll 在 completed 状态下会重复签发 API Key

当前 `Poll()` 在 `authorized` 和 `completed` 两种状态下都会继续走 `issueDeviceCredential()`，后者会再次创建 API Key。

影响：

- 同一 login session 被重复 poll 时，理论上可能重复发 key

这不影响本文对“遗留代码”的判断，但属于后续清理或重构时必须一起修正的登录状态机问题。

## 8. 清理前确认项

开始删代码前，需要先确认以下事实：

1. CLI 返回给用户的 `browser_url` / `verification_uri` 最终一定指向 `web/` 域名，而不是 server root `/auth/*`
2. 当前没有计划保留 localhost callback 作为开发专用路径
3. 当前没有任何已发布客户端依赖 OAuth credential / refresh token 语义
4. `/v1/auth/exchange` 是否有明确近期开关或 dashboard 需求
5. Auth0 server-side client secret 是否还需要被后端保留

## 9. 成功标准

当后续清理完成时，应满足：

1. 登录流程在代码层只剩一套清晰模型：
   - Web JWT
   - CLI browser_poll
   - CLI device code
   - direct API key
2. CLI credential model 不再混入 OAuth refresh 语义
3. server login service 不再承担历史的 callback exchange 分支
4. docs/spec/skill/mock server 文案与真实实现一致
5. 新同学只读一遍 auth 相关代码，即可建立正确心智模型

