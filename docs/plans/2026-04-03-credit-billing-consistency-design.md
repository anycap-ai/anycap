# AnyCap Credit 扣费一致性设计

> Date: 2026-04-03
> Status: Proposed for implementation
> Scope: 解决能力调用成功后 AnyCap 在本地落账或扣费前崩溃导致的 credit 坏账问题，首版覆盖生成类与 read 类能力

## 1. 背景

当前 AnyCap 的扣费链路有一个共同问题：

- 先调用能力上游
- 上游成功返回后，AnyCap 再尝试写本地使用记录
- 然后再调用 Credit Service 扣费

这会产生两个明确坏账窗口：

1. 上游已经成功，但 AnyCap 在本地落 usage/provider task 之前崩溃
2. 本地已经拿到结果，但 AnyCap 在 `credit.Deduct()` 之前崩溃

对于 `image.read` / `video.read` / `audio.read`，问题更严重，因为当前链路连 `usage_events/provider_runs` 都不写，成功后直接进入 `Deduct()`。

## 2. 已确认前提

本设计建立在以下前提上：

1. 生成类能力当前主要上游为 NexusHub
2. NexusHub 返回服务端生成的 `task_id`，形如 `atomic_<uuid>`
3. AnyCap 提交请求时可以传稳定的 `request_id`
4. NexusHub 将新增能力：
   - 持久化 `request_id`
   - 支持按 `request_id` 查询任务
5. Credit Service 的消费调用已经具备按 `source_id` 幂等的前提，AnyCap 继续使用：

```text
source_id = anycap-<capability>-<request_id>
```

## 3. 目标

本次设计目标：

1. 让 AnyCap 对“应扣费”形成自己的本地真相源
2. 在进程崩溃、超时、网络中断后，可基于 `request_id` 恢复并补扣
3. 不改变现有 CLI 的同步阻塞交互方式
4. 首版尽量小改，不把整条能力链路重构为异步任务平台

## 4. 非目标

本次不做：

1. 不引入完整 invoice / statement / billing portal
2. 不改造 CLI 为“先返回 task_id 再轮询”的异步交互
3. 不引入复杂 reservation / hold 余额模型
4. 不要求 NexusHub 立刻支持提交幂等，只要求支持按 `request_id` 查询
5. 不把 usage dashboard 的所有投影逻辑并入 billing 主账

## 5. 风险取向

当 AnyCap 无法在短时间内确认 NexusHub 侧是否已成功创建任务时，本设计采用以下策略：

- 默认短时间重试恢复
- 达到恢复超时阈值后，自动释放，不长期锁住用户
- 接受极低比例“查不到即释放”的残余坏账风险

这意味着本设计优先避免用户额度被长期卡死，而不是无限期保守锁单。

## 6. 方案对比

### 6.1 方案 A：`billing_intents + request_id` 恢复

做法：

- AnyCap 本地先创建 `billing_intent`
- 调用 NexusHub 时携带稳定 `request_id`
- 崩溃恢复后按 `request_id` 或 `task_id` 查 NexusHub
- 查到成功则补扣，查到失败则关闭，查不到则有限重试后释放

优点：

- 最小改动
- 能直接补上当前最关键坏账窗口
- 与现有同步调用链兼容

缺点：

- 仍依赖 NexusHub 的查询能力正确可用
- 在“超时自动释放”策略下仍保留极小尾部风险

### 6.2 方案 B：`billing_intents + reservation + request_id` 恢复

做法：

- 在方案 A 基础上引入本地 reservation
- 请求前占用额度，请求结束后 capture 或 release

优点：

- 进一步降低并发超卖和重复消费风险

缺点：

- 要改余额计算
- 会引入用户可感知的额度冻结
- 首版实现复杂度明显更高

### 6.3 方案 C：彻底异步任务编排

做法：

- AnyCap 先落本地任务，再由 worker 调 NexusHub、扣费、回写状态

优点：

- 一致性边界最清晰
- 长期扩展性最好

缺点：

- 改动最大
- 会影响 CLI/HTTP 行为和产品预期

### 6.4 推荐方案

推荐采用方案 A。

原因：

- 它以最小改动关闭最严重坏账窗口
- 它不要求这轮就引入 reservation 模型
- 它不要求把能力调用改成完全异步
- 它可以作为后续演进到 reservation 或任务平台的过渡基础

## 7. 核心设计

### 7.1 引入 `billing_intents`

新增 `billing_intents` 表，作为“应扣费事实”的本地真相源。

