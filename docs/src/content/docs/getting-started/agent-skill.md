---
title: Install the Agent Skill
description: Teach Claude Code, Cursor, Codex, and other coding agents how to operate AnyCap from natural-language requests.
---

The AnyCap Agent Skill is an instruction layer. It teaches an agent how to install the CLI, authenticate, discover live model schemas, call capabilities, handle local files, and deliver results.

## Install for supported agents

```bash
npx -y skills add anycap-ai/anycap -s '*' -g -y
```

The installer supports Claude Code, Cursor, Codex, Windsurf, OpenCode, and other agents available through [skills.sh](https://skills.sh).

## Install with AnyCap

Install the complete skill collection into the parent skills directory. This preserves the `anycap-cli/references/` files used by the skill:

```bash
anycap skill install --target ~/.agents/skills/
```

Reload your agent after installation so it discovers the new skills.

## Verify and update

```bash
anycap skill check --target ~/.agents/skills/anycap-cli/SKILL.md
npx -y skills check
npx -y skills update
```

## Ask by intent

After installation, describe the outcome instead of memorizing flags:

```text
Generate a 16:9 launch image, let me review it, then return a shareable link.
```

The skill should discover a model, inspect its current schema, generate the file, start a feedback session when requested, and use Drive only when a human needs a link.

## Skill or MCP?

Use the skill when setup and workflow knowledge are the main problem. Use [MCP](/getting-started/mcp/) when your host needs standard typed tool discovery. They share the same CLI runtime and can be used together.
