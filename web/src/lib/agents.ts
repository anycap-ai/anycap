export const AGENT_ICON_CDN = "https://unpkg.com/@lobehub/icons-static-svg@latest/icons";

export interface Agent {
  name: string;
  icon: string | null; // SVG filename on CDN
  slug: string | null; // skills CLI agent slug for -a flag
}

export const agents: Agent[] = [
  { name: "OpenClaw", icon: "openclaw-color.svg", slug: "openclaw" },
  { name: "Codex", icon: "codex-color.svg", slug: "codex" },
  { name: "Claude Code", icon: "claudecode-color.svg", slug: "claude-code" },
  { name: "Cursor", icon: "cursor.svg", slug: "cursor" },
  { name: "Manus", icon: "manus.svg", slug: "manus" },
  { name: "Antigravity", icon: "antigravity-color.svg", slug: "antigravity" },
  { name: "OpenCode", icon: "opencode.svg", slug: "opencode" },
  { name: "Replit", icon: "replit-color.svg", slug: "replit" },
  { name: "Other Agent", icon: null, slug: null },
];

export function getInstallPrompt(agent: Agent): string {
  const skillCommand = agent.slug
    ? `npx -y skills add anycap-ai/anycap -a ${agent.slug} -y`
    : "npx -y skills add anycap-ai/anycap -y";

  return `Install AnyCap using the machine-readable install guide at https://anycap.ai/install.txt.
Do not fetch the homepage for installation.
Run:
1. curl -fsSL https://anycap.ai/install.sh | sh
2. ${skillCommand}
3. anycap login
4. anycap status
Then continue with the task.`;
}
