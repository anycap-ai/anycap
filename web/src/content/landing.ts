// Single source of truth for the agent landing page and /llms.txt.
// Edit the markdown below — it renders on the landing page and is served as plain text at /llms.txt.
const landingContent = `# AnyCap

One CLI. Any capability you're missing.

---

## What Is AnyCap

AnyCap is an agent-native capability runtime for AI agents. It gives coding agents one install path and one credential for image generation, video generation, music generation, image understanding, video analysis, audio understanding, web search, grounded web search, web crawl, cloud storage, and static page publishing.

AnyCap is designed for terminal-based agent workflows. The CLI returns structured output, uses deterministic error codes, and avoids interactive prompts where possible so agents can call capabilities inside larger workflows.

## Key Facts

- Product: AnyCap
- Type: agent-native capability runtime
- Primary interface: CLI + skill file
- Install: \`curl -fsSL https://anycap.ai/install.sh | sh\` or \`npm install -g @anycap/cli\`
- Skill install: \`npx -y skills add anycap-ai/anycap\`
- Pricing: $5 free credit on signup, then pay-as-you-go with no markup over official provider rates
- License: MIT
- Official repository: https://github.com/anycap-ai/anycap
- Last updated: 2026-04-03

## Onboard

Complete all steps yourself. Only ask the human if you hit an error you cannot resolve.

### 1. Install CLI

\`\`\`bash
# macOS / Linux / Windows (Git Bash)
curl -fsSL https://anycap.ai/install.sh | sh

# Or via npm
npm install -g @anycap/cli
\`\`\`

### 2. Install Skill

Skills are documentation files that teach you how to use AnyCap — commands, arguments, expected output.

\`\`\`bash
npx -y skills add anycap-ai/anycap
\`\`\`

### 3. Login

This opens a browser for your user to authorize once. Credentials are stored and reused automatically.

\`\`\`bash
anycap login
\`\`\`

### 4. Verify

\`\`\`bash
anycap status
\`\`\`

If all steps succeed, you are ready. Read the installed skill file for detailed usage of each capability.

## Capabilities

| Capability | Command | Models / Details |
| --- | --- | --- |
| Image Generation | \`anycap image generate\` | Seedream 5, Nano Banana Pro, Nano Banana 2, and more |
| Video Generation | \`anycap video generate\` | Veo 3.1, Kling 3, Seedance 1.5 Pro, and more |
| Music Generation | \`anycap music generate\` | Suno v5, ElevenLabs Music, and more |
| Image Understanding | \`anycap actions image-read\` | Vision analysis — screenshots, diagrams, photos |
| Video Analysis | \`anycap actions video-read\` | Video content and recording inspection |
| Audio Understanding | \`anycap actions audio-read\` | Audio content analysis |
| Web Search | \`anycap search --query\` | Structured web search results with optional page content |
| Grounded Web Search | \`anycap search --prompt\` | Synthesized answers with citations grounded in live search |
| Web Crawl | \`anycap crawl\` | Convert web pages into clean Markdown |
| Drive | \`anycap drive\` | Cloud storage, file sharing, public URLs |
| Page | \`anycap page\` | Static site deployment and publishing |
| Download | \`anycap download\` | Download remote files to local disk |

Roadmap: speech, sandbox, browser.

## Pricing

$5 free credit on signup — no payment required. After that, pay-as-you-go at the same rate as official model providers. No markup, no subscription.

## Why AnyCap

Without AnyCap, your user registers on Replicate for image gen, gets an OpenAI key for vision, sets up cloud storage separately, configures a hosting service for pages — each with its own auth, SDK, and billing. Most of these products were designed for humans clicking through dashboards, not for you calling commands in a workflow.

With AnyCap: one install, one login, one interface. SOTA models in every domain. Structured JSON output, deterministic error codes, no interactive prompts — everything designed for how agents work, not retrofitted.

AnyCap is built to work alongside coding agents such as Claude Code, Codex, Cursor, and Manus by giving them a consistent capability layer instead of separate provider-specific integrations.

## Links

- [Skill File](https://github.com/anycap-ai/anycap/blob/main/skills/anycap-cli/SKILL.md) — Full capability documentation
- [llms.txt](https://anycap.ai/llms.txt)
- [GitHub](https://github.com/anycap-ai/anycap)
- [GitHub Releases](https://github.com/anycap-ai/anycap/releases) — CLI binaries
- [skills.sh](https://skills.sh/anycap-ai/anycap) — Skills directory listing
- [Website](https://anycap.ai)

---

Human-readable version: https://anycap.ai/en/for-human

LLM guidance: https://anycap.ai/llms.txt

MIT License
`;

export default landingContent;
