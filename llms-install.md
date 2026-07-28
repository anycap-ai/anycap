# Install AnyCap for an MCP client

AnyCap exposes its MCP server through the published `@anycap/cli` package. It
does not require a separate server package or background daemon.

## Install

```bash
npm install -g @anycap/cli
```

Alternatively, on macOS, Linux, or Windows with Git Bash:

```bash
curl -fsSL https://anycap.ai/install.sh | sh
```

## Authenticate and verify

```bash
anycap login
anycap status
anycap mcp --help
```

Authentication is not required when the MCP process starts. MCP clients can
also use the `anycap_auth_status`, `anycap_login`, and `anycap_login_poll`
tools to complete authentication during a session.

## MCP configuration

```json
{
  "mcpServers": {
    "anycap": {
      "command": "anycap",
      "args": ["mcp"]
    }
  }
}
```

For local media, MCP clients may advertise workspace roots. Users can also
grant additional, narrow roots with `--allow-root` or
`ANYCAP_MCP_FILE_ROOTS`. Do not grant broad filesystem roots.

## Troubleshooting

If `anycap mcp` is missing, update the CLI:

```bash
anycap update
```

Documentation: <https://docs.anycap.ai/getting-started/mcp/>

Support: <https://github.com/anycap-ai/anycap/issues>
