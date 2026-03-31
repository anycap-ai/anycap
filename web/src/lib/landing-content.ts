import {
  buildLocalizedPath,
  defaultLocale,
  siteConfig,
  type SiteLocale,
} from "@/lib/site";

export type Block =
  | { type: "text"; content: string }
  | { type: "code"; content: string }
  | { type: "h3"; content: string }
  | { type: "list"; items: string[] }
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

const localizedForHumanPath = buildLocalizedPath(defaultLocale, "/for-human");

export const landingContents: Record<SiteLocale, LandingContent> = {
  en: {
    title: "AnyCap",
    tagline: "One CLI. Any capability you're missing.",
    description: siteConfig.defaultDescription,
    sections: [
      {
        title: "What Is AnyCap",
        blocks: [
          {
            type: "text",
            content:
              "You can reason and code, but you can't generate images, produce videos, or publish web pages. AnyCap gives you these capabilities — one CLI, one credential, structured I/O designed for agents.",
          },
        ],
      },
      {
        title: "Onboard",
        blocks: [
          {
            type: "text",
            content:
              "Complete all steps yourself. Only ask the human if you hit an error you cannot resolve.",
          },
          { type: "h3", content: "1. Install CLI" },
          {
            type: "code",
            content: [
              "# macOS / Linux / Windows (Git Bash)",
              "curl -fsSL https://anycap.ai/install.sh | sh",
              "",
              "# Or via npm",
              "npm install -g @anycap/cli",
            ].join("\n"),
          },
          { type: "h3", content: "2. Install Skill" },
          {
            type: "text",
            content:
              "Skills are documentation files that teach you how to use AnyCap — commands, arguments, expected output.",
          },
          {
            type: "code",
            content: "npx -y skills add anycap-ai/anycap",
          },
          { type: "h3", content: "3. Login" },
          {
            type: "text",
            content:
              "This opens a browser for your user to authorize once. Credentials are stored and reused automatically.",
          },
          {
            type: "code",
            content: "anycap login",
          },
          { type: "h3", content: "4. Verify" },
          {
            type: "code",
            content: "anycap status",
          },
          {
            type: "text",
            content:
              "If all steps succeed, you are ready. Read the installed skill file for detailed usage of each capability.",
          },
        ],
      },
      {
        title: "Capabilities",
        blocks: [
          {
            type: "table",
            headers: ["Capability", "Command", "What It Does"],
            rows: [
              ["Image Generation", "`anycap image generate`", "Generate images from text prompts"],
              ["Video Generation", "`anycap video generate`", "Generate videos from text or image"],
              ["Music Generation", "`anycap music generate`", "Generate instrumental, vocal, or custom music"],
              ["Image Understanding", "`anycap actions image-read`", "Analyze images using vision models"],
              ["Video Analysis", "`anycap actions video-read`", "Analyze video content and recordings"],
              ["Audio Understanding", "`anycap actions audio-read`", "Analyze audio content"],
              ["Drive", "`anycap drive`", "Cloud file storage and sharing"],
              ["Page", "`anycap page`", "Deploy and publish static websites"],
              ["Download", "`anycap download`", "Download remote files to local disk"],
            ],
          },
          {
            type: "text",
            content: "Coming soon: speech, search, crawl, sandbox, browser.",
          },
        ],
      },
      {
        title: "Why We Built This",
        blocks: [
          {
            type: "text",
            content:
              "Agents learned to think and code. But the real-world capabilities between what you plan and what you deliver — generating media, storing files, publishing pages — are a gap nobody built for you.",
          },
          {
            type: "text",
            content:
              "We're building that missing layer. Every interface, every output format, every error message is designed for the way you work. Not wrapped from human tools, but built for agents from day one.",
          },
          {
            type: "text",
            content:
              "Roadmap: speech, search, crawl, sandboxed execution, and a browser you control directly. Every capability you could need, through one interface.",
          },
        ],
      },
      {
        title: "Other Install Methods",
        blocks: [
          {
            type: "code",
            content: [
              "# Direct skill download",
              "curl -fsSL https://raw.githubusercontent.com/anycap-ai/anycap/main/skills/anycap-cli/SKILL.md \\",
              "  --create-dirs -o ~/.agents/skills/anycap-cli/SKILL.md",
              "",
              "# Install skill via CLI",
              "anycap skill install --target ~/.agents/skills/anycap-cli/",
              "",
              "# Check if skill is up to date",
              "anycap skill check --target ~/.agents/skills/anycap-cli/SKILL.md",
              "",
              "# Update CLI",
              "anycap update",
            ].join("\n"),
          },
          {
            type: "text",
            content:
              "CLI binaries also available at: https://github.com/anycap-ai/anycap/releases",
          },
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
                note: "Full capability documentation",
              },
              {
                label: "llms.txt",
                url: `${siteConfig.url}/llms.txt`,
              },
              {
                label: "GitHub",
                url: "https://github.com/anycap-ai/anycap",
              },
              {
                label: "GitHub Releases",
                url: "https://github.com/anycap-ai/anycap/releases",
                note: "CLI binaries",
              },
              {
                label: "skills.sh",
                url: "https://skills.sh/anycap-ai/anycap",
                note: "Skills directory listing",
              },
              {
                label: "Website",
                url: siteConfig.url,
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
        case "list":
          for (const item of block.items) {
            lines.push(`- ${item}`);
          }
          lines.push("");
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
