# AnyCap Server Phase 1 MVP 设计文档

## 1. 背景与目标

基于最新的 `docs/system-architecture.md` 与 `docs/cli-architecture.md`，AnyCap Server 在 Phase 1 的职责已经比较明确：

- CLI 只和 Server 通信，Server 是唯一网关
- Server 内部承接 API Key 系统、限流、登录、计费、路由、日志
- CLI 首次认证由 `anycap login` 触发，但 Auth0 流程由 Server 封装，CLI 不直接访问 Auth0

因此，这份 MVP 设计文档的目标不是只做一个单点接口，而是先搭出一套可扩展的后端框架，优先跑通以下两条主链路：

1. `API Key 鉴权 -> 限流 -> 查余额 -> 调用 NexusHub -> 扣费 -> 记录日志 -> 返回结果`
2. `CLI login -> Server 对接 Auth0 -> 生成/返回 API Key`

## 2. 范围（Phase 1）

### 2.1 In Scope

- AnyCap Server 核心框架与目录分层
- API Key System
  - PostgreSQL 存储
  - API Key 生成、查询、吊销、验证
- Rate Limiter
  - 基于 Redis
  - 按 API Key 限流
- 登录主链路
  - `POST /v1/login/init`
  - `POST /v1/login/callback`
  - Auth0 适配器抽象
- image 能力主链路
  - `GET /v1/image/models`
  - `GET /v1/image/models/:name/schema`
  - `POST /v1/image/generate`
- Auth0 / Credit / NexusHub 抽象接口与 stub 实现
- Payment 抽象接口设计（先定义边界，不接真实实现）
- 调用日志落库
- 健康检查与状态接口
- 关键链路幂等设计

### 2.2 Out of Scope

- Dashboard / Payment 真正业务接通
- Landing Page
- 非 image 能力（video/music/tts/asr/search/crawl）
- 企业 Proxy 的具体实现
- Auth0 的完整生产细节打磨（如真正的 device flow UI 体验）
- 复杂的异步任务编排

## 3. 架构方案

采用「分层模块化单体（Hexagonal-lite）」：

1. `transport/http`：Hertz 路由、DTO、错误映射
2. `middleware`：request id、access log、recover、auth、rate limit
3. `application`：用例编排（login、status、image generate、image models）
4. `domain`：核心模型、错误、ports
5. `infrastructure`：Postgres、Redis、Auth0、Credit、NexusHub、Payment

核心原则：

- HTTP 层只做协议转换，不承载业务逻辑
- 业务逻辑依赖 `port` 接口，不依赖具体外部服务实现
- 外部服务全部走 adapter，MVP 可用 stub
- 认证、限流、日志这些横切关注点全部前置到 middleware

## 4. 建议目录

```text
cmd/service/main.go

internal/
  app/
    bootstrap.go

  config/
    config.go

  transport/http/
    router.go
    response.go
    dto/
      error.go
      login.go
      image.go
      status.go
    handlers/
      health.go
      login.go
      image.go
      image_models.go
      status.go

  middleware/
    context.go
    request_id.go
    access_log.go
    recover.go
    auth.go
    ratelimit.go

  application/
    login_init.go
    login_callback.go
    image_generate.go
    image_models.go
    status.go

  domain/
    model/
      principal.go
      request.go
      apikey.go
      image.go
      usage.go
      log.go
    port/
      auth.go
      apikey.go
      credit.go
      nexushub.go
      payment.go
      log.go
      ratelimit.go

  infrastructure/
    postgres/
      db.go
      api_key_repo.go
      call_log_repo.go
      idempotency_repo.go
      migrations/
    redis/
      ratelimiter.go
      lua/
    auth/
      auth0_client.go
      apikey_authenticator.go
    credit/
      client_stub.go
    nexushub/
      client_stub.go
    payment/
      client_stub.go
```

## 5. 核心模型与接口

### 5.1 核心模型

- `Principal`
  - `UserID`
  - `APIKeyID`
  - `AuthType`
  - `Scopes`

- `RequestMeta`
  - `RequestID`
  - `StartedAt`

- `APIKey`
  - `ID`
  - `UserID`
  - `Name`
  - `KeyPrefix`
  - `KeyHash`
  - `Status`
  - `ExpiresAt`

- `CallLog`
  - `RequestID`
  - `UserID`
  - `APIKeyID`
  - `Capability`
  - `Model`
  - `Status`
  - `LatencyMS`
  - `CreditCost`
  - `ErrorCode`

### 5.2 Ports

- `APIKeyService`
  - `AuthenticateAPIKey(ctx, rawKey) (Principal, error)`
  - `CreateAPIKey(ctx, userID, name) (CreatedAPIKey, error)`
  - `RevokeAPIKey(ctx, keyID) error`

