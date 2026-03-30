# 用户-能力维度限流设计

## 1. 背景

当前 AnyCap Server 的受保护路由统一挂载了鉴权和限流中间件，但限流分桶仍然是按“凭证”维度完成的：

- API Key 请求按 `principal.APIKeyID` 分桶
- 非 API Key 的 Bearer token 请求按原始 Bearer token 字符串分桶

这套策略在 CLI 和 Web 认证链路都收敛到同一个本地 `users.id` 的前提下，会带来两个明显问题：

1. 同一个用户在 Web 和 CLI 之间不会共享同一个能力额度
2. 同一个用户持有多个 API Key 时，也不会共享同一个能力额度

同时，当前限流是通用受保护路由限流，无法表达“同一用户在不同能力上的不同额度”，例如：

- `image.generate` 需要更严格的阈值
- `image.read` 可以更宽松
- 系统查询接口如 `/v1/me`、`/v1/logs` 不应该被能力限流误伤

因此需要将限流从“凭证级通用桶”调整为“用户 + 产品能力”的细粒度桶。

## 2. 目标

本次设计目标如下：

1. 将限流分桶改为按 `principal.UserID + capability`
2. 只对“功能接口”限流，不对系统类接口限流
3. 每条参与限流的受保护路由都显式声明一个产品语义 capability
4. 支持“全局默认 RPM + capability 级覆盖”的配置方式
5. 保持现有固定窗口、429、`X-RateLimit-*` header 等外部行为不变

## 3. 非目标

本次不做以下事项：

- 不引入按小时、按天等多窗口限流
- 不引入令牌桶、漏桶、burst bucket
- 不引入匿名接口限流
- 不按模型、供应商、workspace 等维度继续拆桶
- 不改动 Auth0、API Key、用户映射模型

## 4. 设计范围

### 4.1 参与能力限流的接口

本次只对受保护功能接口限流，建议 capability 映射如下：

| Route | Capability |
| --- | --- |
| `POST /v1/image/generate` | `image.generate` |
| `POST /v1/video/generate` | `video.generate` |
| `POST /v1/capabilities/image/read` | `image.read` |
| `POST /v1/capabilities/video/read` | `video.read` |
| `POST /v1/capabilities/presign` | `asset.upload.prepare` |
| `POST /v1/feedback` | `feedback.submit` |
| `POST /v1/drive/folders` | `drive.folder.create` |
| `POST /v1/drive/files/presign` | `drive.file.upload.prepare` |
| `POST /v1/drive/files/complete` | `drive.file.upload.complete` |
| `GET /v1/drive/nodes` | `drive.browse` |
| `PATCH /v1/drive/nodes/:id` | `drive.item.update` |
| `DELETE /v1/drive/nodes/:id` | `drive.item.delete` |
| `PUT /v1/drive/nodes/:id/share` | `drive.share.update` |
| `POST /v1/drive/nodes/:id/share/rotate` | `drive.share.rotate` |
| `DELETE /v1/drive/nodes/:id/share` | `drive.share.revoke` |
| `POST /v1/pages` | `page.create` |
| `GET /v1/pages` | `page.list` |
| `GET /v1/pages/:id` | `page.read` |
| `PATCH /v1/pages/:id` | `page.update` |
| `POST /v1/pages/:id/versions` | `page.version.create` |
| `POST /v1/pages/:id/versions/:vid/files/presign` | `page.asset.upload.prepare` |
| `POST /v1/pages/:id/versions/:vid/files/complete` | `page.asset.upload.complete` |
| `POST /v1/pages/:id/versions/:vid/finalize` | `page.version.finalize` |
| `POST /v1/pages/:id/versions/:vid/publish` | `page.publish` |
| `POST /v1/pages/:id/versions/:vid/rollback-clone` | `page.rollback` |
| `POST /v1/pages/:id/unpublish` | `page.unpublish` |
| `GET /v1/pages/:id/versions` | `page.version.list` |

### 4.2 明确不参与能力限流的接口

以下受保护接口本次不参与能力限流：

- `GET /v1/status`
- `GET /v1/dashboard/summary`
- `GET /v1/me`
- `GET /v1/credits/balance`
- `GET /v1/logs`
- `POST /v1/auth/logout`
- `POST /v1/auth/exchange`
- `POST /v1/auth/device-verify`
- `POST /v1/auth/browser-verify`

这些接口仍然保留现有鉴权要求，但不需要声明 capability，也不进入能力限流分桶。

## 5. 核心方案

### 5.1 路由显式声明 capability

不让限流中间件通过 URL 或 HTTP method 去猜测请求属于哪个能力，而是在路由注册时显式声明 capability。

示意：

```go
g.POST("/generate",
    middleware.WithCapability("image.generate"),
    h.Generate,
)
```

显式声明的价值在于：

- 路由语义稳定，不依赖路径推断
- 新增功能接口时，不容易漏限流或错限流
- capability 名字和产品概念直接对齐，便于后续运营和配置调整

### 5.2 中间件职责分离

建议新增一个非常轻量的 capability 中间件：

- `middleware.WithCapability(name string)`：只负责把 capability 写入请求上下文
- `middleware.RateLimit(...)`：只负责读取 `principal.UserID + capability` 并执行限流

职责划分如下：

