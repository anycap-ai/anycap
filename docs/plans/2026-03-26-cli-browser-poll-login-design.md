# AnyCap CLI Browser Poll Login Design

> Date: 2026-03-26  
> Scope: replace CLI localhost callback login with a frontend-domain callback + CLI polling flow

## 1. Decision

`anycap login` 的默认浏览器登录流应从 **localhost callback** 切换为
**browser poll flow**：

- CLI 向 Server 发起登录
- Server 返回 `login_session_id`、`browser_url`、`poll_token`
- 浏览器在前端真实域名完成 Auth0 登录
- 前端 / Server 标记登录会话已授权
- CLI 轮询 Server 获取最终 API key

这条链路应成为交互式 CLI 登录的 authoritative direction。

## 2. Why We Are Changing It

当前 localhost callback 流的问题已经明确：

- Auth0 `redirect_uri` 是 `http://127.0.0.1:14565/callback`
- Auth0 会把这类 callback 视为本地应用 / localhost 场景
- 出于安全策略，会强制展示 consent 页面

这不是偶发现象，而是当前实现与 Auth0 产品语义共同导致的必然结果。

因此，只要交互式 CLI 登录仍然把 Auth0 callback 落到 localhost，
consent 页面就无法真正消除。

## 3. Why Browser Poll Is The Right Direction

这个方案与当前 AnyCap 的 BFF / auth broker 方向完全一致：

- CLI 只与 AnyCap Server 通信
- Server 是唯一的认证编排层
- Auth0 只负责确认用户身份
- 最终业务凭证仍然是 AnyCap API key

同时，这条链路还能与现有 `--headless` 思路收敛：

- `headless`: 用户手输 code，CLI poll
- `browser_poll`: CLI 自动打开浏览器，浏览器完成登录，CLI poll

两者都不需要 CLI 直接持有 OAuth token，也都不要求 Auth0 直接回调 CLI。

## 4. Rejected Alternatives

### 4.1 Keep localhost callback and try to suppress consent

不推荐。

原因：

- 根因不是 UI 文案或小配置，而是 localhost callback 本身
- 即使通过 Auth0 tenant / app 级别配置绕过一部分 consent，也不稳健
- 会让实现继续依赖一条与产品平台语义相冲突的登录链路

### 4.2 Server-side relay: Auth0 -> public callback -> 302 -> localhost

这是可行的短期止血方案，但不是长期最优方案。

优点：

- CLI 改动小
- 可较快去掉 consent

缺点：

- auth code 最终仍然会回到 localhost
- interactive login 与 headless login 仍是两套不同完成语义
- 后续还要再收敛一次架构

### 4.3 Auth0 Native App / direct device flow

不推荐作为主方向。

原因：

- 会把 CLI 推向直接面向 Auth0 的 client 形态
- 与当前 “CLI only talks to Server” 的架构边界冲突
- 会引入另一套不同的 grant 和 token 生命周期语义

## 5. Recommended Flow

### 5.1 Sequence

1. CLI 执行 `anycap login`
2. CLI 调用 `POST /v1/auth/login`，请求 `method=browser_poll`
3. Server 创建 `login_session`
4. Server 返回：
   - `login_session_id`
   - `browser_url`
   - `poll_token`
   - `expires_in`
   - `interval`
5. CLI 打开 `browser_url`
6. 浏览器进入前端 `/auth/login`
7. 前端根据 `browser_token` 向 Server 换取 Auth0 `authorize_url`
8. 浏览器跳转到 Auth0
9. Auth0 完成认证后回前端 `/auth/callback`
10. 前端调用 Server 完成这次 CLI login session 的授权确认
11. Server 将 session 标记为 `authorized`
12. CLI 轮询 `POST /v1/auth/poll`
13. Server 在首次成功 poll 时签发 AnyCap API key
14. CLI 保存 API key 到本地凭据

### 5.2 User-Facing Properties

这条链路应具备以下用户表现：

- `anycap login` 仍然是“一条命令 + 自动打开浏览器”
- 浏览器登录页落在 AnyCap 自己的前端域名
- Auth0 callback 永远是公网 HTTPS 域名，不是 localhost
- CLI 不需要监听本地端口
- 登录结果仍然是 AnyCap API key

## 6. Auth0 Callback Rule

这是本方案最关键的要求：

- Auth0 callback 必须固定为前端真实域名，例如 `https://anycap.ai/auth/callback`
- CLI flow 不再使用 `http://127.0.0.1:*` 作为 Auth0 redirect URI

只要这条规则满足，Auth0 就不会再把 CLI 浏览器登录识别为 localhost app callback，
从而避免 consent 页面。

## 7. Session Model

现有 `login_session` 应扩展支持新 flow type：

- `localhost`
- `device`
- `web`
- `browser_poll`

`browser_poll` 额外需要以下会话字段：

- `browser_token`
- `poll_token` 或 `poll_token_hash`
- `flow_type=browser_poll`

建议：

- 浏览器侧使用 `browser_token`
- CLI 侧使用 `poll_token`
- 不直接把 `login_session_id` 当作唯一凭证

第一版实现可以先存明文 `poll_token`，后续再收敛为 hash 存储。

## 8. State Machine

建议统一沿用当前 device flow 的状态语义：

