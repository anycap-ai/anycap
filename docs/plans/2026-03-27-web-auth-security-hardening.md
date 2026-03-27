# Web 认证安全改造方案

> Date: 2026-03-27
> Status: Proposed
> Scope: Web 端认证机制从 JS 可读 API Key 迁移到 httpOnly cookie
> References: [web-auth-flows.md](2026-03-26-web-auth-flows.md), [anycap-auth-apikey-lifecycle.md](2026-03-25-anycap-auth-apikey-lifecycle.md)

## 1. 问题

当前 Web 端认证实现偏离了原始设计。原始设计文档 (`web-auth-flows.md`) 明确要求：

> "API key never touches the browser."

但实际实现中，API Key 存储在 JS 可读的 cookie 中：

```typescript
// 当前实现 — session.ts
setSessionCookie({
  apiKey: data.api_key,   // API Key 暴露给 JS
  user: { id, email, name },
  issuedAt: Date.now(),
});
```

### 1.1 风险

| 风险 | 等级 | 说明 |
|------|------|------|
| XSS 窃取凭证 | **高** | 任何 XSS 漏洞（含第三方依赖）可窃取 API Key 并在外部设备使用 |
| API Key 长生命周期 | 中 | 被盗后无自动过期，窗口期长 |
| 无 token rotation | 中 | 30 天内复用同一凭证 |
| CLI 和 Web 共用认证模型 | 低 | API Key 为 CLI 设计，Web 威胁模型不同 |

### 1.2 偏离原因

原始设计假设 Next.js 作为 BFF 代理所有 API 请求。但实际中 Web 端需要直接从浏览器调用后端（测试环境后端在内网，Cloudflare Edge / Next.js Server 无法访问），因此 API Key 不得不暴露给客户端 JS 来构造 `Authorization` header。

## 2. 目标

- API Key 不再暴露给浏览器 JS
- 保持"所有 API 调用从客户端发起"的约束（不走 SSR 代理）
- CLI 认证方式不变（仍用 Bearer token）
- 改动范围最小化

## 3. 方案：后端直接种 httpOnly Cookie

核心思路：**让后端直接给浏览器种 httpOnly cookie，浏览器自动携带，JS 永远碰不到凭证。**

### 3.1 改造后的认证模型

```
CLI:     Authorization: Bearer <api_key>     ← 不变
Web:     Cookie: anycap_web=<signed-token>   ← 新增，httpOnly，JS 不可读
```

后端 auth middleware 同时支持两种认证方式，优先检查 Bearer header，fallback 到 cookie。

### 3.2 改造后的登录流程

```mermaid
sequenceDiagram
    participant B as Browser
    participant S as AnyCap Server
    participant A as Auth0

    B->>S: POST /v1/auth/callback {code, state} (credentials: include)
    S->>A: Exchange code for token, get userinfo
    S->>S: FindOrCreateUser + Create session token
    S-->>B: JSON: {user: {id, email, name, avatar_url}}
    Note over S,B: Set-Cookie: anycap_web=<signed>; HttpOnly; Secure; SameSite=None

    B->>B: Store user info in lightweight cookie (no credential)
    B->>S: GET /v1/me (credentials: include)
    Note over B,S: Browser auto-sends anycap_web cookie
    S-->>B: {user data}
```

关键变化：
- `/v1/auth/callback` 的 JSON 响应**不再包含 api_key**（Web 模式下）
- 凭证通过 `Set-Cookie` header 种到浏览器，JS 看不到
- 前端 fetch 加 `credentials: "include"` 即可，不需要手动构造 `Authorization` header

### 3.3 Cookie 规格

| 属性 | 值 | 说明 |
|------|------|------|
| Name | `anycap_web` | 区别于前端的 `anycap_session` |
| Value | 签名 token（HMAC-SHA256 或 AES-GCM 加密的 session ID） | 不可伪造 |
| HttpOnly | `true` | JS 不可读 |
| Secure | `true` | 仅 HTTPS |
| SameSite | `None` | 跨域请求需要携带（前端和后端不同域） |
| Domain | `.anycap.ai` | 前端 `anycap.ai` → 后端 `api.anycap.ai` 共享 |
| Path | `/` | 所有路径 |
| Max-Age | `604800`（7 天） | 比当前 30 天更短，降低风险 |

### 3.4 前端 cookie 变化

前端仍保留一个 **轻量级** cookie 用于 auth guard 和 UI 展示，但**不再包含 API Key**：

```typescript
// 改造后 — 前端 cookie 只有用户信息，无凭证
type SessionPayload = {
  user: { id: string; email?: string; name?: string };
  issuedAt: number;
  // apiKey 字段移除
};
```

| 用途 | 改造前 | 改造后 |
|------|--------|--------|
| Auth guard (middleware) | 检查 `apiKey` 是否存在 | 检查 `user.id` 是否存在 |
| UI 展示（名字、邮箱） | 从 cookie 读 | 从 cookie 读（不变） |
| API 请求认证 | JS 读 apiKey → `Authorization: Bearer` | `credentials: "include"` → 浏览器自动带 httpOnly cookie |

### 3.5 CORS 配置

后端需要更新 CORS 配置以支持 `credentials: "include"`：

