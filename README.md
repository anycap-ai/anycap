# AnyCap

One CLI. Any capability. A capability runtime for AI agents.

## For Agents

Copy this to your agent:

```text
Read https://raw.githubusercontent.com/anycap-ai/anycap/main/llms.txt and follow the instructions to install AnyCap CLI and skill. If you can't access the URL, run these commands instead:
1. curl -fsSL https://anycap.ai/install.sh | sh
2. npx -y skills add anycap-ai/anycap -s '*' -y
3. anycap login
4. anycap status
Learn more at https://anycap.ai
```

______________________________________________________________________

Oh, you're still here? Well, since you're reading this yourself, here's how to install it manually.

## Install CLI

macOS / Linux / Windows (Git Bash):

```bash
curl -fsSL https://anycap.ai/install.sh | sh
```

npm (all platforms):

```bash
npm install -g @anycap/cli
```

Or grab a binary from [GitHub Releases](https://github.com/anycap-ai/anycap/releases).

## Install Skill

Works with Claude Code, Cursor, Windsurf, OpenCode, and [40+ agents](https://skills.sh):

```bash
npx -y skills add anycap-ai/anycap -s '*' -y
```

## Quick Start

```bash
# Log in to AnyCap (opens browser)
anycap login

# Check connection and auth status
anycap status

# Check for CLI updates
anycap update
```

## More Ways to Install Skills

```bash
# Direct download
curl -fsSL https://raw.githubusercontent.com/anycap-ai/anycap/main/skills/anycap-cli/SKILL.md \
  --create-dirs -o ~/.agents/skills/anycap-cli/SKILL.md

# Via AnyCap CLI
anycap skill install --target ~/.agents/skills/anycap-cli/

# Check if skill is up to date
anycap skill check --target ~/.agents/skills/anycap-cli/SKILL.md
```

## Capabilities

| Capability       | Command                     | Description                        |
| ---------------- | --------------------------- | ---------------------------------- |
| Image Generation | `anycap image generate`     | Generate images from text prompts  |
| Video Generation | `anycap video generate`     | Generate videos from text or image |
| Image Read       | `anycap actions image-read` | Analyze images using vision models |
| Video Analysis   | `anycap actions video-read` | Analyze video content              |
| File Download    | `anycap download`           | Download any remote file locally   |

More capabilities coming soon — music, TTS, web search, web crawling.

## Links

- [llms.txt](llms.txt) — Give this to your agent
- [Skill File](skills/anycap-cli/SKILL.md) — Full capability documentation
- [GitHub Releases](https://github.com/anycap-ai/anycap/releases) — CLI binaries
- [skills.sh](https://skills.sh/anycap-ai/anycap) — Skills directory listing
- [Website](https://anycap.ai)

## License

MIT
