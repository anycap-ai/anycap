# Capability Execution Flow Refactor Design

> Date: 2026-04-06
> Status: Proposed for implementation
> Scope: 收口 `image` / `video` / `music` / `web` / `capabilities` 中重复的 billing、usage、call log、artifact 等横切执行逻辑，首版先覆盖生成类能力

## 1. 背景

AnyCap 当前的 server 分层整体仍然清晰，但能力执行链路已经出现明显的“复制式增长”：

- `internal/application/image/service.go`
- `internal/application/video/service.go`
- `internal/application/music/service.go`
- `internal/application/web/service.go`
- `internal/application/capabilities/service_invoke.go`

这些 service 在业务本体上不同，但外围的执行外壳高度相似：

1. 校验请求和依赖
2. 校验用户余额
3. 创建 billing intent
4. 调用上游 provider
5. 记录 provider success / failure
6. 写 usage event / provider run
7. 调用 Credit Service 扣费
8. 写 call log
9. 某些能力再追加 artifact publish 或 task/audit

随着更多 capability 和 operation 继续增加，这种重复会带来几个问题：

- 修一个 billing 或 usage 的 bug 要改多个 service
- 多人并发开发时容易在相似代码里产生漂移
- `SetXxx` / `WithXxx` + `nil` 语义让依赖关系越来越隐式
- review 时很难快速区分“业务差异”与“平台外壳”

## 2. 目标

本次设计目标：

1. 抽出一层共享的 capability execution flow，用来承载横切编排
2. 让 `image/video/music` 的主链路先接入共享执行层
3. 为 `web` 和 `capabilities` 预留接入点，但不强行统一其特有逻辑
4. 不改变对外 API、请求/响应格式和已有 capability 语义
5. 尽量减少首轮改动范围，优先降低重复和未来冲突

## 3. 非目标

本次不做：

1. 不重写整个 `internal/application` 目录结构
2. 不把所有 capability service 合并成一个 mega service
3. 不把 route selection、upload resolution、artifact publish、task audit 全部抽成通用逻辑
4. 不同时重构 `bootstrap` 和 capability service
5. 不引入新的异步任务模型或改变同步调用行为

## 4. 方案对比

### 4.1 方案 A：只在各自 service 内整理辅助函数

做法：

- 保持每个 service 自己管理 billing / usage / call log
- 仅提取本文件内部 helper 函数

优点：

- 改动最小
- 风险最低

缺点：

- 无法解决跨 service 的重复问题
- 无法建立统一执行约束
- 后续新 capability 仍会继续复制

### 4.2 方案 B：新增共享 execution flow 层，分阶段接入

做法：

- 在 `internal/application/` 下新增一个共享执行包
- 该包只处理横切编排，不处理业务差异
- 第一阶段先接 `image/video/music`
- 第二阶段再接 `web`
- 第三阶段只让 `capabilities` 复用适合共享的那部分逻辑

优点：

- 改动可控
- 收益直接体现在减少重复和降低耦合
- 有利于多人协作下的模式统一

缺点：

- 首轮需要设计清晰的 hooks / metadata 边界
- 一段时间内会存在“新老两种模式并存”

### 4.3 方案 C：统一所有 capability service 的完整执行模型

做法：

- 不仅抽 billing / usage / log
- 还把 route selection、artifact publish、audit/task 都统一建模

优点：

- 理论上抽象最完整

缺点：

- 容易把差异场景强行揉进统一模型
- 首轮复杂度过高
- 很可能引入过度抽象

### 4.4 推荐方案

推荐方案 B。

原因：

- 它聚焦真正重复的横切逻辑
- 它不会把差异场景硬抽象掉
- 它允许以 `image/video/music` 为试点验证方向
- 它对当前仓库和团队协作方式最友好

## 5. 推荐架构

建议新增包：

- `internal/application/execflow/`

这个包的职责是：

- 管理执行前的余额校验
- 管理 billing intent 的创建和推进
- 管理 provider 成功/失败后的统一收口
- 管理 credit 扣减
- 管理 usage / provider run / call log 的统一写入
- 暴露有限的 hooks，让业务 service 提供自己的差异行为

它不负责：

- 请求校验
- capability-specific route selection
- upload ref resolution
- artifact publish 的 media-specific 语义
- capabilities read 的 task 和 artifact audit

### 5.1 核心对象

建议先保持朴素建模，不做过早泛型泛化。

#### `Executor`

持有共享横切依赖：

