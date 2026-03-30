# AnyCap Usage Ledger 与 API Key 管理设计

> Date: 2026-03-30
> Status: Approved
> Scope: 为 AnyCap dashboard 与 server 设计统一使用账本、NexusHub 任务归因、API key 管理与后续 pricing 基础

## 1. 背景

当前仓库已经具备以下基础能力：

- Web dashboard 已有统一的 AnyCap API hooks 和基础页面结构
- Server 已有 API key 签发、鉴权、`active/revoked` 状态、`last_used_at` 记录
- `call_logs` 已能记录部分调用信息
- NexusHub 当前通过 AnyCap 平台级 token 访问，并返回 `task_id`
- NexusHub 提供 `GET /v1/get_submit_result/:task_id` 用于查询任务最终状态、`nexus_usage`、`nexus_cost`

但当前缺少一套面向产品和计费的统一数据层：

1. Dashboard 没有 API key 管理页和按 key 的使用/消耗视图
2. AnyCap 侧没有统一的“使用账本”模型
3. 现有 `call_logs` 更像展示日志，而不是未来 pricing 的 source of truth
4. NexusHub `task_id` 与 AnyCap 用户/API key 的归因关系没有显式持久化
5. `drive`、`page` 等不走 NexusHub 的能力也需要进入统一统计体系

## 2. 目标

本次设计目标如下：

1. 为 AnyCap 建立统一的使用账本模型，覆盖 NexusHub 与非 NexusHub 能力
2. 支持 dashboard 查看用户维度、API key 维度的使用和消耗
3. 支持 API key 管理：列表、禁用、删除
4. 将 NexusHub `task_id` 与 AnyCap 用户、API key、请求上下文进行稳定关联
5. 为未来 pricing、对账、成本回填预留稳定的数据基础

## 3. 非目标

本次不做以下事项：

- 不在本次引入 NexusHub 用户级 token 授予流程
- 不直接实现完整 billing / invoice / statement 系统
- 不在首版做复杂图表、趋势分析和预算控制
- 不对现有 dashboard 做独立视觉重设计，默认沿用现有设计语言
- 不要求所有能力首版都具备最终成本回填，只要求具备统一账本入口

## 4. 核心判断

### 4.1 继续使用 NexusHub 平台级 token

首版继续使用当前平台级 NexusHub token 访问方式，不引入用户级 NexusHub token 授予。

理由：

- 当前链路已可用，改造成本最低
- 当前需求的核心是“归因、统计、展示、计费基础”，不是“下游用户身份下沉”
- 即使未来切换到用户级 token，AnyCap 侧仍然需要自己的使用账本与任务归因层

### 4.2 AnyCap 必须拥有自己的 usage source of truth

Dashboard 不能直接建立在“临时查询 NexusHub”之上。AnyCap 必须维护自己的本地使用账本，并将 NexusHub 视为 provider 明细和最终成本回填来源。

## 5. 总体方案

推荐方案为：

- `usage_events`：AnyCap 统一使用账本
- `provider_runs`：下游执行明细表，首版主要承载 NexusHub `task_id`
- `api_keys`：继续作为凭证主表，并补充管理语义
- `call_logs`：短期保留为展示时间线，长期可降级为投影视图

### 5.1 为什么不继续扩 `call_logs`

继续把 `task_id`、成本、聚合、provider 明细都塞进 `call_logs` 的问题在于：

- 日志时间线和计费底账职责混杂
- 很难优雅表达不走 NexusHub 的能力
- 后续接 `drive/page/storage/bandwidth` 会越来越扭曲

因此 `call_logs` 不应成为未来 pricing 的主账本。

## 6. 数据模型设计

### 6.1 `usage_events`

`usage_events` 是 AnyCap 的统一使用账本，一条记录代表一次可统计、可计费、可审计的使用行为。

适用场景：

- `image.generate`
- `video.generate`
- `drive.upload`
- `drive.download`
- `page.publish`
- 后续其他 capability

建议字段：

