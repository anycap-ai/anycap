# Marketplace distribution

This repository is the canonical source for the AnyCap agent plugin and MCP
server metadata. The manifests intentionally share version `0.5.0`, matching
the published `@anycap/cli` package.

## Distribution surfaces

| Surface | Manifest | Submission artifact |
| --- | --- | --- |
| Cursor Marketplace | `.cursor-plugin/plugin.json` | Public GitHub repository |
| Claude Plugin Directory | `.claude-plugin/plugin.json` | Public GitHub repository |
| Gemini CLI Extensions | `gemini-extension.json` | Public GitHub repository |
| Cline MCP Marketplace | `llms-install.md` | Public GitHub repository and logo |
| Official MCP Registry | `server.json` | Published npm package metadata |

The root `mcp.json` is used by Cursor. Claude Code uses `.mcp.json`. Both use
`npx -y @anycap/cli@latest mcp` to start the same local stdio server without
requiring a global CLI installation.

## Before submission

1. Publish the matching `@anycap/cli` version to npm.
2. Run `scripts/validate-marketplace.sh`.
3. Install and test the repository locally in Cursor, Claude Code, and Gemini
   CLI.
4. Confirm that `anycap login`, `anycap status`, and `anycap mcp --help` work.
5. Confirm the public privacy policy, terms, support channel, and security
   contact used in each submission form.
6. Submit the same immutable Git commit or release tag to every platform.

## Listing copy

**Name:** AnyCap

**Short description:**

> Multimodal generation, media understanding, live web research, file sharing,
> and page publishing through one CLI and MCP server.

**Repository:** <https://github.com/anycap-ai/anycap>

**Website:** <https://anycap.ai>

**Documentation:** <https://docs.anycap.ai>

**Support:** <https://github.com/anycap-ai/anycap/issues>