- `port.BillingCoordinator`
- `port.CreditClient`
- `port.UsageWriter`
- `port.CallLogRepo`
- `now func() time.Time`

#### `ExecutionInput`

承载执行上下文：

- `UserID`
- `APIKeyID`
- `Capability`
- `Provider`
- `RequestID`
- `Model`
- `MinCredit`

#### `ExecutionHooks`

由各业务 service 提供：

- `Invoke`
  真正调用 provider
- `OnProviderSuccess`
  从 provider 结果提取账务和 provider metadata
- `AfterSuccess`
  处理 artifact publish 等成功后特有逻辑
- `BuildUsageRecords`
  返回 usage event / provider run 所需数据
- `BuildCallLog`
  返回 call log 条目

## 6. 业务边界

### 6.1 应该进入共享执行层的逻辑

适合共享：

- `credit.GetBalance`
- `billing.CreateOrGetIntent`
- `billing.RecordProviderSuccess`
- `billing.MarkUncertain`
- `credit.Deduct`
- `billing.MarkDeducted`
- `usage.InsertUsageEvent`
- `usage.InsertProviderRun`
- `callLogs.Insert`

这些逻辑目前在 `image/video/music` 中接近复制粘贴。

### 6.2 应该保留在各自 service 的逻辑

必须保留：

- `image/video/music` 的 model lookup 和 route selection
- `image/video` 的 upload ref resolution
- `music` 的特殊 request / result 语义
- `web` 的 search / crawl provider 差异
- `capabilities` 的 input resolve、task、artifact audit

### 6.3 `capabilities` 的特殊处理

`capabilities` 不建议首轮完整接入。

原因：

- 它除了 billing / call log，还涉及：
  - `resolveActor`
  - `resolveInputURL`
  - `runUnderstandTask`
  - `writeTaskArtifacts`
- 这些行为更接近“审计任务编排”，不是普通生成类能力

因此更合理的方式是：

- 首轮只让它未来复用共享层中的 billing / deduct / call log 子能力
- task / audit 仍留在 `internal/application/capabilities/`

## 7. 分阶段实施

### 7.1 第一阶段：`image/video/music`

目标：

- 用最小切片验证共享执行层可行
- 去掉三份最明显的重复逻辑

特点：

- 对外行为不变
- 不修改路由
- 不修改 `bootstrap`

### 7.2 第二阶段：`web`

目标：

- 让 `web.search` / `web.crawl` 也使用统一 balance / billing / deduct / call log 模式

特点：

- 不强求完整 provider run 统一
- 可只复用共享层中的部分 hooks

### 7.3 第三阶段：`capabilities`

目标：

- 只复用真正共性的 billing/logging 部分

特点：

- task / audit 保持独立
- 避免为了统一而破坏 read-path 的特殊语义

## 8. 风险与控制

### 8.1 主要风险

1. 首轮抽象边界过大，导致 hooks 复杂度反而高于原始实现
2. 抽象时把 capability-specific 逻辑错误移入共享层
3. 行为回归出现在 `billing uncertain`、`usage`、`artifact publish` 的边界条件

### 8.2 控制策略

1. 只先覆盖 `image/video/music`
2. 先补测试，再搬逻辑
3. 共享层只处理“已有共同模式”，不预支未来需求
4. `web` 和 `capabilities` 等第二、三阶段再单独评估是否适配

## 9. 测试策略

### 9.1 共享执行层测试

新增针对 `execflow` 的单元测试，覆盖：

- 余额不足时提前失败
- provider 失败时 `MarkUncertain`
- provider 成功但 deduct 失败时返回 `ErrBillingUncertain`
- usage / call log 写失败不影响主结果
- `AfterSuccess` 失败时沿用现有失败语义

### 9.2 业务 service 回归测试

保留并更新：

- `internal/application/image/service_test.go`
- `internal/application/video/service_test.go`
- `internal/application/music/service_test.go`

确保以下行为不变：

- route selection 仍正确
- `image/video` 的 upload ref resolution 仍在 provider 调用前发生
- artifact publish 仍只在对应 capability 生效

## 10. 成功标准

本设计完成后，以下条件成立：

1. `image/video/music` 的 billing / usage / call log 主流程不再三处重复实现
2. 共享层对外只暴露有限、清晰的执行接口
3. 原有能力 API 行为不变
4. 现有测试继续通过，且新增共享层测试覆盖关键边界
5. 新 capability 后续可以优先复用 `execflow`，而不是再次复制外壳