| 字段 | 含义 |
| --- | --- |
| `id` | 外部不可见的内部主键 |
| `external_id` | 对外可扩展的随机 ID，便于后续 API 暴露 |
| `user_id` | AnyCap 用户 ID |
| `api_key_id` | 触发该事件的 API key，可空 |
| `product_area` | `capability` / `drive` / `page` |
| `action` | 如 `image.generate` / `drive.upload` |
| `provider` | `nexushub` / `internal` / 其他 |
| `provider_run_id` | 关联下游执行明细，可空 |
| `request_id` | AnyCap 请求 ID |
| `status` | `created` / `processing` / `success` / `failed` / `canceled` |
| `estimated_cost` | 预估成本 |
| `final_cost` | 最终确认成本 |
| `cost_source` | `estimated` / `provider` / `pricing_rule` |
| `quantity` | 用量值 |
| `unit` | 用量单位，如 `request_count` / `bytes_uploaded` |
| `meta` | 额外业务信息，JSONB |
| `occurred_at` | 事件创建时间 |
| `completed_at` | 事件完成时间，可空 |
| `created_at` / `updated_at` | 审计字段 |

说明：

- `usage_events` 不要求一定存在 `provider_task_id`
- 对 `drive/page` 这类内部能力，可以直接记录为 `provider=internal`
- `estimated_cost` 和 `final_cost` 并存，便于首版展示和后续回填

### 6.2 `provider_runs`

`provider_runs` 是 AnyCap 对下游执行实例的统一抽象。首版主要承载 NexusHub 任务明细。

建议字段：

| 字段 | 含义 |
| --- | --- |
| `id` | 内部主键 |
| `external_id` | 可选，对外扩展使用 |
| `provider` | 首版固定为 `nexushub` |
| `provider_task_id` | NexusHub `task_id` |
| `usage_event_id` | 关联 `usage_events` |
| `auth_mode` | `platform_token` / `user_token` |
| `ability_key` | NexusHub `ability_key` |
| `provider_status` | 原始 provider 状态 |
| `provider_usage` | 对应 `nexus_usage`，JSONB |
| `provider_cost` | 对应 `nexus_cost` |
| `raw_result` | 原始查询结果快照，JSONB |
| `submitted_at` | 提交时间 |
| `finished_at` | 完成时间，可空 |
| `last_synced_at` | 最后一次同步时间 |
| `created_at` / `updated_at` | 审计字段 |

说明：

- `provider_runs` 存 provider 明细，不直接承担 dashboard 聚合职责
- `provider_status` 可以贴近下游语义，不强行和 `usage_events.status` 一致

### 6.3 `api_keys`

现有 `api_keys` 表继续保留，并明确以下管理语义：

- `status=active`：可用
- `status=revoked`：已禁用
- `deleted_at`：软删除标记

管理语义建议：

- Dashboard 文案层把 `revoked` 呈现为 “Disabled”
- “Delete” 使用软删除，不做物理删除
- 软删除后历史 `usage_events` 和统计仍可保留

## 7. 状态设计

### 7.1 `usage_events.status`

建议统一为：

- `created`
- `processing`
- `success`
- `failed`
- `canceled`

这是面向产品、聚合和展示的状态。

### 7.2 `provider_runs.provider_status`

保留 provider 原始状态或接近原始状态的值，用于对账和排障。

这样做的好处是：

- `usage_events` 适合聚合和 dashboard
- `provider_runs` 适合技术排查和 provider 对账

## 8. 事件流转设计

### 8.1 走 NexusHub 的能力

以 `image.generate`、`video.generate` 为例：

1. AnyCap 接收请求并识别 `user_id`、`api_key_id`、`request_id`
2. 先创建 `usage_events`
   - `provider=nexushub`
   - `status=created`
   - `action=image.generate` 或 `video.generate`
3. 调用 NexusHub `submit_atomic_process`
4. 拿到 `task_id` 后创建 `provider_runs`
   - `provider=nexushub`
   - `provider_task_id=task_id`
   - `auth_mode=platform_token`
   - `ability_key=<route.AbilityKey>`
5. 回填 `usage_events.provider_run_id`
6. 若调用链为异步完成，则由后台任务轮询 `GET /v1/get_submit_result/:task_id`
7. 回填：
   - `provider_runs.provider_status`
   - `provider_runs.provider_usage`
   - `provider_runs.provider_cost`
   - `provider_runs.raw_result`
   - `provider_runs.finished_at`
8. 同步更新：
   - `usage_events.status`
   - `usage_events.final_cost`
   - `usage_events.cost_source=provider`
   - `usage_events.completed_at`

### 8.2 不走 NexusHub 的能力

以 `drive.upload`、`page.publish` 为例：

1. 直接创建 `usage_events`
2. `provider=internal`
3. 不需要 `provider_run_id`
4. 按动作记录 `quantity`、`unit`、`estimated_cost` 或 `final_cost`

示例：

