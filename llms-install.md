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
Authentication is not required when the MCP process starts. MCP clients can use
`anycap_auth_status`, `anycap_login`, and `anycap_login_poll` to authenticate.

For local media, MCP clients may advertise workspace roots. Users can also
grant additional, narrow roots with `--allow-root` or
`ANYCAP_MCP_FILE_ROOTS`. Do not grant broad filesystem roots.

Documentation: <https://docs.anycap.ai/getting-started/mcp/>

Support: <https://github.com/anycap-ai/anycap/issues>
