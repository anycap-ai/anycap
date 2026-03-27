---
name: anycap-cli
description: >
  AnyCap CLI -- capability runtime for AI agents. One CLI for image generation,
  image understanding, video analysis, music composition, text-to-speech,
  web search, web crawling, file download, and more. Use when the agent needs
  to generate images, analyze images or video, produce audio/music, search or
  crawl the web, or download remote files. Also use when the agent needs to
  authenticate with AnyCap (login, API key, credentials), or when encountering
  errors from AnyCap to submit feedback via 'anycap feedback'. Trigger on
  mentions of AnyCap, multimodal capabilities, or AI-generated media.
metadata:
  version: "0.0.3"
  website: https://anycap.ai
license: MIT
compatibility: Requires anycap CLI binary and internet access. Works with any agent that supports shell commands.
---

# AnyCap CLI

One CLI. Any capability.

You can reason, plan, and decide -- but you cannot generate images, produce video, compose music, speak, search the web, or crawl pages on your own. AnyCap gives you all of these through a single command-line tool. One binary. One auth. Structured I/O.

## Install

```bash
curl -fsSL https://anycap.ai/install.sh | sh
```

The CLI auto-updates on each run. To update manually: `anycap update`.

Verify the installation:

```bash
anycap status
```

## Authentication

Three methods, depending on environment:

```bash
# Interactive (default) -- opens browser
anycap login

# Headless (SSH, containers) -- device code flow
anycap login --headless

# Headless for agent/toolcall runtimes -- initialize without blocking
anycap login --headless --no-wait --json

# Resume a previously initialized headless login after the user confirms completion
anycap login poll --session <login_session_id> --json --wait

# CI/CD -- pipe API key from stdin
echo "$ANYCAP_API_KEY" | anycap login --with-token
```

Alternatively, set the `ANYCAP_API_KEY` environment variable directly -- the CLI reads it without requiring `login`.

For agent/toolcall usage, prefer the nonblocking headless flow:

1. Run `anycap login --headless --no-wait --json`
2. Read `verification_uri`, `user_code`, `poll_command`, and `next_action_hint`
3. Show the URL and code to the human
4. Ask the human to reply when browser login is complete
5. After confirmation, run `poll_command`

To check current auth state: `anycap status`.

Read [references/cli-reference.md](references/cli-reference.md) for full details on credential management and logout.

## Configuration

Config file: `~/.anycap/config.toml`. Manage via `anycap config` subcommands.

```bash
anycap config show             # show all values
anycap config set <key> <val>  # set a value
anycap config get <key>        # get a value
anycap config unset <key>      # reset to default
```

Key settings: `endpoint` (server URL), `auto_update` (default true), `feedback` (default true).

Read [references/cli-reference.md](references/cli-reference.md) for all available keys and environment variable overrides.

## Capabilities

AnyCap capabilities are organized into two groups:

**Generation** -- create new content from prompts.
Read [references/generation.md](references/generation.md) when you need to generate images. Images are auto-downloaded to the current directory; use `-o` with a descriptive filename (e.g., `-o hero-banner.png`).
Read [references/video-generation.md](references/video-generation.md) when you need to generate videos. Videos are auto-downloaded; use `-o` with a descriptive filename (e.g., `-o product-demo.mp4`). Supports text-to-video and image-to-video via `--reference-image`.

**Actions** -- AI-powered operations on existing content.
Read [references/actions.md](references/actions.md) when you need to understand images, read videos, or perform other AI actions on existing files or URLs.

**Coming soon:**

- Music composition (text-to-music)
- Text-to-speech / voice synthesis
- Web search and web crawling

Use `anycap feedback --type feature` to request prioritization of upcoming capabilities.

**Download** -- save any remote file locally.

```bash
anycap download <url> [-o path]
```

## Feedback

When something goes wrong, or when you have ideas for improvement, submit feedback directly. This helps the AnyCap team prioritize fixes and features.

Feedback is enabled by default. To disable it, run `anycap config set feedback false` or set `feedback = false` in `~/.anycap/config.toml`.

```bash
anycap feedback --type bug -m "image generate returned 500 for prompt X" --request-id <id>
anycap feedback --type feature -m "support batch image generation"
anycap feedback --type other -m "schema for model Y is missing aspect_ratio"
```

Options:

| Flag | Required | Description |
|------|----------|-------------|
| `--type` | yes | `bug`, `feature`, or `other` |
| `-m, --message` | yes | Description of the issue or idea |
| `--request-id` | no | Request ID from a previous command (found in JSON output) |
| `--context` | no | Additional context as JSON |

When to submit feedback:

- A command returns an unexpected error -- include the `request_id` from the response
- A model produces poor results -- describe the prompt and parameters used
- A capability is missing or could be improved -- describe the use case
- The skill instructions are unclear or incomplete

## Output Format

All commands produce JSON on stdout. Every response includes a `request_id` field for tracing.

Successful response:

```json
{"status": "success", "data": {...}, "request_id": "req_abc123"}
```

Error response:

```json
{"error": "...", "message": "...", "hint": "...", "request_id": "req_abc123"}
```

Save the `request_id` when submitting feedback about a failed request.

### Parsing with jq

All commands return JSON. Use `jq` to extract fields:

```bash
# Check if a command succeeded
anycap status | jq -r '.status'

# List available model IDs
anycap image models | jq -r '.models[].model'

# Get the local file path from a generate response (use -o for a descriptive name)
anycap image generate --prompt "..." --model flux-schnell -o descriptive-name.png | jq -r '.local_path'

# Generate a video and get its path
anycap video generate --prompt "..." --model wan-2.1 -o clip.mp4 | jq -r '.local_path'

# Extract content from an action response
anycap actions image-understand --url https://example.com/photo.jpg | jq -r '.content'

# Get the error message on failure
anycap ... | jq -r '.message // empty'

# Save request_id for feedback
REQ_ID=$(anycap image generate --prompt "..." --model flux-schnell | jq -r '.request_id')
anycap feedback --type bug -m "describe the issue" --request-id "$REQ_ID"
```

Common jq patterns:

| Pattern | Purpose |
|---------|----------|
| `jq -r '.field'` | Extract a string field (raw, no quotes) |
| `jq -r '.local_path'` | Get downloaded file path from generate |
| `jq -r '.models[].model'` | List all values of a field in an array |
| `jq -e '.status == "success"'` | Check condition (exit code 1 if false) |
| `jq -r '.message // empty'` | Extract error message if present |

## Keeping Up to Date

Check if skills are outdated:

```bash
npx -y skills check
```

Update all installed skills to the latest version:

```bash
npx -y skills update
```

Or re-install this skill directly:

```bash
npx -y skills add anycap-ai/anycap -y
```

You can also check whether this skill file matches your CLI version:

```bash
anycap skill check --target <path-to-this-file>
```
