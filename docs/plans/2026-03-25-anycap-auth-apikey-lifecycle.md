# AnyCap Auth0 与 API Key 生命周期策略

> Date: 2026-03-25
> Status: Active MVP guidance

## 1. 结论

AnyCap 当前采用弱绑定策略：

- Auth0 只负责登录时确认用户身份
- AnyCap Server 在登录成功后签发自己的 API Key
- 后续 CLI 与 Server 的业务请求只依赖 API Key
- Auth0 session 过期不会实时使已签发的 API Key 失效

这意味着：

- `Auth0 token/session expiry != API key expiry`
- `Auth0 logout != API key auto revoke`
- AnyCap 必须维护自己的 API Key 生命周期策略

## 2. MVP 规则

### 2.1 登录

- `anycap login` 成功后，Server 向 CLI 返回 `api_key`
- CLI 将 `api_key` 保存到本地凭据存储
- 当前实现里，`api_keys.user_id` 暂时直接使用 Auth0 `sub`

### 2.2 认证

- 后续业务请求统一使用：
  - `Authorization: Bearer <api_key>`
- Server 不在每次请求上实时回查 Auth0 登录态

### 2.3 过期与撤销

- API Key 的有效性由 AnyCap 自己控制：
  - `status`
  - `expires_at`
  - `revoked`
- Auth0 的过期只影响“下一次重新登录”
- 当前 MVP 中，CLI 登录得到的 API Key 可视为“登录型 key”，后续建议增加独立 TTL 策略

### 2.4 登出

- `anycap logout` 应优先请求 Server 撤销当前 API Key
- 若 Server 不可达，CLI 仍删除本地凭据，保证离线可登出
- 这是一种 best-effort server revoke + guaranteed local delete 的策略

## 3. 当前仓库中的持久化关系

当前没有单独的 `users` / `auth_identities` 映射表。

现阶段关系是：

- `login_sessions.auth0_subject` 记录登录链路中的 Auth0 `sub`
- `api_keys.user_id` 直接使用 Auth0 `sub`

因此目前的关联方式是：

- `Auth0 sub -> api_keys.user_id`

这是 MVP 简化方案，不是最终用户模型。

## 4. 后续建议

### 4.1 MVP+ 建议

优先补这三项：

1. 登录型 API Key 独立 TTL
2. 用户级批量撤销 key
3. 用户状态与管理员禁用机制

### 4.2 长期建议

引入独立用户域模型：

- `users`
- `user_identities` / `auth_identities`

最终关系应演进为：

- `Auth0 sub -> user_identities.external_subject`
- `user_identities.user_id -> users.id`
- `api_keys.user_id -> users.id`

这样才能更好支持：

- 多登录源绑定
- 用户封禁/迁移
- 资料同步
- 更稳定的审计和权限模型
