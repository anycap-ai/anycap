---
title: Configure the CLI
description: Manage the AnyCap endpoint, update behavior, feedback, config directory, and environment overrides.
---

## Configuration file

AnyCap stores configuration under `~/.anycap/config.toml` by default.

```bash
anycap config show
anycap config get <key>
anycap config set <key> <value>
anycap config unset <key>
```

Common settings:

| Key | Purpose | Default |
| --- | --- | --- |
| `endpoint` | AnyCap server URL | AnyCap production API |
| `auto_update` | Check CLI updates on launch | `true` |
| `feedback` | Enable direct feedback commands | `true` |

## Custom config directory

Use `ANYCAP_CONFIG_DIR` when the home directory is read-only, ephemeral, or intentionally isolated:

```bash
export ANYCAP_CONFIG_DIR=./.anycap
anycap status
```

Relative paths are resolved to absolute paths. The directory contains CLI state, credentials or keyring fallback data, and update markers. Do not commit it.

## Endpoint override

Set the endpoint for one command:

```bash
anycap --endpoint https://example.internal status
```

Or persist it:

```bash
anycap config set endpoint https://example.internal
```

## Machine-readable output

Commands write one final JSON document to stdout. Use normal shell redirection or `jq`; do not wrap MCP stdio with scripts that print banners to stdout.