1. `Auth` 先完成鉴权并写入 `principal`
2. `WithCapability` 在功能路由上写入 capability
3. `RateLimit` 从上下文读取 `principal.UserID` 和 capability
4. 没有 capability 的请求直接跳过能力限流

### 5.3 新的分桶规则

限流 key 统一改为：

```text
rl:usercap:<userID>:<capability>
```

示例：

- `rl:usercap:2000000001:image.generate`
- `rl:usercap:2000000001:image.read`
- `rl:usercap:2000000001:page.publish`

这意味着：

- 同一 Google/Auth0 用户在 Web JWT 和 CLI API Key 间共享同一个能力桶
- 同一用户不同能力互不影响
- 同一用户多个 API Key 不再绕开能力限流

### 5.4 限流窗口和响应行为

本次保持现有 Redis / InMemory fixed window 实现不变：

- 时间窗：1 分钟
- 超限：`429`
- header：
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

变化仅在于：

- `Limit` / `Remaining` / `Reset` 表示的是“当前用户在当前 capability 下的桶”
- 没有 capability 的受保护接口不会再因为能力限流被拦截

## 6. 配置设计

### 6.1 配置原则

采用“默认值 + capability 级覆盖”的双层配置：

- `ANYCAP_RATE_LIMIT_RPM`：所有功能 capability 的兜底值
- `ANYCAP_RATE_LIMIT_<CAPABILITY>_RPM`：某个 capability 的专属值

示例：

```bash
ANYCAP_RATE_LIMIT_RPM=60
ANYCAP_RATE_LIMIT_IMAGE_GENERATE_RPM=10
ANYCAP_RATE_LIMIT_VIDEO_GENERATE_RPM=5
ANYCAP_RATE_LIMIT_IMAGE_READ_RPM=30
ANYCAP_RATE_LIMIT_PAGE_PUBLISH_RPM=12
```

### 6.2 capability 到环境变量的映射规则

- capability 中的 `.` 转为 `_`
- 全部转大写
- 前缀固定为 `ANYCAP_RATE_LIMIT_`
- 后缀固定为 `_RPM`

例如：

- `image.generate` -> `ANYCAP_RATE_LIMIT_IMAGE_GENERATE_RPM`
- `drive.file.upload.prepare` -> `ANYCAP_RATE_LIMIT_DRIVE_FILE_UPLOAD_PREPARE_RPM`

### 6.3 解析规则

运行时按以下顺序决定某个 capability 的 RPM：

1. 查找 capability 专属环境变量
2. 如果存在有效值，使用专属值
3. 否则回退到 `ANYCAP_RATE_LIMIT_RPM`
4. 如果最终值小于等于 0，则视为该 capability 未启用能力限流

## 7. 代码改动建议

建议改动集中在以下区域：

- `internal/middleware/`
  - 新增 capability 上下文读写工具
  - 改造 `ratelimit.go`
- `internal/config/`
  - 增加 capability 级 RPM 解析能力
- `internal/transport/http/handlers/`
  - 为功能路由显式挂载 capability 中间件
  - 系统和登录支撑接口保持不挂 capability
- `internal/transport/http/router_test.go`
  - 增加按 `user + capability` 分桶的集成回归

## 8. 测试策略

### 8.1 中间件测试

需要覆盖以下行为：

1. 同一用户、同一 capability，在固定窗口内超过阈值后返回 `429`
2. 同一用户、不同 capability，计数互不影响
3. 不同用户、同一 capability，计数互不影响
4. 没有 capability 的请求直接跳过能力限流
5. 继续正确返回 `X-RateLimit-*` 头

### 8.2 路由集成测试

需要覆盖以下行为：

1. Web JWT 和 CLI API Key 只要映射到同一 `principal.UserID`，访问同一 capability 时命中同一个桶
2. `/v1/me`、`/v1/logs`、`/v1/auth/logout` 等系统接口不会进入能力限流
3. `image.generate` 等能力在配置覆盖时优先使用专属 RPM

## 9. 风险与取舍

### 9.1 为什么不通过 path/method 自动推断 capability

自动推断虽然改动集中，但存在几个问题：

- 新增路由时容易遗漏映射
- 路由重命名会引入隐式行为变化
- 一些能力接口名称并不总能直接从 path 反推出产品语义

因此本设计选择“显式声明 capability”，用更小的运行期风险换取更明确的开发约束。

### 9.2 为什么本期不对系统接口限流

系统接口多数是状态查询、用户信息读取、日志查看和登录流程支撑接口：

- 用户体验上更不应该被能力配额误伤
- 这些接口的成本和产品价值，与图片生成、视频理解等能力不同
- 后续如果需要独立保护系统接口，更适合引入另一套更粗粒度的保护策略

## 10. 结论

本次建议采用以下原则落地能力限流：

1. 仅对受保护功能接口限流
2. 路由注册时显式声明产品语义 capability
3. 限流分桶统一使用 `principal.UserID + capability`
4. 配置使用“默认 RPM + capability 级覆盖”
5. 保持 fixed window、429 和 `X-RateLimit-*` 响应语义不变

这套设计可以在不改动现有认证模型的情况下，将限流语义从“凭证保护”升级为“产品能力治理”，并为后续能力级运营和策略调优留下稳定入口。
