# AnyCap CLI Headless Login Nonblocking Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为 `anycap login --headless` 增加适配 agent/toolcall 的非阻塞两步式登录能力，让 agent 能先拿到 URL/code，再在人类确认后继续轮询取回最终 API key。

**Architecture:** 保持现有 server device-flow 协议不变，复用 `POST /v1/auth/device-code` 与 `POST /v1/auth/device-poll`。CLI 侧新增“init + poll”契约：`--headless --no-wait` 只初始化并返回结构化结果，`login poll` 负责恢复并读取服务端持久化的登录会话状态。现有阻塞式 `anycap login --headless` 保持不变，并尽量复用新的底层 helper。

**Tech Stack:** Go 1.24, Cobra, AnyCap CLI HTTP client, httptest, go test

---

**Design References:**
- `docs/plans/2026-03-27-cli-headless-login-nonblocking-design.md`
- `docs/cli/spec/oauth.md`

### Task 1: 抽离 headless init/poll 底层能力

**Files:**
- Modify: `internal/cli/auth/device.go`
- Create: `internal/cli/auth/device_test.go`
- Reference: `internal/cli/httpclient/client.go`

**Step 1: 写失败测试**

- 为 `device.go` 新增单元测试，覆盖：
  - `DeviceInit` 从 `/v1/auth/device-code` 解析 `login_session_id`、`user_code`、`verification_uri`、`interval`、`expires_in`
  - `DevicePoll` 从 `/v1/auth/device-poll` 解析 `pending`、`complete`、`expired`、`slow_down`
  - 现有 `DeviceFlow` 仍能复用新 helper 并在 `complete` 时返回 API key credential

**Step 2: 运行测试确认失败**

Run: `/usr/local/go/bin/go test ./internal/cli/auth -run 'TestDevice' -v`
Expected: FAIL

**Step 3: 实现最小 helper**

- 在 `internal/cli/auth/device.go` 中新增显式结构体，例如：
  - `DeviceInitResult`
  - `DevicePollResult`
- 抽出可复用 helper：
  - `DeviceInit(ctx, client)`
  - `DevicePoll(ctx, client, loginSessionID)`
- 让现有 `DeviceFlow` 改为基于这两个 helper 驱动阻塞式 UX，而不是直接内联 HTTP + JSON 解析
- 保持 `DeviceFlow` 对现有 CLI 用户的文案和行为不变

**Step 4: 运行测试确认通过**

Run: `/usr/local/go/bin/go test ./internal/cli/auth -run 'TestDevice' -v`
Expected: PASS

**Step 5: Commit**

```bash
git add internal/cli/auth/device.go internal/cli/auth/device_test.go
git commit -m "refactor: extract headless login init and poll helpers"
```

### Task 2: 扩展 login 命令支持非阻塞 headless init

**Files:**
- Modify: `internal/cli/command/meta/login.go`
- Modify: `internal/cli/output/json.go`
- Modify: `internal/cli/command/login_test.go`

**Step 1: 写失败测试**

- 为 `login` 命令新增测试，覆盖：
  - `anycap login --headless --no-wait --json` 返回结构化 JSON 到 stdout
  - 返回字段至少包含 `login_session_id`、`verification_uri`、`user_code`、`expires_in`、`interval`
  - 返回 `poll_command`
  - 返回字符串 `next_action_hint`
  - `next_action_hint` 明确告诉 agent：先把 URL/code 给用户，要求用户完成后回到 agent 确认，再执行 `poll_command`
  - `--no-wait` 不保存 credential，不进入阻塞 poll
  - `--no-wait` 仅允许和 `--headless` 组合
  - `--json` 在此阶段至少覆盖 `--no-wait` 和 `login poll`

**Step 2: 运行测试确认失败**

Run: `/usr/local/go/bin/go test ./internal/cli/command -run 'TestLogin.*NoWait|TestLogin.*JSON' -v`
Expected: FAIL

**Step 3: 实现最小命令层**

- 在 `internal/cli/command/meta/login.go` 增加：
  - `--no-wait`
  - `--json`
- 约束：
  - `--no-wait` 只能用于 `--headless`
  - `--no-wait` 下不允许已有 credential 直接短路掉人类协作流程时，要保留现有“已登录”保护语义
- `--headless --no-wait --json` 路径：
  - 调 `auth.DeviceInit`
  - 用 `output.WriteJSON` 将 init 结果输出到 stdout
  - 输出 `poll_command`，例如：
    - `anycap login poll --session <real-login-session-id> --json`
  - 输出字符串 `next_action_hint`，明确提示 agent：
    - 展示 `verification_uri` 与 `user_code`
    - 告诉用户完成后要回来回复 agent 确认已完成
    - 在用户确认后，执行 `poll_command`
  - stderr 不再打印阻塞等待文案