一条 `billing_intent` 表示：

- AnyCap 已决定这次能力调用若成功应当扣费
- 这次调用应以哪个 `request_id` 为恢复锚点
- 当前是否已经确认上游结果
- 当前是否已经完成 credit consume

### 7.2 `billing_intents` 建议字段

| 字段 | 含义 |
| --- | --- |
| `id` | 内部主键，建议外部不可见 |
| `user_id` | AnyCap 用户 ID |
| `api_key_id` | 触发该请求的 API key，可空 |
| `provider` | 首版固定 `nexushub`，后续可扩展 |
| `capability` | 如 `image.generate` / `audio.read` |
| `request_id` | AnyCap 稳定请求 ID |
| `provider_task_id` | NexusHub `task_id`，可空 |
| `credit_cost` | 应扣费额度，read 为固定值，generate 可由 NexusHub 返回 |
| `billing_status` | 账务状态 |
| `provider_status` | 最近一次确认的 provider 状态 |
| `deduct_source_id` | 传给 Credit Service 的幂等键 |
| `last_error` | 最近一次恢复或扣费错误，可空 |
| `recovery_attempts` | 恢复重试次数 |
| `next_retry_at` | 下次恢复时间 |
| `created_at` | 创建时间 |
| `updated_at` | 更新时间 |
| `deducted_at` | 完成扣费时间，可空 |
| `released_at` | 自动释放时间，可空 |

建议约束：

- `UNIQUE(provider, request_id)`
- `UNIQUE(deduct_source_id)`

## 8. 状态机

首版建议最小状态集如下。

### 8.1 `billing_status`

- `created`
  已创建 intent，但还未确认 NexusHub 结果

- `uncertain_retryable`
  曾经进入外部调用链，但 AnyCap 没能完整收口，需要恢复 worker 继续确认

- `provider_succeeded_pending_deduct`
  已确认 NexusHub 成功，等待执行或补做 `credit.Deduct`

- `deducted`
  已确认 Credit Service 消费成功

- `provider_failed`
  已确认 NexusHub 失败，不应扣费

- `released`
  在恢复窗口内仍无法确认结果，按策略自动释放

### 8.2 `provider_status`

保留最近一次从 NexusHub 看到的 provider 状态，例如：

- `submitted`
- `processing`
- `success`
- `failed`
- `canceled`

## 9. 事务边界

本设计明确区分：

- 本地数据库事务
- 外部系统调用

不会尝试构造跨 AnyCap、NexusHub、Credit Service 的分布式事务。

### 9.1 阶段一：创建 intent

本地事务：

1. 生成或读取稳定 `request_id`
2. 插入 `billing_intents`
3. 可选地同步插入 `usage_events(status=created)`

事务提交后，才允许调 NexusHub。

### 9.2 阶段二：记录 NexusHub 结果

当 NexusHub 正常返回时，本地事务中执行：

1. 更新 `billing_intents.provider_task_id`
2. 更新 `billing_intents.credit_cost`
3. 更新 `billing_intents.provider_status`
4. 更新 `billing_intents.billing_status=provider_succeeded_pending_deduct`
5. 写入或更新 `provider_runs`
6. 更新 `usage_events`

这些本地更新必须一起成功或一起回滚。

### 9.3 阶段三：执行扣费并 finalize

顺序为：

1. 调 `credit.Deduct(...)`
2. 若成功，再开本地事务：
   - `billing_intents.billing_status = deducted`
   - `deducted_at` 落库
   - `usage_events.status = success`

若 `Deduct` 失败：

- 不做本地 finalize
- 将 intent 置为 `uncertain_retryable`
- 等待 worker 恢复

### 9.4 阶段四：恢复 worker

worker 使用本地事务完成：

1. claim 一条待恢复 intent
2. 提交 claim
3. 调 NexusHub 查状态 / 调 Credit 补扣
4. 结果写回本地事务

需要避免多 worker 并发处理同一条 intent，建议使用行锁或显式 claim 字段。

## 10. 主链路流程

### 10.1 生成类能力

适用于：

- `image.generate`
- `video.generate`
- `music.generate`

推荐流程：

1. 校验请求和最低余额
2. 创建 `billing_intent`
3. 调 NexusHub，携带 `request_id`
4. 若拿到成功返回：
   - 本地落 `provider_task_id`
   - 落 `credit_cost`
   - intent 转 `provider_succeeded_pending_deduct`
