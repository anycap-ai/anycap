# AnyCap 本地用户与 Credit 集成实施计划

> Date: 2026-03-25
> Status: Proposed for implementation
> Scope: 为 AnyCap 引入本地 `users + auth_identities` 模型，生成稳定的本地 `user_id`，并将该 `user_id` 用于 API Key、调用日志以及 Credit Service 对接

## 1. 背景

当前 AnyCap 的登录链路已经能完成：

- CLI 发起登录
- Server 与 Auth0 交互
- Server 返回 API Key 给 CLI

但当前实现仍然有一个关键简化：

- 直接把 Auth0 `sub` 当作 AnyCap 的 `user_id`

这会导致两个问题：

1. AnyCap 内部用户模型与 Auth0 身份强耦合
2. 无法直接对接 Credit Service

根据 Credit Service 规范：

- `user_id` 应由业务侧提供
- 所有 credit 调用都需要稳定的业务用户 ID
- 金额单位为 `credit_cent`
- 所有请求都需要 `X-Biz-Token`

因此，AnyCap 在对接真实 Credit 之前，必须先具备自己的本地用户标识体系。

## 2. 本次目标

本次改造目标是：

1. AnyCap Server 在用户首次通过 Auth0 登录时，创建本地用户
2. AnyCap Server 为每个本地用户分配稳定的 `user_id`
3. Auth0 身份与本地用户通过 `auth_identities` 进行映射
4. API Key、调用日志、credit 调用统一使用本地 `user_id`
5. 为后续真实 Credit HTTP adapter 铺平基础

## 3. 硬约束

### 3.1 user_id 范围

本地生成的 `user_id` 必须满足：

```text
2,000,000,000 <= user_id < 3,000,000,000
```

这是本次实现的强约束，不能使用其它区间。

### 3.2 user_id 类型

- 存储层使用 `BIGINT`
- 领域层与接口层为了兼容现有代码，可以阶段性使用字符串承载，但其语义必须代表一个十进制整数 user id
- 后续与 Credit Service 交互时，必须转换为数值型 `user_id`

### 3.3 Auth0 不再直接作为 user_id

- `auth0|abc123` 只能作为外部身份的 `external_subject`
- 不能再直接写入 `api_keys.user_id`
- 不能再直接传给 Credit Service

## 4. 目标数据模型

## 4.1 users

建议新增本地用户表：

- `id BIGINT PRIMARY KEY`
- `email TEXT NULL`
- `name TEXT NULL`
- `avatar_url TEXT NULL`
- `status TEXT NOT NULL DEFAULT 'active'`
- `created_at TIMESTAMPTZ NOT NULL`
- `updated_at TIMESTAMPTZ NOT NULL`

职责：

- 表示 AnyCap 的本地用户实体
- 承载后续 user status / profile / policy 等能力

## 4.2 auth_identities

建议新增外部身份映射表：

- `id BIGSERIAL PRIMARY KEY`
- `user_id BIGINT NOT NULL`
- `provider TEXT NOT NULL`
- `external_subject TEXT NOT NULL`
- `email TEXT NULL`
- `raw_profile JSONB NULL`
- `created_at TIMESTAMPTZ NOT NULL`
- `updated_at TIMESTAMPTZ NOT NULL`
- `UNIQUE(provider, external_subject)`

职责：

- 记录本地用户与外部身份源的映射
- 当前第一种 provider 为 `auth0`
- 后续可扩展为其它登录源

## 4.3 api_keys

当前 `api_keys.user_id` 是 `TEXT`。

目标状态应调整为：

- `api_keys.user_id` 语义上引用 `users.id`
- 推荐迁移到 `BIGINT`

如果为了降低本轮风险，也可以采用过渡方案：

- 数据库列仍暂时保留 `TEXT`
- 但只允许写入十进制数字字符串，如 `2000000001`

推荐顺序：

1. 先让写入值从 Auth0 `sub` 改为本地数值 user id 字符串
2. 再在后续迁移中把列类型收敛到 `BIGINT`

## 4.4 call_logs

当前 `call_logs.user_id` 也是 `TEXT`。

与 `api_keys` 一样，建议采用同样的迁移节奏：

- 先把值改为本地数值 user id 字符串
- 后续再收敛成 `BIGINT`

## 5. user_id 生成方案

## 5.1 推荐方案：PostgreSQL sequence

推荐使用 PostgreSQL sequence 分配用户 ID：

- 新建 sequence，起始值为 `2000000000`
- 每次创建用户时取下一个值
- 创建逻辑中检查上限，确保 `< 3000000000`

例如：

