// Machine-readable install guide for agents.
// Keep this short, deterministic, and focused on the install path.
const installContent = `# AnyCap Install

Use this file for installation tasks. Do not fetch the homepage for install automation.

## Goal

Install the AnyCap CLI, install the skill file, authenticate, and verify the setup.

## 1. Install CLI

\`\`\`bash
# Preferred: macOS / Linux / Windows (Git Bash)
curl -fsSL https://anycap.ai/install.sh | sh

# Alternative: npm
npm install -g @anycap/cli
\`\`\`

Prefer the shell installer when available. It avoids a Node.js dependency and matches the documented binary install path.

## 2. Install Skill

\`\`\`bash
# Generic
npx -y skills add anycap-ai/anycap -y

# Claude Code
npx -y skills add anycap-ai/anycap -a claude-code -y

# Codex
npx -y skills add anycap-ai/anycap -a codex -y

# Cursor
npx -y skills add anycap-ai/anycap -a cursor -y
\`\`\`

Manual skill download:

\`\`\`bash
curl -fsSL https://raw.githubusercontent.com/anycap-ai/anycap/main/skills/anycap-cli/SKILL.md \\
  --create-dirs -o ~/.agents/skills/anycap-cli/SKILL.md
\`\`\`

## 3. Authenticate

\`\`\`bash
# Interactive
anycap login

# SSH / headless
anycap login --headless

# CI / token-based
echo "$ANYCAP_API_KEY" | anycap login --with-token
\`\`\`

## 4. Verify

\`\`\`bash
anycap status
npx -y skills check
\`\`\`

## If you need more context

- Product + capability overview: https://anycap.ai/llms.txt
- Human install guide: https://anycap.ai/guides/install-anycap
- GitHub releases: https://github.com/anycap-ai/anycap/releases

Last updated: 2026-04-08
`;

export default installContent;
