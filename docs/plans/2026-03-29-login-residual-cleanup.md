# 登录遗留代码二次清理

> Date: 2026-03-29
> Status: Draft
> Scope: 清理上一轮 login-flow-review-and-cleanup 执行后仍残留的死代码、废弃接口和过时文档
> Prerequisite: 2026-03-29-login-flow-review-and-cleanup-plan.md 已执行完毕

## 1. 背景

上一轮清理已经移除了 `LoginFlowLocalhost`、`LoginFlowWeb`、`BrowserBind`/`BrowserComplete`、`CredentialTypeOAuth`/`refresh_token`、`StartDeviceFlow`/`PollDeviceFlow` 等大块遗留。

本轮目标是清理上一轮遗漏的、粒度更细的残留。

## 2. 待清理项

### 2.1 `port.Auth0Client` 整条依赖链

当前 `Auth0Client` 接口只剩一个方法 `BuildLoginURL`，而 `BuildLoginURL` **无任何生产 caller**。从接口到实现到消费方，整条链都是死的：

| 层 | 内容 | 文件 |
|----|------|------|
| Port 接口 | `Auth0Client` 接口定义 | `internal/domain/port/auth.go:9-11` |
| Real 实现 | `Client.BuildLoginURL()` | `internal/infrastructure/auth/auth0_client.go:35-53` |
| Real 辅助函数 | `resolveRedirectURI()` (仅被 `BuildLoginURL` 调用) | `internal/infrastructure/auth/auth0_client.go:77-82` |
| Stub 实现 | `StubClient.BuildLoginURL()` | `internal/infrastructure/auth/stub.go:24-38` |
| Stub 构造 | `NewStubClient()` 的 `users` 参数（`_ = users` 直接丢弃） | `internal/infrastructure/auth/stub.go:14` |
| Service 字段 | `authClient port.Auth0Client` 存储但从未调用 | `internal/application/login/service.go:18,35,73` |
| Bootstrap | `buildAuthClient()` 构造了一个无人使用的 client | `internal/app/bootstrap.go:369-382` |
| Config | `Auth0ClientID` 仅被 `buildAuthClient()` 消费 | `internal/config/config.go:62` |
| Config | `Auth0ClientSecret` 仅被 `buildAuthClient()` 消费 | `internal/config/config.go:63` |

不能删的：
- `Auth0Issuer` / `Auth0Audience` — 被 `buildIdentityTokenAuthenticator()` (JWT 验签) 使用
- `Auth0Enabled` — 被 `buildServerFeatures()` 和 `buildIdentityTokenAuthenticator()` 使用
- `Auth0RedirectURL` — 被 `buildDeviceVerificationURL()` 和 `buildCORSAllowedOrigins()` 使用

### 2.2 `LoginSessionRepo` 废弃接口方法

| 方法 | 现状 | 遗留原因 |
|------|------|----------|
| `GetByState()` | service.go 无 caller | 旧 server-side OAuth callback 用 state 查 session |
| `MarkAuthorized()` | service.go 无 caller，当前用 `MarkVerified()` | 旧的状态转换方法，`MarkVerified` 已替代 |

受影响的实现：
- `internal/domain/port/login_session.go:13,16`
- `internal/infrastructure/loginsession/repo.go:61-86` (`GetByState`)、`repo.go:142-149` (`MarkAuthorized`)
- `internal/infrastructure/loginsession/memory_repo.go:35-44` (`GetByState`)、`memory_repo.go:68-79` (`MarkAuthorized`)
- `internal/application/login/service_test.go` 中 fakeLoginSessionRepo 对应方法

### 2.3 `LoginSession` model 死字段

| 字段 | 现状 |
|------|------|
| `CodeVerifier` | service.go 从未赋值或读取 |
| `RedirectURI` | service.go 从未赋值或读取 |
| `DeviceCode` | service.go 从未赋值或读取 |

这三个字段只在 DB repo 层做了持久化映射（`repo.go` 的 INSERT/SELECT），但业务层完全不使用。

注意：删除 model 字段后需要同步修改：
- `internal/infrastructure/loginsession/repo.go` — INSERT 语句和 SELECT/Scan 列
- `internal/infrastructure/loginsession/memory_repo.go` — 无需改（内存 repo 不显式引用这些字段）
- DB schema 列暂不删，保留向后兼容（INSERT 传 NULL 即可）