- `pending`
- `authorized`
- `complete`
- `expired`
- `slow_down`

对 `browser_poll` 的含义如下：

- `pending`: session 已创建，浏览器尚未完成登录
- `authorized`: Auth0 code 已由前端 / Server 完成 exchange，CLI 尚未取走结果
- `complete`: CLI 已成功取走最终 API key
- `expired`: 登录会话过期
- `slow_down`: 轮询过快

## 9. API Contracts

### 9.1 `POST /v1/auth/login`

新增请求：

```json
{
  "method": "browser_poll"
}
```

响应建议：

```json
{
  "status": "success",
  "data": {
    "flow_type": "browser_poll",
    "login_session_id": "lsn_123",
    "browser_url": "https://anycap.ai/auth/login?cli=1&browser_token=bt_123",
    "poll_token": "pt_123",
    "expires_in": 900,
    "interval": 5
  }
}
```

### 9.2 `POST /v1/auth/browser-bind`

用途：

- 前端根据 `browser_token` 换取 Auth0 authorize URL

请求：

```json
{
  "browser_token": "bt_123"
}
```

响应：

```json
{
  "status": "success",
  "data": {
    "login_session_id": "lsn_123",
    "authorize_url": "https://tenant.auth0.com/authorize?...",
    "redirect_uri": "https://anycap.ai/auth/callback"
  }
}
```

### 9.3 `POST /v1/auth/browser-complete`

用途：

- 前端 callback 命中后通知 Server 完成 CLI login session 授权

请求：

```json
{
  "login_session_id": "lsn_123",
  "browser_token": "bt_123",
  "code": "oauth_code",
  "state": "oauth_state",
  "redirect_uri": "https://anycap.ai/auth/callback"
}
```

语义要求：

- 完成 code exchange
- 建立 / 查找本地用户
- 将 session 标记为 `authorized`
- 不返回最终 `api_key`

### 9.4 `POST /v1/auth/poll`

用途：

- CLI 轮询获取最终登录结果

请求：

```json
{
  "login_session_id": "lsn_123",
  "poll_token": "pt_123"
}
```

响应：

- `pending`
- `complete + api_key`
- `expired`
- `slow_down`

可以保留现有 `/v1/auth/device-poll` 作为兼容 alias，
但新的 authoritative endpoint 应是 `/v1/auth/poll`。

## 10. Frontend Integration

前端需要支持 CLI login 分支，但不应破坏现有 dashboard web login：

- `/auth/login` 识别 CLI 模式参数或 cookie
- CLI 模式下不直接发起现有 dashboard session 登录
- `/auth/callback` 在 CLI 模式下调用 `browser-complete`
- 完成后展示“CLI login complete, return to terminal”页面

关键约束：

- CLI flow 下，前端 callback 不应直接消费最终 `api_key`
- `api_key` 只应通过 CLI poll 返回给终端

## 11. CLI Integration

CLI 侧应从“监听 localhost callback”切换为“打开浏览器 + poll”：

- 不再要求绑定 `127.0.0.1:14565`
- 浏览器打开失败时，仍打印 `browser_url` 供用户手动访问
- CLI 依据 `interval` 轮询
- 轮询超时时间与 session expiry 对齐

这意味着现有 `localhost.go` 最终会被替换或退化为兼容路径。

## 12. Security Notes

### 12.1 Token Separation

`browser_token` 与 `poll_token` 必须分离：

- 浏览器 token 允许暴露在浏览器 URL / cookie 语境中
- poll token 只给 CLI，不应经过前端

### 12.2 Final Credential Delivery

最终 API key 只应在 CLI poll 成功时返回。

这样可以避免：

- 前端先拿到 CLI 的业务凭证
- callback 路由把 CLI 登录结果和 dashboard session 混在一起
- 凭证交付路径过多导致审计和回归复杂

### 12.3 Idempotency

`browser-complete` 和 `poll` 必须支持幂等：

- 重复 callback 不应重复创建用户
- 重复 poll 不应无界重复签发新 API key

建议第一版保证：

- `complete` 后再次 poll 返回同一语义结果或受控错误
- session 已完成时不再重复签发新的 key

## 13. Migration Guidance

建议分两阶段迁移：

### Phase 1

- 新增 `browser_poll`
- `anycap login` 默认切换到 `browser_poll`
- 保留旧 localhost flow 作为临时兼容 / 回退路径

### Phase 2

- 收敛文档与测试
- 评估是否彻底移除 localhost callback 主路径

## 14. Minimal Implementation Scope

第一版只需要做到：

- `anycap login` 默认不再走 localhost callback
- Auth0 callback 落在前端真实域名
- CLI 能通过 poll 成功拿到 API key
- 不再展示 consent 页面

第一版不要求：

- 完整移除旧 localhost flow
- 对 poll token 做 hash 存储
- 引入额外后台任务或复杂会话恢复机制

## 15. Summary

这次改造的核心不是“换一个 callback 地址”这么简单，
而是把 interactive CLI login 收敛到和 headless login 一致的 server-mediated pattern：

- 浏览器完成身份认证
- Server 持有认证结果
- CLI 轮询拿最终 API key

这能同时满足三件事：

- 避免 Auth0 localhost consent
- 保持 AnyCap 的 BFF 边界
- 让交互式与 headless 登录走向统一架构
