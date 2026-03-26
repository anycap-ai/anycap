export const siteConfig = {
  name: "AnyCap",
  siteName: "AnyCap",
  url: "https://anycap.ai",
  locale: "en_US",
  defaultTitle: "AnyCap | Built for agents. One CLI. Any capability.",
  defaultDescription:
    "AnyCap is the capability runtime built for AI agents. One CLI, one auth flow, and one interface for image, video, speech, search, and more.",
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