### 2.4 `docs/cli/spec/oauth.md` 过时

整个文件仍以 localhost callback 为主线描述 CLI 登录流程：

- §3.1 "Interactive (Localhost Callback, default)"
- §5 "Flow 1: Localhost Callback" 完整的 mermaid 流程图
- §7.1 "Localhost Flow" API 契约
- 多处 `CanBindLocalPort()`、`redirect_port`、`/v1/auth/callback` 引用
- mock server 用例仍描述 localhost redirect

当前 CLI 实际主路径是 `browser_poll`，headless 是 `device code`，这个文件与现实严重脱节。

### 2.5 `docs/cli/spec/framework.md` 过时引用

- Line 26: 仍提到 "localhost callback / device code" 作为 login 的自动检测
- Line 29: 仍列出 `LocalhostFlow` 作为 auth/ 包的能力

## 3. 清理顺序

### Step 1: 删除 `Auth0Client` 整条链

1. 从 `login.Service` 移除 `authClient` 字段和 `NewService` 的 `authClient` 参数
2. 删除 `port.Auth0Client` 接口
3. 删除 `auth.Client.BuildLoginURL()` 和 `resolveRedirectURI()`
4. 删除 `auth.StubClient` 和 `NewStubClient()`/`NewStubProvider()`（整个 `stub.go`）
5. 删除 `bootstrap.go` 中 `buildAuthClient()` 及所有调用点
6. 从 `config.Config` 移除 `Auth0ClientID` / `Auth0ClientSecret` 及对应 env 读取
7. 更新 `bootstrap_test.go` 中受影响的测试

`auth0_client.go` 中 `normalizeIssuerURL()` / `joinURLPath()` / `mapAuthError()` 被 `jwt_verifier.go` 使用，保留不删。`ClientConfig` 如果只被 `BuildLoginURL` 使用也可以删；如果 `jwt_verifier.go` 有引用则保留。

### Step 2: 删除 LoginSessionRepo 废弃方法

1. 从 `port.LoginSessionRepo` 接口移除 `GetByState()` 和 `MarkAuthorized()`
2. 从 `repo.go` 和 `memory_repo.go` 删除对应实现
3. 从 `service_test.go` 的 fake repo 删除对应方法
4. 从 `repo_test.go` 删除对应测试用例

### Step 3: 清理 LoginSession model 死字段

1. 从 `model.LoginSession` 移除 `CodeVerifier`、`RedirectURI`、`DeviceCode`
2. 修改 `repo.go`:
   - `CreateSession` INSERT 语句移除这三列（或固定传 NULL）
   - `getOne` SELECT 和 Scan 移除这三列
3. `memory_repo.go` 不需要改动

DB 表的 `code_verifier`、`redirect_uri`、`device_code` 列暂保留，不动 migration。

### Step 4: 更新过时文档

1. 重写 `docs/cli/spec/oauth.md`：以 `browser_poll` + `device code` + `direct API key` 为主线
2. 更新 `docs/cli/spec/framework.md`：移除 localhost callback 引用

## 4. 确认项

开始执行前需确认：

1. `auth0_client.go` 中的 `ClientConfig` struct 是否仅被 `BuildLoginURL` / `NewClient` 使用（如果 jwt_verifier 不依赖它则可一并删除）
2. `stub.go` 删除后是否有测试依赖 `NewStubClient` / `NewStubProvider`（需检查 `bootstrap_test.go`）
3. 环境变量 `ANYCAP_AUTH0_CLIENT_ID` / `ANYCAP_AUTH0_CLIENT_SECRET` 是否在部署脚本或 CI 中被引用（删 config 后不会报错，但需确认不影响部署流程）

## 5. 成功标准

1. `port.Auth0Client` 接口不再存在
2. `login.Service` 不再持有任何未使用的依赖
3. `LoginSessionRepo` 接口方法集合与 service 实际调用一一对应
4. `LoginSession` model 不含业务层未使用的字段
5. CLI spec 文档描述与当前实现一致
6. 所有测试通过
