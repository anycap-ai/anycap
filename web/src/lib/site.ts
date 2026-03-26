export const siteConfig = {
  name: "AnyCap",
  siteName: "AnyCap",
  url: "https://anycap.ai",
  locale: "en_US",
  defaultTitle: "AnyCap | Agent CLI and capability runtime for AI agents",
  defaultDescription:
    "AnyCap is an agent-native capability runtime and agent CLI for AI agents. Install capabilities across tools like Claude Code, Cursor, Codex, OpenCode, and OpenClaw through one interface.",
  humanTitle: "Built for agents",
  humanDescription:
    "AnyCap is the agent-native capability runtime for teams building with AI agents. Give agents one interface for multimodal and web capabilities.",
} as const;

export const publicSiteRoutes = ["/", "/for-human"] as const;

export const blockedSiteRoutes = [
  "/dashboard",
  "/billing",
  "/usage",
  "/logs",
] as const;
