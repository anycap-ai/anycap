---
title: CLI Reference
description: Review AnyCap command groups, global flags, discovery conventions, and utility commands.
---

## Syntax

```bash
anycap [global-flags] <command> [subcommand] [flags]
```

## Global flags

| Flag | Description |
| --- | --- |
| `--endpoint <url>` | Override the AnyCap server endpoint |
| `--verbose` | Write debug diagnostics to stderr |
| `-v`, `--version` | Print the CLI version |
| `-h`, `--help` | Show command help |

Endpoint precedence is `--endpoint`, `ANYCAP_API_ENDPOINT`, config file, then the built-in production default.

## Command groups

| Group | Commands |
| --- | --- |
| Generation | `image`, `video`, `music`, `audio` |
| Understanding | `actions` |
| Web | `search`, `crawl`, `download` |
| Collaboration | `annotate`, `draw` |
| Delivery | `drive`, `page`, `snapshot` |
| Agent connectivity | `mcp`, `connect`, `agent` |
| Runtime | `login`, `logout`, `credentials`, `status`, `config`, `update` |
| Maintenance | `skill`, `feedback`, `completion`, `help` |

Run help at any level:

```bash
anycap --help
anycap image --help
anycap image generate --help
```

## Model discovery

Generation groups use the same discovery shape:

```bash
anycap <capability> models
anycap <capability> models <model-id>
anycap <capability> models <model-id> schema --mode <mode>
```

Treat the live catalog as authoritative. Static model lists become stale as availability and schemas change.

## Output streams

Normal commands reserve stdout for one final JSON document. Invocation-started events and verbose diagnostics go to stderr. The `mcp` command reserves stdout exclusively for MCP protocol messages.

## Shell completion

```bash
anycap completion --help
```

Follow the generated shell-specific instructions rather than sourcing output into an unsupported shell.
