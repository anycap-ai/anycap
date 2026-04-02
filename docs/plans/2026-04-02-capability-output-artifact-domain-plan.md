# Capability 输出 Artifact 域名与短链分发方案（v2）

> 日期: 2026-04-02  
> 状态: Draft v2  
> 关联: `2026-03-29-r2-bucket-consolidation.md`、`2026-03-28-drive-page-r2-worker-design.md`

## 目标

- image / video / music 输出对外只暴露 AnyCap 域名，不暴露 provider URL。
- AnyCap Server 不承载大文件字节流，只做编排、审计、计费和返回。
- public URL 与 `object_key` 完全解耦，客户端无法从 URL 推导存储路径。
- generate 接口返回时 URL 即可访问（不返回“稍后可用”的链接）。
- 覆盖所有生成场景，并保证实现 DRY，不在 image/video/music 三处复制粘贴。

## 非目标

- 本期不做历史 provider URL 回填迁移。
- 本期不做 artifact 看板 UI（仅保留后续接入点）。
- 本期不引入第二套对象存储。
- 本期不拆出独立 ingest worker 服务（先在现有 edge worker 按模块和 host 隔离）。

## 当前痛点

当前 generate 结果直接透传 provider 输出 URL，问题是：

- 品牌域名不统一。
- 无法稳定控制缓存、可用性和后续访问策略。
- provider URL 失效后无法兜底。
- 现有 `cdn.anycap.*` 语义是 `public/*` 静态资源，不适合承载 capability 产物。

## 核心决策

### 1) 公开链接采用 KV 短链（与 object key 解耦）

- 用户看到的 URL：`https://artifact.anycap.cloud/a/{artifact_link_token}`
- `artifact_link_token` 是短时有效 token（TTL）。
- edge public 路由只通过 KV 映射拿到 `object_key`，不做 object key 推导。

KV 映射建议：

- key: `artifact:link:{artifact_link_token}`
- value(JSON): `object_key`, `mime`, `size`, `etag`, `artifact_external_id`, `expires_at`
- 存储方式：复用现有 Cloudflare KV 客户端与写入能力（同 drive/page 体系），本场景走直写（不走 KVSync job）

### 2) 保留 `caps_artifacts` 作为持久资产主模型

- `caps_artifacts.external_id`（前缀 `ca_`）是长期稳定的资产标识，用于审计和后续 dashboard。
- `artifact_link_token` 只是临时分发凭证，不替代 `caps_artifacts.external_id`。

### 3) object key 仅内部使用

- 对象路径建议：`caps/outputs/o/{caps_artifact_external_id}`
- 不再使用 `by-external-id` 文案，避免暴露实现语义。
- 该路径不对外返回，客户端不可见。

### 4) V1 不拆 worker 进程，但必须拆模块

- 继续使用现有 `workers/edge`，通过 host 路由隔离：
  - `artifact.anycap.*`：public download
  - `artifact-ingest.anycap.*`：internal ingest
- 代码层必须模块化，避免把复杂安全逻辑塞进 `index.ts`。

### 5) 失败与计费语义

- ingest 失败 => 整体请求失败，不返回 provider URL。
- ingest 失败 => 不扣费。
- 扣费顺序固定：`provider success -> artifact publish success -> deduct credit`。

## 域名与路由

| 域名 | 用途 |
|------|------|
| `artifact.anycap.dev` / `artifact.anycap.cloud` | 对外下载 capability 产物（短链） |
| `artifact-ingest.anycap.dev` / `artifact-ingest.anycap.cloud` | server 内部转存入口 |

## 读写职责

### AnyCap Server

负责：

- 调 provider 获取输出。
- 生成 `caps_artifacts` 记录（`pending -> ready/failed`）。
- 调 ingest 路由把 provider URL 转存到 R2。
- 写 `storage_objects` 与 `caps_artifacts.storage_object_id`。
- 生成短时 `artifact_link_token` 并写 KV 映射。
- 将返回 `outputs[].url` 改写为 `artifact.anycap.*`。

不负责：

- 下载 provider 文件字节。
- 上传字节到 R2。
- 对外文件分发。

### Edge Worker（artifact-ingest host）

负责：

- ingest 鉴权（Bearer token）。
- source URL 安全校验（见下文安全策略）。
- 流式拉取 provider URL 并写入 R2。
- 返回对象元数据（`etag`, `mime`, `size`）。

不负责：

- DB 持久化。
- 计费逻辑。

### Edge Worker（artifact host）

负责：

- 解析 `/a/{artifact_link_token}`。
- 查 KV：`artifact:link:{token}`。
- 读取映射中的 `object_key` 并从 R2 返回对象。
- 支持 `Range`、`ETag`、缓存头。

