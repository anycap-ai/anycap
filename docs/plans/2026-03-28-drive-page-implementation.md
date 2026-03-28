# Drive / Page 实施计划

> Date: 2026-03-28
> 设计文档: `2026-03-28-drive-page-r2-worker-design.md`
> 原则: 每个 Step 可独立测试验证，完成后再进入下一步。

## 依赖关系总览

```
Step 0: Foundation (DB + Models + Ports)
  │
Step 1: Space 服务
  │
  ├──────────────────────┐
  │                      │
Step 2: Drive 后端       Step 3: Page 后端
  2a: CRUD                3a: 站点 CRUD
  2b: Upload              3b: 版本上传
  2c: Share               3c: 发布/下架/回滚
  │                      │
  ├──────────────────────┤
  │                      │
Step 4: KV Sync 基础设施
  4a: Job Worker
  4b: Drive Projector
  4c: Page Projector
  │
  ├──────────────────────┐
  │                      │
Step 5: CLI              Step 6: Dashboard
  5a: Drive 命令          6a: Drive 页面
  5b: Page 命令           6b: Page 页面
  │                      │
  ├──────────────────────┤
  │
Step 7: Cloudflare Worker
  7a: 项目搭建 + Drive handler
  7b: Page handler
```

说明：Step 2 和 Step 3 可并行；Step 5 和 Step 6 可并行；Step 7 依赖 Step 4。

---

## Step 0: Foundation

> 目标：建立数据库表、领域模型、端口接口。后续所有 Step 都依赖此步。

### 0a: DB Migration

**产出文件：**
- `internal/infrastructure/postgres/migrations/` 下新增 migration 文件

**建表（按设计文档 Section 3）：**
- `spaces` (id, owner_user_id, name, created_at)
- `drive_nodes` (id, space_id, parent_id, kind, name, storage_object_id, size, mime, edge_version, created_by, created_at, updated_at, deleted_at)
- `drive_share_links` (id, node_id, token, status, expires_at, password_hash, password_salt, edge_version, created_at, updated_at)
- `page_sites` (id, space_id, name, page_name, current_version_id, access_mode, password_hash, password_salt, edge_version, created_at, updated_at, deleted_at)
- `page_versions` (id, page_id, version_no, source_version_id, status, asset_prefix, spa_fallback, created_by, created_at)
- `page_slug_registry` (slug, status, page_id, created_at)
- `upload_sessions` (id, space_id, target_type, target_id, object_key, status, expires_at, created_at)
- `storage_objects` (id, space_id, bucket, object_key, size, mime, etag, sha256, created_at)
- `kv_sync_jobs` (id, job_type, target_id, edge_version, payload, status, attempts, max_attempts, next_retry_at, locked_by, locked_at, last_error, created_at, updated_at)

**索引（关键）：**
- `drive_nodes`: (space_id, parent_id), (space_id, deleted_at) 复合索引
- `drive_share_links`: (node_id) WHERE status='active' 唯一索引, (token) 唯一索引
- `page_sites`: (space_id), (page_name) 唯一索引
- `page_slug_registry`: (slug) 唯一索引
- `kv_sync_jobs`: (status, next_retry_at) 用于 worker 抢任务

**验证：**
- `make dev` 启动后 migration 自动执行
- 通过 psql 确认所有表和索引存在
- 插入/查询基础测试数据无报错

### 0b: Domain Models

**产出文件：**
- `internal/domain/model/space.go`
- `internal/domain/model/drive.go`
- `internal/domain/model/page.go`
- `internal/domain/model/storage.go`
- `internal/domain/model/kvsync.go`

**内容：** 每个文件定义对应的 Go struct 和常量（如 `DriveNodeKindFolder`/`DriveNodeKindFile`、`PageAccessModePublic`/`PageAccessModePassword`、`PageVersionStatusDraft`/`Uploaded`/`Verified`/`Published`/`Archived` 等）。

**验证：** 编译通过。

### 0c: Domain Ports

**产出文件：**
- `internal/domain/port/space.go`
- `internal/domain/port/drive.go`
- `internal/domain/port/page.go`
- `internal/domain/port/storage.go` (扩展现有 ObjectStorage 或新增 DriveObjectStore)
- `internal/domain/port/kvsync.go`

**内容：** 定义 repository 接口和服务接口（如 `SpaceRepository`、`DriveNodeRepository`、`DriveShareRepository`、`PageSiteRepository`、`PageVersionRepository`、`KVSyncJobRepository` 等）。

