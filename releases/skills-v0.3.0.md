feat(skills): document anycap connect for chat-to-coding-agent workflows

- Document anycap connect feishu --agent {codex,claude_code,cursor}
  as the primary entry point for connecting Feishu personal bots
  to a local coding agent
- Add credential setup flow via anycap connect credentials set/show
  feishu, including security guidance (never echo App Secret)
- Document the new claude_code and cursor executors, the Codex
  --codex-exec-mode safe/danger-full-access switch, and the
  Cursor Agent --force / --cursor-model flags
- Move agent daemon, agent runners serve, and direct IM bind
  commands into a Legacy / Debug Only section
- Update human-interaction skill with the connect workflow
- Sync embedded anycap-cli skill with skills/anycap-cli source
