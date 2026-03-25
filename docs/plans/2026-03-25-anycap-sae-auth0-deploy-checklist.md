# AnyCap Server SAE + Auth0 上线清单

> Date: 2026-03-25
> Status: Active deployment checklist
> Scope: `anycap-server` 部署到阿里云 SAE，并接入真实 Auth0 / PostgreSQL / Redis

## 1. 目标

本文档用于指导 `anycap-server` 上线到阿里云 SAE 时需要完成的配置与检查，重点覆盖：

- SAE 环境变量
- Auth0 Dashboard 配置
- `localhost callback` 与 `device flow` 的上线取舍
- 上线前后验证步骤

## 2. SAE 应用信息

当前约定：

- SAE Namespace: `kntech-dev`
- SAE App Name: `anycap-server`

## 3. SAE 环境变量

### 3.1 必填最小集

```env
ANYCAP_APP_NAME=anycap-server
ANYCAP_APP_ENV=prod
ANYCAP_HTTP_ADDR=:8080
ANYCAP_RUNTIME_MODE=prod
ANYCAP_RATE_LIMIT_RPM=60
ANYCAP_LOGIN_API_KEY_TTL=168h

ANYCAP_PG_HOST=<postgres-host>
ANYCAP_PG_PORT=5432
ANYCAP_PG_USER=<postgres-user>
ANYCAP_PG_PASSWORD=<postgres-password>
ANYCAP_PG_DATABASE=postgres
ANYCAP_PG_SSL_MODE=require
ANYCAP_PG_AUTO_MIGRATE=false

ANYCAP_REDIS_HOST=<redis-host>
ANYCAP_REDIS_PORT=6379
ANYCAP_REDIS_USERNAME=default
ANYCAP_REDIS_PASSWORD=<redis-password>
ANYCAP_REDIS_DB=0

ANYCAP_AUTH0_ENABLED=true
ANYCAP_AUTH0_ISSUER=https://<tenant>.auth0.com/
ANYCAP_AUTH0_AUDIENCE=https://api.anycap.prod
ANYCAP_AUTH0_CLIENT_ID=<auth0-client-id>
ANYCAP_AUTH0_CLIENT_SECRET=<auth0-client-secret>
```

说明：

- `ANYCAP_AUTH0_REDIRECT_URL` 当前更适合作为默认 / fallback redirect URI
- 如果 CLI 走 `localhost callback`，实际会把 `http://127.0.0.1:<port>/callback` 动态传给 server，再由 server 传给 Auth0
- 如果生产上主推 `device flow`，这个值不是核心依赖，但建议仍配置一个明确值，避免后续扩展时出现歧义

### 3.2 可选真实能力配置

如果需要启用真实 catalog / multimodal / upload：

```env
NEXUSHUB_BASE_URL=<nexushub-base-url>
NEXUSHUB_TOKEN=<nexushub-token>

AGENT_PLATFORM_BASE_URL=<agent-platform-base-url>
AGENT_PLATFORM_API_KEY=<agent-platform-api-key>
AGENT_PLATFORM_TENANT_ID=<agent-platform-tenant-id>

S3_ENDPOINT=<s3-endpoint>
S3_ACCESS_KEY_ID=<s3-access-key-id>
S3_SECRET_ACCESS_KEY=<s3-secret-access-key>
S3_BUCKET=<bucket>
S3_REGION=<region>
S3_PUBLIC_URL=<public-url>
S3_KEY_PREFIX=user_upload
```

### 3.3 参考文件

- `configs/server/prod.env.example`
- `internal/config/config.go`
- `internal/app/bootstrap.go`

## 4. Auth0 Dashboard 配置

当前 server 真实读取的是：

- `ANYCAP_AUTH0_ISSUER`
- `ANYCAP_AUTH0_AUDIENCE`
- `ANYCAP_AUTH0_CLIENT_ID`
- `ANYCAP_AUTH0_CLIENT_SECRET`
- `ANYCAP_AUTH0_REDIRECT_URL`

需要特别注意：

- 当前浏览器完成授权后，`localhost callback` 的浏览器回跳目标是 CLI 本地地址，例如 `http://127.0.0.1:14565/callback`
- 当前 server 对外暴露的 `/v1/auth/callback` 是 **CLI 把 auth code 再 POST 给 server 的接口**
- 也就是说，**浏览器不是直接 GET 到 server 的 `/v1/auth/callback`**

### 4.1 Application 类型建议

建议使用一个专门供 AnyCap CLI / Server 登录编排使用的 Auth0 Application。

### 4.2 必须配置的 URL

至少需要在 Auth0 Application 中配置：

#### Allowed Callback URLs

如果生产环境主推 `device flow`，这一项主要用于本地开发或未来固定端口回调。

当前更准确的配置建议是：

- 本地开发保留一个固定 localhost callback，例如：

```text
http://127.0.0.1:14565/callback
```

- 如果后续落地 server-side callback relay，再增加正式生产回调地址，例如：

```text
https://<your-server-domain>/auth/callback
```

#### Allowed Logout URLs

