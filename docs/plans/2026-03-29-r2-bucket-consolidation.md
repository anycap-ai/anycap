# R2 Bucket 整合与存储统一方案

> Date: 2026-03-29
> Status: Draft v4
> 关联：`2026-03-28-drive-page-r2-worker-design.md`、`2026-03-25-upload-security-hardening.md`

## 1. 现状

| Bucket | 访问方式 | 域名 | 用途 |
|--------|---------|------|------|
| `anycap-tmp` | R2 Public Access（公开） | `cdn.anycap.cloud` | capabilities 临时上传（user_upload/）、公共静态资产（fonts 等） |
| `anycap-cloud` | Edge Worker（私有） | `drive.anycap.cloud`、`*.page.anycap.cloud` | Drive + Page |

问题：

- `anycap-tmp` 是公开 bucket，任何知道 URL 的人都可以读取所有对象。
- capabilities 的上传和产出缺少统一的 DB 追踪，无法完整审计“哪次调用用了哪些输入、产出了哪些结果”。
- 当前 capability 调用直接传外部 URL，缺少一种稳定的“AnyCap 内部输入引用”语义。
- capabilities 用的 `port.ObjectStorage` 接口与 Drive/Page 用的 `port.CloudObjectStore` 接口割裂，存储层存在两套独立体系。

## 2. 目标架构

### 2.1 单 Bucket 全私有

合并为一个私有 bucket `anycap-cloud`，关闭所有 R2 Public Access。Phase 1 聚焦输入对象统一和公共静态资源迁移；capabilities 输出转存与 artifact 域名先留作 TODO。

| Prefix | 用途 | 外部读取方式 |
|--------|------|-------------|
| `drive/spaces/...` | Drive 文件 | Edge Worker (`drive.anycap.cloud`) |
| `page/spaces/...` | Page 资产 | Edge Worker (`*.page.anycap.cloud`) |
| `caps/inputs/spaces/...` | capabilities 输入（reference image 等） | Presigned GET URL（由 Server 调上游时现签） |
| `public/` | 字体、品牌素材等公共资源 | Edge Worker 无鉴权路由 |

### 2.2 为什么可以用单 bucket

- **caps 输入**：之前需要公开 bucket 是因为 NexusHub 等外部服务要直读。改用 **presigned GET URL** 后，外部服务仍可在有效期内读取，但 bucket 无需公开。
- **caps 输出**：Phase 1 先不转存，直接返回上游 URL；但会在 DB 中记录产出与 `caps_task` 的关联，后续再收口到自有域名。
- **公共静态资产**：通过 Edge Worker 无鉴权路由提供，无需公开 bucket。
- **`storage_objects` 表已有 `bucket` 字段**：DB 层天然支持多 bucket，但现在只需一个。

### 2.3 安全收益

- 零公开 bucket，消除 URL 泄露风险。
- presigned GET URL 有 TTL（默认 1h），过期后不可访问。
- Drive / Page / Public 资源读取统一走 Edge Worker，可统一加日志、限流、鉴权。

## 3. Object Key 与 Prefix 设计

所有对象统一存入 `anycap-cloud`：

| Prefix | 说明 | 清理策略 |
|--------|------|---------|
| `drive/spaces/{space_id}/nodes/{node_id}/{object_id}` | Drive 文件 | 软删后异步 GC |
| `page/spaces/{space_id}/sites/{page_id}/versions/{version_no}/{asset_path}` | Page 资产 | 版本归档后异步 GC |
| `caps/inputs/spaces/{space_id}/{date}/{uuid}/{filename}` | capabilities 输入 | 7 天过期清理（后续任务实现） |
| `public/{path}` | 字体、品牌素材 | 不清理 |

TODO：

- `caps/outputs/spaces/...` 前缀与 `artifact.anycap.cloud` 域名在确认内部方案后再补入。

## 4. 存储层统一设计

### 4.1 问题：当前两套存储接口

```
port.ObjectStorage      ← capabilities 专用（PresignPut, Delete）
  - 不写 DB 追踪
  - object key 不含 space_id，无法追溯归属

port.CloudObjectStore   ← Drive/Page 专用（PresignPutObject, HeadObject, CopyObject, DeleteObject, BucketName）
  - 搭配 upload_sessions + storage_objects 完整追踪
  - object key 含 space_id，可追溯归属
```

