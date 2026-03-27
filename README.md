# AnyCap

AnyCap is a CLI-native capability harness for AI agents. It provides access to multimodal AI capabilities -- image understanding, video analysis, and more -- through a single CLI.

## Install Skills

Skills are documentation files that teach AI agents how to use AnyCap. Choose one of the methods below to install.

### Option A: skills.sh (recommended)

Works with Claude Code, Cursor, Windsurf, OpenCode, and [40+ agents](https://skills.sh):

```bash
npx skills add anycap-ai/anycap
```

### Option B: AnyCap CLI

If you already have the `anycap` CLI installed:

```bash
anycap skill install --target ~/.claude/skills/anycap-cli/
```

To check if your skills are up to date:

```bash
anycap skill check --target ~/.claude/skills/anycap-cli/SKILL.md
```

### Option C: Manual

```bash
curl -fsSL https://raw.githubusercontent.com/anycap-ai/anycap/main/skills/anycap-cli/SKILL.md \
  --create-dirs -o ~/.claude/skills/anycap-cli/SKILL.md
```

## Install CLI

### macOS / Linux

```bash
curl -fsSL https://anycap.ai/install.sh | sh
```

### Windows (Git Bash)

```bash
curl -fsSL https://anycap.ai/install.sh | sh
```

### npm (all platforms)

```bash
npm install -g @anycap/cli
```

### Manual download

Binaries for all platforms are available on [GitHub Releases](https://github.com/anycap-ai/anycap/releases).

### Verify

```bash
anycap status
```

## Quick Start

```bash
# Login
anycap login

# Image understanding
anycap image understand --url https://example.com/photo.jpg

# Video analysis
anycap video read --url https://example.com/clip.mp4
```

## Capabilities

| Capability | Command | Description |
|------------|---------|-------------|
| Image Understanding | `anycap image understand` | Analyze images using vision models |
| Video Analysis | `anycap video read` | Analyze videos |

More capabilities are coming soon.

## Keeping Skills Up to Date

The skill file contains a `metadata.version` field that matches the CLI version. Use `anycap skill check` to verify compatibility:

```bash
anycap skill check --target ~/.claude/skills/anycap-cli/SKILL.md
```

If the skill is outdated, re-install:

```bash
npx skills add anycap-ai/anycap
```

## Links

- [Skill File](skills/anycap-cli/SKILL.md) -- Full skill documentation for agents
- [skills.sh](https://skills.sh/anycap-ai/anycap) -- Skills directory listing
- [GitHub Releases](https://github.com/anycap-ai/anycap/releases) -- CLI binaries
- [Website](https://anycap.ai)

## License

MIT
