# AnyCap Auth BFF MVP 设计文档

> Date: 2026-03-25
> Status: Proposed for implementation
> Scope: CLI 登录、Auth0 对接、Server 签发 API Key 的 MVP 认证方案

## 1. 背景

当前仓库里存在两套不一致的认证方向：

- `docs/cli/spec/oauth.md` 假设 CLI 最终拿到的是 `access_token + refresh_token`
- 现有 server MVP 与 `docs/cli-architecture.md` 更接近，目标是 CLI 最终持有 `API Key`

结合当前产品边界与已有代码基础，本次设计明确采用：

- CLI 只与 AnyCap Server 通信
- Server 是登录编排层和唯一网关
- Auth0 只负责“确认用户是谁”
- Server 在本地数据库中查找或创建用户后，签发 AnyCap API Key 给 CLI
- CLI 只持久化和使用 API Key，不保存 Auth0 access token / refresh token

这是一种典型的 BFF / Auth Broker 方案。

## 2. 目标

本次认证 MVP 需要打通以下用户链路：

1. 用户执行 `anycap login`
2. CLI 调用 Server 发起登录
3. 用户在浏览器完成 Auth0 认证
4. Server 验证 Auth0 结果、查找或创建本地用户
5. Server 生成并返回 API Key
6. CLI 将 API Key 保存到 `~/.anycap/credentials`
7. 后续 `status`、`image models`、`image generate` 等请求统一携带该 API Key

## 3. 非目标

以下内容不属于本次 MVP：

- CLI 直接与 Auth0 通信
- CLI 保存或刷新 Auth0 `refresh_token`
- Server 对外暴露通用 OAuth token 服务
- Dashboard 用户登录 Web UI
- 多租户组织权限模型
- API Key 的 UI 管理台

## 4. 核心设计决策

### 4.1 Server 负责登录编排，CLI 不直接接 Auth0

这是本次设计最重要的边界。

原因：

- 与 `docs/system-architecture.md` 和 `docs/cli-architecture.md` 一致，CLI 只对接 Server
- 后续可替换 Auth0，不影响 CLI 协议
- CLI 不必理解 Auth0 token 生命周期
- Server 可以统一控制登录流程、用户落库和 API Key 签发

### 4.2 CLI 最终拿到的是 API Key，不是 OAuth Token

认证成功后的最终凭证统一为 AnyCap API Key。

这意味着：

- `Authorization: Bearer <api_key>` 是 CLI 后续的唯一认证方式
- API Key 成为限流、调用日志、审计、撤销的统一主键
- CLI 的 credential 模型在 MVP 阶段可以收敛为 API Key 优先

### 4.3 支持两种登录流

支持：

- `Localhost Callback`
- `Device Flow`

用途区分：

- `Localhost Callback`：适合本机桌面、开发机、有浏览器的终端
- `Device Flow`：适合 SSH、远程开发机、容器、无图形环境

### 4.4 Device Flow 不走 `callback(code)`

这点必须明确。

- `Localhost Callback` 有浏览器回跳给 CLI 的 `auth code`
- `Device Flow` 没有回调给 CLI 的 `auth code`

因此接口应拆分为：

- `POST /v1/login/init`
- `POST /v1/login/callback`
- `POST /v1/login/poll`

以及兼容别名：

- `POST /v1/auth/login`
- `POST /v1/auth/callback`
- `POST /v1/auth/device-code`
- `POST /v1/auth/device-poll`

`poll` 是 device flow 的完成接口，不应复用 `callback`

## 5. 角色与职责

### 5.1 CLI

职责：

- 选择登录方式（自动 / `--headless`）
- 展示登录链接或 device code
- localhost 模式下接收浏览器回调
- 将 `code` 或 `login_session_id` 发回 Server
- 保存返回的 API Key 到 `~/.anycap/credentials`
- 后续请求自动带 `Authorization: Bearer <api_key>`

不负责：

- 与 Auth0 直接交换 token
- 处理 refresh token
- 管理 Auth0 session

### 5.2 Server

职责：

- 生成登录会话与状态
- 构造 Auth0 authorize URL
- 校验 callback / poll 请求
- 与 Auth0 交换 code 或读取授权结果
- 查询 / 创建本地用户
- 签发 API Key
- 记录登录链路日志

### 5.3 Auth0

职责：

- 用户身份认证
- 返回用户身份与授权结果

不承担：

- 作为 CLI 后续访问 server 的业务凭证

## 6. 接口设计

### 6.1 `POST /v1/login/init`

用途：

- 发起登录
- 由 Server 决定并返回 localhost 或 device 所需信息

请求示例：

```json
{
  "method": "localhost",
  "redirect_port": 14565
}
```

或：

```json
{
  "method": "device"
}
```

响应示例：localhost

```json
{
  "flow_type": "localhost",
  "login_session_id": "lsn_123",
  "authorize_url": "https://...",
  "state": "st_123"
}
```

响应示例：device

```json
{
  "flow_type": "device",
  "login_session_id": "lsn_456",
  "verification_uri": "https://anycap.ai/device",
  "user_code": "ABCD-EFGH",
  "expires_in": 900,
  "interval": 5
}
```

兼容策略：

- `/v1/auth/login` 作为别名，语义与 `/v1/login/init` 等价
- `/v1/auth/device-code` 初期可内部复用同一个 use case，只是 method 固定为 `device`

### 6.2 `POST /v1/login/callback`

用途：