两个接口底层是同一个 `s3store.Client`，割裂纯粹是历史遗留。

### 4.2 方案：删除 `port.ObjectStorage`，统一到 `port.CloudObjectStore`

**删除 `port.ObjectStorage` 接口。** 所有对象读写统一使用 `port.CloudObjectStore`。但 caps 不强行复用 Drive/Page 的 `upload_sessions` 语义，而是按调用场景单独建模：

- `caps_uploads`：记录本地文件直传到 AnyCap R2 的临时输入对象
- `caps_tasks`：记录一次 capability 调用
- `caps_task_artifacts`：记录 task 的输入/输出关联
- `storage_objects`：记录真正已确认存在的 AnyCap 托管对象

这样拆分的原因：

- `upload_sessions` 适合 Drive/Page 的“presign -> complete”流程。
- caps 输入是“上传后再参与一次调用”。
- caps 输出在 Phase 1 是“上游返回 URL”，并没有 upload session 生命周期。
- 用单独的 `caps_uploads` / `caps_task_artifacts` 语义更清晰，也更利于后续扩展。

输入契约方面，Phase 1 不引入 `upload_id(s)` 作为对外调用参数，而是统一维持“传 URL”语义：

- 用户已有外部资源时，继续直接传外部 URL
- 用户本地上传成功后，Server 返回稳定的内部输入引用：`anycap://upload/{id}`
- capability 调用时统一传 URL；Server 识别该 URL 是外部 URL 还是 AnyCap 内部引用

### 4.3 `CloudObjectStore` 新增 PresignGet

```go
type CloudObjectStore interface {
    PresignPutObject(ctx context.Context, objectKey, contentType string, contentLength int64) (model.PresignResult, error)
    PresignGetObject(ctx context.Context, objectKey string, expiry time.Duration) (string, error)  // 新增
    HeadObject(ctx context.Context, objectKey string) (*model.StorageObjectHead, error)
    CopyObject(ctx context.Context, sourceObjectKey, targetObjectKey string) error
    DeleteObject(ctx context.Context, objectKey string) error
    BucketName() string
}
```

`PresignGetObject` 用于在 **实际调用 capability 前** 现签一个新鲜的 presigned GET URL。CLI 不拿到这个 URL，TTL 也不会在上传阶段被提前消耗。

### 4.4 新增 `caps_uploads` 表

`caps_uploads` 记录一次本地文件上传到 AnyCap R2 的临时输入对象：

```sql
CREATE TABLE IF NOT EXISTS caps_uploads (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    space_id     BIGINT NOT NULL REFERENCES spaces(id),
    object_key   TEXT NOT NULL,
    filename     TEXT NOT NULL,
    mime         TEXT NOT NULL,
    size         BIGINT NOT NULL,
    sha256       TEXT,
    status       TEXT NOT NULL DEFAULT 'pending', -- pending, uploaded, expired
    expires_at   TIMESTAMPTZ NOT NULL,
    last_used_at TIMESTAMPTZ,
    use_count    BIGINT NOT NULL DEFAULT 0,
    created_by   TEXT NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_caps_uploads_space_id ON caps_uploads (space_id);
CREATE INDEX idx_caps_uploads_created_by ON caps_uploads (created_by);
CREATE INDEX idx_caps_uploads_space_sha256 ON caps_uploads (space_id, sha256);
```

说明：

- `consumed` 状态不保留。一个 upload 可以被多个 task 复用，是否被使用过由 `use_count` / `last_used_at` 和 `caps_task_artifacts` 表达。
- `sha256` 用于同一 `space` 内去重。
- `sha256` 由 CLI 流式计算，不把整个文件读入内存。
- Phase 1 使用完整 `sha256` 作为最终去重依据，不使用采样 hash 做最终判定；采样指纹只可作为未来优化 TODO。

### 4.5 Bootstrap 简化为单个 CloudObjectStore