- sequence name: `anycap_user_id_seq`
- `START WITH 2000000000`
- `INCREMENT BY 1`
- 不允许超过 `2999999999`

### 5.2 为什么推荐 sequence

原因：

- 单机实现简单
- PG 已经是当前 server 的主存储
- 不需要单独引入号段服务
- 对 MVP 足够稳定

### 5.3 上限保护

实现中必须有显式保护：

- 如果分配结果 `>= 3000000000`
- 直接返回内部错误并阻止新用户创建

这一步不能只依赖人工约定。

## 6. 登录流程目标改造

当前流程是：

1. Auth0 返回 `sub`
2. Server 直接用 `sub` 创建 API Key

目标流程改为：

1. Auth0 返回：
   - `sub`
   - `email`
   - `name`
   - `picture`
2. Server 查找 `auth_identities(provider='auth0', external_subject=sub)`
3. 如果存在：
   - 取出对应 `user_id`
   - 按需更新 profile
4. 如果不存在：
   - 生成新的本地 `user_id`
   - 创建 `users`
   - 创建 `auth_identities`
5. 用该本地 `user_id` 创建 API Key
6. 后续所有业务请求都使用该本地 `user_id`

## 7. Credit 集成目标改造

在有了本地 `user_id` 之后，真实 Credit adapter 应满足：

### 7.1 GetBalance

调用：

```text
POST {endpoint}/api/v1/credit/balance/get
```

请求：

```json
{"user_id": 2000000001}
```

Header：

```text
X-Biz-Token: <biz-token>
```

返回中读取：

- `credit_cent_balance`

并转换成 AnyCap 当前内部的 `credit` 单位：

```text
available = credit_cent_balance / 100
```

### 7.2 Deduct

调用：

```text
POST {endpoint}/api/v1/credit/consume
```

请求：

```json
{
  "user_id": 2000000001,
  "credit_cent_amount": 100,
  "source_id": "anycap-image-generate-<request_id>",
  "description": "image.generate | model:flux-dev"
}
```

转换规则：

- AnyCap 当前内部 `1 credit` = Credit Service `100 credit_cent`
- 因此：
  - `credit_cent_amount = amount * 100`

### 7.3 错误映射

建议先做最小错误映射：

- `code = 0` -> success
- `code = 2001` -> `model.ErrInsufficientCredit`
- 其它非零码 -> `model.ErrBillingUncertain`

## 8. 配置项建议

为真实 Credit adapter 增加配置：

- `ANYCAP_CREDIT_BASE_URL`
- `ANYCAP_CREDIT_BIZ_TOKEN`
- 可选：`ANYCAP_CREDIT_TIMEOUT_SECONDS`

约束：

- endpoint 只能从配置读取，不能硬编码
- biz token 只能从环境变量读取，不能写入仓库

## 9. 实施顺序建议

### Task 1: 补 users + auth_identities 设计与 migration

文件建议：

- `internal/domain/model/user.go`
- `internal/domain/port/user.go`
- `internal/infrastructure/user/...`
- `internal/infrastructure/apikey/migrations/0005_users.sql`

目标：

- 建立本地用户与外部身份映射
- 落实 `user_id` 范围规则

### Task 2: 改 login use case

目标：

- 登录成功后不再直接使用 Auth0 `sub` 作为 user id
- 改为先查找/创建本地用户，再签发 API Key

### Task 3: 调整 API Key / Principal / CallLog 的 user_id 语义

目标：

- `user_id` 统一改为本地 user id
- 先允许字符串承载十进制数字，减少大改范围

### Task 4: 实现真实 Credit HTTP client

目标：

- `GetBalance`
- `Deduct`
- `X-Biz-Token`
- `credit_cent` 转换
- 错误码映射

### Task 5: bootstrap 接线

目标：

- 有 credit 配置时使用真实 adapter
- 无 credit 配置时继续回退 stub

## 10. 本次不做的内容

以下内容不在这一轮实现中：

- Dashboard 页面开发
- Payment checkout / subscription / webhook
- Credit grant / transfer / transaction list 全量能力
- users 表的复杂 profile 管理
- 多 provider 账号合并策略

## 11. 一句话结论

要打通真实 Credit，AnyCap 必须先停止“直接用 Auth0 `sub` 当 user_id”的 MVP 简化做法，改成：

- AnyCap 自己生成本地 `user_id`
- `user_id` 必须满足 `2,000,000,000 <= user_id < 3,000,000,000`
- Auth0 只负责外部身份确认
- API Key、调用日志、Credit Service 全部统一使用本地 `user_id`

这是后续真实 credit 集成的前置条件。
