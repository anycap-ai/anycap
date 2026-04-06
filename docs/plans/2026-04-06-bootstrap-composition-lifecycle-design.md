# Bootstrap Composition And Lifecycle Refactor Design

> Date: 2026-04-06
> Status: Proposed for implementation
> Scope: 拆分 `internal/app/bootstrap.go` 的装配职责，先补统一 lifecycle/runtime，再按 `auth` / `billing` / `media` / `storage` / `web` 拆成 composition 模块

## 1. 背景

当前 server 入口的主要装配逻辑都堆在 [`internal/app/bootstrap.go`](/Users/sczhao/.codex/worktrees/56df/anycap/internal/app/bootstrap.go)：

- 依赖构造
- runtime mode 分支
- feature 推导
- worker 启动
- handler 构造
- router 注册

这带来几个明显问题：

1. 文件过大，阅读和 review 成本持续上升
2. `NewServer(...)` 在构造时直接起 goroutine，构造函数存在副作用
3. worker 使用 `context.Background()` 启动，无法统一 cancel / shutdown
4. 依赖关系按技术细节堆叠，而不是按业务域分组，局部修改需要反复在大文件里跳转
5. 当前测试多数只能从 `buildServerDependencies(...)` 这个大入口去覆盖，边界不够清晰

## 2. 目标

本次重构目标：

1. 拆开“构造”和“运行”，让 bootstrap 先变成可组合、可停止的结构
2. 引入统一 runtime/lifecycle，管理 HTTP server 与后台 worker 的启动和停止
3. 将依赖装配按业务域拆分为 composition 模块：
   - `auth`
   - `billing`
   - `media`
   - `storage`
   - `web`
4. 保持对外行为不变：
   - HTTP API 不变
   - CLI 使用方式不变
   - 配置字段不变
   - feature gate / auth / rate limit 语义不变
5. 将改动控制在 `internal/app` 与 `cmd/anycap-server/main.go` 为主，不向 application/domain 层扩散

## 3. 非目标

本次不做：

1. 不重构 application/domain 层的业务建模
2. 不改已有 handler/service 的对外语义
3. 不引入新的模块框架或插件系统
4. 不顺手重写配置系统、middleware 体系或 router 结构
5. 不改变 runtime mode 的产品语义

## 4. 方案对比

### 4.1 方案 A：只拆文件，不动运行模型

做法：

- 保持 `NewServer -> build deps -> 起 worker -> Run` 形态
- 仅把 `bootstrap.go` 拆成几个文件

优点：

- 改动最小
- 初期回归风险最低

缺点：

- 构造函数副作用仍在
- lifecycle 仍未建模
- 后续补 `Start/Shutdown` 时还会再动一次装配层

### 4.2 方案 B：先 runtime/lifecycle，后 composition

做法：

- 先抽一个很薄的 runtime 层，统一启动和停止 HTTP server + worker
- 再按域拆 composition 文件，但先保持在 `internal/app` 同一 package 内

优点：

- 一次解决当前最关键的结构问题
- 后续拆 composition 时不会再因为 lifecycle 重排一遍
- 风险和收益平衡最好

缺点：

- 首轮比纯拆文件多一些 API 调整
- 需要补启动/关闭路径测试

### 4.3 方案 C：直接引入通用 Module / Builder 框架

做法：

- 每个域实现 `Compose()`、`RegisterRoutes()`、`Hooks()` 之类的统一接口

优点：

- 长期形态最规整

缺点：

- 当前仓库还没到需要显式框架层的复杂度
- 容易把必要重构做成抽象工程

### 4.4 推荐方案

推荐方案 B。

原因：

- 它优先修复真实痛点，而不是只让文件“看起来更整齐”
- 现有 worker 已经支持 `ctx.Done()`，Hertz 也支持显式 shutdown，只是 bootstrap 没有接起来
- 它足够克制，不会把一次入口重构扩散成全栈重写

## 5. 推荐架构

建议把 `internal/app` 先演进成如下结构：

- `bootstrap.go`
  - 顶层 orchestration
  - runtime mode 分发
  - feature provider 构造
  - 路由注册汇总
- `runtime.go`
  - `Server` 或 `Runtime` 的 `Start` / `Run` / `Shutdown`
  - root context
  - worker 生命周期管理
- `compose_auth.go`
- `compose_billing.go`
- `compose_media.go`
- `compose_storage.go`
- `compose_web.go`

