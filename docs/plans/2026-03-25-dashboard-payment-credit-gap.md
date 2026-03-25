# Dashboard / Payment / Credit 当前差距与 MVP 路线

> Date: 2026-03-25
> Status: Active gap review
> Scope: 对照 `docs/system-architecture.md`，梳理 Dashboard、Server、Payment、Credit 的目标职责、当前实现状态与最小 MVP 落地顺序

## 1. 目标架构结论

根据 [docs/system-architecture.md](../system-architecture.md)，目标职责边界应为：

### 1.1 Server

`anycap-server` 负责：

- Auth0 登录编排
- API Key 生成、验证、吊销
- capability 调用路由
- 调用前查余额、调用后扣减 credit
- 记录 usage / logs
- 向 Dashboard 提供 usage / logs / control 类查询能力

### 1.2 Dashboard

Dashboard 面向人类用户，负责：

- 查看 billing
- 查看 usage
- 查看 logs
- 做 control 类管理操作
- 发起支付 / 订阅

### 1.3 Payment

Payment 负责：

- checkout session
- subscription session
- Stripe webhook 处理
- 支付成功后把充值结果写入 Credit

### 1.4 Credit

Credit 负责：

- 存储用户 credit 余额
- 响应 Server 的余额查询 / 扣减请求
- 响应 Payment 的充值写入请求

## 2. 当前代码状态

## 2.1 Dashboard：只有静态壳子，还没有真实数据链路

当前 `web` 已经有 dashboard 页面骨架：

- [web/src/app/(dashboard)/layout.tsx](/Users/sczhao/dev/Projects/converge-ai/ai-infra/anycap/web/src/app/(dashboard)/layout.tsx)
- [web/src/app/(dashboard)/dashboard/page.tsx](/Users/sczhao/dev/Projects/converge-ai/ai-infra/anycap/web/src/app/(dashboard)/dashboard/page.tsx)
- [web/src/app/(dashboard)/billing/page.tsx](/Users/sczhao/dev/Projects/converge-ai/ai-infra/anycap/web/src/app/(dashboard)/billing/page.tsx)
- [web/src/app/(dashboard)/usage/page.tsx](/Users/sczhao/dev/Projects/converge-ai/ai-infra/anycap/web/src/app/(dashboard)/usage/page.tsx)
- [web/src/app/(dashboard)/logs/page.tsx](/Users/sczhao/dev/Projects/converge-ai/ai-infra/anycap/web/src/app/(dashboard)/logs/page.tsx)

但这些页面目前基本都是：

- 导航布局
- 标题
- `Coming soon.` 占位文案

当前还没有：

- 调 server 的 API 请求
- billing summary 数据
- usage 聚合数据
- logs 列表
- checkout / subscription 入口

补充说明：

- [web/.env.example](/Users/sczhao/dev/Projects/converge-ai/ai-infra/anycap/web/.env.example) 虽然定义了 `NEXT_PUBLIC_API_URL`
- 但当前 `web/src` 中没有实际使用它发请求的代码

结论：Dashboard 目前仍处于 UI scaffold 阶段。

## 2.2 Server -> Credit：有接口和 stub 逻辑，但没有真实对接

当前 server 的 image 生成链路已经接入 credit 抽象：

- port 定义：[internal/domain/port/credit.go](/Users/sczhao/dev/Projects/converge-ai/ai-infra/anycap/internal/domain/port/credit.go)
- 应用层调用：[internal/application/image/service.go](/Users/sczhao/dev/Projects/converge-ai/ai-infra/anycap/internal/application/image/service.go)

当前行为包括：

- 调用前查余额
- 调用后扣减 credit
- 基于 `request_id` 做幂等 deduct

但实际实现仍然是 stub：

- [internal/infrastructure/credit/client_stub.go](/Users/sczhao/dev/Projects/converge-ai/ai-infra/anycap/internal/infrastructure/credit/client_stub.go)

并且在 runtime 装配里，`dev/prod/integration` 也仍然使用 stub：

- [internal/app/bootstrap.go](/Users/sczhao/dev/Projects/converge-ai/ai-infra/anycap/internal/app/bootstrap.go)

结论：

- Server 和 Credit 的交互边界已经存在
- 但还没有接到真实 credit 系统

## 2.3 Payment：只有 port，没有真实实现

当前仓库里 Payment 仍停留在接口层：

- [internal/domain/port/payment.go](/Users/sczhao/dev/Projects/converge-ai/ai-infra/anycap/internal/domain/port/payment.go)