不负责：

- 调 server。
- 查 DB。

## 数据模型

新增 `caps_artifacts`（最简状态）：

```sql
CREATE TABLE IF NOT EXISTS caps_artifacts (
	id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	external_id       TEXT NOT NULL UNIQUE,
	space_id          BIGINT NOT NULL,
	provider          TEXT NOT NULL,
	provider_task_id  TEXT,
	capability        TEXT NOT NULL, -- image.generate / video.generate / music.generate / image.edit ...
	media_type        TEXT NOT NULL, -- image, video, music
	position          INT NOT NULL DEFAULT 0,
	status            TEXT NOT NULL, -- pending, ready, failed
	source_url        TEXT NOT NULL,
	source_mime       TEXT,
	source_size       BIGINT,
	storage_object_id BIGINT,
	error_code        TEXT,
	error_message     TEXT,
	created_by        TEXT NOT NULL,
	created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
	ready_at          TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_caps_artifacts_space_id
	ON caps_artifacts (space_id);

CREATE INDEX IF NOT EXISTS idx_caps_artifacts_provider_task_id
	ON caps_artifacts (provider, provider_task_id);
```

说明：

- `external_id` 前缀新增 `ca_`（持久资产 ID）。
- `status` 仅保留最简：`pending -> ready | failed`。
- V1 保留 `source_url` 便于审计；日志输出需脱敏 query/token。
- 本表不新增外键约束（由应用层保证关联一致性）。

## Public URL 形态

| 环境 | 示例 |
|------|------|
| dev | `https://artifact.anycap.dev/a/art_xxx` |
| prod | `https://artifact.anycap.cloud/a/art_xxx` |

其中：

- `art_xxx` 为短时 token（建议前缀 `art_`）。
- token 到期后，由 dashboard 或 API 重新申请新链接（重新写 KV）。

## 接口与链路

### 1) Server -> ingest

```http
POST /v1/internal/artifacts/ingest
Host: artifact-ingest.anycap.cloud
Authorization: Bearer <ANYCAP_ARTIFACT_INGEST_TOKEN>
Content-Type: application/json
```

请求体：

```json
{
	"source_url": "https://provider.example.com/file.png",
	"object_key": "caps/outputs/o/ca_aBcDeFgHiJkLmNoP",
	"media_type": "image",
	"filename_hint": "result.png",
	"content_type_hint": "image/png",
	"max_bytes": 104857600
}
```

响应体：

```json
{
	"etag": "....",
	"mime": "image/png",
	"size": 1234567
}
```

### 2) 生成主链路

```text
Client
  -> AnyCap Server generate
  -> provider returns outputs
  -> Server create caps_artifacts(status=pending)
  -> Server call artifact-ingest (source_url -> R2 object_key)
  -> Server upsert storage_objects
  -> Server update caps_artifacts(status=ready, storage_object_id=...)
  -> Server create artifact_link_token + KV put(artifact:link:{token}, ttl)
  -> Server return outputs[].url = https://artifact.anycap.cloud/a/{token}
  -> Server deduct credit
```

### 3) 公共下载链路

```text
Browser / CLI
  -> GET https://artifact.anycap.cloud/a/{token}
  -> Edge lookup KV: artifact:link:{token}
  -> get object_key from KV value
  -> R2 get(object_key)
  -> return bytes
```

## 安全策略

### ingest 鉴权

- 仅允许 `POST`。
- 仅允许 HTTPS。
- Bearer token 校验：`ANYCAP_ARTIFACT_INGEST_TOKEN`。

### source URL 安全校验（必须）

> 仅有 ingest token 不能替代 source URL 校验。两者防护面不同。

必须包含：

- source host allowlist。
- 拒绝私网地址、loopback、link-local、保留网段。
- 拒绝 IP literal host（IPv4/IPv6 直写）。
- redirect 次数限制，且每跳都重新做 allowlist + 地址校验。
- 最大文件大小限制（`max_bytes` + 流式上限）。
- MIME 白名单（按 media_type 匹配）。
- 访问日志脱敏 query/token。

## 缓存与下载行为

产物对象默认不可变，可用：

- `Cache-Control: public, max-age=31536000, immutable`

public 下载路由必须支持：

- `Range` 请求（206）
- 非法 range（416）
- `Accept-Ranges: bytes`
- `ETag` + `If-None-Match`（304）

## DRY 与覆盖策略（关键）

新增统一发布组件：`ArtifactPublisher`

职责：

- ingest 调用
- `caps_artifacts` / `storage_objects` 落库
- 生成短链 token + KV put
- 重写 `outputs[].url`