```go
// bootstrap.go
objectStore := buildObjectStore(cfg.CloudS3)  // anycap-cloud，唯一的 object store

driveService := driveapp.NewService(
    spaceService, driveNodeRepo,
    driveapp.WithUpload(uploadSessionRepo, storageObjectRepo, objectStore),
    ...
)

pageService := pageapp.NewService(
    spaceService, pageSiteRepo, pageSlugRepo, pepper,
    pageapp.WithVersioning(pageVersionRepo, uploadSessionRepo, storageObjectRepo, objectStore),
    ...
)

capService := capapp.NewService(
    provider,
    spaceService,
    capsUploadRepo,
    storageObjectRepo,
    capsTaskRepo,
    capsTaskArtifactRepo,
    objectStore,
)
```

`cfg.S3`（旧的 capabilities 专用配置）删除，只保留 `cfg.CloudS3`。`buildObjectStorage` 函数删除，只保留 `buildCloudObjectStorage`（可改名为 `buildObjectStore`）。

### 4.6 新增 `caps_tasks` 表

`caps_tasks` 记录一次 capability 调用：

```sql
CREATE TABLE IF NOT EXISTS caps_tasks (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    space_id     BIGINT NOT NULL REFERENCES spaces(id),
    capability   TEXT NOT NULL,          -- 'image_generate', 'image_understand', 'video_read', ...
    status       TEXT NOT NULL DEFAULT 'pending',  -- pending, running, succeeded, failed
    request_meta JSONB,                  -- 调用参数摘要（model, prompt 摘要等，不含完整 prompt）
    result_meta  JSONB,                  -- 结果摘要（output URLs, duration, usage 等）
    created_by   TEXT NOT NULL,          -- user_id
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_caps_tasks_space_id ON caps_tasks (space_id);
CREATE INDEX idx_caps_tasks_created_by ON caps_tasks (created_by);
```

作用：

- 一个 `caps_task` 可关联多个输入和多个输出
- 为后续计费审计、用量分析、资源清理提供基础

### 4.7 新增 `caps_task_artifacts` 表

`caps_task_artifacts` 统一记录 task 的输入与输出：

```sql
CREATE TABLE IF NOT EXISTS caps_task_artifacts (
    id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    task_id           BIGINT NOT NULL REFERENCES caps_tasks(id),
    role              TEXT NOT NULL, -- input, output
    position          INT NOT NULL DEFAULT 0,
    storage_object_id BIGINT REFERENCES storage_objects(id),
    source_kind       TEXT NOT NULL, -- anycap_upload, external_url, provider_url
    source_url        TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_caps_task_artifacts_task_id ON caps_task_artifacts (task_id);
```

约束建议：

- `role = input` 时，允许 `source_kind = anycap_upload | external_url`
- `role = output` 时，Phase 1 允许 `source_kind = provider_url`
- `storage_object_id` 仅在 AnyCap 自己托管对象时填写
- `source_kind = anycap_upload` 时，`source_url` 记录稳定引用 `anycap://upload/{id}`

### 4.8 Capabilities 上传与调用流程（改造后）

```
1. CLI 调用 POST /v1/capabilities/presign
2. Server:
   a. 从 ctx 获取 userID → 查 space（GetOrCreatePersonalSpace）
   b. 若请求携带 sha256，则按 (space_id, sha256, size, mime) 查可复用 upload
   c. 若命中可复用对象，直接返回 {object_url=anycap://upload/{id}, reused=true}
   d. 若未命中，生成 object key: caps/inputs/spaces/{space_id}/{date}/{uuid}/{filename}
   e. 调用 objectStore.PresignPutObject(objectKey, ...)
   f. 创建 caps_upload（status=pending）
   g. 返回 {upload_url, object_url=anycap://upload/{id}, expires_in, reused=false}
3. CLI PUT 文件到 upload_url
4. CLI 调用 capability（如 image understand / image generate），传入 URL（外部 URL 或 `anycap://upload/{id}`）
5. Server:
   a. 解析输入 URL，区分 external_url 和 `anycap://upload/{id}`
   b. 校验内部 upload 引用属于当前用户/space
   c. 对 each internal upload 做 HEAD 校验对象存在
   d. 创建或确认 storage_object 记录
   e. 标记 caps_upload 为 uploaded，并更新 use_count / last_used_at
   f. 创建 caps_task（status=pending）
   g. 为输入写 caps_task_artifacts
   h. 对 AnyCap 托管输入现签 presigned GET URL
