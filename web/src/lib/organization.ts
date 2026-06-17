import { discordInviteUrl } from "@/lib/contact";
import { siteConfig } from "@/lib/site";

export const organizationId = `${siteConfig.url}#organization`;

export const organizationSameAs = [
  "https://github.com/anycap-ai",
  "https://github.com/anycap-ai/anycap",
  "https://github.com/anycap-ai/anycap/releases",
  "https://skills.sh/anycap-ai/anycap",
  discordInviteUrl,
] as const;
