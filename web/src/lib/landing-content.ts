import { buildLocalizedPath, defaultLocale, siteConfig, type SiteLocale } from "@/lib/site";

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

const localizedHomePath = buildLocalizedPath(defaultLocale, "/");
const localizedForHumanPath = buildLocalizedPath(defaultLocale, "/for-human");
const localizedCliPath = buildLocalizedPath(defaultLocale, "/cli");
const localizedCapabilitiesPath = buildLocalizedPath(defaultLocale, "/capabilities");
const localizedForClaudeCodePath = buildLocalizedPath(defaultLocale, "/for/claude-code");
const localizedInstallGuidePath = buildLocalizedPath(defaultLocale, "/guides/install-anycap");

export const landingContents: Record<SiteLocale, LandingContent> = {
  en: {
    title: "AnyCap Agent CLI",
    tagline: "Every capability your agent needs. One command.",
    description:
      "Agents can think, but they can't act — no images, no video, no music, no voice. AnyCap gives them every capability through a single CLI and a single credential. Built for agents, not adapted from human tools.",
    sections: [
      {
        title: "What Is AnyCap?",
        blocks: [
          {
            type: "text",
            content:
              "AnyCap is an agent-native capability runtime that lets AI agents install and use capabilities such as image read, video analysis, and other multimodal or web actions through one CLI and one interface.",
          },
          {
            type: "text",
            content:
              "If you are looking for an agent CLI, AnyCap is the installable entry point. If you are defining the category, AnyCap is a capability runtime for AI agents built from day one for agent workflows rather than adapted from human-first software.",
          },
        ],
      },
      {
        title: "Install For Claude Code, Cursor, And 40+ Agents",
        blocks: [
          {
            type: "text",
            content:
              "Skills are documentation files that teach AI agents how to use AnyCap as an installable capability layer.",
          },
          { type: "h3", content: "Option A: skills.sh (recommended)" },
          {
            type: "text",
            content:
              "Works with Claude Code, Cursor, Windsurf, OpenCode, and 40+ agents through skills.sh:",
          },
          {
            type: "code",
            content: [
              "# General install",
              "npx -y skills add anycap-ai/anycap -y",
              "",
              "# Example: Claude Code",
              "npx -y skills add anycap-ai/anycap -a claude-code -y",
            ].join("\n"),
          },
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
        title: "Install The AnyCap Agent CLI",
        blocks: [
          {
            type: "text",
            content:
              "Install the AnyCap agent CLI when you want one binary, one auth flow, and one interface for agent capabilities.",
          },
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
            type: "text",
            content:
              "After installing the skill and CLI, log in once and call AnyCap from your agent workflow or terminal.",
          },
          {
            type: "code",
            content: [
              "# Login",
              "anycap login",
              "",
              "# Image read",
              "anycap image read --url https://example.com/photo.jpg",
              "",
              "# Video analysis",
              "anycap video read --url https://example.com/clip.mp4",
            ].join("\n"),
          },
        ],
      },
      {
        title: "Capabilities Available Today",
        blocks: [
          {
            type: "table",
            headers: ["Capability", "Command", "Description"],
            rows: [
              [
                "Image Read",
                "`anycap image read`",
                "Analyze images using vision models",
              ],
              ["Video Analysis", "`anycap video read`", "Analyze videos"],
            ],
          },
          {
            type: "text",
            content:
              "Today, the public landing page documents image read and video analysis. Broader multimodal and web capabilities are part of the product direction, but should be treated separately from what is already documented here.",
          },
        ],
      },
      {
        title: "Why Agents Use AnyCap",
        blocks: [
          {
            type: "text",
            content:
              "AnyCap is purpose-built for agents. Instead of stitching together separate SDKs, dashboards, and custom integrations for every environment, teams can give agents one install path and one interface.",
          },
          {
            type: "text",
            content:
              "This makes AnyCap useful both as an agent CLI for immediate adoption and as a capability runtime for teams building agent-native products.",
          },
        ],
      },
      {
        title: "Keeping Skills Up to Date",
        blocks: [
          {
            type: "text",
            content: "Check if your installed skills are outdated:",
          },
          {
            type: "code",
            content: "npx -y skills check",
          },
          { type: "text", content: "Update all installed skills:" },
          { type: "code", content: "npx -y skills update" },
          {
            type: "text",
            content: "Or re-install directly:",
          },
          { type: "code", content: "npx -y skills add anycap-ai/anycap -y" },
        ],
      },
      {
        title: "Links",
        blocks: [
          {
            type: "links",
            items: [
              {
                label: "Home",
                url: `${siteConfig.url}${localizedHomePath}`,
                note: "Localized agent homepage",
              },
              {
                label: "CLI Overview",
                url: `${siteConfig.url}${localizedCliPath}`,
                note: "AnyCap CLI features and install",
              },
              {
                label: "Capabilities",
                url: `${siteConfig.url}${localizedCapabilitiesPath}`,
                note: "All available agent capabilities",
              },
              {
                label: "For Claude Code",
                url: `${siteConfig.url}${localizedForClaudeCodePath}`,
                note: "Install AnyCap on Claude Code",
              },
              {
                label: "Install Guide",
                url: `${siteConfig.url}${localizedInstallGuidePath}`,
                note: "Full setup walkthrough",
              },
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
  },
};

export const content = landingContents[defaultLocale];

export function getLandingContent(locale: SiteLocale = defaultLocale): LandingContent {
  return landingContents[locale] ?? content;
}

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
    `Human-readable version: ${siteConfig.url}${localizedForHumanPath}`,
    "",
    "LLM guidance: https://anycap.ai/llms.txt",
    "",
    "MIT License",
    ""
  );

  return lines.join("\n");
}