**验证：** 编译通过，接口方法签名与 migration 表结构对齐。

---

## Step 1: Space 服务

> 目标：用户首次调用 Drive/Page API 时自动创建 personal space。

**产出文件：**
- `internal/application/space/service.go`
- `internal/infrastructure/postgres/space_repo.go`

**核心逻辑：**
- `GetOrCreatePersonalSpace(ctx, userID) -> Space`：查询用户的 space，不存在则创建。
- 当前阶段只有 personal space，权限判断 = `space.owner_user_id == currentUser`。

**验证：**
- 单元测试：同一 userID 多次调用返回同一 space。
- 集成测试（需 PG）：确认 DB 行正确创建。

---

## Step 2: Drive 后端

### 2a: Drive CRUD（目录与文件元数据）

> 目标：实现目录树操作的 service + handler，不含上传和分享。

**产出文件：**
- `internal/application/drive/service.go` — mkdir, list, rename, move, softDelete, 递归删除
- `internal/infrastructure/postgres/drive_node_repo.go`
- `internal/transport/http/handlers/drive_handler.go`

**API：**
- `POST /v1/drive/folders` — 创建目录
- `GET /v1/drive/nodes` — 列出目录内容（query param: parent_id 或 path）
- `PATCH /v1/drive/nodes/{id}` — 重命名/移动
- `DELETE /v1/drive/nodes/{id}` — 软删除（目录递归）

**注册路由：** 在 `bootstrap.go` 中接入 protected group。

**验证：**
- curl/httptest 创建嵌套目录 -> 列出 -> 重命名 -> 移动 -> 删除
- 删除目录后子节点 `deleted_at` 不为 null
- 权限：用户只能操作自己 space 的节点

### 2b: Drive Upload（presign + complete）

> 目标：实现文件上传三步流程，CLI 或 Dashboard 可上传文件到 Drive。

**产出文件：**
- `internal/application/drive/upload.go` — presign、complete 逻辑
- `internal/infrastructure/postgres/upload_session_repo.go`
- `internal/infrastructure/postgres/storage_object_repo.go`
- handler 方法追加到 `drive_handler.go`

**API：**
- `POST /v1/drive/files/presign` — 生成 presign URL，创建 upload_session(pending)
- `POST /v1/drive/files/complete` — HEAD 校验 R2 -> 创建 storage_object -> 创建 drive_node(file)

**R2 配置：** 新 bucket `anycap-cloud`，复用现有 S3 client 库，独立 config。

**验证：**
- presign 返回有效 PUT URL
- curl PUT 上传文件到 R2
- complete 后 drive_node + storage_object 正确创建
- `drive ls` 能看到上传的文件

### 2c: Drive Share

> 目标：实现分享链接的创建、更新、rotate、撤销。

**产出文件：**
- `internal/application/drive/share.go`
- `internal/infrastructure/postgres/drive_share_repo.go`
- handler 方法追加到 `drive_handler.go`

**API：**
- `PUT /v1/drive/nodes/{id}/share` — 创建或更新 active 链接（支持 expires、password）
- `POST /v1/drive/nodes/{id}/share/rotate` — 失效旧 token，生成新 token
- `DELETE /v1/drive/nodes/{id}/share` — 撤销

**密码处理：** PBKDF2-HMAC-SHA256 + random salt（服务端生成 hash，存入 DB）。

**验证：**
- 创建分享 -> 返回 token URL
- 更新过期时间/密码 -> DB 数据正确
- rotate -> 旧 token 失效，新 token 生成
- 撤销 -> status=revoked
- 同一 node 不允许两个 active 链接

---

## Step 3: Page 后端

### 3a: Page 站点 CRUD

> 目标：实现站点创建、列表、更新设置、软删除。

**产出文件：**
- `internal/application/page/service.go`
- `internal/infrastructure/postgres/page_site_repo.go`
- `internal/infrastructure/postgres/page_slug_repo.go`
- `internal/transport/http/handlers/page_handler.go`

**API：**
- `POST /v1/pages` — 创建站点（自动生成 page_name + slug 注册）
- `GET /v1/pages` — 列出用户站点
- `GET /v1/pages/{id}` — 站点详情
- `PATCH /v1/pages/{id}` — 更新 name/access_mode/password/spa_fallback

**page-name 生成：** 从 name 提取 slug + 随机后缀，最小 12 字符。