```go
// CORS middleware
AllowOrigins:     []string{"https://anycap.ai", "https://*.anycap-web.pages.dev"}
AllowCredentials: true                    // 必须
AllowHeaders:     []string{"Content-Type"}  // 不再需要 Authorization (Web)
AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
```

注意：`AllowOrigins` 不能用 `*`，必须显式列出。开发/预览环境需要额外配置。

### 3.6 开发环境

| 环境 | 前端 | 后端 | Cookie Domain |
|------|------|------|------|
| 本地开发 | `localhost:3000` | `localhost:8080` | 不设 Domain（localhost 不需要） |
| Dev | `*.anycap-web.pages.dev` | `anycap-server.dev.knoffice.tech` | 不同域，无法共享 cookie |
| 生产 | `anycap.ai` | `api.anycap.ai` | `.anycap.ai` |

**Dev 环境问题**：前端和后端不在同一个顶级域下，httpOnly cookie 无法通过 `Domain` 属性共享。解决方案：

- **方案 A**：Dev 后端加一个别名 `api.dev.anycap.ai`，cookie domain 设为 `.dev.anycap.ai`，前端也用 `app.dev.anycap.ai`
- **方案 B**：Dev 环境保持当前 Bearer token 方式，仅生产环境使用 httpOnly cookie
- **推荐方案 A**，保持环境一致性

## 4. 改动清单

### 4.1 后端改动

| 改动 | 文件/模块 | 说明 |
|------|-----------|------|
| Auth middleware 支持 cookie | `internal/middleware/auth.go` | 检查顺序：Bearer header → `anycap_web` cookie |
| Login callback 种 cookie | `internal/transport/http/handlers/login.go` | Web 模式下，响应头加 `Set-Cookie`，body 不返回 api_key |
| 签名 token 生成/验证 | `internal/infrastructure/auth/` | 新建 web session token 的签发与验证逻辑 |
| Logout 清除 cookie | `internal/transport/http/handlers/system.go` | 响应头加 `Set-Cookie: anycap_web=; Max-Age=0` |
| CORS 配置 | `internal/middleware/cors.go` | 支持 credentials，显式 allow origins |
| Web session 生命周期 | `internal/domain/model/` | 7 天过期，可选 sliding window 续期 |

### 4.2 前端改动

| 改动 | 文件 | 说明 |
|------|------|------|
| API client 加 credentials | `src/lib/api/client.ts` | fetch 加 `credentials: "include"`，移除手动 Authorization header |
| Session cookie 去掉 apiKey | `src/lib/auth/session.ts` | `SessionPayload` 移除 `apiKey` 字段 |
| Callback 不再存 apiKey | `src/app/auth/callback/CallbackClient.tsx` | 只存 user info 到前端 cookie |
| Auth guard 改判断条件 | `src/middleware.ts` + `layout.tsx` | 检查 `user.id` 而非 `apiKey` |
| SWR hooks 移除 apiKey 依赖 | `src/lib/api/hooks.ts` | fetcher 不再需要 apiKey，直接 fetch with credentials |
| Logout 调后端清 cookie | `src/components/auth/LogoutButton.tsx` | 确保调 POST /v1/auth/logout (credentials: include) 清除后端 cookie |

### 4.3 不变的部分

- CLI 认证方式（Bearer token）
- Auth0 集成逻辑
- Device code flow（CLI 场景）
- 后端 API Key 签发和管理

## 5. 安全对比

| 维度 | 改造前 | 改造后 |
|------|--------|--------|
| XSS 可窃取凭证 | 可以（JS 读 cookie） | **不可以**（httpOnly） |
| XSS 可冒充请求 | 可以 | 可以（但凭证不会泄露到外部） |
| CSRF | 天然防护（手动 header） | 需要注意（cookie 自动发送），`SameSite=None` 下依赖 CORS origin 检查 |
| 凭证生命周期 | ~30 天（cookie 过期） | 7 天（可 sliding window 续期） |
| Token rotation | 无 | 可在续期时轮换 |
| CLI 影响 | - | 无影响 |

## 6. CSRF 防护说明

改造后使用 cookie 自动发送，需要关注 CSRF。当前方案的防护依赖：

1. **CORS origin 检查**：后端只允许 `https://anycap.ai` 等白名单 origin，恶意站点的跨域请求会被浏览器拦截
2. **SameSite=None + Secure**：仅 HTTPS 下发送
3. **所有写操作用 POST**：浏览器的 CORS preflight（OPTIONS）会先检查 origin

如果未来需要更强的 CSRF 防护，可以加 CSRF token（双重 cookie 模式），但当前阶段 CORS 已足够。

## 7. 实施顺序

建议分两步：

**Phase 1 — 后端双模认证 + 前端迁移**
1. 后端 auth middleware 支持 Bearer + cookie 双模
2. 后端 login callback 在 Web 模式下种 httpOnly cookie
3. 后端 CORS 配置
4. 前端迁移到 `credentials: "include"`
5. 前端 cookie 移除 apiKey

**Phase 2 — 生命周期加固**
1. Web session 7 天过期
2. 可选：sliding window 续期
3. 可选：token rotation

Phase 1 完成后即消除 XSS 窃取凭证的风险。Phase 2 进一步收紧。
