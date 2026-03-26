export const siteConfig = {
  name: "AnyCap",
  siteName: "AnyCap",
  url: "https://anycap.ai",
  locale: "en_US",
  defaultTitle: "AnyCap | Every capability your agent needs. One command.",
  defaultDescription:
    "AnyCap gives AI agents the capabilities they're missing — image, video, music, speech, search — through a single CLI and a single credential. Built for agents, not adapted from human tools.",
  humanTitle: "Built for agents",
  humanDescription:
    "Agents can think, but they can't act. AnyCap gives them every capability through one command — no SDKs, no dashboards, no friction.",
} as const;

export const publicSiteRoutes = ["/", "/for-human"] as const;

export const blockedSiteRoutes = [
  "/dashboard",
  "/billing",
  "/usage",
  "/logs",
] as const;
