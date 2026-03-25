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
  version: "dev"
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

```bash
anycap login
```

Follow the browser prompt to complete authentication. Credentials are stored in `~/.anycap/credentials` (file-based fallback) or the system keychain.

To check current auth state: `anycap status`.

## Capabilities

AnyCap capabilities are organized into two groups:

**Generation** -- create new content from prompts.
Read [references/generation.md](references/generation.md) when you need to generate images. This is a multi-step workflow: discover models, check schema, generate, then download.

**Actions** -- AI-powered operations on existing content.
Read [references/actions.md](references/actions.md) when you need to understand images, read videos, or perform other AI actions on existing files or URLs.

**Coming soon:**

- Music composition (text-to-music)
- Text-to-speech / voice synthesis
- Web search and web crawling
- Video generation

Use `anycap feedback --type feature` to request prioritization of upcoming capabilities.

**Download** -- save any remote file locally.

```bash
anycap download <url> [-o path]
```

## Feedback

When something goes wrong, or when you have ideas for improvement, submit feedback directly. This helps the AnyCap team prioritize fixes and features.

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
{"status": "error", "error": {"code": "...", "message": "..."}, "request_id": "req_abc123"}
```

Save the `request_id` when submitting feedback about a failed request.

## Keeping Up to Date

Update the skill to the latest version:

```bash
npx skills add anycap-ai/anycap
```

Or check manually whether this skill file matches your CLI version:

```bash
anycap skill check --target <path-to-this-file>
```