6. Server 执行 capability，NexusHub 通过现签 URL 读取输入文件
7. Server 收到结果后：
   a. 更新 caps_task（status=succeeded, result_meta）
   b. 为每个上游输出 URL 写 caps_task_artifacts（role=output, source_kind=provider_url）
   c. 直接返回上游 URL 给 agent / 用户
```

补充约束：

- `reused=true` 时，响应中的 `upload_url` 为空，不需要再次上传
- `reused=false` 时，`upload_url` 必填

### 4.9 Presigned GET URL 的 TTL 考量

- 不在 presign 阶段生成 GET URL，而是在实际调用上游前现签。
- 默认 1 小时，足够 NexusHub 拉取。
- TTL 可配置（通过环境变量 `ANYCAP_CLOUD_S3_PRESIGN_GET_EXPIRY_SECONDS`）。
- CLI 与外部调用方不感知 presigned GET URL；业务契约统一暴露 URL，其中 AnyCap 内部引用使用 `anycap://upload/{id}`。

### 4.10 去重策略

Phase 1 支持同一 `space` 内的输入去重，目标是避免重复上传和重复占用 R2 空间。

规则：

- CLI 默认对本地文件流式计算完整 `sha256`
- `POST /v1/capabilities/presign` 可携带 `sha256`
- Server 按 `(space_id, sha256, size, mime)` 查找可复用 upload
- 命中时直接返回已有的 `anycap://upload/{id}`，不再生成新的 presign PUT
- 未命中时才生成新的 object key 和 upload URL

说明：

- 去重范围限定在同一 `space` 内，不做跨用户 / 跨租户去重
- 最终去重依据使用完整 `sha256`
- 采样 hash 不作为最终去重依据，最多作为后续性能优化的候选方案
- `storage_objects` 建议增加 `(space_id, bucket, object_key)` 唯一索引，保证“创建或确认 storage_object”可幂等实现
- `caps_uploads` 与 `storage_objects` 是 1:1 逻辑关系：同一个 upload 最终只绑定一个 object record

### 4.11 删除的文件和接口

| 删除项 | 说明 |
|--------|------|
| `port.ObjectStorage` 接口 | 被 `port.CloudObjectStore` 替代 |
| `port.CapabilitiesService.Presign` 的无 DB 实现 | 改为返回稳定输入引用 URL 的实现 |
| `s3store.Client.PresignPut` 方法 | 统一用 `PresignPutObject`（调用方控制 key 生成） |
| `s3store.StubClient` 对 `ObjectStorage` 的实现 | 只保留 `CloudObjectStore` 的 stub |
| `config.go` 中 `S3` 配置段 | 合并到 `CloudS3`，只保留一套 S3 配置 |
| `config.go` 中 `loadS3Config()` | 删除，只保留 `loadCloudS3Config()`（可改名为 `loadS3Config`） |
| `loadCloudS3Config()` 中对 `S3_*` 的回退 | 一并删除，避免配置歧义 |
| `config.S3Config.PublicURL` / `KeyPrefix` 字段 | 不再需要（读取不走公开 URL，key 由服务层生成） |
| `bootstrap.go` 中 `buildObjectStorage()` | 删除，只保留 `buildCloudObjectStorage()`（可改名为 `buildObjectStore`） |

## 5. Edge Worker 路由变更

现有路由：

```
drive.anycap.cloud    -> handleDrive()
*.page.anycap.cloud   -> handlePage()
```

Phase 1 新增路由：

```
cdn.anycap.cloud      -> handlePublic()     # 公共静态资产（无鉴权）
```

### 5.1 Public Handler

```ts
// cdn.anycap.cloud/{path}
// 从 anycap-cloud R2 读取 public/ prefix 下的对象，无鉴权
async function handlePublic(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url)
  const objectKey = `public${url.pathname}`
  const object = await env.ANYCAP_CLOUD_R2.get(objectKey)
  if (!object) return notFound()
  // 长缓存 Cache-Control，immutable
}
```

说明：