**验证：**
- 创建站点 -> page_name 格式正确，slug_registry 记录 active
- 列出 -> 只返回当前用户的站点
- 更新 access_mode/password -> DB 正确
- 软删除 -> slug_registry 变为 tombstone，同名不可重新创建

### 3b: Page 版本上传

> 目标：实现版本创建和资产上传流程。

**产出文件：**
- `internal/application/page/version.go`
- `internal/infrastructure/postgres/page_version_repo.go`
- handler 方法追加到 `page_handler.go`

**API：**
- `POST /v1/pages/{id}/versions` — 创建版本(draft)，返回 version_id + asset_prefix
- 资产上传复用 presign/complete 流程（target_type=page）
- complete 后版本状态：`draft -> uploaded`
- 服务端校验资产存在性：`uploaded -> verified`

**验证：**
- 创建版本 -> status=draft, version_no 递增
- 上传资产 -> R2 对象在正确 prefix 下
- complete -> status 推进到 uploaded -> verified

### 3c: Page 发布 / 下架 / 回滚

> 目标：实现版本发布、下架、从历史版本回滚。

**产出文件：**
- 追加到 `internal/application/page/version.go`
- handler 方法追加到 `page_handler.go`

**API：**
- `POST /v1/pages/{id}/versions/{vid}/publish` — 校验 version_no > current，更新 current_version_id，旧版本 archived
- `POST /v1/pages/{id}/versions/{vid}/rollback-clone` — 复制历史版本资产到新版本 -> verified -> 可 publish
- `POST /v1/pages/{id}/unpublish` — current_version_id=null，当前版本 archived

**验证：**
- publish v2 成功，publish v1 失败（forward-only）
- unpublish 后 current_version_id=null
- rollback-clone 生成新 version_no，资产在新 prefix 下
- rollback-clone 后 publish 成功

---

## Step 4: KV Sync 基础设施

### 4a: Job Worker

> 目标：实现通用的 kv_sync_jobs 后台处理框架。

**产出文件：**
- `internal/infrastructure/kvsync/worker.go` — 后台 worker（定时轮询、抢任务、执行、重试）
- `internal/infrastructure/kvsync/cf_kv_client.go` — Cloudflare KV API client
- `internal/infrastructure/postgres/kvsync_job_repo.go`
- `internal/infrastructure/kvsync/worker_test.go`

**核心逻辑：**
- 轮询 `kv_sync_jobs WHERE status IN ('pending','failed') AND next_retry_at <= now()`
- `FOR UPDATE SKIP LOCKED` 抢任务，标记 processing
- 按 `job_type` 分发给对应 projector
- 成功 -> done；失败 -> 递增 attempts + 指数退避；超 max_attempts -> dead + 告警
- processing 超时回收（如 5 分钟无更新 -> 重置为 pending）

**Cloudflare KV client：** 调用 Cloudflare API 写 KV（`PUT /accounts/{id}/storage/kv/namespaces/{ns}/values/{key}`）。

**集成到 bootstrap.go：** dev/prod 模式下启动后台 goroutine。

**验证：**
- 单元测试：job 状态流转（pending -> processing -> done/failed/dead）
- 集成测试：插入 mock job -> worker 拾取并执行 -> 状态变为 done
- 并发测试：两个 worker 不会同时处理同一 job

### 4b: Drive Edge Projector

> 目标：Drive 变更时写入正确的 KV 数据。

**产出文件：**
- `internal/infrastructure/kvsync/drive_projector.go`

**Job 类型与 KV Key 映射：**
- `drive_file_meta_sync` -> `drive:file:{file_id}` (object_key, mime, size, etag, name, parent_id, edge_version)
- `drive_dir_children_sync` -> `drive:dir:{dir_id}:children` (从 PG 全量重建当前一层子节点)
- `drive_dir_meta_sync` -> `drive:dir:{dir_id}:meta` (dir_id, parent_id, space_id, name, edge_version)
- `drive_share_sync` -> `drive:share:{token}` (root_dir_id, 访问策略, 过期, 密码等)
- `dir_tree_delete` -> 批量删除子树相关 KV 条目

**接入点：** 在 Step 2 的 service 层追加 `kv_sync_jobs` 写入逻辑（事务内 edge_version++ 并 insert job）。

**验证：**
- 上传文件 -> kv_sync_jobs 有 2 条 pending（file_meta + dir_children）
- worker 执行后 KV 中有正确数据（mock KV client 验证 payload）
- edge_version 过期的 job 被标记 obsolete

### 4c: Page Edge Projector