- `Auth0Client`
  - `BuildLoginURL(ctx, state) (string, error)`
  - `ExchangeCode(ctx, code) (AuthUser, error)`

- `CreditClient`
  - `GetBalance(ctx, userID) (Balance, error)`
  - `Deduct(ctx, userID, amount, reason, requestID) error`

- `NexusHubClient`
  - `ListImageModels(ctx) ([]ImageModel, error)`
  - `GetImageModelSchema(ctx, model string) (map[string]any, error)`
  - `GenerateImage(ctx, req GenerateImageRequest) (GenerateImageResponse, error)`

- `PaymentClient`
  - `CreateTopUpSession(ctx, userID, planID, idempotencyKey) (CheckoutSession, error)`
  - `CreateSubscriptionSession(ctx, userID, planID, idempotencyKey) (CheckoutSession, error)`
  - `HandleWebhook(ctx, payload []byte, signature string) (PaymentEvent, error)`

- `CallLogRepo`
  - `Insert(ctx, CallLog) error`

- `RateLimiter`
  - `Allow(ctx, key, limit, window) (allowed bool, remaining int, resetAt time.Time, err error)`

### 5.3 Infra Ports 设计原则

Server 对外部 Infra 的集成在第一版就需要明确边界，即使不全部接真实实现：

- `Auth0Client`
  - 属于第一版主链路必需接口
  - 需要支撑 `login/init` 与 `login/callback`
  - 开发模式可提供 stub 或 fake，实现 login 主链路联调

- `CreditClient`
  - 属于第一版主链路必需接口
  - 需要提供 stub，实现 image generate 的用例联调

- `NexusHubClient`
  - 属于第一版主链路必需接口
  - 需要提供 stub，支持 `models`、`schema`、`generate`

- `PaymentClient`
  - 第一版不进入主调用链路
  - 但要先定义 port，明确未来 top-up、subscription、webhook 的边界
  - 可以没有真实实现，也可以仅保留空 stub，避免 billing 需求将来直接穿透 application 层

这样做的目的，是把“业务编排”和“外部服务 SDK/HTTP 细节”从第一天就隔开。

## 6. 关键链路设计

### 6.1 Image Generate

请求链路：

`recover -> request_id -> access_log -> auth -> rate_limit -> handler`

业务流程：

1. `AuthMiddleware` 从 `Authorization: Bearer <token>` 中读取 API Key
2. Server 先做限流，再做业务逻辑
3. `GenerateImageUsecase`
   - 校验参数
   - 查余额
   - 调用 NexusHub
   - 扣减 credit
   - best-effort 记录调用日志
4. 返回统一 JSON

### 6.2 Login

为了和最新架构对齐，Server 需要保留登录封装能力：

- `POST /v1/login/init`
  - 生成 login state
  - 返回浏览器认证链接

- `POST /v1/login/callback`
  - 接收 auth code
  - 调用 Auth0 换取用户信息
  - 创建或查询内部用户
  - 生成 API Key
  - 返回给 CLI 持久化

MVP 可以先把 Auth0 适配器做成可替换实现：

- 开发模式：stub
- 集成模式：真实 Auth0

### 6.3 一致性与失败策略

MVP 不做分布式事务，但要把行为定义清楚：

- 每个请求都生成 `request_id`
- `Credit.Deduct` 必须接受 `request_id`，供下游做幂等
- 若 NexusHub 成功但 Deduct 失败：
  - 返回 `500`
  - 错误码：`BILLING_UNCERTAIN`
  - 响应里返回 `request_id`
- `CallLogRepo.Insert` 失败时：
  - 记录错误日志
  - 不覆盖主业务响应

### 6.4 幂等性策略

涉及余额、支付、登录回调等关键链路时，Server 必须优先保证“重复请求不会重复产生副作用”。

- `Credit.Deduct`
  - 幂等键：`request_id`
  - 语义：同一个 `request_id` 重复调用时，不得重复扣减 credit

- `Payment webhook`
  - 幂等键：支付平台事件 id，例如 `event_id`
  - 语义：同一个 webhook 重复投递时，不得重复加积分或重复记账

- `Payment checkout / subscription session`
  - 幂等键：`idempotency_key` 或 `client_request_id`
  - 语义：同一个支付意图重复请求时，不应重复创建多个等价支付会话

- `login/callback`
  - 幂等键：`state`、`auth_session_id` 或一次性 code 消费记录
  - 语义：同一个 callback 被重复提交时，不应重复创建用户或生成多把 API Key

原则：

