# Install AnyCap for an MCP client

AnyCap exposes its MCP server through the published `@anycap/cli` package. MCP
clients can launch it with `npx`, without a separate server package, global CLI
installation, or background daemon.

## Recommended MCP configuration

```json
{
  "mcpServers": {
    "anycap": {
      "command": "npx",
      "args": ["-y", "@anycap/cli@latest", "mcp"]
    }
  }
}
```

The first launch downloads the latest published AnyCap CLI through npm.
Authentication is not required when the MCP process starts. MCP clients can
use the `anycap_auth_status`, `anycap_login`, and `anycap_login_poll` tools to
complete authentication during a session.

## Optional global installation

For direct CLI use outside an MCP client:

```bash
npm install -g @anycap/cli
anycap login
anycap status
anycap mcp --help
```

Alternatively, on macOS, Linux, or Windows with Git Bash:

```bash
curl -fsSL https://anycap.ai/install.sh | sh
```

For local media, MCP clients may advertise workspace roots. Users can also
grant additional, narrow roots with `--allow-root` or
`ANYCAP_MCP_FILE_ROOTS`. Do not grant broad filesystem roots.

## Troubleshooting

If a global installation does not include `anycap mcp`, update the CLI:

```bash
anycap update
```

Documentation: <https://docs.anycap.ai/getting-started/mcp/>

Support: <https://github.com/anycap-ai/anycap/issues>