- `cdn.anycap.cloud` 域名从 R2 Public Access 切换为 Edge Worker 路由。
- `public/` prefix 下的对象无鉴权，任何人可读。
- 长缓存（`Cache-Control: public, max-age=31536000, immutable`）。

TODO：

- `artifact.anycap.cloud` 在确认输出转存方案后再补入。

## 6. Server 端 Config 改动

删除旧的 `S3` 配置段（capabilities 专用），合并到 `CloudS3`。同时删掉 CloudS3 对 `S3_*` 的 legacy fallback，避免双套配置并存。保留环境变量控制，测试/生产 bucket 独立。

### 6.1 删除项

| 删除项 | 说明 |
|--------|------|
| `config.S3` 字段 | 合并到 `CloudS3` |
| `loadS3Config()` 函数 | 合并到 `loadCloudS3Config()`（可改名为 `loadS3Config`） |
| `buildObjectStorage()` 函数 | 合并到 `buildCloudObjectStorage()` |
| `S3_*` legacy fallback | `loadCloudS3Config()` 不再从 `S3_*` 回退读取 |
| `S3_KEY_PREFIX` / `S3_PUBLIC_URL` | 不再需要（key 由服务层生成，读取不走公开 URL） |
| `ANYCAP_CLOUD_S3_KEY_PREFIX` / `ANYCAP_CLOUD_S3_PUBLIC_URL` | 不再需要 |

### 6.2 保留的环境变量（`CloudS3` → 统一 S3 配置）

所有环境通过相同变量名配置不同值：

```bash
# 必填 — 每个环境不同
ANYCAP_CLOUD_S3_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
ANYCAP_CLOUD_S3_ACCESS_KEY_ID=<key>
ANYCAP_CLOUD_S3_SECRET_ACCESS_KEY=<secret>
ANYCAP_CLOUD_S3_BUCKET=anycap-cloud            # dev: anycap-cloud-dev, prod: anycap-cloud

# 可选（有合理默认值）
ANYCAP_CLOUD_S3_REGION=auto
ANYCAP_CLOUD_S3_PRESIGN_EXPIRY_SECONDS=600       # presigned PUT 有效期
ANYCAP_CLOUD_S3_PRESIGN_GET_EXPIRY_SECONDS=3600  # presigned GET 有效期
ANYCAP_CLOUD_S3_FORCE_PATH_STYLE=true
```

### 6.3 环境隔离示例

| 环境 | `ANYCAP_CLOUD_S3_BUCKET` | 说明 |
|------|--------------------------|------|
| local | `anycap-cloud-dev` | 本地开发，与 dev 共用 |
| dev | `anycap-cloud-dev` | 测试环境 |
| prod | `anycap-cloud` | 生产环境 |

## 7. 清理任务（TODO）

`caps/inputs/` 下的临时对象后续需要定期清理，但不在本期实现。

### 7.1 方案

- 后续考虑在自有云的定时 FaaS / cron job 中执行
- 逻辑：清理超过 TTL 的 `caps/inputs/` 对象，并同步更新 `caps_uploads` / `storage_objects`
- 具体实现、运行环境、告警策略后续单独确认

### 7.2 为什么不用 R2 Lifecycle

- 更灵活：可以按 prefix 配置不同策略
- 可观测：自有任务可以记录清理日志、发告警
- DB 同步：清理 R2 对象的同时更新 DB 记录，保持一致性
- 可扩展：后续 `caps/outputs/`、Drive、Page 的 GC 也可复用同一套任务框架

## 8. 迁移步骤

还没上线，不需要兼容旧数据，直接切换。

### Step 1：存储层统一重构

1. 新建 `caps_uploads`、`caps_tasks`、`caps_task_artifacts` 表（DB migration）
2. 删除 `port.ObjectStorage` 接口，统一到 `port.CloudObjectStore`
3. `CloudObjectStore` 新增 `PresignGetObject` 方法
4. 删除 `config.S3` 配置段和 `loadS3Config()`，只保留 `CloudS3`
5. 删除 `loadCloudS3Config()` 中对 `S3_*` 的 fallback，删除 `PublicURL` / `KeyPrefix`
6. 删除 `buildObjectStorage()`，统一用 `buildCloudObjectStorage()`
7. 重构 `capapp.Service`：注入 `spaceService`、caps repos、`objectStore`
8. 更新 capabilities handler：presign 返回 `anycap://upload/{id}`；invoke 接口继续接收 URL，并在调用时现签 GET URL