- 所有会修改余额或创建关键资源的接口，都应支持幂等键
- 所有外部回调，都默认按“可能重复投递”设计
- 幂等记录应优先持久化在 Server 可控的存储中，而不是只依赖进程内内存

## 7. API 设计（MVP）

- `GET /ping`
- `GET /healthz`
- `GET /v1/status`
- `POST /v1/login/init`
- `POST /v1/login/callback`
- `GET /v1/image/models`
- `GET /v1/image/models/:name/schema`
- `POST /v1/image/generate`

### 7.1 成功响应

```json
{
  "id": "op_xxx",
  "status": "success",
  "data": {},
  "usage": {
    "credits": 1,
    "model": "flux-1.1-pro"
  }
}
```

### 7.2 失败响应

```json
{
  "id": null,
  "status": "error",
  "error": {
    "code": "AUTH_REQUIRED",
    "message": "Not authenticated",
    "hint": "run 'anycap config set-key <key>' or 'anycap login'"
  }
}
```

### 7.3 错误码

- `AUTH_REQUIRED` / `AUTH_INVALID` -> `401`
- `RATE_LIMITED` -> `429`
- `INVALID_PARAM` -> `400`
- `INSUFFICIENT_CREDIT` -> `403`
- `BILLING_UNCERTAIN` -> `500`
- `UPSTREAM_UNAVAILABLE` -> `503`
- `INTERNAL_ERROR` -> `500`

## 8. 数据存储设计

### 8.1 `api_keys`

- `id uuid primary key`
- `user_id text not null`
- `name text not null`
- `key_prefix text not null`
- `key_hash text not null`
- `status text not null`
- `expires_at timestamptz null`
- `last_used_at timestamptz null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### 8.2 `call_logs`

- `id uuid primary key`
- `request_id text not null`
- `user_id text not null`
- `api_key_id uuid null`
- `capability text not null`
- `model text null`
- `status text not null`
- `latency_ms int not null`
- `credit_cost numeric(18,6) not null default 0`
- `error_code text null`
- `created_at timestamptz not null default now()`

### 8.3 幂等相关存储建议

第一版即使不把所有表都实现完全，也应该在设计上预留以下存储能力：

- `payment_events`
  - 记录 webhook `event_id`
  - 保证同一支付事件只处理一次

- `idempotency_keys`
  - 记录 `scope`、`idempotency_key`、`status`、`response_ref`
  - 可用于 checkout session、关键写操作去重

- `auth_sessions`
  - 记录 `state` / `auth_session_id`
  - 用于 login/init 与 login/callback 的一次性消费和状态跟踪

## 9. 配置设计

- `ANYCAP_RUNTIME_MODE`：`stub` / `integration` / `prod`
- `ANYCAP_HTTP_ADDR`
- `ANYCAP_PG_DSN`
- `ANYCAP_REDIS_ADDR`
- `ANYCAP_REDIS_PASSWORD`
- `ANYCAP_REDIS_DB`
- `ANYCAP_RATE_LIMIT_RPM`
- `ANYCAP_AUTH0_ENABLED`
- `ANYCAP_AUTH0_ISSUER`
- `ANYCAP_AUTH0_AUDIENCE`
- `ANYCAP_AUTH0_CLIENT_ID`
- `ANYCAP_AUTH0_CLIENT_SECRET`
- `ANYCAP_AUTH0_REDIRECT_URL`

模式建议：

- `stub`：本地开发，允许外部依赖缺失
- `integration`：接 PG / Redis，Auth0/Credit/NexusHub 可 stub 或部分真实接入
- `prod`：所有关键配置缺失时 fail-fast

## 10. 测试策略

### 10.1 单元测试

- 配置加载与 runtime mode 校验
- Auth middleware 的 API Key 识别
- GenerateImageUsecase
  - 参数非法
  - 余额不足
  - 上游失败
  - 扣费失败
  - 重复 `request_id` 不重复扣费
  - 成功
- Login usecase
  - init 成功
  - callback 换 code 成功
  - callback 生成 API Key 成功
  - 重复 callback 不重复生成资源

### 10.2 集成测试

- API Key 鉴权（PG）
- 限流（Redis）
- `/v1/image/generate` HTTP 合约
- `/v1/login/*` HTTP 合约
- `/v1/image/models/:name/schema` HTTP 合约
- Payment webhook 重复投递去重

## 11. 里程碑建议

- Milestone A：现有 Hertz 骨架迁移到目标目录
- Milestone B：配置 / domain / middleware 基础设施就位
- Milestone C：API Key 系统 + 限流 + Infra stubs
- Milestone D：image 主链路打通
- Milestone E：login 主链路、幂等基础设施和本地联调文档补齐