> 目标：Page 变更时写入正确的 KV 数据。

**产出文件：**
- `internal/infrastructure/kvsync/page_projector.go`

**Job 类型与 KV Key 映射：**
- `page_host_sync` -> `page:host:{hostname}` (page_id, space_id, current_version_id, asset_prefix, spa_fallback, access_mode, password_hash, password_salt, edge_version)
- `page_host_delete` -> 删除 `page:host:{hostname}`

**接入点：** 在 Step 3 的 publish/unpublish/set 操作中追加 job 写入。

**验证：**
- publish -> kv_sync_jobs 有 page_host_sync 记录
- unpublish -> kv_sync_jobs 有 page_host_delete 记录
- worker 执行后 KV payload 正确

---

## Step 5: CLI

### 5a: Drive CLI 命令

> 目标：实现 `anycap drive` 全部子命令。

**产出文件：**
- `internal/cli/command/drive/drive.go` — 父命令
- `internal/cli/command/drive/upload.go` — 透明处理 presign+PUT+complete
- `internal/cli/command/drive/mkdir.go`
- `internal/cli/command/drive/ls.go`
- `internal/cli/command/drive/mv.go`
- `internal/cli/command/drive/rm.go`
- `internal/cli/command/drive/share.go` — share / share rotate / unshare
- 在 `root.go` 注册 `drive` 顶层命令

**upload 实现要点：**
1. 调用 `/v1/drive/files/presign` 获取 upload URL
2. 读取本地文件，HTTP PUT 到 upload URL
3. 调用 `/v1/drive/files/complete`
4. 输出 `{"status":"success","file_id":"...","name":"...","size":...}`

**验证：**
- `anycap drive mkdir /test` -> 成功
- `anycap drive upload ./file.txt --dir /test` -> 文件出现在 /test 下
- `anycap drive ls /test` -> 列出 file.txt
- `anycap drive share <id> --expires 7d --password secret` -> 返回链接
- `anycap drive share rotate <id>` -> 新 token
- `anycap drive unshare <id>` -> 撤销
- `anycap drive mv /test/file.txt /test/renamed.txt` -> 重命名
- `anycap drive rm /test` -> 目录及内容删除

### 5b: Page CLI 命令

> 目标：实现 `anycap page` 全部子命令。

**产出文件：**
- `internal/cli/command/page/page.go` — 父命令
- `internal/cli/command/page/create.go`
- `internal/cli/command/page/deploy.go` — 扫描目录 + 逐文件上传 + 可选 publish
- `internal/cli/command/page/publish.go`
- `internal/cli/command/page/unpublish.go`
- `internal/cli/command/page/rollback.go`
- `internal/cli/command/page/list.go`
- `internal/cli/command/page/info.go`
- `internal/cli/command/page/versions.go`
- `internal/cli/command/page/set.go`
- 在 `root.go` 注册 `page` 顶层命令

**deploy 实现要点：**
1. 若 `--name` 指定且站点不存在，先 create
2. 调用 create version -> 获取 version_id + asset_prefix
3. 遍历目录文件，逐个 presign + PUT + complete
4. 若 `--publish`，调用 publish API
5. 输出 `{"status":"success","page_url":"https://xxx.page.anycap.cloud","version":2,"published":true}`

**验证：**
- `anycap page create --name "test-site"` -> 返回 page_name URL
- `anycap page deploy ./dist --name "test-site" --publish` -> 上传+发布成功
- `anycap page list` -> 列出站点
- `anycap page info <id>` -> 显示详情含 URL 和当前版本
- `anycap page set <id> --access password --password secret` -> 更新
- `anycap page unpublish <id>` -> 下架
- `anycap page versions <id>` -> 版本历史
- `anycap page rollback <id> --version 1` -> 克隆+可发布

---

## Step 6: Dashboard

### 6a: Drive 页面

> 目标：在 Dashboard 中实现文件浏览器和分享管理。

**产出文件：**
- `web/src/app/dashboard/drive/page.tsx` — 文件浏览器
- `web/src/components/dashboard/DriveSharePanel.tsx` — 分享管理面板
- `web/src/lib/api/hooks.ts` — 追加 drive 相关 hooks
- `web/src/lib/api/types.ts` — 追加 drive 类型定义
- `web/src/components/dashboard/DashboardShell.tsx` — sidebar 追加 Drive 导航项

**页面功能：**
- 文件/目录列表（Name / Size / Modified / Share）
- 面包屑导航
- Upload 按钮 + New Folder 按钮
- 行内 `...` 菜单：Rename / Move / Delete
- Share 图标 -> 打开 DriveSharePanel