- `drive.upload`
  - `quantity=<文件字节数>`
  - `unit=bytes_uploaded`
- `page.publish`
  - `quantity=1`
  - `unit=publish_count`

## 9. Dashboard 聚合设计

### 9.1 API Keys 页

每个 API key 建议展示：

- `id`
- `name`
- `status`
- `created_at`
- `last_used_at`
- `usage_count_7d`
- `success_count_7d`
- `failure_count_7d`
- `cost_7d`
- `last_action`

支持操作：

- `Disable`
- `Delete`

首版不建议支持 `Enable`，避免增加恢复语义和审计复杂度。

### 9.2 Usage 页

账号级总览建议展示：

- 总调用次数
- 成功次数
- 失败次数
- 总成本
- 按 `product_area` 的拆分
- 按 `action` 的拆分
- 按 `api_key_id` 的拆分

支持筛选：

- 时间范围
- `product_area`
- `action`
- `api_key_id`
- `status`
- `provider`

### 9.3 Logs 页

短期可以继续保留现有日志页。

中期建议：

- 日志页数据逐步改由 `usage_events` 投影
- `call_logs` 退化为兼容层或轻量投影视图

## 10. Server API 设计建议

### 10.1 API key 管理

建议新增：

- `GET /v1/api-keys`
- `POST /v1/api-keys`
- `POST /v1/api-keys/:id/disable`
- `DELETE /v1/api-keys/:id`
- `GET /v1/api-keys/:id/usage`

说明：

- `GET /v1/api-keys` 返回当前用户的 key 列表及聚合摘要
- `DELETE` 语义为软删除

### 10.2 Usage 查询

建议新增：

- `GET /v1/usage/summary`
- `GET /v1/usage/events`
- `GET /v1/usage/breakdown`

说明：

- Summary 提供 dashboard 卡片数据
- Events 提供表格 / timeline 数据
- Breakdown 用于图表或细分维度聚合

## 11. 与现有代码的映射建议

### 11.1 `call_logs`

现有 `call_logs` 应短期保留，但不再继续承担未来计费主账本职责。

### 11.2 Image / Video 调用链

当前 `image` / `video` service 已经有：

- 用户 ID
- request ID
- model
- cost

但还缺：

- `principal.APIKeyID` 进入使用账本
- `task_id` 的持久化
- `ability_key` 的持久化
- provider 查询回填逻辑

### 11.3 External ID 规则

若 `usage_events` 和 `provider_runs` 后续需要对外暴露，应遵循仓库现有 external ID 规则：

- 不暴露内部自增 ID
- 统一通过 presenter / mapper 输出外部 ID

## 12. 回填与补偿策略

不建议让 dashboard 每次打开时实时查询 NexusHub。

推荐策略：

1. 本地表为主
2. NexusHub 为 provider 对账源
3. 后台异步回填最终状态、usage、cost
4. 对未终态或未同步成功的 `provider_runs` 进行周期性补偿重试

补偿任务筛选条件建议：

- `provider=nexushub`
- `provider_status` 未进入终态
- 或 `last_synced_at` 超过重试阈值

## 13. 实施顺序建议

建议分阶段落地：

### Phase 1

- 新增 `usage_events` / `provider_runs` 表
- image / video 先接入账本
- 实现 API key 列表、禁用、删除
- dashboard API key 页可展示基础聚合

### Phase 2

- 增加 NexusHub 回填任务
- 用 `final_cost` / `provider_usage` 替换部分预估口径
- 增加 usage 页聚合接口

### Phase 3

- 将 `drive` / `page` 纳入 `usage_events`
- 为未来 pricing 规则和对账报表打基础

## 14. 开放问题

本轮先保留以下问题为后续决策项：

1. `usage_events.external_id` 是否在首版就对外暴露
2. API key 是否允许重新启用
3. `provider_runs.raw_result` 是否全文保存，还是仅做精简快照
4. `drive` 下载、页面访问等高频事件是否需要采样或汇总入账

## 15. 结论

本次需求不应实现为单纯的 “NexusHub `task_id` 映射表”，而应实现为：

- AnyCap 自己的统一使用账本 `usage_events`
- 以 `provider_runs` 记录 NexusHub 等下游执行明细
- 以 API key 管理为入口提供按 key 的使用和消耗视图

一句话总结：

AnyCap 应成为自己的 usage source of truth，NexusHub 是 provider 明细与最终成本回填来源，而不是 dashboard 的主数据源。