- 如果后续希望支持非 JSON 模式，可留 TODO，但 phase 1 先把 agent 场景走通

**Step 4: 运行测试确认通过**

Run: `/usr/local/go/bin/go test ./internal/cli/command -run 'TestLogin.*NoWait|TestLogin.*JSON' -v`
Expected: PASS

**Step 5: Commit**

```bash
git add internal/cli/command/meta/login.go internal/cli/output/json.go internal/cli/command/login_test.go
git commit -m "feat: add nonblocking headless login init command"
```

### Task 3: 新增 `login poll` 恢复命令

**Files:**
- Modify: `internal/cli/command/meta/login.go`
- Modify: `internal/cli/command/login_test.go`
- Reference: `internal/cli/auth/device.go`
- Reference: `internal/cli/config/credential.go`

**Step 1: 写失败测试**

- 为 `login poll --session <id> --json` 新增测试，覆盖：
  - `pending` 时输出状态 JSON，不保存 credential
  - `complete` 时保存 credential，并输出 `status + api_key + user`
  - `expired` 时返回可理解错误或结构化结果
  - 缺少 `--session` 时参数校验失败

**Step 2: 运行测试确认失败**

Run: `/usr/local/go/bin/go test ./internal/cli/command -run 'TestLoginPoll' -v`
Expected: FAIL

**Step 3: 实现最小恢复命令**

- 在 `internal/cli/command/meta/login.go` 下新增 `poll` 子命令，形态为：

```bash
anycap login poll --session <id> --json
```

- 命令行为：
  - 调 `auth.DevicePoll`
  - `pending` / `slow_down`：结构化输出，不写 credential
  - `complete`：解析 credential，保存到本地，并输出完成 JSON
  - `expired`：输出结构化失败或返回明确错误
- 复用 `output.WriteJSON`，不要重新发明一套输出通道

**Step 4: 运行测试确认通过**

Run: `/usr/local/go/bin/go test ./internal/cli/command -run 'TestLoginPoll' -v`
Expected: PASS

**Step 5: Commit**

```bash
git add internal/cli/command/meta/login.go internal/cli/command/login_test.go
git commit -m "feat: add resumable login poll command"
```

### Task 4: 扩展 mock server 以支持可控的 pending -> complete 测试路径

**Files:**
- Modify: `internal/cli/testutil/mockserver/server.go`
- Modify: `internal/cli/testutil/mockserver/server_test.go`
- Modify: `internal/cli/command/login_test.go`

**Step 1: 写失败测试**

- 为 mock server 增加覆盖：
  - `device-code` 创建 session 后，第一次 poll 可以保持 `pending`
  - 测试代码可通过 helper 将某个 session 标记为完成
  - 完成后 poll 返回最终 API key

**Step 2: 运行测试确认失败**

Run: `/usr/local/go/bin/go test ./internal/cli/testutil/mockserver -v`
Expected: FAIL

**Step 3: 实现最小测试夹具**

- 不改生产 server 协议，只在 mock server 内部增加可编程状态
- 推荐做法：
  - `deviceCodes` 记录更多状态字段，如 `authorized bool`
  - 增加测试 helper，例如 `AuthorizeDeviceSession(loginSessionID string)` 或按 user code 授权
- 保持现有老测试仍能快速完成，不把所有 `--headless` 测试都变成真正异步

**Step 4: 运行测试确认通过**

Run: `/usr/local/go/bin/go test ./internal/cli/testutil/mockserver -v`
Expected: PASS

**Step 5: Commit**

```bash
git add internal/cli/testutil/mockserver/server.go internal/cli/testutil/mockserver/server_test.go internal/cli/command/login_test.go
git commit -m "test: support resumable device flow states in mock server"
```

### Task 5: 回归测试现有阻塞式 headless 与浏览器登录

**Files:**
- Modify: `internal/cli/command/login_test.go`
- Reference: `internal/cli/auth/auto.go`
- Reference: `internal/cli/auth/localhost.go`

**Step 1: 写回归测试**

- 确认现有：
  - `anycap login --headless` 仍然阻塞直到保存 credential
  - `anycap login` 浏览器流不受影响
  - 已登录保护语义不变
- 确认新旧两套 headless 入口可并存：
  - 阻塞式：给人类终端
  - 非阻塞式：给 agent/toolcall

**Step 2: 运行测试确认失败**

