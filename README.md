# AnyCap - Agent Skills Plugin

A [Claude Code plugin](https://github.com/anthropics/claude-plugins-official) providing skills for accessing AI capabilities via the AnyCap CLI.

## Capabilities

- Image generation
- Video generation
- Music generation
- Text-to-Speech (TTS)
- Automatic Speech Recognition (ASR)
- Web search
- Web crawling

## Installation

### Claude Code

Register this repository as a plugin:

```bash
/plugin install https://github.com/anycap-ai/anycap
```

After installation, simply mention the capability you need (e.g., "generate an image of...") and Claude will activate the appropriate skill.

### Manual

Clone this repository into your Claude Code skills directory:

```bash
git clone https://github.com/anycap-ai/anycap.git ~/.claude/plugins/anycap
```

## Plugin Structure

```
anycap/
├── .claude-plugin/
│   └── plugin.json        # Plugin manifest
└── skills/
    └── anycap-cli/
        ├── SKILL.md        # Skill instructions
        └── references/     # Detailed capability docs
```

## Development

### Prerequisites

- [pre-commit](https://pre-commit.com/) for local linting

### Setup

```bash
pip install pre-commit
pre-commit install
```

### Linting

Markdown files are automatically linted on commit via pre-commit hooks and in CI via GitHub Actions.

```bash
pre-commit run --all-files
```

## License

Apache-2.0
