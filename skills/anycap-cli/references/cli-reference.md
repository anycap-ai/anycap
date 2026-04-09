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