Run: `/usr/local/go/bin/go test ./internal/cli/... -run 'TestLogin(DeviceCodeFlow|BrowserPollFlow|Poll|NoWait)' -v`
Expected: FAIL

**Step 3: 修正实现直到全部通过**

- 如果 `DeviceFlow` 因 helper 抽离出现回归，优先修正文案和保存 credential 的时机
- 不要改变 `AutoFlow` 的选择逻辑
- 不要把 phase 1 范围扩展到普通 `cli login`

**Step 4: 运行测试确认通过**

Run: `/usr/local/go/bin/go test ./internal/cli/... -run 'TestLogin(DeviceCodeFlow|BrowserPollFlow|Poll|NoWait)' -v`
Expected: PASS

**Step 5: Commit**

```bash
git add internal/cli/command/login_test.go internal/cli/auth
git commit -m "test: cover blocking and nonblocking login flows"
```

### Task 6: 更新 OAuth/CLI 文档与 agent 使用说明

**Files:**
- Modify: `docs/cli/spec/oauth.md`
- Modify: `skills/anycap-cli/SKILL.md`
- Modify: `skills/anycap-cli/references/cli-reference.md`
- Modify: `docs/plans/2026-03-27-cli-headless-login-nonblocking-design.md`

**Step 1: 写文档差异清单**

- 标出 `--headless` 新增非阻塞形态
- 标出 agent 推荐交互：
  - 先 init
  - 把 URL/code 给人类
  - 等待用户给出“浏览器已完成，可以继续”的确认语义
  - 再 poll
- 标出 `poll` 不要求紧跟 `init`
- 标出持久化 session 是 server 重启可恢复的前提
- 标出 `poll_command` 是给 agent 的直接建议命令，更适合 tool-call 场景
- 标出 `next_action_hint` 是给 agent 的一句话 orchestration hint，说明何时执行 `poll_command`
- 标出 `login_session_id` 仍是权威会话标识；`poll_command` 只是基于它生成的便捷字段

**Step 2: 更新文档**

- 在 `oauth.md` 的 headless 章节加入两步式说明
- 在 skill/reference 里补 agent 使用示例
- 如设计稿有新增执行约定，也回写 design doc 以免设计与实现脱节

**Step 3: 运行最小文档校对**

Run: `rg -n "no-wait|login poll|确认语义|login_session_id|next_action_hint|poll_command" docs/cli/spec/oauth.md skills/anycap-cli docs/plans/2026-03-27-cli-headless-login-nonblocking-design.md`
Expected: matching lines found in all relevant docs

**Step 4: Commit**

```bash
git add docs/cli/spec/oauth.md skills/anycap-cli/SKILL.md skills/anycap-cli/references/cli-reference.md docs/plans/2026-03-27-cli-headless-login-nonblocking-design.md
git commit -m "docs: describe nonblocking headless login flow"
```

### Task 7: 最终验收

**Files:**
- Verify only

**Step 1: 跑最小相关测试集**

Run: `/usr/local/go/bin/go test ./internal/cli/auth ./internal/cli/command ./internal/cli/testutil/mockserver -v`
Expected: PASS

**Step 2: 跑更贴近真实入口的命令级验证**

Run:

```bash
/usr/local/go/bin/go test ./internal/cli/... -run 'TestLogin(DeviceCodeFlow|BrowserPollFlow|Poll|NoWait)' -v
```

Expected: PASS

**Step 3: 手动烟测清单**

- `anycap login --headless` 仍打印 code + URL 并等待完成
- `anycap login --headless --no-wait --json` 立即返回 JSON
- `anycap login poll --session <id> --json` 在 `pending` 时不写 credential
- 完成浏览器登录后再次 `poll` 能拿到并保存 API key
- 已登录状态下的行为与现有 CLI 约定一致

**Step 4: 最终 Commit / Push 准备**

```bash
git status
```

Expected: only intended files changed

**Implementation Notes**

- phase 1 不改 server API shape；只消费现有 `/v1/auth/device-code` 与 `/v1/auth/device-poll`
- phase 1 不改 `anycap login` 浏览器流
- phase 1 不要求 agent 自动持续 poll；推荐的人机协作方式仍是“人类给出确认语义后再 poll”
- phase 1 引入字符串 `next_action_hint` 与便捷字段 `poll_command`
- `next_action_hint` 负责说明人机协作步骤；`poll_command` 负责给 agent 一个可直接执行的下一步命令
- 恢复的权威数据仍是结构化返回里的 `login_session_id`、`verification_uri`、`user_code`、`expires_in`、`interval`
- 若后续需要完整 machine-to-machine orchestration，再考虑增加 server-side poll token 或 resume token，但不在本计划范围内