### 5.1 Runtime 层职责

runtime 层负责：

1. 保存统一的 root context / cancel
2. 启动后台任务
3. 启动或接管 Hertz server
4. 在 shutdown 时：
   - cancel worker context
   - 调用 HTTP server shutdown
   - 等待必要清理完成

runtime 层不负责：

1. 业务依赖构造
2. handler 组装细节
3. feature 语义判断

### 5.2 Composition 层职责

每个 composition 文件负责两件事：

1. 构造本域依赖和 service
2. 返回本域输出结果

不负责：

1. 启停流程
2. 全局 router 汇总
3. 跨域 feature wiring

### 5.3 顶层汇总方式

顶层 bootstrap 负责：

1. 先构造跨域共享依赖：
   - config
   - build info
   - db / redis / object store
   - feature map / feature provider
2. 按域调用 compose 方法，拿到各自 outputs
3. 构造需要跨域汇总的对象：
   - `systemService`
   - router handlers
   - runtime background tasks

## 6. 模块边界建议

### 6.1 auth composition

包含：

- user provisioner / reader
- api key repo / service
- login session repo
- identity token authenticator
- external id resolver / mapper
- login service

说明：

- `systemService` 不放进 `auth`，因为它横跨 usage / credit / payment / features

### 6.2 billing composition

包含：

- credit client
- payment client
- credit pack specs
- billing repo / service
- payment events repo / service / worker
- checkout idempotency repo

### 6.3 media composition

包含：

- catalog repo / service
- model route repo / service
- capabilities provider / capabilities service
- image / video / music execution clients
- image / video / music services
- usage sync worker
- billing recover worker
- artifact ingest / artifact publisher

### 6.4 storage composition

包含：

- sql db
- space service
- drive / page repos 与 services
- upload / storage object repos
- quota provider
- KV sync client / projector / waiter / worker
- edge grant store
- object store

### 6.5 web composition

包含：

- web crawler
- web search providers
- web service
- feedback notifier / repo / service

## 7. Lifecycle 设计

### 7.1 当前问题

当前 `NewServer(...)` 直接起：

- `kvsyncWorker`
- `usageSyncWorker`
- `billingWorker`
- `paymentEventsWorker`

并且都使用 `context.Background()`。

这意味着：

1. 构造失败与运行失败的边界不清楚
2. 单测里不容易安全验证启动逻辑
3. shutdown 时无法保证 worker 收到 cancel
4. `payment events` 的 graceful stop 路径基本走不到

### 7.2 建议形态

建议把 server 启动分成两层：

1. `NewServer(...)`
   - 只构造对象
   - 不启动 goroutine
2. `Start(...)` / `Run(...)`
   - 创建 root context
   - 启动 worker
   - 启动 HTTP server
3. `Shutdown(ctx)`
   - cancel root context
   - 调用 Hertz shutdown
   - 等待必要清理完成

### 7.3 兼容性要求

可以调整进程内 API，但要保持：

- `cmd/anycap-server/main.go` 仍然是薄入口
- 用户的启动方式不变
- 默认运行效果不变

## 8. 测试策略

### 8.1 第一阶段测试重点

1. 构造函数不再有副作用
2. worker 统一通过 lifecycle 启动
3. shutdown 会 cancel root context
4. payment events / kvsync 等 worker 能走停止路径

### 8.2 第二阶段测试重点

1. `stub` / `dev` / `prod` / `integration` 模式下 composition 输出不变
2. feature provider / auth middleware / router 注册行为不变
3. 原有 bootstrap tests 的覆盖意图保留

## 9. 风险与控制

主要风险：

1. composition 边界划得过细，导致跨模块来回传大量临时对象
2. lifecycle 一次做太大，连带影响启动入口和测试
3. 把 `systemService` 硬塞进某个模块，导致新的耦合

控制手段：

1. 先维持 `internal/app` 单 package，只拆文件和小型 outputs
2. 先引入“足够用”的 runtime，不上抽象框架
3. `systemService` 保留在顶层汇总
4. 每个阶段都优先做行为保持型重构，并用现有测试兜底

## 10. 推荐实施顺序

1. 先落 runtime/lifecycle 骨架
2. 再拆 composition
3. 最后收口 bootstrap 顶层 orchestration 和测试结构

这样可以保证第一阶段结束时，即使 composition 还没完全拆完，系统已经从“难停机的大构造函数”变成“可启动、可关闭、可继续整理”的结构。