5. 调 `credit.Deduct(source_id=anycap-<capability>-<request_id>)`
6. 成功则标记 `deducted`
7. 任一步崩溃，worker 负责恢复

### 10.2 Read 类能力

适用于：

- `image.read`
- `video.read`
- `audio.read`

这三类当前问题最严重，因为成功后直接扣费，没有 provider 侧底账。

首版也统一走 `billing_intents`，区别仅在于：

- `credit_cost` 为固定值
- 不需要 provider 成本回填
- 若未来该上游也提供 `request_id` 查询能力，同样接入恢复逻辑

## 11. 恢复策略

恢复 worker 扫描以下状态：

- `uncertain_retryable`
- `provider_succeeded_pending_deduct`

### 11.1 恢复顺序

1. 若已有 `provider_task_id`
   - 直接按 `task_id` 调 `GET /v1/get_submit_result/:task_id`
2. 若没有 `provider_task_id`
   - 按 `request_id` 调 NexusHub 新接口查询

### 11.2 恢复结果处理

- 查到成功：
  - 补写 `provider_task_id`（若缺失）
  - 补写 `credit_cost`
  - 转 `provider_succeeded_pending_deduct`
  - 补做 `credit.Deduct`

- 查到失败：
  - intent 转 `provider_failed`
  - 不扣费

- 查不到：
  - 增加 `recovery_attempts`
  - 更新 `next_retry_at`
  - 若超过恢复期限，则转 `released`

## 12. 与 `usage_events/provider_runs` 的关系

`usage_events` 与 `provider_runs` 继续保留，但职责调整为：

- `usage_events`：产品展示、统计和对账投影
- `provider_runs`：NexusHub 执行明细和排障视图
- `billing_intents`：是否应扣费、是否已扣费的真相源

也就是说：

- dashboard 和 system usage 仍可继续读 `usage_events`
- billing 判断不再依赖 `usage_events/provider_runs` 是否存在

## 13. 错误语义

### 13.1 同步请求返回

首版保留现有对外语义：

- 若本次请求过程中 `Deduct()` 成功，则返回成功
- 若 NexusHub 已确认成功，但 AnyCap 当前无法确认是否已扣费，则返回 `BILLING_UNCERTAIN`

### 13.2 自动恢复后的结果

对外不要求客户端主动参与恢复。

也就是说：

- 用户拿到 `BILLING_UNCERTAIN` 后，不需要自己重试补扣
- AnyCap 后台负责恢复和最终收口

## 14. 测试范围

首版至少补以下测试。

### 14.1 应用层

1. 生成类：
   - NexusHub 成功返回后，在 `Deduct` 前崩溃，worker 能补扣
2. 生成类：
   - NexusHub 响应链路中断，但按 `request_id` 能查回并补扣
3. 生成类：
   - 重复恢复不会重复扣费
4. Read 类：
   - 成功后在扣费前崩溃，worker 能补扣

### 14.2 仓储层

1. `billing_intents` 唯一约束
2. claim / requeue 逻辑
3. 超时释放逻辑

### 14.3 集成层

1. `request_id` 正确传给 NexusHub
2. `source_id` 正确传给 Credit Service
3. recovery worker 能按 `request_id` 查询 NexusHub

## 15. 分阶段落地建议

### 第一阶段

只接入以下能力：

- `image.generate`
- `video.generate`
- `music.generate`
- `image.read`
- `video.read`
- `audio.read`

### 第二阶段

再考虑：

- reservation / hold 模型
- dashboard 展示 `billing_intents` 状态
- 运维后台查看 `released` / `provider_failed`

## 16. Open Questions

以下问题在实现前需要确认：

1. NexusHub 按 `request_id` 查询的接口路径、返回结构和一致性语义
2. NexusHub 是否保证同一个 `request_id` 对应唯一任务
3. Credit Service 对 `source_id` 的幂等语义是否已在生产确认
4. `request_id` 在生成类链路中是否允许为空；若允许，需在进入 billing 链路前强制补齐

## 17. 结论

在 NexusHub 支持“持久化 `request_id` + 按 `request_id` 查任务”后，AnyCap 采用 `billing_intents` 作为本地账务真相源，可以在不改成全异步产品形态的前提下，显著收敛当前 credit 扣费坏账问题。

这版设计的本质取舍是：

- 不追求三方强一致事务
- 依靠本地状态机、幂等键和恢复 worker 收口
- 在无法长期确认的少数请求上，采用“有限重试后自动释放”的策略
