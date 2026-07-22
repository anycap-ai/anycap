# AnyCap

[![npm](https://img.shields.io/npm/v/@anycap/cli?color=cb3837&logo=npm)](https://www.npmjs.com/package/@anycap/cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/anycap-ai/anycap?style=social)](https://github.com/anycap-ai/anycap)
[![Skills directory](https://img.shields.io/badge/skills.sh-anycap-6f42c1)](https://skills.sh/anycap-ai/anycap)

> **The capability runtime for AI agents.**
>
> Give coding agents a single CLI, Agent Skill, and local MCP server for creating media,
> understanding files, researching the live web, and delivering results people can use.

![AnyCap — the capability runtime for AI agents](assets/hero.png)

## Start here

Give this to Claude Code, Codex, Cursor, or another agent that can run shell commands:

```text
Read https://raw.githubusercontent.com/anycap-ai/anycap/main/llms.txt and follow its
instructions to install and configure AnyCap.
```

If your agent cannot reach that URL, use the manual setup below.

```bash
# Install the CLI (macOS, Linux, or Windows through Git Bash)
curl -fsSL https://anycap.ai/install.sh | sh

# Install the AnyCap Agent Skill
npx -y skills add anycap-ai/anycap -s '*' -g -y

# Authenticate once, then confirm the runtime is ready
anycap login
anycap status
```

The binary installer is the recommended path. If your environment already uses Node.js,
you can instead run `npm install -g @anycap/cli`. Platform binaries are also available
from [GitHub Releases](https://github.com/anycap-ai/anycap/releases).

## Choose an integration

| Integration | Use it when | Entry point |
| --- | --- | --- |
| **Agent Skill** | You want an agent to choose the right workflow from a natural-language request. | [`skills/anycap-cli/SKILL.md`](skills/anycap-cli/SKILL.md) |
| **Local stdio MCP** | Your agent host needs typed tool discovery. | `anycap mcp` |
| **CLI** | You want shell automation or direct control. | `anycap <command>` |

All three use the same installed runtime and authentication state. The Skill and MCP
server can be used together.

### Connect through MCP

First confirm that the installed CLI exposes the server:

```bash
anycap mcp --help
```

For Codex, add the local server definition:

```bash
codex mcp add anycap -- anycap mcp
```

For a generic stdio MCP client, configure `anycap mcp`. Add a narrowly scoped
`--allow-root` only when the server needs to access local media:

```json
{
  "mcpServers": {
    "anycap": {
      "type": "stdio",
      "command": "anycap",
      "args": ["mcp", "--allow-root", "/absolute/path/to/media"]
    }
  }
}
```

Do not commit personal absolute paths into shared project configuration. Read the
[MCP setup guide](https://docs.anycap.ai/getting-started/mcp/) and
[security guide](https://docs.anycap.ai/reference/security/) before granting local
file access.

## What agents can do

| Area | Examples |
| --- | --- |
| **Create** | Generate and edit images, generate video, compose music, and create audio scenes. |
| **Understand** | Read screenshots, compare images, summarize video, and transcribe or analyze audio. |
| **Research** | Search the live web and crawl pages into Markdown. |
| **Collaborate** | Gather visual annotations and work with shared drawing surfaces. |
| **Deliver** | Upload and share files, publish static sites, and create project snapshots. |

For a first end-to-end workflow, see [generate and share an image](https://docs.anycap.ai/guides/generate-and-share-image/).
Other task-oriented guides cover [image-to-video](https://docs.anycap.ai/guides/image-to-video/),
[human feedback](https://docs.anycap.ai/guides/human-feedback/),
[web research](https://docs.anycap.ai/guides/web-research/), and
[static-site publishing](https://docs.anycap.ai/guides/publish-site/).

## Discover live capabilities

Model availability and input schemas change. Query the installed CLI instead of copying
model IDs or parameters from an old example:

```bash
# List models available to your account
anycap image models
anycap video models
anycap music models

# Inspect the current modes and schema for a selected model
anycap image models <model-id>
anycap image models <model-id> schema --mode <mode>
```

Run `anycap --help` at any level to inspect commands and options:

```bash
anycap --help
anycap image --help
anycap image generate --help
```

## Documentation and support

- [Documentation](https://docs.anycap.ai/) — quickstart, capability guides, and reference material.
- [CLI reference](https://docs.anycap.ai/reference/cli/) — command groups, output conventions, and discovery.
- [MCP tool reference](https://docs.anycap.ai/reference/mcp-tools/) — current tools and read/write boundaries.
- [Authentication and configuration](https://docs.anycap.ai/getting-started/authentication/) — interactive, headless, and API-key workflows.
- [Troubleshooting](https://docs.anycap.ai/getting-started/troubleshooting/) — installation and runtime diagnostics.
- [`llms.txt`](llms.txt) — concise installation and usage instructions for agents.
- [Skills directory](https://skills.sh/anycap-ai/anycap) — install the Agent Skills collection.

## Updating

The CLI checks for updates during normal use. Update it explicitly when needed:

```bash
anycap update
npx -y skills update
anycap status
```

## License

[MIT](LICENSE)