接入点：

- image：在 `Execute` 内统一调用（覆盖 generate/edit/upscale 等所有 image operation）
- video：在 `Generate` 调用同一组件
- music：在 `Generate` 调用同一组件

禁止在三个 service 内重复实现 ingest/KV 细节。

## Worker 模块拆分（V1 必做）

在 `workers/edge/src/` 下新增：

- `artifact/public.ts`
- `artifact/ingest.ts`
- `artifact/auth.ts`
- `artifact/source_policy.ts`
- `artifact/link_kv.ts`
- `artifact/object_key.ts`

`index.ts` 仅保留 host 路由分发，不承载业务细节。

## 实施步骤

### Step 1: 配置

server 新增：

- `ANYCAP_ARTIFACT_PUBLIC_BASE_URL`
- `ANYCAP_ARTIFACT_INGEST_BASE_URL`
- `ANYCAP_ARTIFACT_INGEST_TOKEN`
- `ANYCAP_ARTIFACT_LINK_TTL_SECONDS`

worker 新增：

- `ARTIFACT_HOST`
- `ARTIFACT_INGEST_HOST`
- `ANYCAP_ARTIFACT_INGEST_TOKEN`
- `ARTIFACT_LINK_TTL_SECONDS`
- `ARTIFACT_SOURCE_HOST_ALLOWLIST`

### Step 2: 数据模型与 ID

- migration 新增 `caps_artifacts`
- `pkg/externalid` 新增 `PrefixCapsArtifact = "ca_"`
- 新增 `CapsArtifactRepository`

### Step 3: worker 路由与模块

- `workers/edge/src/index.ts` 增加 `artifact` / `artifact-ingest` host 分流
- 新增 artifact 模块（见上节）
- `wrangler.toml` 增加 hosts 与 env

### Step 4: server 统一发布组件

- 新增 `ArtifactPublisher`
- image/video/music 全部接入
- 固化扣费顺序：publish 成功后再扣费

### Step 5: 测试

worker：

- ingest 鉴权失败
- source host 非 allowlist
- 私网/IP literal 拒绝
- redirect 多跳校验
- 超大文件拒绝
- public route range/etag/ttl 行为正确

server：

- generate 成功返回 AnyCap URL
- ingest 失败整体失败且不扣费
- 多 outputs 顺序稳定（`position`）
- image 非 generate operation 也走统一发布组件

### Step 6: 文档与状态

- 更新 capability spec 中输出 URL 语义
- 更新 `docs/anycap-current-status.md`

## 影响文件（预估）

| 文件 | 改动 |
|------|------|
| `internal/domain/model/` | 新增 `caps_artifact.go` |
| `internal/domain/port/` | 新增 `caps_artifact.go`、`artifact_publisher.go` |
| `internal/infrastructure/postgres/` | 新增 `caps_artifact_repo.go` |
| `internal/infrastructure/migration/migrations/` | 新增 `caps_artifacts` migration |
| `internal/application/` | 新增统一 `ArtifactPublisher` 组件 |
| `internal/application/image/service.go` | 接入统一发布组件 |
| `internal/application/video/service.go` | 接入统一发布组件 |
| `internal/application/music/service.go` | 接入统一发布组件 |
| `internal/config/config.go` | 新增 artifact 配置 |
| `workers/edge/src/index.ts` | host 路由扩展 |
| `workers/edge/src/artifact/*` | 新增 artifact 模块 |
| `workers/edge/src/types.ts` | 新增 artifact env / KV record type |
| `workers/edge/wrangler.toml` | 新增 artifact routes 与变量 |
| `docs/action/spec/` | 更新输出 URL 语义 |

## 开放问题

### 1) TTL 默认值

- 建议默认 `5~15` 分钟（可配置）。
- dashboard 后续通过“重新生成链接”满足二次下载。

### 2) 过期链接的再生成 API

- V1 可以先内聚在现有 capability/domain 层。
- dashboard 看板上线时补充显式 `create link` API。

### 3) 清理策略

- 短链 token 依赖 KV TTL 自动回收。
- `caps_artifacts` / `storage_objects` 后续可加离线清理策略（非本期）。

## 最终结论

v2 方案确定为：

1. public URL 采用 KV 短链，和 object key 完全解耦。
2. 资产主模型为 `caps_artifacts(ca_)`，短链 token 只是分发凭证。
3. V1 继续使用现有 edge worker，但必须按 `artifact/*` 模块拆分并按 host 隔离。
4. ingest 失败即请求失败且不扣费。
5. 用统一 `ArtifactPublisher` 覆盖 image/video/music 全场景，确保 DRY。