可配置：

```text
https://<your-server-domain>
http://127.0.0.1:14565
```

#### Allowed Web Origins

如果未来有浏览器中转页或回调代理页面，建议包含：

```text
https://<your-server-domain>
```

### 4.3 Audience

确保 Auth0 API / Application 中配置的 audience 与下列环境变量一致：

```text
ANYCAP_AUTH0_AUDIENCE
```

### 4.4 Issuer

确保 issuer 与下列环境变量一致：

```text
ANYCAP_AUTH0_ISSUER
```

通常格式为：

```text
https://<tenant>.auth0.com/
```

### 4.5 当前推荐的 redirect 配置理解

当前 MVP 下：

1. `device flow`
   - 不依赖浏览器回跳到 server
   - 更适合作为生产默认登录方式
2. `localhost callback`
   - 依赖浏览器回跳到 CLI 本地端口
   - 更适合开发联调
3. `ANYCAP_AUTH0_REDIRECT_URL`
   - 当前建议视为默认 redirect 配置
   - 不是“生产浏览器必须回跳到 server 某个 GET 路由”的强约束

## 5. 关于 Localhost Callback 与 Device Flow

### 5.1 当前代码状态

当前 server 已支持：

- Auth0 authorize URL 构造
- authorization code exchange
- device authorization start / poll
- 登录成功后签发 AnyCap API Key

### 5.2 生产上线建议

当前实现下，**上线初期建议优先使用 `device flow`**。

原因：

- `localhost callback` 在真实生产环境里对 Auth0 callback URL 配置更敏感
- CLI 当前是随机本地端口，Auth0 对动态 localhost port 的支持有限
- 更稳的正式方案通常需要：
  - 固定 localhost 端口，或
  - server-side callback relay / redirect proxy

### 5.3 当前推荐策略

生产环境推荐：

1. 默认引导 `anycap login --headless`
2. 将 `device flow` 作为主推荐路径
3. `localhost callback` 暂保留给本地开发联调

## 6. 上线前检查

### 6.1 基础设施

确认：

- SAE 到 PostgreSQL 网络可达
- SAE 到 Redis 网络可达
- 安全组 / 白名单已放行
- RDS / Redis 的账号密码已注入 SAE 环境变量

### 6.2 数据库

确认：

- 首次建表时是否需要临时打开：
  - `ANYCAP_PG_AUTO_MIGRATE=true`
- 生产建议建表完成后恢复：
  - `ANYCAP_PG_AUTO_MIGRATE=false`

### 6.3 Auth0

确认：

- `Issuer` / `Audience` / `Client ID` / `Client Secret` 已在 SAE 配置
- Auth0 Dashboard 的 callback URL 与 server 对外域名一致
- 如使用 device flow，相关 Application/tenant 能完成认证交互

### 6.4 镜像与启动

确认：

- 镜像使用 `deploy/docker/Dockerfile.server`
- SAE 暴露端口与 `ANYCAP_HTTP_ADDR=:8080` 一致
- 健康检查路径至少包含：
  - `/ping`
  - `/healthz`

## 7. 上线后检查

### 7.1 服务检查

使用 curl 或网关探活确认：

```bash
curl https://<your-server-domain>/ping
curl https://<your-server-domain>/healthz
```

### 7.2 鉴权检查

确认：

- 未带 token 访问 `/v1/status` 返回 `401`
- 带有效 API key 访问 `/v1/status` 返回 `200`

### 7.3 登录检查

优先检查：

```bash
anycap --endpoint https://<your-server-domain> login --headless
```

然后验证：

```bash
anycap --endpoint https://<your-server-domain> status
anycap --endpoint https://<your-server-domain> image models
```

### 7.4 登出检查

确认：

```bash
anycap --endpoint https://<your-server-domain> logout
```

然后再次执行：

```bash
anycap --endpoint https://<your-server-domain> status
```

预期：

- 本地凭据被删除
- server 当前 API key 被撤销
- 后续请求返回未认证 / 需要重新登录

## 8. 当前已知注意事项

### 8.1 `localhost callback` 还不是最稳的生产路径

虽然代码已经支持动态 redirect URI 传递，但真实生产联调时仍建议优先使用 `device flow`。

### 8.2 当前用户模型仍是 MVP 简化版

当前关系仍是：

- `api_keys.user_id = Auth0 sub`

还没有独立的：

- `users`
- `auth_identities`

### 8.3 登录型 key 默认 7 天 TTL

当前 `login flow` 生成的 `cli` key 默认：

```text
ANYCAP_LOGIN_API_KEY_TTL=168h
```

其他手工导入 / 非 login flow 生成的 key 不受这个默认值影响。

## 9. 建议的上线顺序

推荐顺序：

1. 先部署 SAE + PG + Redis + Auth0 基础配置
2. 先验证 `/ping` `/healthz` `/v1/status`
3. 先用 `device flow` 跑通 `anycap login --headless`
4. 再验证 `status` / `image models`
5. 最后再验证 `localhost callback` 是否要作为正式默认体验
