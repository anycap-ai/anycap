export type Block =
  | { type: "text"; content: string }
  | { type: "code"; content: string }
  | { type: "h3"; content: string }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "links"; items: { label: string; url: string; note?: string }[] };

export interface Section {
  title: string;
  blocks: Block[];
}

export interface LandingContent {
  title: string;
  tagline: string;
  description: string;
  sections: Section[];
}

export const content: LandingContent = {
  title: "AnyCap",
  tagline: "One CLI. Any capability.",
  description:
    "You can reason, plan, and decide — but you cannot generate images, produce video, compose music, speak, search the web, or crawl pages on your own. AnyCap gives you all of these through a single command-line tool. One binary. One auth. Structured I/O.",
  sections: [
    {
      title: "Install Skills",
      blocks: [
        {
          type: "text",
          content:
            "Skills are documentation files that teach AI agents how to use AnyCap.",
        },
        { type: "h3", content: "Option A: skills.sh (recommended)" },
        {
          type: "text",
          content:
            "Works with Claude Code, Cursor, Windsurf, OpenCode, and 40+ agents (https://skills.sh):",
        },
        { type: "code", content: "npx skills add anycap-ai/anycap" },
        { type: "h3", content: "Option B: AnyCap CLI" },
        {
          type: "code",
          content: [
            "anycap skill install --target ~/.claude/skills/anycap-cli/",
            "",
            "# Check if skills are up to date",
            "anycap skill check --target ~/.claude/skills/anycap-cli/SKILL.md",
          ].join("\n"),
        },
        { type: "h3", content: "Option C: Manual" },
        {
          type: "code",
          content:
            "curl -fsSL https://raw.githubusercontent.com/anycap-ai/anycap/main/skills/anycap-cli/SKILL.md \\\n  --create-dirs -o ~/.claude/skills/anycap-cli/SKILL.md",
        },
      ],
    },
    {
      title: "Install CLI",
      blocks: [
        {
          type: "code",
          content: [
            "# macOS / Linux / Windows (Git Bash)",
            "curl -fsSL https://anycap.ai/install.sh | sh",
            "",
            "# npm (all platforms)",
            "npm install -g @anycap/cli",
          ].join("\n"),
        },
        {
          type: "text",
          content:
            "Binaries also available on GitHub Releases (https://github.com/anycap-ai/anycap/releases). Verify with `anycap status`.",
        },
      ],
    },
    {
      title: "Quick Start",
      blocks: [
        {
          type: "code",
          content: [
            "# Login",
            "anycap login",
            "",
            "# Image understanding",
            "anycap image understand --url https://example.com/photo.jpg",
            "",
            "# Video analysis",
            "anycap video read --url https://example.com/clip.mp4",
          ].join("\n"),
        },
      ],
    },
    {
      title: "Capabilities",
      blocks: [
        {
          type: "table",
          headers: ["Capability", "Command", "Description"],
          rows: [
            [
              "Image Understanding",
              "`anycap image understand`",
              "Analyze images using vision models",
            ],
            ["Video Analysis", "`anycap video read`", "Analyze videos"],
          ],
        },
        { type: "text", content: "More capabilities coming soon." },
      ],
    },
    {
      title: "Keeping Skills Up to Date",
      blocks: [
        {
          type: "text",
          content:
            "The skill file contains a `metadata.version` field that matches the CLI version. Use `anycap skill check` to verify:",
        },
        {
          type: "code",
          content:
            "anycap skill check --target ~/.claude/skills/anycap-cli/SKILL.md",
        },
        { type: "text", content: "If outdated, re-install:" },
        { type: "code", content: "npx skills add anycap-ai/anycap" },
      ],
    },
    {
      title: "Links",
      blocks: [
        {
          type: "links",
          items: [
            {
              label: "Skill File",
              url: "https://github.com/anycap-ai/anycap/blob/main/skills/anycap-cli/SKILL.md",
              note: "Full skill documentation for agents",
            },
            {
              label: "skills.sh",
              url: "https://skills.sh/anycap-ai/anycap",
              note: "Skills directory listing",
            },
            {
              label: "GitHub Releases",
              url: "https://github.com/anycap-ai/anycap/releases",
              note: "CLI binaries",
            },
            {
              label: "GitHub",
              url: "https://github.com/anycap-ai/anycap",
            },
          ],
        },
      ],
    },
  ],
};

export function toMarkdown(c: LandingContent): string {
  const lines: string[] = [];

  lines.push(`# ${c.title}`, "", c.tagline, "", c.description, "", "---", "");

  for (const section of c.sections) {
    lines.push(`## ${section.title}`, "");

    for (const block of section.blocks) {
      switch (block.type) {
        case "text":
          lines.push(block.content, "");
          break;
        case "h3":
          lines.push(`### ${block.content}`, "");
          break;
        case "code":
          lines.push("```bash", block.content, "```", "");
          break;
        case "table": {
          lines.push(
            `| ${block.headers.join(" | ")} |`,
            `| ${block.headers.map(() => "---").join(" | ")} |`
          );
          for (const row of block.rows) {
            lines.push(`| ${row.join(" | ")} |`);
          }
          lines.push("");
          break;
        }
        case "links":
          for (const item of block.items) {
            const note = item.note ? ` — ${item.note}` : "";
            lines.push(`- [${item.label}](${item.url})${note}`);
          }
          lines.push("");
          break;
      }
    }
  }

  lines.push(
    "Human-readable version: https://anycap.ai/for-human",
    "",
    "MIT License",
    ""
  );

  return lines.join("\n");
}