当前没有看到：

- `internal/infrastructure/payment/...` 真实适配器
- payment application service
- payment transport handler
- checkout / subscription / webhook 路由
- dashboard 侧支付调用

结论：Payment 当前基本是“边界预留”，尚未进入功能开发阶段。

## 2.4 Dashboard -> Server：目标明确，但接口还没做

根据系统架构文档，Dashboard 应通过 Server 读取：

- usage
- logs
- control 数据

当前 server 还没有这些 dashboard-facing API：

- `GET /v1/billing/summary`
- `GET /v1/usage/summary`
- `GET /v1/logs`
- `GET /v1/credits/balance`
- `POST /v1/billing/checkout`

目前 server 暴露的更多是：

- login
- status
- image / catalog / capabilities

结论：Dashboard 和 Server 的真实数据接口尚未开始建设。

## 2.5 Payment -> Credit：设计上应存在，代码里还不存在

根据系统架构文档，支付成功后应有链路：

- Payment 接收 Stripe webhook
- Payment 给 Credit 增加额度
- Dashboard 显示新余额

当前代码里还没有：

- webhook 处理器
- top-up / subscription session 实现
- credit top-up 写入逻辑
- dashboard 余额刷新逻辑

结论：这条商业化链路目前尚未落地。

## 3. 当前总体判断

当前实现和目标架构的对应关系如下：

### 3.1 已有雏形

- Server API Key / login / rate limit 主链路
- Server image.generate 的 credit 调用边界
- Dashboard 的页面骨架
- Payment / Credit 的 domain port 边界

### 3.2 仍是 stub 或占位

- Credit：stub
- Dashboard 页面：占位
- Payment：仅 port

### 3.3 尚未真正打通的链路

- Dashboard -> Server（usage / logs / billing summary）
- Dashboard -> Payment（checkout / subscription）
- Payment -> Credit（充值写入）
- Server -> Credit（真实余额与扣费）

## 4. 最小 MVP 路线建议

如果目标是尽快做出“人类可用的 dashboard + billing MVP”，建议按下面顺序推进。

### Phase A：先打通 Server -> Credit 真实链路

先做：

- 真实 `CreditClient` 适配器
- 真实 `GetBalance`
- 真实 `Deduct`
- 对齐当前 image.generate 的扣费链路

这样至少能保证：

- usage / 余额是真实的
- dashboard 后面读到的数据有业务意义

### Phase B：补 Dashboard 读数据 API

优先补 server 接口：

- `GET /v1/credits/balance`
- `GET /v1/usage/summary`
- `GET /v1/logs`

这三类接口一旦有了，Dashboard 即使还没有支付，也能先具备：

- 看余额
- 看 usage
- 看 logs

这是一个很不错的“只读型 dashboard MVP”。

### Phase C：补 Dashboard 页面真实渲染

在 `web` 中实现：

- Billing 页显示当前余额
- Usage 页显示汇总 usage
- Logs 页显示最近调用日志

这一阶段仍然可以不做真实 payment，只先做 dashboard 可视化。

### Phase D：补 Payment checkout / webhook

最后再进入商业化闭环：

- `POST /v1/billing/checkout`
- `POST /v1/billing/subscription`
- `POST /v1/payment/webhook`
- Payment 成功后给 Credit 充值

这一阶段完成后，Dashboard 才能真正具备：

- 充值
- 订阅
- 自动到账

## 5. 当前最值得优先做的最小集合

如果只选一个最小、最有价值的下一步，我建议是：

1. 真实 CreditClient
2. `GET /v1/credits/balance`
3. `GET /v1/logs`
4. Dashboard 的 Billing / Logs 页面接这两个接口

原因：

- 改动范围相对可控
- 能最快把 Dashboard 从“纯占位”推进到“可读真实数据”
- 不会一开始就被 Stripe / webhook / 订阅复杂度拖住

## 6. 一句话结论

根据系统架构文档：

- `Server` 应与 `Credit` 真实交互
- `Dashboard` 应一边通过 `Server` 读取 usage / logs / control，一边通过 `Payment` 发起 billing
- `Payment` 支付成功后再写回 `Credit`

而当前代码状态是：

- `Server -> Credit`：只有 stub
- `Dashboard -> Server`：还没做真实 API 调用
- `Dashboard -> Payment`：还没实现
- `Payment -> Credit`：还没实现

因此，Dashboard / Payment / Credit 目前仍明显停留在“架构已设计、功能未打通”的阶段。
