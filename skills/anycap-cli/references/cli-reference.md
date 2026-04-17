# CLI Reference

Complete reference for AnyCap CLI commands, authentication methods, configuration, and global flags.

## Table of Contents

- [Global Flags](#global-flags)
- [Authentication](#authentication)
- [Configuration](#configuration)
- [Utility Commands](#utility-commands)

## Global Flags

These flags apply to all commands:

| Flag | Description |
|------|-------------|
| `--endpoint <url>` | Override the server endpoint (default: `https://api.anycap.ai`) |
| `--verbose` | Enable verbose output (debug logs to stderr) |
| `-v, --version` | Print CLI version |

The endpoint is resolved with this precedence: `--endpoint` flag > `ANYCAP_API_ENDPOINT` env > config file > built-in default.

## Authentication

AnyCap supports three authentication methods. Choose based on your environment.

### Browser OAuth (default)

Interactive login via browser. Best for local development and first-time setup.

```bash
anycap login
```

Opens a browser window. After approval, credentials are stored in the system keychain (fallback: `~/.anycap/credentials`).

### Device Code (headless)

For SSH sessions, containers, or environments without a browser.

```bash
anycap login --headless
```

Prints a URL and code. Open the URL on any device, enter the code, and approve. The CLI polls until authentication completes.

For agent / toolcall environments where blocking stdout is hard to consume, use the nonblocking variant:

```bash
anycap login --headless --no-wait --json
```

This returns structured JSON including:

- `login_session_id`
- `verification_uri`
- `user_code`
- `expires_in`
- `interval`
- `poll_command`
- `next_action_hint`

After the human finishes browser login and confirms completion, resume with:

```bash
anycap login poll --session <login_session_id> --json --wait
```

In agent flows, prefer the returned `poll_command` directly. It already includes the real session ID.

### API Key (CI/CD)

For automated pipelines and non-interactive environments. Two options:

**Option A: Pipe key via stdin**

```bash
echo "$ANYCAP_API_KEY" | anycap login --with-token
```

**Option B: Set key directly**

```bash
anycap credentials set-key <api-key>
```

**Option C: Environment variable**

Set `ANYCAP_API_KEY` in your environment. The CLI reads it automatically without requiring `login`.

```bash
export ANYCAP_API_KEY=ak_live_...
anycap status  # authenticated
```

### Check Auth Status

```bash
anycap status
```

Returns server info and current authentication state as JSON.

### Logout

```bash
anycap logout
```

Removes stored credentials from keychain and file.

### Credential Management

```bash
# Show current credential status (type, expiry, source)
anycap credentials show

# Set an API key without going through OAuth
anycap credentials set-key <api-key>
```

## Configuration

Config file: `~/.anycap/config.toml`

### Available Keys

| Key | Type | Default | Env Override | Description |
|-----|------|---------|-------------|-------------|
| `endpoint` | string | `https://api.anycap.ai` | `ANYCAP_API_ENDPOINT` | Server endpoint URL |
| `auto_update` | bool | `true` | `ANYCAP_NO_UPDATE` (any value to disable) | Auto-update CLI from GitHub Releases |
| `feedback` | bool | `true` | -- | Enable the `feedback` command |

### Config Commands

```bash
# Show all config values and file path
anycap config show

# List all available keys as JSON (with types, defaults, descriptions)
anycap config keys

# Get a single value
anycap config get endpoint

# Set a value
anycap config set endpoint https://api.anycap.ai
anycap config set auto_update false
anycap config set feedback false

# Reset a value to default
anycap config unset endpoint
```

### Example Config File

```toml
# ~/.anycap/config.toml
endpoint = "https://api.anycap.ai"
auto_update = true
feedback = true
```

## Utility Commands

## Agent Commands

### Preferred local Feishu connection flow

Use this order for the chat-style Feishu agent flow. Start this flow automatically when the human says things like:

- "用飞书跟你聊天"
- "开启飞书 IM 模式"
- "把你接到我的飞书 bot 上"
- "用 AnyCap 启动飞书机器人"
- "用飞书跟当前 agent 聊天"
- "start AnyCap Feishu daemon"

Do not make the human assemble the low-level daemon command manually. Use the current working directory as `--workspace` unless the human provides another repository path. Infer the local agent from the current runtime: Codex uses `--agent codex`; Claude Code uses `--agent claude-code`; Cursor uses `--agent cursor`. If unsure, ask whether to use Codex, Claude Code, or Cursor.

Read Feishu credentials from the local connection credential store first. The store is written by `anycap connect credentials set feishu` and lives in the AnyCap config dir with mode 0600.

Reason: if the human exports `FEISHU_APP_ID` and `FEISHU_APP_SECRET` after the coding agent process has already started, this agent will not inherit those variables. The shared local credential file is the stable bridge between the human's terminal and the agent-started daemon.

Check credential status without printing secrets:

```bash
anycap connect credentials show feishu
```

If credentials are missing, ask the human to run this in their own terminal and confirm. Never ask the human to paste App Secret values into chat. Never write App Secret values into docs, code, logs, memory files, command history, or final summaries. Do not echo secrets back to the human.

Human terminal setup:

```bash
anycap connect credentials set feishu --app-id <FEISHU_APP_ID> --app-secret <FEISHU_APP_SECRET>
```

```bash
anycap status
```

If the CLI is not authenticated:

```bash
anycap login
```

Start the local agent on the target repository:

```bash
anycap connect feishu --agent codex --workspace /path/to/repo
```

Use Claude Code instead of Codex when that is the desired local agent:

```bash
anycap connect feishu --agent claude-code --workspace /path/to/repo
```

Use Cursor Agent instead of Codex when that is the desired local agent:

```bash
anycap connect feishu --agent cursor --workspace /path/to/repo
```

When the human explicitly wants the Feishu bot to make Codex call AnyCap capabilities, access public internet APIs, or access local-network/VPN-only resources, add:

```bash
anycap connect feishu --agent codex --codex-exec-mode danger-full-access --workspace /path/to/repo
```

The default Codex mode is `safe`, which maps to Codex `--full-auto`. That automates execution but can still run inside Codex's sandboxed or restricted network environment. Feishu resource reads are handled by the local daemon, but commands that Codex runs itself, such as `anycap image generate`, need non-sandboxed local network access.

For Claude Code, the daemon defaults to `--claude-permission-mode acceptEdits`. If the human wants the Feishu bot to make Claude Code call AnyCap capabilities, access public internet APIs, or access local-network/VPN-only resources, pass broader Claude Code permission/tool flags:

```bash
anycap connect feishu --agent claude-code --claude-permission-mode bypassPermissions --claude-allowed-tools Read,Edit,Bash --workspace /path/to/repo
```

The daemon runs Claude Code non-interactively with no TTY for permission prompts. `acceptEdits` can be enough for editing, but shell commands and networked CLI calls may fail or block unless the required tools are explicitly allowed or permissions are bypassed.

For Cursor Agent, pass an explicit model when needed:

```bash
anycap connect feishu --agent cursor --cursor-model <model> --workspace /path/to/repo
```

The user-facing connect path runs Cursor Agent non-interactively with `cursor-agent -p --output-format json --trust --force` and persists Cursor Agent `session_id` for follow-up turns. Tell the human that this lets Cursor Agent execute local commands and network requests unless Cursor explicitly denies them. The lower-level `agent daemon start --executor cursor` path still requires explicit `--cursor-force` when debugging direct daemon execution.

This command will:

- registers a local runner
- claims it as the current user's primary Feishu runner
- starts the local Feishu long connection for the user's personal bot when App ID/App Secret are provided
- starts the normal polling loop for sessions/tasks
- uses Codex `--full-auto` by default unless `--codex-exec-mode danger-full-access` is explicitly provided for AnyCap CLI calls or public/internal network access from inside Codex
- uses Claude Code `claude -p --output-format json` when `--agent claude-code`, and persists Claude Code `session_id` for follow-up turns; use `--claude-permission-mode bypassPermissions --claude-allowed-tools Read,Edit,Bash` when AnyCap CLI calls or public/internal network access should run from inside Claude Code
- uses Cursor Agent `cursor-agent -p --output-format json --trust --force` when `--agent cursor`, and persists Cursor Agent `session_id` for follow-up turns; use `--cursor-model <model>` for explicit model selection and tell the human about the broader local command/network permission

Check which local machine is currently connected:

```bash
anycap connect status feishu
```

After startup, ask the human to go back to Feishu and send a normal message to their personal bot. Keep the final user-facing message short, for example: `飞书机器人已经连上当前本地 agent。现在去飞书给你的 personal bot 发普通消息即可。`

### Legacy / Debug Compatibility

Only use the commands below when the human is explicitly debugging the daemon implementation, an older shared-bot deployment, or direct runner wiring.

```bash
anycap agent daemon start --platform feishu --executor codex --workspace /path/to/repo
anycap agent daemon status --platform feishu
anycap agent daemon credentials show-feishu
```

```bash
anycap agent runners serve --name local-mac --platform feishu --executor codex --workspace /path/to/repo
anycap agent runners serve --name local-mac --platform feishu --executor claude-code --workspace /path/to/repo
anycap agent runners serve --name local-mac --platform feishu --executor cursor --workspace /path/to/repo
```

- `connect` is the main user-facing path.
- `agent daemon start` is still available as the lower-level implementation path.
- `agent runners serve` is still useful for debugging and operator workflows.
- `agent runners serve` also accepts `--codex-exec-mode danger-full-access` when debugging local execution outside the default Codex sandbox.
- `agent runners serve` also accepts `--claude-permission-mode`, `--claude-allowed-tools`, and `--claude-bin` when debugging Claude Code execution.
- `agent runners serve` also accepts `--cursor-bin`, `--cursor-model`, and `--cursor-force` when debugging Cursor Agent execution.
- `anycap agent im-bindings ...`, `/bind`, and the server-owned shared Feishu bot are all legacy/debug compatibility paths.
- Do not use these legacy flows as the primary setup path for a personal Feishu bot daemon.

### download

Save a remote file locally. Commonly used after `image generate` when `-o` was not specified.

```bash
anycap download <url>
anycap download <url> -o output.png
```

### update

Update the CLI binary to the latest release. Auto-update runs automatically on each command (unless disabled).

```bash
anycap update           # download and install latest
anycap update --check   # check only, do not install
```

### skill

Manage skill files that teach AI agents how to use AnyCap.

```bash
anycap skill install                    # install to default location
anycap skill install --target ./skills  # install to specific directory
anycap skill update                     # alias for install
anycap skill check --target ./skills/anycap-cli  # check version match
```

### feedback

Submit bug reports and feature requests. Enabled by default; disable with `anycap config set feedback false`.

```bash
anycap feedback --type bug -m "image generate returned 500" --request-id req_abc123
anycap feedback --type feature -m "support batch generation"
anycap feedback --type other -m "schema missing aspect_ratio for model X"
```

| Flag | Required | Description |
|------|----------|-------------|
| `--type` | yes | `bug`, `feature`, or `other` |
| `-m, --message` | yes | Description |
| `--request-id` | no | Request ID from a previous command |
| `--context` | no | Additional context as JSON |

## Advanced

### Environment Variables

| Variable | Description |
|----------|-------------|
| `ANYCAP_API_KEY` | API key for authentication (skips keychain entirely) |
| `ANYCAP_API_ENDPOINT` | Override server endpoint |
| `ANYCAP_CONFIG_DIR` | Custom config/credential directory (default: `~/.anycap/`) |
| `ANYCAP_NO_UPDATE` | Disable auto-update (any value) |
| `ANYCAP_NO_KEYRING` | Disable OS keychain, force file-based credential storage (see below) |

### Disabling the OS Keychain

The CLI stores credentials in the OS keychain by default (macOS Keychain, Windows Credential Manager, Linux Secret Service). On headless Linux (no DISPLAY/WAYLAND_DISPLAY), the CLI auto-detects and falls back to file storage automatically.

Set `ANYCAP_NO_KEYRING=1` only when all of these are true:

- The environment has an OS keychain available (not auto-disabled)
- The keychain is ephemeral (lost on restart, e.g. some Docker setups with forwarded DISPLAY)
- You need credentials to persist across restarts

In all other cases, leave this unset. The keychain is the more secure storage option.
