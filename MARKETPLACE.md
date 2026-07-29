# Marketplace distribution

GitLab is the canonical, reviewable source for AnyCap agent plugin and MCP
server metadata. The public GitHub repository is the distribution and
marketplace-submission surface. Release automation keeps all manifests on the
same version as the published `@anycap/cli` package.

## Distribution surfaces

| Surface | Manifest | Submission artifact |
| --- | --- | --- |
| Cursor Marketplace | `.cursor-plugin/plugin.json` | Public GitHub repository |
| Claude Plugin Directory | `.claude-plugin/plugin.json` | Public GitHub repository |
| Codex Plugins | `.codex-plugin/plugin.json` | Public GitHub repository |
| Gemini CLI Extensions | `gemini-extension.json` | Public GitHub repository |
| Cline MCP Marketplace | `llms-install.md` | Public GitHub repository and logo |
| Official MCP Registry | `server.json` | Published npm package metadata |

The root `mcp.json` is used by Cursor. Claude Code uses `.mcp.json`. Both launch
the same local stdio server with `npx -y @anycap/cli@latest mcp`.

## Before submission

1. Publish the matching `@anycap/cli` version to npm.
2. Run `scripts/validate-marketplace.sh`.
3. Install and test the repository locally in Cursor, Claude Code, Codex, and Gemini CLI.
4. Confirm that `anycap login`, `anycap status`, and `anycap mcp --help` work.
5. Confirm the public privacy policy, terms, support channel, and security contact.
6. Submit the same immutable Git commit or release tag to every platform.

## Listing copy

**Name:** AnyCap

**Short description:** Multimodal generation, media understanding, live web
research, file sharing, and page publishing through one CLI and MCP server.

**Repository:** <https://github.com/anycap-ai/anycap>

**Website:** <https://anycap.ai>

**Documentation:** <https://docs.anycap.ai>

**Support:** <https://github.com/anycap-ai/anycap/issues>
