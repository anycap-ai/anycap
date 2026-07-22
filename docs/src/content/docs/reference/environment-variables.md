---
title: Environment Variables
description: Configure AnyCap authentication, endpoint selection, updates, config isolation, and MCP local roots through environment variables.
---

| Variable | Purpose |
| --- | --- |
| `ANYCAP_API_KEY` | Supply an API key directly; takes precedence over persistent credentials |
| `ANYCAP_API_ENDPOINT` | Override the server endpoint below the `--endpoint` flag |
| `ANYCAP_NO_UPDATE` | Disable automatic update checks when set |
| `ANYCAP_CONFIG_DIR` | Redirect config, credentials, and CLI state from `~/.anycap` |
| `ANYCAP_MCP_FILE_ROOTS` | Add a platform path-list of roots available to local MCP media tools |
| `ANYCAP_INSTALL_DIR` | Select a destination for the binary install script |

## CI example

```bash
export ANYCAP_API_KEY="$CI_ANYCAP_API_KEY"
export ANYCAP_NO_UPDATE=1
anycap status
```

Store the API key in the CI provider's secret manager. Do not commit it or print it to logs.

## Isolated config example

```bash
export ANYCAP_CONFIG_DIR="$PWD/.anycap-ci"
anycap status
```

Add that directory to `.gitignore` when it lives inside a working tree.

## MCP root list

Use the platform path-list separator: `:` on Unix-like systems and `;` on Windows. Command-line `--allow-root`, this variable, and client-advertised roots form one effective set.