- 仅用于 localhost callback 流

请求示例：

```json
{
  "login_session_id": "lsn_123",
  "code": "auth_code_xxx",
  "state": "st_123",
  "code_verifier": "pkce_verifier_xxx",
  "redirect_uri": "http://127.0.0.1:14565/callback"
}
```

响应示例：

```json
{
  "api_key": "ak_xxx",
  "api_key_id": "key_123",
  "user": {
    "id": "usr_123",
    "email": "user@example.com",
    "name": "Alice"
  }
}
```

### 6.3 `POST /v1/login/poll`

用途：

- 仅用于 device flow
- CLI 轮询此接口，直到登录完成、过期或被拒绝

请求示例：

```json
{
  "login_session_id": "lsn_456"
}
```

响应示例：待授权

```json
{
  "status": "pending"
}
```

响应示例：完成

```json
{
  "status": "complete",
  "api_key": "ak_xxx",
  "api_key_id": "key_456",
  "user": {
    "id": "usr_456",
    "email": "user@example.com",
    "name": "Alice"
  }
}
```

响应示例：过期

```json
{
  "status": "expired"
}
```

兼容策略：

- `/v1/auth/device-poll` 作为别名

## 7. Auth0 集成设计

### 7.1 Localhost Callback

推荐方式：

- CLI 启动本地 `http://127.0.0.1:<port>/callback`
- Server 在 `/login/init` 中生成：
  - `login_session_id`
  - `state`
  - `code_verifier`
  - `redirect_uri`
- Server 构造 Auth0 authorize URL
- 用户登录完成后，Auth0 回跳到 CLI localhost 地址
- CLI 将 `code + state + login_session_id` 发给 Server
- Server 再去调用 Auth0 token endpoint 验证 code

### 7.2 Device Flow

MVP 建议采用“Server 托管的设备登录页”，不是强依赖 Auth0 原生 Device Authorization Grant。

做法：

- Server 创建 `login_session_id + user_code`
- Server 返回 `verification_uri + user_code`
- 用户在浏览器打开 `verification_uri`
- 该页面再引导用户去 Auth0 登录
- 登录完成后，Server 将该 `login_session_id` 标记为已授权
- CLI 通过 `/login/poll` 轮询获得最终 API Key

这样做的优点：

- CLI 协议统一
- 不依赖 Auth0 plan 是否开放原生 device flow
- 页面与用户提示文案都能由 AnyCap 自己控制

## 8. 数据模型

### 8.1 `login_sessions`

建议新增表：

- `id`
- `flow_type` (`localhost` / `device`)
- `state`
- `code_verifier`
- `redirect_uri`
- `user_code`
- `auth0_subject`
- `status` (`pending` / `authorized` / `completed` / `expired`)
- `expires_at`
- `completed_at`
- `created_at`

用途：

- 串联 init / callback / poll
- 支撑幂等
- 避免重复签发 API Key

### 8.2 `users`

继续使用本地用户表，至少包含：

- `id`
- `external_id`（Auth0 `sub`）
- `email`
- `name`
- `avatar_url`

### 8.3 `api_keys`

继续沿用当前 API Key 体系：

- `id`
- `user_id`
- `prefix`
- `hash`
- `revoked_at`
- `expires_at`
- `last_used_at`

## 9. 幂等与安全要求

### 9.1 幂等

- 同一个 `login_session_id` 的 `callback` 重试，不应重复建用户
- 同一个 `login_session_id` 完成后重复调用 `callback` 或 `poll`，应返回同一把 API Key 或明确的 completed 结果
- `poll` 在 completed 后应保持幂等

### 9.2 安全

- `state` 必须校验
- `login_session_id` 必须设置过期时间
- `code_verifier` 只存服务端，不回传给浏览器页面
- device flow 的 `user_code` 需要短时过期，并带轮询限流
- API Key 原文只在创建时返回一次

## 10. 对现有文档的影响

当前 [oauth.md](/Users/sczhao/dev/Projects/converge-ai/ai-infra/anycap/docs/cli/spec/oauth.md) 中以下假设不再适用于本次 MVP：

- CLI 最终持有 `access_token + refresh_token`
- `POST /v1/auth/refresh` 是必需接口
- 401 后由 CLI 自动 refresh OAuth token

本次 MVP 的权威行为改为：

- CLI 登录最终拿到 `API Key`
- `~/.anycap/credentials` 保存的是 API Key
- `auth/refresh` 不在 MVP 范围内

后续如果需要支持“OAuth token 直连 server”，可以作为 Phase 2 单独设计，不与本次 API Key 路线混做。

## 11. MVP 验收标准

满足以下条件即可认为认证 MVP 可用：

1. `anycap login` 在本机桌面环境可完成 localhost callback 登录
2. `anycap login --headless` 在远程终端可完成 device flow 登录
3. 登录完成后，CLI 本地成功保存 API Key
4. `anycap status` 能自动带 API Key 调通 server
5. `anycap image models` 能自动带 API Key 调通 server
6. 同一个登录会话重复回调不产生多把 API Key
7. server 能用 Auth0 `sub` 查找 / 创建本地用户

## 12. 推荐实施顺序

1. 先统一协议，明确 CLI/server 最终都以 API Key 为登录产物
2. 先实现 localhost callback 主链路
3. 再实现 device flow 的 init + poll
4. 再接真实 Auth0 code exchange 与 profile 获取
5. 最后补充路由兼容、限流、审计和测试