### Step 2：公共静态资源迁移

9. `cdn.anycap.cloud` 路由（公共静态资产无鉴权代理）
10. `public/` prefix 下的静态资源（字体等）上传到 `anycap-cloud` bucket

### Step 3：清理旧 bucket

11. Cloudflare 移除 `anycap-tmp` 的 custom domain（`cdn.anycap.cloud`）
12. Auth0 登录页字体 URL 改为 `cdn.anycap.cloud`（现在走 Edge Worker）
13. 确认无引用后删除 `anycap-tmp` bucket

### Step 4：后续 TODO

14. 输出转存到 `caps/outputs/...`
15. `artifact.anycap.cloud` 路由
16. 自有云定时清理任务

## 9. 文件影响清单

| 文件 | 改动 |
|------|------|
| `internal/domain/port/capabilities.go` | 删除 `ObjectStorage` 接口 |
| `internal/domain/port/storage.go` | `CloudObjectStore` 新增 `PresignGetObject` |
| `internal/domain/model/caps_upload.go` | 新增 `CapsUpload` 模型 |
| `internal/domain/model/caps_task.go` | 新增 `CapsTask` 模型 |
| `internal/domain/model/caps_task_artifact.go` | 新增 `CapsTaskArtifact` 模型 |
| `internal/domain/port/caps_upload.go` | 新增 `CapsUploadRepository` 接口 |
| `internal/domain/port/caps_task.go` | 新增 `CapsTaskRepository` 接口 |
| `internal/domain/port/caps_task_artifact.go` | 新增 `CapsTaskArtifactRepository` 接口 |
| `internal/infrastructure/postgres/caps_upload.go` | 新增 `CapsUploadRepo` 实现 |
| `internal/infrastructure/postgres/caps_task.go` | 新增 `CapsTaskRepo` 实现 |
| `internal/infrastructure/postgres/caps_task_artifact.go` | 新增 `CapsTaskArtifactRepo` 实现 |
| `internal/infrastructure/s3store/client.go` | 删除 `PresignPut`，新增 `PresignGetObject` |
| `internal/infrastructure/s3store/stub.go` | 简化为只实现 `CloudObjectStore`，新增 `PresignGetObject` stub |
| `internal/application/capabilities/service.go` | 重构：presign 返回 `anycap://upload/{id}`，支持 sha256 去重，invoke 阶段创建 `caps_task` 并现签 GET URL |
| `internal/app/bootstrap.go` | 删除 `buildObjectStorage`，caps 用同一个 `cloudObjectStore` |
| `internal/config/config.go` | 删除 `S3` 字段和 `loadS3Config()`，清理 `S3_*` fallback，删除 `PublicURL` / `KeyPrefix` |
| `internal/transport/http/handlers/capabilities.go` | presign 响应改为 `anycap://upload/{id}`，invoke 请求继续接收 URL |
| `configs/server/local.env.example` | 删除 `S3_*` 变量，只保留 `ANYCAP_CLOUD_S3_*` |
| `workers/edge/src/index.ts` | 新增 `cdn.anycap.cloud` 路由 |
| `workers/edge/src/public.ts` | 新增 Public handler |
| `workers/edge/wrangler.toml` | 新增 `CDN_HOST` 变量 |
| `web/auth0-login-page.html` | 字体 URL 保持 `cdn.anycap.cloud`（改走 Worker） |
| `docs/action/spec/upload.md` | 全面更新：单 bucket、`anycap://upload/{id}` 契约、sha256 去重、调用时现签 GET |
| `docs/action/spec/capabilities-understand.md` | bucket 和调用契约更新 |
| `docs/plans/2026-03-25-upload-security-hardening.md` | bucket 策略更新 |
| `docs/plans/2026-03-28-drive-page-r2-worker-design.md` | Section 4.1 更新为单 bucket |
| DB migration | 新增 `caps_uploads`、`caps_tasks`、`caps_task_artifacts` 表 |
