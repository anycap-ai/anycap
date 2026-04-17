# Connect Command Design

## Goal

Expose a direct, non-technical command for connecting chat apps such as Feishu to a local coding agent.

## Problem

`anycap agent daemon ...` describes the implementation: a local daemon process, a platform flag, and an executor flag. That is useful for debugging but not for normal users. The user intent is simpler: connect Feishu to Codex or Claude Code for this workspace.

## User-Facing Command

Use `connect` as the primary entry point:

```bash
anycap connect feishu --agent codex --workspace /path/to/repo
anycap connect status feishu
anycap connect stop feishu
anycap connect credentials set feishu --app-id <FEISHU_APP_ID> --app-secret <FEISHU_APP_SECRET>
anycap connect credentials show feishu
```

`--agent` maps to the existing executor names:

- `codex` -> daemon executor `codex`
- `claude`, `claude_code`, `claude-code` -> daemon executor `claude_code`
- `stub` remains available for tests and debugging

## Compatibility

Keep `anycap agent daemon ...` as the lower-level implementation and compatibility command. The `connect` command should delegate to the existing daemon start/status/stop/credential logic instead of introducing a second runtime path.

## Documentation

Skills should teach agents to use `anycap connect ...` by default. `agent daemon`, `agent runners serve`, `/bind`, and direct IM binding commands should only appear in debug or legacy sections.