**验证：**
- 登录 Dashboard -> 侧边栏有 Drive 入口
- 进入 Drive -> 显示根目录内容
- 点击目录 -> 面包屑更新，显示子目录内容
- Upload 文件 -> 列表刷新显示新文件
- 创建分享 -> 面板显示链接 URL
- 设置密码/过期 -> 更新成功

### 6b: Page 管理页面

> 目标：在 Dashboard 中实现站点列表和版本管理。

**产出文件：**
- `web/src/app/dashboard/pages/page.tsx` — 站点列表
- `web/src/app/dashboard/pages/[id]/page.tsx` — 站点详情+版本管理
- `web/src/lib/api/hooks.ts` — 追加 page 相关 hooks
- `web/src/lib/api/types.ts` — 追加 page 类型定义
- `web/src/components/dashboard/DashboardShell.tsx` — sidebar 追加 Pages 导航项

**页面功能：**
- 站点列表：Name / URL / Status / Updated
- 站点详情：基本信息 + 版本表格 + Publish/Unpublish 按钮
- 设置面板：access_mode / password / SPA fallback

**验证：**
- 登录 Dashboard -> 侧边栏有 Pages 入口
- 创建过站点 -> 列表显示站点和 URL
- 点击进入详情 -> 版本列表正确
- Publish 按钮对 verified 版本可用
- Unpublish -> 站点下架，状态更新

---

## Step 7: Cloudflare Worker

> 前置：补充设计文档 Section 8.2 TODO 项。

### 7a: 项目搭建 + Drive Handler

> 目标：Worker 项目初始化，实现 Drive 分享访问（目录浏览 + 文件下载）。

**产出文件：**
- `workers/edge/` — Worker 项目目录
- `workers/edge/wrangler.toml` — KV namespace / R2 bucket binding / secrets
- `workers/edge/src/index.ts` — 入口 + 路由分发
- `workers/edge/src/drive.ts` — Drive handler
- `workers/edge/src/auth.ts` — 密码校验 + rate limit
- `workers/edge/src/ui/` — HTML 模板（目录浏览页 / 密码页 / 错误页）

**Drive handler 流程：**
1. `GET /s/{token}` -> KV 读 `drive:share:{token}` -> 鉴权 -> 渲染 root_dir_id children
2. `GET /s/{token}/dir/{dir_id}` -> 鉴权 -> 子树校验 -> 渲染 children
3. `GET /s/{token}/file/{file_id}` -> 鉴权 -> 子树校验 -> R2 读文件 -> 返回

**验证：**
- `wrangler dev` 本地启动
- 访问有效 token URL -> 显示目录浏览页
- 访问带密码的 token -> 显示密码输入页 -> 输入正确密码 -> 进入
- 访问过期/撤销 token -> 404/410
- 点击文件 -> 下载/渲染

### 7b: Page Handler

> 目标：实现 Page 站点访问。

**产出文件：**
- `workers/edge/src/page.ts` — Page handler

**Page handler 流程：**
1. 从 hostname 提取 page-name
2. KV 读 `page:host:{hostname}` -> 获取 asset_prefix + access_mode
3. 密码校验（如 access_mode=password）
4. Convention routing：`{path}` -> `{path}/index.html` -> `{path}.html` -> SPA fallback
5. R2 读资产 -> 返回（正确 Content-Type）

**验证：**
- 访问 `xxx.page.anycap.cloud` -> 返回 index.html
- 访问 `/about` -> convention routing 正确解析
- SPA fallback 启用时，未匹配路径返回 index.html
- 密码保护站点 -> 密码页 -> 输入后访问
- 未发布站点 -> 404

---

## 里程碑检查点

| 检查点 | 完成条件 | 可演示能力 |
|--------|----------|-----------|
| M1: Drive 后端可用 | Step 0 + 1 + 2 完成 | curl 完成文件上传、目录操作、分享创建 |
| M2: Page 后端可用 | Step 3 完成 | curl 完成站点创建、版本上传、发布 |
| M3: CLI 可用 | Step 5 完成 | Agent 可通过 CLI 使用 Drive 和 Page |
| M4: Edge 可访问 | Step 4 + 7 完成 | 浏览器访问分享链接和 Page 站点 |
| M5: Dashboard 可用 | Step 6 完成 | 用户通过 Dashboard 管理 Drive 和 Page |
